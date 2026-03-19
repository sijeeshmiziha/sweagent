/**
 * Google (Gemini) model adapter using the official @google/genai package.
 * Implements Model (invoke, generateVision, invokeObject) without the Vercel AI SDK.
 */

import { GoogleGenAI } from '@google/genai';
import type { z } from 'zod';
import type { ModelMessage } from '../../types/ai-types';
import type {
  Model,
  ModelResponse,
  InvokeOptions,
  InvokeObjectOptions,
  InvokeObjectResult,
  VisionOptions,
  ModelToolCall,
  ModelTool,
} from '../../types/model';
import type { ImageInput } from '../../types/common';
import type { LanguageModelUsage, FinishReason } from '../../types/ai-types';
import { ModelError } from '../../utils/errors';
import { zodToJsonSchema } from '../../tools/tools';

interface Content {
  role: 'user' | 'model';
  parts: Record<string, unknown>[];
}

function messageToGeminiParts(m: ModelMessage): Content | { system?: string } | null {
  if (m.role === 'system') return { system: m.content };
  if (m.role === 'user') {
    const content = m.content;
    const parts: Record<string, unknown>[] = [];
    if (typeof content === 'string') {
      parts.push({ text: content });
    } else {
      for (const p of content) {
        if (p.type === 'text') parts.push({ text: p.text });
        if (p.type === 'image')
          parts.push({
            inlineData: {
              mimeType: p.mimeType ?? 'image/png',
              data: p.image.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        if (p.type === 'tool-result')
          parts.push({
            functionResponse: {
              name: p.toolName,
              response: p.output.type === 'text' ? p.output.value : p.output.value,
            },
          });
      }
    }
    if (parts.length) return { role: 'user', parts };
    return null;
  }
  if (m.role === 'assistant') {
    const content = m.content;
    const parts: Record<string, unknown>[] = [];
    if (typeof content === 'string') {
      parts.push({ text: content });
    } else {
      for (const p of content) {
        if (p.type === 'text') parts.push({ text: p.text });
        if (p.type === 'tool-call')
          parts.push({
            functionCall: {
              name: p.toolName,
              args: (p.input as Record<string, unknown>) ?? {},
            },
          });
      }
    }
    if (parts.length) return { role: 'model', parts };
    return null;
  }
  if (m.role === 'tool') {
    const parts: Record<string, unknown>[] = [];
    for (const p of m.content) {
      if (p.type === 'tool-result')
        parts.push({
          functionResponse: {
            name: p.toolName,
            response: p.output.type === 'text' ? p.output.value : p.output.value,
          },
        });
    }
    if (parts.length) return { role: 'user', parts };
    return null;
  }
  return null;
}

function buildGeminiContents(messages: ModelMessage[]): {
  systemInstruction?: string;
  contents: Content[];
} {
  let systemInstruction: string | undefined;
  const contents: Content[] = [];
  for (const m of messages) {
    const converted = messageToGeminiParts(m);
    if (!converted) continue;
    if ('system' in converted && converted.system !== undefined) {
      systemInstruction = systemInstruction
        ? `${systemInstruction}\n\n${converted.system}`
        : converted.system;
    } else if ('role' in converted && 'parts' in converted) {
      contents.push(converted);
    }
  }
  return { systemInstruction, contents };
}

function toolsToGemini(
  tools: Record<string, ModelTool>
): { functionDeclarations: Record<string, unknown>[] }[] {
  const declarations = Object.entries(tools).map(([name, t]) => {
    const params =
      t.parameters ??
      (t.inputSchema ? zodToJsonSchema(t.inputSchema) : { type: 'object', properties: {} });
    return {
      name,
      description: t.description,
      parameters: params,
    };
  });
  return [{ functionDeclarations: declarations }];
}

function finishReasonFromGemini(r: string | null | undefined): FinishReason {
  if (r === 'STOP' || r === 'MAX_TOKENS' || r === 'SAFETY' || r === 'RECITATION' || r === 'OTHER') {
    return r === 'MAX_TOKENS'
      ? 'length'
      : r === 'STOP'
        ? 'stop'
        : r === 'SAFETY'
          ? 'content-filter'
          : 'stop';
  }
  return r ?? 'stop';
}

export function createGoogleModel(config: { model: string; apiKey?: string }): Model {
  const { model: modelName, apiKey } = config;
  const client = new GoogleGenAI({
    apiKey: apiKey ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_API_KEY,
  });

  return {
    provider: 'google',
    modelName,

    async invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse> {
      try {
        const { systemInstruction, contents } = buildGeminiContents(messages);
        const tools = options?.tools ? toolsToGemini(options.tools) : undefined;
        const response = await client.models.generateContent({
          model: modelName,
          contents: contents.length ? contents : [{ role: 'user', parts: [{ text: '' }] }],
          config: {
            systemInstruction,
            maxOutputTokens: options?.maxOutputTokens,
            temperature: options?.temperature,
            stopSequences: options?.stop,
            tools,
          },
        });

        const text = response.text ?? '';
        const functionCalls =
          (response.functionCalls as { name?: string; args?: unknown }[] | undefined) ?? [];
        const toolCalls: ModelToolCall[] = functionCalls.map((fc, i) => ({
          toolCallId: `call_${i}_${fc.name ?? ''}`,
          toolName: fc.name ?? '',
          input: fc.args ?? {},
        }));

        const usage = response.usageMetadata as
          | { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
          | undefined;
        const usageResult: LanguageModelUsage = {
          inputTokens: usage?.promptTokenCount ?? 0,
          outputTokens: usage?.candidatesTokenCount ?? usage?.totalTokenCount ?? 0,
          totalTokens: usage?.totalTokenCount ?? 0,
        };

        return {
          text,
          toolCalls,
          usage: usageResult,
          finishReason: finishReasonFromGemini(
            (response as { finishReason?: string }).finishReason
          ),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError('Failed to invoke Google model', 'google', err);
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      const parts: Record<string, unknown>[] = images.map(img => ({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      }));
      parts.push({ text: prompt });
      const messages: ModelMessage[] = [];
      if (options?.systemPrompt) messages.push({ role: 'system', content: options.systemPrompt });
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...images.map(img => ({
            type: 'image' as const,
            image: img.base64,
            mimeType: img.mimeType,
          })),
        ],
      });
      return this.invoke(messages, {
        maxOutputTokens: options?.maxOutputTokens,
        temperature: options?.temperature,
      });
    },

    async invokeObject<T>(
      messages: ModelMessage[],
      schema: unknown,
      options?: InvokeObjectOptions
    ): Promise<InvokeObjectResult<T>> {
      try {
        const zodSchema = schema as z.ZodType<T>;
        const { systemInstruction, contents } = buildGeminiContents(messages);
        const system = systemInstruction
          ? `${systemInstruction}\n\nRespond with a single valid JSON object only. No markdown, no explanation, no code block.`
          : 'Respond with a single valid JSON object only. No markdown, no explanation, no code block.';
        const response = await client.models.generateContent({
          model: modelName,
          contents: contents.length ? contents : [{ role: 'user', parts: [{ text: '' }] }],
          config: {
            systemInstruction: system,
            maxOutputTokens: options?.maxOutputTokens,
            temperature: options?.temperature ?? 0,
          },
        });

        const raw = response.text ?? '';
        const trimmed = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed: unknown = JSON.parse(trimmed);
        const data = zodSchema.parse(parsed);
        const usage = response.usageMetadata as
          | { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number }
          | undefined;
        return {
          data,
          usage: {
            inputTokens: usage?.promptTokenCount ?? 0,
            outputTokens: usage?.candidatesTokenCount ?? 0,
            totalTokens: usage?.totalTokenCount ?? 0,
          },
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError('Failed to invokeObject Google model', 'google', err);
      }
    },
  };
}

/**
 * OpenAI model adapter using the official openai npm package.
 * Implements Model (invoke, generateVision, invokeObject) without the Vercel AI SDK.
 */

import OpenAI from 'openai';
import type { z } from 'zod';
import type { ModelMessage, ContentPart } from '../../types/ai-types';
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

type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam;
type ToolChoice = OpenAI.Chat.ChatCompletionToolChoiceOption;

function messageToOpenAI(m: ModelMessage): ChatMessage {
  if (m.role === 'system') {
    return { role: 'system', content: m.content };
  }
  if (m.role === 'user') {
    const content = m.content;
    if (typeof content === 'string') return { role: 'user', content };
    const parts: OpenAI.Chat.ChatCompletionContentPart[] = [];
    for (const p of content) {
      if (p.type === 'text') parts.push({ type: 'text', text: p.text });
      if (p.type === 'image')
        parts.push({
          type: 'image_url',
          image_url: {
            url: p.image.startsWith('data:')
              ? p.image
              : `data:${p.mimeType ?? 'image/png'};base64,${p.image}`,
          },
        });
    }
    return { role: 'user', content: parts };
  }
  if (m.role === 'assistant') {
    const content = m.content;
    if (typeof content === 'string') return { role: 'assistant', content };
    const textParts: string[] = [];
    const toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];
    for (const p of content) {
      if (p.type === 'text') textParts.push(p.text);
      if (p.type === 'tool-call')
        toolCalls.push({
          id: p.toolCallId,
          type: 'function',
          function: { name: p.toolName, arguments: JSON.stringify(p.input ?? {}) },
        });
    }
    if (toolCalls.length > 0)
      return { role: 'assistant', content: textParts.join('') || null, tool_calls: toolCalls };
    return { role: 'assistant', content: textParts.join('') || '' };
  }
  if (m.role === 'tool') {
    const first = m.content[0];
    if (first && 'type' in first && first.type === 'tool-result')
      return {
        role: 'tool',
        tool_call_id: first.toolCallId,
        content: first.output.type === 'text' ? first.output.value : first.output.value,
      };
  }
  return { role: 'user', content: '' };
}

function toolsToOpenAI(tools: Record<string, ModelTool>): OpenAI.Chat.ChatCompletionTool[] {
  return Object.entries(tools).map(([name, t]) => {
    const params =
      t.parameters ??
      (t.inputSchema ? zodToJsonSchema(t.inputSchema) : { type: 'object', properties: {} });
    return {
      type: 'function',
      function: {
        name,
        description: t.description,
        parameters: params,
      },
    };
  });
}

function usageFromOpenAI(u: OpenAI.CompletionUsage | undefined): LanguageModelUsage {
  if (!u) return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  return {
    inputTokens: u.prompt_tokens,
    outputTokens: u.completion_tokens,
    totalTokens: u.total_tokens ?? u.prompt_tokens + u.completion_tokens,
  };
}

function finishReasonFromOpenAI(r: string | null | undefined): FinishReason {
  if (r === 'stop' || r === 'length' || r === 'tool_calls' || r === 'content_filter')
    return r === 'tool_calls' ? 'tool-calls' : r;
  return r ?? 'stop';
}

export function createOpenAIModel(config: {
  model: string;
  apiKey?: string;
  baseUrl?: string;
}): Model {
  const { model: modelName, apiKey, baseUrl } = config;
  const client = new OpenAI({
    apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    baseURL: baseUrl,
  });

  return {
    provider: 'openai',
    modelName,

    async invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse> {
      try {
        const openaiMessages: ChatMessage[] = messages.map(messageToOpenAI);
        const tools = options?.tools ? toolsToOpenAI(options.tools) : undefined;
        const completion = await client.chat.completions.create({
          model: modelName,
          messages: openaiMessages,
          tools: tools?.length ? tools : undefined,
          tool_choice: tools?.length ? ('auto' as ToolChoice) : undefined,
          max_tokens: options?.maxOutputTokens,
          temperature: options?.temperature,
          stop: options?.stop?.length ? options.stop : undefined,
        });

        const choice = completion.choices?.[0];
        const msg = choice?.message;
        const text = typeof msg?.content === 'string' ? msg.content : '';
        const rawToolCalls = msg?.tool_calls ?? [];
        const toolCalls: ModelToolCall[] = rawToolCalls.map(
          (tc: { id: string; function?: { name?: string; arguments?: string } }) => {
            let input: unknown = {};
            try {
              input = JSON.parse(tc.function?.arguments ?? '{}');
            } catch {
              // leave input as {}
            }
            return {
              toolCallId: tc.id,
              toolName: tc.function?.name ?? '',
              input,
            };
          }
        );

        return {
          text,
          toolCalls,
          usage: usageFromOpenAI(completion.usage),
          finishReason: finishReasonFromOpenAI(choice?.finish_reason),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError('Failed to invoke OpenAI model', 'openai', err);
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      const content: ContentPart[] = images.map(img => ({
        type: 'image',
        image: `data:${img.mimeType};base64,${img.base64}`,
        mimeType: img.mimeType,
      }));
      content.push({ type: 'text', text: prompt });
      const messages: ModelMessage[] = [];
      if (options?.systemPrompt) messages.push({ role: 'system', content: options.systemPrompt });
      messages.push({ role: 'user', content });
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
        const openaiMessages = messages.map(messageToOpenAI);
        const completion = await client.chat.completions.create({
          model: modelName,
          messages: [
            ...openaiMessages,
            {
              role: 'system' as const,
              content:
                'Respond with a single valid JSON object only. No markdown, no explanation, no code block.',
            },
          ],
          max_tokens: options?.maxOutputTokens,
          temperature: options?.temperature ?? 0,
        });

        const raw = completion.choices?.[0]?.message?.content;
        if (typeof raw !== 'string') throw new Error('No content in response');
        const trimmed = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed: unknown = JSON.parse(trimmed);
        const data = zodSchema.parse(parsed);
        return {
          data,
          usage: usageFromOpenAI(completion.usage),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError('Failed to invokeObject OpenAI model', 'openai', err);
      }
    },
  };
}

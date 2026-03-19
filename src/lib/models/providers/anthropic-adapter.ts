/**
 * Anthropic model adapter using the official @anthropic-ai/sdk package.
 * Implements Model (invoke, generateVision, invokeObject) without the Vercel AI SDK.
 */

import Anthropic from '@anthropic-ai/sdk';
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

type AnthropicMessageParam = Anthropic.MessageParam;
type AnthropicContentBlock =
  | Anthropic.TextBlockParam
  | Anthropic.ImageBlockParam
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string };

function messageToAnthropic(m: ModelMessage): AnthropicMessageParam | { system: string } | null {
  if (m.role === 'system') return { system: m.content };
  if (m.role === 'user') {
    const content = m.content;
    const blocks: AnthropicContentBlock[] = [];
    if (typeof content === 'string') {
      blocks.push({ type: 'text', text: content });
    } else {
      for (const p of content) {
        if (p.type === 'text') blocks.push({ type: 'text', text: p.text });
        if (p.type === 'image')
          blocks.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: (p.mimeType ?? 'image/png') as
                | 'image/png'
                | 'image/jpeg'
                | 'image/gif'
                | 'image/webp',
              data: p.image.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        if (p.type === 'tool-result')
          blocks.push({
            type: 'tool_result',
            tool_use_id: p.toolCallId,
            content: p.output.type === 'text' ? p.output.value : p.output.value,
          });
      }
    }
    if (blocks.length) return { role: 'user', content: blocks };
    return null;
  }
  if (m.role === 'assistant') {
    const content = m.content;
    const blocks: AnthropicContentBlock[] = [];
    if (typeof content === 'string') {
      blocks.push({ type: 'text', text: content });
    } else {
      for (const p of content) {
        if (p.type === 'text') blocks.push({ type: 'text', text: p.text });
        if (p.type === 'tool-call')
          blocks.push({
            type: 'tool_use',
            id: p.toolCallId,
            name: p.toolName,
            input: (p.input as Record<string, unknown>) ?? {},
          });
      }
    }
    if (blocks.length) return { role: 'assistant', content: blocks };
    return null;
  }
  if (m.role === 'tool') {
    const blocks: AnthropicContentBlock[] = [];
    for (const p of m.content) {
      if (p.type === 'tool-result')
        blocks.push({
          type: 'tool_result',
          tool_use_id: p.toolCallId,
          content: p.output.type === 'text' ? p.output.value : p.output.value,
        });
    }
    if (blocks.length) return { role: 'user', content: blocks };
    return null;
  }
  return null;
}

function buildAnthropicMessages(messages: ModelMessage[]): {
  system?: string;
  messages: AnthropicMessageParam[];
} {
  let system: string | undefined;
  const out: AnthropicMessageParam[] = [];
  for (const m of messages) {
    const converted = messageToAnthropic(m);
    if (!converted) continue;
    if ('system' in converted) {
      system = system ? `${system}\n\n${converted.system}` : converted.system;
    } else {
      out.push(converted);
    }
  }
  return { system, messages: out };
}

function toolsToAnthropic(tools: Record<string, ModelTool>): Anthropic.Tool[] {
  return Object.entries(tools).map(([name, t]) => {
    const params =
      t.parameters ??
      (t.inputSchema ? zodToJsonSchema(t.inputSchema) : { type: 'object', properties: {} });
    return {
      name,
      description: t.description,
      input_schema: { type: 'object' as const, properties: params.properties ?? {}, ...params },
    };
  });
}

function usageFromAnthropic(inputTokens: number, outputTokens: number): LanguageModelUsage {
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

function finishReasonFromAnthropic(r: string | null | undefined): FinishReason {
  if (
    r === 'end_turn' ||
    r === 'max_tokens' ||
    r === 'tool_use' ||
    r === 'stop_sequence' ||
    r === 'content_block_stop'
  ) {
    return r === 'tool_use' ? 'tool-calls' : r === 'max_tokens' ? 'length' : 'stop';
  }
  return r ?? 'stop';
}

export function createAnthropicModel(config: { model: string; apiKey?: string }): Model {
  const { model: modelName, apiKey } = config;
  const client = new Anthropic({
    apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
  });

  return {
    provider: 'anthropic',
    modelName,

    async invoke(messages: ModelMessage[], options?: InvokeOptions): Promise<ModelResponse> {
      try {
        const { system, messages: anthropicMessages } = buildAnthropicMessages(messages);
        const tools = options?.tools ? toolsToAnthropic(options.tools) : undefined;
        const response = await client.messages.create({
          model: modelName,
          max_tokens: options?.maxOutputTokens ?? 4096,
          system,
          messages: anthropicMessages,
          tools: tools?.length ? tools : undefined,
          temperature: options?.temperature,
          stop_sequences: options?.stop?.length ? options.stop : undefined,
        });

        const textBlock = response.content?.find(
          (b): b is { type: 'text'; text: string } => b.type === 'text'
        );
        const text = textBlock?.text ?? '';
        const toolCalls: ModelToolCall[] = (response.content ?? [])
          .filter(
            (b): b is { type: 'tool_use'; id: string; name: string; input: unknown } =>
              b.type === 'tool_use'
          )
          .map(b => ({
            toolCallId: b.id,
            toolName: b.name,
            input: b.input ?? {},
          }));

        return {
          text,
          toolCalls,
          usage: usageFromAnthropic(response.usage.input_tokens, response.usage.output_tokens),
          finishReason: finishReasonFromAnthropic(response.stop_reason),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError('Failed to invoke Anthropic model', 'anthropic', err);
      }
    },

    async generateVision(
      prompt: string,
      images: ImageInput[],
      options?: VisionOptions
    ): Promise<ModelResponse> {
      const content: ContentPart[] = images.map(img => ({
        type: 'image',
        image: img.base64,
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
        const { system, messages: anthropicMessages } = buildAnthropicMessages(messages);
        const response = await client.messages.create({
          model: modelName,
          max_tokens: options?.maxOutputTokens ?? 4096,
          system: system
            ? `${system}\n\nRespond with a single valid JSON object only. No markdown, no explanation, no code block.`
            : 'Respond with a single valid JSON object only. No markdown, no explanation, no code block.',
          messages: anthropicMessages,
          temperature: options?.temperature ?? 0,
        });

        const textBlock = response.content?.find(
          (b): b is { type: 'text'; text: string } => b.type === 'text'
        );
        const raw = textBlock?.text ?? '';
        const trimmed = raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed: unknown = JSON.parse(trimmed);
        const data = zodSchema.parse(parsed);
        return {
          data,
          usage: usageFromAnthropic(response.usage.input_tokens, response.usage.output_tokens),
        };
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new ModelError('Failed to invokeObject Anthropic model', 'anthropic', err);
      }
    },
  };
}

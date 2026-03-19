/**
 * Provider-agnostic types for messages, tools, and usage.
 * Replaces imports from the Vercel AI SDK.
 */

import type { z } from 'zod';

/** Token usage details (optional per-provider) */
export interface TokenUsageDetails {
  noCacheTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  textTokens?: number;
  reasoningTokens?: number;
}

/** Token usage returned by model invocations */
export interface LanguageModelUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  inputTokenDetails?: TokenUsageDetails;
  outputTokenDetails?: TokenUsageDetails;
}

/** Why the model stopped generating */
export type FinishReason =
  | 'stop'
  | 'length'
  | 'tool-calls'
  | 'content-filter'
  | 'error'
  | 'other'
  | string;

/** Content part for multimodal messages */
export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string; mimeType?: string }
  | { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown }
  | {
      type: 'tool-result';
      toolCallId: string;
      toolName: string;
      output: { type: 'text'; value: string } | { type: 'error-text'; value: string };
    };

/** Single message in a conversation */
export type ModelMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string | ContentPart[] }
  | { role: 'assistant'; content: string | ContentPart[] }
  | { role: 'tool'; content: ContentPart[] };

/** Options passed to tool execute function */
export interface ToolExecutionOptions {
  toolCallId?: string;
  messages?: ModelMessage[];
  abortSignal?: AbortSignal;
}

/** JSON Schema object for tool parameters */
export type JsonSchemaObject = Record<string, unknown>;

/** Tool definition: description, schema, optional execute */
export interface Tool<TInput = unknown, TOutput = unknown> {
  description: string;
  /** Zod schema or JSON schema for input; adapters convert to provider format */
  parameters?: JsonSchemaObject;
  inputSchema?: z.ZodType<TInput>;
  execute?: (args: TInput, options?: ToolExecutionOptions) => Promise<TOutput>;
}

/** Create a tool from config (used by defineTool); inputSchema is Zod */
export interface ToolConfigInput {
  description: string;
  inputSchema: z.ZodType;
  execute?: (args: unknown, options?: ToolExecutionOptions) => Promise<unknown>;
}

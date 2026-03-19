/**
 * Tool-related types and helpers
 * Exports Tool, tool(), jsonSchema, ToolExecutionOptions; keeps ToolConfig and ToolContext for defineTool
 */

import { z } from 'zod';
import type { Tool as ToolType, ToolConfigInput } from './ai-types';

export type { Tool, ToolExecutionOptions } from './ai-types';

function toJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const result = z.toJSONSchema(schema) as Record<string, unknown> & {
    $schema?: string;
    definitions?: unknown;
  };
  const { $schema: _s, definitions: _d, ...rest } = result;
  return rest as Record<string, unknown>;
}

/**
 * Create a tool from description, inputSchema (Zod), and optional execute.
 * Used by defineTool; adapters use description + parameters (JSON Schema) for provider APIs.
 */
export function tool<TInput = unknown, TOutput = unknown>(
  config: ToolConfigInput & { inputSchema: z.ZodType<TInput> }
): ToolType<TInput, TOutput> {
  const { description, inputSchema, execute } = config;
  const parameters = toJsonSchema(inputSchema);
  return {
    description,
    inputSchema,
    parameters,
    execute: execute as ToolType<TInput, TOutput>['execute'],
  };
}

/**
 * Wrap a Zod schema for structured output (e.g. invokeObject).
 * Returns an object adapters can use to request JSON matching the schema.
 */
export function jsonSchema<T>(schema: z.ZodType<T>): {
  schema: z.ZodType<T>;
  jsonSchema: Record<string, unknown>;
} {
  return {
    schema,
    jsonSchema: toJsonSchema(schema),
  };
}

/**
 * Configuration for defining a tool (input to defineTool)
 */
export interface ToolConfig<TInput extends z.ZodType = z.ZodType, TOutput = unknown> {
  /** Unique name for the tool */
  name: string;
  /** Description of what the tool does */
  description: string;
  /** Zod schema for input validation */
  input: TInput;
  /** The handler function that executes the tool */
  handler: (input: z.infer<TInput>, context?: ToolContext) => Promise<TOutput>;
}

/**
 * Logger interface for tool context
 */
export interface ToolLogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | Record<string, unknown>): void;
}

/**
 * Context passed to tool handlers
 */
export interface ToolContext {
  /** Optional model for tools that need AI capabilities */
  model?: { invoke: (...args: unknown[]) => Promise<unknown> };
  /** Optional logger */
  logger?: ToolLogger;
  /** Additional custom context */
  [key: string]: unknown;
}

/**
 * Result of tool execution (for executeTool / executeToolByName)
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  output?: T;
  error?: string;
}

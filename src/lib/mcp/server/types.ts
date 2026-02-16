/**
 * MCP server types - shared Zod schema for agent tool inputs.
 */

import { z } from 'zod';

import type { AgentResult } from '../../types/agent';
import type { ModelConfig } from '../../types/model';

/** Raw Zod shape for McpServer.registerTool inputSchema. */
export const AGENT_TOOL_INPUT_SHAPE = {
  input: z.string().describe('Natural language description of what to build or design'),
  provider: z
    .enum(['openai', 'anthropic', 'google'])
    .optional()
    .describe('LLM provider (defaults to openai)'),
  model: z.string().optional().describe('Model name, e.g. gpt-4o-mini, claude-3-5-sonnet-20241022'),
  temperature: z.number().min(0).max(1).optional().describe('Sampling temperature (0-1)'),
} as const;

/** Parsed tool input type. */
export interface AgentToolInput {
  input: string;
  provider?: 'openai' | 'anthropic' | 'google';
  model?: string;
  temperature?: number;
}

/** Build a ModelConfig from the optional overrides in the tool input. */
export function buildModelConfig(input: AgentToolInput): ModelConfig | undefined {
  if (!input.provider && !input.model) return undefined;
  return {
    provider: input.provider ?? 'openai',
    model: input.model ?? 'gpt-4o-mini',
    temperature: input.temperature,
  };
}

/** A registered agent tool entry. */
export interface AgentToolEntry {
  name: string;
  description: string;
  handler: (input: string, model?: ModelConfig) => Promise<AgentResult>;
}

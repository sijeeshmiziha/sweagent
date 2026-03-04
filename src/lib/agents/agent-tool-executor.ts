/**
 * Execute tool calls from a model response and build AI SDK messages.
 * Extracted from agent.ts to keep files under 150 lines.
 */

import type { AgentToolResult } from '../types/agent';
import type { ModelMessage } from '../types/common';
import type { ModelToolCall } from '../types/model';
import type { Logger } from '../types/common';
import type { ToolSet } from '../tools';
import { executeToolByName } from '../tools';

export interface ToolExecutionContext {
  tools: ToolSet;
  toolCalls: ModelToolCall[];
  messages: ModelMessage[];
  logger?: Logger;
  onToolResult?: (toolName: string, output: unknown) => void;
  /** Optional text from the same model response, merged into the assistant message */
  responseText?: string;
}

/**
 * Execute all tool calls, push assistant + tool messages, and return results.
 */
export async function executeToolCalls(ctx: ToolExecutionContext): Promise<AgentToolResult[]> {
  const { tools, toolCalls, messages, logger, onToolResult, responseText } = ctx;

  const assistantContent = [
    ...(responseText ? [{ type: 'text' as const, text: responseText }] : []),
    ...toolCalls.map((tc: ModelToolCall) => ({
      type: 'tool-call' as const,
      toolCallId: tc.toolCallId,
      toolName: tc.toolName,
      input: tc.input,
    })),
  ];
  messages.push({ role: 'assistant', content: assistantContent });

  const results: AgentToolResult[] = [];

  for (const tc of toolCalls) {
    const exec = await executeToolByName(tools, tc.toolName, tc.input, {
      toolCallId: tc.toolCallId,
      logger,
    });

    const result: AgentToolResult = {
      toolCallId: tc.toolCallId,
      toolName: tc.toolName,
      output: exec.success ? exec.output : exec.error,
      isError: !exec.success,
    };
    results.push(result);
    onToolResult?.(tc.toolName, result.output);

    const outputVal = result.isError
      ? { type: 'error-text' as const, value: String(result.output) }
      : {
          type: 'text' as const,
          value: typeof result.output === 'string' ? result.output : JSON.stringify(result.output),
        };

    messages.push({
      role: 'tool',
      content: [
        {
          type: 'tool-result' as const,
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          output: outputVal,
        },
      ],
    });
  }

  return results;
}

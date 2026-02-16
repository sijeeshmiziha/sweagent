/**
 * MCP server - exposes all sweagent agent modules as MCP tools via McpServer.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { AgentStep } from '../../types/agent';
import { TOOL_REGISTRY } from './tool-registry';
import { AGENT_TOOL_INPUT_SHAPE, buildModelConfig } from './types';
import type { AgentToolInput } from './types';

const SERVER_NAME = 'sweagent';
const SERVER_VERSION = '0.0.3';

const log = (msg: string): void => {
  process.stderr.write(`[sweagent] ${msg}\n`);
};

const MAX_PREVIEW = 200;

function createStepLogger(toolName: string): (step: AgentStep) => void {
  return (step: AgentStep) => {
    const prefix = `${toolName} — step ${step.iteration + 1}`;
    if (step.content) {
      const preview =
        step.content.length > MAX_PREVIEW ? step.content.slice(0, MAX_PREVIEW) + '…' : step.content;
      log(`${prefix}: ${preview}`);
    } else {
      const tools = step.toolCalls?.map(tc => tc.toolName).join(', ');
      log(`${prefix}${tools ? ` (tools: ${tools})` : ''}`);
    }
  };
}

/** Create and return a configured McpServer with all agent tools registered. */
export function createSweagentServer(): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );

  for (const entry of TOOL_REGISTRY) {
    server.registerTool(
      entry.name,
      { description: entry.description, inputSchema: AGENT_TOOL_INPUT_SHAPE },
      async (args: AgentToolInput) => {
        log(`${entry.name} — started`);
        try {
          const modelConfig = buildModelConfig(args);
          const onStep = createStepLogger(entry.name);
          const result = await entry.handler(args.input, modelConfig, onStep);
          log(`${entry.name} — completed`);
          return { content: [{ type: 'text' as const, text: result.output }] };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          log(`${entry.name} — error: ${message}`);
          return { content: [{ type: 'text' as const, text: message }], isError: true };
        }
      }
    );
  }

  return server;
}

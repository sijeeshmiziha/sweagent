/**
 * MCP server - exposes all sweagent agent modules as MCP tools via McpServer.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { TOOL_REGISTRY } from './tool-registry';
import { AGENT_TOOL_INPUT_SHAPE, buildModelConfig } from './types';
import type { AgentToolInput } from './types';

const SERVER_NAME = 'sweagent';
const SERVER_VERSION = '0.0.3';

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
        try {
          const modelConfig = buildModelConfig(args);
          const result = await entry.handler(args.input, modelConfig);
          return { content: [{ type: 'text' as const, text: result.output }] };
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return { content: [{ type: 'text' as const, text: message }], isError: true };
        }
      }
    );
  }

  return server;
}

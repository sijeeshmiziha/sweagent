/**
 * MCP infrastructure - client and server for the Model Context Protocol.
 */

export { BaseMcpClient } from './client';
export type {
  McpClientConfig,
  McpClientInfo,
  McpToolContent,
  McpTransport,
  McpResolveOptions,
} from './types';

export { createSweagentServer, TOOL_REGISTRY, findTool } from './server';
export type { AgentToolInput, AgentToolEntry } from './server';

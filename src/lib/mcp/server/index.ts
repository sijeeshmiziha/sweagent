/**
 * MCP server exports - create and run a sweagent MCP server.
 */

export { createSweagentServer } from './server';
export { TOOL_REGISTRY, findTool } from './tool-registry';
export { AGENT_TOOL_INPUT_SHAPE, buildModelConfig } from './types';
export type { AgentToolInput, AgentToolEntry } from './types';

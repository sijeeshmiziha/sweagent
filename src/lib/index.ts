/**
 * sweagent framework - core library exports
 */

// Utils (errors, logger, utils)
export * from './utils';

// Types
export type * from './types';

// Agents
export {
  runAgent,
  runAgentWithSteps,
  runProgrammaticStep,
  generateNResponses,
  selectByLength,
  selectByJudge,
} from './agents';
export type {
  AgentConfig,
  AgentResult,
  AgentStep,
  ProgrammaticAction,
  GenerateNOptions,
  GenerateNResult,
  SelectionResult,
  JudgeOptions,
} from './agents';

// Models
export { createModel } from './models';
export { createOpenAIModel } from './models/providers/openai';
export { createAnthropicModel } from './models/providers/anthropic';
export { createGoogleModel } from './models/providers/google';
export type {
  Model,
  ModelConfig,
  ModelProvider,
  ModelResponse,
  InvokeOptions,
  VisionOptions,
} from './models';

// Tools
export { tool, jsonSchema } from './types/tool';
export {
  defineTool,
  executeTool,
  executeToolByName,
  createToolSet,
  getTools,
  getTool,
  createProposalTools,
} from './tools';
export type { ToolSet, Tool, ToolConfig, ToolContext, ToolExecutionResult } from './tools';

// Subagents
export {
  defineSubagent,
  runSubagent,
  createSubagentTool,
  createSubagentToolSet,
} from './subagents';
export type {
  SubagentConfig,
  SubagentDefinition,
  SubagentResult,
  RunSubagentOptions,
  CreateSubagentToolOptions,
} from './subagents';

// Template Engine
export { compileTemplate, scaffoldProject, registerHelpers } from './template-engine';
export type {
  TemplateContext,
  TemplateModule,
  TemplateField,
  TemplateOperation,
  TemplateAuth,
  TemplateBranding,
  ScaffoldConfig,
  ScaffoldResult,
  ScaffoldError,
} from './template-engine';

// Stores
export { propose, getProposed, listProposed, finalize, discard, clearRun } from './stores';
export type { ProposedEntry } from './stores';

// Context management
export {
  estimateTokens,
  estimateMessagesTokens,
  truncateText,
  truncateToTokens,
  summarizeMessage,
  summarizeMessages,
  pruneContext,
} from './context';
export type { PruneOptions, PruneResult } from './context';

// MCP
export { BaseMcpClient } from './mcp';
export type {
  McpClientConfig,
  McpClientInfo,
  McpToolContent,
  McpTransport,
  McpResolveOptions,
} from './mcp';

export { createSweagentServer, TOOL_REGISTRY, findTool } from './mcp';
export type { AgentToolInput, AgentToolEntry } from './mcp';

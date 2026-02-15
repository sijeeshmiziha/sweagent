/**
 * backend-architect module - routing orchestrator for backend design
 */

export * from './schemas';
export type * from './types';
export * from './prompts';
export { validateBackendTool, createDesignBackendTool, createBackendArchitectTools } from './tools';
export { servicePlannerSubagent, frameworkSelectorSubagent } from './subagents';
export { runBackendArchitectAgent } from './agent';

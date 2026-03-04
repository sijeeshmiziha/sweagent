/**
 * Subagents: define, run, and expose as tools to a parent agent
 */

import { z } from 'zod';
import type { SubagentConfig, SubagentDefinition, SubagentResult } from '../types/subagent';
import type { AgentTool } from '../types/agent';
import type { Model } from '../types/model';
import { runAgent, runAgentWithSteps } from '../agents';
import { createModel } from '../models/create-model';
import { defineTool } from '../tools';
import type { ToolSet } from '../tools';
import { SubagentError, ValidationError } from '../utils/errors';

const NAME_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Validates and creates a subagent definition.
 */
export function defineSubagent(config: SubagentConfig): SubagentDefinition {
  if (!config.name.trim()) {
    throw new SubagentError('Subagent name is required', undefined);
  }
  if (!NAME_REGEX.test(config.name)) {
    throw new SubagentError(`Subagent name must be kebab-case: ${config.name}`, config.name);
  }
  return { ...config };
}

export interface RunSubagentOptions {
  parentTools?: Record<string, AgentTool>;
  parentModel?: Model;
  /** Parent's system prompt; used when inheritParentSystemPrompt is true */
  parentSystemPrompt?: string;
}

function resolveTools(
  definition: SubagentDefinition,
  parentTools?: Record<string, AgentTool>
): Record<string, AgentTool> {
  if (definition.tools != null && Object.keys(definition.tools).length > 0) {
    return definition.tools;
  }
  const base = parentTools ?? {};
  const disallowed = new Set(definition.disallowedTools ?? []);
  const filtered: Record<string, AgentTool> = {};
  for (const [key, t] of Object.entries(base)) {
    if (key.startsWith('subagent_')) continue;
    if (!disallowed.has(key)) filtered[key] = t;
  }
  return filtered;
}

function resolveSystemPrompt(def: SubagentDefinition, parentPrompt?: string): string {
  if (def.inheritParentSystemPrompt && parentPrompt) {
    return `${parentPrompt}\n\n${def.systemPrompt}`;
  }
  return def.systemPrompt;
}

/**
 * Run a subagent. Supports handleSteps, outputSchema validation,
 * inherited system prompts, stepPrompt, and token budgets.
 */
export async function runSubagent(
  definition: SubagentDefinition,
  input: string,
  options?: RunSubagentOptions
): Promise<SubagentResult> {
  const { parentTools, parentModel, parentSystemPrompt } = options ?? {};
  const tools = resolveTools(definition, parentTools);
  const model = definition.model == null ? parentModel : createModel(definition.model);
  if (!model) {
    throw new SubagentError(
      'Subagent has no model: set definition.model or pass parentModel in options',
      definition.name
    );
  }

  const systemPrompt = resolveSystemPrompt(definition, parentSystemPrompt);
  const agentConfig = {
    model,
    tools,
    systemPrompt,
    input,
    maxIterations: definition.maxIterations ?? 10,
    onStep: definition.onStep,
    observers: definition.observers,
    stepPrompt: definition.stepPrompt,
    maxContextTokens: definition.maxContextTokens,
    tokenBudget: definition.tokenBudget,
    handleSteps: definition.handleSteps,
  };

  const result = definition.handleSteps
    ? await runAgentWithSteps(agentConfig)
    : await runAgent(agentConfig);

  if (definition.outputSchema) {
    const parsed = definition.outputSchema.safeParse(result.output);
    if (!parsed.success) {
      throw new ValidationError(
        `Subagent "${definition.name}" output schema validation failed: ${parsed.error.message}`,
        parsed.error.issues
      );
    }
  }

  return { ...result, subagentName: definition.name };
}

export interface CreateSubagentToolOptions {
  parentTools?: Record<string, AgentTool>;
  parentModel?: Model;
  parentSystemPrompt?: string;
}

export function createSubagentTool(
  definition: SubagentDefinition,
  options?: CreateSubagentToolOptions
): AgentTool {
  const toolDesc = definition.spawnerPrompt ?? definition.description;
  return defineTool({
    name: `subagent_${definition.name}`,
    description: toolDesc,
    input: z.object({
      prompt: z.string().describe('The task or question to delegate to this subagent'),
    }),
    handler: async ({ prompt }) => {
      const result = await runSubagent(definition, prompt, {
        parentTools: options?.parentTools,
        parentModel: options?.parentModel,
        parentSystemPrompt: options?.parentSystemPrompt,
      });
      return result.output;
    },
  });
}

export function createSubagentToolSet(
  definitions: SubagentDefinition[],
  options?: CreateSubagentToolOptions
): ToolSet {
  const out: ToolSet = {};
  for (const def of definitions) {
    out[`subagent_${def.name}`] = createSubagentTool(def, options);
  }
  return out;
}

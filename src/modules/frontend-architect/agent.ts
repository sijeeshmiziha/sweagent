/**
 * runFrontendArchitectAgent - routing orchestrator for frontend architecture design.
 * Delegates to react-builder or nextjs-builder based on framework selection.
 */

import { runAgent } from '../../lib/agents';
import { createModel } from '../../lib/models/create-model';
import { createToolSet } from '../../lib/tools';
import { createSubagentToolSet, defineSubagent } from '../../lib/subagents';
import { FRONTEND_ARCHITECT_SYSTEM_PROMPT } from './prompts';
import { createFrontendArchitectTools } from './tools';
import {
  pagePlannerSubagent,
  componentAnalyzerSubagent,
  frameworkSelectorSubagent,
} from './subagents';
import type { FrontendArchitectAgentConfig } from './types';
import type { AgentResult } from '../../lib/types/agent';

/** Subagent wrapper for react-builder orchestrator */
const reactBuilderSubagent = defineSubagent({
  name: 'react-builder',
  description:
    'Generates a Vite + React SPA configuration from a frontend design and GraphQL schema. Use when the framework-selector recommends react-vite.',
  systemPrompt:
    'You are a React/Vite frontend builder. Generate a complete frontend config JSON from the requirements.',
  tools: {},
  maxIterations: 5,
});

/** Subagent wrapper for nextjs-builder orchestrator */
const nextjsBuilderSubagent = defineSubagent({
  name: 'nextjs-builder',
  description:
    'Generates a Next.js App Router configuration from a frontend design. Use when the framework-selector recommends nextjs.',
  systemPrompt:
    'You are a Next.js App Router builder. Generate a complete Next.js config JSON from the requirements.',
  tools: {},
  maxIterations: 5,
});

const ORCHESTRATOR_SYSTEM_PROMPT = `${FRONTEND_ARCHITECT_SYSTEM_PROMPT}

You are the frontend architecture routing orchestrator. When the user asks for a frontend design:

1. **Select framework**: Use subagent_framework-selector to analyze requirements (SPA vs SSR, SEO needs, API structure) and recommend React/Vite or Next.js.
2. **Plan pages**: Use subagent_page-planner to design detailed page specifications with routes, forms, actions, and states.
3. **Analyze components**: Use subagent_component-analyzer to identify reusable components, layouts, and state management patterns.
4. **Generate design**: Use design_frontend to produce the complete frontend architecture as JSON.
5. **Validate**: Use validate_frontend to check the final design JSON before returning.
6. **Delegate to builder**: Based on the framework-selector recommendation:
   - If "react-vite": use subagent_react-builder with the design to generate a Vite + React SPA config.
   - If "nextjs": use subagent_nextjs-builder with the design to generate a Next.js App Router config.

Respond with the final frontend design as JSON, including the builder output.`;

/**
 * Run the frontend-architect routing orchestrator with all tools and subagents.
 */
export async function runFrontendArchitectAgent(
  config: FrontendArchitectAgentConfig
): Promise<AgentResult> {
  const { input, model: modelConfig, maxIterations = 15, onStep, logger } = config;

  const model = createModel(modelConfig ?? { provider: 'openai', model: 'gpt-4o-mini' });
  const tools = createFrontendArchitectTools(model);
  const subagentTools = createSubagentToolSet(
    [
      pagePlannerSubagent,
      componentAnalyzerSubagent,
      frameworkSelectorSubagent,
      reactBuilderSubagent,
      nextjsBuilderSubagent,
    ],
    { parentModel: model }
  );
  const allTools = createToolSet({ ...tools, ...subagentTools });

  return runAgent({
    model,
    tools: allTools,
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    input,
    maxIterations,
    onStep,
    logger,
  });
}

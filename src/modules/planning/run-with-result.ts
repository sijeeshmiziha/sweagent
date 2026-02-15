/**
 * runPlanningWithResult - runs the planning agent then validates the output.
 * Returns canonical { planning: boolean, plan: string }.
 */

import type { PlanningAgentConfig, PlanningResult } from './types';
import { runPlanningAgent } from './agent';
import { validatePlanForCodingAgent } from './validate-plan';
import { createModel } from '../../lib/models/create-model';

/** Minimum output length and markdown section check before calling the LLM validator */
function looksLikePlan(output: string): boolean {
  return output.length > 200 && output.includes('##');
}

/**
 * Run the planning agent end-to-end, then validate the result with an LLM judge.
 * Returns { planning: true, plan } when the plan is implementation-ready,
 * or { planning: false, plan } with the raw output when it is not.
 */
export async function runPlanningWithResult(config: PlanningAgentConfig): Promise<PlanningResult> {
  const { logger } = config;

  const agentResult = await runPlanningAgent(config);
  const plan = agentResult.output;

  if (!looksLikePlan(plan)) {
    logger?.info('Plan output too short or missing sections, skipping validation');
    return { planning: false, plan };
  }

  const modelConfig = config.model ?? { provider: 'openai' as const, model: 'gpt-4o-mini' };
  const model = createModel(modelConfig);
  const validation = await validatePlanForCodingAgent(plan, model, logger);

  logger?.info('Planning result', { planning: validation.valid, feedback: validation.feedback });
  return { planning: validation.valid, plan };
}

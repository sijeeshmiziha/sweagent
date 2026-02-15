/**
 * Quick Start: Requirements -> Plan (two-agent chain)
 *
 * Chains the requirement-gatherer into the planning agent using the structured
 * fast path (runPlanningFromRequirements). Skips redundant discovery stages.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx --env-file=.env examples/quick-start/02-requirements-then-plan.ts
 *
 * One-shot: REQUIREMENT="E-commerce platform" npx tsx --env-file=.env examples/quick-start/02-requirements-then-plan.ts
 */
import {
  runRequirementGathererAgent,
  runPlanningFromRequirements,
  createLogger,
  loggerConfigFromEnv,
} from 'sweagent';
import type { FinalRequirement } from 'sweagent';

const logger = createLogger(loggerConfigFromEnv({ name: 'quick-start', pretty: true }));

const model = {
  provider: (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google',
  model: process.env.MODEL ?? 'gpt-4o-mini',
} as const;

async function main() {
  const requirement =
    process.env.REQUIREMENT ??
    'Task manager app with user authentication, project boards, task assignments, and a dashboard';

  console.log('=== Quick Start: Requirements -> Plan ===\n');
  console.log('Requirement:', requirement.slice(0, 120), '\n');

  // Step 1: Gather structured requirements
  console.log('[1/2] Gathering structured requirements...\n');
  const reqResult = await runRequirementGathererAgent({
    input: requirement,
    model,
    maxIterations: 15,
    logger,
  });

  let finalRequirement: FinalRequirement;
  try {
    finalRequirement = JSON.parse(reqResult.output) as FinalRequirement;
  } catch {
    console.log('--- Requirement Output (raw) ---');
    console.log(reqResult.output.slice(0, 2000));
    console.log('\nCould not parse structured requirements. Use the raw output above.');
    return;
  }

  console.log('Requirements gathered:', finalRequirement.project.name);
  console.log('Actors:', finalRequirement.actors.length);
  console.log('Modules:', finalRequirement.modules.length, '\n');

  // Step 2: Generate plan from structured requirements (fast path)
  console.log('[2/2] Generating plan from requirements...\n');
  const planResult = await runPlanningFromRequirements({
    requirement: finalRequirement,
    model,
    logger,
  });

  console.log('--- Plan Output ---');
  console.log(planResult.output);
}

main().catch(console.error);

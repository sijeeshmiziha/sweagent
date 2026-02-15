/**
 * Full Pipeline: Requirements -> Data Model -> API -> Auth -> Backend -> Frontend -> Execution
 *
 * Chains 7 domain agents sequentially. Each agent's output feeds the next.
 * After each step you can review, accept, regenerate with feedback, or skip.
 * Saves all outputs to an output/ directory as JSON files.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run (interactive -- review each step):
 *   npx tsx --env-file=.env examples/full-pipeline/01-full-pipeline.ts
 *
 * Run (automated -- no review prompts):
 *   REQUIREMENT="Project management SaaS" npx tsx --env-file=.env examples/full-pipeline/01-full-pipeline.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { input } from '@inquirer/prompts';
import {
  runDataModelerAgent,
  runApiDesignerAgent,
  runAuthDesignerAgent,
  runBackendArchitectAgent,
  runFrontendArchitectAgent,
  runExecutionPlannerAgent,
  createLogger,
  loggerConfigFromEnv,
} from 'sweagent';
import { gatherRequirements, reviewStep } from './helpers.js';
import { buildRefinementInput } from '../lib/input.js';

const logger = createLogger(loggerConfigFromEnv({ name: 'full-pipeline', pretty: true }));

const model = {
  provider: (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google',
  model: process.env.MODEL ?? 'gpt-4o-mini',
} as const;

const MAX_ITERATIONS = 15;

interface PipelineStep {
  name: string;
  file: string;
  run: (
    prevOutputs: Record<string, string>,
    feedback?: string,
    previousOutput?: string
  ) => Promise<string>;
}

function buildSteps(): PipelineStep[] {
  return [
    {
      name: 'Requirement Gatherer',
      file: 'requirements.json',
      run: async (prev, feedback, prevOutput) => {
        const base = prev.requirement ?? '';
        const prompt =
          feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base;
        return gatherRequirements(prompt, model, logger);
      },
    },
    {
      name: 'Data Modeler',
      file: 'data-model.json',
      run: async (prev, feedback, prevOutput) => {
        const base = `Design a data model based on these requirements:\n${prev['requirements.json']}`;
        const result = await runDataModelerAgent({
          input: feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base,
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        });
        return result.output;
      },
    },
    {
      name: 'API Designer',
      file: 'api-design.json',
      run: async (prev, feedback, prevOutput) => {
        const base =
          `Design the API based on this data model and requirements:\n` +
          `Data Model:\n${prev['data-model.json']}\n\n` +
          `Requirements:\n${prev['requirements.json']}`;
        const result = await runApiDesignerAgent({
          input: feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base,
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        });
        return result.output;
      },
    },
    {
      name: 'Auth Designer',
      file: 'auth-design.json',
      run: async (prev, feedback, prevOutput) => {
        const base =
          `Design auth for this project:\n` +
          `Requirements:\n${prev['requirements.json']}\n\n` +
          `API Design:\n${prev['api-design.json']}`;
        const result = await runAuthDesignerAgent({
          input: feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base,
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        });
        return result.output;
      },
    },
    {
      name: 'Backend Architect',
      file: 'backend-design.json',
      run: async (prev, feedback, prevOutput) => {
        const base =
          `Design backend architecture:\n` +
          `Data Model:\n${prev['data-model.json']}\n\n` +
          `API Design:\n${prev['api-design.json']}\n\n` +
          `Auth Design:\n${prev['auth-design.json']}`;
        const result = await runBackendArchitectAgent({
          input: feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base,
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        });
        return result.output;
      },
    },
    {
      name: 'Frontend Architect',
      file: 'frontend-design.json',
      run: async (prev, feedback, prevOutput) => {
        const base =
          `Design frontend architecture:\n` +
          `API Design:\n${prev['api-design.json']}\n\n` +
          `Requirements:\n${prev['requirements.json']}`;
        const result = await runFrontendArchitectAgent({
          input: feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base,
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        });
        return result.output;
      },
    },
    {
      name: 'Execution Planner',
      file: 'execution-plan.json',
      run: async (prev, feedback, prevOutput) => {
        const base =
          `Create an execution plan for this project:\n` +
          `Requirements:\n${prev['requirements.json']}\n\n` +
          `Data Model:\n${prev['data-model.json']}\n\n` +
          `API Design:\n${prev['api-design.json']}\n\n` +
          `Auth Design:\n${prev['auth-design.json']}\n\n` +
          `Backend Design:\n${prev['backend-design.json']}\n\n` +
          `Frontend Design:\n${prev['frontend-design.json']}`;
        const result = await runExecutionPlannerAgent({
          input: feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base,
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        });
        return result.output;
      },
    },
  ];
}

async function main() {
  console.log('=== Full Pipeline ===\n');
  console.log('Chains 7 agents: Requirements -> Data Model -> API -> Auth');
  console.log('-> Backend -> Frontend -> Execution Plan\n');

  const isInteractive = !process.env.REQUIREMENT;

  const requirement =
    process.env.REQUIREMENT ??
    (await input({
      message: 'Describe your project:',
      default: 'Project management SaaS with teams, Kanban boards, time tracking, and billing',
    }));

  if (isInteractive) {
    console.log('\nAfter each step you can review the output and provide feedback.\n');
  }

  const outputDir = join(process.cwd(), 'output');
  mkdirSync(outputDir, { recursive: true });

  const steps = buildSteps();
  const outputs: Record<string, string> = { requirement };
  const total = steps.length;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    let feedback: string | undefined;

    // Regeneration loop: re-run the step if the user provides feedback

    while (true) {
      const start = Date.now();
      console.log(`\n[${i + 1}/${total}] ${step.name}...`);

      const previousOutput = feedback ? outputs[step.file] : undefined;
      const output = await step.run(outputs, feedback, previousOutput);
      outputs[step.file] = output;

      const filePath = join(outputDir, step.file);
      writeFileSync(filePath, output, 'utf-8');
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`  Done (${elapsed}s) -> ${filePath}`);

      const review = await reviewStep(step.name, output, isInteractive);
      if (review.action === 'skip') {
        outputs[step.file] = '';
        writeFileSync(filePath, '', 'utf-8');
        console.log(`  Skipped ${step.name}`);
        break;
      }
      if (review.action === 'regenerate') {
        feedback = review.feedback;
        console.log(`  Regenerating ${step.name} with feedback...`);
        continue;
      }
      break; // accept
    }
  }

  console.log('\n=== Pipeline Complete ===');
  console.log(`All outputs saved to: ${outputDir}/`);
  for (const step of steps) {
    console.log(`  - ${step.file}`);
  }
}

main().catch(console.error);

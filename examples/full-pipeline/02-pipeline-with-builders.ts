/**
 * Full Pipeline with Code Builders
 *
 * Extended pipeline that includes code generation agents:
 *   Requirements -> Data Model -> API -> Auth -> Backend Architect
 *   -> Express or Apollo Builder -> Frontend Architect
 *   -> React or Next.js Builder -> Execution Plan
 *
 * After each step you can review, accept, regenerate with feedback, or skip.
 * The API style (REST vs GraphQL) determines which builder runs.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run (interactive):
 *   npx tsx --env-file=.env examples/full-pipeline/02-pipeline-with-builders.ts
 *
 * Run (automated):
 *   REQUIREMENT="E-commerce platform" npx tsx --env-file=.env examples/full-pipeline/02-pipeline-with-builders.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { input } from '@inquirer/prompts';
import {
  runDataModelerAgent,
  runApiDesignerAgent,
  runAuthDesignerAgent,
  runBackendArchitectAgent,
  runExpressBuilderAgent,
  runApolloBuilderAgent,
  runFrontendArchitectAgent,
  runReactBuilderAgent,
  runNextjsBuilderAgent,
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

function detectApiStyle(apiOutput: string): 'rest' | 'graphql' {
  try {
    const parsed = JSON.parse(apiOutput);
    if (parsed.style === 'graphql') return 'graphql';
  } catch {
    if (apiOutput.toLowerCase().includes('"style":"graphql"')) return 'graphql';
  }
  return 'rest';
}

function detectFramework(frontendOutput: string): 'nextjs' | 'react' {
  const lower = frontendOutput.toLowerCase();
  if (lower.includes('next.js') || lower.includes('nextjs') || lower.includes('"next"')) {
    return 'nextjs';
  }
  return 'react';
}

/* ── Step runner with timing ─────────────────────────────── */

async function runStepTimed(
  stepNum: number,
  total: number,
  name: string,
  fn: () => Promise<string>
): Promise<string> {
  const start = Date.now();
  console.log(`\n[${stepNum}/${total}] ${name}...`);
  const output = await fn();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  Done (${elapsed}s)`);
  return output;
}

/* ── Step with review loop ───────────────────────────────── */

async function runWithReview(
  stepNum: number,
  total: number,
  name: string,
  file: string,
  outputDir: string,
  isInteractive: boolean,
  fn: (feedback?: string, previousOutput?: string) => Promise<string>
): Promise<string> {
  let feedback: string | undefined;
  let lastOutput: string | undefined;

  while (true) {
    const prevOut = feedback ? lastOutput : undefined;
    const output = await runStepTimed(stepNum, total, name, () => fn(feedback, prevOut));
    lastOutput = output;
    const filePath = join(outputDir, file);
    writeFileSync(filePath, output, 'utf-8');
    console.log(`  Saved: ${filePath}`);

    const review = await reviewStep(name, output, isInteractive);
    if (review.action === 'skip') {
      writeFileSync(filePath, '', 'utf-8');
      console.log(`  Skipped ${name}`);
      return '';
    }
    if (review.action === 'regenerate') {
      feedback = review.feedback;
      console.log(`  Regenerating ${name} with feedback...`);
      continue;
    }
    return output; // accept
  }
}

async function main() {
  console.log('=== Full Pipeline with Builders ===\n');
  console.log('Extended pipeline: Requirements -> Data Model -> API -> Auth');
  console.log('-> Backend Architect -> Express/Apollo Builder');
  console.log('-> Frontend Architect -> React/Next.js Builder -> Execution Plan\n');

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

  const total = 9;
  let step = 0;
  const refine = (base: string, feedback?: string, prevOutput?: string) =>
    feedback && prevOutput ? buildRefinementInput(base, prevOutput, feedback) : base;

  // 1. Requirements
  const requirements = await runWithReview(
    ++step,
    total,
    'Requirement Gatherer',
    'requirements.json',
    outputDir,
    isInteractive,
    (feedback, prevOutput) => {
      const prompt =
        feedback && prevOutput
          ? buildRefinementInput(requirement, prevOutput, feedback)
          : requirement;
      return gatherRequirements(prompt, model, logger);
    }
  );

  // 2. Data Model
  const dataModel = await runWithReview(
    ++step,
    total,
    'Data Modeler',
    'data-model.json',
    outputDir,
    isInteractive,
    (feedback, prevOutput) =>
      runDataModelerAgent({
        input: refine(
          `Design a data model based on these requirements:\n${requirements}`,
          feedback,
          prevOutput
        ),
        model,
        maxIterations: MAX_ITERATIONS,
        logger,
      }).then(r => r.output)
  );

  // 3. API Design
  const apiDesign = await runWithReview(
    ++step,
    total,
    'API Designer',
    'api-design.json',
    outputDir,
    isInteractive,
    (feedback, prevOutput) =>
      runApiDesignerAgent({
        input: refine(
          `Design the API:\nData Model:\n${dataModel}\n\nRequirements:\n${requirements}`,
          feedback,
          prevOutput
        ),
        model,
        maxIterations: MAX_ITERATIONS,
        logger,
      }).then(r => r.output)
  );

  // 4. Auth Design
  const authDesign = await runWithReview(
    ++step,
    total,
    'Auth Designer',
    'auth-design.json',
    outputDir,
    isInteractive,
    (feedback, prevOutput) =>
      runAuthDesignerAgent({
        input: refine(
          `Design auth:\nRequirements:\n${requirements}\n\nAPI:\n${apiDesign}`,
          feedback,
          prevOutput
        ),
        model,
        maxIterations: MAX_ITERATIONS,
        logger,
      }).then(r => r.output)
  );

  // 5. Backend Architect
  const backendDesign = await runWithReview(
    ++step,
    total,
    'Backend Architect',
    'backend-design.json',
    outputDir,
    isInteractive,
    (feedback, prevOutput) =>
      runBackendArchitectAgent({
        input: refine(
          `Design backend:\nData Model:\n${dataModel}\n\nAPI:\n${apiDesign}\n\nAuth:\n${authDesign}`,
          feedback,
          prevOutput
        ),
        model,
        maxIterations: MAX_ITERATIONS,
        logger,
      }).then(r => r.output)
  );

  // 6. Backend Builder (Express or Apollo based on API style)
  const apiStyle = detectApiStyle(apiDesign);
  if (apiStyle === 'graphql') {
    await runWithReview(
      ++step,
      total,
      'Apollo Builder (GraphQL)',
      'apollo-config.json',
      outputDir,
      isInteractive,
      (feedback, prevOutput) =>
        runApolloBuilderAgent({
          input: refine(
            `Generate Apollo subgraph config:\nData Model:\n${dataModel}\n\nAPI:\n${apiDesign}`,
            feedback,
            prevOutput
          ),
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        }).then(r => r.output)
    );
  } else {
    await runWithReview(
      ++step,
      total,
      'Express Builder (REST)',
      'express-config.json',
      outputDir,
      isInteractive,
      (feedback, prevOutput) =>
        runExpressBuilderAgent({
          input: refine(
            `Generate Express API config:\nData Model:\n${dataModel}\n\nAPI:\n${apiDesign}`,
            feedback,
            prevOutput
          ),
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        }).then(r => r.output)
    );
  }

  // 7. Frontend Architect
  const frontendDesign = await runWithReview(
    ++step,
    total,
    'Frontend Architect',
    'frontend-design.json',
    outputDir,
    isInteractive,
    (feedback, prevOutput) =>
      runFrontendArchitectAgent({
        input: refine(
          `Design frontend:\nAPI:\n${apiDesign}\n\nRequirements:\n${requirements}`,
          feedback,
          prevOutput
        ),
        model,
        maxIterations: MAX_ITERATIONS,
        logger,
      }).then(r => r.output)
  );

  // 8. Frontend Builder (React or Next.js based on frontend design)
  const framework = detectFramework(frontendDesign);
  if (framework === 'nextjs') {
    await runWithReview(
      ++step,
      total,
      'Next.js Builder',
      'nextjs-config.json',
      outputDir,
      isInteractive,
      (feedback, prevOutput) =>
        runNextjsBuilderAgent({
          input: refine(
            `Generate Next.js config:\nFrontend:\n${frontendDesign}\n\nAPI:\n${apiDesign}`,
            feedback,
            prevOutput
          ),
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        }).then(r => r.output)
    );
  } else {
    await runWithReview(
      ++step,
      total,
      'React Builder',
      'react-config.json',
      outputDir,
      isInteractive,
      (feedback, prevOutput) =>
        runReactBuilderAgent({
          input: refine(
            `Generate React config:\nFrontend:\n${frontendDesign}\n\nAPI:\n${apiDesign}`,
            feedback,
            prevOutput
          ),
          model,
          maxIterations: MAX_ITERATIONS,
          logger,
        }).then(r => r.output)
    );
  }

  // 9. Execution Planner
  await runWithReview(
    ++step,
    total,
    'Execution Planner',
    'execution-plan.json',
    outputDir,
    isInteractive,
    (feedback, prevOutput) =>
      runExecutionPlannerAgent({
        input: refine(
          `Create execution plan:\nRequirements:\n${requirements}\n\n` +
            `Data Model:\n${dataModel}\n\nAPI:\n${apiDesign}\n\n` +
            `Auth:\n${authDesign}\n\nBackend:\n${backendDesign}\n\n` +
            `Frontend:\n${frontendDesign}`,
          feedback,
          prevOutput
        ),
        model,
        maxIterations: MAX_ITERATIONS,
        logger,
      }).then(r => r.output)
  );

  console.log('\n=== Pipeline Complete ===');
  console.log(
    `API style detected: ${apiStyle} -> ${apiStyle === 'graphql' ? 'Apollo' : 'Express'}`
  );
  console.log(
    `Framework detected: ${framework} -> ${framework === 'nextjs' ? 'Next.js' : 'React'}`
  );
  console.log(`All outputs saved to: ${outputDir}/`);
}

main().catch(console.error);

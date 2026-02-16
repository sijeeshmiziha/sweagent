/**
 * runFullPipelineAgent - orchestrates the full 7-agent pipeline end-to-end.
 *
 * Runs: Requirements -> Data Model -> API -> Auth -> Backend -> Frontend -> Execution Plan.
 * Each agent's output feeds as context into the next.
 */

import type { AgentResult } from '../../lib/types/agent';
import type { FullPipelineConfig, PipelineStepResult, StepRunConfig } from './types';
import { PIPELINE_STEPS } from './steps';

const log = (msg: string): void => {
  process.stderr.write(`[full-pipeline] ${msg}\n`);
};

function assembleOutput(results: PipelineStepResult[]): string {
  const sections = results
    .map(r => {
      const step = PIPELINE_STEPS.find(s => s.key === r.key);
      const heading = step?.heading ?? r.name;
      return `## ${heading}\n\n${r.output}`;
    })
    .join('\n\n---\n\n');

  return `# Full Application Specification\n\n${sections}`;
}

/**
 * Run the full pipeline: 7 domain agents chained sequentially.
 * Returns a combined specification document.
 */
export async function runFullPipelineAgent(config: FullPipelineConfig): Promise<AgentResult> {
  const { input, model, maxIterations = 15, onStep, logger } = config;

  const stepCfg: StepRunConfig = { model, maxIterations, onStep, logger };
  const outputs: Record<string, string> = { userInput: input };
  const results: PipelineStepResult[] = [];
  const total = PIPELINE_STEPS.length;

  for (const [i, step] of PIPELINE_STEPS.entries()) {
    log(`[${i + 1}/${total}] ${step.name}...`);

    const stepOutput = await step.run(outputs, stepCfg);
    outputs[step.key] = stepOutput;
    results.push({ name: step.name, key: step.key, output: stepOutput });

    log(`[${i + 1}/${total}] ${step.name} — done`);
  }

  log('Pipeline complete');

  return {
    output: assembleOutput(results),
    steps: [],
    messages: [],
  };
}

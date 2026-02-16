/**
 * Pipeline step definitions - each step composes its input from prior outputs
 * and calls the corresponding domain agent.
 */

import { runRequirementGathererAgent } from '../requirement-gatherer';
import { runDataModelerAgent } from '../data-modeler';
import { runApiDesignerAgent } from '../api-designer';
import { runAuthDesignerAgent } from '../auth-designer';
import { runBackendArchitectAgent } from '../backend-architect';
import { runFrontendArchitectAgent } from '../frontend-architect';
import { runExecutionPlannerAgent } from '../execution-planner';
import type { StepRunConfig } from './types';

/** A single pipeline step with its input composition logic. */
export interface PipelineStep {
  /** Human-readable step name (e.g. "Requirement Gatherer"). */
  name: string;
  /** Key used to store the output in the accumulated results map. */
  key: string;
  /** Section heading used in the combined output document. */
  heading: string;
  /** Run the step: compose input from prior outputs and call the agent. */
  run: (outputs: Record<string, string>, cfg: StepRunConfig) => Promise<string>;
}

function agentCfg(input: string, cfg: StepRunConfig) {
  return {
    input,
    model: cfg.model,
    maxIterations: cfg.maxIterations,
    onStep: cfg.onStep,
    logger: cfg.logger,
  };
}

/** Ordered list of all pipeline steps. */
export const PIPELINE_STEPS: PipelineStep[] = [
  {
    name: 'Requirement Gatherer',
    key: 'requirements',
    heading: 'Requirements',
    run: (out, cfg) =>
      runRequirementGathererAgent(agentCfg(out.userInput ?? '', cfg)).then(r => r.output),
  },
  {
    name: 'Data Modeler',
    key: 'dataModel',
    heading: 'Data Model',
    run: (out, cfg) =>
      runDataModelerAgent(
        agentCfg(`Design a data model based on these requirements:\n${out.requirements}`, cfg)
      ).then(r => r.output),
  },
  {
    name: 'API Designer',
    key: 'apiDesign',
    heading: 'API Design',
    run: (out, cfg) =>
      runApiDesignerAgent(
        agentCfg(
          `Design the API based on this data model and requirements:\n` +
            `Data Model:\n${out.dataModel}\n\nRequirements:\n${out.requirements}`,
          cfg
        )
      ).then(r => r.output),
  },
  {
    name: 'Auth Designer',
    key: 'authDesign',
    heading: 'Auth Design',
    run: (out, cfg) =>
      runAuthDesignerAgent(
        agentCfg(
          `Design auth for this project:\n` +
            `Requirements:\n${out.requirements}\n\nAPI Design:\n${out.apiDesign}`,
          cfg
        )
      ).then(r => r.output),
  },
  {
    name: 'Backend Architect',
    key: 'backendDesign',
    heading: 'Backend Architecture',
    run: (out, cfg) =>
      runBackendArchitectAgent(
        agentCfg(
          `Design backend architecture:\n` +
            `Data Model:\n${out.dataModel}\n\n` +
            `API Design:\n${out.apiDesign}\n\n` +
            `Auth Design:\n${out.authDesign}`,
          cfg
        )
      ).then(r => r.output),
  },
  {
    name: 'Frontend Architect',
    key: 'frontendDesign',
    heading: 'Frontend Architecture',
    run: (out, cfg) =>
      runFrontendArchitectAgent(
        agentCfg(
          `Design frontend architecture:\n` +
            `API Design:\n${out.apiDesign}\n\nRequirements:\n${out.requirements}`,
          cfg
        )
      ).then(r => r.output),
  },
  {
    name: 'Execution Planner',
    key: 'executionPlan',
    heading: 'Execution Plan',
    run: (out, cfg) =>
      runExecutionPlannerAgent(
        agentCfg(
          `Create an execution plan for this project:\n` +
            `Requirements:\n${out.requirements}\n\n` +
            `Data Model:\n${out.dataModel}\n\n` +
            `API Design:\n${out.apiDesign}\n\n` +
            `Auth Design:\n${out.authDesign}\n\n` +
            `Backend Design:\n${out.backendDesign}\n\n` +
            `Frontend Design:\n${out.frontendDesign}`,
          cfg
        )
      ).then(r => r.output),
  },
];

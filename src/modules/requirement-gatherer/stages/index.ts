/**
 * requirement-gatherer stage processors and State pattern
 */

export { extractJson, buildContextSummary, isConfirmation } from './base';
export type { StageProcessor } from '../types';
export { runDiscoveryStage } from './discovery.stage';
export { runRequirementsStage } from './requirements.stage';
export { runDesignStage } from './design.stage';
export { runSynthesisStage } from './synthesis.stage';
export { getStateForStage } from './state-registry';
export type { RequirementStageState, StageInput } from './state-types';

import type { Stage } from '../types';
import type { StageProcessor } from '../types';
import { runDiscoveryStage } from './discovery.stage';
import { runRequirementsStage } from './requirements.stage';
import { runDesignStage } from './design.stage';
import { runSynthesisStage } from './synthesis.stage';

const stageProcessors: Record<Stage, StageProcessor> = {
  discovery: runDiscoveryStage,
  requirements: runRequirementsStage,
  design: runDesignStage,
  complete: runSynthesisStage,
};

export function getStageProcessor(stage: Stage): StageProcessor {
  return stageProcessors[stage];
}

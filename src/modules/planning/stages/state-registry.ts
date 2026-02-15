/**
 * Registry: map Stage to State instance for State pattern routing
 */

import type { Stage } from '../types';
import type { PlanningStageState } from './state-types';
import { DiscoveryState } from './discovery.state';
import { RequirementsState } from './requirements.state';
import { DesignState } from './design.state';
import { SynthesisState } from './synthesis.state';

const states: Record<Stage, PlanningStageState> = {
  discovery: new DiscoveryState(),
  requirements: new RequirementsState(),
  design: new DesignState(),
  complete: new SynthesisState(),
};

export function getStateForStage(stage: Stage): PlanningStageState {
  return states[stage];
}

/**
 * Discovery state - placeholder until discovery.stage is implemented
 */

import type { PlanningContext, PlanStageResult, StageInput } from '../types';
import type { PlanningStageState } from './state-types';
import { runDiscoveryStage } from './discovery.stage';

export class DiscoveryState implements PlanningStageState {
  readonly stageName = 'discovery' as const;

  async process(context: PlanningContext, input: StageInput): Promise<PlanStageResult> {
    return runDiscoveryStage(input.userMessage, context, input.model, input.logger);
  }

  canAdvance(result: PlanStageResult): boolean {
    return result.advance;
  }

  getNextStageName(): 'requirements' | null {
    return 'requirements';
  }
}

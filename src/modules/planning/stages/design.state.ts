/**
 * Design state - delegates to design stage
 */

import type { PlanningContext, PlanStageResult, StageInput } from '../types';
import type { PlanningStageState } from './state-types';
import { runDesignStage } from './design.stage';

export class DesignState implements PlanningStageState {
  readonly stageName = 'design' as const;

  async process(context: PlanningContext, input: StageInput): Promise<PlanStageResult> {
    return runDesignStage(input.userMessage, context, input.model, input.logger);
  }

  canAdvance(result: PlanStageResult): boolean {
    return result.advance;
  }

  getNextStageName(): 'complete' | null {
    return 'complete';
  }
}

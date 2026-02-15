/**
 * Requirements state - delegates to requirements stage
 */

import type { PlanningContext, PlanStageResult, StageInput } from '../types';
import type { PlanningStageState } from './state-types';
import { runRequirementsStage } from './requirements.stage';

export class RequirementsState implements PlanningStageState {
  readonly stageName = 'requirements' as const;

  async process(context: PlanningContext, input: StageInput): Promise<PlanStageResult> {
    return runRequirementsStage(input.userMessage, context, input.model, input.logger);
  }

  canAdvance(result: PlanStageResult): boolean {
    return result.advance;
  }

  getNextStageName(): 'design' | null {
    return 'design';
  }
}

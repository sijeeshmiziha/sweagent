/**
 * Requirements stage - State pattern wrapper
 */

import type { RequirementContext, Stage, StageResult } from '../types';
import type { RequirementStageState, StageInput } from './state-types';
import { runRequirementsStage } from './requirements.stage';

export class RequirementsState implements RequirementStageState {
  readonly stageName: Stage = 'requirements';

  async process(context: RequirementContext, input: StageInput): Promise<StageResult> {
    return runRequirementsStage(input.userMessage, context, input.model);
  }

  canAdvance(result: StageResult): boolean {
    return result.advance;
  }

  getNextStageName(): Stage | null {
    return 'design';
  }
}

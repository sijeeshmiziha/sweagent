/**
 * Design stage - State pattern wrapper
 */

import type { RequirementContext, Stage, StageResult } from '../types';
import type { RequirementStageState, StageInput } from './state-types';
import { runDesignStage } from './design.stage';

export class DesignState implements RequirementStageState {
  readonly stageName: Stage = 'design';

  async process(context: RequirementContext, input: StageInput): Promise<StageResult> {
    return runDesignStage(input.userMessage, context, input.model);
  }

  canAdvance(result: StageResult): boolean {
    return result.advance;
  }

  getNextStageName(): Stage | null {
    return 'complete';
  }
}

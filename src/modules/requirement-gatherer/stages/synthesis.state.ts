/**
 * Synthesis (complete) stage - State pattern wrapper
 */

import type { RequirementContext, Stage, StageResult } from '../types';
import type { RequirementStageState, StageInput } from './state-types';
import { runSynthesisStage } from './synthesis.stage';

export class SynthesisState implements RequirementStageState {
  readonly stageName: Stage = 'complete';

  async process(context: RequirementContext, input: StageInput): Promise<StageResult> {
    return runSynthesisStage(input.userMessage, context, input.model, input.logger);
  }

  canAdvance(result: StageResult): boolean {
    return result.advance;
  }

  getNextStageName(): Stage | null {
    return null;
  }
}

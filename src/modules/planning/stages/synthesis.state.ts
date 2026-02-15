/**
 * Synthesis state - delegates to synthesis stage
 */

import type { PlanningContext, PlanStageResult, StageInput } from '../types';
import type { PlanningStageState } from './state-types';
import { runSynthesisStage } from './synthesis.stage';

export class SynthesisState implements PlanningStageState {
  readonly stageName = 'complete' as const;

  async process(context: PlanningContext, input: StageInput): Promise<PlanStageResult> {
    return runSynthesisStage(input.userMessage, context, input.model, input.logger);
  }

  canAdvance(result: PlanStageResult): boolean {
    return result.advance;
  }

  getNextStageName(): null {
    return null;
  }
}

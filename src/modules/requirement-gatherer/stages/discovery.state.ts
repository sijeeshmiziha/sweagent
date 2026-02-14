/**
 * Discovery stage - State pattern wrapper
 */

import type { RequirementContext, Stage, StageResult } from '../types';
import type { RequirementStageState, StageInput } from './state-types';
import { runDiscoveryStage } from './discovery.stage';

export class DiscoveryState implements RequirementStageState {
  readonly stageName: Stage = 'discovery';

  async process(context: RequirementContext, input: StageInput): Promise<StageResult> {
    return runDiscoveryStage(input.userMessage, context, input.model);
  }

  canAdvance(result: StageResult): boolean {
    return result.advance;
  }

  getNextStageName(): Stage | null {
    return 'requirements';
  }
}

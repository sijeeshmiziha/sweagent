/**
 * State pattern types for requirement-gatherer stages.
 */

import type { Model } from '../../../lib/types/model';
import type { RequirementContext, Stage, StageResult as RGStageResult } from '../types';

export interface StageInput {
  userMessage: string;
  model: Model;
}

export type StageResultData = RGStageResult['data'];

export interface RequirementStageState {
  readonly stageName: Stage;
  process(context: RequirementContext, input: StageInput): Promise<RGStageResult>;
  canAdvance(result: RGStageResult): boolean;
  getNextStageName(): Stage | null;
}

/**
 * State pattern types for planning stages
 */

import type { PlanningContext, Stage, PlanStageResult, StageInput } from '../types';

export type { StageInput } from '../types';

export interface PlanningStageState {
  readonly stageName: Stage;
  process(context: PlanningContext, input: StageInput): Promise<PlanStageResult>;
  canAdvance(result: PlanStageResult): boolean;
  getNextStageName(): Stage | null;
}

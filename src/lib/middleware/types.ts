/**
 * Request/result types for stage middleware chain.
 */

import type { Model } from '../types/model';
import type { Logger } from '../types/common';
import type {
  Stage,
  RequirementContext,
  FinalRequirement,
} from '../../modules/requirement-gatherer/types';

export interface StageRunRequest {
  stage: Stage;
  userMessage: string;
  context: RequirementContext;
  model: Model;
  logger?: Logger;
}

export interface StageRunResult {
  message: string;
  questions: RequirementContext['pendingQuestions'];
  advance: boolean;
  data: RequirementContext;
  finalRequirement?: FinalRequirement;
}

/**
 * Builder for PlanningContext - fluent API
 */

import type { PlanningContext, Stage, PlanSections, ChatEntry } from './types';

const DEFAULT_STAGE: Stage = 'discovery';

const EMPTY_SECTIONS: PlanSections = {
  overview: null,
  techStack: null,
  featureDecisions: null,
  dataModels: null,
  pagesAndRoutes: null,
  authFlow: null,
  apiRoutes: null,
  implementation: null,
  executionPlan: null,
  edgeCases: null,
  testingChecklist: null,
};

export class PlanningContextBuilder {
  private data: Partial<PlanningContext> = {};

  withStage(stage: Stage): this {
    this.data.stage = stage;
    return this;
  }

  withProjectDescription(projectDescription: string | null): this {
    this.data.projectDescription = projectDescription;
    return this;
  }

  withSections(sections: Partial<PlanSections>): this {
    this.data.sections = { ...(this.data.sections ?? EMPTY_SECTIONS), ...sections };
    return this;
  }

  withHistory(history: ChatEntry[]): this {
    this.data.history = history;
    return this;
  }

  withPendingQuestions(pendingQuestions: string[]): this {
    this.data.pendingQuestions = pendingQuestions;
    return this;
  }

  reset(): this {
    this.data = {};
    return this;
  }

  build(): PlanningContext {
    return {
      stage: this.data.stage ?? DEFAULT_STAGE,
      projectDescription: this.data.projectDescription ?? null,
      sections: this.data.sections ?? { ...EMPTY_SECTIONS },
      history: this.data.history ?? [],
      pendingQuestions: this.data.pendingQuestions ?? [],
    };
  }
}

export function createPlanningContextBuilder(): PlanningContextBuilder {
  return new PlanningContextBuilder();
}

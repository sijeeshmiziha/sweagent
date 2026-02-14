/**
 * Builder for RequirementContext - fluent API, max 150 lines.
 */

import type {
  RequirementContext,
  Stage,
  ProjectBrief,
  Actor,
  Flow,
  Story,
  Module,
  DatabaseDesign,
  ApiDesign,
  ChatEntry,
  Question,
} from './types';

const DEFAULT_STAGE: Stage = 'discovery';

export class RequirementContextBuilder {
  private data: Partial<RequirementContext> = {};

  withStage(stage: Stage): this {
    this.data.stage = stage;
    return this;
  }

  withProjectBrief(projectBrief: ProjectBrief | null): this {
    this.data.projectBrief = projectBrief;
    return this;
  }

  withActors(actors: Actor[]): this {
    this.data.actors = actors;
    return this;
  }

  withFlows(flows: Flow[]): this {
    this.data.flows = flows;
    return this;
  }

  withStories(stories: Story[]): this {
    this.data.stories = stories;
    return this;
  }

  withModules(modules: Module[]): this {
    this.data.modules = modules;
    return this;
  }

  withDatabase(database: DatabaseDesign | null): this {
    this.data.database = database;
    return this;
  }

  withApiDesign(apiDesign: ApiDesign | null): this {
    this.data.apiDesign = apiDesign;
    return this;
  }

  withHistory(history: ChatEntry[]): this {
    this.data.history = history;
    return this;
  }

  withPendingQuestions(pendingQuestions: Question[]): this {
    this.data.pendingQuestions = pendingQuestions;
    return this;
  }

  reset(): this {
    this.data = {};
    return this;
  }

  build(): RequirementContext {
    return {
      stage: this.data.stage ?? DEFAULT_STAGE,
      projectBrief: this.data.projectBrief ?? null,
      actors: this.data.actors ?? [],
      flows: this.data.flows ?? [],
      stories: this.data.stories ?? [],
      modules: this.data.modules ?? [],
      database: this.data.database ?? null,
      apiDesign: this.data.apiDesign ?? null,
      history: this.data.history ?? [],
      pendingQuestions: this.data.pendingQuestions ?? [],
    };
  }
}

export function createRequirementContextBuilder(): RequirementContextBuilder {
  return new RequirementContextBuilder();
}

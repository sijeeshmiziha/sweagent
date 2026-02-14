/**
 * Zod schemas for FinalRequirement, RequirementSummary
 */

import { z } from 'zod';
import { projectBriefSchema } from './context.schema';
import { actorSchema } from './actor.schema';
import { flowSchema } from './flow.schema';
import { storySchema } from './story.schema';
import { extractedModuleSchema } from './module.schema';
import { databaseDesignSchema } from './database.schema';
import { apiDesignSchema } from './api-design.schema';

export const requirementSummarySchema = z.object({
  totalActors: z.number(),
  totalFlows: z.number(),
  totalStories: z.number(),
  totalModules: z.number(),
  totalEntities: z.number(),
  totalEndpoints: z.number(),
  overview: z.string(),
});

export const finalRequirementSchema = z.object({
  project: projectBriefSchema,
  actors: z.array(actorSchema),
  flows: z.array(flowSchema),
  stories: z.array(storySchema),
  modules: z.array(extractedModuleSchema),
  database: databaseDesignSchema,
  apiDesign: apiDesignSchema,
  summary: requirementSummarySchema,
});

export type RequirementSummary = z.infer<typeof requirementSummarySchema>;
export type FinalRequirement = z.infer<typeof finalRequirementSchema>;

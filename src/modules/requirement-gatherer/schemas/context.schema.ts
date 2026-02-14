/**
 * Zod schemas for RequirementContext, ProjectBrief, Question, ChatEntry
 */

import { z } from 'zod';
import { actorSchema } from './actor.schema';
import { flowSchema } from './flow.schema';
import { storySchema } from './story.schema';
import { extractedModuleSchema } from './module.schema';
import { databaseDesignSchema } from './database.schema';
import { apiDesignSchema } from './api-design.schema';

export const projectBriefSchema = z.object({
  name: z.string(),
  goal: z.string(),
  features: z.array(z.string()),
  domain: z.string(),
  database: z.enum(['mongodb', 'postgresql']),
  backendRuntime: z.literal('nodejs'),
  apiStyle: z.enum(['rest', 'graphql']),
});

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  context: z.string(),
  suggestions: z.array(z.string()),
  multiSelect: z.boolean(),
  required: z.boolean(),
});

export const chatEntrySchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const requirementContextSchema = z.object({
  stage: z.enum(['discovery', 'requirements', 'design', 'complete']),
  projectBrief: projectBriefSchema.nullable(),
  actors: z.array(actorSchema),
  flows: z.array(flowSchema),
  stories: z.array(storySchema),
  modules: z.array(extractedModuleSchema),
  database: databaseDesignSchema.nullable(),
  apiDesign: apiDesignSchema.nullable(),
  history: z.array(chatEntrySchema),
  pendingQuestions: z.array(questionSchema),
});

export type ProjectBrief = z.infer<typeof projectBriefSchema>;
export type Question = z.infer<typeof questionSchema>;
export type ChatEntry = z.infer<typeof chatEntrySchema>;
export type RequirementContext = z.infer<typeof requirementContextSchema>;

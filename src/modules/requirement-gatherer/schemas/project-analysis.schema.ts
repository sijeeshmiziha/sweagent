/**
 * Zod schema for analyze_project_info tool output
 */

import { z } from 'zod';

export const projectAnalysisQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  context: z.string(),
  suggestions: z.array(z.string()),
  multiSelect: z.boolean(),
  required: z.boolean(),
});

export const projectAnalysisSchema = z.object({
  needsClarification: z.boolean(),
  questions: z.array(projectAnalysisQuestionSchema),
  conversationalMessage: z.string(),
  projectAnalysis: z.object({
    identifiedActors: z.array(z.string()),
    potentialEpics: z.array(z.string()),
    dataEntitiesDetected: z.array(z.string()),
    complexity: z.string(),
    projectType: z.string(),
  }),
});

export type ProjectAnalysis = z.infer<typeof projectAnalysisSchema>;
export type ProjectAnalysisQuestion = z.infer<typeof projectAnalysisQuestionSchema>;

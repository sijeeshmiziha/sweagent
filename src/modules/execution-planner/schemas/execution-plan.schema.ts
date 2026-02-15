/**
 * Zod schemas for ExecutionPlan
 */

import { z } from 'zod';

export const phaseStepSchema = z.object({
  order: z.number(),
  action: z.string(),
  details: z.string(),
});

export const implementationPhaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  steps: z.array(phaseStepSchema),
});

export const edgeCaseSchema = z.object({
  area: z.string(),
  scenario: z.string(),
  handling: z.string(),
  severity: z
    .string()
    .transform(s => s.toLowerCase().trim())
    .pipe(z.enum(['critical', 'warning', 'info'])),
});

export const testChecklistItemSchema = z.object({
  flow: z.string(),
  item: z.string(),
  expectedResult: z.string(),
});

export const executionPlanSchema = z.object({
  phases: z.array(implementationPhaseSchema).default([]),
  currentState: z.string().default(''),
  desiredEndState: z.string().default(''),
  edgeCases: z.array(edgeCaseSchema).default([]),
  securityNotes: z.array(z.string()).default([]),
  performanceNotes: z.array(z.string()).default([]),
  testingChecklist: z.array(testChecklistItemSchema).default([]),
});

export type TExecutionPlan = z.infer<typeof executionPlanSchema>;

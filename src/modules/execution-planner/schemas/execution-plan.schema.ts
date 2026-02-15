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
  severity: z.enum(['critical', 'warning', 'info']),
});

export const testChecklistItemSchema = z.object({
  flow: z.string(),
  item: z.string(),
  expectedResult: z.string(),
});

export const executionPlanSchema = z.object({
  phases: z.array(implementationPhaseSchema),
  currentState: z.string(),
  desiredEndState: z.string(),
  edgeCases: z.array(edgeCaseSchema),
  securityNotes: z.array(z.string()).default([]),
  performanceNotes: z.array(z.string()).default([]),
  testingChecklist: z.array(testChecklistItemSchema),
});

export type TExecutionPlan = z.infer<typeof executionPlanSchema>;

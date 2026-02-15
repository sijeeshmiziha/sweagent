/**
 * Zod schemas for TodoPlan - dependency-aware, actionable task decomposition
 */

import { z } from 'zod';

export const todoItemSchema = z.object({
  id: z.string().describe('Unique identifier, e.g. "todo-1"'),
  title: z.string().describe('Short action title'),
  description: z.string().describe('Detailed what-to-do instructions'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  effort: z.enum(['trivial', 'small', 'medium', 'large']),
  category: z.enum([
    'setup',
    'data',
    'api',
    'auth',
    'frontend',
    'backend',
    'testing',
    'devops',
    'documentation',
  ]),
  dependsOn: z
    .array(z.string())
    .default([])
    .describe('IDs of prerequisite todos that must complete first'),
  acceptanceCriteria: z.array(z.string()).describe('How to verify this todo is done'),
  filesLikelyAffected: z
    .array(z.string())
    .default([])
    .describe('File paths or patterns likely affected'),
  status: z.enum(['pending', 'in_progress', 'done', 'blocked']).default('pending'),
});

export const riskSchema = z.object({
  description: z.string(),
  mitigation: z.string(),
  severity: z.enum(['high', 'medium', 'low']),
});

export const todoPlanSchema = z.object({
  problem: z.string().describe('Original problem statement'),
  analysis: z.string().describe('Problem breakdown and reasoning'),
  todos: z.array(todoItemSchema).describe('Ordered list of actionable tasks'),
  executionOrder: z
    .array(z.string())
    .describe('Topologically sorted todo IDs respecting dependencies'),
  estimatedTotalEffort: z.string().describe('Overall effort estimate, e.g. "medium (4-6 hours)"'),
  risks: z.array(riskSchema).default([]),
});

export type TTodoItem = z.infer<typeof todoItemSchema>;
export type TRisk = z.infer<typeof riskSchema>;
export type TTodoPlan = z.infer<typeof todoPlanSchema>;

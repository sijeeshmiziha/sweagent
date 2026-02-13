/**
 * Zod schema for generate_flows tool output
 */

import { z } from 'zod';

export const flowSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  name: z.string(),
  description: z.string(),
  trigger: z.string(),
  outcome: z.string(),
});

export const flowsResultSchema = z.object({
  flows: z.array(flowSchema),
  message: z.string(),
});

export type FlowsResult = z.infer<typeof flowsResultSchema>;

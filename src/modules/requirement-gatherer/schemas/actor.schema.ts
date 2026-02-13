/**
 * Zod schema for extract_actors tool output
 */

import { z } from 'zod';

export const actorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  goals: z.array(z.string()),
});

export const actorsResultSchema = z.object({
  actors: z.array(actorSchema),
  message: z.string(),
});

export type ActorResult = z.infer<typeof actorsResultSchema>;

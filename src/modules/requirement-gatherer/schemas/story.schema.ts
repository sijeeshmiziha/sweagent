/**
 * Zod schema for generate_stories tool output
 */

import { z } from 'zod';

export const storySchema = z.object({
  id: z.string(),
  flowId: z.string(),
  actor: z.string(),
  action: z.string(),
  benefit: z.string(),
  preconditions: z.array(z.string()),
  postconditions: z.array(z.string()),
  dataInvolved: z.array(z.string()),
});

export const storiesResultSchema = z.object({
  stories: z.array(storySchema),
  message: z.string(),
});

export type StoriesResult = z.infer<typeof storiesResultSchema>;

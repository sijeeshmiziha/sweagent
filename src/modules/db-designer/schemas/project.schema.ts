/**
 * Root project schema for MongoDB database design
 */

import { z } from 'zod';
import { moduleSchema } from './module.schema';

export const projectSchema = z.object({
  projectName: z.string().describe('projectName must be in kebab-case'),
  projectDescription: z.string(),
  modules: z.array(moduleSchema),
  author: z.string().default('sijeeshmiziha'),
});

export type TBackendProjectSchema = z.infer<typeof projectSchema>;

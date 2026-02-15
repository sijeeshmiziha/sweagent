/**
 * Root project schema for MongoDB database design
 */

import { z } from 'zod';
import { moduleSchema } from './module.schema';

export const projectSchema = z.object({
  projectName: z.string().default('project').describe('projectName must be in kebab-case'),
  projectDescription: z.string().default(''),
  modules: z
    .union([z.array(moduleSchema), z.record(z.string(), z.unknown())])
    .transform(v => (Array.isArray(v) ? v : Object.values(v).map(m => moduleSchema.parse(m)))),
  author: z.string().default('sijeeshmiziha'),
});

export type TBackendProjectSchema = z.infer<typeof projectSchema>;

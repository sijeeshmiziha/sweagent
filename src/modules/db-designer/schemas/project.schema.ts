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
    .transform((v, ctx) => {
      if (Array.isArray(v)) return v;
      const results: z.infer<typeof moduleSchema>[] = [];
      for (const [key, raw] of Object.entries(v)) {
        const obj =
          typeof raw === 'object' && raw !== null ? { ...(raw as Record<string, unknown>) } : {};
        if (!obj.moduleName) obj.moduleName = key;
        const result = moduleSchema.safeParse(obj);
        if (result.success) {
          results.push(result.data);
        } else {
          for (const issue of result.error.issues) {
            ctx.addIssue({ ...issue, path: [key, ...issue.path] });
          }
        }
      }
      return results;
    }),
  author: z.string().default('sijeeshmiziha'),
});

export type TBackendProjectSchema = z.infer<typeof projectSchema>;

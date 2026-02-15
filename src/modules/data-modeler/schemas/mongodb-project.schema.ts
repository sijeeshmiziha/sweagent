/**
 * MongoDB root project schema with RBAC (merged from db-designer)
 */

import { z } from 'zod';
import { mongoModuleSchema } from './mongodb-module.schema';

export const mongoProjectSchema = z.object({
  projectName: z.string().default('project').describe('projectName must be in kebab-case'),
  projectDescription: z.string().default(''),
  modules: z
    .union([z.array(mongoModuleSchema), z.record(z.string(), z.unknown())])
    .transform((v, ctx) => {
      if (Array.isArray(v)) return v;
      const results: z.infer<typeof mongoModuleSchema>[] = [];
      for (const [key, raw] of Object.entries(v)) {
        const obj =
          typeof raw === 'object' && raw !== null ? { ...(raw as Record<string, unknown>) } : {};
        if (!obj.moduleName) obj.moduleName = key;
        const result = mongoModuleSchema.safeParse(obj);
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

export type TMongoProjectSchema = z.infer<typeof mongoProjectSchema>;

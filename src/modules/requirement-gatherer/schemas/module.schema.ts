/**
 * Zod schema for extract_modules tool output
 */

import { z } from 'zod';

export const crudApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  operation: z.enum(['create', 'read', 'readAll', 'update', 'delete']),
  description: z.string(),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
});

export const extractedModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  entity: z.string(),
  apis: z.array(crudApiSchema),
});

export const modulesResultSchema = z.object({
  modules: z.array(extractedModuleSchema),
  summary: z.object({
    totalModules: z.number(),
    totalApis: z.number(),
  }),
  message: z.string(),
});

export type ModulesResult = z.infer<typeof modulesResultSchema>;

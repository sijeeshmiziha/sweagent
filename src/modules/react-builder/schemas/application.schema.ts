/**
 * Module and root application schema
 */

import { z } from 'zod';
import { AppConfigSchema } from './app-config.schema';
import { PageSchema } from './page.schema';

export const ModuleSchema = z.object({
  name: z.string().describe('Name of the module'),
  pages: z.array(PageSchema).describe('Pages included within this module'),
});

export const ApplicationSchema = z.object({
  app: AppConfigSchema.describe('Overall application configuration'),
  modules: z
    .array(ModuleSchema)
    .describe(
      'List of modules that make up the application. Ensure all modules use every available CRUD GraphQL query and mutation from the schema.'
    ),
});

export type TApplicationSchema = z.infer<typeof ApplicationSchema>;
export type TModuleSchema = z.infer<typeof ModuleSchema>;

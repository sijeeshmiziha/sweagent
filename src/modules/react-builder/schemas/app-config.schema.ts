/**
 * App configuration schema
 */

import { z } from 'zod';
import { BrandingSchema } from './branding.schema';

export const AppConfigSchema = z.object({
  name: z.string().describe('Application name'),
  description: z.string().describe('Brief description of the application'),
  author: z
    .string()
    .describe('Author or owner of the application')
    .default('sijeeshmiziha (HubSpire)'),
  branding: BrandingSchema.describe('Branding information for the application'),
  apiEndpoint: z.url().describe("URL endpoint for the app's API calls"),
});

export type TAppConfigSchema = z.infer<typeof AppConfigSchema>;

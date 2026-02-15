/**
 * Zod schemas for Next.js application configuration
 */

import { z } from 'zod';

export const nextjsPageSchema = z.object({
  path: z.string(),
  name: z.string(),
  access: z.enum(['public', 'protected']),
  routeGroup: z.string().default(''),
  purpose: z.string(),
  hasForm: z.boolean().default(false),
  formFields: z.array(z.string()).default([]),
  dataFetching: z.enum(['server', 'client', 'hybrid']).default('server'),
  actions: z.array(z.string()).default([]),
});

export const nextjsLayoutSchema = z.object({
  name: z.string(),
  path: z.string(),
  routeGroup: z.string().default(''),
  components: z.array(z.string()).default([]),
  purpose: z.string(),
});

export const nextjsApiRouteSchema = z.object({
  path: z.string(),
  methods: z.array(z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])),
  auth: z.boolean().default(true),
  description: z.string(),
});

export const serverActionSchema = z.object({
  name: z.string(),
  module: z.string(),
  description: z.string(),
  revalidates: z.array(z.string()).default([]),
});

export const nextjsConfigSchema = z.object({
  appName: z.string(),
  pages: z.array(nextjsPageSchema),
  layouts: z.array(nextjsLayoutSchema).default([]),
  apiRoutes: z.array(nextjsApiRouteSchema).default([]),
  serverActions: z.array(serverActionSchema).default([]),
  middleware: z.array(z.string()).default([]),
  envVars: z.array(z.string()).default([]),
  packages: z.array(z.string()).default([]),
});

export type TNextjsConfig = z.infer<typeof nextjsConfigSchema>;

/**
 * Zod schemas for BackendDesign
 */

import { z } from 'zod';

export const middlewareSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  appliesTo: z.enum(['global', 'route', 'resource']),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const serviceSchema = z.object({
  name: z.string(),
  entity: z.string(),
  operations: z.array(z.string()),
  dependencies: z.array(z.string()).default([]),
});

export const routeGroupSchema = z.object({
  resource: z.string(),
  basePath: z.string(),
  endpoints: z.array(
    z.object({
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      path: z.string(),
      handler: z.string(),
      auth: z.boolean().default(true),
      roles: z.array(z.string()).default([]),
    })
  ),
});

export const backendDesignSchema = z.object({
  framework: z.enum(['express', 'apollo', 'both']),
  language: z.enum(['typescript', 'javascript']).default('typescript'),
  database: z.string(),
  services: z.array(serviceSchema),
  middleware: z.array(middlewareSchema),
  routes: z.array(routeGroupSchema).default([]),
  folderStructure: z.array(z.string()).default([]),
  envVars: z.array(z.string()).default([]),
  notes: z.string().default(''),
});

export type TBackendDesign = z.infer<typeof backendDesignSchema>;

/**
 * Zod schemas for BackendDesign
 */

import { z } from 'zod';

/** Case-insensitive enum helper */
const ciEnum = <T extends string>(values: readonly [T, ...T[]]) =>
  z
    .string()
    .transform(s => s.toLowerCase().trim())
    .pipe(z.enum(values));

export const middlewareSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  appliesTo: ciEnum(['global', 'route', 'resource']),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const serviceSchema = z.object({
  name: z.string(),
  entity: z.string(),
  operations: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
});

const httpMethodSchema = z
  .string()
  .transform(s => s.toUpperCase().trim())
  .pipe(z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']));

export const routeGroupSchema = z.object({
  resource: z.string(),
  basePath: z.string(),
  endpoints: z
    .array(
      z.object({
        method: httpMethodSchema,
        path: z.string(),
        handler: z.string(),
        auth: z.coerce.boolean().default(true),
        roles: z.array(z.string()).default([]),
      })
    )
    .default([]),
});

export const backendDesignSchema = z.object({
  framework: ciEnum(['express', 'apollo', 'both']),
  language: ciEnum(['typescript', 'javascript']).default('typescript'),
  database: z.string().default('mongodb'),
  services: z.array(serviceSchema).default([]),
  middleware: z.array(middlewareSchema).default([]),
  routes: z.array(routeGroupSchema).default([]),
  folderStructure: z.array(z.string()).default([]),
  envVars: z.array(z.string()).default([]),
  notes: z.string().default(''),
});

export type TBackendDesign = z.infer<typeof backendDesignSchema>;

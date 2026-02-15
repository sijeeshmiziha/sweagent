/**
 * Zod schemas for Express app configuration
 */

import { z } from 'zod';

const httpMethodSchema = z
  .string()
  .transform(s => s.toUpperCase().trim())
  .pipe(z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']));

export const controllerMethodSchema = z.object({
  name: z.string(),
  httpMethod: httpMethodSchema,
  path: z.string(),
  auth: z.coerce.boolean().default(true),
  roles: z.array(z.string()).default([]),
  validation: z.string().default(''),
  description: z.string().default(''),
});

export const controllerSchema = z.object({
  name: z.string(),
  resource: z.string(),
  basePath: z.string(),
  methods: z.array(controllerMethodSchema).default([]),
});

export const modelFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.coerce.boolean().default(false),
  unique: z.coerce.boolean().default(false),
  ref: z.string().optional(),
  default: z.string().optional(),
});

export const modelSchema = z.object({
  name: z.string(),
  collection: z.string(),
  fields: z.array(modelFieldSchema).default([]),
  timestamps: z.coerce.boolean().default(true),
  indexes: z.array(z.string()).default([]),
});

/** Case-insensitive enum */
const ciEnum = <T extends string>(values: readonly [T, ...T[]]) =>
  z
    .string()
    .transform(s => s.toLowerCase().trim())
    .pipe(z.enum(values));

export const middlewareConfigSchema = z.object({
  name: z.string(),
  type: ciEnum(['auth', 'validation', 'errorHandler', 'cors', 'rateLimit', 'logging', 'custom']),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const expressConfigSchema = z.object({
  appName: z.string().default('app'),
  port: z.number().default(3000),
  database: z.string().default('mongodb'),
  controllers: z.array(controllerSchema).default([]),
  models: z.array(modelSchema).default([]),
  middleware: z.array(middlewareConfigSchema).default([]),
  envVars: z.array(z.string()).default([]),
  folderStructure: z.array(z.string()).default([]),
});

export type TExpressConfig = z.infer<typeof expressConfigSchema>;

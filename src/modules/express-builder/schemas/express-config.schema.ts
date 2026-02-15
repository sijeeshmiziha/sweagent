/**
 * Zod schemas for Express app configuration
 */

import { z } from 'zod';

export const controllerMethodSchema = z.object({
  name: z.string(),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  path: z.string(),
  auth: z.boolean().default(true),
  roles: z.array(z.string()).default([]),
  validation: z.string().default(''),
  description: z.string().default(''),
});

export const controllerSchema = z.object({
  name: z.string(),
  resource: z.string(),
  basePath: z.string(),
  methods: z.array(controllerMethodSchema),
});

export const modelFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  ref: z.string().optional(),
  default: z.string().optional(),
});

export const modelSchema = z.object({
  name: z.string(),
  collection: z.string(),
  fields: z.array(modelFieldSchema),
  timestamps: z.boolean().default(true),
  indexes: z.array(z.string()).default([]),
});

export const middlewareConfigSchema = z.object({
  name: z.string(),
  type: z.enum(['auth', 'validation', 'errorHandler', 'cors', 'rateLimit', 'logging', 'custom']),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const expressConfigSchema = z.object({
  appName: z.string(),
  port: z.number().default(3000),
  database: z.string().default('mongodb'),
  controllers: z.array(controllerSchema),
  models: z.array(modelSchema).default([]),
  middleware: z.array(middlewareConfigSchema).default([]),
  envVars: z.array(z.string()).default([]),
  folderStructure: z.array(z.string()).default([]),
});

export type TExpressConfig = z.infer<typeof expressConfigSchema>;

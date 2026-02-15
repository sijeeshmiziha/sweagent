/**
 * Zod schemas for Express app configuration
 */

import { z } from 'zod';

const httpMethodSchema = z
  .string()
  .transform(s => s.toUpperCase().trim())
  .pipe(z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']));

export const routerMethodSchema = z.object({
  name: z.string(),
  httpMethod: httpMethodSchema,
  path: z.string(),
  auth: z.coerce.boolean().default(true),
  roles: z.array(z.string()).default([]),
  validation: z.string().default(''),
  description: z.string().default(''),
});

export const routerSchema = z.object({
  name: z.string(),
  resource: z.string(),
  basePath: z.string(),
  methods: z.array(routerMethodSchema).default([]),
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

export const middlewareConfigSchema = z.object({
  name: z.string(),
  type: z
    .string()
    .transform(s => {
      const n = s.toLowerCase().replace(/[\s_-]+/g, '');
      if (['auth', 'authentication', 'jwt', 'token'].includes(n)) return 'auth' as const;
      if (['validation', 'validate', 'validator', 'input'].includes(n))
        return 'validation' as const;
      if (['errorhandler', 'error', 'errorhandling', 'errors'].includes(n))
        return 'errorHandler' as const;
      if (['cors', 'crossorigin'].includes(n)) return 'cors' as const;
      if (['ratelimit', 'ratelimiter', 'ratelimiting', 'throttle'].includes(n))
        return 'rateLimit' as const;
      if (['logging', 'logger', 'log', 'morgan'].includes(n)) return 'logging' as const;
      return 'custom' as const;
    })
    .pipe(z.enum(['auth', 'validation', 'errorHandler', 'cors', 'rateLimit', 'logging', 'custom'])),
  config: z.record(z.string(), z.unknown()).default({}),
});

export const expressConfigSchema = z.object({
  appName: z.string().default('app'),
  port: z.number().default(3000),
  database: z.string().default('mongodb'),
  routers: z.array(routerSchema).default([]),
  models: z.array(modelSchema).default([]),
  middleware: z.array(middlewareConfigSchema).default([]),
  envVars: z.array(z.string()).default([]),
});

export type TExpressConfig = z.infer<typeof expressConfigSchema>;

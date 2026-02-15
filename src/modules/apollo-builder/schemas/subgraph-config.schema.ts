/**
 * Zod schemas for Apollo subgraph configuration
 */

import { z } from 'zod';

/** Case-insensitive enum */
const ciEnum = <T extends string>(values: readonly [T, ...T[]]) =>
  z
    .string()
    .transform(s => s.toLowerCase().trim())
    .pipe(z.enum(values));

export const graphqlFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  nullable: z.coerce.boolean().default(false),
  isList: z.coerce.boolean().default(false),
  description: z.string().default(''),
});

export const graphqlTypeSchema = z.object({
  name: z.string(),
  kind: ciEnum(['type', 'input', 'enum', 'interface', 'union']),
  fields: z.array(graphqlFieldSchema).default([]),
  values: z.array(z.string()).default([]),
  description: z.string().default(''),
});

export const resolverOperationSchema = z.object({
  name: z.string(),
  type: ciEnum(['query', 'mutation', 'subscription']),
  args: z.array(graphqlFieldSchema).default([]),
  returnType: z.string(),
  auth: z.coerce.boolean().default(true),
  roles: z.array(z.string()).default([]),
  description: z.string().default(''),
});

export const subgraphModuleSchema = z.object({
  name: z.string(),
  entity: z.string(),
  types: z.array(graphqlTypeSchema).default([]),
  operations: z.array(resolverOperationSchema).default([]),
  datasource: z.string().default(''),
});

export const subgraphConfigSchema = z.object({
  appName: z.string().default('app'),
  port: z.number().default(4000),
  database: z.string().default('mongodb'),
  modules: z.array(subgraphModuleSchema).default([]),
  sharedTypes: z.array(graphqlTypeSchema).default([]),
  authDirective: z.coerce.boolean().default(true),
  envVars: z.array(z.string()).default([]),
});

export type TSubgraphConfig = z.infer<typeof subgraphConfigSchema>;

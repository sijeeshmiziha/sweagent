/**
 * Zod schemas for Apollo subgraph configuration
 */

import { z } from 'zod';

export const graphqlFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  nullable: z.boolean().default(false),
  isList: z.boolean().default(false),
  description: z.string().default(''),
});

export const graphqlTypeSchema = z.object({
  name: z.string(),
  kind: z.enum(['type', 'input', 'enum', 'interface', 'union']),
  fields: z.array(graphqlFieldSchema).default([]),
  values: z.array(z.string()).default([]),
  description: z.string().default(''),
});

export const resolverOperationSchema = z.object({
  name: z.string(),
  type: z.enum(['query', 'mutation', 'subscription']),
  args: z.array(graphqlFieldSchema).default([]),
  returnType: z.string(),
  auth: z.boolean().default(true),
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
  appName: z.string(),
  port: z.number().default(4000),
  database: z.string().default('mongodb'),
  modules: z.array(subgraphModuleSchema),
  sharedTypes: z.array(graphqlTypeSchema).default([]),
  authDirective: z.boolean().default(true),
  envVars: z.array(z.string()).default([]),
});

export type TSubgraphConfig = z.infer<typeof subgraphConfigSchema>;

/**
 * Zod schemas for ApiDesign, RestEndpoint, GraphqlTypeDefinition, GraphqlOperation
 * Uses coercion so LLM output (e.g. "GET" vs "get", "true" vs true) still validates.
 */

import { z } from 'zod';

const httpMethodSchema = z
  .union([z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']), z.string()])
  .transform(s => (typeof s === 'string' ? s.toUpperCase() : s))
  .pipe(z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']));

const optionalStringRecordSchema = z
  .record(z.string(), z.unknown())
  .optional()
  .default({})
  .transform(m =>
    Object.fromEntries(
      Object.entries(m ?? {}).map(([k, v]) => [k, typeof v === 'string' ? v : String(v)])
    )
  );

export const restEndpointSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  method: httpMethodSchema,
  path: z.string(),
  description: z.string(),
  auth: z.coerce.boolean(),
  roles: z.array(z.string()).default([]),
  requestBody: optionalStringRecordSchema,
  responseBody: optionalStringRecordSchema,
  queryParams: optionalStringRecordSchema,
});

export const restApiDesignSchema = z.object({
  baseUrl: z.string().default('/api/v1'),
  endpoints: z.array(restEndpointSchema).default([]),
});

export const graphqlTypeFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
});

const graphqlKindSchema = z
  .union([z.enum(['type', 'input', 'enum']), z.string()])
  .transform(s => (typeof s === 'string' ? s.toLowerCase() : s))
  .pipe(z.enum(['type', 'input', 'enum']));

export const graphqlTypeDefinitionSchema = z.object({
  name: z.string(),
  kind: graphqlKindSchema,
  fields: z.array(graphqlTypeFieldSchema),
});

export const graphqlOperationArgSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.coerce.boolean(),
});

export const graphqlOperationSchema = z.object({
  name: z.string(),
  moduleId: z.string(),
  description: z.string(),
  auth: z.coerce.boolean(),
  roles: z.array(z.string()).default([]),
  args: z.array(graphqlOperationArgSchema),
  returnType: z.string(),
});

export const graphqlApiDesignSchema = z.object({
  types: z.array(graphqlTypeDefinitionSchema).default([]),
  queries: z.array(graphqlOperationSchema).default([]),
  mutations: z.array(graphqlOperationSchema).default([]),
});

const apiStyleSchema = z
  .union([z.enum(['rest', 'graphql']), z.string()])
  .transform(s => (typeof s === 'string' ? s.toLowerCase() : s))
  .pipe(z.enum(['rest', 'graphql']));

export const apiDesignSchema = z.object({
  style: apiStyleSchema,
  rest: restApiDesignSchema.optional(),
  graphql: graphqlApiDesignSchema.optional(),
});

export type RestEndpoint = z.infer<typeof restEndpointSchema>;
export type RestApiDesign = z.infer<typeof restApiDesignSchema>;
export type GraphqlTypeDefinition = z.infer<typeof graphqlTypeDefinitionSchema>;
export type GraphqlOperation = z.infer<typeof graphqlOperationSchema>;
export type GraphqlApiDesign = z.infer<typeof graphqlApiDesignSchema>;
export type ApiDesign = z.infer<typeof apiDesignSchema>;

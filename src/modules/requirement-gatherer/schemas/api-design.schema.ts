/**
 * Zod schemas for ApiDesign, RestEndpoint, GraphqlTypeDefinition, GraphqlOperation
 */

import { z } from 'zod';

export const restEndpointSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  path: z.string(),
  description: z.string(),
  auth: z.boolean(),
  roles: z.array(z.string()),
  requestBody: z.record(z.string(), z.string()).optional(),
  responseBody: z.record(z.string(), z.string()).optional(),
  queryParams: z.record(z.string(), z.string()).optional(),
});

export const restApiDesignSchema = z.object({
  baseUrl: z.string(),
  endpoints: z.array(restEndpointSchema),
});

export const graphqlTypeFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
});

export const graphqlTypeDefinitionSchema = z.object({
  name: z.string(),
  kind: z.enum(['type', 'input', 'enum']),
  fields: z.array(graphqlTypeFieldSchema),
});

export const graphqlOperationArgSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
});

export const graphqlOperationSchema = z.object({
  name: z.string(),
  moduleId: z.string(),
  description: z.string(),
  auth: z.boolean(),
  roles: z.array(z.string()),
  args: z.array(graphqlOperationArgSchema),
  returnType: z.string(),
});

export const graphqlApiDesignSchema = z.object({
  types: z.array(graphqlTypeDefinitionSchema),
  queries: z.array(graphqlOperationSchema),
  mutations: z.array(graphqlOperationSchema),
});

export const apiDesignSchema = z.object({
  style: z.enum(['rest', 'graphql']),
  rest: restApiDesignSchema.optional(),
  graphql: graphqlApiDesignSchema.optional(),
});

export type RestEndpoint = z.infer<typeof restEndpointSchema>;
export type RestApiDesign = z.infer<typeof restApiDesignSchema>;
export type GraphqlTypeDefinition = z.infer<typeof graphqlTypeDefinitionSchema>;
export type GraphqlOperation = z.infer<typeof graphqlOperationSchema>;
export type GraphqlApiDesign = z.infer<typeof graphqlApiDesignSchema>;
export type ApiDesign = z.infer<typeof apiDesignSchema>;

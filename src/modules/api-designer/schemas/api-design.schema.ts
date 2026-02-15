/**
 * Zod schemas for ApiDesign
 */

import { z } from 'zod';

const httpMethodSchema = z
  .union([z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']), z.string()])
  .transform(s => (typeof s === 'string' ? s.toUpperCase() : s))
  .pipe(z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']));

const stringRecordSchema = z
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
  resource: z.string(),
  method: httpMethodSchema,
  path: z.string(),
  description: z.string(),
  auth: z.coerce.boolean(),
  roles: z.array(z.string()).default([]),
  requestBody: stringRecordSchema,
  responseBody: stringRecordSchema,
  queryParams: stringRecordSchema,
  validation: z.array(z.string()).default([]),
  errorResponses: z.array(z.string()).default([]),
});

export const graphqlOperationSchema = z.object({
  name: z.string(),
  type: z.enum(['query', 'mutation', 'subscription']),
  description: z.string(),
  auth: z.coerce.boolean(),
  roles: z.array(z.string()).default([]),
  args: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      required: z.coerce.boolean(),
    })
  ),
  returnType: z.string(),
});

const apiStyleSchema = z
  .union([z.enum(['rest', 'graphql']), z.string()])
  .transform(s => (typeof s === 'string' ? s.toLowerCase() : s))
  .pipe(z.enum(['rest', 'graphql']));

export const apiDesignSchema = z.object({
  style: apiStyleSchema,
  baseUrl: z.string().default('/api/v1'),
  endpoints: z.array(restEndpointSchema).default([]),
  graphqlOperations: z.array(graphqlOperationSchema).default([]),
});

export type TApiDesign = z.infer<typeof apiDesignSchema>;

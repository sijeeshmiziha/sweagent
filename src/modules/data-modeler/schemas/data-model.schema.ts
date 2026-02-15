/**
 * Zod schemas for DataModelDesign
 */

import { z } from 'zod';

export const entityFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean(),
  unique: z.boolean(),
  description: z.string(),
  default: z.string().optional(),
});

export const entityIndexSchema = z.object({
  name: z.string(),
  fields: z.array(z.string()),
  unique: z.boolean(),
});

export const entityRelationSchema = z.object({
  field: z.string(),
  references: z.string(),
  type: z.enum(['1:1', '1:N', 'M:N']),
  description: z.string(),
});

export const dataEntitySchema = z.object({
  name: z.string(),
  description: z.string(),
  fields: z.array(entityFieldSchema),
  indexes: z.array(entityIndexSchema),
  relations: z.array(entityRelationSchema),
});

export const dataModelDesignSchema = z.object({
  type: z.enum(['mongodb', 'postgresql']),
  reasoning: z.string(),
  entities: z.array(dataEntitySchema),
});

export type TDataModelDesign = z.infer<typeof dataModelDesignSchema>;

/**
 * Zod schemas for DatabaseDesign, DatabaseEntity, EntityField, EntityIndex, EntityRelation
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
  description: z.string(),
});

export const databaseEntitySchema = z.object({
  name: z.string(),
  description: z.string(),
  fields: z.array(entityFieldSchema),
  indexes: z.array(entityIndexSchema),
  relations: z.array(entityRelationSchema),
});

export const databaseDesignSchema = z.object({
  type: z.enum(['mongodb', 'postgresql']),
  reasoning: z.string(),
  entities: z.array(databaseEntitySchema),
});

export type EntityField = z.infer<typeof entityFieldSchema>;
export type EntityIndex = z.infer<typeof entityIndexSchema>;
export type EntityRelation = z.infer<typeof entityRelationSchema>;
export type DatabaseEntity = z.infer<typeof databaseEntitySchema>;
export type DatabaseDesign = z.infer<typeof databaseDesignSchema>;

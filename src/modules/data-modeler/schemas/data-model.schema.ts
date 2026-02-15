/**
 * Zod schemas for DataModelDesign
 */

import { z } from 'zod';

export const entityFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.coerce.boolean().default(false),
  unique: z.coerce.boolean().default(false),
  description: z.string().default(''),
  default: z.string().optional(),
});

export const entityIndexSchema = z.object({
  name: z.string().default(''),
  fields: z.array(z.string()).default([]),
  unique: z.coerce.boolean().default(false),
});

/** Normalize common relation type variants to canonical form. */
const relationTypeSchema = z
  .string()
  .transform(s => {
    const n = s.toLowerCase().replace(/[\s_-]+/g, '');
    if (['1:1', 'onetoone'].includes(n)) return '1:1' as const;
    if (['1:n', '1:m', 'n:1', 'onetomany', 'manytoone'].includes(n)) return '1:N' as const;
    if (['m:n', 'n:m', 'manytomany'].includes(n)) return 'M:N' as const;
    return s;
  })
  .pipe(z.enum(['1:1', '1:N', 'M:N']));

export const entityRelationSchema = z.object({
  field: z.string(),
  references: z.string(),
  type: relationTypeSchema,
  description: z.string().default(''),
});

export const dataEntitySchema = z.object({
  name: z.string(),
  description: z.string().default(''),
  fields: z
    .union([z.array(entityFieldSchema), z.record(z.string(), z.unknown())])
    .transform(v => (Array.isArray(v) ? v : Object.values(v).map(f => entityFieldSchema.parse(f)))),
  indexes: z.array(entityIndexSchema).default([]),
  relations: z.array(entityRelationSchema).default([]),
});

/** Case-insensitive database type */
const dbTypeSchema = z
  .string()
  .transform(s => s.toLowerCase().trim())
  .pipe(z.enum(['mongodb', 'postgresql']));

export const dataModelDesignSchema = z.object({
  type: dbTypeSchema,
  reasoning: z.string().default(''),
  entities: z.array(dataEntitySchema).default([]),
});

export type TDataModelDesign = z.infer<typeof dataModelDesignSchema>;

/**
 * MongoDB field-level schema (merged from db-designer)
 */

import { z } from 'zod';

export const mongoFieldSchema = z.object({
  fieldName: z.string().describe('fieldName must be in camelCase'),
  fieldType: z
    .string()
    .default('string')
    .transform(s => {
      const n = s.toLowerCase().trim();
      if (['string', 'text', 'varchar'].includes(n)) return 'string' as const;
      if (['number', 'int', 'integer', 'float', 'double', 'decimal'].includes(n))
        return 'number' as const;
      if (['boolean', 'bool'].includes(n)) return 'boolean' as const;
      if (['types.objectid', 'objectid', 'ref', 'reference'].includes(n))
        return 'Types.ObjectId' as const;
      if (['date', 'datetime', 'timestamp'].includes(n)) return 'Date' as const;
      if (['object', 'json', 'mixed'].includes(n)) return 'object' as const;
      if (['email'].includes(n)) return 'email' as const;
      if (['password', 'hash'].includes(n)) return 'password' as const;
      if (['enum', 'select'].includes(n)) return 'enum' as const;
      if (['array'].includes(n)) return 'string' as const;
      return 'string' as const;
    })
    .pipe(
      z.enum([
        'string',
        'number',
        'boolean',
        'Types.ObjectId',
        'Date',
        'object',
        'email',
        'password',
        'enum',
      ])
    ),
  isArray: z.coerce.boolean().default(false),
  isRequired: z.coerce.boolean().default(true),
  isUnique: z.coerce.boolean().default(false),
  values: z
    .array(z.string())
    .default([])
    .describe('Enum values if fieldType is enum, else empty array'),
  defaultVal: z.union([z.string(), z.boolean(), z.number(), z.null()]).optional(),
  relationTo: z.string().optional().describe('Module name for relations'),
  relationType: z
    .string()
    .transform(s => {
      const n = s.toLowerCase().replace(/[\s_]+/g, '-');
      if (['one-to-one', '1:1', '1-to-1'].includes(n)) return 'one-to-one' as const;
      if (['many-to-one', 'n:1', 'n-to-1', 'many-to-1', '*:1'].includes(n))
        return 'many-to-one' as const;
      return '' as const;
    })
    .pipe(z.enum(['one-to-one', 'many-to-one', '']))
    .optional(),
  isPrivate: z.coerce.boolean().default(false).describe('True if password field, else false'),
});

export type TMongoFieldSchema = z.infer<typeof mongoFieldSchema>;

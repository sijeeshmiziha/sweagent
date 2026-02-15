/**
 * Field-level schema for MongoDB collection fields
 */

import { z } from 'zod';

export const fieldSchema = z.object({
  fieldName: z.string().describe('fieldName must be in camelCase'),
  fieldType: z
    .enum([
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
    .default('string'),
  isArray: z.coerce.boolean().default(false),
  isRequired: z.coerce.boolean().default(true),
  isUnique: z.coerce.boolean().default(false),
  values: z
    .array(z.string())
    .default([])
    .describe('Enum values if fieldType is enum, else empty array'),
  defaultVal: z.union([z.string(), z.boolean(), z.number(), z.null()]).optional(),
  relationTo: z.string().optional().describe('Module name for relations'),
  relationType: z.enum(['one-to-one', 'many-to-one', '']).optional(),
  isPrivate: z.coerce.boolean().default(false).describe('True if password field, else false'),
});

export type TFieldSchema = z.infer<typeof fieldSchema>;

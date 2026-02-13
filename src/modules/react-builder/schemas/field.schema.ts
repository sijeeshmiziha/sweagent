/**
 * Form field, validation, options, and column schemas
 */

import { z } from 'zod';

export const ValidationSchema = z.object({
  minLength: z.number().optional().describe('Minimum length requirement'),
  zodString: z.string().describe('Raw Zod string validation (e.g. regex)'),
});

export const FieldOptionsSchema = z.object({
  hookName: z.string().optional().describe('Name of the hook for dynamic field options'),
  queryString: z.string().optional().describe('Optional query string for fetching field options'),
  labelKey: z.string().optional().describe('Key used as label when displaying options'),
  valueKey: z.string().optional().describe('Key used as value for a field when selecting options'),
  values: z.array(z.string()).optional().describe('Static list of possible field values'),
});

export const FormFieldSchema = z.object({
  name: z.string().describe("The field's key or identifier"),
  type: z
    .enum([
      'text',
      'email',
      'password',
      'number',
      'multiSelect',
      'textarea',
      'hidden',
      'select',
      'date',
      'image',
    ])
    .describe(
      'Type of input field. If it has options, it should not be "hidden". If the field is required, it should not be hidden unless it serves as the current user.'
    ),
  required: z.boolean().optional().describe('Whether this field must be filled'),
  validation: ValidationSchema.optional().describe('Optional field validation requirements'),
  defaultValue: z
    .union([z.string(), z.number(), z.boolean()])
    .optional()
    .describe('Default value can be string, number, or boolean'),
  options: FieldOptionsSchema.optional().describe('Additional dynamic or static options for this field'),
});

export const ColumnSchema = z.object({
  field: z.string().describe('Key or name of the data field in the table'),
  label: z.string().describe('User-friendly label to show on the table header'),
});

export type TFormFieldSchema = z.infer<typeof FormFieldSchema>;
export type TColumnSchema = z.infer<typeof ColumnSchema>;

/**
 * Module (collection) level schema for MongoDB
 */

import { z } from 'zod';
import { fieldSchema } from './field.schema';

export const moduleSchema = z.object({
  moduleName: z.string().describe('camelCase, single word, never auth/authentication'),
  isUserModule: z.coerce.boolean().default(false),
  authMethod: z.enum(['EMAIL_AND_PASSWORD', 'PHONE_AND_OTP', '']).optional(),
  emailField: z.string().optional(),
  passwordField: z.string().optional(),
  phoneField: z.string().optional(),
  roleField: z.string().optional(),
  permissions: z
    .record(z.string(), z.array(z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE'])))
    .optional()
    .describe('Permissions per role'),
  fields: z
    .union([z.array(fieldSchema), z.record(z.string(), z.unknown())])
    .transform(v => (Array.isArray(v) ? v : Object.values(v).map(f => fieldSchema.parse(f)))),
});

export type TModuleSchema = z.infer<typeof moduleSchema>;

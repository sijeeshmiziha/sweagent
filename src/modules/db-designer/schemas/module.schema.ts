/**
 * Module (collection) level schema for MongoDB
 */

import { z } from 'zod';
import { fieldSchema } from './field.schema';

export const moduleSchema = z.object({
  moduleName: z.string().describe('camelCase, single word, never auth/authentication'),
  isUserModule: z.boolean(),
  authMethod: z.enum(['EMAIL_AND_PASSWORD', 'PHONE_AND_OTP', '']).optional(),
  emailField: z.string().optional(),
  passwordField: z.string().optional(),
  phoneField: z.string().optional(),
  roleField: z.string().optional(),
  permissions: z
    .record(z.string(), z.array(z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE'])))
    .optional()
    .describe('Permissions per role'),
  fields: z.array(fieldSchema),
});

export type TModuleSchema = z.infer<typeof moduleSchema>;

/**
 * Module (collection) level schema for MongoDB
 */

import { z } from 'zod';
import { fieldSchema } from './field.schema';

export const moduleSchema = z.object({
  moduleName: z.string().describe('camelCase, single word, never auth/authentication'),
  isUserModule: z.coerce.boolean().default(false),
  authMethod: z
    .string()
    .transform(s => {
      const n = s.toUpperCase().replace(/[\s-]+/g, '_');
      if (['EMAIL_AND_PASSWORD', 'EMAIL_PASSWORD', 'EMAIL'].includes(n))
        return 'EMAIL_AND_PASSWORD' as const;
      if (['PHONE_AND_OTP', 'PHONE_OTP', 'PHONE', 'SMS'].includes(n))
        return 'PHONE_AND_OTP' as const;
      return '' as const;
    })
    .pipe(z.enum(['EMAIL_AND_PASSWORD', 'PHONE_AND_OTP', '']))
    .optional(),
  emailField: z.string().optional(),
  passwordField: z.string().optional(),
  phoneField: z.string().optional(),
  roleField: z.string().optional(),
  permissions: z
    .record(z.string(), z.array(z.enum(['CREATE', 'READ', 'UPDATE', 'DELETE'])))
    .optional()
    .describe('Permissions per role'),
  fields: z.union([z.array(fieldSchema), z.record(z.string(), z.unknown())]).transform((v, ctx) => {
    if (Array.isArray(v)) return v;
    const results: z.infer<typeof fieldSchema>[] = [];
    for (const [key, raw] of Object.entries(v)) {
      const obj =
        typeof raw === 'object' && raw !== null ? { ...(raw as Record<string, unknown>) } : {};
      if (!obj.fieldName) obj.fieldName = key;
      const result = fieldSchema.safeParse(obj);
      if (result.success) {
        results.push(result.data);
      } else {
        for (const issue of result.error.issues) {
          ctx.addIssue({ ...issue, path: [key, ...issue.path] });
        }
      }
    }
    return results;
  }),
});

export type TModuleSchema = z.infer<typeof moduleSchema>;

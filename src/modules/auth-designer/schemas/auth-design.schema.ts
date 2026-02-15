/**
 * Zod schemas for AuthDesign
 */

import { z } from 'zod';

export const authFlowStepSchema = z.object({
  order: z.number(),
  side: z.enum(['frontend', 'backend']),
  action: z.string(),
  details: z.string(),
});

export const authFlowSchema = z.object({
  name: z.string(),
  description: z.string(),
  steps: z.array(authFlowStepSchema),
});

export const authMiddlewareSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  behavior: z.array(z.string()),
});

export const roleDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  permissions: z.array(z.string()),
});

export const securityPolicySchema = z.object({
  area: z.string(),
  rules: z.array(z.string()),
});

export const authDesignSchema = z.object({
  strategy: z.enum(['jwt', 'session', 'oauth']),
  flows: z.array(authFlowSchema),
  middleware: z.array(authMiddlewareSchema),
  roles: z.array(roleDefinitionSchema),
  policies: z.array(securityPolicySchema),
});

export type TAuthDesign = z.infer<typeof authDesignSchema>;

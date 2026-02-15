/**
 * Zod schemas for FrontendDesign
 */

import { z } from 'zod';

export const formFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.coerce.boolean(),
  validation: z.string(),
});

export const pageDesignSchema = z.object({
  path: z.string(),
  name: z.string(),
  access: z
    .string()
    .transform(s => s.toLowerCase().trim())
    .pipe(z.enum(['public', 'protected'])),
  purpose: z.string(),
  formFields: z.array(formFieldSchema).default([]),
  actions: z.array(z.string()).default([]),
  emptyState: z.string().default(''),
  errorState: z.string().default(''),
  redirectOnSuccess: z.string().default(''),
  keyUiElements: z.array(z.string()).default([]),
});

export const componentDesignSchema = z.object({
  name: z.string(),
  type: z
    .string()
    .transform(s => s.toLowerCase().trim())
    .pipe(z.enum(['layout', 'shared', 'form', 'display', 'navigation'])),
  purpose: z.string(),
  props: z.array(z.string()).default([]),
  usedIn: z.array(z.string()).default([]),
});

export const frontendDesignSchema = z.object({
  pages: z.array(pageDesignSchema).default([]),
  components: z.array(componentDesignSchema).default([]),
  stateManagement: z.string().default(''),
  routingNotes: z.string().default(''),
});

export type TFrontendDesign = z.infer<typeof frontendDesignSchema>;

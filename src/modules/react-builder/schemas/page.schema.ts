/**
 * API, drawer, auth page, listing page, and page union schemas
 */

import { z } from 'zod';
import { FormFieldSchema, ColumnSchema } from './field.schema';

export const ApiResponseTypeSchema = z
  .object({
    type: z.string().describe("Indicates the response type (e.g., 'object')"),
    properties: z
      .record(
        z.string(),
        z.object({
          type: z.string().describe('Property type as returned by the API'),
        })
      )
      .describe('Key-value record describing each field in the response'),
  })
  .optional()
  .describe('Describes the expected structure of an API response');

export type TApiResponseTypeSchema = z.infer<typeof ApiResponseTypeSchema>;

export const ListingPageApiSchema = z.object({
  type: z
    .enum(['list', 'create', 'update', 'delete', 'getById'])
    .describe('Type of API call for CRUD operations'),
  graphqlHook: z
    .string()
    .describe('Name of the GraphQL hook (e.g. useGetAllUserQuery, useCreateUserMutation)'),
  queryString: z.string().describe('Actual GraphQL query string'),
  responseType: ApiResponseTypeSchema.describe(
    'Optional schema describing shape of the API response'
  ),
});

export const AuthPageApiSchema = z.object({
  type: z
    .enum(['login', 'currentUser', 'forgotPassword', 'resetPassword'])
    .describe('Type of API call'),
  graphqlHook: z.string().describe('Name of the GraphQL hook (e.g. useLoginMutation)'),
  queryString: z.string().describe('Actual GraphQL query string'),
  responseType: ApiResponseTypeSchema.describe(
    'Optional schema describing shape of the API response'
  ),
});

export const DrawerSchema = z.object({
  title: z.string().describe('Title displayed on the drawer'),
  graphqlHook: z
    .string()
    .describe('Name of the GraphQL hook (e.g. useCreateUserMutation, useDeleteOneUserMutation)'),
  fields: z.array(FormFieldSchema).describe('List of fields displayed within the drawer'),
});

export const AuthPageSchema = z.object({
  name: z
    .enum(['LoginPage', 'ForgotPasswordPage', 'ResetPasswordPage'])
    .describe('Internal name of the auth page'),
  type: z
    .enum(['EmailPassword', 'ForgotPassword', 'ResetPassword'])
    .describe('Type of authentication page'),
  route: z.string().describe("URL route for this page (e.g., '/login')"),
  isPrivate: z.boolean().describe('Whether this page requires an authenticated session'),
  api: z.array(AuthPageApiSchema).describe('List of API calls involved in this page'),
  fields: z
    .array(FormFieldSchema)
    .optional()
    .describe('Optional form fields needed on this auth page'),
});

export const ListingPageSchema = z.object({
  type: z.literal('Listing').describe('Indicates that this page is a listing-type page'),
  name: z.string().describe('Internal name of the listing page'),
  route: z.string().describe('URL route for this listing page'),
  isPrivate: z.boolean().describe('Whether this page is private (requires auth)'),
  api: z.array(ListingPageApiSchema).describe('List of API calls that power this listing page'),
  columns: z.array(ColumnSchema).describe('Table columns displayed on the listing page'),
  actions: z
    .array(z.string())
    .describe('List of possible actions on each row (e.g., create, edit, delete, view)'),
  drawerCreate: DrawerSchema.describe('Drawer configuration for creating new records'),
  drawerUpdate: DrawerSchema.describe('Drawer configuration for editing existing records'),
});

export const PageSchema = z.discriminatedUnion('type', [AuthPageSchema, ListingPageSchema]);

export type TPageSchema = z.infer<typeof PageSchema>;

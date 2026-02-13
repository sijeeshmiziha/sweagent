/**
 * Branding schema for frontend app config
 */

import { z } from 'zod';

export const BrandingSchema = z.object({
  brandName: z.string().describe("The brand's display name"),
  primaryColor: z.string().describe("The brand's primary color code (e.g., #FFFFFF)"),
  secondaryColor: z.string().describe("The brand's secondary color code (e.g., #000000)"),
  logo: z.url().describe("URL pointing to the brand's logo"),
});

export type TBrandingSchema = z.infer<typeof BrandingSchema>;

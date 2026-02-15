/**
 * Template engine - Handlebars-based project scaffolding
 */

export { compileTemplate, scaffoldProject, registerHelpers } from './compiler';
export type {
  TemplateContext,
  TemplateModule,
  TemplateField,
  TemplateOperation,
  TemplateAuth,
  TemplateBranding,
  ScaffoldConfig,
  ScaffoldResult,
  ScaffoldError,
} from './types';

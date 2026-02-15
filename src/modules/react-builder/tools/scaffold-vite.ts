/**
 * scaffold_vite tool - compiles .ref/templates/vite/ with ApplicationSchema config
 */

import * as path from 'node:path';
import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { scaffoldProject } from '../../../lib/template-engine';
import type { ScaffoldResult, TemplateContext } from '../../../lib/template-engine';
import type { TApplicationSchema } from '../schemas';
import { safeJsonParse } from '../../../lib/utils';

/** Convert ApplicationSchema config to template context */
function toTemplateContext(config: TApplicationSchema): TemplateContext {
  return {
    appName: config.app.name,
    description: config.app.description,
    apiEndpoint: config.app.apiEndpoint,
    branding: {
      brandName: config.app.branding.brandName,
      primaryColor: config.app.branding.primaryColor,
      secondaryColor: config.app.branding.secondaryColor,
      logo: config.app.branding.logo,
    },
    modules: config.modules.map(m => ({
      name: m.name,
      pascalName: m.name.charAt(0).toUpperCase() + m.name.slice(1),
      camelName: m.name.charAt(0).toLowerCase() + m.name.slice(1),
    })),
    author: config.app.author,
    pages: config.modules.flatMap(m => m.pages),
  };
}

export const scaffoldViteTool = defineTool({
  name: 'scaffold_vite',
  description:
    'Scaffold a Vite + React project from a validated ApplicationSchema config. Compiles Handlebars templates from .ref/templates/vite/ and writes the project to the output directory.',
  input: z.object({
    config: z.string().describe('JSON string of the validated ApplicationSchema config'),
    outputDir: z.string().describe('Absolute path to the output directory'),
  }),
  handler: async ({ config, outputDir }): Promise<ScaffoldResult> => {
    const parsed = safeJsonParse(config, 'application schema config') as TApplicationSchema;
    const templateDir = path.resolve(process.cwd(), '.ref/templates/vite');
    const context = toTemplateContext(parsed);

    return scaffoldProject({
      templateDir,
      outputDir,
      context,
    });
  },
});

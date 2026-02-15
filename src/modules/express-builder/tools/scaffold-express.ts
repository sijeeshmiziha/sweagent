/**
 * scaffold_express tool - compiles .ref/templates/express/ with config
 */

import * as path from 'node:path';
import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { scaffoldProject } from '../../../lib/template-engine';
import type { ScaffoldResult } from '../../../lib/template-engine';
import type { TemplateContext } from '../../../lib/template-engine';
import type { TExpressConfig } from '../schemas';
import { safeJsonParse } from '../../../lib/utils';

/** Convert express config to template context */
function toTemplateContext(config: TExpressConfig): TemplateContext {
  return {
    appName: config.appName,
    port: config.port,
    database: config.database,
    routers: config.routers,
    models: config.models,
    middleware: config.middleware,
    envVars: config.envVars,
    modules: config.routers.map(r => ({
      name: r.resource,
      pascalName: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      camelName: r.resource,
      methods: r.methods,
    })),
  };
}

export const scaffoldExpressTool = defineTool({
  name: 'scaffold_express',
  description:
    'Scaffold an Express.js project from a validated config. Compiles Handlebars templates and writes the project to the output directory.',
  input: z.object({
    config: z.string().describe('JSON string of the validated Express config'),
    outputDir: z.string().describe('Absolute path to the output directory'),
  }),
  handler: async ({ config, outputDir }): Promise<ScaffoldResult> => {
    const parsed = safeJsonParse(config, 'express config') as TExpressConfig;
    const templateDir = path.resolve(process.cwd(), '.ref/templates/express');
    const context = toTemplateContext(parsed);

    return scaffoldProject({
      templateDir,
      outputDir,
      context,
    });
  },
});

/**
 * scaffold_subgraph tool - compiles .ref/templates/subgraph/ with config
 */

import * as path from 'node:path';
import { z } from 'zod';
import { defineTool } from '../../../lib/tools';
import { scaffoldProject } from '../../../lib/template-engine';
import type { ScaffoldResult } from '../../../lib/template-engine';
import type { TemplateContext } from '../../../lib/template-engine';
import type { TSubgraphConfig } from '../schemas';

/** Convert subgraph config to template context */
function toTemplateContext(config: TSubgraphConfig): TemplateContext {
  return {
    appName: config.appName,
    port: config.port,
    database: config.database,
    modules: config.modules.map(m => ({
      name: m.name,
      pascalName: m.name.charAt(0).toUpperCase() + m.name.slice(1),
      camelName: m.name.charAt(0).toLowerCase() + m.name.slice(1),
      entity: m.entity,
      datasource: m.datasource,
      types: m.types,
      operations: m.operations,
    })),
    authDirective: config.authDirective,
    envVars: config.envVars,
    sharedTypes: config.sharedTypes,
  };
}

export const scaffoldSubgraphTool = defineTool({
  name: 'scaffold_subgraph',
  description:
    'Scaffold an Apollo GraphQL subgraph project from a validated config. Compiles Handlebars templates and writes the project to the output directory.',
  input: z.object({
    config: z.string().describe('JSON string of the validated subgraph config'),
    outputDir: z.string().describe('Absolute path to the output directory'),
  }),
  handler: async ({ config, outputDir }): Promise<ScaffoldResult> => {
    const parsed = JSON.parse(config) as TSubgraphConfig;
    const templateDir = path.resolve(process.cwd(), '.ref/templates/subgraph');
    const context = toTemplateContext(parsed);

    return scaffoldProject({
      templateDir,
      outputDir,
      context,
    });
  },
});

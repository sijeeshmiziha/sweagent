/**
 * generate_frontend tool - converts GraphQL schema to frontend config JSON (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { ApplicationSchema, type TApplicationSchema } from '../schemas';
import { REACT_BUILDER_SYSTEM_PROMPT } from '../prompts/system.prompt';
import { buildInstructionPrompt, buildExampleShotPrompt } from '../prompts';
import type { AppInfo } from '../types';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

function buildGeneratePrompt(graphqlSchema: string, appInfo?: AppInfo): string {
  const instruction = buildInstructionPrompt();
  const example = buildExampleShotPrompt();
  const appInfoBlock = appInfo
    ? `
**Project context:**
- name: ${appInfo.projectName ?? 'project'}
- description: ${appInfo.projectDescription ?? ''}
- modules: ${appInfo.modules ?? ''}
- apiEndpoint: ${appInfo.apiEndpoint ?? 'http://localhost:4000/graphql'}
`
    : '';
  return `${instruction}

${example}
${appInfoBlock}

**Current Project GraphQL Schema:**
\`\`\`graphql
${graphqlSchema}
\`\`\`

Generate the Frontend Config JSON. Use every available CRUD GraphQL query and mutation. Return ONLY valid JSON.`;
}

export function createGenerateFrontendTool(model: Model) {
  return defineTool({
    name: 'generate_frontend',
    description:
      'Convert a GraphQL schema into a frontend configuration JSON (app, modules, pages, fields, API hooks). Optionally provide app info (project name, description, apiEndpoint). Returns the full application config as JSON.',
    input: z.object({
      graphqlSchema: z.string().describe('The GraphQL schema string to convert'),
      appInfo: z
        .object({
          projectName: z.string().optional(),
          projectDescription: z.string().optional(),
          modules: z.string().optional(),
          apiEndpoint: z.string().optional(),
        })
        .optional()
        .describe('Optional project/app context'),
    }),
    handler: async ({ graphqlSchema, appInfo }): Promise<TApplicationSchema> => {
      const userPrompt = buildGeneratePrompt(graphqlSchema, appInfo);
      const messages = [
        { role: 'system' as const, content: REACT_BUILDER_SYSTEM_PROMPT },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.2, maxOutputTokens: 16384 });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      return ApplicationSchema.parse(parsed);
    },
  });
}

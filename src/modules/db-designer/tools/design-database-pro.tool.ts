/**
 * design_database_pro tool - generates MongoDB schema from structured requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { projectSchema, type TBackendProjectSchema } from '../schemas';
import { createProDbDesignPrompt, extractDataEntities, extractRoles } from '../prompts';

function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

const structuredInputSchema = z.object({
  projectName: z.string(),
  projectGoal: z.string(),
  projectDescription: z.string().optional(),
  actors: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      goals: z.array(z.string()),
    })
  ),
  flows: z.array(
    z.object({
      id: z.string(),
      actorId: z.string(),
      name: z.string(),
      description: z.string(),
      trigger: z.string(),
      outcome: z.string(),
    })
  ),
  stories: z.array(
    z.object({
      id: z.string(),
      flowId: z.string(),
      actor: z.string(),
      action: z.string(),
      benefit: z.string(),
      preconditions: z.array(z.string()),
      postconditions: z.array(z.string()),
      dataInvolved: z.array(z.string()),
    })
  ),
  technicalRequirements: z
    .object({
      authentication: z.enum(['none', 'email', 'oauth', 'phone', 'email_and_phone']),
      authorization: z.boolean(),
      roles: z.array(z.string()).optional(),
      integrations: z.array(z.string()).optional(),
      realtime: z.boolean().optional(),
      fileUpload: z.boolean().optional(),
      search: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Creates the design_database_pro tool. Requires a model for schema generation.
 */
export function createDesignDatabaseProTool(model: Model) {
  return defineTool({
    name: 'design_database_pro',
    description:
      'Generate a MongoDB schema from structured requirements (project name, goal, actors, flows, user stories with dataInvolved, technical requirements). Use for pro-level 5-phase analysis. Returns dbDesign and metadata (entitiesDetected, rolesExtracted).',
    input: structuredInputSchema,
    handler: async (input): Promise<{ dbDesign: TBackendProjectSchema; metadata: { entitiesDetected: string[]; rolesExtracted: string[] } }> => {
      const userPrompt = createProDbDesignPrompt(input);
      const messages = [
        { role: 'system' as const, content: 'You are a MongoDB schema expert. Return only valid JSON.' },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.2, maxOutputTokens: 16384 });
      const jsonStr = extractJson(response.text);
      const parsed = JSON.parse(jsonStr) as unknown;
      const dbDesign = projectSchema.parse(parsed);
      const metadata = {
        entitiesDetected: extractDataEntities(input.stories),
        rolesExtracted: extractRoles(input.actors),
      };
      return { dbDesign, metadata };
    },
  });
}

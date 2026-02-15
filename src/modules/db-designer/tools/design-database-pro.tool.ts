/**
 * design_database_pro tool - generates MongoDB schema from structured requirements (uses AI)
 */

import { z } from 'zod';
import type { Model } from '../../../lib/types/model';
import { defineTool } from '../../../lib/tools';
import { projectSchema, type TBackendProjectSchema } from '../schemas';
import { createProDbDesignPrompt, extractDataEntities, extractRoles } from '../prompts';
import { parseModelJsonResponse } from '../../../lib/utils';

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
      authentication: z
        .string()
        .transform(s => {
          const n = s.toLowerCase().replace(/[\s_-]+/g, '');
          if (['none', 'no', ''].includes(n)) return 'none' as const;
          if (['email', 'emailpassword', 'emailandpassword'].includes(n)) return 'email' as const;
          if (['oauth', 'oauth2', 'social'].includes(n)) return 'oauth' as const;
          if (['phone', 'phoneotp', 'sms'].includes(n)) return 'phone' as const;
          if (['emailandphone', 'emailphone', 'both'].includes(n))
            return 'email_and_phone' as const;
          return 'email' as const;
        })
        .pipe(z.enum(['none', 'email', 'oauth', 'phone', 'email_and_phone'])),
      authorization: z.coerce.boolean().default(false),
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
    handler: async (
      input
    ): Promise<{
      dbDesign: TBackendProjectSchema;
      metadata: { entitiesDetected: string[]; rolesExtracted: string[] };
    }> => {
      const userPrompt = createProDbDesignPrompt(input);
      const messages = [
        {
          role: 'system' as const,
          content: 'You are a MongoDB schema expert. Return only valid JSON.',
        },
        { role: 'user' as const, content: userPrompt },
      ];
      const response = await model.invoke(messages, { temperature: 0.2, maxOutputTokens: 16384 });
      const dbDesign = parseModelJsonResponse(response.text, projectSchema);
      const metadata = {
        entitiesDetected: extractDataEntities(input.stories),
        rolesExtracted: extractRoles(input.actors),
      };
      return { dbDesign, metadata };
    },
  });
}

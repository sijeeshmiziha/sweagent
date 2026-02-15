/**
 * Shared validation tool factory - generates a validate_* tool from a Zod schema.
 * Eliminates boilerplate across modules that all follow the same pattern.
 */

import { z } from 'zod';
import type { Tool } from 'ai';
import { defineTool } from './tools';

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Create a validation tool that parses JSON input against a Zod schema.
 * Every module can replace its hand-written validate_* tool with this one-liner.
 *
 * @param name - Tool name (e.g. 'validate_schema', 'validate_api')
 * @param schema - Zod schema to validate against
 * @param description - Tool description for the agent
 * @param inputParamName - Name of the input parameter (default: 'json')
 */
export function createValidationTool(
  name: string,
  schema: z.ZodType,
  description: string,
  inputParamName = 'json'
): Tool {
  return defineTool({
    name,
    description,
    input: z.object({
      [inputParamName]: z.string().describe('JSON string to validate'),
    }),
    handler: async (args: Record<string, string>): Promise<ValidationResult> => {
      const raw = args[inputParamName] ?? '';
      try {
        const parsed = JSON.parse(raw) as unknown;
        schema.parse(parsed);
        return { valid: true };
      } catch (err) {
        if (err instanceof z.ZodError) {
          return {
            valid: false,
            errors: err.issues.map(e => `${e.path.join('.')}: ${e.message}`),
          };
        }
        if (err instanceof SyntaxError) {
          return { valid: false, errors: [`Invalid JSON: ${err.message}`] };
        }
        return { valid: false, errors: [String(err)] };
      }
    },
  });
}

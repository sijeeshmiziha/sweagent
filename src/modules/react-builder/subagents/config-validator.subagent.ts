/**
 * config-validator subagent - validates frontend config (has validate_frontend_config tool)
 */

import { defineSubagent } from '../../../lib/subagents';
import { validateFrontendConfigTool } from '../tools/validate-frontend-config.tool';

const CONFIG_VALIDATOR_SYSTEM_PROMPT = `You are a frontend configuration validator. Your job is to:

1. Validate the provided frontend config JSON using the validate_frontend_config tool.
2. Compare the config against the GraphQL schema (if provided) and check that all CRUD operations are covered.
3. Report any missing modules, pages, or API hooks.

When the user gives you a config (as JSON string) and optionally the GraphQL schema, first call validate_frontend_config to check structure. Then summarize completeness.`;

export function createConfigValidatorSubagent() {
  return defineSubagent({
    name: 'config-validator',
    description:
      'Validates a frontend configuration JSON and checks completeness against the GraphQL schema. Use when you have a draft config and want to validate it. Has access to validate_frontend_config tool.',
    systemPrompt: CONFIG_VALIDATOR_SYSTEM_PROMPT,
    tools: { validate_frontend_config: validateFrontendConfigTool },
    maxIterations: 5,
  });
}

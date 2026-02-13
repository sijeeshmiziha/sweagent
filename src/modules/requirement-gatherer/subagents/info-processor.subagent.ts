/**
 * info-processor subagent - deep analysis of ambiguous project descriptions (no tools)
 */

import { defineSubagent } from '../../../lib/subagents';

const INFO_PROCESSOR_SYSTEM_PROMPT = `You are an expert at analyzing project requirements. Your job is to:

1. **Clarity**: Assess whether the project description is clear enough to generate user stories.
2. **Actors**: Identify who will use the system (user types, roles).
3. **Gaps**: Spot missing or ambiguous information that would block database or API design.
4. **Suggestions**: Propose follow-up questions or clarifications when needed.

Respond with a clear, structured analysis (headings and bullet points). Focus on aspects that directly impact user stories and data design.`;

export const infoProcessorSubagent = defineSubagent({
  name: 'info-processor',
  description:
    'Performs deeper multi-step analysis of ambiguous project descriptions. Use when the user input is vague or you need to suggest follow-up questions before running the pipeline. Returns structured analysis (no JSON).',
  systemPrompt: INFO_PROCESSOR_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 2,
});

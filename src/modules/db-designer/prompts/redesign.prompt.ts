/**
 * Redesign prompt - update existing schema based on user feedback
 */

import { DB_DESIGN_SYSTEM_PROMPT } from './system.prompt';

export function createRedesignPrompt(existingSchema: string, userFeedback: string): string {
  return `${DB_DESIGN_SYSTEM_PROMPT}

Update the existing MongoDB schema based on user feedback.

## Steps
1. Analyze the existing MongoDB schema provided
2. Review the user feedback to understand the required updates
3. Update the schema to incorporate the requested changes while adhering to best practices

## Existing Schema
${existingSchema}

## User Feedback
${userFeedback}

Return the updated schema as a valid JSON object matching the original schema format.
IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations.`;
}

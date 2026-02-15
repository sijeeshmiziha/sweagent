/**
 * MongoDB redesign prompt - update existing schema based on feedback
 * (merged from db-designer)
 */

import { MONGODB_SYSTEM_PROMPT } from './mongodb-system.prompt';

export function createMongoRedesignPrompt(existingSchema: string, feedback: string): string {
  return `${MONGODB_SYSTEM_PROMPT}

Update the existing MongoDB schema based on user feedback.

## Steps
1. Analyze the existing MongoDB schema provided
2. Review the user feedback to understand the required updates
3. Update the schema to incorporate the requested changes while adhering to best practices

## Existing Schema
${existingSchema}

## User Feedback
${feedback}

Return the updated schema as a valid JSON object matching the original schema format.
IMPORTANT: Return ONLY the JSON object, no markdown code blocks, no explanations.`;
}

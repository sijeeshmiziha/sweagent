/**
 * Feedback prompt - re-generate frontend config incorporating user feedback
 */

export function buildFeedbackPrompt(userFeedback: string, schemaFile: string): string {
  return `
Review the user feedback carefully to understand the required updates.

The user feedback for updating the generated Frontend Config JSON is provided below:
"""
${userFeedback}
"""

Now, generate the Frontend Config JSON for this project based on the provided feedback.

**Project GRAPHQL SCHEMA INPUT:**
\`\`\`graphql
${schemaFile}
\`\`\`

Update the Frontend Config JSON to incorporate the requested changes. Return ONLY valid JSON, no markdown code blocks.
`.trim();
}

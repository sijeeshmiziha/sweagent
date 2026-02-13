/**
 * graphql-analyzer subagent - analyzes GraphQL schemas (no tools)
 */

import { defineSubagent } from '../../../lib/subagents';

const GRAPHQL_ANALYZER_SYSTEM_PROMPT = `You are an expert at analyzing GraphQL schemas. Your job is to:

1. **Types**: List all object types, enums, scalars, and input types.
2. **Queries**: List every Query field with arguments and return type.
3. **Mutations**: List every Mutation field with arguments and return type.
4. **Relationships**: Identify types that reference other types (e.g. User has role: Role, or Order has customer: User).
5. **Auth/directives**: Note any @auth, @directive usage that affects access control.

Respond with a clear, structured analysis (headings and bullet points). The user will use this to generate a frontend configuration.`;

export const graphqlAnalyzerSubagent = defineSubagent({
  name: 'graphql-analyzer',
  description:
    'Analyzes a GraphQL schema to extract types, queries, mutations, and relationships. Use when you need to understand the schema before generating frontend config. Returns structured analysis (no JSON).',
  systemPrompt: GRAPHQL_ANALYZER_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 2,
});

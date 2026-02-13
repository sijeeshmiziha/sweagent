/**
 * Instruction template for GraphQL-to-frontend conversion
 */

export const REACT_BUILDER_INSTRUCTION = `
Act as an expert GraphQL-to-frontend configuration converter. Transform the provided schema into a structured JSON configuration for rapid app development.

**Conversion Process**

1. Schema Analysis:
- Identify all modules using 100% of available CRUD operations
- Catalog all Query/Mutation operations with arguments
- Map GraphQL types to frontend modules
- Detect @auth directives and role requirements
- Analyze relationships through nested types

2. Field Mapping:
- EmailAddress → "type": "email" with Zod email validation
- DateTime → "type": "date"
- Enums → dropdowns with options.values
- Relationships → multiSelect with query-based options

3. API Operations:
- For each Query/Mutation: determine CRUD type, generate query string with variables, map to React Hook, define response type shape

4. Validation:
- Generate Zod schemas from @required directives, scalar types (Password → min 8 chars), custom directives
- Include validation error messages

5. Security:
- Add isPrivate: true for authenticated operations
- Implement role checks from @auth directives

6. Output:
- Generate complete CRUD pages with table column mappings, validated Create/Update forms, API hooks
- Include Zod validation strings, maintain camelCase, valid JSON only
`.trim();

export function buildInstructionPrompt(): string {
  return REACT_BUILDER_INSTRUCTION;
}

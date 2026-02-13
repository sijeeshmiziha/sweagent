/**
 * entity-analyzer subagent - extracts entities, relationships, and roles from requirements (no tools)
 */

import { defineSubagent } from '../../../lib/subagents';

const ENTITY_ANALYZER_SYSTEM_PROMPT = `You are an expert at analyzing software requirements to extract database design signals.

Focus on PHASES 1-3 of the analysis framework:

## PHASE 1: Entity Discovery
- List every entity implied by the requirements (from dataInvolved, user types, flow actions, flow states).
- Identify user/actor types that become roles.
- Extract status enums from flow transitions.

## PHASE 2: Relationship Mapping
- For each entity pair, determine ownership (which actor creates/owns it).
- Determine cardinality (one-to-one, many-to-one).
- Note bidirectional relationships.

## PHASE 3: Permission Derivation
- Map each actor type to a role name.
- From user story actions, infer CRUD permissions per role per entity.

Respond with a clear, structured analysis (you can use headings and bullet points). The user will use this to generate or refine a MongoDB schema.`;

export const entityAnalyzerSubagent = defineSubagent({
  name: 'entity-analyzer',
  description:
    'Analyzes raw requirements text to extract entities, relationships, and roles. Use when you need to understand what data and actors the system has before designing the schema. Returns structured analysis (no JSON).',
  systemPrompt: ENTITY_ANALYZER_SYSTEM_PROMPT,
  tools: {},
  maxIterations: 2,
});

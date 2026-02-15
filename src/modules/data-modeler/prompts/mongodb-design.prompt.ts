/**
 * MongoDB design prompt builders (merged from db-designer)
 */

import type { MongoStructuredInput } from '../types';
import { MONGODB_SYSTEM_PROMPT } from './mongodb-system.prompt';
import { buildPromptVariables } from './mongodb-formatters';

/**
 * Legacy: build design prompt from plain requirement string
 */
export function createMongoDesignPrompt(requirement: string): string {
  return `${MONGODB_SYSTEM_PROMPT}

Design a robust and efficient MongoDB database schema based on the following requirements:

## Requirements
${requirement}

## Guidelines
1. Use camelCase for module names and field names
2. Include createdAt and updatedAt Date fields in every module
3. Define proper relationships between modules
4. Set appropriate permissions for user modules

Return ONLY valid JSON matching the schema specified. No markdown code blocks, no explanations.`;
}

/**
 * Pro-level MongoDB design prompt from structured requirements
 */
export function createMongoProDesignPrompt(input: MongoStructuredInput): string {
  const vars = buildPromptVariables(input);
  return `${MONGODB_SYSTEM_PROMPT}

---

## PROJECT CONTEXT

**Project Name:** ${vars.projectName}
**Project Goal:** ${vars.projectGoal}
**Description:** ${vars.projectDescription}

---

## USER TYPES (ACTORS)

${vars.userTypes}

---

## USER FLOWS

${vars.userFlows}

---

## USER STORIES WITH DATA REQUIREMENTS

${vars.userStories}

---

## TECHNICAL REQUIREMENTS

${vars.technicalRequirements}

---

## YOUR TASK

Follow the 5-phase analysis framework:

### Step 1: Entity Discovery
- List ALL entities extracted from dataInvolved fields
- Identify implicit entities from user flow actions
- Map user types to User collection roles
- Extract status enums from flow transitions

### Step 2: Relationship Mapping
- Define ownership: which actor creates/owns each entity
- Determine cardinality from flow context

### Step 3: Permission Derivation
- Map each actor to a role
- Extract CRUD permissions from user story actions

### Step 4: Query Pattern Inference
- Identify likely query patterns from flows

### Step 5: Schema Construction
Generate the final schema with complete module definitions, fields, relationships, RBAC permissions, and timestamps.

Return ONLY valid JSON matching the schema specified. No markdown code blocks, no explanations.`;
}

/**
 * Design prompts - legacy and pro-level, plus structured requirement formatters
 */

import type { Actor, ExtractedFlow, ExtractedStory, StructuredRequirementsInput, TechnicalRequirements } from '../types';
import { DB_DESIGN_SYSTEM_PROMPT } from './system.prompt';

/**
 * Legacy: build design prompt from plain requirement string
 */
export function createDbDesignPrompt(requirement: string): string {
  return `${DB_DESIGN_SYSTEM_PROMPT}

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
 * Format actors/user types into prompt-friendly string
 */
export function formatUserTypes(actors: Actor[]): string {
  if (!actors || actors.length === 0) {
    return 'No specific user types defined. Assume a general "User" role.';
  }
  return actors
    .map((actor, index) => {
      const goals = actor.goals.filter((g) => g.trim()).join('\n   - ');
      return `### ${index + 1}. ${actor.name}
**Description:** ${actor.description}
**Goals:**
   - ${goals || 'No specific goals defined'}`;
    })
    .join('\n\n');
}

/**
 * Format user flows into prompt-friendly string
 */
export function formatUserFlows(flows: ExtractedFlow[], actors: Actor[]): string {
  if (!flows || flows.length === 0) {
    return 'No specific user flows defined.';
  }
  return flows
    .map((flow, index) => {
      const actor = actors.find((a) => a.id === flow.actorId);
      const actorName = actor?.name || 'User';
      return `### ${index + 1}. ${flow.name}
**Actor:** ${actorName}
**Description:** ${flow.description}
**Trigger:** ${flow.trigger || 'User initiates action'}
**Outcome:** ${flow.outcome || 'Action completed'}`;
    })
    .join('\n\n');
}

/**
 * Format user stories with dataInvolved into prompt-friendly string
 */
export function formatUserStories(stories: ExtractedStory[], flows: ExtractedFlow[]): string {
  if (!stories || stories.length === 0) {
    return 'No specific user stories defined.';
  }
  const storiesByFlow = new Map<string, ExtractedStory[]>();
  for (const story of stories) {
    const flowStories = storiesByFlow.get(story.flowId) || [];
    flowStories.push(story);
    storiesByFlow.set(story.flowId, flowStories);
  }
  const sections: string[] = [];
  for (const flow of flows) {
    const flowStories = storiesByFlow.get(flow.id) || [];
    if (flowStories.length === 0) continue;
    sections.push(`### Flow: ${flow.name}\n`);
    for (const story of flowStories) {
      const preconditions = story.preconditions.filter((p) => p.trim());
      const postconditions = story.postconditions.filter((p) => p.trim());
      const dataInvolved = story.dataInvolved.filter((d) => d.trim());
      let storyText = `**As a** ${story.actor}, **I want to** ${story.action}, **so that** ${story.benefit}\n`;
      if (preconditions.length > 0) {
        storyText += `\n**Preconditions:**\n${preconditions.map((p) => `- ${p}`).join('\n')}\n`;
      }
      if (postconditions.length > 0) {
        storyText += `\n**Postconditions:**\n${postconditions.map((p) => `- ${p}`).join('\n')}\n`;
      }
      if (dataInvolved.length > 0) {
        storyText += `\n**Data Involved (IMPORTANT - these indicate entities/fields):**\n${dataInvolved.map((d) => `- ${d}`).join('\n')}\n`;
      }
      sections.push(storyText);
    }
  }
  const orphanStories = stories.filter((s) => !flows.some((f) => f.id === s.flowId));
  if (orphanStories.length > 0) {
    sections.push(`### Other Stories\n`);
    for (const story of orphanStories) {
      const dataInvolved = story.dataInvolved.filter((d) => d.trim());
      let storyText = `**As a** ${story.actor}, **I want to** ${story.action}, **so that** ${story.benefit}\n`;
      if (dataInvolved.length > 0) {
        storyText += `\n**Data Involved:** ${dataInvolved.join(', ')}\n`;
      }
      sections.push(storyText);
    }
  }
  return sections.join('\n');
}

/**
 * Format technical requirements into prompt-friendly string
 */
export function formatTechnicalRequirements(tech?: TechnicalRequirements): string {
  if (!tech) {
    return 'No specific technical requirements. Use defaults.';
  }
  const lines: string[] = [];
  lines.push(`**Authentication:** ${tech.authentication || 'none'}`);
  if (tech.authorization) {
    lines.push(`**Authorization (RBAC):** Enabled`);
    if (tech.roles && tech.roles.length > 0) {
      lines.push(`**Defined Roles:** ${tech.roles.join(', ')}`);
    }
  } else {
    lines.push(`**Authorization:** Disabled`);
  }
  if (tech.realtime) {
    lines.push(`**Realtime Features:** Required (consider subscription patterns)`);
  }
  if (tech.fileUpload) {
    lines.push(`**File Upload:** Required (consider file/document collection)`);
  }
  if (tech.search) {
    lines.push(`**Search Functionality:** Required (consider text indexes)`);
  }
  if (tech.integrations && tech.integrations.length > 0) {
    lines.push(`**Integrations:** ${tech.integrations.join(', ')}`);
  }
  return lines.join('\n');
}

/**
 * Extract all unique dataInvolved items from stories for entity hints
 */
export function extractDataEntities(stories: ExtractedStory[]): string[] {
  const entities = new Set<string>();
  for (const story of stories) {
    for (const data of story.dataInvolved) {
      if (data.trim()) entities.add(data.trim());
    }
  }
  return Array.from(entities);
}

/**
 * Extract roles from actors for RBAC configuration
 */
export function extractRoles(actors: Actor[]): string[] {
  return actors.map((a) => a.name.toLowerCase().replaceAll(/\s+/g, '_'));
}

/**
 * Build complete prompt variables from structured requirements
 */
export function buildPromptVariables(input: StructuredRequirementsInput): Record<string, string> {
  return {
    projectName: input.projectName,
    projectGoal: input.projectGoal,
    projectDescription: input.projectDescription || input.projectGoal,
    userTypes: formatUserTypes(input.actors),
    userFlows: formatUserFlows(input.flows, input.actors),
    userStories: formatUserStories(input.stories, input.flows),
    technicalRequirements: formatTechnicalRequirements(input.technicalRequirements),
  };
}

/**
 * Pro-level DB design prompt from structured requirements
 */
export function createProDbDesignPrompt(input: StructuredRequirementsInput): string {
  const vars = buildPromptVariables(input);
  return `${DB_DESIGN_SYSTEM_PROMPT}

---

## PROJECT CONTEXT

**Project Name:** ${vars.projectName}
**Project Goal:** ${vars.projectGoal}
**Description:** ${vars.projectDescription}

---

## USER TYPES (ACTORS)

These are the different types of users who will interact with the system. Each actor represents a potential role in your RBAC system.

${vars.userTypes}

---

## USER FLOWS

These represent the key journeys users take through the system. Analyze these for:
- Entity creation/modification patterns
- State transitions (status enums)
- Relationship ownership

${vars.userFlows}

---

## USER STORIES WITH DATA REQUIREMENTS

Each story includes dataInvolved - these are CRITICAL signals for your entity and field design.

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
- Identify bidirectional relationships

### Step 3: Permission Derivation
- Map each actor to a role
- Extract CRUD permissions from user story actions
- Define the permissions object for user modules

### Step 4: Query Pattern Inference
- Identify likely query patterns from flows
- Note which fields need indexing (for your reference)

### Step 5: Schema Construction
Generate the final schema with:
- Complete module definitions
- All fields with proper types
- Relationships with relationTo and relationType
- Status enums from flow states
- RBAC permissions on user modules
- Timestamps on every module

Return ONLY valid JSON matching the schema specified. No markdown code blocks, no explanations.`;
}

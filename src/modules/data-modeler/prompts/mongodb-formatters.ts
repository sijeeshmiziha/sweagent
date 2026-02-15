/**
 * MongoDB prompt formatters - format structured requirements for prompts
 * (merged from db-designer)
 */

import type {
  MongoActor,
  MongoExtractedFlow,
  MongoExtractedStory,
  MongoTechnicalRequirements,
  MongoStructuredInput,
} from '../types';

export function formatUserTypes(actors: MongoActor[]): string {
  if (!actors || actors.length === 0) {
    return 'No specific user types defined. Assume a general "User" role.';
  }
  return actors
    .map((actor, i) => {
      const goals = actor.goals.filter(g => g.trim()).join('\n   - ');
      return `### ${i + 1}. ${actor.name}\n**Description:** ${actor.description}\n**Goals:**\n   - ${goals || 'No specific goals defined'}`;
    })
    .join('\n\n');
}

export function formatUserFlows(flows: MongoExtractedFlow[], actors: MongoActor[]): string {
  if (!flows || flows.length === 0) return 'No specific user flows defined.';
  return flows
    .map((flow, i) => {
      const actor = actors.find(a => a.id === flow.actorId);
      return `### ${i + 1}. ${flow.name}\n**Actor:** ${actor?.name || 'User'}\n**Description:** ${flow.description}\n**Trigger:** ${flow.trigger || 'User initiates action'}\n**Outcome:** ${flow.outcome || 'Action completed'}`;
    })
    .join('\n\n');
}

export function formatUserStories(
  stories: MongoExtractedStory[],
  flows: MongoExtractedFlow[]
): string {
  if (!stories || stories.length === 0) return 'No specific user stories defined.';
  const byFlow = new Map<string, MongoExtractedStory[]>();
  for (const s of stories) {
    const arr = byFlow.get(s.flowId) || [];
    arr.push(s);
    byFlow.set(s.flowId, arr);
  }
  const sections: string[] = [];
  for (const flow of flows) {
    const flowStories = byFlow.get(flow.id) || [];
    if (flowStories.length === 0) continue;
    sections.push(`### Flow: ${flow.name}\n`);
    for (const story of flowStories) {
      const pre = story.preconditions.filter(p => p.trim());
      const post = story.postconditions.filter(p => p.trim());
      const data = story.dataInvolved.filter(d => d.trim());
      let t = `**As a** ${story.actor}, **I want to** ${story.action}, **so that** ${story.benefit}\n`;
      if (pre.length) t += `\n**Preconditions:**\n${pre.map(p => `- ${p}`).join('\n')}\n`;
      if (post.length) t += `\n**Postconditions:**\n${post.map(p => `- ${p}`).join('\n')}\n`;
      if (data.length)
        t += `\n**Data Involved (IMPORTANT):**\n${data.map(d => `- ${d}`).join('\n')}\n`;
      sections.push(t);
    }
  }
  const orphans = stories.filter(s => !flows.some(f => f.id === s.flowId));
  if (orphans.length) {
    sections.push(`### Other Stories\n`);
    for (const s of orphans) {
      const data = s.dataInvolved.filter(d => d.trim());
      let t = `**As a** ${s.actor}, **I want to** ${s.action}, **so that** ${s.benefit}\n`;
      if (data.length) t += `\n**Data Involved:** ${data.join(', ')}\n`;
      sections.push(t);
    }
  }
  return sections.join('\n');
}

export function formatTechnicalRequirements(tech?: MongoTechnicalRequirements): string {
  if (!tech) return 'No specific technical requirements. Use defaults.';
  const lines: string[] = [`**Authentication:** ${tech.authentication || 'none'}`];
  if (tech.authorization) {
    lines.push('**Authorization (RBAC):** Enabled');
    if (tech.roles?.length) lines.push(`**Defined Roles:** ${tech.roles.join(', ')}`);
  } else {
    lines.push('**Authorization:** Disabled');
  }
  if (tech.realtime) lines.push('**Realtime Features:** Required');
  if (tech.fileUpload) lines.push('**File Upload:** Required');
  if (tech.search) lines.push('**Search Functionality:** Required');
  if (tech.integrations?.length) lines.push(`**Integrations:** ${tech.integrations.join(', ')}`);
  return lines.join('\n');
}

export function extractDataEntities(stories: MongoExtractedStory[]): string[] {
  const entities = new Set<string>();
  for (const s of stories) for (const d of s.dataInvolved) if (d.trim()) entities.add(d.trim());
  return Array.from(entities);
}

export function extractRoles(actors: MongoActor[]): string[] {
  return actors.map(a => a.name.toLowerCase().replaceAll(/\s+/g, '_'));
}

export function buildPromptVariables(input: MongoStructuredInput): Record<string, string> {
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

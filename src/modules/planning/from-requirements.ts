/**
 * Wire requirement-gatherer output into the planning module.
 * Converts a FinalRequirement into a pre-filled PlanningContext at the design stage,
 * skipping the redundant discovery + requirements stages.
 */

import type { AgentResult } from '../../lib/types/agent';
import type { PlanningContext, PlanSections } from './types';
import type { PlanFromRequirementsConfig } from './from-requirements.types';
import type {
  FinalRequirement,
  DatabaseDesign,
  DatabaseEntity,
  Module,
  Actor,
  Flow,
  Story,
} from '../requirement-gatherer/types';
import { processPlanningChat } from './chat';

/* ── Markdown formatters ─────────────────────────────────── */

function formatEntityFields(entity: DatabaseEntity): string {
  if (!entity.fields.length) return '';
  const rows = entity.fields.map(f => {
    const flags = [f.required ? 'required' : '', f.unique ? 'unique' : '']
      .filter(Boolean)
      .join(', ');
    return `| ${f.name} | ${f.type} | ${flags || '-'} | ${f.description} |`;
  });
  return `| Field | Type | Constraints | Description |\n| --- | --- | --- | --- |\n${rows.join('\n')}`;
}

function formatDatabaseAsMarkdown(db: DatabaseDesign): string {
  const header = `## Data Models\n\n**Database:** ${db.type}\n**Reasoning:** ${db.reasoning}\n`;
  const entities = db.entities
    .map(e => {
      const fields = formatEntityFields(e);
      const relParts = e.relations.map(
        r => r.field + ' → ' + r.references + ' (' + r.description + ')'
      );
      const relations = relParts.length ? '\n**Relations:** ' + relParts.join('; ') : '';
      const idxParts = e.indexes.map(
        i => i.name + ' [' + i.fields.join(', ') + ']' + (i.unique ? ' (unique)' : '')
      );
      const indexes = idxParts.length ? '\n**Indexes:** ' + idxParts.join('; ') : '';
      return `### ${e.name}\n\n${e.description}\n\n${fields}${relations}${indexes}`;
    })
    .join('\n\n');
  return `${header}\n${entities}`;
}

function formatModulesAsMarkdown(modules: Module[]): string {
  const items = modules
    .map(m => {
      const apis = m.apis.map(a => `  - \`${a.operation}\` ${a.name}: ${a.description}`).join('\n');
      return `### ${m.name}\n\n${m.description} (entity: ${m.entity})\n\n**APIs:**\n${apis}`;
    })
    .join('\n\n');
  return `## Feature Decisions\n\n${items}`;
}

function formatProjectOverview(req: FinalRequirement): string {
  const p = req.project;
  const features = p.features.map(f => `- ${f}`).join('\n');
  return `# ${p.name}\n\n**Goal:** ${p.goal}\n**Domain:** ${p.domain}\n\n${req.summary.overview}\n\n**Key Features:**\n${features}`;
}

function formatTechStack(req: FinalRequirement): string {
  const p = req.project;
  return [
    '## Tech Stack',
    '',
    `- **Database:** ${p.database}`,
    `- **Backend Runtime:** ${p.backendRuntime}`,
    `- **API Style:** ${p.apiStyle}`,
  ].join('\n');
}

function formatActorsContext(actors: Actor[], flows: Flow[], stories: Story[]): string {
  const parts: string[] = ['## Actors and Flows'];
  for (const actor of actors) {
    parts.push(`\n### ${actor.name}\n${actor.description}`);
    const actorFlows = flows.filter(f => f.actorId === actor.id);
    if (actorFlows.length) {
      parts.push('**Flows:**');
      for (const f of actorFlows) {
        parts.push(`- ${f.name}: ${f.description} (trigger: ${f.trigger}, outcome: ${f.outcome})`);
      }
    }
  }
  if (stories.length) {
    parts.push('\n### Key User Stories');
    for (const s of stories.slice(0, 10)) {
      parts.push(`- As **${s.actor}**, I want to **${s.action}**, so that **${s.benefit}**`);
    }
    if (stories.length > 10) parts.push(`- ... and ${stories.length - 10} more stories`);
  }
  return parts.join('\n');
}

/* ── Converter ───────────────────────────────────────────── */

/**
 * Convert a FinalRequirement (from requirement-gatherer) into a PlanningContext
 * pre-filled at the design stage, skipping discovery + requirements.
 */
export function convertRequirementToContext(req: FinalRequirement): PlanningContext {
  const sections: PlanSections = {
    overview: `## Overview\n\n${req.summary.overview}`,
    techStack: formatTechStack(req),
    featureDecisions: formatModulesAsMarkdown(req.modules),
    dataModels: formatDatabaseAsMarkdown(req.database),
    pagesAndRoutes: null,
    authFlow: null,
    apiRoutes: null,
    implementation: null,
    executionPlan: null,
    edgeCases: null,
    testingChecklist: null,
  };

  return {
    stage: 'design',
    projectDescription:
      formatProjectOverview(req) + '\n\n' + formatActorsContext(req.actors, req.flows, req.stories),
    sections,
    history: [],
    pendingQuestions: [],
  };
}

/* ── Runner ──────────────────────────────────────────────── */

const MAX_TURNS = 8;

/**
 * Run the planning pipeline starting from a FinalRequirement.
 * Skips discovery + requirements stages; begins at design.
 */
export async function runPlanningFromRequirements(
  config: PlanFromRequirementsConfig
): Promise<AgentResult> {
  const { requirement, model: modelConfig, onStep, logger } = config;

  logger?.info('Starting planning from requirements (fast path)', {
    project: requirement.project.name,
  });

  const context = convertRequirementToContext(requirement);

  const triggerMsg =
    `Generate the implementation plan for "${requirement.project.name}". ` +
    'The project description, tech stack, features, and data models are already provided in context. ' +
    'Proceed with API routes, implementation details, execution plan, edge cases, and testing checklist.';

  let lastResult = await processPlanningChat(triggerMsg, context, {
    model: modelConfig,
    onStep,
    logger,
  });
  let turns = 1;

  while (!lastResult.planMarkdown && turns < MAX_TURNS) {
    logger?.debug('Planning from requirements turn', { turn: turns });
    lastResult = await processPlanningChat(
      'continue - produce the complete implementation plan.',
      lastResult.context,
      { model: modelConfig, onStep, logger }
    );
    turns++;
  }

  const output = lastResult.planMarkdown ?? lastResult.message;
  const messages = lastResult.context.history.map(e => ({
    role: e.role as 'user' | 'system' | 'assistant',
    content: e.content,
  }));

  logger?.info('Planning from requirements completed', {
    turns,
    hasPlanMarkdown: !!lastResult.planMarkdown,
  });

  return { output, steps: [], totalUsage: undefined, messages };
}

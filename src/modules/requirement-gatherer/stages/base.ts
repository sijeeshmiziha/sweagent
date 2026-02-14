/**
 * Stage processor interface and shared helpers
 */

import type { RequirementContext, Module, Story } from '../types';

export type { StageProcessor } from '../types';

/** Summarize modules for token-efficient prompts (name, entity, API count) */
export function summarizeModules(modules: Module[]): string {
  return modules.map(m => `${m.name}: ${m.entity} (${m.apis.length} APIs)`).join('\n');
}

/** Summarize stories for token-efficient prompts (actor + action) */
export function summarizeStories(stories: Story[]): string {
  return stories.map(s => `- ${s.actor}: ${s.action}`).join('\n');
}

export function extractJson(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(trimmed);
  if (codeBlock?.[1]) return codeBlock[1].trim();
  return trimmed;
}

export function safeParseJson(
  text: string
): { success: true; data: unknown } | { success: false; error: string } {
  try {
    return { success: true, data: JSON.parse(text) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Build a short text summary of context for inclusion in prompts */
export function buildContextSummary(ctx: RequirementContext): string {
  const parts: string[] = [];
  if (ctx.projectBrief) {
    parts.push(
      `Project: ${ctx.projectBrief.name}, Goal: ${ctx.projectBrief.goal}, API: ${ctx.projectBrief.apiStyle}`
    );
  }
  if (ctx.actors.length) parts.push(`Actors: ${ctx.actors.length}`);
  if (ctx.flows.length) parts.push(`Flows: ${ctx.flows.length}`);
  if (ctx.stories.length) parts.push(`Stories: ${ctx.stories.length}`);
  if (ctx.modules.length) parts.push(`Modules: ${ctx.modules.length}`);
  if (ctx.database) parts.push(`Database: ${ctx.database.type}`);
  if (ctx.apiDesign) parts.push(`API design: ${ctx.apiDesign.style}`);
  return parts.join('. ') || 'No context yet';
}

export function isConfirmation(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  const confirmations = [
    'continue',
    'yes',
    'yeah',
    'yep',
    'looks good',
    'good',
    'ok',
    'okay',
    'next',
    'proceed',
    'sure',
  ];
  return confirmations.some(c => normalized === c || normalized.startsWith(c + ' '));
}

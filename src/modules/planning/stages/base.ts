/**
 * Shared utilities for planning stages - no JSON extraction or parsing
 */

import type { PlanningContext } from '../types';

/** Whether the user message is a confirmation (continue / yes / looks good) */
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

/** Build a short text summary of context for logging */
export function buildContextSummary(ctx: PlanningContext): string {
  const parts: string[] = [];
  if (ctx.projectDescription) parts.push('Project description set');
  const sections = Object.entries(ctx.sections).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0
  );
  if (sections.length) parts.push(`Sections: ${sections.map(([k]) => k).join(', ')}`);
  return parts.join('. ') || 'No context yet';
}

/**
 * Assemble plan sections into markdown and write to file
 */

import { writeFile } from 'fs/promises';
import type { PlanSections } from './types';

export function assemblePlan(projectName: string, sections: PlanSections): string {
  const parts: (string | null)[] = [
    `# ${projectName} Implementation Plan\n`,
    sections.overview,
    sections.techStack,
    sections.featureDecisions,
    '---',
    sections.dataModels,
    '---',
    sections.pagesAndRoutes,
    '---',
    sections.authFlow,
    '---',
    sections.apiRoutes,
    '---',
    sections.implementation,
    '---',
    sections.executionPlan,
    '---',
    sections.edgeCases,
    '---',
    sections.testingChecklist,
  ];
  return parts.filter(Boolean).join('\n\n');
}

export async function writePlanToFile(markdown: string, outputPath: string): Promise<void> {
  await writeFile(outputPath, markdown, 'utf-8');
}

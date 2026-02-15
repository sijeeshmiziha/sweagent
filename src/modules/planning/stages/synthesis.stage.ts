/**
 * Synthesis stage - delegates to execution-planner specialists:
 * edge-case-analyzer (edge cases), testing-strategist (testing checklist)
 * Then assembles plan.md from all sections.
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { PlanningContext, PlanStageResult } from '../types';
import { PLANNING_SYSTEM_PROMPT } from '../prompts';
import { SYNTHESIS_SYSTEM_FRAGMENT, buildSynthesisPrompt } from '../prompts';
import { assemblePlan } from '../writer';
import { runSubagent } from '../../../lib/subagents';
import {
  edgeCaseAnalyzerSubagent,
  testingStrategistSubagent,
} from '../../execution-planner/subagents';

function gatherAllSections(ctx: PlanningContext): string {
  const parts: string[] = [];
  if (ctx.projectDescription) parts.push(ctx.projectDescription);
  const s = ctx.sections;
  [
    s.overview,
    s.techStack,
    s.featureDecisions,
    s.dataModels,
    s.pagesAndRoutes,
    s.authFlow,
    s.apiRoutes,
    s.implementation,
  ].forEach(p => {
    if (p) parts.push(p);
  });
  return parts.join('\n\n---\n\n');
}

function extractProjectName(ctx: PlanningContext): string {
  const raw = ctx.sections.overview ?? ctx.projectDescription ?? '';
  const firstLine = raw.split('\n')[0]?.trim() ?? '';
  const regex = /^#+\s*(.+?)(?:\s+Implementation Plan)?$/i;
  const match = regex.exec(firstLine);
  if (match?.[1]) return match[1].trim();
  if (firstLine.length > 0 && firstLine.length < 80) return firstLine.replace(/^#+\s*/, '').trim();
  return 'Project Implementation Plan';
}

export async function runSynthesisStage(
  _userMessage: string,
  context: PlanningContext,
  model: Model,
  logger?: Logger
): Promise<PlanStageResult> {
  logger?.debug('Synthesis stage started (specialist agents)');

  const priorSections = gatherAllSections(context);
  if (!priorSections) {
    return {
      message: 'No prior sections. Complete earlier stages first.',
      advance: false,
      sections: {},
    };
  }

  // Execution plan via direct LLM call (phased implementation order)
  const systemPrompt = `${PLANNING_SYSTEM_PROMPT}\n\n${SYNTHESIS_SYSTEM_FRAGMENT}\n\nOutput only markdown. Do NOT output JSON.`;
  const executionPlan = await model
    .invoke(
      [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: buildSynthesisPrompt(priorSections) },
      ],
      { temperature: 0.3, maxOutputTokens: 8192 }
    )
    .then(r => r.text?.trim() ?? '');

  // Edge cases via edge-case-analyzer specialist
  logger?.info('Delegating to execution-planner edge-case-analyzer specialist');
  const edgeCaseResult = await runSubagent(
    edgeCaseAnalyzerSubagent,
    `Identify edge cases for this project:\n\n${priorSections}`,
    { parentModel: model }
  );
  const edgeCases = edgeCaseResult.output;

  // Testing checklist via testing-strategist specialist
  logger?.info('Delegating to execution-planner testing-strategist specialist');
  const testingResult = await runSubagent(
    testingStrategistSubagent,
    `Design the manual testing checklist for this project:\n\n${priorSections}`,
    { parentModel: model }
  );
  const testingChecklist = testingResult.output;

  const projectName = extractProjectName(context);
  const fullSections = {
    ...context.sections,
    executionPlan: executionPlan || null,
    edgeCases: edgeCases || null,
    testingChecklist: testingChecklist || null,
  };
  const fullMarkdown = assemblePlan(projectName, fullSections);

  logger?.info('Synthesis stage complete (specialist agents)', { projectName });
  return {
    message: `Plan complete: ${projectName}. Generated via specialist agents.`,
    advance: true,
    sections: { executionPlan, edgeCases, testingChecklist },
    planMarkdown: fullMarkdown,
  };
}

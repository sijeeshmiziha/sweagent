/**
 * Design stage - delegates to api-designer specialists:
 * endpoint-analyzer (API routes), contract-designer (implementation details)
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { PlanningContext, PlanStageResult } from '../types';
import { PLANNING_SYSTEM_PROMPT } from '../prompts';
import { buildDesignImplementationPrompt } from '../prompts';
import { runSubagent } from '../../../lib/subagents';
import { endpointAnalyzerSubagent, contractDesignerSubagent } from '../../api-designer/subagents';

function gatherPriorSections(ctx: PlanningContext): string {
  const parts: string[] = [];
  if (ctx.projectDescription) parts.push(ctx.projectDescription);
  const s = ctx.sections;
  if (s.overview) parts.push(s.overview);
  if (s.techStack) parts.push(s.techStack);
  if (s.featureDecisions) parts.push(s.featureDecisions);
  if (s.dataModels) parts.push(s.dataModels);
  if (s.pagesAndRoutes) parts.push(s.pagesAndRoutes);
  if (s.authFlow) parts.push(s.authFlow);
  return parts.join('\n\n---\n\n');
}

export async function runDesignStage(
  _userMessage: string,
  context: PlanningContext,
  model: Model,
  logger?: Logger
): Promise<PlanStageResult> {
  logger?.debug('Design stage started (specialist agents)');

  const priorSections = gatherPriorSections(context);
  if (!priorSections) {
    return {
      message: 'No prior sections. Complete discovery and requirements first.',
      advance: false,
      sections: {},
    };
  }

  // API Routes via endpoint-analyzer specialist
  logger?.info('Delegating to api-designer endpoint-analyzer specialist');
  const apiResult = await runSubagent(
    endpointAnalyzerSubagent,
    `Design the API routes for this project:\n\n${priorSections}`,
    { parentModel: model }
  );
  const apiRoutes = apiResult.output;

  // Implementation Details via contract-designer specialist + direct LLM call
  logger?.info('Delegating to api-designer contract-designer specialist');
  const contractResult = await runSubagent(
    contractDesignerSubagent,
    `Design detailed request/response contracts for these API endpoints:\n\n${apiRoutes}\n\nProject context:\n${priorSections}`,
    { parentModel: model }
  );

  const systemPrompt = `${PLANNING_SYSTEM_PROMPT}\n\nOutput only markdown. Do NOT output JSON.`;
  const implementation = await model
    .invoke(
      [
        { role: 'system' as const, content: systemPrompt },
        {
          role: 'user' as const,
          content: buildDesignImplementationPrompt(
            priorSections,
            apiRoutes + '\n\n' + contractResult.output
          ),
        },
      ],
      { temperature: 0.3, maxOutputTokens: 8192 }
    )
    .then(r => r.text?.trim() ?? '');

  logger?.info('Design stage complete (specialist agents)');
  return {
    message: 'Design generated via specialist agents (Endpoint Analyzer, Contract Designer).',
    advance: true,
    sections: { apiRoutes, implementation },
  };
}

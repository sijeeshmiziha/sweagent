/**
 * Propose-before-finalize tools: propose_output and finalize_output.
 * Adapted from redxpilot's propose_str_replace / propose_write_file pattern.
 *
 * Agents produce a proposed artifact, review it, then finalize.
 */

import { z } from 'zod';
import type { Tool } from 'ai';
import { defineTool } from './tools';
import { propose, finalize, getProposed, listProposed } from '../stores/proposed-store';

/**
 * Create the propose/finalize tool pair for a given run.
 * Returns a record with `propose_output`, `finalize_output`, and `list_proposals`.
 */
export function createProposalTools(runId: string): Record<string, Tool> {
  const proposeOutputTool = defineTool({
    name: 'propose_output',
    description: 'Propose an output artifact for review before finalizing. Returns the proposal.',
    input: z.object({
      artifact: z.string().describe('Name/key for this artifact (e.g. "data-model", "api-spec")'),
      data: z.any().describe('The proposed content (JSON, string, etc.)'),
    }),
    handler: async ({ artifact, data }) => {
      const entry = propose(runId, artifact, data);
      return {
        status: 'proposed',
        artifact: entry.artifact,
        proposedAt: entry.proposedAt,
        preview: typeof data === 'string' ? data.slice(0, 500) : JSON.stringify(data).slice(0, 500),
      };
    },
  });

  const finalizeOutputTool = defineTool({
    name: 'finalize_output',
    description: 'Finalize a previously proposed artifact, committing it as the final output.',
    input: z.object({
      artifact: z.string().describe('The artifact name to finalize'),
    }),
    handler: async ({ artifact }) => {
      const data = finalize(runId, artifact);
      if (data === undefined) {
        return { status: 'error', message: `No proposal found for "${artifact}"` };
      }
      return { status: 'finalized', artifact, data };
    },
  });

  const listProposalsTool = defineTool({
    name: 'list_proposals',
    description: 'List all pending proposed artifacts for the current run.',
    input: z.object({}),
    handler: async () => {
      const proposals = listProposed(runId);
      return proposals.map(p => ({
        artifact: p.artifact,
        proposedAt: p.proposedAt,
        preview:
          typeof p.data === 'string' ? p.data.slice(0, 200) : JSON.stringify(p.data).slice(0, 200),
      }));
    },
  });

  const reviewProposalTool = defineTool({
    name: 'review_proposal',
    description: 'View the full content of a proposed artifact for review.',
    input: z.object({
      artifact: z.string().describe('The artifact name to review'),
    }),
    handler: async ({ artifact }) => {
      const entry = getProposed(runId, artifact);
      if (!entry) {
        return { status: 'error', message: `No proposal found for "${artifact}"` };
      }
      return { status: 'found', artifact: entry.artifact, data: entry.data };
    },
  });

  return {
    propose_output: proposeOutputTool,
    finalize_output: finalizeOutputTool,
    list_proposals: listProposalsTool,
    review_proposal: reviewProposalTool,
  };
}

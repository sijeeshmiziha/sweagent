/**
 * sweagent MCP server - stdio entry point.
 * Exposes all sweagent agent modules as MCP tools.
 *
 * Usage:
 *   node dist/mcp-server.js
 *   npx sweagent
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createSweagentServer } from './lib/mcp/server/server';
import { TOOL_REGISTRY } from './lib/mcp/server/tool-registry';

const log = (msg: string): void => {
  process.stderr.write(`[sweagent] ${msg}\n`);
};

try {
  const server = createSweagentServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log(`MCP server running (stdio) — ${TOOL_REGISTRY.length} tools registered`);
} catch (err) {
  log(`Failed to start: ${err}`);
  process.exit(1);
}

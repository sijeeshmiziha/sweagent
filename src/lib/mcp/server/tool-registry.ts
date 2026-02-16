/**
 * MCP server tool registry - maps every sweagent module to an MCP tool entry.
 */

import type { AgentStep } from '../../types/agent';
import type { ModelConfig } from '../../types/model';
import type { AgentToolEntry } from './types';

import { runPlanningAgent } from '../../../modules/planning';
import { runRequirementGathererAgent } from '../../../modules/requirement-gatherer';
import { runDataModelerAgent } from '../../../modules/data-modeler';
import { runApiDesignerAgent } from '../../../modules/api-designer';
import { runAuthDesignerAgent } from '../../../modules/auth-designer';
import { runBackendArchitectAgent } from '../../../modules/backend-architect';
import { runFrontendArchitectAgent } from '../../../modules/frontend-architect';
import { runExpressBuilderAgent } from '../../../modules/express-builder';
import { runApolloBuilderAgent } from '../../../modules/apollo-builder';
import { runReactBuilderAgent } from '../../../modules/react-builder';
import { runNextjsBuilderAgent } from '../../../modules/nextjs-builder';
import { runExecutionPlannerAgent } from '../../../modules/execution-planner';
import { runHelloWorldAgent } from '../../../modules/hello-world';

function entry(
  name: string,
  description: string,
  runner: (cfg: {
    input: string;
    model?: ModelConfig;
    onStep?: (step: AgentStep) => void;
  }) => Promise<{ output: string }>
): AgentToolEntry {
  return {
    name,
    description,
    handler: (input, model, onStep) =>
      runner({ input, model, onStep }) as ReturnType<AgentToolEntry['handler']>,
  };
}

/** All registered agent tools, keyed by tool name. */
export const TOOL_REGISTRY: AgentToolEntry[] = [
  entry(
    'plan',
    'Generate a full software plan (discovery, requirements, design, synthesis) from a project description.',
    runPlanningAgent
  ),
  entry(
    'gather_requirements',
    'Extract structured requirements (actors, flows, stories, modules) from a project description.',
    runRequirementGathererAgent
  ),
  entry(
    'design_data_model',
    'Design a database schema (MongoDB or PostgreSQL) with entities, relations, and indexes.',
    runDataModelerAgent
  ),
  entry(
    'design_api',
    'Design REST or GraphQL API contracts (endpoints, request/response schemas) from requirements.',
    runApiDesignerAgent
  ),
  entry(
    'design_auth',
    'Design authentication and authorization strategy (providers, roles, permissions, flows).',
    runAuthDesignerAgent
  ),
  entry(
    'architect_backend',
    'Design backend architecture (folder structure, services, middleware, deployment) from requirements.',
    runBackendArchitectAgent
  ),
  entry(
    'architect_frontend',
    'Design frontend architecture (components, state management, routing, styling) from requirements.',
    runFrontendArchitectAgent
  ),
  entry(
    'build_express',
    'Generate Express.js REST API configuration and boilerplate from an API design.',
    cfg => runExpressBuilderAgent({ ...cfg, disableScaffold: true })
  ),
  entry(
    'build_apollo',
    'Generate Apollo GraphQL subgraph configuration and resolvers from an API design.',
    cfg => runApolloBuilderAgent({ ...cfg, disableScaffold: true })
  ),
  entry(
    'build_react',
    'Generate React + Vite application configuration and components from a GraphQL schema.',
    cfg => runReactBuilderAgent({ ...cfg, disableScaffold: true })
  ),
  entry(
    'build_nextjs',
    'Generate Next.js App Router configuration and pages from requirements.',
    runNextjsBuilderAgent
  ),
  entry(
    'plan_execution',
    'Create a phased execution plan with edge-case analysis and testing strategy.',
    runExecutionPlannerAgent
  ),
  entry(
    'hello_world',
    'Test agent that greets users. Use to verify the MCP server is working.',
    runHelloWorldAgent
  ),
];

/** Lookup a tool by name. Returns undefined if not found. */
export function findTool(name: string): AgentToolEntry | undefined {
  return TOOL_REGISTRY.find(t => t.name === name);
}

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
import { runFullPipelineAgent } from '../../../modules/full-pipeline';

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
    'create_app',
    'Run the full pipeline (requirements, data model, API, auth, backend, frontend, execution plan) from a single project description. Returns a combined specification document with all layers. ' +
      'Input: A natural-language project description. Example: "Project management SaaS with teams, Kanban boards, time tracking, and billing". ' +
      'No prior context needed -- this tool chains all 7 agents automatically, passing each output as context to the next.',
    runFullPipelineAgent
  ),
  entry(
    'plan',
    'Generate a full software plan (discovery, requirements, design, synthesis) from a project description. Returns an 11-section markdown blueprint covering tech stack, data models, API routes, auth, implementation order, edge cases, and testing. ' +
      'Input: A natural-language project description. Example: "E-commerce site with users, products, cart, checkout, and admin dashboard". ' +
      'No prior context needed -- lighter and faster than create_app when you only need a high-level plan.',
    runPlanningAgent
  ),
  entry(
    'gather_requirements',
    'Extract structured requirements (actors, flows, stories, modules) from a project description. Returns JSON with actors and permissions, user flows with steps, user stories with acceptance criteria, modules with CRUD operations, and database/API outlines. ' +
      'Input: A natural-language project description. Example: "Task manager with teams, Kanban boards, and time tracking". ' +
      'No prior context needed -- use this as a standalone first step before calling specialist tools.',
    runRequirementGathererAgent
  ),
  entry(
    'design_data_model',
    'Design a database schema (MongoDB or PostgreSQL) with entities, fields, indexes, relationships, and validation rules. ' +
      'Input: Requirements or a project description that lists the entities and relationships to model. Best results when you include the output from gather_requirements. ' +
      'Example input: "Design a data model based on these requirements: {paste requirements JSON here}".',
    runDataModelerAgent
  ),
  entry(
    'design_api',
    'Design REST or GraphQL API contracts with endpoints, methods, request/response schemas, and auth requirements. ' +
      'Input: A data model and/or requirements describing the resources and operations. Best results when you include both the data model output and the requirements output. ' +
      'Example input: "Design the API -- Data Model: {data model JSON} -- Requirements: {requirements JSON}".',
    runApiDesignerAgent
  ),
  entry(
    'design_auth',
    'Design authentication and authorization strategy including providers, roles, permissions, flows, middleware, and security policies. ' +
      'Input: Project requirements and/or API design describing the users, roles, and protected resources. Best results when you include the requirements and API design outputs. ' +
      'Example input: "Design auth -- Requirements: {requirements JSON} -- API Design: {api design JSON}".',
    runAuthDesignerAgent
  ),
  entry(
    'architect_backend',
    'Design backend architecture including framework selection, folder structure, services, middleware, routes, and deployment config. ' +
      'Input: The data model, API design, and auth design for the project. Best results when you include all three. ' +
      'Example input: "Design backend -- Data Model: {data model JSON} -- API Design: {api JSON} -- Auth Design: {auth JSON}".',
    runBackendArchitectAgent
  ),
  entry(
    'architect_frontend',
    'Design frontend architecture including pages, components, routing, state management, and styling approach. ' +
      'Input: The API design and requirements for the project. Best results when you include both. ' +
      'Example input: "Design frontend -- API Design: {api JSON} -- Requirements: {requirements JSON}".',
    runFrontendArchitectAgent
  ),
  entry(
    'build_express',
    'Generate Express.js REST API configuration with routers, models, middleware, and environment variables. ' +
      'Input: The data model and API design describing the endpoints and schemas to generate. ' +
      'Example input: "Generate Express API config -- Data Model: {data model JSON} -- API Design: {api JSON}".',
    cfg => runExpressBuilderAgent({ ...cfg, disableScaffold: true })
  ),
  entry(
    'build_apollo',
    'Generate Apollo GraphQL subgraph configuration with modules, types, resolvers, and datasources (Federation v2). ' +
      'Input: The data model and API design (GraphQL style) describing the types and operations. ' +
      'Example input: "Generate Apollo subgraph config -- Data Model: {data model JSON} -- API Design: {api JSON}".',
    cfg => runApolloBuilderAgent({ ...cfg, disableScaffold: true })
  ),
  entry(
    'build_react',
    'Generate React + Vite application configuration with pages, components, fields, API hooks, and branding from a GraphQL schema. ' +
      'Input: A GraphQL schema or frontend design describing the types and operations to build UI for. ' +
      'Example input: "Generate React config -- Frontend Design: {frontend JSON} -- API Design: {api JSON}".',
    cfg => runReactBuilderAgent({ ...cfg, disableScaffold: true })
  ),
  entry(
    'build_nextjs',
    'Generate Next.js App Router configuration with pages, layouts, API routes, server actions, and middleware. ' +
      'Input: The frontend design and API design describing the pages and data fetching requirements. ' +
      'Example input: "Generate Next.js config -- Frontend Design: {frontend JSON} -- API Design: {api JSON}".',
    runNextjsBuilderAgent
  ),
  entry(
    'plan_execution',
    'Create a phased execution plan with implementation order, edge-case analysis, security/performance notes, and testing strategy. ' +
      'Input: All prior design outputs (requirements, data model, API, auth, backend, frontend). Best results when you include as much context as possible. ' +
      'Example input: "Create execution plan -- Requirements: {requirements} -- Data Model: {data model} -- API: {api} -- Auth: {auth} -- Backend: {backend} -- Frontend: {frontend}".',
    runExecutionPlannerAgent
  ),
  entry(
    'hello_world',
    'Test agent that greets users. Use to verify the MCP server is working. ' +
      'Input: Any greeting or test message. Example: "Say hello".',
    runHelloWorldAgent
  ),
];

/** Lookup a tool by name. Returns undefined if not found. */
export function findTool(name: string): AgentToolEntry | undefined {
  return TOOL_REGISTRY.find(t => t.name === name);
}

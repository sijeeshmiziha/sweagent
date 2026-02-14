/**
 * Example: React Builder Agent
 *
 * Runs the react-builder orchestrator agent to generate frontend configuration
 * JSON from a GraphQL schema. Uses graphql-analyzer and config-validator subagents.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 01-react-builder-agent.ts
 */
import { runReactBuilderAgent, createLogger } from 'sweagent';
import type { AgentStep } from 'sweagent';

const logger = createLogger({
  name: 'react-builder',
  level: 'info',
  pretty: true,
});

const DEFAULT_INPUT = `type Query { user(id: ID!): User users: [User!]! }
type Mutation { createUser(name: String!, email: String!): User }
type User { id: ID! name: String! email: String! }`;

async function main() {
  logger.info('React Builder Agent started');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput = process.env.AGENT_INPUT ?? process.env.GRAPHQL_SCHEMA ?? DEFAULT_INPUT;
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

  const result = await runReactBuilderAgent({
    input: agentInput,
    model: { provider, model: modelName },
    maxIterations,
    logger,
    onStep: (step: AgentStep) => {
      const stepNum = step.iteration + 1;

      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          const args = tc.input as Record<string, unknown>;
          const preview =
            typeof args.graphqlSchema === 'string'
              ? args.graphqlSchema.slice(0, 60) + (args.graphqlSchema.length > 60 ? '...' : '')
              : typeof args.prompt === 'string'
                ? args.prompt.slice(0, 60) + '...'
                : JSON.stringify(args).slice(0, 80);
          logger.debug('Step', { stepNum, tool: tc.toolName, preview });
        }
      } else if (step.content) {
        const preview = step.content.slice(0, 100) ?? '';
        logger.debug('Step response', { stepNum, preview });
      }

      if (step.toolResults?.length) {
        for (const tr of step.toolResults) {
          const status = tr.isError ? 'ERROR' : 'OK';
          logger.debug('Tool result', { toolName: tr.toolName, status });
        }
      }

      if (step.usage) {
        logger.debug('Step usage', step.usage);
      }
    },
  });

  logger.info('Agent completed', { steps: result.steps.length, hasOutput: !!result.output });
  console.log('--- Final output ---');
  console.log(result.output);
  console.log(`\nTotal steps: ${result.steps.length}`);
  if (result.totalUsage) {
    console.log(
      `Total tokens: input=${result.totalUsage.inputTokens ?? 0} output=${result.totalUsage.outputTokens ?? 0}`
    );
  }
}

main().catch(console.error);

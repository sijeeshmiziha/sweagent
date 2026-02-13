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
import { runReactBuilderAgent } from 'sweagent';
import type { AgentStep } from 'sweagent';

const DEFAULT_INPUT = `type Query { user(id: ID!): User users: [User!]! }
type Mutation { createUser(name: String!, email: String!): User }
type User { id: ID! name: String! email: String! }`;

async function main() {
  console.log('=== React Builder Agent ===\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput = process.env.AGENT_INPUT ?? process.env.GRAPHQL_SCHEMA ?? DEFAULT_INPUT;
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

  const result = await runReactBuilderAgent({
    input: agentInput,
    model: { provider, model: modelName },
    maxIterations,
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
          console.log(`  [Step ${stepNum}] Tool: ${tc.toolName}(${preview})`);
        }
      } else if (step.content) {
        const preview = step.content.slice(0, 100) ?? '';
        console.log(
          `  [Step ${stepNum}] Response: ${preview}${step.content.length > 100 ? '...' : ''}`
        );
      }

      if (step.toolResults?.length) {
        for (const tr of step.toolResults) {
          const status = tr.isError ? 'ERROR' : 'OK';
          const outPreview =
            typeof tr.output === 'string'
              ? tr.output.slice(0, 80) + (tr.output.length > 80 ? '...' : '')
              : JSON.stringify(tr.output).slice(0, 80);
          console.log(`           -> ${tr.toolName} [${status}]: ${outPreview}`);
        }
      }

      if (step.usage) {
        console.log(
          `           tokens: input=${step.usage.inputTokens ?? 0} output=${step.usage.outputTokens ?? 0}`
        );
      }
      console.log();
    },
  });

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

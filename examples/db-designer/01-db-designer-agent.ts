/**
 * Example: DB Designer Agent
 *
 * Runs the db-designer orchestrator agent to generate a MongoDB schema from
 * natural language requirements. Uses entity-analyzer and schema-refiner subagents.
 *
 * Setup:
 *   npm install sweagent
 *   export OPENAI_API_KEY="sk-..."
 *
 * Run:
 *   npx tsx 01-db-designer-agent.ts
 */
import { runDbDesignerAgent } from 'sweagent';
import type { AgentStep } from 'sweagent';

const DEFAULT_INPUT =
  'E-commerce: users, orders, products. Admins manage products. Users place orders and have a profile.';

async function main() {
  console.log('=== DB Designer Agent ===\n');

  const provider = (process.env.PROVIDER ?? 'openai') as 'openai' | 'anthropic' | 'google';
  const modelName = process.env.MODEL ?? 'gpt-4o-mini';
  const agentInput = process.env.AGENT_INPUT ?? process.env.REQUIREMENT ?? DEFAULT_INPUT;
  const maxIterations = Number(process.env.MAX_ITERATIONS ?? '10') || 10;

  const result = await runDbDesignerAgent({
    input: agentInput,
    model: { provider, model: modelName },
    maxIterations,
    onStep: (step: AgentStep) => {
      const stepNum = step.iteration + 1;

      if (step.toolCalls?.length) {
        for (const tc of step.toolCalls) {
          const args = tc.input as Record<string, unknown>;
          const preview =
            typeof args.requirement === 'string'
              ? args.requirement.slice(0, 60) + (args.requirement.length > 60 ? '...' : '')
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

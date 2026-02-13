/**
 * react-builder prompts
 */

export { REACT_BUILDER_SYSTEM_PROMPT } from './system.prompt';
export { REACT_BUILDER_INSTRUCTION, buildInstructionPrompt } from './instruction.prompt';
export {
  EXAMPLE_GRAPHQL_SCHEMA,
  EXAMPLE_JSON_OUTPUT,
  buildExampleShotPrompt,
} from './examples.prompt';
export { buildFeedbackPrompt } from './feedback.prompt';

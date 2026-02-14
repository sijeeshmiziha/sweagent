/**
 * requirement-gatherer prompts
 */

export { REQUIREMENT_GATHERER_SYSTEM_PROMPT } from './system.prompt';
export {
  DISCOVERY_SYSTEM_FRAGMENT,
  DISCOVERY_USER_PROMPT,
  buildDiscoveryPrompt,
} from './discovery.prompt';
export {
  EXTRACT_ACTORS_PROMPT,
  GENERATE_FLOWS_PROMPT,
  GENERATE_STORIES_PROMPT,
  EXTRACT_MODULES_PROMPT,
  buildExtractActorsPrompt,
  buildGenerateFlowsPrompt,
  buildGenerateStoriesPrompt,
  buildExtractModulesPrompt,
} from './requirements.prompt';
export {
  DESIGN_DATABASE_SYSTEM_PROMPT,
  DESIGN_APIS_SYSTEM_PROMPT,
  buildDesignDatabasePrompt,
  buildDesignApisPrompt,
} from './design.prompt';
export {
  SYNTHESIS_SYSTEM_FRAGMENT,
  SYNTHESIS_USER_PROMPT,
  buildSynthesisPrompt,
} from './synthesis.prompt';

/**
 * api-designer module - enterprise API design for REST and GraphQL
 * Exports use 'ad' prefix where needed to avoid conflicts with requirement-gatherer.
 */

export {
  apiDesignSchema as adApiDesignSchema,
  restEndpointSchema as adRestEndpointSchema,
  graphqlOperationSchema as adGraphqlOperationSchema,
  type TApiDesign,
} from './schemas';
export type {
  ApiStyle,
  HttpMethod,
  RestEndpoint as AdRestEndpoint,
  GraphqlOperation as AdGraphqlOperation,
  ApiDesign as AdApiDesign,
  ApiDesignerAgentConfig,
} from './types';
export { API_DESIGNER_SYSTEM_PROMPT } from './prompts';
export {
  validateApiTool,
  createDesignApiTool,
  createDesignApiProTool,
  createApiDesignerTools,
} from './tools';
export { endpointAnalyzerSubagent, contractDesignerSubagent } from './subagents';
export { runApiDesignerAgent } from './agent';

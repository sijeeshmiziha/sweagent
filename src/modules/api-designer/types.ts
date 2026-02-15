/**
 * api-designer module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export type ApiStyle = 'rest' | 'graphql';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RestEndpoint {
  id: string;
  resource: string;
  method: HttpMethod;
  path: string;
  description: string;
  auth: boolean;
  roles: string[];
  requestBody: Record<string, string>;
  responseBody: Record<string, string>;
  queryParams: Record<string, string>;
  validation: string[];
  errorResponses: string[];
}

export interface GraphqlOperation {
  name: string;
  type: 'query' | 'mutation' | 'subscription';
  description: string;
  auth: boolean;
  roles: string[];
  args: { name: string; type: string; required: boolean }[];
  returnType: string;
}

export interface ApiDesign {
  style: ApiStyle;
  baseUrl: string;
  endpoints: RestEndpoint[];
  graphqlOperations: GraphqlOperation[];
}

export interface ApiDesignerAgentConfig {
  /** User input: natural language description or data model + requirements */
  input: string;
  /** Model config; defaults to gpt-4o-mini */
  model?: ModelConfig;
  /** Max iterations; default 15 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Optional logger */
  logger?: Logger;
}

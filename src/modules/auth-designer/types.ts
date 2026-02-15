/**
 * auth-designer module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export type AuthStrategy = 'jwt' | 'session' | 'oauth';

export interface AuthFlow {
  name: string;
  description: string;
  steps: AuthFlowStep[];
}

export interface AuthFlowStep {
  order: number;
  side: 'frontend' | 'backend';
  action: string;
  details: string;
}

export interface AuthMiddleware {
  name: string;
  purpose: string;
  behavior: string[];
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
}

export interface SecurityPolicy {
  area: string;
  rules: string[];
}

export interface AuthDesign {
  strategy: AuthStrategy;
  flows: AuthFlow[];
  middleware: AuthMiddleware[];
  roles: RoleDefinition[];
  policies: SecurityPolicy[];
}

export interface AuthDesignerAgentConfig {
  /** User input: project context and auth requirements */
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

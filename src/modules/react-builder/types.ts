/**
 * react-builder module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export interface AppInfo {
  projectName?: string;
  projectDescription?: string;
  modules?: string;
  apiEndpoint?: string;
}

export interface ReactBuilderAgentConfig {
  /** User input: GraphQL schema string or instruction */
  input: string;
  /** Optional app info (project name, description, modules list) for context */
  appInfo?: AppInfo;
  /** Model config; optional */
  model?: ModelConfig;
  /** Max iterations; default 15 */
  maxIterations?: number;
  /** Callback for each step */
  onStep?: (step: AgentStep) => void;
  /** Optional logger for execution logs */
  logger?: Logger;
  /** When true, exclude scaffold tools that write files to disk (used in MCP mode) */
  disableScaffold?: boolean;
}

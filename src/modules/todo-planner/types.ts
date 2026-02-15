/**
 * todo-planner module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'trivial' | 'small' | 'medium' | 'large';
  category:
    | 'setup'
    | 'data'
    | 'api'
    | 'auth'
    | 'frontend'
    | 'backend'
    | 'testing'
    | 'devops'
    | 'documentation';
  dependsOn: string[];
  acceptanceCriteria: string[];
  filesLikelyAffected: string[];
  status: 'pending' | 'in_progress' | 'done' | 'blocked';
}

export interface Risk {
  description: string;
  mitigation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface TodoPlan {
  problem: string;
  analysis: string;
  todos: TodoItem[];
  executionOrder: string[];
  estimatedTotalEffort: string;
  risks: Risk[];
}

export interface TodoPlannerAgentConfig {
  /** Problem or task description to decompose */
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

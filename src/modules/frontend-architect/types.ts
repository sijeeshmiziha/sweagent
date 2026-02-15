/**
 * frontend-architect module types
 */

import type { AgentStep } from '../../lib/types/agent';
import type { Logger } from '../../lib/types/common';
import type { ModelConfig } from '../../lib/types/model';

export type PageAccess = 'public' | 'protected';

export interface FormField {
  name: string;
  type: string;
  required: boolean;
  validation: string;
}

export interface PageDesign {
  path: string;
  name: string;
  access: PageAccess;
  purpose: string;
  formFields: FormField[];
  actions: string[];
  emptyState: string;
  errorState: string;
  redirectOnSuccess: string;
  keyUiElements: string[];
}

export interface ComponentDesign {
  name: string;
  type: 'layout' | 'shared' | 'form' | 'display' | 'navigation';
  purpose: string;
  props: string[];
  usedIn: string[];
}

export interface FrontendDesign {
  pages: PageDesign[];
  components: ComponentDesign[];
  stateManagement: string;
  routingNotes: string;
}

export interface FrontendArchitectAgentConfig {
  /** User input: project context, API surface, and frontend requirements */
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

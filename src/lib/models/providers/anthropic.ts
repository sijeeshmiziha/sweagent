/**
 * Anthropic model provider using the official @anthropic-ai/sdk package
 */

import type { Model, ModelConfig } from '../../types/model';
import { createAnthropicModel as createAnthropicAdapter } from './anthropic-adapter';

/**
 * Create an Anthropic model instance
 */
export function createAnthropicModel(config: ModelConfig): Model {
  return createAnthropicAdapter({
    model: config.model,
    apiKey: config.apiKey,
  });
}

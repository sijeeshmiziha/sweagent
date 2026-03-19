/**
 * OpenAI model provider using the official openai package
 */

import type { Model, ModelConfig } from '../../types/model';
import { createOpenAIModel as createOpenAIAdapter } from './openai-adapter';

/**
 * Create an OpenAI model instance
 */
export function createOpenAIModel(config: ModelConfig): Model {
  return createOpenAIAdapter({
    model: config.model,
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
  });
}

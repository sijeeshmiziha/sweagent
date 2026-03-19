/**
 * Google (Gemini) model provider using the official @google/genai package
 */

import type { Model, ModelConfig } from '../../types/model';
import { createGoogleModel as createGoogleAdapter } from './google-adapter';

/**
 * Create a Google (Gemini) model instance
 */
export function createGoogleModel(config: ModelConfig): Model {
  return createGoogleAdapter({
    model: config.model,
    apiKey: config.apiKey,
  });
}

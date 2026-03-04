/**
 * Best-of-N generation: produce multiple LLM responses and select the best.
 * Adapted from redxpilot's GENERATE_N pattern.
 */

import type { Model } from '../types/model';
import type { ModelMessage } from '../types/common';
import type { InvokeOptions, ModelResponse } from '../types/model';
import type { Logger } from '../types/common';

export interface GenerateNOptions {
  model: Model;
  messages: ModelMessage[];
  n: number;
  invokeOptions?: InvokeOptions;
  logger?: Logger;
}

export interface GenerateNResult {
  responses: ModelResponse[];
  texts: string[];
}

/**
 * Generate N independent responses from the model for the same message context.
 * Returns all responses so a selector can choose the best one.
 */
export async function generateNResponses(options: GenerateNOptions): Promise<GenerateNResult> {
  const { model, messages, n, invokeOptions, logger } = options;
  logger?.info('Generating N responses', { n });

  const promises = Array.from({ length: n }, () => model.invoke(messages, invokeOptions));
  const responses = await Promise.all(promises);
  const texts = responses.map(r => r.text);

  logger?.info('Generated N responses', { n, lengths: texts.map(t => t.length) });
  return { responses, texts };
}

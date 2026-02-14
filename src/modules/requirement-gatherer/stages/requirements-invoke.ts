/**
 * Requirements stage: structured output via invokeObject, or invoke + parse
 */

import type { Logger } from '../../../lib/types/common';
import type { Model } from '../../../lib/types/model';
import type { ModelMessage } from '../../../lib/types/common';
import type { ActorResult, FlowsResult, StoriesResult, ModulesResult } from '../schemas';
import {
  actorsResultSchema,
  flowsResultSchema,
  storiesResultSchema,
  modulesResultSchema,
} from '../schemas';
import { extractJson, safeParseJson } from './base';

export async function getActors(
  model: Model,
  messages: ModelMessage[],
  _logger?: Logger
): Promise<ActorResult> {
  if (model.invokeObject) {
    const result = await model.invokeObject<ActorResult>(messages, actorsResultSchema, {
      temperature: 0.4,
      maxOutputTokens: 4096,
    });
    return result.data;
  }
  const response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 4096 });
  const parsed = safeParseJson(extractJson(response.text));
  if (!parsed.success) throw new Error(`Actors: ${parsed.error}`);
  const validated = actorsResultSchema.safeParse(parsed.data);
  if (!validated.success) throw new Error(`Actors schema: ${validated.error.message}`);
  return validated.data;
}

export async function getFlows(
  model: Model,
  messages: ModelMessage[],
  _actors: ActorResult['actors'],
  _logger?: Logger
): Promise<FlowsResult> {
  if (model.invokeObject) {
    const result = await model.invokeObject<FlowsResult>(messages, flowsResultSchema, {
      temperature: 0.4,
      maxOutputTokens: 8192,
    });
    return result.data;
  }
  const response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 8192 });
  const parsed = safeParseJson(extractJson(response.text));
  if (!parsed.success) throw new Error(`Flows: ${parsed.error}`);
  const validated = flowsResultSchema.safeParse(parsed.data);
  if (!validated.success) throw new Error(`Flows schema: ${validated.error.message}`);
  return validated.data;
}

export async function getStories(
  model: Model,
  messages: ModelMessage[],
  _actors: ActorResult['actors'],
  _flows: FlowsResult['flows'],
  _logger?: Logger
): Promise<StoriesResult> {
  if (model.invokeObject) {
    const result = await model.invokeObject<StoriesResult>(messages, storiesResultSchema, {
      temperature: 0.4,
      maxOutputTokens: 16384,
    });
    return result.data;
  }
  const response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 16384 });
  const parsed = safeParseJson(extractJson(response.text));
  if (!parsed.success) throw new Error(`Stories: ${parsed.error}`);
  const validated = storiesResultSchema.safeParse(parsed.data);
  if (!validated.success) throw new Error(`Stories schema: ${validated.error.message}`);
  return validated.data;
}

export async function getModules(
  model: Model,
  messages: ModelMessage[],
  _actors: ActorResult['actors'],
  _flows: FlowsResult['flows'],
  _stories: StoriesResult['stories'],
  _logger?: Logger
): Promise<ModulesResult> {
  if (model.invokeObject) {
    const result = await model.invokeObject<ModulesResult>(messages, modulesResultSchema, {
      temperature: 0.4,
      maxOutputTokens: 16384,
    });
    return result.data;
  }
  const response = await model.invoke(messages, { temperature: 0.4, maxOutputTokens: 16384 });
  const parsed = safeParseJson(extractJson(response.text));
  if (!parsed.success) throw new Error(`Modules: ${parsed.error}`);
  const validated = modulesResultSchema.safeParse(parsed.data);
  if (!validated.success) throw new Error(`Modules schema: ${validated.error.message}`);
  return validated.data;
}

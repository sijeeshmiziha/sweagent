/**
 * Requirements stage prompts - actors, flows, stories, modules (chained)
 */

const PROJECT_BLOCK = `## Project:
- **Name**: {projectName}
- **Goal**: {projectGoal}
- **Features**: {projectFeatures}`;

export const EXTRACT_ACTORS_PROMPT = `${PROJECT_BLOCK}

Identify ALL distinct user types (actors) who will use this system. 2-5 actors. Include unauthenticated and admin roles if applicable.

Return ONLY valid JSON:
{
  "actors": [
    { "id": "actor-1", "name": "Name", "description": "Who they are", "goals": ["goal1", "goal2"] }
  ],
  "message": "Brief explanation"
}`;

export const GENERATE_FLOWS_PROMPT = `${PROJECT_BLOCK}

## Actors (JSON):
{actors}

For EACH actor, identify 2-5 key user journeys (flows). Each flow: id, actorId, name, description, trigger, outcome.

Return ONLY valid JSON:
{
  "flows": [
    { "id": "flow-1", "actorId": "actor-1", "name": "Flow Name", "description": "...", "trigger": "...", "outcome": "..." }
  ],
  "message": "Brief explanation"
}`;

export const GENERATE_STORIES_PROMPT = `${PROJECT_BLOCK}

## Actors: {actors}

## Flows (JSON):
{flows}

For EACH flow, generate 2-5 user stories. Each story MUST include dataInvolved (entity.field names) for DB design. Include preconditions, postconditions.

Return ONLY valid JSON:
{
  "stories": [
    { "id": "story-1", "flowId": "flow-1", "actor": "ActorName", "action": "...", "benefit": "...", "preconditions": [], "postconditions": [], "dataInvolved": ["User.email", "Order.total"] }
  ],
  "message": "Brief explanation"
}`;

export const EXTRACT_MODULES_PROMPT = `${PROJECT_BLOCK}

## Actors: {actors}
## Flows: {flows}
## Stories (JSON):
{stories}

Extract modules (one per major entity). Each module has apis: create, read, readAll, update, delete plus any extra (e.g. searchUsers). CamelCase names. Clear inputs/outputs.

Return ONLY valid JSON:
{
  "modules": [
    { "id": "module-1", "name": "User", "description": "...", "entity": "User", "apis": [ { "id": "api-1-1", "name": "createUser", "operation": "create", "description": "...", "inputs": [], "outputs": [] } ] }
  ],
  "summary": { "totalModules": 0, "totalApis": 0 },
  "message": "Brief explanation"
}`;

export function buildExtractActorsPrompt(
  projectName: string,
  projectGoal: string,
  projectFeatures: string
): string {
  return EXTRACT_ACTORS_PROMPT.replace('{projectName}', projectName)
    .replace('{projectGoal}', projectGoal)
    .replace('{projectFeatures}', projectFeatures);
}

export function buildGenerateFlowsPrompt(
  projectName: string,
  projectGoal: string,
  projectFeatures: string,
  actorsJson: string
): string {
  return GENERATE_FLOWS_PROMPT.replace('{projectName}', projectName)
    .replace('{projectGoal}', projectGoal)
    .replace('{projectFeatures}', projectFeatures)
    .replace('{actors}', actorsJson);
}

export function buildGenerateStoriesPrompt(
  projectName: string,
  projectGoal: string,
  projectFeatures: string,
  actorsJson: string,
  flowsJson: string
): string {
  return GENERATE_STORIES_PROMPT.replace('{projectName}', projectName)
    .replace('{projectGoal}', projectGoal)
    .replace('{projectFeatures}', projectFeatures)
    .replace('{actors}', actorsJson)
    .replace('{flows}', flowsJson);
}

export function buildExtractModulesPrompt(
  projectName: string,
  projectGoal: string,
  projectFeatures: string,
  actorsJson: string,
  flowsJson: string,
  storiesJson: string
): string {
  return EXTRACT_MODULES_PROMPT.replace('{projectName}', projectName)
    .replace('{projectGoal}', projectGoal)
    .replace('{projectFeatures}', projectFeatures)
    .replace('{actors}', actorsJson)
    .replace('{flows}', flowsJson)
    .replace('{stories}', storiesJson);
}

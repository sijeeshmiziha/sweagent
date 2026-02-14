/**
 * Synthesis stage prompt - compile FinalRequirement document
 */

export const SYNTHESIS_SYSTEM_FRAGMENT = `You are in the complete stage. You have the full context: project brief, actors, flows, stories, modules, database design, and API design. Your job is to produce a single final requirement document (JSON) that matches the FinalRequirement schema, with a summary that includes totalActors, totalFlows, totalStories, totalModules, totalEntities, totalEndpoints, and a short overview paragraph.`;

export const SYNTHESIS_USER_PROMPT = `## Project brief (JSON):
{projectBrief}

## Actors (JSON):
{actors}

## Flows (JSON):
{flows}

## Stories (JSON):
{stories}

## Modules (JSON):
{modules}

## Database design (JSON):
{database}

## API design (JSON):
{apiDesign}

Compile the above into one FinalRequirement JSON. Include a "summary" object with: totalActors, totalFlows, totalStories, totalModules, totalEntities (from database.entities.length), totalEndpoints (count of REST endpoints or GraphQL queries+mutations as appropriate), and "overview" (2-4 sentence paragraph summarizing the project and tech choices).

Return ONLY valid JSON in this shape (no markdown, no extra text):
{
  "project": { ... },
  "actors": [ ... ],
  "flows": [ ... ],
  "stories": [ ... ],
  "modules": [ ... ],
  "database": { ... },
  "apiDesign": { ... },
  "summary": {
    "totalActors": 0,
    "totalFlows": 0,
    "totalStories": 0,
    "totalModules": 0,
    "totalEntities": 0,
    "totalEndpoints": 0,
    "overview": "string"
  }
}`;

export function buildSynthesisPrompt(
  projectBrief: string,
  actors: string,
  flows: string,
  stories: string,
  modules: string,
  database: string,
  apiDesign: string
): string {
  return SYNTHESIS_USER_PROMPT.replace('{projectBrief}', projectBrief)
    .replace('{actors}', actors)
    .replace('{flows}', flows)
    .replace('{stories}', stories)
    .replace('{modules}', modules)
    .replace('{database}', database)
    .replace('{apiDesign}', apiDesign);
}

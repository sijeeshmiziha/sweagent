/**
 * Prompt for analyze_project_info (InfoProcessing)
 */

export const ANALYZE_BASIC_INFO_PROMPT = `You are analyzing a project to determine if clarification is needed for generating comprehensive USER STORIES.

## Project Information:
- **Name**: {projectName}
- **Goal**: {projectGoal}
- **Features/Requirements**:
{projectFeatures}

## CRITICAL INSTRUCTION:
Your PRIMARY goal is to generate detailed USER STORIES that can inform database design.

**ONLY ask questions if genuinely unclear about user stories.**
If the provided information is sufficient to create comprehensive user stories with:
- Clear actors (who uses the system)
- Clear actions (what they do)
- Clear benefits (why they do it)
- Implied data entities (what data is involved)

Then set "needsClarification" to FALSE and return empty questions array.

## When Questions ARE Needed:
Only ask about aspects that directly impact user stories:
1. **User Types**: Who are the different actors? (multiSelect: true if multiple roles)
2. **User Actions**: What key actions can each user perform?
3. **Data Flows**: What data does the user create, read, update, delete?
4. **User Journeys**: What are the main workflows from user's perspective?

## Question Rules:
- Maximum 3 questions (prefer fewer)
- Each question must directly help clarify a user story
- Set multiSelect: true if user can select multiple valid answers
- Set required: true only if critical for user story generation
- Provide helpful suggestions (3-5 options per question)

DO NOT ask about:
- Technical implementation (databases, frameworks)
- Infrastructure, deployment, timeline
- Non-functional requirements

Return as JSON:
{
  "needsClarification": boolean,
  "questions": [
    {
      "id": "q1",
      "question": "Question that helps clarify user stories",
      "context": "How this helps define user stories",
      "suggestions": ["Option 1", "Option 2", "Option 3"],
      "multiSelect": boolean,
      "required": boolean
    }
  ],
  "conversationalMessage": "Brief message explaining what you understood or why you need clarification",
  "projectAnalysis": {
    "identifiedActors": ["User types you detected"],
    "potentialEpics": ["High-level epic names"],
    "dataEntitiesDetected": ["Data entities mentioned or implied"],
    "complexity": "low|medium|high|very_high",
    "projectType": "web-app|api|fullstack|mobile|other"
  }
}`;

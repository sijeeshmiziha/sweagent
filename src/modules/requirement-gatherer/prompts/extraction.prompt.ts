/**
 * Prompts for actors, flows, and stories extraction
 */

export const EXTRACT_ACTORS_PROMPT = `You are analyzing a project to identify all user types (actors) who will interact with the system.

## Project Information:
- **Name**: {projectName}
- **Goal**: {projectGoal}
- **Features/Requirements**:
{projectFeatures}

## Your Task:
Identify ALL distinct user types/actors who will use this system. Think like a developer analyzing a Figma design:
- Who are the different people using this app?
- What distinguishes each user type?
- What are their primary goals?

## Guidelines:
- Identify 2-5 distinct actors (avoid over-complication)
- Include both authenticated and unauthenticated users if applicable
- Consider admin/management roles if implied
- Each actor should have clear, distinct goals

Return as JSON:
{
  "actors": [
    {
      "id": "actor-1",
      "name": "User Type Name (e.g., Customer, Admin, Guest)",
      "description": "Clear description of who this actor is",
      "goals": ["Primary goal 1", "Primary goal 2", "Primary goal 3"]
    }
  ],
  "message": "Brief explanation of the identified actors"
}`;

export const GENERATE_FLOWS_PROMPT = `You are mapping out user journeys for each actor in the system.

## Project Information:
- **Name**: {projectName}
- **Goal**: {projectGoal}
- **Features/Requirements**:
{projectFeatures}

## Confirmed Actors:
{actors}

## Your Task:
For EACH actor, identify their key user journeys/workflows. Think like a developer:
- What are the main things each actor does in the app?
- What triggers each workflow?
- What is the expected outcome?

## Guidelines:
- 2-5 flows per actor (focus on important ones)
- Each flow should be a complete user journey
- Include both happy paths and key alternative paths
- Flows should be distinct, not overlapping

Return as JSON:
{
  "flows": [
    {
      "id": "flow-1",
      "actorId": "actor-1",
      "name": "Flow Name (e.g., User Registration, Product Purchase)",
      "description": "Brief description of this flow",
      "trigger": "What starts this flow (e.g., User clicks Sign Up)",
      "outcome": "Expected result (e.g., User account created, email sent)"
    }
  ],
  "message": "Brief explanation of the identified flows"
}`;

export const GENERATE_STORIES_PROMPT = `You are generating detailed user stories for each user flow.

## Project Information:
- **Name**: {projectName}
- **Goal**: {projectGoal}

## Confirmed Actors:
{actors}

## Confirmed Flows:
{flows}

## Your Task:
For EACH flow, generate detailed user stories. These stories will be used to:
1. Design the database schema
2. Define API endpoints
3. Build frontend components

## Story Format:
Each story must include:
- **Actor**: Which user type performs this action
- **Action**: Specific action (be detailed)
- **Benefit**: Why they do this
- **Preconditions**: What must be true before this action
- **Postconditions**: What changes after this action
- **Data Involved**: Specific data entities and fields touched (CRITICAL for DB design)

## Guidelines:
- 2-5 stories per flow
- Be specific about data involved (e.g., "User.email", "Order.items", "Product.stock")
- Include CRUD operations (Create, Read, Update, Delete)
- Consider validation and error states

Return as JSON:
{
  "stories": [
    {
      "id": "story-1",
      "flowId": "flow-1",
      "actor": "Customer",
      "action": "Create a new account with email and password",
      "benefit": "Access personalized features and save preferences",
      "preconditions": ["User has valid email", "User is not already registered"],
      "postconditions": ["Account created in database", "Verification email sent", "Session started"],
      "dataInvolved": ["User.email", "User.passwordHash", "User.createdAt", "User.isVerified", "VerificationToken.token"]
    }
  ],
  "message": "Brief explanation of the generated stories"
}`;

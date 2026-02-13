/**
 * Prompt for extract_modules
 */

export const EXTRACT_MODULES_PROMPT = `You are extracting application modules from user stories to design the API structure.

## Project Information:
- **Name**: {projectName}
- **Goal**: {projectGoal}
- **Features**: {projectFeatures}

## User Types (Actors):
{actors}

## User Journeys (Flows):
{flows}

## User Stories:
{stories}

## Your Task:
Analyze ALL user stories and identify modules grouped by data entity:
1. **Modules**: Each major entity becomes a module (e.g., User, Order, Product)
2. **CRUD APIs**: Action-based APIs for each module

## Guidelines:
- One module per major entity identified in stories
- Standard CRUD operations: create, read, readAll, update, delete
- Add additional operations if implied by stories (e.g., searchUsers, verifyEmail)
- Consider which actors will use each API
- Match APIs to the flows they support
- Clear input/output specifications based on entity fields from dataInvolved
- API names follow camelCase convention (e.g., createUser, getUser, updateUser, deleteUser)

Return as JSON:
{
  "modules": [
    {
      "id": "module-1",
      "name": "User",
      "description": "User account management",
      "entity": "User",
      "apis": [
        {
          "id": "api-1-1",
          "name": "createUser",
          "operation": "create",
          "description": "Create a new user account",
          "inputs": ["email", "password", "name"],
          "outputs": ["User"]
        },
        {
          "id": "api-1-2",
          "name": "getUser",
          "operation": "read",
          "description": "Get user by ID",
          "inputs": ["userId"],
          "outputs": ["User"]
        },
        {
          "id": "api-1-3",
          "name": "getAllUsers",
          "operation": "readAll",
          "description": "Get all users with optional filters",
          "inputs": ["filters", "pagination"],
          "outputs": ["User[]"]
        },
        {
          "id": "api-1-4",
          "name": "updateUser",
          "operation": "update",
          "description": "Update user details",
          "inputs": ["userId", "updates"],
          "outputs": ["User"]
        },
        {
          "id": "api-1-5",
          "name": "deleteUser",
          "operation": "delete",
          "description": "Delete a user account",
          "inputs": ["userId"],
          "outputs": ["boolean"]
        }
      ]
    }
  ],
  "summary": {
    "totalModules": 3,
    "totalApis": 15
  },
  "message": "Brief explanation of the extracted modules and APIs"
}`;

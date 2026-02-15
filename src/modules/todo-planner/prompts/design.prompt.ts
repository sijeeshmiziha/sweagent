/**
 * Design prompt for todo plan generation
 */

export const TODO_PLAN_PROMPT = `## Problem / Task

{problem}

## Instructions

Analyze this problem and produce a structured TodoPlan as JSON.

### Step 1: Analysis
Break down the problem into sub-problems. Identify:
- What domains are involved (data, API, frontend, backend, auth, etc.)
- What are the constraints and unknowns
- What is the current state vs desired end state

### Step 2: Task Decomposition
Create individual todo items. For each:
- Give it a unique id (todo-1, todo-2, ...)
- Write a clear action-oriented title
- Write a detailed description of exactly what to do
- Assign priority (critical > high > medium > low)
- Estimate effort (trivial, small, medium, large)
- Categorize it (setup, data, api, auth, frontend, backend, testing, devops, documentation)
- List acceptance criteria (how to verify it's done)
- List files likely affected (if known)

### Step 3: Dependency Resolution
- Identify which tasks depend on others
- Set dependsOn arrays correctly
- Produce executionOrder as a topological sort of task IDs
- Ensure no circular dependencies

### Step 4: Risk Assessment
- Identify technical risks or unknowns
- Suggest mitigations for each risk

Return ONLY valid JSON matching this shape:
{
  "problem": "original problem statement",
  "analysis": "2-5 sentences breaking down the problem",
  "todos": [ { "id": "todo-1", "title": "...", "description": "...", "priority": "high", "effort": "small", "category": "setup", "dependsOn": [], "acceptanceCriteria": ["..."], "filesLikelyAffected": ["..."], "status": "pending" } ],
  "executionOrder": ["todo-1", "todo-2", ...],
  "estimatedTotalEffort": "medium (4-6 hours)",
  "risks": [ { "description": "...", "mitigation": "...", "severity": "medium" } ]
}`;

export function buildTodoPlanPrompt(problem: string): string {
  return TODO_PLAN_PROMPT.replace('{problem}', problem);
}

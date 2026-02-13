/**
 * Few-shot examples: example GraphQL schema and expected JSON output (abbreviated)
 */

export const EXAMPLE_GRAPHQL_SCHEMA = `
type Query {
  getCurrentUser: User
  getAllUser(limit: Int, offset: Int): [User]!
}
type Mutation {
  login(data: LoginInput!): Login!
  createUser(data: CreateUserInput!): User!
}
type User {
  _id: ID!
  firstName: String!
  lastName: String!
  email: String!
  role: Role!
}
enum Role { ADMIN TRAINER CLIENT }
input LoginInput { email: String! password: String! }
input CreateUserInput { firstName: String! lastName: String! email: String! role: Role! }
`.trim();

export const EXAMPLE_JSON_OUTPUT = `{
  "app": {
    "name": "my-app",
    "description": "App description",
    "author": "Author",
    "branding": {
      "brandName": "MyBrand",
      "primaryColor": "#333",
      "secondaryColor": "#fff",
      "logo": "https://example.com/logo.png"
    },
    "apiEndpoint": "http://localhost:4000/graphql"
  },
  "modules": [
    {
      "name": "auth",
      "pages": [
        {
          "name": "LoginPage",
          "type": "EmailPassword",
          "route": "/login",
          "isPrivate": false,
          "api": [
            { "type": "login", "graphqlHook": "useLoginMutation", "queryString": "mutation Login($data: LoginInput!) { login(data: $data) { accessToken } }" }
          ]
        }
      ]
    },
    {
      "name": "user",
      "pages": [
        {
          "type": "Listing",
          "name": "UserListPage",
          "route": "/users",
          "isPrivate": true,
          "api": [
            { "type": "list", "graphqlHook": "useGetAllUserQuery", "queryString": "query GetAllUser { getAllUser { _id firstName email } }" },
            { "type": "create", "graphqlHook": "useCreateUserMutation", "queryString": "mutation CreateUser($data: CreateUserInput!) { createUser(data: $data) { _id } }" }
          ],
          "columns": [{ "field": "firstName", "label": "First Name" }, { "field": "email", "label": "Email" }],
          "actions": ["create", "edit", "delete"],
          "drawerCreate": { "title": "Create User", "graphqlHook": "useCreateUserMutation", "fields": [{ "name": "firstName", "type": "text", "required": true }, { "name": "email", "type": "email", "required": true }] },
          "drawerUpdate": { "title": "Edit User", "graphqlHook": "useUpdateUserMutation", "fields": [{ "name": "firstName", "type": "text" }, { "name": "email", "type": "email" }] }
        }
      ]
    }
  ]
}`;

export function buildExampleShotPrompt(): string {
  return `
**Reference Conversion Example**

EXAMPLE GRAPHQL INPUT:
\`\`\`graphql
${EXAMPLE_GRAPHQL_SCHEMA}
\`\`\`

EXPECTED JSON OUTPUT:
\`\`\`json
${EXAMPLE_JSON_OUTPUT}
\`\`\`
`.trim();
}

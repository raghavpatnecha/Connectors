/**
 * MCP Server: GitHub v3 REST API - projects
 * Category: code
 * Version: 1.1.4
 *
 * Auto-generated from OpenAPI specification
 * DO NOT EDIT - Regenerate using openapi-mcp-gen
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosInstance, AxiosError } from "axios";

// Configuration
const API_BASE_URL = "https://api.github.com";

// OAuth Configuration

// Rate limiting state

// API Client
class GitHubv3RESTAPIprojectsClient {
  private client: AxiosInstance;

  constructor(accessToken?: string) {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    // Error interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers["retry-after"];
          throw new Error(
            `Rate limit exceeded. Retry after ${retryAfter || "unknown"} seconds`
          );
        }
        if (error.response?.status === 401) {
          throw new Error("Authentication failed - access token may be expired");
        }
        throw error;
      }
    );
  }

  /**
   * List projects for organization
   */
  async projectslistForOrg(params: {
    None?: string;
    q?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get project for organization
   */
  async projectsgetForOrg(params: {
    None?: string;
    org: string;
    project_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ project_number }}}", String(params.project_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create draft item for organization owned project
   */
  async projectscreateDraftItemForOrg(params: {
    title: string;
    body?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/drafts";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List project fields for organization
   */
  async projectslistFieldsForOrg(params: {
    None?: string;
    org: string;
    project_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/fields";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ project_number }}}", String(params.project_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get project field for organization
   */
  async projectsgetFieldForOrg(params: {
    None?: string;
    org: string;
    project_number: string;
    field_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/fields/{field_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ project_number }}}", String(params.project_number));
    path = path.replace("{{ field_id }}}", String(params.field_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List items for an organization owned project
   */
  async projectslistItemsForOrg(params: {
    None?: string;
    q?: string;
    fields?: ;
    org: string;
    project_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/items";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ project_number }}}", String(params.project_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add item to organization owned project
   */
  async projectsaddItemForOrg(params: {
    type: string;
    id: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/items";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an item for an organization owned project
   */
  async projectsgetOrgItem(params: {
    None?: string;
    fields?: ;
    org: string;
    project_number: string;
    item_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/items/{item_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ project_number }}}", String(params.project_number));
    path = path.replace("{{ item_id }}}", String(params.item_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update project item for organization
   */
  async projectsupdateItemForOrg(params: {
    fields: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/items/{item_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete project item for organization
   */
  async projectsdeleteItemForOrg(params: {
    None?: string;
    org: string;
    project_number: string;
    item_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/projectsV2/{project_number}/items/{item_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ project_number }}}", String(params.project_number));
    path = path.replace("{{ item_id }}}", String(params.item_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create draft item for user owned project
   */
  async projectscreateDraftItemForAuthenticatedUser(params: {
    title: string;
    body?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/{user_id}/projectsV2/{project_number}/drafts";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List projects for user
   */
  async projectslistForUser(params: {
    None?: string;
    q?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get project for user
   */
  async projectsgetForUser(params: {
    None?: string;
    username: string;
    project_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ project_number }}}", String(params.project_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List project fields for user
   */
  async projectslistFieldsForUser(params: {
    None?: string;
    username: string;
    project_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}/fields";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ project_number }}}", String(params.project_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get project field for user
   */
  async projectsgetFieldForUser(params: {
    None?: string;
    username: string;
    project_number: string;
    field_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}/fields/{field_id}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ project_number }}}", String(params.project_number));
    path = path.replace("{{ field_id }}}", String(params.field_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List items for a user owned project
   */
  async projectslistItemsForUser(params: {
    None?: string;
    q?: string;
    fields?: ;
    username: string;
    project_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}/items";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ project_number }}}", String(params.project_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add item to user owned project
   */
  async projectsaddItemForUser(params: {
    type: string;
    id: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}/items";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an item for a user owned project
   */
  async projectsgetUserItem(params: {
    None?: string;
    fields?: ;
    username: string;
    project_number: string;
    item_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}/items/{item_id}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ project_number }}}", String(params.project_number));
    path = path.replace("{{ item_id }}}", String(params.item_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update project item for user
   */
  async projectsupdateItemForUser(params: {
    fields: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}/items/{item_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete project item for user
   */
  async projectsdeleteItemForUser(params: {
    None?: string;
    username: string;
    project_number: string;
    item_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/projectsV2/{project_number}/items/{item_id}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ project_number }}}", String(params.project_number));
    path = path.replace("{{ item_id }}}", String(params.item_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
}

// MCP Server
const server = new Server(
  {
    name: "github-v3-rest-api---projects-31",
    version: "1.1.4",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: "projectslistForOrg",
    description: "List projects for organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        q: {
          type: "string",
          description: "Limit results to projects of the specified type.",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["org"],
    },
  },
  {
    name: "projectsgetForOrg",
    description: "Get project for organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
      },
      required: ["org", "project_number"],
    },
  },
  {
    name: "projectscreateDraftItemForOrg",
    description: "Create draft item for organization owned project",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the draft issue item to create in the project.",
        },
        body: {
          type: "string",
          description: "The body content of the draft issue item to create in the project.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "projectslistFieldsForOrg",
    description: "List project fields for organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
      },
      required: ["org", "project_number"],
    },
  },
  {
    name: "projectsgetFieldForOrg",
    description: "Get project field for organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
        field_id: {
          type: "string",
          description: "Path parameter: field_id",
        },
      },
      required: ["org", "project_number", "field_id"],
    },
  },
  {
    name: "projectslistItemsForOrg",
    description: "List items for an organization owned project",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        q: {
          type: "string",
          description: "Search query to filter items, see [Filtering projects](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects) for more information.",
        },
        fields: {
          type: "",
          description: "Limit results to specific fields, by their IDs. If not specified, the title field will be returned.

Example: `fields[]=123&fields[]=456&fields[]=789` or `fields=123,456,789`",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
      },
      required: ["org", "project_number"],
    },
  },
  {
    name: "projectsaddItemForOrg",
    description: "Add item to organization owned project",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "The type of item to add to the project. Must be either Issue or PullRequest.",
          enum: ["Issue", "PullRequest"],
        },
        id: {
          type: "integer",
          description: "The numeric ID of the issue or pull request to add to the project.",
        },
      },
      required: ["type", "id"],
    },
  },
  {
    name: "projectsgetOrgItem",
    description: "Get an item for an organization owned project",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        fields: {
          type: "",
          description: "Limit results to specific fields, by their IDs. If not specified, the title field will be returned.

Example: fields[]=123&fields[]=456&fields[]=789 or fields=123,456,789",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
        item_id: {
          type: "string",
          description: "Path parameter: item_id",
        },
      },
      required: ["org", "project_number", "item_id"],
    },
  },
  {
    name: "projectsupdateItemForOrg",
    description: "Update project item for organization",
    inputSchema: {
      type: "object",
      properties: {
        fields: {
          type: "array",
          description: "A list of field updates to apply.",
        },
      },
      required: ["fields"],
    },
  },
  {
    name: "projectsdeleteItemForOrg",
    description: "Delete project item for organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
        item_id: {
          type: "string",
          description: "Path parameter: item_id",
        },
      },
      required: ["org", "project_number", "item_id"],
    },
  },
  {
    name: "projectscreateDraftItemForAuthenticatedUser",
    description: "Create draft item for user owned project",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the draft issue item to create in the project.",
        },
        body: {
          type: "string",
          description: "The body content of the draft issue item to create in the project.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "projectslistForUser",
    description: "List projects for user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        q: {
          type: "string",
          description: "Limit results to projects of the specified type.",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["username"],
    },
  },
  {
    name: "projectsgetForUser",
    description: "Get project for user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
      },
      required: ["username", "project_number"],
    },
  },
  {
    name: "projectslistFieldsForUser",
    description: "List project fields for user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
      },
      required: ["username", "project_number"],
    },
  },
  {
    name: "projectsgetFieldForUser",
    description: "Get project field for user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
        field_id: {
          type: "string",
          description: "Path parameter: field_id",
        },
      },
      required: ["username", "project_number", "field_id"],
    },
  },
  {
    name: "projectslistItemsForUser",
    description: "List items for a user owned project",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        q: {
          type: "string",
          description: "Search query to filter items, see [Filtering projects](https://docs.github.com/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/filtering-projects) for more information.",
        },
        fields: {
          type: "",
          description: "Limit results to specific fields, by their IDs. If not specified, the title field will be returned.

Example: `fields[]=123&fields[]=456&fields[]=789` or `fields=123,456,789`",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
      },
      required: ["username", "project_number"],
    },
  },
  {
    name: "projectsaddItemForUser",
    description: "Add item to user owned project",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          description: "The type of item to add to the project. Must be either Issue or PullRequest.",
          enum: ["Issue", "PullRequest"],
        },
        id: {
          type: "integer",
          description: "The numeric ID of the issue or pull request to add to the project.",
        },
      },
      required: ["type", "id"],
    },
  },
  {
    name: "projectsgetUserItem",
    description: "Get an item for a user owned project",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        fields: {
          type: "",
          description: "Limit results to specific fields, by their IDs. If not specified, the title field will be returned.

Example: fields[]=123&fields[]=456&fields[]=789 or fields=123,456,789",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
        item_id: {
          type: "string",
          description: "Path parameter: item_id",
        },
      },
      required: ["username", "project_number", "item_id"],
    },
  },
  {
    name: "projectsupdateItemForUser",
    description: "Update project item for user",
    inputSchema: {
      type: "object",
      properties: {
        fields: {
          type: "array",
          description: "A list of field updates to apply.",
        },
      },
      required: ["fields"],
    },
  },
  {
    name: "projectsdeleteItemForUser",
    description: "Delete project item for user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        project_number: {
          type: "string",
          description: "Path parameter: project_number",
        },
        item_id: {
          type: "string",
          description: "Path parameter: item_id",
        },
      },
      required: ["username", "project_number", "item_id"],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Get access token from environment (injected by gateway)
  const accessToken = process.env.OAUTH_ACCESS_TOKEN;
  const client = new GitHubv3RESTAPIprojectsClient(accessToken);

  try {
    switch (name) {
      case "projectslistForOrg": {
        const result = await client.projectslistForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsgetForOrg": {
        const result = await client.projectsgetForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectscreateDraftItemForOrg": {
        const result = await client.projectscreateDraftItemForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectslistFieldsForOrg": {
        const result = await client.projectslistFieldsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsgetFieldForOrg": {
        const result = await client.projectsgetFieldForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectslistItemsForOrg": {
        const result = await client.projectslistItemsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsaddItemForOrg": {
        const result = await client.projectsaddItemForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsgetOrgItem": {
        const result = await client.projectsgetOrgItem(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsupdateItemForOrg": {
        const result = await client.projectsupdateItemForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsdeleteItemForOrg": {
        const result = await client.projectsdeleteItemForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectscreateDraftItemForAuthenticatedUser": {
        const result = await client.projectscreateDraftItemForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectslistForUser": {
        const result = await client.projectslistForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsgetForUser": {
        const result = await client.projectsgetForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectslistFieldsForUser": {
        const result = await client.projectslistFieldsForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsgetFieldForUser": {
        const result = await client.projectsgetFieldForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectslistItemsForUser": {
        const result = await client.projectslistItemsForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsaddItemForUser": {
        const result = await client.projectsaddItemForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsgetUserItem": {
        const result = await client.projectsgetUserItem(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsupdateItemForUser": {
        const result = await client.projectsupdateItemForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsdeleteItemForUser": {
        const result = await client.projectsdeleteItemForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        content: [
          {
            type: "text",
            text: `API Error: ${error.response?.status} - ${
              error.response?.data?.message || error.message
            }`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitHub v3 REST API - projects MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
/**
 * MCP Server: GitHub v3 REST API - projects-classic
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
class GitHubv3RESTAPIprojectsclassicClient {
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
   * Get a project column
   */
  async projectsClassicgetColumn(params: {
    None?: string;
    column_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/projects/columns/{column_id}";
    path = path.replace("{{ column_id }}}", String(params.column_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an existing project column
   */
  async projectsClassicupdateColumn(params: {
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/projects/columns/{column_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a project column
   */
  async projectsClassicdeleteColumn(params: {
    None?: string;
    column_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/projects/columns/{column_id}";
    path = path.replace("{{ column_id }}}", String(params.column_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Move a project column
   */
  async projectsClassicmoveColumn(params: {
    position: string;
  }): Promise<Record<string, any>> {

    // Build path with parameters
    let path = "/projects/columns/{column_id}/moves";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List project collaborators
   */
  async projectsClassiclistCollaborators(params: {
    None?: string;
    affiliation?: string;
    project_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/projects/{project_id}/collaborators";
    path = path.replace("{{ project_id }}}", String(params.project_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add project collaborator
   */
  async projectsClassicaddCollaborator(params: {
    permission?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/projects/{project_id}/collaborators/{username}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove user as a collaborator
   */
  async projectsClassicremoveCollaborator(params: {
    None?: string;
    project_id: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/projects/{project_id}/collaborators/{username}";
    path = path.replace("{{ project_id }}}", String(params.project_id));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get project permission for a user
   */
  async projectsClassicgetPermissionForUser(params: {
    None?: string;
    project_id: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/projects/{project_id}/collaborators/{username}/permission";
    path = path.replace("{{ project_id }}}", String(params.project_id));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
}

// MCP Server
const server = new Server(
  {
    name: "github-v3-rest-api---projects-classic-37",
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
    name: "projectsClassicgetColumn",
    description: "Get a project column",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        column_id: {
          type: "string",
          description: "Path parameter: column_id",
        },
      },
      required: ["column_id"],
    },
  },
  {
    name: "projectsClassicupdateColumn",
    description: "Update an existing project column",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the project column",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "projectsClassicdeleteColumn",
    description: "Delete a project column",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        column_id: {
          type: "string",
          description: "Path parameter: column_id",
        },
      },
      required: ["column_id"],
    },
  },
  {
    name: "projectsClassicmoveColumn",
    description: "Move a project column",
    inputSchema: {
      type: "object",
      properties: {
        position: {
          type: "string",
          description: "The position of the column in a project. Can be one of: `first`, `last`, or `after:<column_id>` to place after the specified column.",
        },
      },
      required: ["position"],
    },
  },
  {
    name: "projectsClassiclistCollaborators",
    description: "List project collaborators",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        affiliation: {
          type: "string",
          description: "Filters the collaborators by their affiliation. `outside` means outside collaborators of a project that are not a member of the project's organization. `direct` means collaborators with permissions to a project, regardless of organization membership status. `all` means all collaborators the authenticated user can see.",
          enum: ["outside", "direct", "all"],
        },
        project_id: {
          type: "string",
          description: "Path parameter: project_id",
        },
      },
      required: ["project_id"],
    },
  },
  {
    name: "projectsClassicaddCollaborator",
    description: "Add project collaborator",
    inputSchema: {
      type: "object",
      properties: {
        permission: {
          type: "string",
          description: "The permission to grant the collaborator.",
          enum: ["read", "write", "admin"],
        },
      },
      required: [],
    },
  },
  {
    name: "projectsClassicremoveCollaborator",
    description: "Remove user as a collaborator",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        project_id: {
          type: "string",
          description: "Path parameter: project_id",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["project_id", "username"],
    },
  },
  {
    name: "projectsClassicgetPermissionForUser",
    description: "Get project permission for a user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        project_id: {
          type: "string",
          description: "Path parameter: project_id",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["project_id", "username"],
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
  const client = new GitHubv3RESTAPIprojectsclassicClient(accessToken);

  try {
    switch (name) {
      case "projectsClassicgetColumn": {
        const result = await client.projectsClassicgetColumn(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsClassicupdateColumn": {
        const result = await client.projectsClassicupdateColumn(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsClassicdeleteColumn": {
        const result = await client.projectsClassicdeleteColumn(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsClassicmoveColumn": {
        const result = await client.projectsClassicmoveColumn(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsClassiclistCollaborators": {
        const result = await client.projectsClassiclistCollaborators(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsClassicaddCollaborator": {
        const result = await client.projectsClassicaddCollaborator(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsClassicremoveCollaborator": {
        const result = await client.projectsClassicremoveCollaborator(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "projectsClassicgetPermissionForUser": {
        const result = await client.projectsClassicgetPermissionForUser(args as any);
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
  console.error("GitHub v3 REST API - projects-classic MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
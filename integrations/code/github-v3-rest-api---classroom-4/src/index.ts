/**
 * MCP Server: GitHub v3 REST API - classroom
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
class GitHubv3RESTAPIclassroomClient {
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
   * Get an assignment
   */
  async classroomgetAnAssignment(params: {
    None?: string;
    assignment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/assignments/{assignment_id}";
    path = path.replace("{{ assignment_id }}}", String(params.assignment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List accepted assignments for an assignment
   */
  async classroomlistAcceptedAssignmentsForAnAssignment(params: {
    None?: string;
    assignment_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/assignments/{assignment_id}/accepted_assignments";
    path = path.replace("{{ assignment_id }}}", String(params.assignment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get assignment grades
   */
  async classroomgetAssignmentGrades(params: {
    None?: string;
    assignment_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/assignments/{assignment_id}/grades";
    path = path.replace("{{ assignment_id }}}", String(params.assignment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List classrooms
   */
  async classroomlistClassrooms(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/classrooms";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a classroom
   */
  async classroomgetAClassroom(params: {
    None?: string;
    classroom_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/classrooms/{classroom_id}";
    path = path.replace("{{ classroom_id }}}", String(params.classroom_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List assignments for a classroom
   */
  async classroomlistAssignmentsForAClassroom(params: {
    None?: string;
    classroom_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/classrooms/{classroom_id}/assignments";
    path = path.replace("{{ classroom_id }}}", String(params.classroom_id));

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
    name: "github-v3-rest-api---classroom-4",
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
    name: "classroomgetAnAssignment",
    description: "Get an assignment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        assignment_id: {
          type: "string",
          description: "Path parameter: assignment_id",
        },
      },
      required: ["assignment_id"],
    },
  },
  {
    name: "classroomlistAcceptedAssignmentsForAnAssignment",
    description: "List accepted assignments for an assignment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        assignment_id: {
          type: "string",
          description: "Path parameter: assignment_id",
        },
      },
      required: ["assignment_id"],
    },
  },
  {
    name: "classroomgetAssignmentGrades",
    description: "Get assignment grades",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        assignment_id: {
          type: "string",
          description: "Path parameter: assignment_id",
        },
      },
      required: ["assignment_id"],
    },
  },
  {
    name: "classroomlistClassrooms",
    description: "List classrooms",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "classroomgetAClassroom",
    description: "Get a classroom",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        classroom_id: {
          type: "string",
          description: "Path parameter: classroom_id",
        },
      },
      required: ["classroom_id"],
    },
  },
  {
    name: "classroomlistAssignmentsForAClassroom",
    description: "List assignments for a classroom",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        classroom_id: {
          type: "string",
          description: "Path parameter: classroom_id",
        },
      },
      required: ["classroom_id"],
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
  const client = new GitHubv3RESTAPIclassroomClient(accessToken);

  try {
    switch (name) {
      case "classroomgetAnAssignment": {
        const result = await client.classroomgetAnAssignment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "classroomlistAcceptedAssignmentsForAnAssignment": {
        const result = await client.classroomlistAcceptedAssignmentsForAnAssignment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "classroomgetAssignmentGrades": {
        const result = await client.classroomgetAssignmentGrades(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "classroomlistClassrooms": {
        const result = await client.classroomlistClassrooms(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "classroomgetAClassroom": {
        const result = await client.classroomgetAClassroom(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "classroomlistAssignmentsForAClassroom": {
        const result = await client.classroomlistAssignmentsForAClassroom(args as any);
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
  console.error("GitHub v3 REST API - classroom MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
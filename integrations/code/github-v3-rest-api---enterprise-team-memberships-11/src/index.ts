/**
 * MCP Server: GitHub v3 REST API - enterprise-team-memberships
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
class GitHubv3RESTAPIenterpriseteammembershipsClient {
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
   * List members in an enterprise team
   */
  async enterpriseTeamMembershipslist(params: {
    None?: string;
    enterprise: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/memberships";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Bulk add team members
   */
  async enterpriseTeamMembershipsbulkAdd(params: {
    usernames: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/memberships/add";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Bulk remove team members
   */
  async enterpriseTeamMembershipsbulkRemove(params: {
    usernames: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/memberships/remove";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get enterprise team membership
   */
  async enterpriseTeamMembershipsget(params: {
    None?: string;
    enterprise: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add team member
   */
  async enterpriseTeamMembershipsadd(params: {
    None?: string;
    enterprise: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove team membership
   */
  async enterpriseTeamMembershipsremove(params: {
    None?: string;
    enterprise: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/memberships/{username}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ username }}}", String(params.username));

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
    name: "github-v3-rest-api---enterprise-team-memberships-11",
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
    name: "enterpriseTeamMembershipslist",
    description: "List members in an enterprise team",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
      },
      required: ["enterprise"],
    },
  },
  {
    name: "enterpriseTeamMembershipsbulkAdd",
    description: "Bulk add team members",
    inputSchema: {
      type: "object",
      properties: {
        usernames: {
          type: "array",
          description: "The GitHub user handles to add to the team.",
        },
      },
      required: ["usernames"],
    },
  },
  {
    name: "enterpriseTeamMembershipsbulkRemove",
    description: "Bulk remove team members",
    inputSchema: {
      type: "object",
      properties: {
        usernames: {
          type: "array",
          description: "The GitHub user handles to be removed from the team.",
        },
      },
      required: ["usernames"],
    },
  },
  {
    name: "enterpriseTeamMembershipsget",
    description: "Get enterprise team membership",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["enterprise", "username"],
    },
  },
  {
    name: "enterpriseTeamMembershipsadd",
    description: "Add team member",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["enterprise", "username"],
    },
  },
  {
    name: "enterpriseTeamMembershipsremove",
    description: "Remove team membership",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["enterprise", "username"],
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
  const client = new GitHubv3RESTAPIenterpriseteammembershipsClient(accessToken);

  try {
    switch (name) {
      case "enterpriseTeamMembershipslist": {
        const result = await client.enterpriseTeamMembershipslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamMembershipsbulkAdd": {
        const result = await client.enterpriseTeamMembershipsbulkAdd(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamMembershipsbulkRemove": {
        const result = await client.enterpriseTeamMembershipsbulkRemove(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamMembershipsget": {
        const result = await client.enterpriseTeamMembershipsget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamMembershipsadd": {
        const result = await client.enterpriseTeamMembershipsadd(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamMembershipsremove": {
        const result = await client.enterpriseTeamMembershipsremove(args as any);
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
  console.error("GitHub v3 REST API - enterprise-team-memberships MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
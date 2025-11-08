/**
 * MCP Server: GitHub v3 REST API - enterprise-team-organizations
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
class GitHubv3RESTAPIenterpriseteamorganizationsClient {
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
   * Get organization assignments
   */
  async enterpriseTeamOrganizationsgetAssignments(params: {
    None?: string;
    enterprise: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/organizations";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add organization assignments
   */
  async enterpriseTeamOrganizationsbulkAdd(params: {
    organization_slugs: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/organizations/add";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove organization assignments
   */
  async enterpriseTeamOrganizationsbulkRemove(params: {
    organization_slugs: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/organizations/remove";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get organization assignment
   */
  async enterpriseTeamOrganizationsgetAssignment(params: {
    None?: string;
    enterprise: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add an organization assignment
   */
  async enterpriseTeamOrganizationsadd(params: {
    None?: string;
    enterprise: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an organization assignment
   */
  async enterpriseTeamOrganizationsdelete(params: {
    None?: string;
    enterprise: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{enterprise-team}/organizations/{org}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ org }}}", String(params.org));

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
    name: "github-v3-rest-api---enterprise-team-organizations-12",
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
    name: "enterpriseTeamOrganizationsgetAssignments",
    description: "Get organization assignments",
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
    name: "enterpriseTeamOrganizationsbulkAdd",
    description: "Add organization assignments",
    inputSchema: {
      type: "object",
      properties: {
        organization_slugs: {
          type: "array",
          description: "Organization slug to assign the team to.",
        },
      },
      required: ["organization_slugs"],
    },
  },
  {
    name: "enterpriseTeamOrganizationsbulkRemove",
    description: "Remove organization assignments",
    inputSchema: {
      type: "object",
      properties: {
        organization_slugs: {
          type: "array",
          description: "Organization slug to unassign the team from.",
        },
      },
      required: ["organization_slugs"],
    },
  },
  {
    name: "enterpriseTeamOrganizationsgetAssignment",
    description: "Get organization assignment",
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
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["enterprise", "org"],
    },
  },
  {
    name: "enterpriseTeamOrganizationsadd",
    description: "Add an organization assignment",
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
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["enterprise", "org"],
    },
  },
  {
    name: "enterpriseTeamOrganizationsdelete",
    description: "Delete an organization assignment",
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
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["enterprise", "org"],
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
  const client = new GitHubv3RESTAPIenterpriseteamorganizationsClient(accessToken);

  try {
    switch (name) {
      case "enterpriseTeamOrganizationsgetAssignments": {
        const result = await client.enterpriseTeamOrganizationsgetAssignments(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamOrganizationsbulkAdd": {
        const result = await client.enterpriseTeamOrganizationsbulkAdd(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamOrganizationsbulkRemove": {
        const result = await client.enterpriseTeamOrganizationsbulkRemove(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamOrganizationsgetAssignment": {
        const result = await client.enterpriseTeamOrganizationsgetAssignment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamOrganizationsadd": {
        const result = await client.enterpriseTeamOrganizationsadd(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamOrganizationsdelete": {
        const result = await client.enterpriseTeamOrganizationsdelete(args as any);
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
  console.error("GitHub v3 REST API - enterprise-team-organizations MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
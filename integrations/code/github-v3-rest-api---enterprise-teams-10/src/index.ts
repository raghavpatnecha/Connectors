/**
 * MCP Server: GitHub v3 REST API - enterprise-teams
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
class GitHubv3RESTAPIenterpriseteamsClient {
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
   * List enterprise teams
   */
  async enterpriseTeamslist(params: {
    None?: string;
    enterprise: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an enterprise team
   */
  async enterpriseTeamscreate(params: {
    name: string;
    description?: string;
    sync_to_organizations?: "all" | "disabled";
    organization_selection_type?: "disabled" | "selected" | "all";
    group_id?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an enterprise team
   */
  async enterpriseTeamsget(params: {
    None?: string;
    enterprise: string;
    team_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{team_slug}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an enterprise team
   */
  async enterpriseTeamsupdate(params: {
    name?: string;
    description?: string;
    sync_to_organizations?: "all" | "disabled";
    organization_selection_type?: "disabled" | "selected" | "all";
    group_id?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{team_slug}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an enterprise team
   */
  async enterpriseTeamsdelete(params: {
    None?: string;
    enterprise: string;
    team_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/teams/{team_slug}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

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
    name: "github-v3-rest-api---enterprise-teams-10",
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
    name: "enterpriseTeamslist",
    description: "List enterprise teams",
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
    name: "enterpriseTeamscreate",
    description: "Create an enterprise team",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the team.",
        },
        description: {
          type: "string",
          description: "A description of the team.",
        },
        sync_to_organizations: {
          type: "string",
          description: "Retired: this field is no longer supported.
Whether the enterprise team should be reflected in each organization.
This value cannot be set.
",
          enum: ["all", "disabled"],
        },
        organization_selection_type: {
          type: "string",
          description: "Specifies which organizations in the enterprise should have access to this team. Can be one of `disabled`, `selected`, or `all`.
`disabled`: The team is not assigned to any organizations. This is the default when you create a new team.
`selected`: The team is assigned to specific organizations. You can then use the [add organization assignments API](https://docs.github.com/rest/enterprise-teams/enterprise-team-organizations#add-organization-assignments) endpoint.
`all`: The team is assigned to all current and future organizations in the enterprise.
",
          enum: ["disabled", "selected", "all"],
        },
        group_id: {
          type: "string",
          description: "The ID of the IdP group to assign team membership with. You can get this value from the [REST API endpoints for SCIM](https://docs.github.com/rest/scim#list-provisioned-scim-groups-for-an-enterprise).",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "enterpriseTeamsget",
    description: "Get an enterprise team",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["enterprise", "team_slug"],
    },
  },
  {
    name: "enterpriseTeamsupdate",
    description: "Update an enterprise team",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "A new name for the team.",
        },
        description: {
          type: "string",
          description: "A new description for the team.",
        },
        sync_to_organizations: {
          type: "string",
          description: "Retired: this field is no longer supported.
Whether the enterprise team should be reflected in each organization.
This value cannot be changed.
",
          enum: ["all", "disabled"],
        },
        organization_selection_type: {
          type: "string",
          description: "Specifies which organizations in the enterprise should have access to this team. Can be one of `disabled`, `selected`, or `all`.
`disabled`: The team is not assigned to any organizations. This is the default when you create a new team.
`selected`: The team is assigned to specific organizations. You can then use the [add organization assignments API](https://docs.github.com/rest/enterprise-teams/enterprise-team-organizations#add-organization-assignments).
`all`: The team is assigned to all current and future organizations in the enterprise.
",
          enum: ["disabled", "selected", "all"],
        },
        group_id: {
          type: "string",
          description: "The ID of the IdP group to assign team membership with. The new IdP group will replace the existing one, or replace existing direct members if the team isn't currently linked to an IdP group.",
        },
      },
      required: [],
    },
  },
  {
    name: "enterpriseTeamsdelete",
    description: "Delete an enterprise team",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["enterprise", "team_slug"],
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
  const client = new GitHubv3RESTAPIenterpriseteamsClient(accessToken);

  try {
    switch (name) {
      case "enterpriseTeamslist": {
        const result = await client.enterpriseTeamslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamscreate": {
        const result = await client.enterpriseTeamscreate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamsget": {
        const result = await client.enterpriseTeamsget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamsupdate": {
        const result = await client.enterpriseTeamsupdate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "enterpriseTeamsdelete": {
        const result = await client.enterpriseTeamsdelete(args as any);
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
  console.error("GitHub v3 REST API - enterprise-teams MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
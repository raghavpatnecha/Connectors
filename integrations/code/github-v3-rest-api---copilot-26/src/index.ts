/**
 * MCP Server: GitHub v3 REST API - copilot
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
class GitHubv3RESTAPIcopilotClient {
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
   * Get Copilot seat information and settings for an organization
   */
  async copilotgetCopilotOrganizationDetails(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/copilot/billing";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List all Copilot seat assignments for an organization
   */
  async copilotlistCopilotSeats(params: {
    None?: string;
    per_page?: number;
    org: string;
  }): Promise<{
  total_seats?: number;
  seats?: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/copilot/billing/seats";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add teams to the Copilot subscription for an organization
   */
  async copilotaddCopilotSeatsForTeams(params: {
    selected_teams: Array<string>;
  }): Promise<{
  seats_created: number;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/copilot/billing/selected_teams";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove teams from the Copilot subscription for an organization
   */
  async copilotcancelCopilotSeatAssignmentForTeams(params: {
    selected_teams: Array<string>;
  }): Promise<{
  seats_cancelled: number;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/copilot/billing/selected_teams";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add users to the Copilot subscription for an organization
   */
  async copilotaddCopilotSeatsForUsers(params: {
    selected_usernames: Array<string>;
  }): Promise<{
  seats_created: number;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/copilot/billing/selected_users";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove users from the Copilot subscription for an organization
   */
  async copilotcancelCopilotSeatAssignmentForUsers(params: {
    selected_usernames: Array<string>;
  }): Promise<{
  seats_cancelled: number;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/copilot/billing/selected_users";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get Copilot metrics for an organization
   */
  async copilotcopilotMetricsForOrganization(params: {
    None?: string;
    since?: string;
    until?: string;
    per_page?: number;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/copilot/metrics";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get Copilot seat assignment details for a user
   */
  async copilotgetCopilotSeatDetailsForUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/members/{username}/copilot";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get Copilot metrics for a team
   */
  async copilotcopilotMetricsForTeam(params: {
    None?: string;
    since?: string;
    until?: string;
    per_page?: number;
    org: string;
    team_slug: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/team/{team_slug}/copilot/metrics";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

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
    name: "github-v3-rest-api---copilot-26",
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
    name: "copilotgetCopilotOrganizationDetails",
    description: "Get Copilot seat information and settings for an organization",
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
      },
      required: ["org"],
    },
  },
  {
    name: "copilotlistCopilotSeats",
    description: "List all Copilot seat assignments for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        per_page: {
          type: "integer",
          description: "The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
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
    name: "copilotaddCopilotSeatsForTeams",
    description: "Add teams to the Copilot subscription for an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_teams: {
          type: "array",
          description: "List of team names within the organization to which to grant access to GitHub Copilot.",
        },
      },
      required: ["selected_teams"],
    },
  },
  {
    name: "copilotcancelCopilotSeatAssignmentForTeams",
    description: "Remove teams from the Copilot subscription for an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_teams: {
          type: "array",
          description: "The names of teams from which to revoke access to GitHub Copilot.",
        },
      },
      required: ["selected_teams"],
    },
  },
  {
    name: "copilotaddCopilotSeatsForUsers",
    description: "Add users to the Copilot subscription for an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_usernames: {
          type: "array",
          description: "The usernames of the organization members to be granted access to GitHub Copilot.",
        },
      },
      required: ["selected_usernames"],
    },
  },
  {
    name: "copilotcancelCopilotSeatAssignmentForUsers",
    description: "Remove users from the Copilot subscription for an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_usernames: {
          type: "array",
          description: "The usernames of the organization members for which to revoke access to GitHub Copilot.",
        },
      },
      required: ["selected_usernames"],
    },
  },
  {
    name: "copilotcopilotMetricsForOrganization",
    description: "Get Copilot metrics for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        since: {
          type: "string",
          description: "Show usage metrics since this date. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DDTHH:MM:SSZ`). Maximum value is 100 days ago.",
        },
        until: {
          type: "string",
          description: "Show usage metrics until this date. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DDTHH:MM:SSZ`) and should not preceed the `since` date if it is passed.",
        },
        per_page: {
          type: "integer",
          description: "The number of days of metrics to display per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
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
    name: "copilotgetCopilotSeatDetailsForUser",
    description: "Get Copilot seat assignment details for a user",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["org", "username"],
    },
  },
  {
    name: "copilotcopilotMetricsForTeam",
    description: "Get Copilot metrics for a team",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        since: {
          type: "string",
          description: "Show usage metrics since this date. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DDTHH:MM:SSZ`). Maximum value is 100 days ago.",
        },
        until: {
          type: "string",
          description: "Show usage metrics until this date. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format (`YYYY-MM-DDTHH:MM:SSZ`) and should not preceed the `since` date if it is passed.",
        },
        per_page: {
          type: "integer",
          description: "The number of days of metrics to display per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
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
  const client = new GitHubv3RESTAPIcopilotClient(accessToken);

  try {
    switch (name) {
      case "copilotgetCopilotOrganizationDetails": {
        const result = await client.copilotgetCopilotOrganizationDetails(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotlistCopilotSeats": {
        const result = await client.copilotlistCopilotSeats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotaddCopilotSeatsForTeams": {
        const result = await client.copilotaddCopilotSeatsForTeams(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotcancelCopilotSeatAssignmentForTeams": {
        const result = await client.copilotcancelCopilotSeatAssignmentForTeams(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotaddCopilotSeatsForUsers": {
        const result = await client.copilotaddCopilotSeatsForUsers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotcancelCopilotSeatAssignmentForUsers": {
        const result = await client.copilotcancelCopilotSeatAssignmentForUsers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotcopilotMetricsForOrganization": {
        const result = await client.copilotcopilotMetricsForOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotgetCopilotSeatDetailsForUser": {
        const result = await client.copilotgetCopilotSeatDetailsForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "copilotcopilotMetricsForTeam": {
        const result = await client.copilotcopilotMetricsForTeam(args as any);
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
  console.error("GitHub v3 REST API - copilot MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
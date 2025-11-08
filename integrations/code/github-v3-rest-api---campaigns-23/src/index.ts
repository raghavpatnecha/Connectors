/**
 * MCP Server: GitHub v3 REST API - campaigns
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
class GitHubv3RESTAPIcampaignsClient {
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
   * List campaigns for an organization
   */
  async campaignslistOrgCampaigns(params: {
    None?: string;
    state?: ;
    sort?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/campaigns";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a campaign for an organization
   */
  async campaignscreateCampaign(params: {
    name: string;
    description: string;
    managers?: array;
    team_managers?: array;
    ends_at: string;
    contact_link?: string;
    code_scanning_alerts?: array;
    generate_issues?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/campaigns";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a campaign for an organization
   */
  async campaignsgetCampaignSummary(params: {
    None?: string;
    campaign_number: integer;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/campaigns/{campaign_number}";
    path = path.replace("{{ campaign_number }}}", String(params.campaign_number));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a campaign
   */
  async campaignsupdateCampaign(params: {
    name?: string;
    description?: string;
    managers?: array;
    team_managers?: array;
    ends_at?: string;
    contact_link?: string;
    state?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/campaigns/{campaign_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a campaign for an organization
   */
  async campaignsdeleteCampaign(params: {
    None?: string;
    campaign_number: integer;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/campaigns/{campaign_number}";
    path = path.replace("{{ campaign_number }}}", String(params.campaign_number));
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
    name: "github-v3-rest-api---campaigns-23",
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
    name: "campaignslistOrgCampaigns",
    description: "List campaigns for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        state: {
          type: "",
          description: "If specified, only campaigns with this state will be returned.",
        },
        sort: {
          type: "string",
          description: "The property by which to sort the results.",
          enum: ["created", "updated", "ends_at", "published"],
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
    name: "campaignscreateCampaign",
    description: "Create a campaign for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the campaign",
        },
        description: {
          type: "string",
          description: "A description for the campaign",
        },
        managers: {
          type: "array",
          description: "The logins of the users to set as the campaign managers. At this time, only a single manager can be supplied.",
        },
        team_managers: {
          type: "array",
          description: "The slugs of the teams to set as the campaign managers.",
        },
        ends_at: {
          type: "string",
          description: "The end date and time of the campaign. The date must be in the future.",
        },
        contact_link: {
          type: "string",
          description: "The contact link of the campaign. Must be a URI.",
        },
        code_scanning_alerts: {
          type: "array",
          description: "The code scanning alerts to include in this campaign",
        },
        generate_issues: {
          type: "boolean",
          description: "If true, will automatically generate issues for the campaign. The default is false.",
        },
      },
      required: ["name", "description", "ends_at"],
    },
  },
  {
    name: "campaignsgetCampaignSummary",
    description: "Get a campaign for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        campaign_number: {
          type: "integer",
          description: "The campaign number.",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["campaign_number", "org"],
    },
  },
  {
    name: "campaignsupdateCampaign",
    description: "Update a campaign",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the campaign",
        },
        description: {
          type: "string",
          description: "A description for the campaign",
        },
        managers: {
          type: "array",
          description: "The logins of the users to set as the campaign managers. At this time, only a single manager can be supplied.",
        },
        team_managers: {
          type: "array",
          description: "The slugs of the teams to set as the campaign managers.",
        },
        ends_at: {
          type: "string",
          description: "The end date and time of the campaign, in ISO 8601 format':' YYYY-MM-DDTHH:MM:SSZ.",
        },
        contact_link: {
          type: "string",
          description: "The contact link of the campaign. Must be a URI.",
        },
        state: {
          type: "",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "campaignsdeleteCampaign",
    description: "Delete a campaign for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        campaign_number: {
          type: "integer",
          description: "The campaign number.",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["campaign_number", "org"],
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
  const client = new GitHubv3RESTAPIcampaignsClient(accessToken);

  try {
    switch (name) {
      case "campaignslistOrgCampaigns": {
        const result = await client.campaignslistOrgCampaigns(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "campaignscreateCampaign": {
        const result = await client.campaignscreateCampaign(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "campaignsgetCampaignSummary": {
        const result = await client.campaignsgetCampaignSummary(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "campaignsupdateCampaign": {
        const result = await client.campaignsupdateCampaign(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "campaignsdeleteCampaign": {
        const result = await client.campaignsdeleteCampaign(args as any);
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
  console.error("GitHub v3 REST API - campaigns MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
/**
 * MCP Server: GitHub v3 REST API - interactions
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
class GitHubv3RESTAPIinteractionsClient {
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
   * Get interaction restrictions for an organization
   */
  async interactionsgetRestrictionsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<any | Record<string, any>> {

    // Build path with parameters
    let path = "/orgs/{org}/interaction-limits";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set interaction restrictions for an organization
   */
  async interactionssetRestrictionsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/interaction-limits";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove interaction restrictions for an organization
   */
  async interactionsremoveRestrictionsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/interaction-limits";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get interaction restrictions for a repository
   */
  async interactionsgetRestrictionsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any | Record<string, any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/interaction-limits";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set interaction restrictions for a repository
   */
  async interactionssetRestrictionsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/interaction-limits";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove interaction restrictions for a repository
   */
  async interactionsremoveRestrictionsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/interaction-limits";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get interaction restrictions for your public repositories
   */
  async interactionsgetRestrictionsForAuthenticatedUser(params: {
  }): Promise<any | Record<string, any>> {

    // Build path with parameters
    let path = "/user/interaction-limits";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set interaction restrictions for your public repositories
   */
  async interactionssetRestrictionsForAuthenticatedUser(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/interaction-limits";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove interaction restrictions from your public repositories
   */
  async interactionsremoveRestrictionsForAuthenticatedUser(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/interaction-limits";

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
    name: "github-v3-rest-api---interactions-28",
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
    name: "interactionsgetRestrictionsForOrg",
    description: "Get interaction restrictions for an organization",
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
    name: "interactionssetRestrictionsForOrg",
    description: "Set interaction restrictions for an organization",
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
    name: "interactionsremoveRestrictionsForOrg",
    description: "Remove interaction restrictions for an organization",
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
    name: "interactionsgetRestrictionsForRepo",
    description: "Get interaction restrictions for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
        repo: {
          type: "string",
          description: "Path parameter: repo",
        },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "interactionssetRestrictionsForRepo",
    description: "Set interaction restrictions for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
        repo: {
          type: "string",
          description: "Path parameter: repo",
        },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "interactionsremoveRestrictionsForRepo",
    description: "Remove interaction restrictions for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
        repo: {
          type: "string",
          description: "Path parameter: repo",
        },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "interactionsgetRestrictionsForAuthenticatedUser",
    description: "Get interaction restrictions for your public repositories",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "interactionssetRestrictionsForAuthenticatedUser",
    description: "Set interaction restrictions for your public repositories",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "interactionsremoveRestrictionsForAuthenticatedUser",
    description: "Remove interaction restrictions from your public repositories",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
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
  const client = new GitHubv3RESTAPIinteractionsClient(accessToken);

  try {
    switch (name) {
      case "interactionsgetRestrictionsForOrg": {
        const result = await client.interactionsgetRestrictionsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionssetRestrictionsForOrg": {
        const result = await client.interactionssetRestrictionsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionsremoveRestrictionsForOrg": {
        const result = await client.interactionsremoveRestrictionsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionsgetRestrictionsForRepo": {
        const result = await client.interactionsgetRestrictionsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionssetRestrictionsForRepo": {
        const result = await client.interactionssetRestrictionsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionsremoveRestrictionsForRepo": {
        const result = await client.interactionsremoveRestrictionsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionsgetRestrictionsForAuthenticatedUser": {
        const result = await client.interactionsgetRestrictionsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionssetRestrictionsForAuthenticatedUser": {
        const result = await client.interactionssetRestrictionsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "interactionsremoveRestrictionsForAuthenticatedUser": {
        const result = await client.interactionsremoveRestrictionsForAuthenticatedUser(args as any);
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
  console.error("GitHub v3 REST API - interactions MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
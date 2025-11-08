/**
 * MCP Server: GitHub v3 REST API - secret-scanning
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
class GitHubv3RESTAPIsecretscanningClient {
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
   * List secret scanning alerts for an organization
   */
  async secretScanninglistAlertsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/secret-scanning/alerts";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization pattern configurations
   */
  async secretScanninglistOrgPatternConfigs(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/secret-scanning/pattern-configurations";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update organization pattern configurations
   */
  async secretScanningupdateOrgPatternConfigs(params: {
    pattern_config_version?: any;
    provider_pattern_settings?: Array<{
  token_type?: string;
  push_protection_setting?: "not-set" | "disabled" | "enabled";
}>;
    custom_pattern_settings?: Array<{
  token_type?: string;
  custom_pattern_version?: any;
  push_protection_setting?: "disabled" | "enabled";
}>;
  }): Promise<{
  pattern_config_version?: string;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/secret-scanning/pattern-configurations";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List secret scanning alerts for a repository
   */
  async secretScanninglistAlertsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/secret-scanning/alerts";
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
   * Get a secret scanning alert
   */
  async secretScanninggetAlert(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ alert_number }}}", String(params.alert_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a secret scanning alert
   */
  async secretScanningupdateAlert(params: {
    state?: any;
    resolution?: any;
    resolution_comment?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List locations for a secret scanning alert
   */
  async secretScanninglistLocationsForAlert(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ alert_number }}}", String(params.alert_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a push protection bypass
   */
  async secretScanningcreatePushProtectionBypass(params: {
    reason: any;
    placeholder_id: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/secret-scanning/push-protection-bypasses";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get secret scanning scan history for a repository
   */
  async secretScanninggetScanHistory(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/secret-scanning/scan-history";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

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
    name: "github-v3-rest-api---secret-scanning-33",
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
    name: "secretScanninglistAlertsForOrg",
    description: "List secret scanning alerts for an organization",
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
    name: "secretScanninglistOrgPatternConfigs",
    description: "List organization pattern configurations",
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
    name: "secretScanningupdateOrgPatternConfigs",
    description: "Update organization pattern configurations",
    inputSchema: {
      type: "object",
      properties: {
        pattern_config_version: {
          type: "",
          description: "",
        },
        provider_pattern_settings: {
          type: "array",
          description: "Pattern settings for provider patterns.",
        },
        custom_pattern_settings: {
          type: "array",
          description: "Pattern settings for custom patterns.",
        },
      },
      required: [],
    },
  },
  {
    name: "secretScanninglistAlertsForRepo",
    description: "List secret scanning alerts for a repository",
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
    name: "secretScanninggetAlert",
    description: "Get a secret scanning alert",
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
        alert_number: {
          type: "string",
          description: "Path parameter: alert_number",
        },
      },
      required: ["owner", "repo", "alert_number"],
    },
  },
  {
    name: "secretScanningupdateAlert",
    description: "Update a secret scanning alert",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "",
          description: "",
        },
        resolution: {
          type: "",
          description: "",
        },
        resolution_comment: {
          type: "",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "secretScanninglistLocationsForAlert",
    description: "List locations for a secret scanning alert",
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
        alert_number: {
          type: "string",
          description: "Path parameter: alert_number",
        },
      },
      required: ["owner", "repo", "alert_number"],
    },
  },
  {
    name: "secretScanningcreatePushProtectionBypass",
    description: "Create a push protection bypass",
    inputSchema: {
      type: "object",
      properties: {
        reason: {
          type: "",
          description: "",
        },
        placeholder_id: {
          type: "",
          description: "",
        },
      },
      required: ["reason", "placeholder_id"],
    },
  },
  {
    name: "secretScanninggetScanHistory",
    description: "Get secret scanning scan history for a repository",
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
  const client = new GitHubv3RESTAPIsecretscanningClient(accessToken);

  try {
    switch (name) {
      case "secretScanninglistAlertsForOrg": {
        const result = await client.secretScanninglistAlertsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanninglistOrgPatternConfigs": {
        const result = await client.secretScanninglistOrgPatternConfigs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanningupdateOrgPatternConfigs": {
        const result = await client.secretScanningupdateOrgPatternConfigs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanninglistAlertsForRepo": {
        const result = await client.secretScanninglistAlertsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanninggetAlert": {
        const result = await client.secretScanninggetAlert(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanningupdateAlert": {
        const result = await client.secretScanningupdateAlert(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanninglistLocationsForAlert": {
        const result = await client.secretScanninglistLocationsForAlert(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanningcreatePushProtectionBypass": {
        const result = await client.secretScanningcreatePushProtectionBypass(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "secretScanninggetScanHistory": {
        const result = await client.secretScanninggetScanHistory(args as any);
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
  console.error("GitHub v3 REST API - secret-scanning MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
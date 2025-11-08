/**
 * MCP Server: GitHub v3 REST API - hosted-compute
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
class GitHubv3RESTAPIhostedcomputeClient {
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
   * List hosted compute network configurations for an organization
   */
  async hostedComputelistNetworkConfigurationsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  network_configurations: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/network-configurations";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a hosted compute network configuration for an organization
   */
  async hostedComputecreateNetworkConfigurationForOrg(params: {
    name: string;
    compute_service?: string;
    network_settings_ids: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/network-configurations";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a hosted compute network configuration for an organization
   */
  async hostedComputegetNetworkConfigurationForOrg(params: {
    None?: string;
    org: string;
    network_configuration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/network-configurations/{network_configuration_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ network_configuration_id }}}", String(params.network_configuration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a hosted compute network configuration for an organization
   */
  async hostedComputeupdateNetworkConfigurationForOrg(params: {
    name?: string;
    compute_service?: string;
    network_settings_ids?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/network-configurations/{network_configuration_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a hosted compute network configuration from an organization
   */
  async hostedComputedeleteNetworkConfigurationFromOrg(params: {
    None?: string;
    org: string;
    network_configuration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/network-configurations/{network_configuration_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ network_configuration_id }}}", String(params.network_configuration_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a hosted compute network settings resource for an organization
   */
  async hostedComputegetNetworkSettingsForOrg(params: {
    None?: string;
    org: string;
    network_settings_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/network-settings/{network_settings_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ network_settings_id }}}", String(params.network_settings_id));

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
    name: "github-v3-rest-api---hosted-compute-34",
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
    name: "hostedComputelistNetworkConfigurationsForOrg",
    description: "List hosted compute network configurations for an organization",
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
    name: "hostedComputecreateNetworkConfigurationForOrg",
    description: "Create a hosted compute network configuration for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the network configuration. Must be between 1 and 100 characters and may only contain upper and lowercase letters a-z, numbers 0-9, '.', '-', and '_'.",
        },
        compute_service: {
          type: "string",
          description: "The hosted compute service to use for the network configuration.",
          enum: ["none", "actions"],
        },
        network_settings_ids: {
          type: "array",
          description: "The identifier of the network settings to use for the network configuration. Exactly one network settings must be specified.",
        },
      },
      required: ["name", "network_settings_ids"],
    },
  },
  {
    name: "hostedComputegetNetworkConfigurationForOrg",
    description: "Get a hosted compute network configuration for an organization",
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
        network_configuration_id: {
          type: "string",
          description: "Path parameter: network_configuration_id",
        },
      },
      required: ["org", "network_configuration_id"],
    },
  },
  {
    name: "hostedComputeupdateNetworkConfigurationForOrg",
    description: "Update a hosted compute network configuration for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the network configuration. Must be between 1 and 100 characters and may only contain upper and lowercase letters a-z, numbers 0-9, '.', '-', and '_'.",
        },
        compute_service: {
          type: "string",
          description: "The hosted compute service to use for the network configuration.",
          enum: ["none", "actions"],
        },
        network_settings_ids: {
          type: "array",
          description: "The identifier of the network settings to use for the network configuration. Exactly one network settings must be specified.",
        },
      },
      required: [],
    },
  },
  {
    name: "hostedComputedeleteNetworkConfigurationFromOrg",
    description: "Delete a hosted compute network configuration from an organization",
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
        network_configuration_id: {
          type: "string",
          description: "Path parameter: network_configuration_id",
        },
      },
      required: ["org", "network_configuration_id"],
    },
  },
  {
    name: "hostedComputegetNetworkSettingsForOrg",
    description: "Get a hosted compute network settings resource for an organization",
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
        network_settings_id: {
          type: "string",
          description: "Path parameter: network_settings_id",
        },
      },
      required: ["org", "network_settings_id"],
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
  const client = new GitHubv3RESTAPIhostedcomputeClient(accessToken);

  try {
    switch (name) {
      case "hostedComputelistNetworkConfigurationsForOrg": {
        const result = await client.hostedComputelistNetworkConfigurationsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "hostedComputecreateNetworkConfigurationForOrg": {
        const result = await client.hostedComputecreateNetworkConfigurationForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "hostedComputegetNetworkConfigurationForOrg": {
        const result = await client.hostedComputegetNetworkConfigurationForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "hostedComputeupdateNetworkConfigurationForOrg": {
        const result = await client.hostedComputeupdateNetworkConfigurationForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "hostedComputedeleteNetworkConfigurationFromOrg": {
        const result = await client.hostedComputedeleteNetworkConfigurationFromOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "hostedComputegetNetworkSettingsForOrg": {
        const result = await client.hostedComputegetNetworkSettingsForOrg(args as any);
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
  console.error("GitHub v3 REST API - hosted-compute MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
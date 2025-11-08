/**
 * MCP Server: GitHub v3 REST API - private-registries
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
class GitHubv3RESTAPIprivateregistriesClient {
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
   * List private registries for an organization
   */
  async privateRegistrieslistOrgPrivateRegistries(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  configurations: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/private-registries";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a private registry for an organization
   */
  async privateRegistriescreateOrgPrivateRegistry(params: {
    registry_type: "maven_repository" | "nuget_feed" | "goproxy_server" | "npm_registry" | "rubygems_server" | "cargo_registry" | "composer_repository" | "docker_registry" | "git_source" | "helm_registry" | "hex_organization" | "hex_repository" | "pub_repository" | "python_index" | "terraform_registry";
    url: string;
    username?: string;
    replaces_base?: boolean;
    encrypted_value: string;
    key_id: string;
    visibility: "all" | "private" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/private-registries";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get private registries public key for an organization
   */
  async privateRegistriesgetOrgPublicKey(params: {
    None?: string;
    org: string;
  }): Promise<{
  key_id: string;
  key: string;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/private-registries/public-key";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a private registry for an organization
   */
  async privateRegistriesgetOrgPrivateRegistry(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/private-registries/{secret_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a private registry for an organization
   */
  async privateRegistriesupdateOrgPrivateRegistry(params: {
    registry_type?: "maven_repository" | "nuget_feed" | "goproxy_server" | "npm_registry" | "rubygems_server" | "cargo_registry" | "composer_repository" | "docker_registry" | "git_source" | "helm_registry" | "hex_organization" | "hex_repository" | "pub_repository" | "python_index" | "terraform_registry";
    url?: string;
    username?: string;
    replaces_base?: boolean;
    encrypted_value?: string;
    key_id?: string;
    visibility?: "all" | "private" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/private-registries/{secret_name}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a private registry for an organization
   */
  async privateRegistriesdeleteOrgPrivateRegistry(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/private-registries/{secret_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

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
    name: "github-v3-rest-api---private-registries-30",
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
    name: "privateRegistrieslistOrgPrivateRegistries",
    description: "List private registries for an organization",
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
    name: "privateRegistriescreateOrgPrivateRegistry",
    description: "Create a private registry for an organization",
    inputSchema: {
      type: "object",
      properties: {
        registry_type: {
          type: "string",
          description: "The registry type.",
          enum: ["maven_repository", "nuget_feed", "goproxy_server", "npm_registry", "rubygems_server", "cargo_registry", "composer_repository", "docker_registry", "git_source", "helm_registry", "hex_organization", "hex_repository", "pub_repository", "python_index", "terraform_registry"],
        },
        url: {
          type: "string",
          description: "The URL of the private registry.",
        },
        username: {
          type: "string",
          description: "The username to use when authenticating with the private registry. This field should be omitted if the private registry does not require a username for authentication.",
        },
        replaces_base: {
          type: "boolean",
          description: "Whether this private registry should replace the base registry (e.g., npmjs.org for npm, rubygems.org for rubygems). When set to `true`, Dependabot will only use this registry and will not fall back to the public registry. When set to `false` (default), Dependabot will use this registry for scoped packages but may fall back to the public registry for other packages.",
        },
        encrypted_value: {
          type: "string",
          description: "The value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get private registries public key for an organization](https://docs.github.com/rest/private-registries/organization-configurations#get-private-registries-public-key-for-an-organization) endpoint.",
        },
        key_id: {
          type: "string",
          description: "The ID of the key you used to encrypt the secret.",
        },
        visibility: {
          type: "string",
          description: "Which type of organization repositories have access to the private registry. `selected` means only the repositories specified by `selected_repository_ids` can access the private registry.",
          enum: ["all", "private", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository IDs that can access the organization private registry. You can only provide a list of repository IDs when `visibility` is set to `selected`. You can manage the list of selected repositories using the [Update a private registry for an organization](https://docs.github.com/rest/private-registries/organization-configurations#update-a-private-registry-for-an-organization) endpoint. This field should be omitted if `visibility` is set to `all` or `private`.",
        },
      },
      required: ["registry_type", "url", "encrypted_value", "key_id", "visibility"],
    },
  },
  {
    name: "privateRegistriesgetOrgPublicKey",
    description: "Get private registries public key for an organization",
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
    name: "privateRegistriesgetOrgPrivateRegistry",
    description: "Get a private registry for an organization",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["org", "secret_name"],
    },
  },
  {
    name: "privateRegistriesupdateOrgPrivateRegistry",
    description: "Update a private registry for an organization",
    inputSchema: {
      type: "object",
      properties: {
        registry_type: {
          type: "string",
          description: "The registry type.",
          enum: ["maven_repository", "nuget_feed", "goproxy_server", "npm_registry", "rubygems_server", "cargo_registry", "composer_repository", "docker_registry", "git_source", "helm_registry", "hex_organization", "hex_repository", "pub_repository", "python_index", "terraform_registry"],
        },
        url: {
          type: "string",
          description: "The URL of the private registry.",
        },
        username: {
          type: "string",
          description: "The username to use when authenticating with the private registry. This field should be omitted if the private registry does not require a username for authentication.",
        },
        replaces_base: {
          type: "boolean",
          description: "Whether this private registry should replace the base registry (e.g., npmjs.org for npm, rubygems.org for rubygems). When set to `true`, Dependabot will only use this registry and will not fall back to the public registry. When set to `false` (default), Dependabot will use this registry for scoped packages but may fall back to the public registry for other packages.",
        },
        encrypted_value: {
          type: "string",
          description: "The value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get private registries public key for an organization](https://docs.github.com/rest/private-registries/organization-configurations#get-private-registries-public-key-for-an-organization) endpoint.",
        },
        key_id: {
          type: "string",
          description: "The ID of the key you used to encrypt the secret.",
        },
        visibility: {
          type: "string",
          description: "Which type of organization repositories have access to the private registry. `selected` means only the repositories specified by `selected_repository_ids` can access the private registry.",
          enum: ["all", "private", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository IDs that can access the organization private registry. You can only provide a list of repository IDs when `visibility` is set to `selected`. This field should be omitted if `visibility` is set to `all` or `private`.",
        },
      },
      required: [],
    },
  },
  {
    name: "privateRegistriesdeleteOrgPrivateRegistry",
    description: "Delete a private registry for an organization",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["org", "secret_name"],
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
  const client = new GitHubv3RESTAPIprivateregistriesClient(accessToken);

  try {
    switch (name) {
      case "privateRegistrieslistOrgPrivateRegistries": {
        const result = await client.privateRegistrieslistOrgPrivateRegistries(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "privateRegistriescreateOrgPrivateRegistry": {
        const result = await client.privateRegistriescreateOrgPrivateRegistry(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "privateRegistriesgetOrgPublicKey": {
        const result = await client.privateRegistriesgetOrgPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "privateRegistriesgetOrgPrivateRegistry": {
        const result = await client.privateRegistriesgetOrgPrivateRegistry(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "privateRegistriesupdateOrgPrivateRegistry": {
        const result = await client.privateRegistriesupdateOrgPrivateRegistry(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "privateRegistriesdeleteOrgPrivateRegistry": {
        const result = await client.privateRegistriesdeleteOrgPrivateRegistry(args as any);
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
  console.error("GitHub v3 REST API - private-registries MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
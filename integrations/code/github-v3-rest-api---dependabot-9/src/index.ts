/**
 * MCP Server: GitHub v3 REST API - dependabot
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
class GitHubv3RESTAPIdependabotClient {
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
   * List Dependabot alerts for an enterprise
   */
  async dependabotlistAlertsForEnterprise(params: {
    None?: string;
    enterprise: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/dependabot/alerts";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Lists the repositories Dependabot can access in an organization
   */
  async dependabotrepositoryAccessForOrg(params: {
    None?: string;
    page?: integer;
    per_page?: integer;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/dependabot/repository-access";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Updates Dependabot's repository access list for an organization
   */
  async dependabotupdateRepositoryAccessForOrg(params: {
    repository_ids_to_add?: array;
    repository_ids_to_remove?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/dependabot/repository-access";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set the default repository access level for Dependabot
   */
  async dependabotsetRepositoryAccessDefaultLevel(params: {
    default_level: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/dependabot/repository-access/default-level";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List Dependabot alerts for an organization
   */
  async dependabotlistAlertsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/alerts";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization secrets
   */
  async dependabotlistOrgSecrets(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization public key
   */
  async dependabotgetOrgPublicKey(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/public-key";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization secret
   */
  async dependabotgetOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/{secret_name}";
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
   * Create or update an organization secret
   */
  async dependabotcreateOrUpdateOrgSecret(params: {
    encrypted_value?: string;
    key_id?: string;
    visibility: string;
    selected_repository_ids?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/{secret_name}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an organization secret
   */
  async dependabotdeleteOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/{secret_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List selected repositories for an organization secret
   */
  async dependabotlistSelectedReposForOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/{secret_name}/repositories";
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
   * Set selected repositories for an organization secret
   */
  async dependabotsetSelectedReposForOrgSecret(params: {
    selected_repository_ids: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/{secret_name}/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add selected repository to an organization secret
   */
  async dependabotaddSelectedRepoToOrgSecret(params: {
    None?: string;
    repository_id: integer;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove selected repository from an organization secret
   */
  async dependabotremoveSelectedRepoFromOrgSecret(params: {
    None?: string;
    repository_id: integer;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List Dependabot alerts for a repository
   */
  async dependabotlistAlertsForRepo(params: {
    None?: string;
    per_page?: integer;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/alerts";
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
   * Get a Dependabot alert
   */
  async dependabotgetAlert(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/alerts/{alert_number}";
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
   * Update a Dependabot alert
   */
  async dependabotupdateAlert(params: {
    state: string;
    dismissed_reason?: string;
    dismissed_comment?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/alerts/{alert_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repository secrets
   */
  async dependabotlistRepoSecrets(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/secrets";
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
   * Get a repository public key
   */
  async dependabotgetRepoPublicKey(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/secrets/public-key";
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
   * Get a repository secret
   */
  async dependabotgetRepoSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/secrets/{secret_name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update a repository secret
   */
  async dependabotcreateOrUpdateRepoSecret(params: {
    encrypted_value?: string;
    key_id?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/secrets/{secret_name}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository secret
   */
  async dependabotdeleteRepoSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependabot/secrets/{secret_name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
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
    name: "github-v3-rest-api---dependabot-9",
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
    name: "dependabotlistAlertsForEnterprise",
    description: "List Dependabot alerts for an enterprise",
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
    name: "dependabotrepositoryAccessForOrg",
    description: "Lists the repositories Dependabot can access in an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        page: {
          type: "integer",
          description: "The page number of results to fetch.",
        },
        per_page: {
          type: "integer",
          description: "Number of results per page.",
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
    name: "dependabotupdateRepositoryAccessForOrg",
    description: "Updates Dependabot's repository access list for an organization",
    inputSchema: {
      type: "object",
      properties: {
        repository_ids_to_add: {
          type: "array",
          description: "List of repository IDs to add.",
        },
        repository_ids_to_remove: {
          type: "array",
          description: "List of repository IDs to remove.",
        },
      },
      required: [],
    },
  },
  {
    name: "dependabotsetRepositoryAccessDefaultLevel",
    description: "Set the default repository access level for Dependabot",
    inputSchema: {
      type: "object",
      properties: {
        default_level: {
          type: "string",
          description: "The default repository access level for Dependabot updates.",
          enum: ["public", "internal"],
        },
      },
      required: ["default_level"],
    },
  },
  {
    name: "dependabotlistAlertsForOrg",
    description: "List Dependabot alerts for an organization",
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
    name: "dependabotlistOrgSecrets",
    description: "List organization secrets",
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
    name: "dependabotgetOrgPublicKey",
    description: "Get an organization public key",
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
    name: "dependabotgetOrgSecret",
    description: "Get an organization secret",
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
    name: "dependabotcreateOrUpdateOrgSecret",
    description: "Create or update an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "Value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get an organization public key](https://docs.github.com/rest/dependabot/secrets#get-an-organization-public-key) endpoint.",
        },
        key_id: {
          type: "string",
          description: "ID of the key you used to encrypt the secret.",
        },
        visibility: {
          type: "string",
          description: "Which type of organization repositories have access to the organization secret. `selected` means only the repositories specified by `selected_repository_ids` can access the secret.",
          enum: ["all", "private", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the organization secret. You can only provide a list of repository ids when the `visibility` is set to `selected`. You can manage the list of selected repositories using the [List selected repositories for an organization secret](https://docs.github.com/rest/dependabot/secrets#list-selected-repositories-for-an-organization-secret), [Set selected repositories for an organization secret](https://docs.github.com/rest/dependabot/secrets#set-selected-repositories-for-an-organization-secret), and [Remove selected repository from an organization secret](https://docs.github.com/rest/dependabot/secrets#remove-selected-repository-from-an-organization-secret) endpoints. Use integers when possible, as strings are supported only to maintain backwards compatibility and may be removed in the future.",
        },
      },
      required: ["visibility"],
    },
  },
  {
    name: "dependabotdeleteOrgSecret",
    description: "Delete an organization secret",
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
    name: "dependabotlistSelectedReposForOrgSecret",
    description: "List selected repositories for an organization secret",
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
    name: "dependabotsetSelectedReposForOrgSecret",
    description: "Set selected repositories for an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the organization secret. You can only provide a list of repository ids when the `visibility` is set to `selected`. You can add and remove individual repositories using the [Set selected repositories for an organization secret](https://docs.github.com/rest/dependabot/secrets#set-selected-repositories-for-an-organization-secret) and [Remove selected repository from an organization secret](https://docs.github.com/rest/dependabot/secrets#remove-selected-repository-from-an-organization-secret) endpoints.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "dependabotaddSelectedRepoToOrgSecret",
    description: "Add selected repository to an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repository_id: {
          type: "integer",
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
      required: ["repository_id", "org", "secret_name"],
    },
  },
  {
    name: "dependabotremoveSelectedRepoFromOrgSecret",
    description: "Remove selected repository from an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repository_id: {
          type: "integer",
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
      required: ["repository_id", "org", "secret_name"],
    },
  },
  {
    name: "dependabotlistAlertsForRepo",
    description: "List Dependabot alerts for a repository",
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
    name: "dependabotgetAlert",
    description: "Get a Dependabot alert",
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
    name: "dependabotupdateAlert",
    description: "Update a Dependabot alert",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "The state of the Dependabot alert.
A `dismissed_reason` must be provided when setting the state to `dismissed`.",
          enum: ["dismissed", "open"],
        },
        dismissed_reason: {
          type: "string",
          description: "**Required when `state` is `dismissed`.** A reason for dismissing the alert.",
          enum: ["fix_started", "inaccurate", "no_bandwidth", "not_used", "tolerable_risk"],
        },
        dismissed_comment: {
          type: "string",
          description: "An optional comment associated with dismissing the alert.",
        },
      },
      required: ["state"],
    },
  },
  {
    name: "dependabotlistRepoSecrets",
    description: "List repository secrets",
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
    name: "dependabotgetRepoPublicKey",
    description: "Get a repository public key",
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
    name: "dependabotgetRepoSecret",
    description: "Get a repository secret",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["owner", "repo", "secret_name"],
    },
  },
  {
    name: "dependabotcreateOrUpdateRepoSecret",
    description: "Create or update a repository secret",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "Value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get a repository public key](https://docs.github.com/rest/dependabot/secrets#get-a-repository-public-key) endpoint.",
        },
        key_id: {
          type: "string",
          description: "ID of the key you used to encrypt the secret.",
        },
      },
      required: [],
    },
  },
  {
    name: "dependabotdeleteRepoSecret",
    description: "Delete a repository secret",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["owner", "repo", "secret_name"],
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
  const client = new GitHubv3RESTAPIdependabotClient(accessToken);

  try {
    switch (name) {
      case "dependabotlistAlertsForEnterprise": {
        const result = await client.dependabotlistAlertsForEnterprise(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotrepositoryAccessForOrg": {
        const result = await client.dependabotrepositoryAccessForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotupdateRepositoryAccessForOrg": {
        const result = await client.dependabotupdateRepositoryAccessForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotsetRepositoryAccessDefaultLevel": {
        const result = await client.dependabotsetRepositoryAccessDefaultLevel(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotlistAlertsForOrg": {
        const result = await client.dependabotlistAlertsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotlistOrgSecrets": {
        const result = await client.dependabotlistOrgSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotgetOrgPublicKey": {
        const result = await client.dependabotgetOrgPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotgetOrgSecret": {
        const result = await client.dependabotgetOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotcreateOrUpdateOrgSecret": {
        const result = await client.dependabotcreateOrUpdateOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotdeleteOrgSecret": {
        const result = await client.dependabotdeleteOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotlistSelectedReposForOrgSecret": {
        const result = await client.dependabotlistSelectedReposForOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotsetSelectedReposForOrgSecret": {
        const result = await client.dependabotsetSelectedReposForOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotaddSelectedRepoToOrgSecret": {
        const result = await client.dependabotaddSelectedRepoToOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotremoveSelectedRepoFromOrgSecret": {
        const result = await client.dependabotremoveSelectedRepoFromOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotlistAlertsForRepo": {
        const result = await client.dependabotlistAlertsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotgetAlert": {
        const result = await client.dependabotgetAlert(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotupdateAlert": {
        const result = await client.dependabotupdateAlert(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotlistRepoSecrets": {
        const result = await client.dependabotlistRepoSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotgetRepoPublicKey": {
        const result = await client.dependabotgetRepoPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotgetRepoSecret": {
        const result = await client.dependabotgetRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotcreateOrUpdateRepoSecret": {
        const result = await client.dependabotcreateOrUpdateRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependabotdeleteRepoSecret": {
        const result = await client.dependabotdeleteRepoSecret(args as any);
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
  console.error("GitHub v3 REST API - dependabot MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
/**
 * MCP Server: GitHub v3 REST API - apps
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
class GitHubv3RESTAPIappsClient {
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
   * Get the authenticated app
   */
  async appsgetAuthenticated(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/app";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a GitHub App from a manifest
   */
  async appscreateFromManifest(params: {
    code: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app-manifests/{code}/conversions";
    path = path.replace("{{ code }}}", String(params.code));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a webhook configuration for an app
   */
  async appsgetWebhookConfigForApp(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/hook/config";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a webhook configuration for an app
   */
  async appsupdateWebhookConfigForApp(params: {
    url?: ;
    content_type?: ;
    secret?: ;
    insecure_ssl?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/hook/config";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List deliveries for an app webhook
   */
  async appslistWebhookDeliveries(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/app/hook/deliveries";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a delivery for an app webhook
   */
  async appsgetWebhookDelivery(params: {
    None?: string;
    delivery_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/hook/deliveries/{delivery_id}";
    path = path.replace("{{ delivery_id }}}", String(params.delivery_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Redeliver a delivery for an app webhook
   */
  async appsredeliverWebhookDelivery(params: {
    None?: string;
    delivery_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/hook/deliveries/{delivery_id}/attempts";
    path = path.replace("{{ delivery_id }}}", String(params.delivery_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List installation requests for the authenticated app
   */
  async appslistInstallationRequestsForAuthenticatedApp(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/app/installation-requests";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List installations for the authenticated app
   */
  async appslistInstallations(params: {
    None?: string;
    outdated?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/app/installations";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an installation for the authenticated app
   */
  async appsgetInstallation(params: {
    None?: string;
    installation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/installations/{installation_id}";
    path = path.replace("{{ installation_id }}}", String(params.installation_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete an installation for the authenticated app
   */
  async appsdeleteInstallation(params: {
    None?: string;
    installation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/installations/{installation_id}";
    path = path.replace("{{ installation_id }}}", String(params.installation_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an installation access token for an app
   */
  async appscreateInstallationAccessToken(params: {
    repositories?: array;
    repository_ids?: array;
    permissions?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/installations/{installation_id}/access_tokens";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Suspend an app installation
   */
  async appssuspendInstallation(params: {
    None?: string;
    installation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/installations/{installation_id}/suspended";
    path = path.replace("{{ installation_id }}}", String(params.installation_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Unsuspend an app installation
   */
  async appsunsuspendInstallation(params: {
    None?: string;
    installation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/app/installations/{installation_id}/suspended";
    path = path.replace("{{ installation_id }}}", String(params.installation_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete an app authorization
   */
  async appsdeleteAuthorization(params: {
    access_token: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/applications/{client_id}/grant";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check a token
   */
  async appscheckToken(params: {
    access_token: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/applications/{client_id}/token";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Reset a token
   */
  async appsresetToken(params: {
    access_token: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/applications/{client_id}/token";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an app token
   */
  async appsdeleteToken(params: {
    access_token: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/applications/{client_id}/token";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a scoped access token
   */
  async appsscopeToken(params: {
    access_token: string;
    target?: string;
    target_id?: integer;
    repositories?: array;
    repository_ids?: array;
    permissions?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/applications/{client_id}/token/scoped";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an app
   */
  async appsgetBySlug(params: {
    None?: string;
    app_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/apps/{app_slug}";
    path = path.replace("{{ app_slug }}}", String(params.app_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories accessible to the app installation
   */
  async appslistReposAccessibleToInstallation(params: {
    None?: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
  repository_selection?: string;
}> {

    // Build path with parameters
    let path = "/installation/repositories";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Revoke an installation access token
   */
  async appsrevokeInstallationAccessToken(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/installation/token";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a subscription plan for an account
   */
  async appsgetSubscriptionPlanForAccount(params: {
    None?: string;
    account_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/marketplace_listing/accounts/{account_id}";
    path = path.replace("{{ account_id }}}", String(params.account_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List plans
   */
  async appslistPlans(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/marketplace_listing/plans";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List accounts for a plan
   */
  async appslistAccountsForPlan(params: {
    None?: string;
    direction?: string;
    plan_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/marketplace_listing/plans/{plan_id}/accounts";
    path = path.replace("{{ plan_id }}}", String(params.plan_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a subscription plan for an account (stubbed)
   */
  async appsgetSubscriptionPlanForAccountStubbed(params: {
    None?: string;
    account_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/marketplace_listing/stubbed/accounts/{account_id}";
    path = path.replace("{{ account_id }}}", String(params.account_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List plans (stubbed)
   */
  async appslistPlansStubbed(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/marketplace_listing/stubbed/plans";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List accounts for a plan (stubbed)
   */
  async appslistAccountsForPlanStubbed(params: {
    None?: string;
    direction?: string;
    plan_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/marketplace_listing/stubbed/plans/{plan_id}/accounts";
    path = path.replace("{{ plan_id }}}", String(params.plan_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization installation for the authenticated app
   */
  async appsgetOrgInstallation(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/installation";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a repository installation for the authenticated app
   */
  async appsgetRepoInstallation(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/installation";
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
   * List app installations accessible to the user access token
   */
  async appslistInstallationsForAuthenticatedUser(params: {
    None?: string;
  }): Promise<{
  total_count: number;
  installations: Array<any>;
}> {

    // Build path with parameters
    let path = "/user/installations";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories accessible to the user access token
   */
  async appslistInstallationReposForAuthenticatedUser(params: {
    None?: string;
    installation_id: string;
  }): Promise<{
  total_count: number;
  repository_selection?: string;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/user/installations/{installation_id}/repositories";
    path = path.replace("{{ installation_id }}}", String(params.installation_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add a repository to an app installation
   */
  async appsaddRepoToInstallationForAuthenticatedUser(params: {
    None?: string;
    installation_id: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/installations/{installation_id}/repositories/{repository_id}";
    path = path.replace("{{ installation_id }}}", String(params.installation_id));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a repository from an app installation
   */
  async appsremoveRepoFromInstallationForAuthenticatedUser(params: {
    None?: string;
    installation_id: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/installations/{installation_id}/repositories/{repository_id}";
    path = path.replace("{{ installation_id }}}", String(params.installation_id));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List subscriptions for the authenticated user
   */
  async appslistSubscriptionsForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/marketplace_purchases";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List subscriptions for the authenticated user (stubbed)
   */
  async appslistSubscriptionsForAuthenticatedUserStubbed(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/marketplace_purchases/stubbed";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a user installation for the authenticated app
   */
  async appsgetUserInstallation(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/installation";
    path = path.replace("{{ username }}}", String(params.username));

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
    name: "github-v3-rest-api---apps-3",
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
    name: "appsgetAuthenticated",
    description: "Get the authenticated app",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "appscreateFromManifest",
    description: "Create a GitHub App from a manifest",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "appsgetWebhookConfigForApp",
    description: "Get a webhook configuration for an app",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "appsupdateWebhookConfigForApp",
    description: "Update a webhook configuration for an app",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "",
          description: "",
        },
        content_type: {
          type: "",
          description: "",
        },
        secret: {
          type: "",
          description: "",
        },
        insecure_ssl: {
          type: "",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appslistWebhookDeliveries",
    description: "List deliveries for an app webhook",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appsgetWebhookDelivery",
    description: "Get a delivery for an app webhook",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        delivery_id: {
          type: "string",
          description: "Path parameter: delivery_id",
        },
      },
      required: ["delivery_id"],
    },
  },
  {
    name: "appsredeliverWebhookDelivery",
    description: "Redeliver a delivery for an app webhook",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        delivery_id: {
          type: "string",
          description: "Path parameter: delivery_id",
        },
      },
      required: ["delivery_id"],
    },
  },
  {
    name: "appslistInstallationRequestsForAuthenticatedApp",
    description: "List installation requests for the authenticated app",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appslistInstallations",
    description: "List installations for the authenticated app",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        outdated: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appsgetInstallation",
    description: "Get an installation for the authenticated app",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        installation_id: {
          type: "string",
          description: "Path parameter: installation_id",
        },
      },
      required: ["installation_id"],
    },
  },
  {
    name: "appsdeleteInstallation",
    description: "Delete an installation for the authenticated app",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        installation_id: {
          type: "string",
          description: "Path parameter: installation_id",
        },
      },
      required: ["installation_id"],
    },
  },
  {
    name: "appscreateInstallationAccessToken",
    description: "Create an installation access token for an app",
    inputSchema: {
      type: "object",
      properties: {
        repositories: {
          type: "array",
          description: "List of repository names that the token should have access to",
        },
        repository_ids: {
          type: "array",
          description: "List of repository IDs that the token should have access to",
        },
        permissions: {
          type: "",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appssuspendInstallation",
    description: "Suspend an app installation",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        installation_id: {
          type: "string",
          description: "Path parameter: installation_id",
        },
      },
      required: ["installation_id"],
    },
  },
  {
    name: "appsunsuspendInstallation",
    description: "Unsuspend an app installation",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        installation_id: {
          type: "string",
          description: "Path parameter: installation_id",
        },
      },
      required: ["installation_id"],
    },
  },
  {
    name: "appsdeleteAuthorization",
    description: "Delete an app authorization",
    inputSchema: {
      type: "object",
      properties: {
        access_token: {
          type: "string",
          description: "The OAuth access token used to authenticate to the GitHub API.",
        },
      },
      required: ["access_token"],
    },
  },
  {
    name: "appscheckToken",
    description: "Check a token",
    inputSchema: {
      type: "object",
      properties: {
        access_token: {
          type: "string",
          description: "The access_token of the OAuth or GitHub application.",
        },
      },
      required: ["access_token"],
    },
  },
  {
    name: "appsresetToken",
    description: "Reset a token",
    inputSchema: {
      type: "object",
      properties: {
        access_token: {
          type: "string",
          description: "The access_token of the OAuth or GitHub application.",
        },
      },
      required: ["access_token"],
    },
  },
  {
    name: "appsdeleteToken",
    description: "Delete an app token",
    inputSchema: {
      type: "object",
      properties: {
        access_token: {
          type: "string",
          description: "The OAuth access token used to authenticate to the GitHub API.",
        },
      },
      required: ["access_token"],
    },
  },
  {
    name: "appsscopeToken",
    description: "Create a scoped access token",
    inputSchema: {
      type: "object",
      properties: {
        access_token: {
          type: "string",
          description: "The access token used to authenticate to the GitHub API.",
        },
        target: {
          type: "string",
          description: "The name of the user or organization to scope the user access token to. **Required** unless `target_id` is specified.",
        },
        target_id: {
          type: "integer",
          description: "The ID of the user or organization to scope the user access token to. **Required** unless `target` is specified.",
        },
        repositories: {
          type: "array",
          description: "The list of repository names to scope the user access token to. `repositories` may not be specified if `repository_ids` is specified.",
        },
        repository_ids: {
          type: "array",
          description: "The list of repository IDs to scope the user access token to. `repository_ids` may not be specified if `repositories` is specified.",
        },
        permissions: {
          type: "",
          description: "",
        },
      },
      required: ["access_token"],
    },
  },
  {
    name: "appsgetBySlug",
    description: "Get an app",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        app_slug: {
          type: "string",
          description: "Path parameter: app_slug",
        },
      },
      required: ["app_slug"],
    },
  },
  {
    name: "appslistReposAccessibleToInstallation",
    description: "List repositories accessible to the app installation",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appsrevokeInstallationAccessToken",
    description: "Revoke an installation access token",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "appsgetSubscriptionPlanForAccount",
    description: "Get a subscription plan for an account",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        account_id: {
          type: "string",
          description: "Path parameter: account_id",
        },
      },
      required: ["account_id"],
    },
  },
  {
    name: "appslistPlans",
    description: "List plans",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appslistAccountsForPlan",
    description: "List accounts for a plan",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        direction: {
          type: "string",
          description: "To return the oldest accounts first, set to `asc`. Ignored without the `sort` parameter.",
          enum: ["asc", "desc"],
        },
        plan_id: {
          type: "string",
          description: "Path parameter: plan_id",
        },
      },
      required: ["plan_id"],
    },
  },
  {
    name: "appsgetSubscriptionPlanForAccountStubbed",
    description: "Get a subscription plan for an account (stubbed)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        account_id: {
          type: "string",
          description: "Path parameter: account_id",
        },
      },
      required: ["account_id"],
    },
  },
  {
    name: "appslistPlansStubbed",
    description: "List plans (stubbed)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appslistAccountsForPlanStubbed",
    description: "List accounts for a plan (stubbed)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        direction: {
          type: "string",
          description: "To return the oldest accounts first, set to `asc`. Ignored without the `sort` parameter.",
          enum: ["asc", "desc"],
        },
        plan_id: {
          type: "string",
          description: "Path parameter: plan_id",
        },
      },
      required: ["plan_id"],
    },
  },
  {
    name: "appsgetOrgInstallation",
    description: "Get an organization installation for the authenticated app",
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
    name: "appsgetRepoInstallation",
    description: "Get a repository installation for the authenticated app",
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
    name: "appslistInstallationsForAuthenticatedUser",
    description: "List app installations accessible to the user access token",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appslistInstallationReposForAuthenticatedUser",
    description: "List repositories accessible to the user access token",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        installation_id: {
          type: "string",
          description: "Path parameter: installation_id",
        },
      },
      required: ["installation_id"],
    },
  },
  {
    name: "appsaddRepoToInstallationForAuthenticatedUser",
    description: "Add a repository to an app installation",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        installation_id: {
          type: "string",
          description: "Path parameter: installation_id",
        },
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["installation_id", "repository_id"],
    },
  },
  {
    name: "appsremoveRepoFromInstallationForAuthenticatedUser",
    description: "Remove a repository from an app installation",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        installation_id: {
          type: "string",
          description: "Path parameter: installation_id",
        },
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["installation_id", "repository_id"],
    },
  },
  {
    name: "appslistSubscriptionsForAuthenticatedUser",
    description: "List subscriptions for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appslistSubscriptionsForAuthenticatedUserStubbed",
    description: "List subscriptions for the authenticated user (stubbed)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "appsgetUserInstallation",
    description: "Get a user installation for the authenticated app",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["username"],
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
  const client = new GitHubv3RESTAPIappsClient(accessToken);

  try {
    switch (name) {
      case "appsgetAuthenticated": {
        const result = await client.appsgetAuthenticated(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appscreateFromManifest": {
        const result = await client.appscreateFromManifest(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetWebhookConfigForApp": {
        const result = await client.appsgetWebhookConfigForApp(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsupdateWebhookConfigForApp": {
        const result = await client.appsupdateWebhookConfigForApp(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistWebhookDeliveries": {
        const result = await client.appslistWebhookDeliveries(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetWebhookDelivery": {
        const result = await client.appsgetWebhookDelivery(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsredeliverWebhookDelivery": {
        const result = await client.appsredeliverWebhookDelivery(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistInstallationRequestsForAuthenticatedApp": {
        const result = await client.appslistInstallationRequestsForAuthenticatedApp(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistInstallations": {
        const result = await client.appslistInstallations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetInstallation": {
        const result = await client.appsgetInstallation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsdeleteInstallation": {
        const result = await client.appsdeleteInstallation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appscreateInstallationAccessToken": {
        const result = await client.appscreateInstallationAccessToken(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appssuspendInstallation": {
        const result = await client.appssuspendInstallation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsunsuspendInstallation": {
        const result = await client.appsunsuspendInstallation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsdeleteAuthorization": {
        const result = await client.appsdeleteAuthorization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appscheckToken": {
        const result = await client.appscheckToken(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsresetToken": {
        const result = await client.appsresetToken(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsdeleteToken": {
        const result = await client.appsdeleteToken(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsscopeToken": {
        const result = await client.appsscopeToken(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetBySlug": {
        const result = await client.appsgetBySlug(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistReposAccessibleToInstallation": {
        const result = await client.appslistReposAccessibleToInstallation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsrevokeInstallationAccessToken": {
        const result = await client.appsrevokeInstallationAccessToken(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetSubscriptionPlanForAccount": {
        const result = await client.appsgetSubscriptionPlanForAccount(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistPlans": {
        const result = await client.appslistPlans(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistAccountsForPlan": {
        const result = await client.appslistAccountsForPlan(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetSubscriptionPlanForAccountStubbed": {
        const result = await client.appsgetSubscriptionPlanForAccountStubbed(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistPlansStubbed": {
        const result = await client.appslistPlansStubbed(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistAccountsForPlanStubbed": {
        const result = await client.appslistAccountsForPlanStubbed(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetOrgInstallation": {
        const result = await client.appsgetOrgInstallation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetRepoInstallation": {
        const result = await client.appsgetRepoInstallation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistInstallationsForAuthenticatedUser": {
        const result = await client.appslistInstallationsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistInstallationReposForAuthenticatedUser": {
        const result = await client.appslistInstallationReposForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsaddRepoToInstallationForAuthenticatedUser": {
        const result = await client.appsaddRepoToInstallationForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsremoveRepoFromInstallationForAuthenticatedUser": {
        const result = await client.appsremoveRepoFromInstallationForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistSubscriptionsForAuthenticatedUser": {
        const result = await client.appslistSubscriptionsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appslistSubscriptionsForAuthenticatedUserStubbed": {
        const result = await client.appslistSubscriptionsForAuthenticatedUserStubbed(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "appsgetUserInstallation": {
        const result = await client.appsgetUserInstallation(args as any);
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
  console.error("GitHub v3 REST API - apps MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
/**
 * MCP Server: GitHub v3 REST API - activity
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
class GitHubv3RESTAPIactivityClient {
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
   * List public events
   */
  async activitylistPublicEvents(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/events";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get feeds
   */
  async activitygetFeeds(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/feeds";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List public events for a network of repositories
   */
  async activitylistPublicEventsForRepoNetwork(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/networks/{owner}/{repo}/events";
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
   * List notifications for the authenticated user
   */
  async activitylistNotificationsForAuthenticatedUser(params: {
    None?: string;
    per_page?: integer;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/notifications";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Mark notifications as read
   */
  async activitymarkNotificationsAsRead(params: {
    last_read_at?: string;
    read?: boolean;
  }): Promise<{
  message?: string;
}> {

    // Build path with parameters
    let path = "/notifications";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a thread
   */
  async activitygetThread(params: {
    None?: string;
    thread_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/notifications/threads/{thread_id}";
    path = path.replace("{{ thread_id }}}", String(params.thread_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Mark a thread as read
   */
  async activitymarkThreadAsRead(params: {
    None?: string;
    thread_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/notifications/threads/{thread_id}";
    path = path.replace("{{ thread_id }}}", String(params.thread_id));

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Mark a thread as done
   */
  async activitymarkThreadAsDone(params: {
    None?: string;
    thread_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/notifications/threads/{thread_id}";
    path = path.replace("{{ thread_id }}}", String(params.thread_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a thread subscription for the authenticated user
   */
  async activitygetThreadSubscriptionForAuthenticatedUser(params: {
    None?: string;
    thread_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/notifications/threads/{thread_id}/subscription";
    path = path.replace("{{ thread_id }}}", String(params.thread_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set a thread subscription
   */
  async activitysetThreadSubscription(params: {
    ignored?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/notifications/threads/{thread_id}/subscription";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a thread subscription
   */
  async activitydeleteThreadSubscription(params: {
    None?: string;
    thread_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/notifications/threads/{thread_id}/subscription";
    path = path.replace("{{ thread_id }}}", String(params.thread_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List public organization events
   */
  async activitylistPublicOrgEvents(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/events";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repository events
   */
  async activitylistRepoEvents(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/events";
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
   * List repository notifications for the authenticated user
   */
  async activitylistRepoNotificationsForAuthenticatedUser(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/notifications";
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
   * Mark repository notifications as read
   */
  async activitymarkRepoNotificationsAsRead(params: {
    last_read_at?: string;
  }): Promise<{
  message?: string;
  url?: string;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/notifications";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List stargazers
   */
  async activitylistStargazersForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any> | Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/stargazers";
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
   * List watchers
   */
  async activitylistWatchersForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/subscribers";
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
   * Get a repository subscription
   */
  async activitygetRepoSubscription(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/subscription";
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
   * Set a repository subscription
   */
  async activitysetRepoSubscription(params: {
    subscribed?: boolean;
    ignored?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/subscription";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository subscription
   */
  async activitydeleteRepoSubscription(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/subscription";
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
   * List repositories starred by the authenticated user
   */
  async activitylistReposStarredByAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/starred";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if a repository is starred by the authenticated user
   */
  async activitycheckRepoIsStarredByAuthenticatedUser(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/starred/{owner}/{repo}";
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
   * Star a repository for the authenticated user
   */
  async activitystarRepoForAuthenticatedUser(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/starred/{owner}/{repo}";
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
   * Unstar a repository for the authenticated user
   */
  async activityunstarRepoForAuthenticatedUser(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/starred/{owner}/{repo}";
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
   * List repositories watched by the authenticated user
   */
  async activitylistWatchedReposForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/subscriptions";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List events for the authenticated user
   */
  async activitylistEventsForAuthenticatedUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/events";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization events for the authenticated user
   */
  async activitylistOrgEventsForAuthenticatedUser(params: {
    None?: string;
    username: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/events/orgs/{org}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List public events for a user
   */
  async activitylistPublicEventsForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/events/public";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List events received by the authenticated user
   */
  async activitylistReceivedEventsForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/received_events";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List public events received by a user
   */
  async activitylistReceivedPublicEventsForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/received_events/public";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories starred by a user
   */
  async activitylistReposStarredByUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any> | Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/starred";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories watched by a user
   */
  async activitylistReposWatchedByUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/subscriptions";
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
    name: "github-v3-rest-api---activity-13",
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
    name: "activitylistPublicEvents",
    description: "List public events",
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
    name: "activitygetFeeds",
    description: "Get feeds",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "activitylistPublicEventsForRepoNetwork",
    description: "List public events for a network of repositories",
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
    name: "activitylistNotificationsForAuthenticatedUser",
    description: "List notifications for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        per_page: {
          type: "integer",
          description: "The number of results per page (max 50). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
      },
      required: [],
    },
  },
  {
    name: "activitymarkNotificationsAsRead",
    description: "Mark notifications as read",
    inputSchema: {
      type: "object",
      properties: {
        last_read_at: {
          type: "string",
          description: "Describes the last point that notifications were checked. Anything updated since this time will not be marked as read. If you omit this parameter, all notifications are marked as read. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`. Default: The current timestamp.",
        },
        read: {
          type: "boolean",
          description: "Whether the notification has been read.",
        },
      },
      required: [],
    },
  },
  {
    name: "activitygetThread",
    description: "Get a thread",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        thread_id: {
          type: "string",
          description: "Path parameter: thread_id",
        },
      },
      required: ["thread_id"],
    },
  },
  {
    name: "activitymarkThreadAsRead",
    description: "Mark a thread as read",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        thread_id: {
          type: "string",
          description: "Path parameter: thread_id",
        },
      },
      required: ["thread_id"],
    },
  },
  {
    name: "activitymarkThreadAsDone",
    description: "Mark a thread as done",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        thread_id: {
          type: "string",
          description: "Path parameter: thread_id",
        },
      },
      required: ["thread_id"],
    },
  },
  {
    name: "activitygetThreadSubscriptionForAuthenticatedUser",
    description: "Get a thread subscription for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        thread_id: {
          type: "string",
          description: "Path parameter: thread_id",
        },
      },
      required: ["thread_id"],
    },
  },
  {
    name: "activitysetThreadSubscription",
    description: "Set a thread subscription",
    inputSchema: {
      type: "object",
      properties: {
        ignored: {
          type: "boolean",
          description: "Whether to block all notifications from a thread.",
        },
      },
      required: [],
    },
  },
  {
    name: "activitydeleteThreadSubscription",
    description: "Delete a thread subscription",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        thread_id: {
          type: "string",
          description: "Path parameter: thread_id",
        },
      },
      required: ["thread_id"],
    },
  },
  {
    name: "activitylistPublicOrgEvents",
    description: "List public organization events",
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
    name: "activitylistRepoEvents",
    description: "List repository events",
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
    name: "activitylistRepoNotificationsForAuthenticatedUser",
    description: "List repository notifications for the authenticated user",
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
    name: "activitymarkRepoNotificationsAsRead",
    description: "Mark repository notifications as read",
    inputSchema: {
      type: "object",
      properties: {
        last_read_at: {
          type: "string",
          description: "Describes the last point that notifications were checked. Anything updated since this time will not be marked as read. If you omit this parameter, all notifications are marked as read. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`. Default: The current timestamp.",
        },
      },
      required: [],
    },
  },
  {
    name: "activitylistStargazersForRepo",
    description: "List stargazers",
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
    name: "activitylistWatchersForRepo",
    description: "List watchers",
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
    name: "activitygetRepoSubscription",
    description: "Get a repository subscription",
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
    name: "activitysetRepoSubscription",
    description: "Set a repository subscription",
    inputSchema: {
      type: "object",
      properties: {
        subscribed: {
          type: "boolean",
          description: "Determines if notifications should be received from this repository.",
        },
        ignored: {
          type: "boolean",
          description: "Determines if all notifications should be blocked from this repository.",
        },
      },
      required: [],
    },
  },
  {
    name: "activitydeleteRepoSubscription",
    description: "Delete a repository subscription",
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
    name: "activitylistReposStarredByAuthenticatedUser",
    description: "List repositories starred by the authenticated user",
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
    name: "activitycheckRepoIsStarredByAuthenticatedUser",
    description: "Check if a repository is starred by the authenticated user",
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
    name: "activitystarRepoForAuthenticatedUser",
    description: "Star a repository for the authenticated user",
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
    name: "activityunstarRepoForAuthenticatedUser",
    description: "Unstar a repository for the authenticated user",
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
    name: "activitylistWatchedReposForAuthenticatedUser",
    description: "List repositories watched by the authenticated user",
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
    name: "activitylistEventsForAuthenticatedUser",
    description: "List events for the authenticated user",
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
  {
    name: "activitylistOrgEventsForAuthenticatedUser",
    description: "List organization events for the authenticated user",
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
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["username", "org"],
    },
  },
  {
    name: "activitylistPublicEventsForUser",
    description: "List public events for a user",
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
  {
    name: "activitylistReceivedEventsForUser",
    description: "List events received by the authenticated user",
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
  {
    name: "activitylistReceivedPublicEventsForUser",
    description: "List public events received by a user",
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
  {
    name: "activitylistReposStarredByUser",
    description: "List repositories starred by a user",
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
  {
    name: "activitylistReposWatchedByUser",
    description: "List repositories watched by a user",
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
  const client = new GitHubv3RESTAPIactivityClient(accessToken);

  try {
    switch (name) {
      case "activitylistPublicEvents": {
        const result = await client.activitylistPublicEvents(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitygetFeeds": {
        const result = await client.activitygetFeeds(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistPublicEventsForRepoNetwork": {
        const result = await client.activitylistPublicEventsForRepoNetwork(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistNotificationsForAuthenticatedUser": {
        const result = await client.activitylistNotificationsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitymarkNotificationsAsRead": {
        const result = await client.activitymarkNotificationsAsRead(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitygetThread": {
        const result = await client.activitygetThread(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitymarkThreadAsRead": {
        const result = await client.activitymarkThreadAsRead(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitymarkThreadAsDone": {
        const result = await client.activitymarkThreadAsDone(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitygetThreadSubscriptionForAuthenticatedUser": {
        const result = await client.activitygetThreadSubscriptionForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitysetThreadSubscription": {
        const result = await client.activitysetThreadSubscription(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitydeleteThreadSubscription": {
        const result = await client.activitydeleteThreadSubscription(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistPublicOrgEvents": {
        const result = await client.activitylistPublicOrgEvents(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistRepoEvents": {
        const result = await client.activitylistRepoEvents(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistRepoNotificationsForAuthenticatedUser": {
        const result = await client.activitylistRepoNotificationsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitymarkRepoNotificationsAsRead": {
        const result = await client.activitymarkRepoNotificationsAsRead(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistStargazersForRepo": {
        const result = await client.activitylistStargazersForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistWatchersForRepo": {
        const result = await client.activitylistWatchersForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitygetRepoSubscription": {
        const result = await client.activitygetRepoSubscription(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitysetRepoSubscription": {
        const result = await client.activitysetRepoSubscription(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitydeleteRepoSubscription": {
        const result = await client.activitydeleteRepoSubscription(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistReposStarredByAuthenticatedUser": {
        const result = await client.activitylistReposStarredByAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitycheckRepoIsStarredByAuthenticatedUser": {
        const result = await client.activitycheckRepoIsStarredByAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitystarRepoForAuthenticatedUser": {
        const result = await client.activitystarRepoForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activityunstarRepoForAuthenticatedUser": {
        const result = await client.activityunstarRepoForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistWatchedReposForAuthenticatedUser": {
        const result = await client.activitylistWatchedReposForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistEventsForAuthenticatedUser": {
        const result = await client.activitylistEventsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistOrgEventsForAuthenticatedUser": {
        const result = await client.activitylistOrgEventsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistPublicEventsForUser": {
        const result = await client.activitylistPublicEventsForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistReceivedEventsForUser": {
        const result = await client.activitylistReceivedEventsForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistReceivedPublicEventsForUser": {
        const result = await client.activitylistReceivedPublicEventsForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistReposStarredByUser": {
        const result = await client.activitylistReposStarredByUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "activitylistReposWatchedByUser": {
        const result = await client.activitylistReposWatchedByUser(args as any);
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
  console.error("GitHub v3 REST API - activity MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
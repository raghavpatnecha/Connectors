/**
 * MCP Server: GitHub v3 REST API - gists
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
class GitHubv3RESTAPIgistsClient {
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
   * List gists for the authenticated user
   */
  async gistslist(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/gists";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a gist
   */
  async gistscreate(params: {
    description?: string;
    files: Record<string, any>;
    public?: boolean | "true" | "false";
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List public gists
   */
  async gistslistPublic(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/gists/public";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List starred gists
   */
  async gistslistStarred(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/gists/starred";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a gist
   */
  async gistsget(params: {
    None?: string;
    gist_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a gist
   */
  async gistsupdate(params: {
    description?: string;
    files?: Record<string, any>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a gist
   */
  async gistsdelete(params: {
    None?: string;
    gist_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List gist comments
   */
  async gistslistComments(params: {
    None?: string;
    gist_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/gists/{gist_id}/comments";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a gist comment
   */
  async gistscreateComment(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/comments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a gist comment
   */
  async gistsgetComment(params: {
    None?: string;
    gist_id: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/comments/{comment_id}";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));
    path = path.replace("{{ comment_id }}}", String(params.comment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a gist comment
   */
  async gistsupdateComment(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/comments/{comment_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a gist comment
   */
  async gistsdeleteComment(params: {
    None?: string;
    gist_id: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/comments/{comment_id}";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));
    path = path.replace("{{ comment_id }}}", String(params.comment_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List gist commits
   */
  async gistslistCommits(params: {
    None?: string;
    gist_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/gists/{gist_id}/commits";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List gist forks
   */
  async gistslistForks(params: {
    None?: string;
    gist_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/gists/{gist_id}/forks";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Fork a gist
   */
  async gistsfork(params: {
    None?: string;
    gist_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/forks";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Check if a gist is starred
   */
  async gistscheckIsStarred(params: {
    None?: string;
    gist_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/star";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Star a gist
   */
  async gistsstar(params: {
    None?: string;
    gist_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/star";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Unstar a gist
   */
  async gistsunstar(params: {
    None?: string;
    gist_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/star";
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a gist revision
   */
  async gistsgetRevision(params: {
    None?: string;
    sha: string;
    gist_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/gists/{gist_id}/{sha}";
    path = path.replace("{{ sha }}}", String(params.sha));
    path = path.replace("{{ gist_id }}}", String(params.gist_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List gists for a user
   */
  async gistslistForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/gists";
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
    name: "github-v3-rest-api---gists-14",
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
    name: "gistslist",
    description: "List gists for the authenticated user",
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
    name: "gistscreate",
    description: "Create a gist",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "Description of the gist",
        },
        files: {
          type: "object",
          description: "Names and content for the files that make up the gist",
        },
        public: {
          type: "",
          description: "",
        },
      },
      required: ["files"],
    },
  },
  {
    name: "gistslistPublic",
    description: "List public gists",
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
    name: "gistslistStarred",
    description: "List starred gists",
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
    name: "gistsget",
    description: "Get a gist",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistsupdate",
    description: "Update a gist",
    inputSchema: {
      type: "object",
      properties: {
        description: {
          type: "string",
          description: "The description of the gist.",
        },
        files: {
          type: "object",
          description: "The gist files to be updated, renamed, or deleted. Each `key` must match the current filename
(including extension) of the targeted gist file. For example: `hello.py`.

To delete a file, set the whole file to null. For example: `hello.py : null`. The file will also be
deleted if the specified object does not contain at least one of `content` or `filename`.",
        },
      },
      required: [],
    },
  },
  {
    name: "gistsdelete",
    description: "Delete a gist",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistslistComments",
    description: "List gist comments",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistscreateComment",
    description: "Create a gist comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The comment text.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "gistsgetComment",
    description: "Get a gist comment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
        comment_id: {
          type: "string",
          description: "Path parameter: comment_id",
        },
      },
      required: ["gist_id", "comment_id"],
    },
  },
  {
    name: "gistsupdateComment",
    description: "Update a gist comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The comment text.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "gistsdeleteComment",
    description: "Delete a gist comment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
        comment_id: {
          type: "string",
          description: "Path parameter: comment_id",
        },
      },
      required: ["gist_id", "comment_id"],
    },
  },
  {
    name: "gistslistCommits",
    description: "List gist commits",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistslistForks",
    description: "List gist forks",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistsfork",
    description: "Fork a gist",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistscheckIsStarred",
    description: "Check if a gist is starred",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistsstar",
    description: "Star a gist",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistsunstar",
    description: "Unstar a gist",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["gist_id"],
    },
  },
  {
    name: "gistsgetRevision",
    description: "Get a gist revision",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sha: {
          type: "string",
          description: "",
        },
        gist_id: {
          type: "string",
          description: "Path parameter: gist_id",
        },
      },
      required: ["sha", "gist_id"],
    },
  },
  {
    name: "gistslistForUser",
    description: "List gists for a user",
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
  const client = new GitHubv3RESTAPIgistsClient(accessToken);

  try {
    switch (name) {
      case "gistslist": {
        const result = await client.gistslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistscreate": {
        const result = await client.gistscreate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistslistPublic": {
        const result = await client.gistslistPublic(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistslistStarred": {
        const result = await client.gistslistStarred(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsget": {
        const result = await client.gistsget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsupdate": {
        const result = await client.gistsupdate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsdelete": {
        const result = await client.gistsdelete(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistslistComments": {
        const result = await client.gistslistComments(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistscreateComment": {
        const result = await client.gistscreateComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsgetComment": {
        const result = await client.gistsgetComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsupdateComment": {
        const result = await client.gistsupdateComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsdeleteComment": {
        const result = await client.gistsdeleteComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistslistCommits": {
        const result = await client.gistslistCommits(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistslistForks": {
        const result = await client.gistslistForks(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsfork": {
        const result = await client.gistsfork(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistscheckIsStarred": {
        const result = await client.gistscheckIsStarred(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsstar": {
        const result = await client.gistsstar(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsunstar": {
        const result = await client.gistsunstar(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistsgetRevision": {
        const result = await client.gistsgetRevision(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gistslistForUser": {
        const result = await client.gistslistForUser(args as any);
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
  console.error("GitHub v3 REST API - gists MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
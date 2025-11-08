/**
 * MCP Server: GitHub v3 REST API - search
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
class GitHubv3RESTAPIsearchClient {
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
   * Search code
   */
  async searchcode(params: {
    q: string;
    sort?: "indexed";
    order?: "desc" | "asc";
    None?: string;
  }): Promise<{
  total_count: number;
  incomplete_results: boolean;
  items: Array<any>;
}> {

    // Build path with parameters
    let path = "/search/code";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Search commits
   */
  async searchcommits(params: {
    q: string;
    sort?: "author-date" | "committer-date";
    None?: string;
  }): Promise<{
  total_count: number;
  incomplete_results: boolean;
  items: Array<any>;
}> {

    // Build path with parameters
    let path = "/search/commits";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Search issues and pull requests
   */
  async searchissuesAndPullRequests(params: {
    q: string;
    sort?: "comments" | "reactions" | "reactions-+1" | "reactions--1" | "reactions-smile" | "reactions-thinking_face" | "reactions-heart" | "reactions-tada" | "interactions" | "created" | "updated";
    None?: string;
  }): Promise<{
  total_count: number;
  incomplete_results: boolean;
  items: Array<any>;
}> {

    // Build path with parameters
    let path = "/search/issues";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Search labels
   */
  async searchlabels(params: {
    repository_id: number;
    q: string;
    sort?: "created" | "updated";
    None?: string;
  }): Promise<{
  total_count: number;
  incomplete_results: boolean;
  items: Array<any>;
}> {

    // Build path with parameters
    let path = "/search/labels";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Search repositories
   */
  async searchrepos(params: {
    q: string;
    sort?: "stars" | "forks" | "help-wanted-issues" | "updated";
    None?: string;
  }): Promise<{
  total_count: number;
  incomplete_results: boolean;
  items: Array<any>;
}> {

    // Build path with parameters
    let path = "/search/repositories";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Search topics
   */
  async searchtopics(params: {
    q: string;
    None?: string;
  }): Promise<{
  total_count: number;
  incomplete_results: boolean;
  items: Array<any>;
}> {

    // Build path with parameters
    let path = "/search/topics";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Search users
   */
  async searchusers(params: {
    q: string;
    sort?: "followers" | "repositories" | "joined";
    None?: string;
  }): Promise<{
  total_count: number;
  incomplete_results: boolean;
  items: Array<any>;
}> {

    // Build path with parameters
    let path = "/search/users";

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
    name: "github-v3-rest-api---search-43",
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
    name: "searchcode",
    description: "Search code",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query). See "[Searching code](https://docs.github.com/search-github/searching-on-github/searching-code)" for a detailed list of qualifiers.",
        },
        sort: {
          type: "string",
          description: "**This field is closing down.** Sorts the results of your query. Can only be `indexed`, which indicates how recently a file has been indexed by the GitHub search infrastructure. Default: [best match](https://docs.github.com/rest/search/search#ranking-search-results)",
          enum: ["indexed"],
        },
        order: {
          type: "string",
          description: "**This field is closing down.** Determines whether the first search result returned is the highest number of matches (`desc`) or lowest number of matches (`asc`). This parameter is ignored unless you provide `sort`. ",
          enum: ["desc", "asc"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["q"],
    },
  },
  {
    name: "searchcommits",
    description: "Search commits",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query). See "[Searching commits](https://docs.github.com/search-github/searching-on-github/searching-commits)" for a detailed list of qualifiers.",
        },
        sort: {
          type: "string",
          description: "Sorts the results of your query by `author-date` or `committer-date`. Default: [best match](https://docs.github.com/rest/search/search#ranking-search-results)",
          enum: ["author-date", "committer-date"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["q"],
    },
  },
  {
    name: "searchissuesAndPullRequests",
    description: "Search issues and pull requests",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query). See "[Searching issues and pull requests](https://docs.github.com/search-github/searching-on-github/searching-issues-and-pull-requests)" for a detailed list of qualifiers.",
        },
        sort: {
          type: "string",
          description: "Sorts the results of your query by the number of `comments`, `reactions`, `reactions-+1`, `reactions--1`, `reactions-smile`, `reactions-thinking_face`, `reactions-heart`, `reactions-tada`, or `interactions`. You can also sort results by how recently the items were `created` or `updated`, Default: [best match](https://docs.github.com/rest/search/search#ranking-search-results)",
          enum: ["comments", "reactions", "reactions-+1", "reactions--1", "reactions-smile", "reactions-thinking_face", "reactions-heart", "reactions-tada", "interactions", "created", "updated"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["q"],
    },
  },
  {
    name: "searchlabels",
    description: "Search labels",
    inputSchema: {
      type: "object",
      properties: {
        repository_id: {
          type: "integer",
          description: "The id of the repository.",
        },
        q: {
          type: "string",
          description: "The search keywords. This endpoint does not accept qualifiers in the query. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query).",
        },
        sort: {
          type: "string",
          description: "Sorts the results of your query by when the label was `created` or `updated`. Default: [best match](https://docs.github.com/rest/search/search#ranking-search-results)",
          enum: ["created", "updated"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["repository_id", "q"],
    },
  },
  {
    name: "searchrepos",
    description: "Search repositories",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query). See "[Searching for repositories](https://docs.github.com/articles/searching-for-repositories/)" for a detailed list of qualifiers.",
        },
        sort: {
          type: "string",
          description: "Sorts the results of your query by number of `stars`, `forks`, or `help-wanted-issues` or how recently the items were `updated`. Default: [best match](https://docs.github.com/rest/search/search#ranking-search-results)",
          enum: ["stars", "forks", "help-wanted-issues", "updated"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["q"],
    },
  },
  {
    name: "searchtopics",
    description: "Search topics",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query).",
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["q"],
    },
  },
  {
    name: "searchusers",
    description: "Search users",
    inputSchema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "The query contains one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query). See "[Searching users](https://docs.github.com/search-github/searching-on-github/searching-users)" for a detailed list of qualifiers.",
        },
        sort: {
          type: "string",
          description: "Sorts the results of your query by number of `followers` or `repositories`, or when the person `joined` GitHub. Default: [best match](https://docs.github.com/rest/search/search#ranking-search-results)",
          enum: ["followers", "repositories", "joined"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["q"],
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
  const client = new GitHubv3RESTAPIsearchClient(accessToken);

  try {
    switch (name) {
      case "searchcode": {
        const result = await client.searchcode(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "searchcommits": {
        const result = await client.searchcommits(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "searchissuesAndPullRequests": {
        const result = await client.searchissuesAndPullRequests(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "searchlabels": {
        const result = await client.searchlabels(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "searchrepos": {
        const result = await client.searchrepos(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "searchtopics": {
        const result = await client.searchtopics(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "searchusers": {
        const result = await client.searchusers(args as any);
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
  console.error("GitHub v3 REST API - search MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
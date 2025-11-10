/**
 * MCP Server: GitHub v3 REST API - dependency-graph
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
class GitHubv3RESTAPIdependencygraphClient {
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
   * Get a diff of the dependencies between commits
   */
  async dependencyGraphdiffRange(params: {
    None?: string;
    basehead: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependency-graph/compare/{basehead}";
    path = path.replace("{{ basehead }}}", String(params.basehead));
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
   * Export a software bill of materials (SBOM) for a repository.
   */
  async dependencyGraphexportSbom(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependency-graph/sbom";
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
   * Create a snapshot of dependencies for a repository
   */
  async dependencyGraphcreateRepositorySnapshot(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  id: number;
  created_at: string;
  result: string;
  message: string;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dependency-graph/snapshots";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
}

// MCP Server
const server = new Server(
  {
    name: "github-v3-rest-api---dependency-graph-40",
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
    name: "dependencyGraphdiffRange",
    description: "Get a diff of the dependencies between commits",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        basehead: {
          type: "string",
          description: "The base and head Git revisions to compare. The Git revisions will be resolved to commit SHAs. Named revisions will be resolved to their corresponding HEAD commits, and an appropriate merge base will be determined. This parameter expects the format `{base}...{head}`.",
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
      required: ["basehead", "owner", "repo"],
    },
  },
  {
    name: "dependencyGraphexportSbom",
    description: "Export a software bill of materials (SBOM) for a repository.",
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
    name: "dependencyGraphcreateRepositorySnapshot",
    description: "Create a snapshot of dependencies for a repository",
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
  const client = new GitHubv3RESTAPIdependencygraphClient(accessToken);

  try {
    switch (name) {
      case "dependencyGraphdiffRange": {
        const result = await client.dependencyGraphdiffRange(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependencyGraphexportSbom": {
        const result = await client.dependencyGraphexportSbom(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "dependencyGraphcreateRepositorySnapshot": {
        const result = await client.dependencyGraphcreateRepositorySnapshot(args as any);
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
  console.error("GitHub v3 REST API - dependency-graph MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
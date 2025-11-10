/**
 * MCP Server: GitHub v3 REST API - rate-limit
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
const RATE_LIMITS = {
  requestsPerMinute: 60,
  requestsPerHour: 1000,
  burstLimit: 10,
};

// OAuth Configuration

// Rate limiting state
class RateLimiter {
  private requestTimestamps: number[] = [];

  canMakeRequest(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      (timestamp) => timestamp > oneMinuteAgo
    );

    return this.requestTimestamps.length < RATE_LIMITS.requestsPerMinute;
  }

  recordRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  async waitForSlot(): Promise<void> {
    while (!this.canMakeRequest()) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

const rateLimiter = new RateLimiter();

// API Client
class GitHubv3RESTAPIratelimitClient {
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
   * Get rate limit status for the authenticated user
   */
  async rateLimitget(params: {
  }): Promise<any> {
    await rateLimiter.waitForSlot();

    // Build path with parameters
    let path = "/rate_limit";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });

    rateLimiter.recordRequest();

    return response.data;
  }
}

// MCP Server
const server = new Server(
  {
    name: "github-v3-rest-api---rate-limit-38",
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
    name: "rateLimitget",
    description: "Get rate limit status for the authenticated user",
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
  const client = new GitHubv3RESTAPIratelimitClient(accessToken);

  try {
    switch (name) {
      case "rateLimitget": {
        const result = await client.rateLimitget(args as any);
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
  console.error("GitHub v3 REST API - rate-limit MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
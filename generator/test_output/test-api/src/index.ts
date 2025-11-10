/**
 * MCP Server: Test API
 * Category: code
 * Version: 1.0.0
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
const API_BASE_URL = "https://api.test.com";

// OAuth Configuration

// Rate limiting state

// API Client
class TestAPIClient {
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
   * List items with pagination
   */
  async listItems(params: {
    page?: number;
    per_page?: number;
    sort?: "name" | "created" | "updated";
  }): Promise<Array<{
  id?: number;
  name?: string;
}>> {

    // Build path with parameters
    let path = "/items";

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
    name: "test-api",
    version: "1.0.0",
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
    name: "listItems",
    description: "List items with pagination",
    inputSchema: {
      type: "object",
      properties: {
        page: {
          type: "integer",
          description: "Page number",
        },
        per_page: {
          type: "integer",
          description: "Items per page",
        },
        sort: {
          type: "string",
          description: "Sort field",
          enum: ["name", "created", "updated"],
        },
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
  const client = new TestAPIClient(accessToken);

  try {
    switch (name) {
      case "listItems": {
        const result = await client.listItems(args as any);
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
  console.error("Test API MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
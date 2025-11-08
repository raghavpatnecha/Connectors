/**
 * MCP Server: GitHub v3 REST API - checks
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
class GitHubv3RESTAPIchecksClient {
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
   * Create a check run
   */
  async checkscreate(params: {
    name: string;
    head_sha: string;
    details_url?: string;
    external_id?: string;
    status?: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
    started_at?: string;
    conclusion?: "action_required" | "cancelled" | "failure" | "neutral" | "success" | "skipped" | "stale" | "timed_out";
    completed_at?: string;
    output?: {
  title: string;
  summary: string;
  text?: string;
  annotations?: Array<{
    path: string;
    start_line: number;
    end_line: number;
    start_column?: number;
    end_column?: number;
    annotation_level: "notice" | "warning" | "failure";
    message: string;
    title?: string;
    raw_details?: string;
  }>;
  images?: Array<{
    alt: string;
    image_url: string;
    caption?: string;
  }>;
};
    actions?: Array<{
  label: string;
  description: string;
  identifier: string;
}>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-runs";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a check run
   */
  async checksget(params: {
    None?: string;
    owner: string;
    repo: string;
    check_run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-runs/{check_run_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ check_run_id }}}", String(params.check_run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a check run
   */
  async checksupdate(params: {
    name?: string;
    details_url?: string;
    external_id?: string;
    started_at?: string;
    status?: "queued" | "in_progress" | "completed" | "waiting" | "requested" | "pending";
    conclusion?: "action_required" | "cancelled" | "failure" | "neutral" | "success" | "skipped" | "stale" | "timed_out";
    completed_at?: string;
    output?: {
  title?: string;
  summary: string;
  text?: string;
  annotations?: Array<{
    path: string;
    start_line: number;
    end_line: number;
    start_column?: number;
    end_column?: number;
    annotation_level: "notice" | "warning" | "failure";
    message: string;
    title?: string;
    raw_details?: string;
  }>;
  images?: Array<{
    alt: string;
    image_url: string;
    caption?: string;
  }>;
};
    actions?: Array<{
  label: string;
  description: string;
  identifier: string;
}>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-runs/{check_run_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List check run annotations
   */
  async checkslistAnnotations(params: {
    None?: string;
    owner: string;
    repo: string;
    check_run_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-runs/{check_run_id}/annotations";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ check_run_id }}}", String(params.check_run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Rerequest a check run
   */
  async checksrerequestRun(params: {
    None?: string;
    owner: string;
    repo: string;
    check_run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ check_run_id }}}", String(params.check_run_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Create a check suite
   */
  async checkscreateSuite(params: {
    head_sha: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-suites";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Update repository preferences for check suites
   */
  async checkssetSuitesPreferences(params: {
    auto_trigger_checks?: Array<{
  app_id: number;
  setting: boolean;
}>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-suites/preferences";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a check suite
   */
  async checksgetSuite(params: {
    None?: string;
    owner: string;
    repo: string;
    check_suite_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-suites/{check_suite_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ check_suite_id }}}", String(params.check_suite_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List check runs in a check suite
   */
  async checkslistForSuite(params: {
    None?: string;
    filter?: "latest" | "all";
    owner: string;
    repo: string;
    check_suite_id: string;
  }): Promise<{
  total_count: number;
  check_runs: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ check_suite_id }}}", String(params.check_suite_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Rerequest a check suite
   */
  async checksrerequestSuite(params: {
    None?: string;
    owner: string;
    repo: string;
    check_suite_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ check_suite_id }}}", String(params.check_suite_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List check runs for a Git reference
   */
  async checkslistForRef(params: {
    None?: string;
    filter?: "latest" | "all";
    app_id?: number;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<{
  total_count: number;
  check_runs: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{ref}/check-runs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ref }}}", String(params.ref));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List check suites for a Git reference
   */
  async checkslistSuitesForRef(params: {
    None?: string;
    app_id?: number;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<{
  total_count: number;
  check_suites: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{ref}/check-suites";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ref }}}", String(params.ref));

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
    name: "github-v3-rest-api---checks-39",
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
    name: "checkscreate",
    description: "Create a check run",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the check. For example, "code-coverage".",
        },
        head_sha: {
          type: "string",
          description: "The SHA of the commit.",
        },
        details_url: {
          type: "string",
          description: "The URL of the integrator's site that has the full details of the check. If the integrator does not provide this, then the homepage of the GitHub app is used.",
        },
        external_id: {
          type: "string",
          description: "A reference for the run on the integrator's system.",
        },
        status: {
          type: "string",
          description: "The current status of the check run. Only GitHub Actions can set a status of `waiting`, `pending`, or `requested`.",
          enum: ["queued", "in_progress", "completed", "waiting", "requested", "pending"],
        },
        started_at: {
          type: "string",
          description: "The time that the check run began. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`.",
        },
        conclusion: {
          type: "string",
          description: "**Required if you provide `completed_at` or a `status` of `completed`**. The final conclusion of the check. 
**Note:** Providing `conclusion` will automatically set the `status` parameter to `completed`. You cannot change a check run conclusion to `stale`, only GitHub can set this.",
          enum: ["action_required", "cancelled", "failure", "neutral", "success", "skipped", "stale", "timed_out"],
        },
        completed_at: {
          type: "string",
          description: "The time the check completed. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`.",
        },
        output: {
          type: "object",
          description: "Check runs can accept a variety of data in the `output` object, including a `title` and `summary` and can optionally provide descriptive details about the run.",
        },
        actions: {
          type: "array",
          description: "Displays a button on GitHub that can be clicked to alert your app to do additional tasks. For example, a code linting app can display a button that automatically fixes detected errors. The button created in this object is displayed after the check run completes. When a user clicks the button, GitHub sends the [`check_run.requested_action` webhook](https://docs.github.com/webhooks/event-payloads/#check_run) to your app. Each action includes a `label`, `identifier` and `description`. A maximum of three actions are accepted. To learn more about check runs and requested actions, see "[Check runs and requested actions](https://docs.github.com/rest/guides/using-the-rest-api-to-interact-with-checks#check-runs-and-requested-actions)."",
        },
      },
      required: ["name", "head_sha"],
    },
  },
  {
    name: "checksget",
    description: "Get a check run",
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
        check_run_id: {
          type: "string",
          description: "Path parameter: check_run_id",
        },
      },
      required: ["owner", "repo", "check_run_id"],
    },
  },
  {
    name: "checksupdate",
    description: "Update a check run",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the check. For example, "code-coverage".",
        },
        details_url: {
          type: "string",
          description: "The URL of the integrator's site that has the full details of the check.",
        },
        external_id: {
          type: "string",
          description: "A reference for the run on the integrator's system.",
        },
        started_at: {
          type: "string",
          description: "This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`.",
        },
        status: {
          type: "string",
          description: "The current status of the check run. Only GitHub Actions can set a status of `waiting`, `pending`, or `requested`.",
          enum: ["queued", "in_progress", "completed", "waiting", "requested", "pending"],
        },
        conclusion: {
          type: "string",
          description: "**Required if you provide `completed_at` or a `status` of `completed`**. The final conclusion of the check. 
**Note:** Providing `conclusion` will automatically set the `status` parameter to `completed`. You cannot change a check run conclusion to `stale`, only GitHub can set this.",
          enum: ["action_required", "cancelled", "failure", "neutral", "success", "skipped", "stale", "timed_out"],
        },
        completed_at: {
          type: "string",
          description: "The time the check completed. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`.",
        },
        output: {
          type: "object",
          description: "Check runs can accept a variety of data in the `output` object, including a `title` and `summary` and can optionally provide descriptive details about the run.",
        },
        actions: {
          type: "array",
          description: "Possible further actions the integrator can perform, which a user may trigger. Each action includes a `label`, `identifier` and `description`. A maximum of three actions are accepted. To learn more about check runs and requested actions, see "[Check runs and requested actions](https://docs.github.com/rest/guides/using-the-rest-api-to-interact-with-checks#check-runs-and-requested-actions)."",
        },
      },
      required: [],
    },
  },
  {
    name: "checkslistAnnotations",
    description: "List check run annotations",
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
        check_run_id: {
          type: "string",
          description: "Path parameter: check_run_id",
        },
      },
      required: ["owner", "repo", "check_run_id"],
    },
  },
  {
    name: "checksrerequestRun",
    description: "Rerequest a check run",
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
        check_run_id: {
          type: "string",
          description: "Path parameter: check_run_id",
        },
      },
      required: ["owner", "repo", "check_run_id"],
    },
  },
  {
    name: "checkscreateSuite",
    description: "Create a check suite",
    inputSchema: {
      type: "object",
      properties: {
        head_sha: {
          type: "string",
          description: "The sha of the head commit.",
        },
      },
      required: ["head_sha"],
    },
  },
  {
    name: "checkssetSuitesPreferences",
    description: "Update repository preferences for check suites",
    inputSchema: {
      type: "object",
      properties: {
        auto_trigger_checks: {
          type: "array",
          description: "Enables or disables automatic creation of CheckSuite events upon pushes to the repository. Enabled by default.",
        },
      },
      required: [],
    },
  },
  {
    name: "checksgetSuite",
    description: "Get a check suite",
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
        check_suite_id: {
          type: "string",
          description: "Path parameter: check_suite_id",
        },
      },
      required: ["owner", "repo", "check_suite_id"],
    },
  },
  {
    name: "checkslistForSuite",
    description: "List check runs in a check suite",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        filter: {
          type: "string",
          description: "Filters check runs by their `completed_at` timestamp. `latest` returns the most recent check runs.",
          enum: ["latest", "all"],
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
        repo: {
          type: "string",
          description: "Path parameter: repo",
        },
        check_suite_id: {
          type: "string",
          description: "Path parameter: check_suite_id",
        },
      },
      required: ["owner", "repo", "check_suite_id"],
    },
  },
  {
    name: "checksrerequestSuite",
    description: "Rerequest a check suite",
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
        check_suite_id: {
          type: "string",
          description: "Path parameter: check_suite_id",
        },
      },
      required: ["owner", "repo", "check_suite_id"],
    },
  },
  {
    name: "checkslistForRef",
    description: "List check runs for a Git reference",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        filter: {
          type: "string",
          description: "Filters check runs by their `completed_at` timestamp. `latest` returns the most recent check runs.",
          enum: ["latest", "all"],
        },
        app_id: {
          type: "integer",
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
        ref: {
          type: "string",
          description: "Path parameter: ref",
        },
      },
      required: ["owner", "repo", "ref"],
    },
  },
  {
    name: "checkslistSuitesForRef",
    description: "List check suites for a Git reference",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        app_id: {
          type: "integer",
          description: "Filters check suites by GitHub App `id`.",
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
        repo: {
          type: "string",
          description: "Path parameter: repo",
        },
        ref: {
          type: "string",
          description: "Path parameter: ref",
        },
      },
      required: ["owner", "repo", "ref"],
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
  const client = new GitHubv3RESTAPIchecksClient(accessToken);

  try {
    switch (name) {
      case "checkscreate": {
        const result = await client.checkscreate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checksget": {
        const result = await client.checksget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checksupdate": {
        const result = await client.checksupdate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checkslistAnnotations": {
        const result = await client.checkslistAnnotations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checksrerequestRun": {
        const result = await client.checksrerequestRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checkscreateSuite": {
        const result = await client.checkscreateSuite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checkssetSuitesPreferences": {
        const result = await client.checkssetSuitesPreferences(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checksgetSuite": {
        const result = await client.checksgetSuite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checkslistForSuite": {
        const result = await client.checkslistForSuite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checksrerequestSuite": {
        const result = await client.checksrerequestSuite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checkslistForRef": {
        const result = await client.checkslistForRef(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "checkslistSuitesForRef": {
        const result = await client.checkslistSuitesForRef(args as any);
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
  console.error("GitHub v3 REST API - checks MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
/**
 * MCP Server: GitHub v3 REST API - billing
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
class GitHubv3RESTAPIbillingClient {
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
   * Get all budgets for an organization
   */
  async billinggetAllBudgetsOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/settings/billing/budgets";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a budget by ID for an organization
   */
  async billinggetBudgetOrg(params: {
    None?: string;
    org: string;
    budget_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/settings/billing/budgets/{budget_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ budget_id }}}", String(params.budget_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a budget for an organization
   */
  async billingupdateBudgetOrg(params: {
    budget_amount?: number;
    prevent_further_usage?: boolean;
    budget_alerting?: {
  will_alert?: boolean;
  alert_recipients?: Array<string>;
};
    budget_scope?: "enterprise" | "organization" | "repository" | "cost_center";
    budget_entity_name?: string;
    budget_type?: "ProductPricing" | "SkuPricing";
    budget_product_sku?: string;
  }): Promise<{
  message?: string;
  budget?: {
    id?: string;
    budget_amount?: number;
    prevent_further_usage?: boolean;
    budget_alerting?: {
      will_alert: boolean;
      alert_recipients: Array<string>;
    };
    budget_scope?: "enterprise" | "organization" | "repository" | "cost_center";
    budget_entity_name?: string;
    budget_type?: "ProductPricing" | "SkuPricing";
    budget_product_sku?: string;
  };
}> {

    // Build path with parameters
    let path = "/organizations/{org}/settings/billing/budgets/{budget_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a budget for an organization
   */
  async billingdeleteBudgetOrg(params: {
    None?: string;
    org: string;
    budget_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/settings/billing/budgets/{budget_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ budget_id }}}", String(params.budget_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get billing premium request usage report for an organization
   */
  async billinggetGithubBillingPremiumRequestUsageReportOr(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/settings/billing/premium_request/usage";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get billing usage report for an organization
   */
  async billinggetGithubBillingUsageReportOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/settings/billing/usage";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get billing usage summary for an organization
   */
  async billinggetGithubBillingUsageSummaryReportOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/settings/billing/usage/summary";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub Actions billing for an organization
   */
  async billinggetGithubActionsBillingOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/billing/actions";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub Packages billing for an organization
   */
  async billinggetGithubPackagesBillingOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/billing/packages";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get shared storage billing for an organization
   */
  async billinggetSharedStorageBillingOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/billing/shared-storage";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub Actions billing for a user
   */
  async billinggetGithubActionsBillingUser(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/settings/billing/actions";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub Packages billing for a user
   */
  async billinggetGithubPackagesBillingUser(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/settings/billing/packages";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get billing premium request usage report for a user
   */
  async billinggetGithubBillingPremiumRequestUsageReportUs(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/settings/billing/premium_request/usage";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get shared storage billing for a user
   */
  async billinggetSharedStorageBillingUser(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/settings/billing/shared-storage";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get billing usage report for a user
   */
  async billinggetGithubBillingUsageReportUser(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/settings/billing/usage";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get billing usage summary for a user
   */
  async billinggetGithubBillingUsageSummaryReportUser(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/settings/billing/usage/summary";
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
    name: "github-v3-rest-api---billing-20",
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
    name: "billinggetAllBudgetsOrg",
    description: "Get all budgets for an organization",
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
    name: "billinggetBudgetOrg",
    description: "Get a budget by ID for an organization",
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
        budget_id: {
          type: "string",
          description: "Path parameter: budget_id",
        },
      },
      required: ["org", "budget_id"],
    },
  },
  {
    name: "billingupdateBudgetOrg",
    description: "Update a budget for an organization",
    inputSchema: {
      type: "object",
      properties: {
        budget_amount: {
          type: "integer",
          description: "The budget amount in whole dollars. For license-based products, this represents the number of licenses.",
        },
        prevent_further_usage: {
          type: "boolean",
          description: "Whether to prevent additional spending once the budget is exceeded",
        },
        budget_alerting: {
          type: "object",
          description: "",
        },
        budget_scope: {
          type: "string",
          description: "The scope of the budget",
          enum: ["enterprise", "organization", "repository", "cost_center"],
        },
        budget_entity_name: {
          type: "string",
          description: "The name of the entity to apply the budget to",
        },
        budget_type: {
          type: "string",
          description: "The type of pricing for the budget",
          enum: ["ProductPricing", "SkuPricing"],
        },
        budget_product_sku: {
          type: "string",
          description: "A single product or SKU that will be covered in the budget",
        },
      },
      required: [],
    },
  },
  {
    name: "billingdeleteBudgetOrg",
    description: "Delete a budget for an organization",
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
        budget_id: {
          type: "string",
          description: "Path parameter: budget_id",
        },
      },
      required: ["org", "budget_id"],
    },
  },
  {
    name: "billinggetGithubBillingPremiumRequestUsageReportOr",
    description: "Get billing premium request usage report for an organization",
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
    name: "billinggetGithubBillingUsageReportOrg",
    description: "Get billing usage report for an organization",
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
    name: "billinggetGithubBillingUsageSummaryReportOrg",
    description: "Get billing usage summary for an organization",
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
    name: "billinggetGithubActionsBillingOrg",
    description: "Get GitHub Actions billing for an organization",
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
    name: "billinggetGithubPackagesBillingOrg",
    description: "Get GitHub Packages billing for an organization",
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
    name: "billinggetSharedStorageBillingOrg",
    description: "Get shared storage billing for an organization",
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
    name: "billinggetGithubActionsBillingUser",
    description: "Get GitHub Actions billing for a user",
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
    name: "billinggetGithubPackagesBillingUser",
    description: "Get GitHub Packages billing for a user",
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
    name: "billinggetGithubBillingPremiumRequestUsageReportUs",
    description: "Get billing premium request usage report for a user",
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
    name: "billinggetSharedStorageBillingUser",
    description: "Get shared storage billing for a user",
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
    name: "billinggetGithubBillingUsageReportUser",
    description: "Get billing usage report for a user",
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
    name: "billinggetGithubBillingUsageSummaryReportUser",
    description: "Get billing usage summary for a user",
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
  const client = new GitHubv3RESTAPIbillingClient(accessToken);

  try {
    switch (name) {
      case "billinggetAllBudgetsOrg": {
        const result = await client.billinggetAllBudgetsOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetBudgetOrg": {
        const result = await client.billinggetBudgetOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billingupdateBudgetOrg": {
        const result = await client.billingupdateBudgetOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billingdeleteBudgetOrg": {
        const result = await client.billingdeleteBudgetOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubBillingPremiumRequestUsageReportOr": {
        const result = await client.billinggetGithubBillingPremiumRequestUsageReportOr(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubBillingUsageReportOrg": {
        const result = await client.billinggetGithubBillingUsageReportOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubBillingUsageSummaryReportOrg": {
        const result = await client.billinggetGithubBillingUsageSummaryReportOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubActionsBillingOrg": {
        const result = await client.billinggetGithubActionsBillingOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubPackagesBillingOrg": {
        const result = await client.billinggetGithubPackagesBillingOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetSharedStorageBillingOrg": {
        const result = await client.billinggetSharedStorageBillingOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubActionsBillingUser": {
        const result = await client.billinggetGithubActionsBillingUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubPackagesBillingUser": {
        const result = await client.billinggetGithubPackagesBillingUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubBillingPremiumRequestUsageReportUs": {
        const result = await client.billinggetGithubBillingPremiumRequestUsageReportUs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetSharedStorageBillingUser": {
        const result = await client.billinggetSharedStorageBillingUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubBillingUsageReportUser": {
        const result = await client.billinggetGithubBillingUsageReportUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "billinggetGithubBillingUsageSummaryReportUser": {
        const result = await client.billinggetGithubBillingUsageSummaryReportUser(args as any);
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
  console.error("GitHub v3 REST API - billing MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
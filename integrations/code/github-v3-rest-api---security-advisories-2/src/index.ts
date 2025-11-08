/**
 * MCP Server: GitHub v3 REST API - security-advisories
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
class GitHubv3RESTAPIsecurityadvisoriesClient {
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
   * List global security advisories
   */
  async securityAdvisorieslistGlobalAdvisories(params: {
    ghsa_id?: string;
    type?: "reviewed" | "malware" | "unreviewed";
    cve_id?: string;
    ecosystem?: any;
    severity?: "unknown" | "low" | "medium" | "high" | "critical";
    cwes?: string | Array<string>;
    is_withdrawn?: boolean;
    affects?: string | Array<string>;
    published?: string;
    updated?: string;
    modified?: string;
    epss_percentage?: string;
    epss_percentile?: string;
    None?: string;
    per_page?: number;
    sort?: "updated" | "published" | "epss_percentage" | "epss_percentile";
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/advisories";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a global security advisory
   */
  async securityAdvisoriesgetGlobalAdvisory(params: {
    None?: string;
    ghsa_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/advisories/{ghsa_id}";
    path = path.replace("{{ ghsa_id }}}", String(params.ghsa_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repository security advisories for an organization
   */
  async securityAdvisorieslistOrgRepositoryAdvisories(params: {
    None?: string;
    sort?: "created" | "updated" | "published";
    per_page?: number;
    state?: "triage" | "draft" | "published" | "closed";
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/security-advisories";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repository security advisories
   */
  async securityAdvisorieslistRepositoryAdvisories(params: {
    None?: string;
    sort?: "created" | "updated" | "published";
    per_page?: number;
    state?: "triage" | "draft" | "published" | "closed";
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/security-advisories";
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
   * Create a repository security advisory
   */
  async securityAdvisoriescreateRepositoryAdvisory(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/security-advisories";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Privately report a security vulnerability
   */
  async securityAdvisoriescreatePrivateVulnerabilityReport(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/security-advisories/reports";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a repository security advisory
   */
  async securityAdvisoriesgetRepositoryAdvisory(params: {
    None?: string;
    owner: string;
    repo: string;
    ghsa_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/security-advisories/{ghsa_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ghsa_id }}}", String(params.ghsa_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a repository security advisory
   */
  async securityAdvisoriesupdateRepositoryAdvisory(params: {
    None?: string;
    owner: string;
    repo: string;
    ghsa_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/security-advisories/{ghsa_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ghsa_id }}}", String(params.ghsa_id));

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Request a CVE for a repository security advisory
   */
  async securityAdvisoriescreateRepositoryAdvisoryCveReque(params: {
    None?: string;
    owner: string;
    repo: string;
    ghsa_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ghsa_id }}}", String(params.ghsa_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Create a temporary private fork
   */
  async securityAdvisoriescreateFork(params: {
    None?: string;
    owner: string;
    repo: string;
    ghsa_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ghsa_id }}}", String(params.ghsa_id));

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
    name: "github-v3-rest-api---security-advisories-2",
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
    name: "securityAdvisorieslistGlobalAdvisories",
    description: "List global security advisories",
    inputSchema: {
      type: "object",
      properties: {
        ghsa_id: {
          type: "string",
          description: "If specified, only advisories with this GHSA (GitHub Security Advisory) identifier will be returned.",
        },
        type: {
          type: "string",
          description: "If specified, only advisories of this type will be returned. By default, a request with no other parameters defined will only return reviewed advisories that are not malware.",
          enum: ["reviewed", "malware", "unreviewed"],
        },
        cve_id: {
          type: "string",
          description: "If specified, only advisories with this CVE (Common Vulnerabilities and Exposures) identifier will be returned.",
        },
        ecosystem: {
          type: "",
          description: "If specified, only advisories for these ecosystems will be returned.",
        },
        severity: {
          type: "string",
          description: "If specified, only advisories with these severities will be returned.",
          enum: ["unknown", "low", "medium", "high", "critical"],
        },
        cwes: {
          type: "",
          description: "If specified, only advisories with these Common Weakness Enumerations (CWEs) will be returned.

Example: `cwes=79,284,22` or `cwes[]=79&cwes[]=284&cwes[]=22`",
        },
        is_withdrawn: {
          type: "boolean",
          description: "Whether to only return advisories that have been withdrawn.",
        },
        affects: {
          type: "",
          description: "If specified, only return advisories that affect any of `package` or `package@version`. A maximum of 1000 packages can be specified.
If the query parameter causes the URL to exceed the maximum URL length supported by your client, you must specify fewer packages.

Example: `affects=package1,package2@1.0.0,package3@2.0.0` or `affects[]=package1&affects[]=package2@1.0.0`",
        },
        published: {
          type: "string",
          description: "If specified, only return advisories that were published on a date or date range.

For more information on the syntax of the date range, see "[Understanding the search syntax](https://docs.github.com/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax#query-for-dates)."",
        },
        updated: {
          type: "string",
          description: "If specified, only return advisories that were updated on a date or date range.

For more information on the syntax of the date range, see "[Understanding the search syntax](https://docs.github.com/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax#query-for-dates)."",
        },
        modified: {
          type: "string",
          description: "If specified, only show advisories that were updated or published on a date or date range.

For more information on the syntax of the date range, see "[Understanding the search syntax](https://docs.github.com/search-github/getting-started-with-searching-on-github/understanding-the-search-syntax#query-for-dates)."",
        },
        epss_percentage: {
          type: "string",
          description: "If specified, only return advisories that have an EPSS percentage score that matches the provided value.
The EPSS percentage represents the likelihood of a CVE being exploited.",
        },
        epss_percentile: {
          type: "string",
          description: "If specified, only return advisories that have an EPSS percentile score that matches the provided value.
The EPSS percentile represents the relative rank of the CVE's likelihood of being exploited compared to other CVEs.",
        },
        None: {
          type: "string",
          description: "",
        },
        per_page: {
          type: "integer",
          description: "The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
        sort: {
          type: "string",
          description: "The property to sort the results by.",
          enum: ["updated", "published", "epss_percentage", "epss_percentile"],
        },
      },
      required: [],
    },
  },
  {
    name: "securityAdvisoriesgetGlobalAdvisory",
    description: "Get a global security advisory",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ghsa_id: {
          type: "string",
          description: "Path parameter: ghsa_id",
        },
      },
      required: ["ghsa_id"],
    },
  },
  {
    name: "securityAdvisorieslistOrgRepositoryAdvisories",
    description: "List repository security advisories for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sort: {
          type: "string",
          description: "The property to sort the results by.",
          enum: ["created", "updated", "published"],
        },
        per_page: {
          type: "integer",
          description: "The number of advisories to return per page. For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
        state: {
          type: "string",
          description: "Filter by the state of the repository advisories. Only advisories of this state will be returned.",
          enum: ["triage", "draft", "published", "closed"],
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
    name: "securityAdvisorieslistRepositoryAdvisories",
    description: "List repository security advisories",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sort: {
          type: "string",
          description: "The property to sort the results by.",
          enum: ["created", "updated", "published"],
        },
        per_page: {
          type: "integer",
          description: "The number of advisories to return per page. For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
        state: {
          type: "string",
          description: "Filter by state of the repository advisories. Only advisories of this state will be returned.",
          enum: ["triage", "draft", "published", "closed"],
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
    name: "securityAdvisoriescreateRepositoryAdvisory",
    description: "Create a repository security advisory",
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
    name: "securityAdvisoriescreatePrivateVulnerabilityReport",
    description: "Privately report a security vulnerability",
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
    name: "securityAdvisoriesgetRepositoryAdvisory",
    description: "Get a repository security advisory",
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
        ghsa_id: {
          type: "string",
          description: "Path parameter: ghsa_id",
        },
      },
      required: ["owner", "repo", "ghsa_id"],
    },
  },
  {
    name: "securityAdvisoriesupdateRepositoryAdvisory",
    description: "Update a repository security advisory",
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
        ghsa_id: {
          type: "string",
          description: "Path parameter: ghsa_id",
        },
      },
      required: ["owner", "repo", "ghsa_id"],
    },
  },
  {
    name: "securityAdvisoriescreateRepositoryAdvisoryCveReque",
    description: "Request a CVE for a repository security advisory",
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
        ghsa_id: {
          type: "string",
          description: "Path parameter: ghsa_id",
        },
      },
      required: ["owner", "repo", "ghsa_id"],
    },
  },
  {
    name: "securityAdvisoriescreateFork",
    description: "Create a temporary private fork",
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
        ghsa_id: {
          type: "string",
          description: "Path parameter: ghsa_id",
        },
      },
      required: ["owner", "repo", "ghsa_id"],
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
  const client = new GitHubv3RESTAPIsecurityadvisoriesClient(accessToken);

  try {
    switch (name) {
      case "securityAdvisorieslistGlobalAdvisories": {
        const result = await client.securityAdvisorieslistGlobalAdvisories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisoriesgetGlobalAdvisory": {
        const result = await client.securityAdvisoriesgetGlobalAdvisory(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisorieslistOrgRepositoryAdvisories": {
        const result = await client.securityAdvisorieslistOrgRepositoryAdvisories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisorieslistRepositoryAdvisories": {
        const result = await client.securityAdvisorieslistRepositoryAdvisories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisoriescreateRepositoryAdvisory": {
        const result = await client.securityAdvisoriescreateRepositoryAdvisory(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisoriescreatePrivateVulnerabilityReport": {
        const result = await client.securityAdvisoriescreatePrivateVulnerabilityReport(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisoriesgetRepositoryAdvisory": {
        const result = await client.securityAdvisoriesgetRepositoryAdvisory(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisoriesupdateRepositoryAdvisory": {
        const result = await client.securityAdvisoriesupdateRepositoryAdvisory(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisoriescreateRepositoryAdvisoryCveReque": {
        const result = await client.securityAdvisoriescreateRepositoryAdvisoryCveReque(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "securityAdvisoriescreateFork": {
        const result = await client.securityAdvisoriescreateFork(args as any);
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
  console.error("GitHub v3 REST API - security-advisories MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
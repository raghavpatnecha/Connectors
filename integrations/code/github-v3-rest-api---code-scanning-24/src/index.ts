/**
 * MCP Server: GitHub v3 REST API - code-scanning
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
class GitHubv3RESTAPIcodescanningClient {
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
   * List code scanning alerts for an organization
   */
  async codeScanninglistAlertsForOrg(params: {
    None?: string;
    state?: ;
    sort?: string;
    severity?: ;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/code-scanning/alerts";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List code scanning alerts for a repository
   */
  async codeScanninglistAlertsForRepo(params: {
    None?: string;
    sort?: string;
    state?: ;
    severity?: ;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/alerts";
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
   * Get a code scanning alert
   */
  async codeScanninggetAlert(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ alert_number }}}", String(params.alert_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a code scanning alert
   */
  async codeScanningupdateAlert(params: {
    state: ;
    dismissed_reason?: ;
    dismissed_comment?: ;
    create_request?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get the status of an autofix for a code scanning alert
   */
  async codeScanninggetAutofix(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ alert_number }}}", String(params.alert_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an autofix for a code scanning alert
   */
  async codeScanningcreateAutofix(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ alert_number }}}", String(params.alert_number));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Commit an autofix for a code scanning alert
   */
  async codeScanningcommitAutofix(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix/commits";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ alert_number }}}", String(params.alert_number));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List instances of a code scanning alert
   */
  async codeScanninglistAlertInstances(params: {
    None?: string;
    owner: string;
    repo: string;
    alert_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ alert_number }}}", String(params.alert_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List code scanning analyses for a repository
   */
  async codeScanninglistRecentAnalyses(params: {
    None?: string;
    ref?: ;
    sarif_id?: ;
    sort?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/analyses";
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
   * Get a code scanning analysis for a repository
   */
  async codeScanninggetAnalysis(params: {
    None?: string;
    analysis_id: integer;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}";
    path = path.replace("{{ analysis_id }}}", String(params.analysis_id));
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
   * Delete a code scanning analysis from a repository
   */
  async codeScanningdeleteAnalysis(params: {
    None?: string;
    analysis_id: integer;
    confirm_delete?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}";
    path = path.replace("{{ analysis_id }}}", String(params.analysis_id));
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
   * List CodeQL databases for a repository
   */
  async codeScanninglistCodeqlDatabases(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/codeql/databases";
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
   * Get a CodeQL database for a repository
   */
  async codeScanninggetCodeqlDatabase(params: {
    None?: string;
    language: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/codeql/databases/{language}";
    path = path.replace("{{ language }}}", String(params.language));
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
   * Delete a CodeQL database
   */
  async codeScanningdeleteCodeqlDatabase(params: {
    None?: string;
    language: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/codeql/databases/{language}";
    path = path.replace("{{ language }}}", String(params.language));
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
   * Create a CodeQL variant analysis
   */
  async codeScanningcreateVariantAnalysis(params: {
    language: ;
    query_pack: string;
    repositories?: array;
    repository_lists?: array;
    repository_owners?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/codeql/variant-analyses";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get the summary of a CodeQL variant analysis
   */
  async codeScanninggetVariantAnalysis(params: {
    None?: string;
    codeql_variant_analysis_id: integer;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}";
    path = path.replace("{{ codeql_variant_analysis_id }}}", String(params.codeql_variant_analysis_id));
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
   * Get the analysis status of a repository in a CodeQL variant analysis
   */
  async codeScanninggetVariantAnalysisRepoTask(params: {
    None?: string;
    repo: string;
    codeql_variant_analysis_id: integer;
    repo_owner: string;
    repo_name: string;
    owner: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}/repos/{repo_owner}/{repo_name}";
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ codeql_variant_analysis_id }}}", String(params.codeql_variant_analysis_id));
    path = path.replace("{{ repo_owner }}}", String(params.repo_owner));
    path = path.replace("{{ repo_name }}}", String(params.repo_name));
    path = path.replace("{{ owner }}}", String(params.owner));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a code scanning default setup configuration
   */
  async codeScanninggetDefaultSetup(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/default-setup";
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
   * Update a code scanning default setup configuration
   */
  async codeScanningupdateDefaultSetup(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/default-setup";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Upload an analysis as SARIF data
   */
  async codeScanninguploadSarif(params: {
    commit_sha: ;
    ref: ;
    sarif: ;
    checkout_uri?: string;
    started_at?: string;
    tool_name?: string;
    validate?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/sarifs";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get information about a SARIF upload
   */
  async codeScanninggetSarif(params: {
    None?: string;
    sarif_id: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}";
    path = path.replace("{{ sarif_id }}}", String(params.sarif_id));
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

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
    name: "github-v3-rest-api---code-scanning-24",
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
    name: "codeScanninglistAlertsForOrg",
    description: "List code scanning alerts for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        state: {
          type: "",
          description: "If specified, only code scanning alerts with this state will be returned.",
        },
        sort: {
          type: "string",
          description: "The property by which to sort the results.",
          enum: ["created", "updated"],
        },
        severity: {
          type: "",
          description: "If specified, only code scanning alerts with this severity will be returned.",
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
    name: "codeScanninglistAlertsForRepo",
    description: "List code scanning alerts for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sort: {
          type: "string",
          description: "The property by which to sort the results.",
          enum: ["created", "updated"],
        },
        state: {
          type: "",
          description: "If specified, only code scanning alerts with this state will be returned.",
        },
        severity: {
          type: "",
          description: "If specified, only code scanning alerts with this severity will be returned.",
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
    name: "codeScanninggetAlert",
    description: "Get a code scanning alert",
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
        alert_number: {
          type: "string",
          description: "Path parameter: alert_number",
        },
      },
      required: ["owner", "repo", "alert_number"],
    },
  },
  {
    name: "codeScanningupdateAlert",
    description: "Update a code scanning alert",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "",
          description: "",
        },
        dismissed_reason: {
          type: "",
          description: "",
        },
        dismissed_comment: {
          type: "",
          description: "",
        },
        create_request: {
          type: "",
          description: "",
        },
      },
      required: ["state"],
    },
  },
  {
    name: "codeScanninggetAutofix",
    description: "Get the status of an autofix for a code scanning alert",
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
        alert_number: {
          type: "string",
          description: "Path parameter: alert_number",
        },
      },
      required: ["owner", "repo", "alert_number"],
    },
  },
  {
    name: "codeScanningcreateAutofix",
    description: "Create an autofix for a code scanning alert",
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
        alert_number: {
          type: "string",
          description: "Path parameter: alert_number",
        },
      },
      required: ["owner", "repo", "alert_number"],
    },
  },
  {
    name: "codeScanningcommitAutofix",
    description: "Commit an autofix for a code scanning alert",
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
        alert_number: {
          type: "string",
          description: "Path parameter: alert_number",
        },
      },
      required: ["owner", "repo", "alert_number"],
    },
  },
  {
    name: "codeScanninglistAlertInstances",
    description: "List instances of a code scanning alert",
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
        alert_number: {
          type: "string",
          description: "Path parameter: alert_number",
        },
      },
      required: ["owner", "repo", "alert_number"],
    },
  },
  {
    name: "codeScanninglistRecentAnalyses",
    description: "List code scanning analyses for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
          type: "",
          description: "The Git reference for the analyses you want to list. The `ref` for a branch can be formatted either as `refs/heads/<branch name>` or simply `<branch name>`. To reference a pull request use `refs/pull/<number>/merge`.",
        },
        sarif_id: {
          type: "",
          description: "Filter analyses belonging to the same SARIF upload.",
        },
        sort: {
          type: "string",
          description: "The property by which to sort the results.",
          enum: ["created"],
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
    name: "codeScanninggetAnalysis",
    description: "Get a code scanning analysis for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        analysis_id: {
          type: "integer",
          description: "The ID of the analysis, as returned from the `GET /repos/{owner}/{repo}/code-scanning/analyses` operation.",
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
      required: ["analysis_id", "owner", "repo"],
    },
  },
  {
    name: "codeScanningdeleteAnalysis",
    description: "Delete a code scanning analysis from a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        analysis_id: {
          type: "integer",
          description: "The ID of the analysis, as returned from the `GET /repos/{owner}/{repo}/code-scanning/analyses` operation.",
        },
        confirm_delete: {
          type: "string",
          description: "Allow deletion if the specified analysis is the last in a set. If you attempt to delete the final analysis in a set without setting this parameter to `true`, you'll get a 400 response with the message: `Analysis is last of its type and deletion may result in the loss of historical alert data. Please specify confirm_delete.`",
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
      required: ["analysis_id", "owner", "repo"],
    },
  },
  {
    name: "codeScanninglistCodeqlDatabases",
    description: "List CodeQL databases for a repository",
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
    name: "codeScanninggetCodeqlDatabase",
    description: "Get a CodeQL database for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        language: {
          type: "string",
          description: "The language of the CodeQL database.",
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
      required: ["language", "owner", "repo"],
    },
  },
  {
    name: "codeScanningdeleteCodeqlDatabase",
    description: "Delete a CodeQL database",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        language: {
          type: "string",
          description: "The language of the CodeQL database.",
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
      required: ["language", "owner", "repo"],
    },
  },
  {
    name: "codeScanningcreateVariantAnalysis",
    description: "Create a CodeQL variant analysis",
    inputSchema: {
      type: "object",
      properties: {
        language: {
          type: "",
          description: "",
        },
        query_pack: {
          type: "string",
          description: "A Base64-encoded tarball containing a CodeQL query and all its dependencies",
        },
        repositories: {
          type: "array",
          description: "List of repository names (in the form `owner/repo-name`) to run the query against. Precisely one property from `repositories`, `repository_lists` and `repository_owners` is required.",
        },
        repository_lists: {
          type: "array",
          description: "List of repository lists to run the query against. Precisely one property from `repositories`, `repository_lists` and `repository_owners` is required.",
        },
        repository_owners: {
          type: "array",
          description: "List of organization or user names whose repositories the query should be run against. Precisely one property from `repositories`, `repository_lists` and `repository_owners` is required.",
        },
      },
      required: ["language", "query_pack"],
    },
  },
  {
    name: "codeScanninggetVariantAnalysis",
    description: "Get the summary of a CodeQL variant analysis",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codeql_variant_analysis_id: {
          type: "integer",
          description: "The unique identifier of the variant analysis.",
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
      required: ["codeql_variant_analysis_id", "owner", "repo"],
    },
  },
  {
    name: "codeScanninggetVariantAnalysisRepoTask",
    description: "Get the analysis status of a repository in a CodeQL variant analysis",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repo: {
          type: "string",
          description: "The name of the controller repository.",
        },
        codeql_variant_analysis_id: {
          type: "integer",
          description: "The ID of the variant analysis.",
        },
        repo_owner: {
          type: "string",
          description: "The account owner of the variant analysis repository. The name is not case sensitive.",
        },
        repo_name: {
          type: "string",
          description: "The name of the variant analysis repository.",
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
      },
      required: ["repo", "codeql_variant_analysis_id", "repo_owner", "repo_name", "owner"],
    },
  },
  {
    name: "codeScanninggetDefaultSetup",
    description: "Get a code scanning default setup configuration",
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
    name: "codeScanningupdateDefaultSetup",
    description: "Update a code scanning default setup configuration",
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
    name: "codeScanninguploadSarif",
    description: "Upload an analysis as SARIF data",
    inputSchema: {
      type: "object",
      properties: {
        commit_sha: {
          type: "",
          description: "",
        },
        ref: {
          type: "",
          description: "",
        },
        sarif: {
          type: "",
          description: "",
        },
        checkout_uri: {
          type: "string",
          description: "The base directory used in the analysis, as it appears in the SARIF file.
This property is used to convert file paths from absolute to relative, so that alerts can be mapped to their correct location in the repository.",
        },
        started_at: {
          type: "string",
          description: "The time that the analysis run began. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`.",
        },
        tool_name: {
          type: "string",
          description: "The name of the tool used to generate the code scanning analysis. If this parameter is not used, the tool name defaults to "API". If the uploaded SARIF contains a tool GUID, this will be available for filtering using the `tool_guid` parameter of operations such as `GET /repos/{owner}/{repo}/code-scanning/alerts`.",
        },
        validate: {
          type: "boolean",
          description: "Whether the SARIF file will be validated according to the code scanning specifications.
This parameter is intended to help integrators ensure that the uploaded SARIF files are correctly rendered by code scanning.",
        },
      },
      required: ["commit_sha", "ref", "sarif"],
    },
  },
  {
    name: "codeScanninggetSarif",
    description: "Get information about a SARIF upload",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sarif_id: {
          type: "string",
          description: "The SARIF ID obtained after uploading.",
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
      required: ["sarif_id", "owner", "repo"],
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
  const client = new GitHubv3RESTAPIcodescanningClient(accessToken);

  try {
    switch (name) {
      case "codeScanninglistAlertsForOrg": {
        const result = await client.codeScanninglistAlertsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninglistAlertsForRepo": {
        const result = await client.codeScanninglistAlertsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetAlert": {
        const result = await client.codeScanninggetAlert(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanningupdateAlert": {
        const result = await client.codeScanningupdateAlert(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetAutofix": {
        const result = await client.codeScanninggetAutofix(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanningcreateAutofix": {
        const result = await client.codeScanningcreateAutofix(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanningcommitAutofix": {
        const result = await client.codeScanningcommitAutofix(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninglistAlertInstances": {
        const result = await client.codeScanninglistAlertInstances(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninglistRecentAnalyses": {
        const result = await client.codeScanninglistRecentAnalyses(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetAnalysis": {
        const result = await client.codeScanninggetAnalysis(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanningdeleteAnalysis": {
        const result = await client.codeScanningdeleteAnalysis(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninglistCodeqlDatabases": {
        const result = await client.codeScanninglistCodeqlDatabases(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetCodeqlDatabase": {
        const result = await client.codeScanninggetCodeqlDatabase(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanningdeleteCodeqlDatabase": {
        const result = await client.codeScanningdeleteCodeqlDatabase(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanningcreateVariantAnalysis": {
        const result = await client.codeScanningcreateVariantAnalysis(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetVariantAnalysis": {
        const result = await client.codeScanninggetVariantAnalysis(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetVariantAnalysisRepoTask": {
        const result = await client.codeScanninggetVariantAnalysisRepoTask(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetDefaultSetup": {
        const result = await client.codeScanninggetDefaultSetup(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanningupdateDefaultSetup": {
        const result = await client.codeScanningupdateDefaultSetup(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninguploadSarif": {
        const result = await client.codeScanninguploadSarif(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeScanninggetSarif": {
        const result = await client.codeScanninggetSarif(args as any);
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
  console.error("GitHub v3 REST API - code-scanning MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
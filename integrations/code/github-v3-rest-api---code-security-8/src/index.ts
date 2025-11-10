/**
 * MCP Server: GitHub v3 REST API - code-security
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
class GitHubv3RESTAPIcodesecurityClient {
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
   * Get code security configurations for an enterprise
   */
  async codeSecuritygetConfigurationsForEnterprise(params: {
    None?: string;
    per_page?: number;
    enterprise: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a code security configuration for an enterprise
   */
  async codeSecuritycreateConfigurationForEnterprise(params: {
    name: string;
    description: string;
    advanced_security?: "enabled" | "disabled" | "code_security" | "secret_protection";
    code_security?: "enabled" | "disabled" | "not_set";
    dependency_graph?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action_options?: {
  labeled_runners?: boolean;
};
    dependabot_alerts?: "enabled" | "disabled" | "not_set";
    dependabot_security_updates?: "enabled" | "disabled" | "not_set";
    code_scanning_options?: any;
    code_scanning_default_setup?: "enabled" | "disabled" | "not_set";
    code_scanning_default_setup_options?: any;
    code_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    secret_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning?: "enabled" | "disabled" | "not_set";
    secret_scanning_push_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning_validity_checks?: "enabled" | "disabled" | "not_set";
    secret_scanning_non_provider_patterns?: "enabled" | "disabled" | "not_set";
    secret_scanning_generic_secrets?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    private_vulnerability_reporting?: "enabled" | "disabled" | "not_set";
    enforcement?: "enforced" | "unenforced";
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get default code security configurations for an enterprise
   */
  async codeSecuritygetDefaultConfigurationsForEnterprise(params: {
    None?: string;
    enterprise: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations/defaults";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Retrieve a code security configuration of an enterprise
   */
  async codeSecuritygetSingleConfigurationForEnterprise(params: {
    None?: string;
    enterprise: string;
    configuration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations/{configuration_id}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ configuration_id }}}", String(params.configuration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a custom code security configuration for an enterprise
   */
  async codeSecurityupdateEnterpriseConfiguration(params: {
    name?: string;
    description?: string;
    advanced_security?: "enabled" | "disabled" | "code_security" | "secret_protection";
    code_security?: "enabled" | "disabled" | "not_set";
    dependency_graph?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action_options?: {
  labeled_runners?: boolean;
};
    dependabot_alerts?: "enabled" | "disabled" | "not_set";
    dependabot_security_updates?: "enabled" | "disabled" | "not_set";
    code_scanning_default_setup?: "enabled" | "disabled" | "not_set";
    code_scanning_default_setup_options?: any;
    code_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    secret_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning?: "enabled" | "disabled" | "not_set";
    secret_scanning_push_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning_validity_checks?: "enabled" | "disabled" | "not_set";
    secret_scanning_non_provider_patterns?: "enabled" | "disabled" | "not_set";
    secret_scanning_generic_secrets?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    private_vulnerability_reporting?: "enabled" | "disabled" | "not_set";
    enforcement?: "enforced" | "unenforced";
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations/{configuration_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a code security configuration for an enterprise
   */
  async codeSecuritydeleteConfigurationForEnterprise(params: {
    None?: string;
    enterprise: string;
    configuration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations/{configuration_id}";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ configuration_id }}}", String(params.configuration_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Attach an enterprise configuration to repositories
   */
  async codeSecurityattachEnterpriseConfiguration(params: {
    scope: "all" | "all_without_configurations";
  }): Promise<any> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set a code security configuration as a default for an enterprise
   */
  async codeSecuritysetConfigurationAsDefaultForEnterprise(params: {
    default_for_new_repos?: "all" | "none" | "private_and_internal" | "public";
  }): Promise<{
  default_for_new_repos?: "all" | "none" | "private_and_internal" | "public";
  configuration?: any;
}> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get repositories associated with an enterprise code security configuration
   */
  async codeSecuritygetRepositoriesForEnterpriseConfigurat(params: {
    None?: string;
    per_page?: number;
    status?: string;
    enterprise: string;
    configuration_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/enterprises/{enterprise}/code-security/configurations/{configuration_id}/repositories";
    path = path.replace("{{ enterprise }}}", String(params.enterprise));
    path = path.replace("{{ configuration_id }}}", String(params.configuration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get code security configurations for an organization
   */
  async codeSecuritygetConfigurationsForOrg(params: {
    None?: string;
    target_type?: "global" | "all";
    per_page?: number;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a code security configuration
   */
  async codeSecuritycreateConfiguration(params: {
    name: string;
    description: string;
    advanced_security?: "enabled" | "disabled" | "code_security" | "secret_protection";
    code_security?: "enabled" | "disabled" | "not_set";
    dependency_graph?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action_options?: {
  labeled_runners?: boolean;
};
    dependabot_alerts?: "enabled" | "disabled" | "not_set";
    dependabot_security_updates?: "enabled" | "disabled" | "not_set";
    code_scanning_options?: any;
    code_scanning_default_setup?: "enabled" | "disabled" | "not_set";
    code_scanning_default_setup_options?: any;
    code_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    secret_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning?: "enabled" | "disabled" | "not_set";
    secret_scanning_push_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_bypass?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_bypass_options?: {
  reviewers?: Array<{
    reviewer_id: number;
    reviewer_type: "TEAM" | "ROLE";
  }>;
};
    secret_scanning_validity_checks?: "enabled" | "disabled" | "not_set";
    secret_scanning_non_provider_patterns?: "enabled" | "disabled" | "not_set";
    secret_scanning_generic_secrets?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    private_vulnerability_reporting?: "enabled" | "disabled" | "not_set";
    enforcement?: "enforced" | "unenforced";
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get default code security configurations
   */
  async codeSecuritygetDefaultConfigurations(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/defaults";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Detach configurations from repositories
   */
  async codeSecuritydetachConfiguration(params: {
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/detach";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a code security configuration
   */
  async codeSecuritygetConfiguration(params: {
    None?: string;
    org: string;
    configuration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/{configuration_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ configuration_id }}}", String(params.configuration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a code security configuration
   */
  async codeSecurityupdateConfiguration(params: {
    name?: string;
    description?: string;
    advanced_security?: "enabled" | "disabled" | "code_security" | "secret_protection";
    code_security?: "enabled" | "disabled" | "not_set";
    dependency_graph?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action?: "enabled" | "disabled" | "not_set";
    dependency_graph_autosubmit_action_options?: {
  labeled_runners?: boolean;
};
    dependabot_alerts?: "enabled" | "disabled" | "not_set";
    dependabot_security_updates?: "enabled" | "disabled" | "not_set";
    code_scanning_default_setup?: "enabled" | "disabled" | "not_set";
    code_scanning_default_setup_options?: any;
    code_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    secret_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning?: "enabled" | "disabled" | "not_set";
    secret_scanning_push_protection?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_bypass?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_bypass_options?: {
  reviewers?: Array<{
    reviewer_id: number;
    reviewer_type: "TEAM" | "ROLE";
  }>;
};
    secret_scanning_validity_checks?: "enabled" | "disabled" | "not_set";
    secret_scanning_non_provider_patterns?: "enabled" | "disabled" | "not_set";
    secret_scanning_generic_secrets?: "enabled" | "disabled" | "not_set";
    secret_scanning_delegated_alert_dismissal?: "enabled" | "disabled" | "not_set";
    private_vulnerability_reporting?: "enabled" | "disabled" | "not_set";
    enforcement?: "enforced" | "unenforced";
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/{configuration_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a code security configuration
   */
  async codeSecuritydeleteConfiguration(params: {
    None?: string;
    org: string;
    configuration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/{configuration_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ configuration_id }}}", String(params.configuration_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Attach a configuration to repositories
   */
  async codeSecurityattachConfiguration(params: {
    scope: "all" | "all_without_configurations" | "public" | "private_or_internal" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/{configuration_id}/attach";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set a code security configuration as a default for an organization
   */
  async codeSecuritysetConfigurationAsDefault(params: {
    default_for_new_repos?: "all" | "none" | "private_and_internal" | "public";
  }): Promise<{
  default_for_new_repos?: "all" | "none" | "private_and_internal" | "public";
  configuration?: any;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/{configuration_id}/defaults";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get repositories associated with a code security configuration
   */
  async codeSecuritygetRepositoriesForConfiguration(params: {
    None?: string;
    per_page?: number;
    status?: string;
    org: string;
    configuration_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/code-security/configurations/{configuration_id}/repositories";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ configuration_id }}}", String(params.configuration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get the code security configuration associated with a repository
   */
  async codeSecuritygetConfigurationForRepository(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/code-security-configuration";
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
    name: "github-v3-rest-api---code-security-8",
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
    name: "codeSecuritygetConfigurationsForEnterprise",
    description: "Get code security configurations for an enterprise",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        per_page: {
          type: "integer",
          description: "The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
      },
      required: ["enterprise"],
    },
  },
  {
    name: "codeSecuritycreateConfigurationForEnterprise",
    description: "Create a code security configuration for an enterprise",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the code security configuration. Must be unique within the enterprise.",
        },
        description: {
          type: "string",
          description: "A description of the code security configuration",
        },
        advanced_security: {
          type: "string",
          description: "The enablement status of GitHub Advanced Security features. `enabled` will enable both Code Security and Secret Protection features.

> [!WARNING]
> `code_security` and `secret_protection` are deprecated values for this field. Prefer the individual `code_security` and `secret_protection` fields to set the status of these features.
",
          enum: ["enabled", "disabled", "code_security", "secret_protection"],
        },
        code_security: {
          type: "string",
          description: "The enablement status of GitHub Code Security features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph: {
          type: "string",
          description: "The enablement status of Dependency Graph",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action: {
          type: "string",
          description: "The enablement status of Automatic dependency submission",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action_options: {
          type: "object",
          description: "Feature options for Automatic dependency submission",
        },
        dependabot_alerts: {
          type: "string",
          description: "The enablement status of Dependabot alerts",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependabot_security_updates: {
          type: "string",
          description: "The enablement status of Dependabot security updates",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_options: {
          type: "",
          description: "",
        },
        code_scanning_default_setup: {
          type: "string",
          description: "The enablement status of code scanning default setup",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_default_setup_options: {
          type: "",
          description: "",
        },
        code_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of code scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_protection: {
          type: "string",
          description: "The enablement status of GitHub Secret Protection features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning: {
          type: "string",
          description: "The enablement status of secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_push_protection: {
          type: "string",
          description: "The enablement status of secret scanning push protection",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_validity_checks: {
          type: "string",
          description: "The enablement status of secret scanning validity checks",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_non_provider_patterns: {
          type: "string",
          description: "The enablement status of secret scanning non provider patterns",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_generic_secrets: {
          type: "string",
          description: "The enablement status of Copilot secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of secret scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        private_vulnerability_reporting: {
          type: "string",
          description: "The enablement status of private vulnerability reporting",
          enum: ["enabled", "disabled", "not_set"],
        },
        enforcement: {
          type: "string",
          description: "The enforcement status for a security configuration",
          enum: ["enforced", "unenforced"],
        },
      },
      required: ["name", "description"],
    },
  },
  {
    name: "codeSecuritygetDefaultConfigurationsForEnterprise",
    description: "Get default code security configurations for an enterprise",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
      },
      required: ["enterprise"],
    },
  },
  {
    name: "codeSecuritygetSingleConfigurationForEnterprise",
    description: "Retrieve a code security configuration of an enterprise",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
        configuration_id: {
          type: "string",
          description: "Path parameter: configuration_id",
        },
      },
      required: ["enterprise", "configuration_id"],
    },
  },
  {
    name: "codeSecurityupdateEnterpriseConfiguration",
    description: "Update a custom code security configuration for an enterprise",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the code security configuration. Must be unique across the enterprise.",
        },
        description: {
          type: "string",
          description: "A description of the code security configuration",
        },
        advanced_security: {
          type: "string",
          description: "The enablement status of GitHub Advanced Security features. `enabled` will enable both Code Security and Secret Protection features.

> [!WARNING]
> `code_security` and `secret_protection` are deprecated values for this field. Prefer the individual `code_security` and `secret_protection` fields to set the status of these features.
",
          enum: ["enabled", "disabled", "code_security", "secret_protection"],
        },
        code_security: {
          type: "string",
          description: "The enablement status of GitHub Code Security features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph: {
          type: "string",
          description: "The enablement status of Dependency Graph",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action: {
          type: "string",
          description: "The enablement status of Automatic dependency submission",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action_options: {
          type: "object",
          description: "Feature options for Automatic dependency submission",
        },
        dependabot_alerts: {
          type: "string",
          description: "The enablement status of Dependabot alerts",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependabot_security_updates: {
          type: "string",
          description: "The enablement status of Dependabot security updates",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_default_setup: {
          type: "string",
          description: "The enablement status of code scanning default setup",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_default_setup_options: {
          type: "",
          description: "",
        },
        code_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of code scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_protection: {
          type: "string",
          description: "The enablement status of GitHub Secret Protection features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning: {
          type: "string",
          description: "The enablement status of secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_push_protection: {
          type: "string",
          description: "The enablement status of secret scanning push protection",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_validity_checks: {
          type: "string",
          description: "The enablement status of secret scanning validity checks",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_non_provider_patterns: {
          type: "string",
          description: "The enablement status of secret scanning non-provider patterns",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_generic_secrets: {
          type: "string",
          description: "The enablement status of Copilot secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of secret scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        private_vulnerability_reporting: {
          type: "string",
          description: "The enablement status of private vulnerability reporting",
          enum: ["enabled", "disabled", "not_set"],
        },
        enforcement: {
          type: "string",
          description: "The enforcement status for a security configuration",
          enum: ["enforced", "unenforced"],
        },
      },
      required: [],
    },
  },
  {
    name: "codeSecuritydeleteConfigurationForEnterprise",
    description: "Delete a code security configuration for an enterprise",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
        configuration_id: {
          type: "string",
          description: "Path parameter: configuration_id",
        },
      },
      required: ["enterprise", "configuration_id"],
    },
  },
  {
    name: "codeSecurityattachEnterpriseConfiguration",
    description: "Attach an enterprise configuration to repositories",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          description: "The type of repositories to attach the configuration to.",
          enum: ["all", "all_without_configurations"],
        },
      },
      required: ["scope"],
    },
  },
  {
    name: "codeSecuritysetConfigurationAsDefaultForEnterprise",
    description: "Set a code security configuration as a default for an enterprise",
    inputSchema: {
      type: "object",
      properties: {
        default_for_new_repos: {
          type: "string",
          description: "Specify which types of repository this security configuration should be applied to by default.",
          enum: ["all", "none", "private_and_internal", "public"],
        },
      },
      required: [],
    },
  },
  {
    name: "codeSecuritygetRepositoriesForEnterpriseConfigurat",
    description: "Get repositories associated with an enterprise code security configuration",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        per_page: {
          type: "integer",
          description: "The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
        status: {
          type: "string",
          description: "A comma-separated list of statuses. If specified, only repositories with these attachment statuses will be returned.

Can be: `all`, `attached`, `attaching`, `removed`, `enforced`, `failed`, `updating`, `removed_by_enterprise`",
        },
        enterprise: {
          type: "string",
          description: "Path parameter: enterprise",
        },
        configuration_id: {
          type: "string",
          description: "Path parameter: configuration_id",
        },
      },
      required: ["enterprise", "configuration_id"],
    },
  },
  {
    name: "codeSecuritygetConfigurationsForOrg",
    description: "Get code security configurations for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        target_type: {
          type: "string",
          description: "The target type of the code security configuration",
          enum: ["global", "all"],
        },
        per_page: {
          type: "integer",
          description: "The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
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
    name: "codeSecuritycreateConfiguration",
    description: "Create a code security configuration",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the code security configuration. Must be unique within the organization.",
        },
        description: {
          type: "string",
          description: "A description of the code security configuration",
        },
        advanced_security: {
          type: "string",
          description: "The enablement status of GitHub Advanced Security features. `enabled` will enable both Code Security and Secret Protection features.

> [!WARNING]
> `code_security` and `secret_protection` are deprecated values for this field. Prefer the individual `code_security` and `secret_protection` fields to set the status of these features.
",
          enum: ["enabled", "disabled", "code_security", "secret_protection"],
        },
        code_security: {
          type: "string",
          description: "The enablement status of GitHub Code Security features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph: {
          type: "string",
          description: "The enablement status of Dependency Graph",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action: {
          type: "string",
          description: "The enablement status of Automatic dependency submission",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action_options: {
          type: "object",
          description: "Feature options for Automatic dependency submission",
        },
        dependabot_alerts: {
          type: "string",
          description: "The enablement status of Dependabot alerts",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependabot_security_updates: {
          type: "string",
          description: "The enablement status of Dependabot security updates",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_options: {
          type: "",
          description: "",
        },
        code_scanning_default_setup: {
          type: "string",
          description: "The enablement status of code scanning default setup",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_default_setup_options: {
          type: "",
          description: "",
        },
        code_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of code scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_protection: {
          type: "string",
          description: "The enablement status of GitHub Secret Protection features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning: {
          type: "string",
          description: "The enablement status of secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_push_protection: {
          type: "string",
          description: "The enablement status of secret scanning push protection",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_bypass: {
          type: "string",
          description: "The enablement status of secret scanning delegated bypass",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_bypass_options: {
          type: "object",
          description: "Feature options for secret scanning delegated bypass",
        },
        secret_scanning_validity_checks: {
          type: "string",
          description: "The enablement status of secret scanning validity checks",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_non_provider_patterns: {
          type: "string",
          description: "The enablement status of secret scanning non provider patterns",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_generic_secrets: {
          type: "string",
          description: "The enablement status of Copilot secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of secret scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        private_vulnerability_reporting: {
          type: "string",
          description: "The enablement status of private vulnerability reporting",
          enum: ["enabled", "disabled", "not_set"],
        },
        enforcement: {
          type: "string",
          description: "The enforcement status for a security configuration",
          enum: ["enforced", "unenforced"],
        },
      },
      required: ["name", "description"],
    },
  },
  {
    name: "codeSecuritygetDefaultConfigurations",
    description: "Get default code security configurations",
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
    name: "codeSecuritydetachConfiguration",
    description: "Detach configurations from repositories",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "An array of repository IDs to detach from configurations. Up to 250 IDs can be provided.",
        },
      },
      required: [],
    },
  },
  {
    name: "codeSecuritygetConfiguration",
    description: "Get a code security configuration",
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
        configuration_id: {
          type: "string",
          description: "Path parameter: configuration_id",
        },
      },
      required: ["org", "configuration_id"],
    },
  },
  {
    name: "codeSecurityupdateConfiguration",
    description: "Update a code security configuration",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the code security configuration. Must be unique within the organization.",
        },
        description: {
          type: "string",
          description: "A description of the code security configuration",
        },
        advanced_security: {
          type: "string",
          description: "The enablement status of GitHub Advanced Security features. `enabled` will enable both Code Security and Secret Protection features.

> [!WARNING]
> `code_security` and `secret_protection` are deprecated values for this field. Prefer the individual `code_security` and `secret_protection` fields to set the status of these features.
",
          enum: ["enabled", "disabled", "code_security", "secret_protection"],
        },
        code_security: {
          type: "string",
          description: "The enablement status of GitHub Code Security features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph: {
          type: "string",
          description: "The enablement status of Dependency Graph",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action: {
          type: "string",
          description: "The enablement status of Automatic dependency submission",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependency_graph_autosubmit_action_options: {
          type: "object",
          description: "Feature options for Automatic dependency submission",
        },
        dependabot_alerts: {
          type: "string",
          description: "The enablement status of Dependabot alerts",
          enum: ["enabled", "disabled", "not_set"],
        },
        dependabot_security_updates: {
          type: "string",
          description: "The enablement status of Dependabot security updates",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_default_setup: {
          type: "string",
          description: "The enablement status of code scanning default setup",
          enum: ["enabled", "disabled", "not_set"],
        },
        code_scanning_default_setup_options: {
          type: "",
          description: "",
        },
        code_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of code scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_protection: {
          type: "string",
          description: "The enablement status of GitHub Secret Protection features.",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning: {
          type: "string",
          description: "The enablement status of secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_push_protection: {
          type: "string",
          description: "The enablement status of secret scanning push protection",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_bypass: {
          type: "string",
          description: "The enablement status of secret scanning delegated bypass",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_bypass_options: {
          type: "object",
          description: "Feature options for secret scanning delegated bypass",
        },
        secret_scanning_validity_checks: {
          type: "string",
          description: "The enablement status of secret scanning validity checks",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_non_provider_patterns: {
          type: "string",
          description: "The enablement status of secret scanning non-provider patterns",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_generic_secrets: {
          type: "string",
          description: "The enablement status of Copilot secret scanning",
          enum: ["enabled", "disabled", "not_set"],
        },
        secret_scanning_delegated_alert_dismissal: {
          type: "string",
          description: "The enablement status of secret scanning delegated alert dismissal",
          enum: ["enabled", "disabled", "not_set"],
        },
        private_vulnerability_reporting: {
          type: "string",
          description: "The enablement status of private vulnerability reporting",
          enum: ["enabled", "disabled", "not_set"],
        },
        enforcement: {
          type: "string",
          description: "The enforcement status for a security configuration",
          enum: ["enforced", "unenforced"],
        },
      },
      required: [],
    },
  },
  {
    name: "codeSecuritydeleteConfiguration",
    description: "Delete a code security configuration",
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
        configuration_id: {
          type: "string",
          description: "Path parameter: configuration_id",
        },
      },
      required: ["org", "configuration_id"],
    },
  },
  {
    name: "codeSecurityattachConfiguration",
    description: "Attach a configuration to repositories",
    inputSchema: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          description: "The type of repositories to attach the configuration to. `selected` means the configuration will be attached to only the repositories specified by `selected_repository_ids`",
          enum: ["all", "all_without_configurations", "public", "private_or_internal", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository IDs to attach the configuration to. You can only provide a list of repository ids when the `scope` is set to `selected`.",
        },
      },
      required: ["scope"],
    },
  },
  {
    name: "codeSecuritysetConfigurationAsDefault",
    description: "Set a code security configuration as a default for an organization",
    inputSchema: {
      type: "object",
      properties: {
        default_for_new_repos: {
          type: "string",
          description: "Specify which types of repository this security configuration should be applied to by default.",
          enum: ["all", "none", "private_and_internal", "public"],
        },
      },
      required: [],
    },
  },
  {
    name: "codeSecuritygetRepositoriesForConfiguration",
    description: "Get repositories associated with a code security configuration",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        per_page: {
          type: "integer",
          description: "The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
        },
        status: {
          type: "string",
          description: "A comma-separated list of statuses. If specified, only repositories with these attachment statuses will be returned.

Can be: `all`, `attached`, `attaching`, `detached`, `removed`, `enforced`, `failed`, `updating`, `removed_by_enterprise`",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        configuration_id: {
          type: "string",
          description: "Path parameter: configuration_id",
        },
      },
      required: ["org", "configuration_id"],
    },
  },
  {
    name: "codeSecuritygetConfigurationForRepository",
    description: "Get the code security configuration associated with a repository",
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
  const client = new GitHubv3RESTAPIcodesecurityClient(accessToken);

  try {
    switch (name) {
      case "codeSecuritygetConfigurationsForEnterprise": {
        const result = await client.codeSecuritygetConfigurationsForEnterprise(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritycreateConfigurationForEnterprise": {
        const result = await client.codeSecuritycreateConfigurationForEnterprise(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetDefaultConfigurationsForEnterprise": {
        const result = await client.codeSecuritygetDefaultConfigurationsForEnterprise(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetSingleConfigurationForEnterprise": {
        const result = await client.codeSecuritygetSingleConfigurationForEnterprise(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecurityupdateEnterpriseConfiguration": {
        const result = await client.codeSecurityupdateEnterpriseConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritydeleteConfigurationForEnterprise": {
        const result = await client.codeSecuritydeleteConfigurationForEnterprise(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecurityattachEnterpriseConfiguration": {
        const result = await client.codeSecurityattachEnterpriseConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritysetConfigurationAsDefaultForEnterprise": {
        const result = await client.codeSecuritysetConfigurationAsDefaultForEnterprise(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetRepositoriesForEnterpriseConfigurat": {
        const result = await client.codeSecuritygetRepositoriesForEnterpriseConfigurat(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetConfigurationsForOrg": {
        const result = await client.codeSecuritygetConfigurationsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritycreateConfiguration": {
        const result = await client.codeSecuritycreateConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetDefaultConfigurations": {
        const result = await client.codeSecuritygetDefaultConfigurations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritydetachConfiguration": {
        const result = await client.codeSecuritydetachConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetConfiguration": {
        const result = await client.codeSecuritygetConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecurityupdateConfiguration": {
        const result = await client.codeSecurityupdateConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritydeleteConfiguration": {
        const result = await client.codeSecuritydeleteConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecurityattachConfiguration": {
        const result = await client.codeSecurityattachConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritysetConfigurationAsDefault": {
        const result = await client.codeSecuritysetConfigurationAsDefault(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetRepositoriesForConfiguration": {
        const result = await client.codeSecuritygetRepositoriesForConfiguration(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codeSecuritygetConfigurationForRepository": {
        const result = await client.codeSecuritygetConfigurationForRepository(args as any);
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
  console.error("GitHub v3 REST API - code-security MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
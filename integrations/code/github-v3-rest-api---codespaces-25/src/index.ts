/**
 * MCP Server: GitHub v3 REST API - codespaces
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
class GitHubv3RESTAPIcodespacesClient {
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
   * List codespaces for the organization
   */
  async codespaceslistInOrganization(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  codespaces: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Manage access control for organization codespaces
   */
  async codespacessetCodespacesAccess(params: {
    visibility: "disabled" | "selected_members" | "all_members" | "all_members_and_outside_collaborators";
    selected_usernames?: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/access";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add users to Codespaces access for an organization
   */
  async codespacessetCodespacesAccessUsers(params: {
    selected_usernames: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/access/selected_users";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove users from Codespaces access for an organization
   */
  async codespacesdeleteCodespacesAccessUsers(params: {
    selected_usernames: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/access/selected_users";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization secrets
   */
  async codespaceslistOrgSecrets(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization public key
   */
  async codespacesgetOrgPublicKey(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/public-key";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization secret
   */
  async codespacesgetOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/{secret_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update an organization secret
   */
  async codespacescreateOrUpdateOrgSecret(params: {
    encrypted_value?: string;
    key_id?: string;
    visibility: "all" | "private" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/{secret_name}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an organization secret
   */
  async codespacesdeleteOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/{secret_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List selected repositories for an organization secret
   */
  async codespaceslistSelectedReposForOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/{secret_name}/repositories";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set selected repositories for an organization secret
   */
  async codespacessetSelectedReposForOrgSecret(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/{secret_name}/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add selected repository to an organization secret
   */
  async codespacesaddSelectedRepoToOrgSecret(params: {
    None?: string;
    repository_id: number;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove selected repository from an organization secret
   */
  async codespacesremoveSelectedRepoFromOrgSecret(params: {
    None?: string;
    repository_id: number;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List codespaces for a user in organization
   */
  async codespacesgetCodespacesForUserInOrg(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<{
  total_count: number;
  codespaces: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/members/{username}/codespaces";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a codespace from the organization
   */
  async codespacesdeleteFromOrganization(params: {
    None?: string;
    org: string;
    username: string;
    codespace_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/members/{username}/codespaces/{codespace_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Stop a codespace for an organization user
   */
  async codespacesstopInOrganization(params: {
    None?: string;
    org: string;
    username: string;
    codespace_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/members/{username}/codespaces/{codespace_name}/stop";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List codespaces in a repository for the authenticated user
   */
  async codespaceslistInRepositoryForAuthenticatedUser(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  codespaces: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces";
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
   * Create a codespace in a repository
   */
  async codespacescreateWithRepoForAuthenticatedUser(params: {
    ref?: string;
    location?: string;
    geo?: "EuropeWest" | "SoutheastAsia" | "UsEast" | "UsWest";
    client_ip?: string;
    machine?: string;
    devcontainer_path?: string;
    multi_repo_permissions_opt_out?: boolean;
    working_directory?: string;
    idle_timeout_minutes?: number;
    display_name?: string;
    retention_period_minutes?: number;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List devcontainer configurations in a repository for the authenticated user
   */
  async codespaceslistDevcontainersInRepositoryForAuthenti(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  devcontainers: Array<{
    path: string;
    name?: string;
    display_name?: string;
  }>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/devcontainers";
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
   * List available machine types for a repository
   */
  async codespacesrepoMachinesForAuthenticatedUser(params: {
    None?: string;
    location?: string;
    client_ip?: string;
    ref?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  machines: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/machines";
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
   * Get default attributes for a codespace
   */
  async codespacespreFlightWithRepoForAuthenticatedUser(params: {
    None?: string;
    ref?: string;
    client_ip?: string;
    owner: string;
    repo: string;
  }): Promise<{
  billable_owner?: any;
  defaults?: {
    location: string;
    devcontainer_path: string;
  };
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/new";
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
   * Check if permissions defined by a devcontainer have been accepted by the authenticated user
   */
  async codespacescheckPermissionsForDevcontainer(params: {
    None?: string;
    ref: string;
    devcontainer_path: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/permissions_check";
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
   * List repository secrets
   */
  async codespaceslistRepoSecrets(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/secrets";
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
   * Get a repository public key
   */
  async codespacesgetRepoPublicKey(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/secrets/public-key";
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
   * Get a repository secret
   */
  async codespacesgetRepoSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/secrets/{secret_name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update a repository secret
   */
  async codespacescreateOrUpdateRepoSecret(params: {
    encrypted_value?: string;
    key_id?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/secrets/{secret_name}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository secret
   */
  async codespacesdeleteRepoSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codespaces/secrets/{secret_name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a codespace from a pull request
   */
  async codespacescreateWithPrForAuthenticatedUser(params: {
    location?: string;
    geo?: "EuropeWest" | "SoutheastAsia" | "UsEast" | "UsWest";
    client_ip?: string;
    machine?: string;
    devcontainer_path?: string;
    multi_repo_permissions_opt_out?: boolean;
    working_directory?: string;
    idle_timeout_minutes?: number;
    display_name?: string;
    retention_period_minutes?: number;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/codespaces";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List codespaces for the authenticated user
   */
  async codespaceslistForAuthenticatedUser(params: {
    None?: string;
  }): Promise<{
  total_count: number;
  codespaces: Array<any>;
}> {

    // Build path with parameters
    let path = "/user/codespaces";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a codespace for the authenticated user
   */
  async codespacescreateForAuthenticatedUser(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List secrets for the authenticated user
   */
  async codespaceslistSecretsForAuthenticatedUser(params: {
    None?: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/user/codespaces/secrets";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get public key for the authenticated user
   */
  async codespacesgetPublicKeyForAuthenticatedUser(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/public-key";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a secret for the authenticated user
   */
  async codespacesgetSecretForAuthenticatedUser(params: {
    None?: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/{secret_name}";
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update a secret for the authenticated user
   */
  async codespacescreateOrUpdateSecretForAuthenticatedUser(params: {
    encrypted_value?: string;
    key_id: string;
    selected_repository_ids?: Array<number | string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/{secret_name}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a secret for the authenticated user
   */
  async codespacesdeleteSecretForAuthenticatedUser(params: {
    None?: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/{secret_name}";
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List selected repositories for a user secret
   */
  async codespaceslistRepositoriesForSecretForAuthenticate(params: {
    None?: string;
    secret_name: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/{secret_name}/repositories";
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set selected repositories for a user secret
   */
  async codespacessetRepositoriesForSecretForAuthenticated(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/{secret_name}/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add a selected repository to a user secret
   */
  async codespacesaddRepositoryForSecretForAuthenticatedUs(params: {
    None?: string;
    repository_id: number;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/{secret_name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a selected repository from a user secret
   */
  async codespacesremoveRepositoryForSecretForAuthenticate(params: {
    None?: string;
    repository_id: number;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/secrets/{secret_name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a codespace for the authenticated user
   */
  async codespacesgetForAuthenticatedUser(params: {
    None?: string;
    codespace_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}";
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a codespace for the authenticated user
   */
  async codespacesupdateForAuthenticatedUser(params: {
    machine?: string;
    display_name?: string;
    recent_folders?: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a codespace for the authenticated user
   */
  async codespacesdeleteForAuthenticatedUser(params: {
    None?: string;
    codespace_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}";
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Export a codespace for the authenticated user
   */
  async codespacesexportForAuthenticatedUser(params: {
    None?: string;
    codespace_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}/exports";
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get details about a codespace export
   */
  async codespacesgetExportDetailsForAuthenticatedUser(params: {
    None?: string;
    codespace_name: string;
    export_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}/exports/{export_id}";
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));
    path = path.replace("{{ export_id }}}", String(params.export_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List machine types for a codespace
   */
  async codespacescodespaceMachinesForAuthenticatedUser(params: {
    None?: string;
    codespace_name: string;
  }): Promise<{
  total_count: number;
  machines: Array<any>;
}> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}/machines";
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a repository from an unpublished codespace
   */
  async codespacespublishForAuthenticatedUser(params: {
    name?: string;
    private?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}/publish";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Start a codespace for the authenticated user
   */
  async codespacesstartForAuthenticatedUser(params: {
    None?: string;
    codespace_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}/start";
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Stop a codespace for the authenticated user
   */
  async codespacesstopForAuthenticatedUser(params: {
    None?: string;
    codespace_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/codespaces/{codespace_name}/stop";
    path = path.replace("{{ codespace_name }}}", String(params.codespace_name));

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
    name: "github-v3-rest-api---codespaces-25",
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
    name: "codespaceslistInOrganization",
    description: "List codespaces for the organization",
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
    name: "codespacessetCodespacesAccess",
    description: "Manage access control for organization codespaces",
    inputSchema: {
      type: "object",
      properties: {
        visibility: {
          type: "string",
          description: "Which users can access codespaces in the organization. `disabled` means that no users can access codespaces in the organization.",
          enum: ["disabled", "selected_members", "all_members", "all_members_and_outside_collaborators"],
        },
        selected_usernames: {
          type: "array",
          description: "The usernames of the organization members who should have access to codespaces in the organization. Required when `visibility` is `selected_members`. The provided list of usernames will replace any existing value.",
        },
      },
      required: ["visibility"],
    },
  },
  {
    name: "codespacessetCodespacesAccessUsers",
    description: "Add users to Codespaces access for an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_usernames: {
          type: "array",
          description: "The usernames of the organization members whose codespaces be billed to the organization.",
        },
      },
      required: ["selected_usernames"],
    },
  },
  {
    name: "codespacesdeleteCodespacesAccessUsers",
    description: "Remove users from Codespaces access for an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_usernames: {
          type: "array",
          description: "The usernames of the organization members whose codespaces should not be billed to the organization.",
        },
      },
      required: ["selected_usernames"],
    },
  },
  {
    name: "codespaceslistOrgSecrets",
    description: "List organization secrets",
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
    name: "codespacesgetOrgPublicKey",
    description: "Get an organization public key",
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
    name: "codespacesgetOrgSecret",
    description: "Get an organization secret",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["org", "secret_name"],
    },
  },
  {
    name: "codespacescreateOrUpdateOrgSecret",
    description: "Create or update an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "The value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get an organization public key](https://docs.github.com/rest/codespaces/organization-secrets#get-an-organization-public-key) endpoint.",
        },
        key_id: {
          type: "string",
          description: "The ID of the key you used to encrypt the secret.",
        },
        visibility: {
          type: "string",
          description: "Which type of organization repositories have access to the organization secret. `selected` means only the repositories specified by `selected_repository_ids` can access the secret.",
          enum: ["all", "private", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository IDs that can access the organization secret. You can only provide a list of repository IDs when the `visibility` is set to `selected`. You can manage the list of selected repositories using the [List selected repositories for an organization secret](https://docs.github.com/rest/codespaces/organization-secrets#list-selected-repositories-for-an-organization-secret), [Set selected repositories for an organization secret](https://docs.github.com/rest/codespaces/organization-secrets#set-selected-repositories-for-an-organization-secret), and [Remove selected repository from an organization secret](https://docs.github.com/rest/codespaces/organization-secrets#remove-selected-repository-from-an-organization-secret) endpoints.",
        },
      },
      required: ["visibility"],
    },
  },
  {
    name: "codespacesdeleteOrgSecret",
    description: "Delete an organization secret",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["org", "secret_name"],
    },
  },
  {
    name: "codespaceslistSelectedReposForOrgSecret",
    description: "List selected repositories for an organization secret",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["org", "secret_name"],
    },
  },
  {
    name: "codespacessetSelectedReposForOrgSecret",
    description: "Set selected repositories for an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the organization secret. You can only provide a list of repository ids when the `visibility` is set to `selected`. You can add and remove individual repositories using the [Set selected repositories for an organization secret](https://docs.github.com/rest/codespaces/organization-secrets#set-selected-repositories-for-an-organization-secret) and [Remove selected repository from an organization secret](https://docs.github.com/rest/codespaces/organization-secrets#remove-selected-repository-from-an-organization-secret) endpoints.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "codespacesaddSelectedRepoToOrgSecret",
    description: "Add selected repository to an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repository_id: {
          type: "integer",
          description: "",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["repository_id", "org", "secret_name"],
    },
  },
  {
    name: "codespacesremoveSelectedRepoFromOrgSecret",
    description: "Remove selected repository from an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repository_id: {
          type: "integer",
          description: "",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["repository_id", "org", "secret_name"],
    },
  },
  {
    name: "codespacesgetCodespacesForUserInOrg",
    description: "List codespaces for a user in organization",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["org", "username"],
    },
  },
  {
    name: "codespacesdeleteFromOrganization",
    description: "Delete a codespace from the organization",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["org", "username", "codespace_name"],
    },
  },
  {
    name: "codespacesstopInOrganization",
    description: "Stop a codespace for an organization user",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["org", "username", "codespace_name"],
    },
  },
  {
    name: "codespaceslistInRepositoryForAuthenticatedUser",
    description: "List codespaces in a repository for the authenticated user",
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
    name: "codespacescreateWithRepoForAuthenticatedUser",
    description: "Create a codespace in a repository",
    inputSchema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description: "Git ref (typically a branch name) for this codespace",
        },
        location: {
          type: "string",
          description: "The requested location for a new codespace. Best efforts are made to respect this upon creation. Assigned by IP if not provided.",
        },
        geo: {
          type: "string",
          description: "The geographic area for this codespace. If not specified, the value is assigned by IP. This property replaces `location`, which is closing down.",
          enum: ["EuropeWest", "SoutheastAsia", "UsEast", "UsWest"],
        },
        client_ip: {
          type: "string",
          description: "IP for location auto-detection when proxying a request",
        },
        machine: {
          type: "string",
          description: "Machine type to use for this codespace",
        },
        devcontainer_path: {
          type: "string",
          description: "Path to devcontainer.json config to use for this codespace",
        },
        multi_repo_permissions_opt_out: {
          type: "boolean",
          description: "Whether to authorize requested permissions from devcontainer.json",
        },
        working_directory: {
          type: "string",
          description: "Working directory for this codespace",
        },
        idle_timeout_minutes: {
          type: "integer",
          description: "Time in minutes before codespace stops from inactivity",
        },
        display_name: {
          type: "string",
          description: "Display name for this codespace",
        },
        retention_period_minutes: {
          type: "integer",
          description: "Duration in minutes after codespace has gone idle in which it will be deleted. Must be integer minutes between 0 and 43200 (30 days).",
        },
      },
      required: [],
    },
  },
  {
    name: "codespaceslistDevcontainersInRepositoryForAuthenti",
    description: "List devcontainer configurations in a repository for the authenticated user",
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
    name: "codespacesrepoMachinesForAuthenticatedUser",
    description: "List available machine types for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        location: {
          type: "string",
          description: "The location to check for available machines. Assigned by IP if not provided.",
        },
        client_ip: {
          type: "string",
          description: "IP for location auto-detection when proxying a request",
        },
        ref: {
          type: "string",
          description: "The branch or commit to check for prebuild availability and devcontainer restrictions.",
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
    name: "codespacespreFlightWithRepoForAuthenticatedUser",
    description: "Get default attributes for a codespace",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
          type: "string",
          description: "The branch or commit to check for a default devcontainer path. If not specified, the default branch will be checked.",
        },
        client_ip: {
          type: "string",
          description: "An alternative IP for default location auto-detection, such as when proxying a request.",
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
    name: "codespacescheckPermissionsForDevcontainer",
    description: "Check if permissions defined by a devcontainer have been accepted by the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
          type: "string",
          description: "The git reference that points to the location of the devcontainer configuration to use for the permission check. The value of `ref` will typically be a branch name (`heads/BRANCH_NAME`). For more information, see "[Git References](https://git-scm.com/book/en/v2/Git-Internals-Git-References)" in the Git documentation.",
        },
        devcontainer_path: {
          type: "string",
          description: "Path to the devcontainer.json configuration to use for the permission check.",
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
      required: ["ref", "devcontainer_path", "owner", "repo"],
    },
  },
  {
    name: "codespaceslistRepoSecrets",
    description: "List repository secrets",
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
    name: "codespacesgetRepoPublicKey",
    description: "Get a repository public key",
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
    name: "codespacesgetRepoSecret",
    description: "Get a repository secret",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["owner", "repo", "secret_name"],
    },
  },
  {
    name: "codespacescreateOrUpdateRepoSecret",
    description: "Create or update a repository secret",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "Value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get a repository public key](https://docs.github.com/rest/codespaces/repository-secrets#get-a-repository-public-key) endpoint.",
        },
        key_id: {
          type: "string",
          description: "ID of the key you used to encrypt the secret.",
        },
      },
      required: [],
    },
  },
  {
    name: "codespacesdeleteRepoSecret",
    description: "Delete a repository secret",
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
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["owner", "repo", "secret_name"],
    },
  },
  {
    name: "codespacescreateWithPrForAuthenticatedUser",
    description: "Create a codespace from a pull request",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The requested location for a new codespace. Best efforts are made to respect this upon creation. Assigned by IP if not provided.",
        },
        geo: {
          type: "string",
          description: "The geographic area for this codespace. If not specified, the value is assigned by IP. This property replaces `location`, which is closing down.",
          enum: ["EuropeWest", "SoutheastAsia", "UsEast", "UsWest"],
        },
        client_ip: {
          type: "string",
          description: "IP for location auto-detection when proxying a request",
        },
        machine: {
          type: "string",
          description: "Machine type to use for this codespace",
        },
        devcontainer_path: {
          type: "string",
          description: "Path to devcontainer.json config to use for this codespace",
        },
        multi_repo_permissions_opt_out: {
          type: "boolean",
          description: "Whether to authorize requested permissions from devcontainer.json",
        },
        working_directory: {
          type: "string",
          description: "Working directory for this codespace",
        },
        idle_timeout_minutes: {
          type: "integer",
          description: "Time in minutes before codespace stops from inactivity",
        },
        display_name: {
          type: "string",
          description: "Display name for this codespace",
        },
        retention_period_minutes: {
          type: "integer",
          description: "Duration in minutes after codespace has gone idle in which it will be deleted. Must be integer minutes between 0 and 43200 (30 days).",
        },
      },
      required: [],
    },
  },
  {
    name: "codespaceslistForAuthenticatedUser",
    description: "List codespaces for the authenticated user",
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
    name: "codespacescreateForAuthenticatedUser",
    description: "Create a codespace for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "codespaceslistSecretsForAuthenticatedUser",
    description: "List secrets for the authenticated user",
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
    name: "codespacesgetPublicKeyForAuthenticatedUser",
    description: "Get public key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "codespacesgetSecretForAuthenticatedUser",
    description: "Get a secret for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["secret_name"],
    },
  },
  {
    name: "codespacescreateOrUpdateSecretForAuthenticatedUser",
    description: "Create or update a secret for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "Value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get the public key for the authenticated user](https://docs.github.com/rest/codespaces/secrets#get-public-key-for-the-authenticated-user) endpoint.",
        },
        key_id: {
          type: "string",
          description: "ID of the key you used to encrypt the secret.",
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the user secret. You can manage the list of selected repositories using the [List selected repositories for a user secret](https://docs.github.com/rest/codespaces/secrets#list-selected-repositories-for-a-user-secret), [Set selected repositories for a user secret](https://docs.github.com/rest/codespaces/secrets#set-selected-repositories-for-a-user-secret), and [Remove a selected repository from a user secret](https://docs.github.com/rest/codespaces/secrets#remove-a-selected-repository-from-a-user-secret) endpoints.",
        },
      },
      required: ["key_id"],
    },
  },
  {
    name: "codespacesdeleteSecretForAuthenticatedUser",
    description: "Delete a secret for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["secret_name"],
    },
  },
  {
    name: "codespaceslistRepositoriesForSecretForAuthenticate",
    description: "List selected repositories for a user secret",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["secret_name"],
    },
  },
  {
    name: "codespacessetRepositoriesForSecretForAuthenticated",
    description: "Set selected repositories for a user secret",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids for which a codespace can access the secret. You can manage the list of selected repositories using the [List selected repositories for a user secret](https://docs.github.com/rest/codespaces/secrets#list-selected-repositories-for-a-user-secret), [Add a selected repository to a user secret](https://docs.github.com/rest/codespaces/secrets#add-a-selected-repository-to-a-user-secret), and [Remove a selected repository from a user secret](https://docs.github.com/rest/codespaces/secrets#remove-a-selected-repository-from-a-user-secret) endpoints.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "codespacesaddRepositoryForSecretForAuthenticatedUs",
    description: "Add a selected repository to a user secret",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repository_id: {
          type: "integer",
          description: "",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["repository_id", "secret_name"],
    },
  },
  {
    name: "codespacesremoveRepositoryForSecretForAuthenticate",
    description: "Remove a selected repository from a user secret",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repository_id: {
          type: "integer",
          description: "",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["repository_id", "secret_name"],
    },
  },
  {
    name: "codespacesgetForAuthenticatedUser",
    description: "Get a codespace for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["codespace_name"],
    },
  },
  {
    name: "codespacesupdateForAuthenticatedUser",
    description: "Update a codespace for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        machine: {
          type: "string",
          description: "A valid machine to transition this codespace to.",
        },
        display_name: {
          type: "string",
          description: "Display name for this codespace",
        },
        recent_folders: {
          type: "array",
          description: "Recently opened folders inside the codespace. It is currently used by the clients to determine the folder path to load the codespace in.",
        },
      },
      required: [],
    },
  },
  {
    name: "codespacesdeleteForAuthenticatedUser",
    description: "Delete a codespace for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["codespace_name"],
    },
  },
  {
    name: "codespacesexportForAuthenticatedUser",
    description: "Export a codespace for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["codespace_name"],
    },
  },
  {
    name: "codespacesgetExportDetailsForAuthenticatedUser",
    description: "Get details about a codespace export",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
        export_id: {
          type: "string",
          description: "Path parameter: export_id",
        },
      },
      required: ["codespace_name", "export_id"],
    },
  },
  {
    name: "codespacescodespaceMachinesForAuthenticatedUser",
    description: "List machine types for a codespace",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["codespace_name"],
    },
  },
  {
    name: "codespacespublishForAuthenticatedUser",
    description: "Create a repository from an unpublished codespace",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "A name for the new repository.",
        },
        private: {
          type: "boolean",
          description: "Whether the new repository should be private.",
        },
      },
      required: [],
    },
  },
  {
    name: "codespacesstartForAuthenticatedUser",
    description: "Start a codespace for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["codespace_name"],
    },
  },
  {
    name: "codespacesstopForAuthenticatedUser",
    description: "Stop a codespace for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        codespace_name: {
          type: "string",
          description: "Path parameter: codespace_name",
        },
      },
      required: ["codespace_name"],
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
  const client = new GitHubv3RESTAPIcodespacesClient(accessToken);

  try {
    switch (name) {
      case "codespaceslistInOrganization": {
        const result = await client.codespaceslistInOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacessetCodespacesAccess": {
        const result = await client.codespacessetCodespacesAccess(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacessetCodespacesAccessUsers": {
        const result = await client.codespacessetCodespacesAccessUsers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesdeleteCodespacesAccessUsers": {
        const result = await client.codespacesdeleteCodespacesAccessUsers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistOrgSecrets": {
        const result = await client.codespaceslistOrgSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetOrgPublicKey": {
        const result = await client.codespacesgetOrgPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetOrgSecret": {
        const result = await client.codespacesgetOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescreateOrUpdateOrgSecret": {
        const result = await client.codespacescreateOrUpdateOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesdeleteOrgSecret": {
        const result = await client.codespacesdeleteOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistSelectedReposForOrgSecret": {
        const result = await client.codespaceslistSelectedReposForOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacessetSelectedReposForOrgSecret": {
        const result = await client.codespacessetSelectedReposForOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesaddSelectedRepoToOrgSecret": {
        const result = await client.codespacesaddSelectedRepoToOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesremoveSelectedRepoFromOrgSecret": {
        const result = await client.codespacesremoveSelectedRepoFromOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetCodespacesForUserInOrg": {
        const result = await client.codespacesgetCodespacesForUserInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesdeleteFromOrganization": {
        const result = await client.codespacesdeleteFromOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesstopInOrganization": {
        const result = await client.codespacesstopInOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistInRepositoryForAuthenticatedUser": {
        const result = await client.codespaceslistInRepositoryForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescreateWithRepoForAuthenticatedUser": {
        const result = await client.codespacescreateWithRepoForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistDevcontainersInRepositoryForAuthenti": {
        const result = await client.codespaceslistDevcontainersInRepositoryForAuthenti(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesrepoMachinesForAuthenticatedUser": {
        const result = await client.codespacesrepoMachinesForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacespreFlightWithRepoForAuthenticatedUser": {
        const result = await client.codespacespreFlightWithRepoForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescheckPermissionsForDevcontainer": {
        const result = await client.codespacescheckPermissionsForDevcontainer(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistRepoSecrets": {
        const result = await client.codespaceslistRepoSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetRepoPublicKey": {
        const result = await client.codespacesgetRepoPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetRepoSecret": {
        const result = await client.codespacesgetRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescreateOrUpdateRepoSecret": {
        const result = await client.codespacescreateOrUpdateRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesdeleteRepoSecret": {
        const result = await client.codespacesdeleteRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescreateWithPrForAuthenticatedUser": {
        const result = await client.codespacescreateWithPrForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistForAuthenticatedUser": {
        const result = await client.codespaceslistForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescreateForAuthenticatedUser": {
        const result = await client.codespacescreateForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistSecretsForAuthenticatedUser": {
        const result = await client.codespaceslistSecretsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetPublicKeyForAuthenticatedUser": {
        const result = await client.codespacesgetPublicKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetSecretForAuthenticatedUser": {
        const result = await client.codespacesgetSecretForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescreateOrUpdateSecretForAuthenticatedUser": {
        const result = await client.codespacescreateOrUpdateSecretForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesdeleteSecretForAuthenticatedUser": {
        const result = await client.codespacesdeleteSecretForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespaceslistRepositoriesForSecretForAuthenticate": {
        const result = await client.codespaceslistRepositoriesForSecretForAuthenticate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacessetRepositoriesForSecretForAuthenticated": {
        const result = await client.codespacessetRepositoriesForSecretForAuthenticated(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesaddRepositoryForSecretForAuthenticatedUs": {
        const result = await client.codespacesaddRepositoryForSecretForAuthenticatedUs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesremoveRepositoryForSecretForAuthenticate": {
        const result = await client.codespacesremoveRepositoryForSecretForAuthenticate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetForAuthenticatedUser": {
        const result = await client.codespacesgetForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesupdateForAuthenticatedUser": {
        const result = await client.codespacesupdateForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesdeleteForAuthenticatedUser": {
        const result = await client.codespacesdeleteForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesexportForAuthenticatedUser": {
        const result = await client.codespacesexportForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesgetExportDetailsForAuthenticatedUser": {
        const result = await client.codespacesgetExportDetailsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacescodespaceMachinesForAuthenticatedUser": {
        const result = await client.codespacescodespaceMachinesForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacespublishForAuthenticatedUser": {
        const result = await client.codespacespublishForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesstartForAuthenticatedUser": {
        const result = await client.codespacesstartForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "codespacesstopForAuthenticatedUser": {
        const result = await client.codespacesstopForAuthenticatedUser(args as any);
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
  console.error("GitHub v3 REST API - codespaces MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
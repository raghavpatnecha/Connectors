/**
 * MCP Server: GitHub v3 REST API - actions
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
class GitHubv3RESTAPIactionsClient {
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
   * Get GitHub Actions cache usage for an organization
   */
  async actionsgetActionsCacheUsageForOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/cache/usage";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories with GitHub Actions cache usage for an organization
   */
  async actionsgetActionsCacheUsageByRepoForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  repository_cache_usages: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/cache/usage-by-repository";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List GitHub-hosted runners for an organization
   */
  async actionslistHostedRunnersForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  runners: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a GitHub-hosted runner for an organization
   */
  async actionscreateHostedRunnerForOrg(params: {
    name: string;
    image: {
  id?: string;
  source?: "github" | "partner" | "custom";
  version?: string;
};
    size: string;
    runner_group_id: number;
    maximum_runners?: number;
    enable_static_ip?: boolean;
    image_gen?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List custom images for an organization
   */
  async actionslistCustomImagesForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  images: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/custom";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a custom image definition for GitHub Actions Hosted Runners
   */
  async actionsgetCustomImageForOrg(params: {
    None?: string;
    org: string;
    image_definition_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ image_definition_id }}}", String(params.image_definition_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a custom image from the organization
   */
  async actionsdeleteCustomImageFromOrg(params: {
    None?: string;
    org: string;
    image_definition_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ image_definition_id }}}", String(params.image_definition_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List image versions of a custom image for an organization
   */
  async actionslistCustomImageVersionsForOrg(params: {
    None?: string;
    org: string;
    image_definition_id: string;
  }): Promise<{
  total_count: number;
  image_versions: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ image_definition_id }}}", String(params.image_definition_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an image version of a custom image for GitHub Actions Hosted Runners
   */
  async actionsgetCustomImageVersionForOrg(params: {
    None?: string;
    org: string;
    image_definition_id: string;
    version: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ image_definition_id }}}", String(params.image_definition_id));
    path = path.replace("{{ version }}}", String(params.version));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete an image version of custom image from the organization
   */
  async actionsdeleteCustomImageVersionFromOrg(params: {
    None?: string;
    org: string;
    image_definition_id: string;
    version: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/custom/{image_definition_id}/versions/{version}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ image_definition_id }}}", String(params.image_definition_id));
    path = path.replace("{{ version }}}", String(params.version));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub-owned images for GitHub-hosted runners in an organization
   */
  async actionsgetHostedRunnersGithubOwnedImagesForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  images: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/github-owned";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get partner images for GitHub-hosted runners in an organization
   */
  async actionsgetHostedRunnersPartnerImagesForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  images: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/images/partner";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get limits on GitHub-hosted runners for an organization
   */
  async actionsgetHostedRunnersLimitsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/limits";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub-hosted runners machine specs for an organization
   */
  async actionsgetHostedRunnersMachineSpecsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  machine_specs: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/machine-sizes";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get platforms for GitHub-hosted runners in an organization
   */
  async actionsgetHostedRunnersPlatformsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  platforms: Array<string>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/platforms";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a GitHub-hosted runner for an organization
   */
  async actionsgetHostedRunnerForOrg(params: {
    None?: string;
    org: string;
    hosted_runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/{hosted_runner_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ hosted_runner_id }}}", String(params.hosted_runner_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a GitHub-hosted runner for an organization
   */
  async actionsupdateHostedRunnerForOrg(params: {
    name?: string;
    runner_group_id?: number;
    maximum_runners?: number;
    enable_static_ip?: boolean;
    image_version?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/{hosted_runner_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a GitHub-hosted runner for an organization
   */
  async actionsdeleteHostedRunnerForOrg(params: {
    None?: string;
    org: string;
    hosted_runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/hosted-runners/{hosted_runner_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ hosted_runner_id }}}", String(params.hosted_runner_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub Actions permissions for an organization
   */
  async actionsgetGithubActionsPermissionsOrganization(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set GitHub Actions permissions for an organization
   */
  async actionssetGithubActionsPermissionsOrganization(params: {
    enabled_repositories: any;
    allowed_actions?: any;
    sha_pinning_required?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get artifact and log retention settings for an organization
   */
  async actionsgetArtifactAndLogRetentionSettingsOrganizat(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/artifact-and-log-retention";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set artifact and log retention settings for an organization
   */
  async actionssetArtifactAndLogRetentionSettingsOrganizat(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/artifact-and-log-retention";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get fork PR contributor approval permissions for an organization
   */
  async actionsgetForkPrContributorApprovalPermissionsOrga(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/fork-pr-contributor-approval";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set fork PR contributor approval permissions for an organization
   */
  async actionssetForkPrContributorApprovalPermissionsOrga(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/fork-pr-contributor-approval";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get private repo fork PR workflow settings for an organization
   */
  async actionsgetPrivateRepoForkPrWorkflowsSettingsOrgani(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/fork-pr-workflows-private-repos";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set private repo fork PR workflow settings for an organization
   */
  async actionssetPrivateRepoForkPrWorkflowsSettingsOrgani(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/fork-pr-workflows-private-repos";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List selected repositories enabled for GitHub Actions in an organization
   */
  async actionslistSelectedRepositoriesEnabledGithubAction(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/repositories";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set selected repositories enabled for GitHub Actions in an organization
   */
  async actionssetSelectedRepositoriesEnabledGithubActions(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Enable a selected repository for GitHub Actions in an organization
   */
  async actionsenableSelectedRepositoryGithubActionsOrgani(params: {
    None?: string;
    org: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/repositories/{repository_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Disable a selected repository for GitHub Actions in an organization
   */
  async actionsdisableSelectedRepositoryGithubActionsOrgan(params: {
    None?: string;
    org: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/repositories/{repository_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get allowed actions and reusable workflows for an organization
   */
  async actionsgetAllowedActionsOrganization(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/selected-actions";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set allowed actions and reusable workflows for an organization
   */
  async actionssetAllowedActionsOrganization(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/selected-actions";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get self-hosted runners settings for an organization
   */
  async actionsgetSelfHostedRunnersPermissionsOrganization(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/self-hosted-runners";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set self-hosted runners settings for an organization
   */
  async actionssetSelfHostedRunnersPermissionsOrganization(params: {
    enabled_repositories: "all" | "selected" | "none";
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/self-hosted-runners";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repositories allowed to use self-hosted runners in an organization
   */
  async actionslistSelectedRepositoriesSelfHostedRunnersOr(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count?: number;
  repositories?: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/self-hosted-runners/repositories";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set repositories allowed to use self-hosted runners in an organization
   */
  async actionssetSelectedRepositoriesSelfHostedRunnersOrg(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/self-hosted-runners/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add a repository to the list of repositories allowed to use self-hosted runners in an organization
   */
  async actionsenableSelectedRepositorySelfHostedRunnersOr(params: {
    None?: string;
    org: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/self-hosted-runners/repositories/{repository_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a repository from the list of repositories allowed to use self-hosted runners in an organization
   */
  async actionsdisableSelectedRepositorySelfHostedRunnersO(params: {
    None?: string;
    org: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/self-hosted-runners/repositories/{repository_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get default workflow permissions for an organization
   */
  async actionsgetGithubActionsDefaultWorkflowPermissionsO(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/workflow";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set default workflow permissions for an organization
   */
  async actionssetGithubActionsDefaultWorkflowPermissionsO(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/permissions/workflow";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List self-hosted runner groups for an organization
   */
  async actionslistSelfHostedRunnerGroupsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  runner_groups: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a self-hosted runner group for an organization
   */
  async actionscreateSelfHostedRunnerGroupForOrg(params: {
    name: string;
    visibility?: "selected" | "all" | "private";
    selected_repository_ids?: Array<number>;
    runners?: Array<number>;
    allows_public_repositories?: boolean;
    restricted_to_workflows?: boolean;
    selected_workflows?: Array<string>;
    network_configuration_id?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a self-hosted runner group for an organization
   */
  async actionsgetSelfHostedRunnerGroupForOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a self-hosted runner group for an organization
   */
  async actionsupdateSelfHostedRunnerGroupForOrg(params: {
    name: string;
    visibility?: "selected" | "all" | "private";
    allows_public_repositories?: boolean;
    restricted_to_workflows?: boolean;
    selected_workflows?: Array<string>;
    network_configuration_id?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a self-hosted runner group from an organization
   */
  async actionsdeleteSelfHostedRunnerGroupFromOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List GitHub-hosted runners in a group for an organization
   */
  async actionslistGithubHostedRunnersInGroupForOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
  }): Promise<{
  total_count: number;
  runners: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/hosted-runners";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repository access to a self-hosted runner group in an organization
   */
  async actionslistRepoAccessToSelfHostedRunnerGroupInOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/repositories";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set repository access for a self-hosted runner group in an organization
   */
  async actionssetRepoAccessToSelfHostedRunnerGroupInOrg(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add repository access to a self-hosted runner group in an organization
   */
  async actionsaddRepoAccessToSelfHostedRunnerGroupInOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove repository access to a self-hosted runner group in an organization
   */
  async actionsremoveRepoAccessToSelfHostedRunnerGroupInOr(params: {
    None?: string;
    org: string;
    runner_group_id: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));
    path = path.replace("{{ repository_id }}}", String(params.repository_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List self-hosted runners in a group for an organization
   */
  async actionslistSelfHostedRunnersInGroupForOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
  }): Promise<{
  total_count: number;
  runners: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/runners";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set self-hosted runners in a group for an organization
   */
  async actionssetSelfHostedRunnersInGroupForOrg(params: {
    runners: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/runners";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add a self-hosted runner to a group for an organization
   */
  async actionsaddSelfHostedRunnerToGroupForOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a self-hosted runner from a group for an organization
   */
  async actionsremoveSelfHostedRunnerFromGroupForOrg(params: {
    None?: string;
    org: string;
    runner_group_id: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runner-groups/{runner_group_id}/runners/{runner_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_group_id }}}", String(params.runner_group_id));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List self-hosted runners for an organization
   */
  async actionslistSelfHostedRunnersForOrg(params: {
    name?: string;
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  runners: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List runner applications for an organization
   */
  async actionslistRunnerApplicationsForOrg(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/downloads";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create configuration for a just-in-time runner for an organization
   */
  async actionsgenerateRunnerJitconfigForOrg(params: {
    name: string;
    runner_group_id: number;
    labels: Array<string>;
    work_folder?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/generate-jitconfig";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Create a registration token for an organization
   */
  async actionscreateRegistrationTokenForOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/registration-token";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Create a remove token for an organization
   */
  async actionscreateRemoveTokenForOrg(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/remove-token";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a self-hosted runner for an organization
   */
  async actionsgetSelfHostedRunnerForOrg(params: {
    None?: string;
    org: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/{runner_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a self-hosted runner from an organization
   */
  async actionsdeleteSelfHostedRunnerFromOrg(params: {
    None?: string;
    org: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/{runner_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List labels for a self-hosted runner for an organization
   */
  async actionslistLabelsForSelfHostedRunnerForOrg(params: {
    None?: string;
    org: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/{runner_id}/labels";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add custom labels to a self-hosted runner for an organization
   */
  async actionsaddCustomLabelsToSelfHostedRunnerForOrg(params: {
    labels: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/{runner_id}/labels";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set custom labels for a self-hosted runner for an organization
   */
  async actionssetCustomLabelsForSelfHostedRunnerForOrg(params: {
    labels: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/{runner_id}/labels";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove all custom labels from a self-hosted runner for an organization
   */
  async actionsremoveAllCustomLabelsFromSelfHostedRunnerFo(params: {
    None?: string;
    org: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/{runner_id}/labels";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Remove a custom label from a self-hosted runner for an organization
   */
  async actionsremoveCustomLabelFromSelfHostedRunnerForOrg(params: {
    None?: string;
    org: string;
    runner_id: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/runners/{runner_id}/labels/{name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));
    path = path.replace("{{ name }}}", String(params.name));

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
  async actionslistOrgSecrets(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets";
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
  async actionsgetOrgPublicKey(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/public-key";
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
  async actionsgetOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/{secret_name}";
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
  async actionscreateOrUpdateOrgSecret(params: {
    encrypted_value: string;
    key_id: string;
    visibility: "all" | "private" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/{secret_name}";

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
  async actionsdeleteOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/{secret_name}";
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
  async actionslistSelectedReposForOrgSecret(params: {
    None?: string;
    org: string;
    secret_name: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/{secret_name}/repositories";
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
  async actionssetSelectedReposForOrgSecret(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/{secret_name}/repositories";

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
  async actionsaddSelectedRepoToOrgSecret(params: {
    None?: string;
    repository_id: number;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}";
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
  async actionsremoveSelectedRepoFromOrgSecret(params: {
    None?: string;
    repository_id: number;
    org: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}";
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
   * List organization variables
   */
  async actionslistOrgVariables(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  variables: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an organization variable
   */
  async actionscreateOrgVariable(params: {
    name: string;
    value: string;
    visibility: "all" | "private" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an organization variable
   */
  async actionsgetOrgVariable(params: {
    None?: string;
    org: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables/{name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an organization variable
   */
  async actionsupdateOrgVariable(params: {
    name?: string;
    value?: string;
    visibility?: "all" | "private" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables/{name}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an organization variable
   */
  async actionsdeleteOrgVariable(params: {
    None?: string;
    org: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables/{name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List selected repositories for an organization variable
   */
  async actionslistSelectedReposForOrgVariable(params: {
    None?: string;
    org: string;
    name: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables/{name}/repositories";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set selected repositories for an organization variable
   */
  async actionssetSelectedReposForOrgVariable(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables/{name}/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add selected repository to an organization variable
   */
  async actionsaddSelectedRepoToOrgVariable(params: {
    None?: string;
    repository_id: number;
    org: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables/{name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove selected repository from an organization variable
   */
  async actionsremoveSelectedRepoFromOrgVariable(params: {
    None?: string;
    repository_id: number;
    org: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/actions/variables/{name}/repositories/{repository_id}";
    path = path.replace("{{ repository_id }}}", String(params.repository_id));
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List artifacts for a repository
   */
  async actionslistArtifactsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  artifacts: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/artifacts";
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
   * Get an artifact
   */
  async actionsgetArtifact(params: {
    None?: string;
    owner: string;
    repo: string;
    artifact_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/artifacts/{artifact_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ artifact_id }}}", String(params.artifact_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete an artifact
   */
  async actionsdeleteArtifact(params: {
    None?: string;
    owner: string;
    repo: string;
    artifact_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/artifacts/{artifact_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ artifact_id }}}", String(params.artifact_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Download an artifact
   */
  async actionsdownloadArtifact(params: {
    None?: string;
    archive_format: string;
    owner: string;
    repo: string;
    artifact_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}";
    path = path.replace("{{ archive_format }}}", String(params.archive_format));
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ artifact_id }}}", String(params.artifact_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get GitHub Actions cache usage for a repository
   */
  async actionsgetActionsCacheUsage(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/cache/usage";
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
   * List GitHub Actions caches for a repository
   */
  async actionsgetActionsCacheList(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/caches";
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
   * Delete GitHub Actions caches for a repository (using a cache key)
   */
  async actionsdeleteActionsCacheByKey(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/caches";
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
   * Delete a GitHub Actions cache for a repository (using a cache ID)
   */
  async actionsdeleteActionsCacheById(params: {
    None?: string;
    owner: string;
    repo: string;
    cache_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/caches/{cache_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ cache_id }}}", String(params.cache_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a job for a workflow run
   */
  async actionsgetJobForWorkflowRun(params: {
    None?: string;
    owner: string;
    repo: string;
    job_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/jobs/{job_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ job_id }}}", String(params.job_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Download job logs for a workflow run
   */
  async actionsdownloadJobLogsForWorkflowRun(params: {
    None?: string;
    owner: string;
    repo: string;
    job_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/jobs/{job_id}/logs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ job_id }}}", String(params.job_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Re-run a job from a workflow run
   */
  async actionsreRunJobForWorkflowRun(params: {
    enable_debug_logging?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/jobs/{job_id}/rerun";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get the customization template for an OIDC subject claim for a repository
   */
  async actionsgetCustomOidcSubClaimForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/oidc/customization/sub";
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
   * Set the customization template for an OIDC subject claim for a repository
   */
  async actionssetCustomOidcSubClaimForRepo(params: {
    use_default: boolean;
    include_claim_keys?: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/oidc/customization/sub";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repository organization secrets
   */
  async actionslistRepoOrganizationSecrets(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/organization-secrets";
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
   * List repository organization variables
   */
  async actionslistRepoOrganizationVariables(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  variables: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/organization-variables";
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
   * Get GitHub Actions permissions for a repository
   */
  async actionsgetGithubActionsPermissionsRepository(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions";
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
   * Set GitHub Actions permissions for a repository
   */
  async actionssetGithubActionsPermissionsRepository(params: {
    enabled: any;
    allowed_actions?: any;
    sha_pinning_required?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get the level of access for workflows outside of the repository
   */
  async actionsgetWorkflowAccessToRepository(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/access";
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
   * Set the level of access for workflows outside of the repository
   */
  async actionssetWorkflowAccessToRepository(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/access";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get artifact and log retention settings for a repository
   */
  async actionsgetArtifactAndLogRetentionSettingsRepositor(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention";
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
   * Set artifact and log retention settings for a repository
   */
  async actionssetArtifactAndLogRetentionSettingsRepositor(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/artifact-and-log-retention";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get fork PR contributor approval permissions for a repository
   */
  async actionsgetForkPrContributorApprovalPermissionsRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval";
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
   * Set fork PR contributor approval permissions for a repository
   */
  async actionssetForkPrContributorApprovalPermissionsRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/fork-pr-contributor-approval";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get private repo fork PR workflow settings for a repository
   */
  async actionsgetPrivateRepoForkPrWorkflowsSettingsReposi(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/fork-pr-workflows-private-repos";
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
   * Set private repo fork PR workflow settings for a repository
   */
  async actionssetPrivateRepoForkPrWorkflowsSettingsReposi(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/fork-pr-workflows-private-repos";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get allowed actions and reusable workflows for a repository
   */
  async actionsgetAllowedActionsRepository(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/selected-actions";
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
   * Set allowed actions and reusable workflows for a repository
   */
  async actionssetAllowedActionsRepository(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/selected-actions";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get default workflow permissions for a repository
   */
  async actionsgetGithubActionsDefaultWorkflowPermissionsR(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/workflow";
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
   * Set default workflow permissions for a repository
   */
  async actionssetGithubActionsDefaultWorkflowPermissionsR(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/permissions/workflow";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List self-hosted runners for a repository
   */
  async actionslistSelfHostedRunnersForRepo(params: {
    name?: string;
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  runners: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners";
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
   * List runner applications for a repository
   */
  async actionslistRunnerApplicationsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/downloads";
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
   * Create configuration for a just-in-time runner for a repository
   */
  async actionsgenerateRunnerJitconfigForRepo(params: {
    name: string;
    runner_group_id: number;
    labels: Array<string>;
    work_folder?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/generate-jitconfig";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Create a registration token for a repository
   */
  async actionscreateRegistrationTokenForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/registration-token";
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
   * Create a remove token for a repository
   */
  async actionscreateRemoveTokenForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/remove-token";
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
   * Get a self-hosted runner for a repository
   */
  async actionsgetSelfHostedRunnerForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/{runner_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a self-hosted runner from a repository
   */
  async actionsdeleteSelfHostedRunnerFromRepo(params: {
    None?: string;
    owner: string;
    repo: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/{runner_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List labels for a self-hosted runner for a repository
   */
  async actionslistLabelsForSelfHostedRunnerForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/{runner_id}/labels";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add custom labels to a self-hosted runner for a repository
   */
  async actionsaddCustomLabelsToSelfHostedRunnerForRepo(params: {
    labels: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/{runner_id}/labels";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set custom labels for a self-hosted runner for a repository
   */
  async actionssetCustomLabelsForSelfHostedRunnerForRepo(params: {
    labels: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/{runner_id}/labels";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove all custom labels from a self-hosted runner for a repository
   */
  async actionsremoveAllCustomLabelsFromSelfHostedRunnerFo(params: {
    None?: string;
    owner: string;
    repo: string;
    runner_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/{runner_id}/labels";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Remove a custom label from a self-hosted runner for a repository
   */
  async actionsremoveCustomLabelFromSelfHostedRunnerForRep(params: {
    None?: string;
    owner: string;
    repo: string;
    runner_id: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ runner_id }}}", String(params.runner_id));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List workflow runs for a repository
   */
  async actionslistWorkflowRunsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  workflow_runs: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs";
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
   * Get a workflow run
   */
  async actionsgetWorkflowRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a workflow run
   */
  async actionsdeleteWorkflowRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get the review history for a workflow run
   */
  async actionsgetReviewsForRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/approvals";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Approve a workflow run for a fork pull request
   */
  async actionsapproveWorkflowRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/approve";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List workflow run artifacts
   */
  async actionslistWorkflowRunArtifacts(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<{
  total_count: number;
  artifacts: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/artifacts";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a workflow run attempt
   */
  async actionsgetWorkflowRunAttempt(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
    attempt_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));
    path = path.replace("{{ attempt_number }}}", String(params.attempt_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List jobs for a workflow run attempt
   */
  async actionslistJobsForWorkflowRunAttempt(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
    attempt_number: string;
  }): Promise<{
  total_count: number;
  jobs: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));
    path = path.replace("{{ attempt_number }}}", String(params.attempt_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Download workflow run attempt logs
   */
  async actionsdownloadWorkflowRunAttemptLogs(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
    attempt_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));
    path = path.replace("{{ attempt_number }}}", String(params.attempt_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Cancel a workflow run
   */
  async actionscancelWorkflowRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/cancel";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Review custom deployment protection rules for a workflow run
   */
  async actionsreviewCustomGatesForRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Force cancel a workflow run
   */
  async actionsforceCancelWorkflowRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List jobs for a workflow run
   */
  async actionslistJobsForWorkflowRun(params: {
    None?: string;
    filter?: "latest" | "all";
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<{
  total_count: number;
  jobs: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/jobs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Download workflow run logs
   */
  async actionsdownloadWorkflowRunLogs(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/logs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete workflow run logs
   */
  async actionsdeleteWorkflowRunLogs(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/logs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get pending deployments for a workflow run
   */
  async actionsgetPendingDeploymentsForRun(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Review pending deployments for a workflow run
   */
  async actionsreviewPendingDeploymentsForRun(params: {
    environment_ids: Array<number>;
    state: "approved" | "rejected";
    comment: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Re-run a workflow
   */
  async actionsreRunWorkflow(params: {
    enable_debug_logging?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/rerun";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Re-run failed jobs from a workflow run
   */
  async actionsreRunWorkflowFailedJobs(params: {
    enable_debug_logging?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get workflow run usage
   */
  async actionsgetWorkflowRunUsage(params: {
    None?: string;
    owner: string;
    repo: string;
    run_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/runs/{run_id}/timing";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ run_id }}}", String(params.run_id));

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
  async actionslistRepoSecrets(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/secrets";
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
  async actionsgetRepoPublicKey(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/secrets/public-key";
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
  async actionsgetRepoSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/secrets/{secret_name}";
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
  async actionscreateOrUpdateRepoSecret(params: {
    encrypted_value: string;
    key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/secrets/{secret_name}";

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
  async actionsdeleteRepoSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/secrets/{secret_name}";
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
   * List repository variables
   */
  async actionslistRepoVariables(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  variables: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/variables";
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
   * Create a repository variable
   */
  async actionscreateRepoVariable(params: {
    name: string;
    value: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/variables";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a repository variable
   */
  async actionsgetRepoVariable(params: {
    None?: string;
    owner: string;
    repo: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/variables/{name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a repository variable
   */
  async actionsupdateRepoVariable(params: {
    name?: string;
    value?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/variables/{name}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository variable
   */
  async actionsdeleteRepoVariable(params: {
    None?: string;
    owner: string;
    repo: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/variables/{name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repository workflows
   */
  async actionslistRepoWorkflows(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count: number;
  workflows: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/workflows";
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
   * Get a workflow
   */
  async actionsgetWorkflow(params: {
    None?: string;
    owner: string;
    repo: string;
    workflow_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/workflows/{workflow_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ workflow_id }}}", String(params.workflow_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Disable a workflow
   */
  async actionsdisableWorkflow(params: {
    None?: string;
    owner: string;
    repo: string;
    workflow_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ workflow_id }}}", String(params.workflow_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Create a workflow dispatch event
   */
  async actionscreateWorkflowDispatch(params: {
    ref: string;
    inputs?: Record<string, any>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Enable a workflow
   */
  async actionsenableWorkflow(params: {
    None?: string;
    owner: string;
    repo: string;
    workflow_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ workflow_id }}}", String(params.workflow_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List workflow runs for a workflow
   */
  async actionslistWorkflowRuns(params: {
    None?: string;
    owner: string;
    repo: string;
    workflow_id: string;
  }): Promise<{
  total_count: number;
  workflow_runs: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ workflow_id }}}", String(params.workflow_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get workflow usage
   */
  async actionsgetWorkflowUsage(params: {
    None?: string;
    owner: string;
    repo: string;
    workflow_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ workflow_id }}}", String(params.workflow_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List environment secrets
   */
  async actionslistEnvironmentSecrets(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<{
  total_count: number;
  secrets: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/secrets";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an environment public key
   */
  async actionsgetEnvironmentPublicKey(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an environment secret
   */
  async actionsgetEnvironmentSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update an environment secret
   */
  async actionscreateOrUpdateEnvironmentSecret(params: {
    encrypted_value: string;
    key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an environment secret
   */
  async actionsdeleteEnvironmentSecret(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    secret_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ secret_name }}}", String(params.secret_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List environment variables
   */
  async actionslistEnvironmentVariables(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<{
  total_count: number;
  variables: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/variables";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an environment variable
   */
  async actionscreateEnvironmentVariable(params: {
    name: string;
    value: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/variables";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an environment variable
   */
  async actionsgetEnvironmentVariable(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/variables/{name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an environment variable
   */
  async actionsupdateEnvironmentVariable(params: {
    name?: string;
    value?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/variables/{name}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an environment variable
   */
  async actionsdeleteEnvironmentVariable(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/variables/{name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ name }}}", String(params.name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
}

// MCP Server
const server = new Server(
  {
    name: "github-v3-rest-api---actions-21",
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
    name: "actionsgetActionsCacheUsageForOrg",
    description: "Get GitHub Actions cache usage for an organization",
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
    name: "actionsgetActionsCacheUsageByRepoForOrg",
    description: "List repositories with GitHub Actions cache usage for an organization",
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
    name: "actionslistHostedRunnersForOrg",
    description: "List GitHub-hosted runners for an organization",
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
    name: "actionscreateHostedRunnerForOrg",
    description: "Create a GitHub-hosted runner for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the runner. Must be between 1 and 64 characters and may only contain upper and lowercase letters a-z, numbers 0-9, '.', '-', and '_'.",
        },
        image: {
          type: "object",
          description: "The image of runner. To list all available images, use `GET /actions/hosted-runners/images/github-owned` or `GET /actions/hosted-runners/images/partner`.",
        },
        size: {
          type: "string",
          description: "The machine size of the runner. To list available sizes, use `GET actions/hosted-runners/machine-sizes`",
        },
        runner_group_id: {
          type: "integer",
          description: "The existing runner group to add this runner to.",
        },
        maximum_runners: {
          type: "integer",
          description: "The maximum amount of runners to scale up to. Runners will not auto-scale above this number. Use this setting to limit your cost.",
        },
        enable_static_ip: {
          type: "boolean",
          description: "Whether this runner should be created with a static public IP. Note limit on account. To list limits on account, use `GET actions/hosted-runners/limits`",
        },
        image_gen: {
          type: "boolean",
          description: "Whether this runner should be used to generate custom images.",
        },
      },
      required: ["name", "image", "size", "runner_group_id"],
    },
  },
  {
    name: "actionslistCustomImagesForOrg",
    description: "List custom images for an organization",
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
    name: "actionsgetCustomImageForOrg",
    description: "Get a custom image definition for GitHub Actions Hosted Runners",
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
        image_definition_id: {
          type: "string",
          description: "Path parameter: image_definition_id",
        },
      },
      required: ["org", "image_definition_id"],
    },
  },
  {
    name: "actionsdeleteCustomImageFromOrg",
    description: "Delete a custom image from the organization",
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
        image_definition_id: {
          type: "string",
          description: "Path parameter: image_definition_id",
        },
      },
      required: ["org", "image_definition_id"],
    },
  },
  {
    name: "actionslistCustomImageVersionsForOrg",
    description: "List image versions of a custom image for an organization",
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
        image_definition_id: {
          type: "string",
          description: "Path parameter: image_definition_id",
        },
      },
      required: ["org", "image_definition_id"],
    },
  },
  {
    name: "actionsgetCustomImageVersionForOrg",
    description: "Get an image version of a custom image for GitHub Actions Hosted Runners",
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
        image_definition_id: {
          type: "string",
          description: "Path parameter: image_definition_id",
        },
        version: {
          type: "string",
          description: "Path parameter: version",
        },
      },
      required: ["org", "image_definition_id", "version"],
    },
  },
  {
    name: "actionsdeleteCustomImageVersionFromOrg",
    description: "Delete an image version of custom image from the organization",
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
        image_definition_id: {
          type: "string",
          description: "Path parameter: image_definition_id",
        },
        version: {
          type: "string",
          description: "Path parameter: version",
        },
      },
      required: ["org", "image_definition_id", "version"],
    },
  },
  {
    name: "actionsgetHostedRunnersGithubOwnedImagesForOrg",
    description: "Get GitHub-owned images for GitHub-hosted runners in an organization",
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
    name: "actionsgetHostedRunnersPartnerImagesForOrg",
    description: "Get partner images for GitHub-hosted runners in an organization",
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
    name: "actionsgetHostedRunnersLimitsForOrg",
    description: "Get limits on GitHub-hosted runners for an organization",
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
    name: "actionsgetHostedRunnersMachineSpecsForOrg",
    description: "Get GitHub-hosted runners machine specs for an organization",
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
    name: "actionsgetHostedRunnersPlatformsForOrg",
    description: "Get platforms for GitHub-hosted runners in an organization",
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
    name: "actionsgetHostedRunnerForOrg",
    description: "Get a GitHub-hosted runner for an organization",
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
        hosted_runner_id: {
          type: "string",
          description: "Path parameter: hosted_runner_id",
        },
      },
      required: ["org", "hosted_runner_id"],
    },
  },
  {
    name: "actionsupdateHostedRunnerForOrg",
    description: "Update a GitHub-hosted runner for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the runner. Must be between 1 and 64 characters and may only contain upper and lowercase letters a-z, numbers 0-9, '.', '-', and '_'.",
        },
        runner_group_id: {
          type: "integer",
          description: "The existing runner group to add this runner to.",
        },
        maximum_runners: {
          type: "integer",
          description: "The maximum amount of runners to scale up to. Runners will not auto-scale above this number. Use this setting to limit your cost.",
        },
        enable_static_ip: {
          type: "boolean",
          description: "Whether this runner should be updated with a static public IP. Note limit on account. To list limits on account, use `GET actions/hosted-runners/limits`",
        },
        image_version: {
          type: "string",
          description: "The version of the runner image to deploy. This is relevant only for runners using custom images.",
        },
      },
      required: [],
    },
  },
  {
    name: "actionsdeleteHostedRunnerForOrg",
    description: "Delete a GitHub-hosted runner for an organization",
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
        hosted_runner_id: {
          type: "string",
          description: "Path parameter: hosted_runner_id",
        },
      },
      required: ["org", "hosted_runner_id"],
    },
  },
  {
    name: "actionsgetGithubActionsPermissionsOrganization",
    description: "Get GitHub Actions permissions for an organization",
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
    name: "actionssetGithubActionsPermissionsOrganization",
    description: "Set GitHub Actions permissions for an organization",
    inputSchema: {
      type: "object",
      properties: {
        enabled_repositories: {
          type: "",
          description: "",
        },
        allowed_actions: {
          type: "",
          description: "",
        },
        sha_pinning_required: {
          type: "",
          description: "",
        },
      },
      required: ["enabled_repositories"],
    },
  },
  {
    name: "actionsgetArtifactAndLogRetentionSettingsOrganizat",
    description: "Get artifact and log retention settings for an organization",
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
    name: "actionssetArtifactAndLogRetentionSettingsOrganizat",
    description: "Set artifact and log retention settings for an organization",
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
    name: "actionsgetForkPrContributorApprovalPermissionsOrga",
    description: "Get fork PR contributor approval permissions for an organization",
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
    name: "actionssetForkPrContributorApprovalPermissionsOrga",
    description: "Set fork PR contributor approval permissions for an organization",
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
    name: "actionsgetPrivateRepoForkPrWorkflowsSettingsOrgani",
    description: "Get private repo fork PR workflow settings for an organization",
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
    name: "actionssetPrivateRepoForkPrWorkflowsSettingsOrgani",
    description: "Set private repo fork PR workflow settings for an organization",
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
    name: "actionslistSelectedRepositoriesEnabledGithubAction",
    description: "List selected repositories enabled for GitHub Actions in an organization",
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
    name: "actionssetSelectedRepositoriesEnabledGithubActions",
    description: "Set selected repositories enabled for GitHub Actions in an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "List of repository IDs to enable for GitHub Actions.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "actionsenableSelectedRepositoryGithubActionsOrgani",
    description: "Enable a selected repository for GitHub Actions in an organization",
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
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["org", "repository_id"],
    },
  },
  {
    name: "actionsdisableSelectedRepositoryGithubActionsOrgan",
    description: "Disable a selected repository for GitHub Actions in an organization",
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
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["org", "repository_id"],
    },
  },
  {
    name: "actionsgetAllowedActionsOrganization",
    description: "Get allowed actions and reusable workflows for an organization",
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
    name: "actionssetAllowedActionsOrganization",
    description: "Set allowed actions and reusable workflows for an organization",
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
    name: "actionsgetSelfHostedRunnersPermissionsOrganization",
    description: "Get self-hosted runners settings for an organization",
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
    name: "actionssetSelfHostedRunnersPermissionsOrganization",
    description: "Set self-hosted runners settings for an organization",
    inputSchema: {
      type: "object",
      properties: {
        enabled_repositories: {
          type: "string",
          description: "The policy that controls whether self-hosted runners can be used in the organization",
          enum: ["all", "selected", "none"],
        },
      },
      required: ["enabled_repositories"],
    },
  },
  {
    name: "actionslistSelectedRepositoriesSelfHostedRunnersOr",
    description: "List repositories allowed to use self-hosted runners in an organization",
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
    name: "actionssetSelectedRepositoriesSelfHostedRunnersOrg",
    description: "Set repositories allowed to use self-hosted runners in an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "IDs of repositories that can use repository-level self-hosted runners",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "actionsenableSelectedRepositorySelfHostedRunnersOr",
    description: "Add a repository to the list of repositories allowed to use self-hosted runners in an organization",
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
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["org", "repository_id"],
    },
  },
  {
    name: "actionsdisableSelectedRepositorySelfHostedRunnersO",
    description: "Remove a repository from the list of repositories allowed to use self-hosted runners in an organization",
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
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["org", "repository_id"],
    },
  },
  {
    name: "actionsgetGithubActionsDefaultWorkflowPermissionsO",
    description: "Get default workflow permissions for an organization",
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
    name: "actionssetGithubActionsDefaultWorkflowPermissionsO",
    description: "Set default workflow permissions for an organization",
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
    name: "actionslistSelfHostedRunnerGroupsForOrg",
    description: "List self-hosted runner groups for an organization",
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
    name: "actionscreateSelfHostedRunnerGroupForOrg",
    description: "Create a self-hosted runner group for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the runner group.",
        },
        visibility: {
          type: "string",
          description: "Visibility of a runner group. You can select all repositories, select individual repositories, or limit access to private repositories.",
          enum: ["selected", "all", "private"],
        },
        selected_repository_ids: {
          type: "array",
          description: "List of repository IDs that can access the runner group.",
        },
        runners: {
          type: "array",
          description: "List of runner IDs to add to the runner group.",
        },
        allows_public_repositories: {
          type: "boolean",
          description: "Whether the runner group can be used by `public` repositories.",
        },
        restricted_to_workflows: {
          type: "boolean",
          description: "If `true`, the runner group will be restricted to running only the workflows specified in the `selected_workflows` array.",
        },
        selected_workflows: {
          type: "array",
          description: "List of workflows the runner group should be allowed to run. This setting will be ignored unless `restricted_to_workflows` is set to `true`.",
        },
        network_configuration_id: {
          type: "string",
          description: "The identifier of a hosted compute network configuration.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "actionsgetSelfHostedRunnerGroupForOrg",
    description: "Get a self-hosted runner group for an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
      },
      required: ["org", "runner_group_id"],
    },
  },
  {
    name: "actionsupdateSelfHostedRunnerGroupForOrg",
    description: "Update a self-hosted runner group for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the runner group.",
        },
        visibility: {
          type: "string",
          description: "Visibility of a runner group. You can select all repositories, select individual repositories, or all private repositories.",
          enum: ["selected", "all", "private"],
        },
        allows_public_repositories: {
          type: "boolean",
          description: "Whether the runner group can be used by `public` repositories.",
        },
        restricted_to_workflows: {
          type: "boolean",
          description: "If `true`, the runner group will be restricted to running only the workflows specified in the `selected_workflows` array.",
        },
        selected_workflows: {
          type: "array",
          description: "List of workflows the runner group should be allowed to run. This setting will be ignored unless `restricted_to_workflows` is set to `true`.",
        },
        network_configuration_id: {
          type: "string",
          description: "The identifier of a hosted compute network configuration.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "actionsdeleteSelfHostedRunnerGroupFromOrg",
    description: "Delete a self-hosted runner group from an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
      },
      required: ["org", "runner_group_id"],
    },
  },
  {
    name: "actionslistGithubHostedRunnersInGroupForOrg",
    description: "List GitHub-hosted runners in a group for an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
      },
      required: ["org", "runner_group_id"],
    },
  },
  {
    name: "actionslistRepoAccessToSelfHostedRunnerGroupInOrg",
    description: "List repository access to a self-hosted runner group in an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
      },
      required: ["org", "runner_group_id"],
    },
  },
  {
    name: "actionssetRepoAccessToSelfHostedRunnerGroupInOrg",
    description: "Set repository access for a self-hosted runner group in an organization",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "List of repository IDs that can access the runner group.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "actionsaddRepoAccessToSelfHostedRunnerGroupInOrg",
    description: "Add repository access to a self-hosted runner group in an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["org", "runner_group_id", "repository_id"],
    },
  },
  {
    name: "actionsremoveRepoAccessToSelfHostedRunnerGroupInOr",
    description: "Remove repository access to a self-hosted runner group in an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
        repository_id: {
          type: "string",
          description: "Path parameter: repository_id",
        },
      },
      required: ["org", "runner_group_id", "repository_id"],
    },
  },
  {
    name: "actionslistSelfHostedRunnersInGroupForOrg",
    description: "List self-hosted runners in a group for an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
      },
      required: ["org", "runner_group_id"],
    },
  },
  {
    name: "actionssetSelfHostedRunnersInGroupForOrg",
    description: "Set self-hosted runners in a group for an organization",
    inputSchema: {
      type: "object",
      properties: {
        runners: {
          type: "array",
          description: "List of runner IDs to add to the runner group.",
        },
      },
      required: ["runners"],
    },
  },
  {
    name: "actionsaddSelfHostedRunnerToGroupForOrg",
    description: "Add a self-hosted runner to a group for an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["org", "runner_group_id", "runner_id"],
    },
  },
  {
    name: "actionsremoveSelfHostedRunnerFromGroupForOrg",
    description: "Remove a self-hosted runner from a group for an organization",
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
        runner_group_id: {
          type: "string",
          description: "Path parameter: runner_group_id",
        },
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["org", "runner_group_id", "runner_id"],
    },
  },
  {
    name: "actionslistSelfHostedRunnersForOrg",
    description: "List self-hosted runners for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of a self-hosted runner.",
        },
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
    name: "actionslistRunnerApplicationsForOrg",
    description: "List runner applications for an organization",
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
    name: "actionsgenerateRunnerJitconfigForOrg",
    description: "Create configuration for a just-in-time runner for an organization",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the new runner.",
        },
        runner_group_id: {
          type: "integer",
          description: "The ID of the runner group to register the runner to.",
        },
        labels: {
          type: "array",
          description: "The names of the custom labels to add to the runner. **Minimum items**: 1. **Maximum items**: 100.",
        },
        work_folder: {
          type: "string",
          description: "The working directory to be used for job execution, relative to the runner install directory.",
        },
      },
      required: ["name", "runner_group_id", "labels"],
    },
  },
  {
    name: "actionscreateRegistrationTokenForOrg",
    description: "Create a registration token for an organization",
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
    name: "actionscreateRemoveTokenForOrg",
    description: "Create a remove token for an organization",
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
    name: "actionsgetSelfHostedRunnerForOrg",
    description: "Get a self-hosted runner for an organization",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["org", "runner_id"],
    },
  },
  {
    name: "actionsdeleteSelfHostedRunnerFromOrg",
    description: "Delete a self-hosted runner from an organization",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["org", "runner_id"],
    },
  },
  {
    name: "actionslistLabelsForSelfHostedRunnerForOrg",
    description: "List labels for a self-hosted runner for an organization",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["org", "runner_id"],
    },
  },
  {
    name: "actionsaddCustomLabelsToSelfHostedRunnerForOrg",
    description: "Add custom labels to a self-hosted runner for an organization",
    inputSchema: {
      type: "object",
      properties: {
        labels: {
          type: "array",
          description: "The names of the custom labels to add to the runner.",
        },
      },
      required: ["labels"],
    },
  },
  {
    name: "actionssetCustomLabelsForSelfHostedRunnerForOrg",
    description: "Set custom labels for a self-hosted runner for an organization",
    inputSchema: {
      type: "object",
      properties: {
        labels: {
          type: "array",
          description: "The names of the custom labels to set for the runner. You can pass an empty array to remove all custom labels.",
        },
      },
      required: ["labels"],
    },
  },
  {
    name: "actionsremoveAllCustomLabelsFromSelfHostedRunnerFo",
    description: "Remove all custom labels from a self-hosted runner for an organization",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["org", "runner_id"],
    },
  },
  {
    name: "actionsremoveCustomLabelFromSelfHostedRunnerForOrg",
    description: "Remove a custom label from a self-hosted runner for an organization",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["org", "runner_id", "name"],
    },
  },
  {
    name: "actionslistOrgSecrets",
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
    name: "actionsgetOrgPublicKey",
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
    name: "actionsgetOrgSecret",
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
    name: "actionscreateOrUpdateOrgSecret",
    description: "Create or update an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "Value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get an organization public key](https://docs.github.com/rest/actions/secrets#get-an-organization-public-key) endpoint.",
        },
        key_id: {
          type: "string",
          description: "ID of the key you used to encrypt the secret.",
        },
        visibility: {
          type: "string",
          description: "Which type of organization repositories have access to the organization secret. `selected` means only the repositories specified by `selected_repository_ids` can access the secret.",
          enum: ["all", "private", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the organization secret. You can only provide a list of repository ids when the `visibility` is set to `selected`. You can manage the list of selected repositories using the [List selected repositories for an organization secret](https://docs.github.com/rest/actions/secrets#list-selected-repositories-for-an-organization-secret), [Set selected repositories for an organization secret](https://docs.github.com/rest/actions/secrets#set-selected-repositories-for-an-organization-secret), and [Remove selected repository from an organization secret](https://docs.github.com/rest/actions/secrets#remove-selected-repository-from-an-organization-secret) endpoints.",
        },
      },
      required: ["encrypted_value", "key_id", "visibility"],
    },
  },
  {
    name: "actionsdeleteOrgSecret",
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
    name: "actionslistSelectedReposForOrgSecret",
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
    name: "actionssetSelectedReposForOrgSecret",
    description: "Set selected repositories for an organization secret",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the organization secret. You can only provide a list of repository ids when the `visibility` is set to `selected`. You can add and remove individual repositories using the [Add selected repository to an organization secret](https://docs.github.com/rest/actions/secrets#add-selected-repository-to-an-organization-secret) and [Remove selected repository from an organization secret](https://docs.github.com/rest/actions/secrets#remove-selected-repository-from-an-organization-secret) endpoints.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "actionsaddSelectedRepoToOrgSecret",
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
    name: "actionsremoveSelectedRepoFromOrgSecret",
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
    name: "actionslistOrgVariables",
    description: "List organization variables",
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
    name: "actionscreateOrgVariable",
    description: "Create an organization variable",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the variable.",
        },
        value: {
          type: "string",
          description: "The value of the variable.",
        },
        visibility: {
          type: "string",
          description: "The type of repositories in the organization that can access the variable. `selected` means only the repositories specified by `selected_repository_ids` can access the variable.",
          enum: ["all", "private", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the organization variable. You can only provide a list of repository ids when the `visibility` is set to `selected`.",
        },
      },
      required: ["name", "value", "visibility"],
    },
  },
  {
    name: "actionsgetOrgVariable",
    description: "Get an organization variable",
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
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["org", "name"],
    },
  },
  {
    name: "actionsupdateOrgVariable",
    description: "Update an organization variable",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the variable.",
        },
        value: {
          type: "string",
          description: "The value of the variable.",
        },
        visibility: {
          type: "string",
          description: "The type of repositories in the organization that can access the variable. `selected` means only the repositories specified by `selected_repository_ids` can access the variable.",
          enum: ["all", "private", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids that can access the organization variable. You can only provide a list of repository ids when the `visibility` is set to `selected`.",
        },
      },
      required: [],
    },
  },
  {
    name: "actionsdeleteOrgVariable",
    description: "Delete an organization variable",
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
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["org", "name"],
    },
  },
  {
    name: "actionslistSelectedReposForOrgVariable",
    description: "List selected repositories for an organization variable",
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
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["org", "name"],
    },
  },
  {
    name: "actionssetSelectedReposForOrgVariable",
    description: "Set selected repositories for an organization variable",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "The IDs of the repositories that can access the organization variable.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "actionsaddSelectedRepoToOrgVariable",
    description: "Add selected repository to an organization variable",
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
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["repository_id", "org", "name"],
    },
  },
  {
    name: "actionsremoveSelectedRepoFromOrgVariable",
    description: "Remove selected repository from an organization variable",
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
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["repository_id", "org", "name"],
    },
  },
  {
    name: "actionslistArtifactsForRepo",
    description: "List artifacts for a repository",
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
    name: "actionsgetArtifact",
    description: "Get an artifact",
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
        artifact_id: {
          type: "string",
          description: "Path parameter: artifact_id",
        },
      },
      required: ["owner", "repo", "artifact_id"],
    },
  },
  {
    name: "actionsdeleteArtifact",
    description: "Delete an artifact",
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
        artifact_id: {
          type: "string",
          description: "Path parameter: artifact_id",
        },
      },
      required: ["owner", "repo", "artifact_id"],
    },
  },
  {
    name: "actionsdownloadArtifact",
    description: "Download an artifact",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        archive_format: {
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
        artifact_id: {
          type: "string",
          description: "Path parameter: artifact_id",
        },
      },
      required: ["archive_format", "owner", "repo", "artifact_id"],
    },
  },
  {
    name: "actionsgetActionsCacheUsage",
    description: "Get GitHub Actions cache usage for a repository",
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
    name: "actionsgetActionsCacheList",
    description: "List GitHub Actions caches for a repository",
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
    name: "actionsdeleteActionsCacheByKey",
    description: "Delete GitHub Actions caches for a repository (using a cache key)",
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
    name: "actionsdeleteActionsCacheById",
    description: "Delete a GitHub Actions cache for a repository (using a cache ID)",
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
        cache_id: {
          type: "string",
          description: "Path parameter: cache_id",
        },
      },
      required: ["owner", "repo", "cache_id"],
    },
  },
  {
    name: "actionsgetJobForWorkflowRun",
    description: "Get a job for a workflow run",
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
        job_id: {
          type: "string",
          description: "Path parameter: job_id",
        },
      },
      required: ["owner", "repo", "job_id"],
    },
  },
  {
    name: "actionsdownloadJobLogsForWorkflowRun",
    description: "Download job logs for a workflow run",
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
        job_id: {
          type: "string",
          description: "Path parameter: job_id",
        },
      },
      required: ["owner", "repo", "job_id"],
    },
  },
  {
    name: "actionsreRunJobForWorkflowRun",
    description: "Re-run a job from a workflow run",
    inputSchema: {
      type: "object",
      properties: {
        enable_debug_logging: {
          type: "boolean",
          description: "Whether to enable debug logging for the re-run.",
        },
      },
      required: [],
    },
  },
  {
    name: "actionsgetCustomOidcSubClaimForRepo",
    description: "Get the customization template for an OIDC subject claim for a repository",
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
    name: "actionssetCustomOidcSubClaimForRepo",
    description: "Set the customization template for an OIDC subject claim for a repository",
    inputSchema: {
      type: "object",
      properties: {
        use_default: {
          type: "boolean",
          description: "Whether to use the default template or not. If `true`, the `include_claim_keys` field is ignored.",
        },
        include_claim_keys: {
          type: "array",
          description: "Array of unique strings. Each claim key can only contain alphanumeric characters and underscores.",
        },
      },
      required: ["use_default"],
    },
  },
  {
    name: "actionslistRepoOrganizationSecrets",
    description: "List repository organization secrets",
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
    name: "actionslistRepoOrganizationVariables",
    description: "List repository organization variables",
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
    name: "actionsgetGithubActionsPermissionsRepository",
    description: "Get GitHub Actions permissions for a repository",
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
    name: "actionssetGithubActionsPermissionsRepository",
    description: "Set GitHub Actions permissions for a repository",
    inputSchema: {
      type: "object",
      properties: {
        enabled: {
          type: "",
          description: "",
        },
        allowed_actions: {
          type: "",
          description: "",
        },
        sha_pinning_required: {
          type: "",
          description: "",
        },
      },
      required: ["enabled"],
    },
  },
  {
    name: "actionsgetWorkflowAccessToRepository",
    description: "Get the level of access for workflows outside of the repository",
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
    name: "actionssetWorkflowAccessToRepository",
    description: "Set the level of access for workflows outside of the repository",
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
    name: "actionsgetArtifactAndLogRetentionSettingsRepositor",
    description: "Get artifact and log retention settings for a repository",
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
    name: "actionssetArtifactAndLogRetentionSettingsRepositor",
    description: "Set artifact and log retention settings for a repository",
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
    name: "actionsgetForkPrContributorApprovalPermissionsRepo",
    description: "Get fork PR contributor approval permissions for a repository",
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
    name: "actionssetForkPrContributorApprovalPermissionsRepo",
    description: "Set fork PR contributor approval permissions for a repository",
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
    name: "actionsgetPrivateRepoForkPrWorkflowsSettingsReposi",
    description: "Get private repo fork PR workflow settings for a repository",
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
    name: "actionssetPrivateRepoForkPrWorkflowsSettingsReposi",
    description: "Set private repo fork PR workflow settings for a repository",
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
    name: "actionsgetAllowedActionsRepository",
    description: "Get allowed actions and reusable workflows for a repository",
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
    name: "actionssetAllowedActionsRepository",
    description: "Set allowed actions and reusable workflows for a repository",
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
    name: "actionsgetGithubActionsDefaultWorkflowPermissionsR",
    description: "Get default workflow permissions for a repository",
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
    name: "actionssetGithubActionsDefaultWorkflowPermissionsR",
    description: "Set default workflow permissions for a repository",
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
    name: "actionslistSelfHostedRunnersForRepo",
    description: "List self-hosted runners for a repository",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of a self-hosted runner.",
        },
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
    name: "actionslistRunnerApplicationsForRepo",
    description: "List runner applications for a repository",
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
    name: "actionsgenerateRunnerJitconfigForRepo",
    description: "Create configuration for a just-in-time runner for a repository",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the new runner.",
        },
        runner_group_id: {
          type: "integer",
          description: "The ID of the runner group to register the runner to.",
        },
        labels: {
          type: "array",
          description: "The names of the custom labels to add to the runner. **Minimum items**: 1. **Maximum items**: 100.",
        },
        work_folder: {
          type: "string",
          description: "The working directory to be used for job execution, relative to the runner install directory.",
        },
      },
      required: ["name", "runner_group_id", "labels"],
    },
  },
  {
    name: "actionscreateRegistrationTokenForRepo",
    description: "Create a registration token for a repository",
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
    name: "actionscreateRemoveTokenForRepo",
    description: "Create a remove token for a repository",
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
    name: "actionsgetSelfHostedRunnerForRepo",
    description: "Get a self-hosted runner for a repository",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["owner", "repo", "runner_id"],
    },
  },
  {
    name: "actionsdeleteSelfHostedRunnerFromRepo",
    description: "Delete a self-hosted runner from a repository",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["owner", "repo", "runner_id"],
    },
  },
  {
    name: "actionslistLabelsForSelfHostedRunnerForRepo",
    description: "List labels for a self-hosted runner for a repository",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["owner", "repo", "runner_id"],
    },
  },
  {
    name: "actionsaddCustomLabelsToSelfHostedRunnerForRepo",
    description: "Add custom labels to a self-hosted runner for a repository",
    inputSchema: {
      type: "object",
      properties: {
        labels: {
          type: "array",
          description: "The names of the custom labels to add to the runner.",
        },
      },
      required: ["labels"],
    },
  },
  {
    name: "actionssetCustomLabelsForSelfHostedRunnerForRepo",
    description: "Set custom labels for a self-hosted runner for a repository",
    inputSchema: {
      type: "object",
      properties: {
        labels: {
          type: "array",
          description: "The names of the custom labels to set for the runner. You can pass an empty array to remove all custom labels.",
        },
      },
      required: ["labels"],
    },
  },
  {
    name: "actionsremoveAllCustomLabelsFromSelfHostedRunnerFo",
    description: "Remove all custom labels from a self-hosted runner for a repository",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
      },
      required: ["owner", "repo", "runner_id"],
    },
  },
  {
    name: "actionsremoveCustomLabelFromSelfHostedRunnerForRep",
    description: "Remove a custom label from a self-hosted runner for a repository",
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
        runner_id: {
          type: "string",
          description: "Path parameter: runner_id",
        },
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["owner", "repo", "runner_id", "name"],
    },
  },
  {
    name: "actionslistWorkflowRunsForRepo",
    description: "List workflow runs for a repository",
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
    name: "actionsgetWorkflowRun",
    description: "Get a workflow run",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsdeleteWorkflowRun",
    description: "Delete a workflow run",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsgetReviewsForRun",
    description: "Get the review history for a workflow run",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsapproveWorkflowRun",
    description: "Approve a workflow run for a fork pull request",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionslistWorkflowRunArtifacts",
    description: "List workflow run artifacts",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsgetWorkflowRunAttempt",
    description: "Get a workflow run attempt",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
        attempt_number: {
          type: "string",
          description: "Path parameter: attempt_number",
        },
      },
      required: ["owner", "repo", "run_id", "attempt_number"],
    },
  },
  {
    name: "actionslistJobsForWorkflowRunAttempt",
    description: "List jobs for a workflow run attempt",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
        attempt_number: {
          type: "string",
          description: "Path parameter: attempt_number",
        },
      },
      required: ["owner", "repo", "run_id", "attempt_number"],
    },
  },
  {
    name: "actionsdownloadWorkflowRunAttemptLogs",
    description: "Download workflow run attempt logs",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
        attempt_number: {
          type: "string",
          description: "Path parameter: attempt_number",
        },
      },
      required: ["owner", "repo", "run_id", "attempt_number"],
    },
  },
  {
    name: "actionscancelWorkflowRun",
    description: "Cancel a workflow run",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsreviewCustomGatesForRun",
    description: "Review custom deployment protection rules for a workflow run",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsforceCancelWorkflowRun",
    description: "Force cancel a workflow run",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionslistJobsForWorkflowRun",
    description: "List jobs for a workflow run",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        filter: {
          type: "string",
          description: "Filters jobs by their `completed_at` timestamp. `latest` returns jobs from the most recent execution of the workflow run. `all` returns all jobs for a workflow run, including from old executions of the workflow run.",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsdownloadWorkflowRunLogs",
    description: "Download workflow run logs",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsdeleteWorkflowRunLogs",
    description: "Delete workflow run logs",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsgetPendingDeploymentsForRun",
    description: "Get pending deployments for a workflow run",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionsreviewPendingDeploymentsForRun",
    description: "Review pending deployments for a workflow run",
    inputSchema: {
      type: "object",
      properties: {
        environment_ids: {
          type: "array",
          description: "The list of environment ids to approve or reject",
        },
        state: {
          type: "string",
          description: "Whether to approve or reject deployment to the specified environments.",
          enum: ["approved", "rejected"],
        },
        comment: {
          type: "string",
          description: "A comment to accompany the deployment review",
        },
      },
      required: ["environment_ids", "state", "comment"],
    },
  },
  {
    name: "actionsreRunWorkflow",
    description: "Re-run a workflow",
    inputSchema: {
      type: "object",
      properties: {
        enable_debug_logging: {
          type: "boolean",
          description: "Whether to enable debug logging for the re-run.",
        },
      },
      required: [],
    },
  },
  {
    name: "actionsreRunWorkflowFailedJobs",
    description: "Re-run failed jobs from a workflow run",
    inputSchema: {
      type: "object",
      properties: {
        enable_debug_logging: {
          type: "boolean",
          description: "Whether to enable debug logging for the re-run.",
        },
      },
      required: [],
    },
  },
  {
    name: "actionsgetWorkflowRunUsage",
    description: "Get workflow run usage",
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
        run_id: {
          type: "string",
          description: "Path parameter: run_id",
        },
      },
      required: ["owner", "repo", "run_id"],
    },
  },
  {
    name: "actionslistRepoSecrets",
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
    name: "actionsgetRepoPublicKey",
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
    name: "actionsgetRepoSecret",
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
    name: "actionscreateOrUpdateRepoSecret",
    description: "Create or update a repository secret",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "Value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get a repository public key](https://docs.github.com/rest/actions/secrets#get-a-repository-public-key) endpoint.",
        },
        key_id: {
          type: "string",
          description: "ID of the key you used to encrypt the secret.",
        },
      },
      required: ["encrypted_value", "key_id"],
    },
  },
  {
    name: "actionsdeleteRepoSecret",
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
    name: "actionslistRepoVariables",
    description: "List repository variables",
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
    name: "actionscreateRepoVariable",
    description: "Create a repository variable",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the variable.",
        },
        value: {
          type: "string",
          description: "The value of the variable.",
        },
      },
      required: ["name", "value"],
    },
  },
  {
    name: "actionsgetRepoVariable",
    description: "Get a repository variable",
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
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["owner", "repo", "name"],
    },
  },
  {
    name: "actionsupdateRepoVariable",
    description: "Update a repository variable",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the variable.",
        },
        value: {
          type: "string",
          description: "The value of the variable.",
        },
      },
      required: [],
    },
  },
  {
    name: "actionsdeleteRepoVariable",
    description: "Delete a repository variable",
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
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["owner", "repo", "name"],
    },
  },
  {
    name: "actionslistRepoWorkflows",
    description: "List repository workflows",
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
    name: "actionsgetWorkflow",
    description: "Get a workflow",
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
        workflow_id: {
          type: "string",
          description: "Path parameter: workflow_id",
        },
      },
      required: ["owner", "repo", "workflow_id"],
    },
  },
  {
    name: "actionsdisableWorkflow",
    description: "Disable a workflow",
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
        workflow_id: {
          type: "string",
          description: "Path parameter: workflow_id",
        },
      },
      required: ["owner", "repo", "workflow_id"],
    },
  },
  {
    name: "actionscreateWorkflowDispatch",
    description: "Create a workflow dispatch event",
    inputSchema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description: "The git reference for the workflow. The reference can be a branch or tag name.",
        },
        inputs: {
          type: "object",
          description: "Input keys and values configured in the workflow file. The maximum number of properties is 10. Any default properties configured in the workflow file will be used when `inputs` are omitted.",
        },
      },
      required: ["ref"],
    },
  },
  {
    name: "actionsenableWorkflow",
    description: "Enable a workflow",
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
        workflow_id: {
          type: "string",
          description: "Path parameter: workflow_id",
        },
      },
      required: ["owner", "repo", "workflow_id"],
    },
  },
  {
    name: "actionslistWorkflowRuns",
    description: "List workflow runs for a workflow",
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
        workflow_id: {
          type: "string",
          description: "Path parameter: workflow_id",
        },
      },
      required: ["owner", "repo", "workflow_id"],
    },
  },
  {
    name: "actionsgetWorkflowUsage",
    description: "Get workflow usage",
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
        workflow_id: {
          type: "string",
          description: "Path parameter: workflow_id",
        },
      },
      required: ["owner", "repo", "workflow_id"],
    },
  },
  {
    name: "actionslistEnvironmentSecrets",
    description: "List environment secrets",
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
        environment_name: {
          type: "string",
          description: "Path parameter: environment_name",
        },
      },
      required: ["owner", "repo", "environment_name"],
    },
  },
  {
    name: "actionsgetEnvironmentPublicKey",
    description: "Get an environment public key",
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
        environment_name: {
          type: "string",
          description: "Path parameter: environment_name",
        },
      },
      required: ["owner", "repo", "environment_name"],
    },
  },
  {
    name: "actionsgetEnvironmentSecret",
    description: "Get an environment secret",
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
        environment_name: {
          type: "string",
          description: "Path parameter: environment_name",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["owner", "repo", "environment_name", "secret_name"],
    },
  },
  {
    name: "actionscreateOrUpdateEnvironmentSecret",
    description: "Create or update an environment secret",
    inputSchema: {
      type: "object",
      properties: {
        encrypted_value: {
          type: "string",
          description: "Value for your secret, encrypted with [LibSodium](https://libsodium.gitbook.io/doc/bindings_for_other_languages) using the public key retrieved from the [Get an environment public key](https://docs.github.com/rest/actions/secrets#get-an-environment-public-key) endpoint.",
        },
        key_id: {
          type: "string",
          description: "ID of the key you used to encrypt the secret.",
        },
      },
      required: ["encrypted_value", "key_id"],
    },
  },
  {
    name: "actionsdeleteEnvironmentSecret",
    description: "Delete an environment secret",
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
        environment_name: {
          type: "string",
          description: "Path parameter: environment_name",
        },
        secret_name: {
          type: "string",
          description: "Path parameter: secret_name",
        },
      },
      required: ["owner", "repo", "environment_name", "secret_name"],
    },
  },
  {
    name: "actionslistEnvironmentVariables",
    description: "List environment variables",
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
        environment_name: {
          type: "string",
          description: "Path parameter: environment_name",
        },
      },
      required: ["owner", "repo", "environment_name"],
    },
  },
  {
    name: "actionscreateEnvironmentVariable",
    description: "Create an environment variable",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the variable.",
        },
        value: {
          type: "string",
          description: "The value of the variable.",
        },
      },
      required: ["name", "value"],
    },
  },
  {
    name: "actionsgetEnvironmentVariable",
    description: "Get an environment variable",
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
        environment_name: {
          type: "string",
          description: "Path parameter: environment_name",
        },
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["owner", "repo", "environment_name", "name"],
    },
  },
  {
    name: "actionsupdateEnvironmentVariable",
    description: "Update an environment variable",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the variable.",
        },
        value: {
          type: "string",
          description: "The value of the variable.",
        },
      },
      required: [],
    },
  },
  {
    name: "actionsdeleteEnvironmentVariable",
    description: "Delete an environment variable",
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
        environment_name: {
          type: "string",
          description: "Path parameter: environment_name",
        },
        name: {
          type: "string",
          description: "Path parameter: name",
        },
      },
      required: ["owner", "repo", "environment_name", "name"],
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
  const client = new GitHubv3RESTAPIactionsClient(accessToken);

  try {
    switch (name) {
      case "actionsgetActionsCacheUsageForOrg": {
        const result = await client.actionsgetActionsCacheUsageForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetActionsCacheUsageByRepoForOrg": {
        const result = await client.actionsgetActionsCacheUsageByRepoForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistHostedRunnersForOrg": {
        const result = await client.actionslistHostedRunnersForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateHostedRunnerForOrg": {
        const result = await client.actionscreateHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistCustomImagesForOrg": {
        const result = await client.actionslistCustomImagesForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetCustomImageForOrg": {
        const result = await client.actionsgetCustomImageForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteCustomImageFromOrg": {
        const result = await client.actionsdeleteCustomImageFromOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistCustomImageVersionsForOrg": {
        const result = await client.actionslistCustomImageVersionsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetCustomImageVersionForOrg": {
        const result = await client.actionsgetCustomImageVersionForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteCustomImageVersionFromOrg": {
        const result = await client.actionsdeleteCustomImageVersionFromOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetHostedRunnersGithubOwnedImagesForOrg": {
        const result = await client.actionsgetHostedRunnersGithubOwnedImagesForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetHostedRunnersPartnerImagesForOrg": {
        const result = await client.actionsgetHostedRunnersPartnerImagesForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetHostedRunnersLimitsForOrg": {
        const result = await client.actionsgetHostedRunnersLimitsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetHostedRunnersMachineSpecsForOrg": {
        const result = await client.actionsgetHostedRunnersMachineSpecsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetHostedRunnersPlatformsForOrg": {
        const result = await client.actionsgetHostedRunnersPlatformsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetHostedRunnerForOrg": {
        const result = await client.actionsgetHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsupdateHostedRunnerForOrg": {
        const result = await client.actionsupdateHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteHostedRunnerForOrg": {
        const result = await client.actionsdeleteHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetGithubActionsPermissionsOrganization": {
        const result = await client.actionsgetGithubActionsPermissionsOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetGithubActionsPermissionsOrganization": {
        const result = await client.actionssetGithubActionsPermissionsOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetArtifactAndLogRetentionSettingsOrganizat": {
        const result = await client.actionsgetArtifactAndLogRetentionSettingsOrganizat(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetArtifactAndLogRetentionSettingsOrganizat": {
        const result = await client.actionssetArtifactAndLogRetentionSettingsOrganizat(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetForkPrContributorApprovalPermissionsOrga": {
        const result = await client.actionsgetForkPrContributorApprovalPermissionsOrga(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetForkPrContributorApprovalPermissionsOrga": {
        const result = await client.actionssetForkPrContributorApprovalPermissionsOrga(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetPrivateRepoForkPrWorkflowsSettingsOrgani": {
        const result = await client.actionsgetPrivateRepoForkPrWorkflowsSettingsOrgani(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetPrivateRepoForkPrWorkflowsSettingsOrgani": {
        const result = await client.actionssetPrivateRepoForkPrWorkflowsSettingsOrgani(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelectedRepositoriesEnabledGithubAction": {
        const result = await client.actionslistSelectedRepositoriesEnabledGithubAction(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetSelectedRepositoriesEnabledGithubActions": {
        const result = await client.actionssetSelectedRepositoriesEnabledGithubActions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsenableSelectedRepositoryGithubActionsOrgani": {
        const result = await client.actionsenableSelectedRepositoryGithubActionsOrgani(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdisableSelectedRepositoryGithubActionsOrgan": {
        const result = await client.actionsdisableSelectedRepositoryGithubActionsOrgan(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetAllowedActionsOrganization": {
        const result = await client.actionsgetAllowedActionsOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetAllowedActionsOrganization": {
        const result = await client.actionssetAllowedActionsOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetSelfHostedRunnersPermissionsOrganization": {
        const result = await client.actionsgetSelfHostedRunnersPermissionsOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetSelfHostedRunnersPermissionsOrganization": {
        const result = await client.actionssetSelfHostedRunnersPermissionsOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelectedRepositoriesSelfHostedRunnersOr": {
        const result = await client.actionslistSelectedRepositoriesSelfHostedRunnersOr(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetSelectedRepositoriesSelfHostedRunnersOrg": {
        const result = await client.actionssetSelectedRepositoriesSelfHostedRunnersOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsenableSelectedRepositorySelfHostedRunnersOr": {
        const result = await client.actionsenableSelectedRepositorySelfHostedRunnersOr(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdisableSelectedRepositorySelfHostedRunnersO": {
        const result = await client.actionsdisableSelectedRepositorySelfHostedRunnersO(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetGithubActionsDefaultWorkflowPermissionsO": {
        const result = await client.actionsgetGithubActionsDefaultWorkflowPermissionsO(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetGithubActionsDefaultWorkflowPermissionsO": {
        const result = await client.actionssetGithubActionsDefaultWorkflowPermissionsO(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelfHostedRunnerGroupsForOrg": {
        const result = await client.actionslistSelfHostedRunnerGroupsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateSelfHostedRunnerGroupForOrg": {
        const result = await client.actionscreateSelfHostedRunnerGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetSelfHostedRunnerGroupForOrg": {
        const result = await client.actionsgetSelfHostedRunnerGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsupdateSelfHostedRunnerGroupForOrg": {
        const result = await client.actionsupdateSelfHostedRunnerGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteSelfHostedRunnerGroupFromOrg": {
        const result = await client.actionsdeleteSelfHostedRunnerGroupFromOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistGithubHostedRunnersInGroupForOrg": {
        const result = await client.actionslistGithubHostedRunnersInGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRepoAccessToSelfHostedRunnerGroupInOrg": {
        const result = await client.actionslistRepoAccessToSelfHostedRunnerGroupInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetRepoAccessToSelfHostedRunnerGroupInOrg": {
        const result = await client.actionssetRepoAccessToSelfHostedRunnerGroupInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsaddRepoAccessToSelfHostedRunnerGroupInOrg": {
        const result = await client.actionsaddRepoAccessToSelfHostedRunnerGroupInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveRepoAccessToSelfHostedRunnerGroupInOr": {
        const result = await client.actionsremoveRepoAccessToSelfHostedRunnerGroupInOr(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelfHostedRunnersInGroupForOrg": {
        const result = await client.actionslistSelfHostedRunnersInGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetSelfHostedRunnersInGroupForOrg": {
        const result = await client.actionssetSelfHostedRunnersInGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsaddSelfHostedRunnerToGroupForOrg": {
        const result = await client.actionsaddSelfHostedRunnerToGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveSelfHostedRunnerFromGroupForOrg": {
        const result = await client.actionsremoveSelfHostedRunnerFromGroupForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelfHostedRunnersForOrg": {
        const result = await client.actionslistSelfHostedRunnersForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRunnerApplicationsForOrg": {
        const result = await client.actionslistRunnerApplicationsForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgenerateRunnerJitconfigForOrg": {
        const result = await client.actionsgenerateRunnerJitconfigForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateRegistrationTokenForOrg": {
        const result = await client.actionscreateRegistrationTokenForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateRemoveTokenForOrg": {
        const result = await client.actionscreateRemoveTokenForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetSelfHostedRunnerForOrg": {
        const result = await client.actionsgetSelfHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteSelfHostedRunnerFromOrg": {
        const result = await client.actionsdeleteSelfHostedRunnerFromOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistLabelsForSelfHostedRunnerForOrg": {
        const result = await client.actionslistLabelsForSelfHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsaddCustomLabelsToSelfHostedRunnerForOrg": {
        const result = await client.actionsaddCustomLabelsToSelfHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetCustomLabelsForSelfHostedRunnerForOrg": {
        const result = await client.actionssetCustomLabelsForSelfHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveAllCustomLabelsFromSelfHostedRunnerFo": {
        const result = await client.actionsremoveAllCustomLabelsFromSelfHostedRunnerFo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveCustomLabelFromSelfHostedRunnerForOrg": {
        const result = await client.actionsremoveCustomLabelFromSelfHostedRunnerForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistOrgSecrets": {
        const result = await client.actionslistOrgSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetOrgPublicKey": {
        const result = await client.actionsgetOrgPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetOrgSecret": {
        const result = await client.actionsgetOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateOrUpdateOrgSecret": {
        const result = await client.actionscreateOrUpdateOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteOrgSecret": {
        const result = await client.actionsdeleteOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelectedReposForOrgSecret": {
        const result = await client.actionslistSelectedReposForOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetSelectedReposForOrgSecret": {
        const result = await client.actionssetSelectedReposForOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsaddSelectedRepoToOrgSecret": {
        const result = await client.actionsaddSelectedRepoToOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveSelectedRepoFromOrgSecret": {
        const result = await client.actionsremoveSelectedRepoFromOrgSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistOrgVariables": {
        const result = await client.actionslistOrgVariables(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateOrgVariable": {
        const result = await client.actionscreateOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetOrgVariable": {
        const result = await client.actionsgetOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsupdateOrgVariable": {
        const result = await client.actionsupdateOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteOrgVariable": {
        const result = await client.actionsdeleteOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelectedReposForOrgVariable": {
        const result = await client.actionslistSelectedReposForOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetSelectedReposForOrgVariable": {
        const result = await client.actionssetSelectedReposForOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsaddSelectedRepoToOrgVariable": {
        const result = await client.actionsaddSelectedRepoToOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveSelectedRepoFromOrgVariable": {
        const result = await client.actionsremoveSelectedRepoFromOrgVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistArtifactsForRepo": {
        const result = await client.actionslistArtifactsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetArtifact": {
        const result = await client.actionsgetArtifact(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteArtifact": {
        const result = await client.actionsdeleteArtifact(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdownloadArtifact": {
        const result = await client.actionsdownloadArtifact(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetActionsCacheUsage": {
        const result = await client.actionsgetActionsCacheUsage(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetActionsCacheList": {
        const result = await client.actionsgetActionsCacheList(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteActionsCacheByKey": {
        const result = await client.actionsdeleteActionsCacheByKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteActionsCacheById": {
        const result = await client.actionsdeleteActionsCacheById(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetJobForWorkflowRun": {
        const result = await client.actionsgetJobForWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdownloadJobLogsForWorkflowRun": {
        const result = await client.actionsdownloadJobLogsForWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsreRunJobForWorkflowRun": {
        const result = await client.actionsreRunJobForWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetCustomOidcSubClaimForRepo": {
        const result = await client.actionsgetCustomOidcSubClaimForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetCustomOidcSubClaimForRepo": {
        const result = await client.actionssetCustomOidcSubClaimForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRepoOrganizationSecrets": {
        const result = await client.actionslistRepoOrganizationSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRepoOrganizationVariables": {
        const result = await client.actionslistRepoOrganizationVariables(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetGithubActionsPermissionsRepository": {
        const result = await client.actionsgetGithubActionsPermissionsRepository(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetGithubActionsPermissionsRepository": {
        const result = await client.actionssetGithubActionsPermissionsRepository(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetWorkflowAccessToRepository": {
        const result = await client.actionsgetWorkflowAccessToRepository(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetWorkflowAccessToRepository": {
        const result = await client.actionssetWorkflowAccessToRepository(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetArtifactAndLogRetentionSettingsRepositor": {
        const result = await client.actionsgetArtifactAndLogRetentionSettingsRepositor(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetArtifactAndLogRetentionSettingsRepositor": {
        const result = await client.actionssetArtifactAndLogRetentionSettingsRepositor(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetForkPrContributorApprovalPermissionsRepo": {
        const result = await client.actionsgetForkPrContributorApprovalPermissionsRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetForkPrContributorApprovalPermissionsRepo": {
        const result = await client.actionssetForkPrContributorApprovalPermissionsRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetPrivateRepoForkPrWorkflowsSettingsReposi": {
        const result = await client.actionsgetPrivateRepoForkPrWorkflowsSettingsReposi(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetPrivateRepoForkPrWorkflowsSettingsReposi": {
        const result = await client.actionssetPrivateRepoForkPrWorkflowsSettingsReposi(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetAllowedActionsRepository": {
        const result = await client.actionsgetAllowedActionsRepository(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetAllowedActionsRepository": {
        const result = await client.actionssetAllowedActionsRepository(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetGithubActionsDefaultWorkflowPermissionsR": {
        const result = await client.actionsgetGithubActionsDefaultWorkflowPermissionsR(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetGithubActionsDefaultWorkflowPermissionsR": {
        const result = await client.actionssetGithubActionsDefaultWorkflowPermissionsR(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistSelfHostedRunnersForRepo": {
        const result = await client.actionslistSelfHostedRunnersForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRunnerApplicationsForRepo": {
        const result = await client.actionslistRunnerApplicationsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgenerateRunnerJitconfigForRepo": {
        const result = await client.actionsgenerateRunnerJitconfigForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateRegistrationTokenForRepo": {
        const result = await client.actionscreateRegistrationTokenForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateRemoveTokenForRepo": {
        const result = await client.actionscreateRemoveTokenForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetSelfHostedRunnerForRepo": {
        const result = await client.actionsgetSelfHostedRunnerForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteSelfHostedRunnerFromRepo": {
        const result = await client.actionsdeleteSelfHostedRunnerFromRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistLabelsForSelfHostedRunnerForRepo": {
        const result = await client.actionslistLabelsForSelfHostedRunnerForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsaddCustomLabelsToSelfHostedRunnerForRepo": {
        const result = await client.actionsaddCustomLabelsToSelfHostedRunnerForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionssetCustomLabelsForSelfHostedRunnerForRepo": {
        const result = await client.actionssetCustomLabelsForSelfHostedRunnerForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveAllCustomLabelsFromSelfHostedRunnerFo": {
        const result = await client.actionsremoveAllCustomLabelsFromSelfHostedRunnerFo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsremoveCustomLabelFromSelfHostedRunnerForRep": {
        const result = await client.actionsremoveCustomLabelFromSelfHostedRunnerForRep(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistWorkflowRunsForRepo": {
        const result = await client.actionslistWorkflowRunsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetWorkflowRun": {
        const result = await client.actionsgetWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteWorkflowRun": {
        const result = await client.actionsdeleteWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetReviewsForRun": {
        const result = await client.actionsgetReviewsForRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsapproveWorkflowRun": {
        const result = await client.actionsapproveWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistWorkflowRunArtifacts": {
        const result = await client.actionslistWorkflowRunArtifacts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetWorkflowRunAttempt": {
        const result = await client.actionsgetWorkflowRunAttempt(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistJobsForWorkflowRunAttempt": {
        const result = await client.actionslistJobsForWorkflowRunAttempt(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdownloadWorkflowRunAttemptLogs": {
        const result = await client.actionsdownloadWorkflowRunAttemptLogs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscancelWorkflowRun": {
        const result = await client.actionscancelWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsreviewCustomGatesForRun": {
        const result = await client.actionsreviewCustomGatesForRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsforceCancelWorkflowRun": {
        const result = await client.actionsforceCancelWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistJobsForWorkflowRun": {
        const result = await client.actionslistJobsForWorkflowRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdownloadWorkflowRunLogs": {
        const result = await client.actionsdownloadWorkflowRunLogs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteWorkflowRunLogs": {
        const result = await client.actionsdeleteWorkflowRunLogs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetPendingDeploymentsForRun": {
        const result = await client.actionsgetPendingDeploymentsForRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsreviewPendingDeploymentsForRun": {
        const result = await client.actionsreviewPendingDeploymentsForRun(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsreRunWorkflow": {
        const result = await client.actionsreRunWorkflow(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsreRunWorkflowFailedJobs": {
        const result = await client.actionsreRunWorkflowFailedJobs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetWorkflowRunUsage": {
        const result = await client.actionsgetWorkflowRunUsage(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRepoSecrets": {
        const result = await client.actionslistRepoSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetRepoPublicKey": {
        const result = await client.actionsgetRepoPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetRepoSecret": {
        const result = await client.actionsgetRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateOrUpdateRepoSecret": {
        const result = await client.actionscreateOrUpdateRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteRepoSecret": {
        const result = await client.actionsdeleteRepoSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRepoVariables": {
        const result = await client.actionslistRepoVariables(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateRepoVariable": {
        const result = await client.actionscreateRepoVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetRepoVariable": {
        const result = await client.actionsgetRepoVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsupdateRepoVariable": {
        const result = await client.actionsupdateRepoVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteRepoVariable": {
        const result = await client.actionsdeleteRepoVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistRepoWorkflows": {
        const result = await client.actionslistRepoWorkflows(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetWorkflow": {
        const result = await client.actionsgetWorkflow(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdisableWorkflow": {
        const result = await client.actionsdisableWorkflow(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateWorkflowDispatch": {
        const result = await client.actionscreateWorkflowDispatch(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsenableWorkflow": {
        const result = await client.actionsenableWorkflow(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistWorkflowRuns": {
        const result = await client.actionslistWorkflowRuns(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetWorkflowUsage": {
        const result = await client.actionsgetWorkflowUsage(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistEnvironmentSecrets": {
        const result = await client.actionslistEnvironmentSecrets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetEnvironmentPublicKey": {
        const result = await client.actionsgetEnvironmentPublicKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetEnvironmentSecret": {
        const result = await client.actionsgetEnvironmentSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateOrUpdateEnvironmentSecret": {
        const result = await client.actionscreateOrUpdateEnvironmentSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteEnvironmentSecret": {
        const result = await client.actionsdeleteEnvironmentSecret(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionslistEnvironmentVariables": {
        const result = await client.actionslistEnvironmentVariables(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionscreateEnvironmentVariable": {
        const result = await client.actionscreateEnvironmentVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsgetEnvironmentVariable": {
        const result = await client.actionsgetEnvironmentVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsupdateEnvironmentVariable": {
        const result = await client.actionsupdateEnvironmentVariable(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "actionsdeleteEnvironmentVariable": {
        const result = await client.actionsdeleteEnvironmentVariable(args as any);
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
  console.error("GitHub v3 REST API - actions MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
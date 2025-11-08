/**
 * MCP Server: GitHub v3 REST API - teams
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
class GitHubv3RESTAPIteamsClient {
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
   * List teams
   */
  async teamslist(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a team
   */
  async teamscreate(params: {
    name: string;
    description?: string;
    maintainers?: array;
    repo_names?: array;
    privacy?: string;
    notification_setting?: string;
    permission?: string;
    parent_team_id?: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a team by name
   */
  async teamsgetByName(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a team
   */
  async teamsupdateInOrg(params: {
    name?: string;
    description?: string;
    privacy?: string;
    notification_setting?: string;
    permission?: string;
    parent_team_id?: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a team
   */
  async teamsdeleteInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List discussions
   */
  async teamslistDiscussionsInOrg(params: {
    None?: string;
    pinned?: string;
    org: string;
    team_slug: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a discussion
   */
  async teamscreateDiscussionInOrg(params: {
    title: string;
    body: string;
    private?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a discussion
   */
  async teamsgetDiscussionInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a discussion
   */
  async teamsupdateDiscussionInOrg(params: {
    title?: string;
    body?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a discussion
   */
  async teamsdeleteDiscussionInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List discussion comments
   */
  async teamslistDiscussionCommentsInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a discussion comment
   */
  async teamscreateDiscussionCommentInOrg(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a discussion comment
   */
  async teamsgetDiscussionCommentInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
    comment_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));
    path = path.replace("{{ comment_number }}}", String(params.comment_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a discussion comment
   */
  async teamsupdateDiscussionCommentInOrg(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a discussion comment
   */
  async teamsdeleteDiscussionCommentInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
    comment_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));
    path = path.replace("{{ comment_number }}}", String(params.comment_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List pending team invitations
   */
  async teamslistPendingInvitationsInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/invitations";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List team members
   */
  async teamslistMembersInOrg(params: {
    None?: string;
    role?: string;
    org: string;
    team_slug: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/members";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get team membership for a user
   */
  async teamsgetMembershipForUserInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/memberships/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add or update team membership for a user
   */
  async teamsaddOrUpdateMembershipForUserInOrg(params: {
    role?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/memberships/{username}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove team membership for a user
   */
  async teamsremoveMembershipForUserInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/memberships/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List team projects
   */
  async teamslistProjectsInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/projects";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check team permissions for a project
   */
  async teamscheckPermissionsForProjectInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    project_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/projects/{project_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ project_id }}}", String(params.project_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add or update team project permissions
   */
  async teamsaddOrUpdateProjectPermissionsInOrg(params: {
    permission?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/projects/{project_id}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a project from a team
   */
  async teamsremoveProjectInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    project_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/projects/{project_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ project_id }}}", String(params.project_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List team repositories
   */
  async teamslistReposInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/repos";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check team permissions for a repository
   */
  async teamscheckPermissionsForRepoInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
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
   * Add or update team repository permissions
   */
  async teamsaddOrUpdateRepoPermissionsInOrg(params: {
    permission?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a repository from a team
   */
  async teamsremoveRepoInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
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
   * List child teams
   */
  async teamslistChildInOrg(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/teams";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a team (Legacy)
   */
  async teamsgetLegacy(params: {
    None?: string;
    team_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a team (Legacy)
   */
  async teamsupdateLegacy(params: {
    name: string;
    description?: string;
    privacy?: string;
    notification_setting?: string;
    permission?: string;
    parent_team_id?: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a team (Legacy)
   */
  async teamsdeleteLegacy(params: {
    None?: string;
    team_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List discussions (Legacy)
   */
  async teamslistDiscussionsLegacy(params: {
    None?: string;
    team_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a discussion (Legacy)
   */
  async teamscreateDiscussionLegacy(params: {
    title: string;
    body: string;
    private?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a discussion (Legacy)
   */
  async teamsgetDiscussionLegacy(params: {
    None?: string;
    team_id: string;
    discussion_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a discussion (Legacy)
   */
  async teamsupdateDiscussionLegacy(params: {
    title?: string;
    body?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a discussion (Legacy)
   */
  async teamsdeleteDiscussionLegacy(params: {
    None?: string;
    team_id: string;
    discussion_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List discussion comments (Legacy)
   */
  async teamslistDiscussionCommentsLegacy(params: {
    None?: string;
    team_id: string;
    discussion_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/comments";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a discussion comment (Legacy)
   */
  async teamscreateDiscussionCommentLegacy(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/comments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a discussion comment (Legacy)
   */
  async teamsgetDiscussionCommentLegacy(params: {
    None?: string;
    team_id: string;
    discussion_number: string;
    comment_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));
    path = path.replace("{{ comment_number }}}", String(params.comment_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a discussion comment (Legacy)
   */
  async teamsupdateDiscussionCommentLegacy(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a discussion comment (Legacy)
   */
  async teamsdeleteDiscussionCommentLegacy(params: {
    None?: string;
    team_id: string;
    discussion_number: string;
    comment_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));
    path = path.replace("{{ comment_number }}}", String(params.comment_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List pending team invitations (Legacy)
   */
  async teamslistPendingInvitationsLegacy(params: {
    None?: string;
    team_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/invitations";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List team members (Legacy)
   */
  async teamslistMembersLegacy(params: {
    None?: string;
    role?: string;
    team_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/members";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get team member (Legacy)
   */
  async teamsgetMemberLegacy(params: {
    None?: string;
    team_id: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/members/{username}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add team member (Legacy)
   */
  async teamsaddMemberLegacy(params: {
    None?: string;
    team_id: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/members/{username}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove team member (Legacy)
   */
  async teamsremoveMemberLegacy(params: {
    None?: string;
    team_id: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/members/{username}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get team membership for a user (Legacy)
   */
  async teamsgetMembershipForUserLegacy(params: {
    None?: string;
    team_id: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/memberships/{username}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add or update team membership for a user (Legacy)
   */
  async teamsaddOrUpdateMembershipForUserLegacy(params: {
    role?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/memberships/{username}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove team membership for a user (Legacy)
   */
  async teamsremoveMembershipForUserLegacy(params: {
    None?: string;
    team_id: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/memberships/{username}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List team projects (Legacy)
   */
  async teamslistProjectsLegacy(params: {
    None?: string;
    team_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/projects";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check team permissions for a project (Legacy)
   */
  async teamscheckPermissionsForProjectLegacy(params: {
    None?: string;
    team_id: string;
    project_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/projects/{project_id}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ project_id }}}", String(params.project_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add or update team project permissions (Legacy)
   */
  async teamsaddOrUpdateProjectPermissionsLegacy(params: {
    permission?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/projects/{project_id}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a project from a team (Legacy)
   */
  async teamsremoveProjectLegacy(params: {
    None?: string;
    team_id: string;
    project_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/projects/{project_id}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
    path = path.replace("{{ project_id }}}", String(params.project_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List team repositories (Legacy)
   */
  async teamslistReposLegacy(params: {
    None?: string;
    team_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/repos";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check team permissions for a repository (Legacy)
   */
  async teamscheckPermissionsForRepoLegacy(params: {
    None?: string;
    team_id: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/repos/{owner}/{repo}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
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
   * Add or update team repository permissions (Legacy)
   */
  async teamsaddOrUpdateRepoPermissionsLegacy(params: {
    permission?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/repos/{owner}/{repo}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a repository from a team (Legacy)
   */
  async teamsremoveRepoLegacy(params: {
    None?: string;
    team_id: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/repos/{owner}/{repo}";
    path = path.replace("{{ team_id }}}", String(params.team_id));
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
   * List child teams (Legacy)
   */
  async teamslistChildLegacy(params: {
    None?: string;
    team_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/teams";
    path = path.replace("{{ team_id }}}", String(params.team_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List teams for the authenticated user
   */
  async teamslistForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/teams";

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
    name: "github-v3-rest-api---teams-35",
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
    name: "teamslist",
    description: "List teams",
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
    name: "teamscreate",
    description: "Create a team",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the team.",
        },
        description: {
          type: "string",
          description: "The description of the team.",
        },
        maintainers: {
          type: "array",
          description: "List GitHub usernames for organization members who will become team maintainers.",
        },
        repo_names: {
          type: "array",
          description: "The full name (e.g., "organization-name/repository-name") of repositories to add the team to.",
        },
        privacy: {
          type: "string",
          description: "The level of privacy this team should have. The options are:  
**For a non-nested team:**  
 * `secret` - only visible to organization owners and members of this team.  
 * `closed` - visible to all members of this organization.  
Default: `secret`  
**For a parent or child team:**  
 * `closed` - visible to all members of this organization.  
Default for child team: `closed`",
          enum: ["secret", "closed"],
        },
        notification_setting: {
          type: "string",
          description: "The notification setting the team has chosen. The options are:  
 * `notifications_enabled` - team members receive notifications when the team is @mentioned.  
 * `notifications_disabled` - no one receives notifications.  
Default: `notifications_enabled`",
          enum: ["notifications_enabled", "notifications_disabled"],
        },
        permission: {
          type: "string",
          description: "**Closing down notice**. The permission that new repositories will be added to the team with when none is specified.",
          enum: ["pull", "push"],
        },
        parent_team_id: {
          type: "integer",
          description: "The ID of a team to set as the parent team.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "teamsgetByName",
    description: "Get a team by name",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamsupdateInOrg",
    description: "Update a team",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the team.",
        },
        description: {
          type: "string",
          description: "The description of the team.",
        },
        privacy: {
          type: "string",
          description: "The level of privacy this team should have. Editing teams without specifying this parameter leaves `privacy` intact. When a team is nested, the `privacy` for parent teams cannot be `secret`. The options are:  
**For a non-nested team:**  
 * `secret` - only visible to organization owners and members of this team.  
 * `closed` - visible to all members of this organization.  
**For a parent or child team:**  
 * `closed` - visible to all members of this organization.",
          enum: ["secret", "closed"],
        },
        notification_setting: {
          type: "string",
          description: "The notification setting the team has chosen. Editing teams without specifying this parameter leaves `notification_setting` intact. The options are: 
 * `notifications_enabled` - team members receive notifications when the team is @mentioned.  
 * `notifications_disabled` - no one receives notifications.",
          enum: ["notifications_enabled", "notifications_disabled"],
        },
        permission: {
          type: "string",
          description: "**Closing down notice**. The permission that new repositories will be added to the team with when none is specified.",
          enum: ["pull", "push", "admin"],
        },
        parent_team_id: {
          type: "integer",
          description: "The ID of a team to set as the parent team.",
        },
      },
      required: [],
    },
  },
  {
    name: "teamsdeleteInOrg",
    description: "Delete a team",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamslistDiscussionsInOrg",
    description: "List discussions",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        pinned: {
          type: "string",
          description: "Pinned discussions only filter",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamscreateDiscussionInOrg",
    description: "Create a discussion",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The discussion post's title.",
        },
        body: {
          type: "string",
          description: "The discussion post's body text.",
        },
        private: {
          type: "boolean",
          description: "Private posts are only visible to team members, organization owners, and team maintainers. Public posts are visible to all members of the organization. Set to `true` to create a private post.",
        },
      },
      required: ["title", "body"],
    },
  },
  {
    name: "teamsgetDiscussionInOrg",
    description: "Get a discussion",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
      },
      required: ["org", "team_slug", "discussion_number"],
    },
  },
  {
    name: "teamsupdateDiscussionInOrg",
    description: "Update a discussion",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The discussion post's title.",
        },
        body: {
          type: "string",
          description: "The discussion post's body text.",
        },
      },
      required: [],
    },
  },
  {
    name: "teamsdeleteDiscussionInOrg",
    description: "Delete a discussion",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
      },
      required: ["org", "team_slug", "discussion_number"],
    },
  },
  {
    name: "teamslistDiscussionCommentsInOrg",
    description: "List discussion comments",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
      },
      required: ["org", "team_slug", "discussion_number"],
    },
  },
  {
    name: "teamscreateDiscussionCommentInOrg",
    description: "Create a discussion comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The discussion comment's body text.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "teamsgetDiscussionCommentInOrg",
    description: "Get a discussion comment",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
        comment_number: {
          type: "string",
          description: "Path parameter: comment_number",
        },
      },
      required: ["org", "team_slug", "discussion_number", "comment_number"],
    },
  },
  {
    name: "teamsupdateDiscussionCommentInOrg",
    description: "Update a discussion comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The discussion comment's body text.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "teamsdeleteDiscussionCommentInOrg",
    description: "Delete a discussion comment",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
        comment_number: {
          type: "string",
          description: "Path parameter: comment_number",
        },
      },
      required: ["org", "team_slug", "discussion_number", "comment_number"],
    },
  },
  {
    name: "teamslistPendingInvitationsInOrg",
    description: "List pending team invitations",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamslistMembersInOrg",
    description: "List team members",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        role: {
          type: "string",
          description: "Filters members returned by their role in the team.",
          enum: ["member", "maintainer", "all"],
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamsgetMembershipForUserInOrg",
    description: "Get team membership for a user",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["org", "team_slug", "username"],
    },
  },
  {
    name: "teamsaddOrUpdateMembershipForUserInOrg",
    description: "Add or update team membership for a user",
    inputSchema: {
      type: "object",
      properties: {
        role: {
          type: "string",
          description: "The role that this user should have in the team.",
          enum: ["member", "maintainer"],
        },
      },
      required: [],
    },
  },
  {
    name: "teamsremoveMembershipForUserInOrg",
    description: "Remove team membership for a user",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["org", "team_slug", "username"],
    },
  },
  {
    name: "teamslistProjectsInOrg",
    description: "List team projects",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamscheckPermissionsForProjectInOrg",
    description: "Check team permissions for a project",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        project_id: {
          type: "string",
          description: "Path parameter: project_id",
        },
      },
      required: ["org", "team_slug", "project_id"],
    },
  },
  {
    name: "teamsaddOrUpdateProjectPermissionsInOrg",
    description: "Add or update team project permissions",
    inputSchema: {
      type: "object",
      properties: {
        permission: {
          type: "string",
          description: "The permission to grant to the team for this project. Default: the team's `permission` attribute will be used to determine what permission to grant the team on this project. Note that, if you choose not to pass any parameters, you'll need to set `Content-Length` to zero when calling this endpoint. For more information, see "[HTTP method](https://docs.github.com/rest/guides/getting-started-with-the-rest-api#http-method)."",
          enum: ["read", "write", "admin"],
        },
      },
      required: [],
    },
  },
  {
    name: "teamsremoveProjectInOrg",
    description: "Remove a project from a team",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
        project_id: {
          type: "string",
          description: "Path parameter: project_id",
        },
      },
      required: ["org", "team_slug", "project_id"],
    },
  },
  {
    name: "teamslistReposInOrg",
    description: "List team repositories",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamscheckPermissionsForRepoInOrg",
    description: "Check team permissions for a repository",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
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
      required: ["org", "team_slug", "owner", "repo"],
    },
  },
  {
    name: "teamsaddOrUpdateRepoPermissionsInOrg",
    description: "Add or update team repository permissions",
    inputSchema: {
      type: "object",
      properties: {
        permission: {
          type: "string",
          description: "The permission to grant the team on this repository. We accept the following permissions to be set: `pull`, `triage`, `push`, `maintain`, `admin` and you can also specify a custom repository role name, if the owning organization has defined any. If no permission is specified, the team's `permission` attribute will be used to determine what permission to grant the team on this repository.",
        },
      },
      required: [],
    },
  },
  {
    name: "teamsremoveRepoInOrg",
    description: "Remove a repository from a team",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
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
      required: ["org", "team_slug", "owner", "repo"],
    },
  },
  {
    name: "teamslistChildInOrg",
    description: "List child teams",
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
        team_slug: {
          type: "string",
          description: "Path parameter: team_slug",
        },
      },
      required: ["org", "team_slug"],
    },
  },
  {
    name: "teamsgetLegacy",
    description: "Get a team (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamsupdateLegacy",
    description: "Update a team (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the team.",
        },
        description: {
          type: "string",
          description: "The description of the team.",
        },
        privacy: {
          type: "string",
          description: "The level of privacy this team should have. Editing teams without specifying this parameter leaves `privacy` intact. The options are:  
**For a non-nested team:**  
 * `secret` - only visible to organization owners and members of this team.  
 * `closed` - visible to all members of this organization.  
**For a parent or child team:**  
 * `closed` - visible to all members of this organization.",
          enum: ["secret", "closed"],
        },
        notification_setting: {
          type: "string",
          description: "The notification setting the team has chosen. Editing teams without specifying this parameter leaves `notification_setting` intact. The options are: 
 * `notifications_enabled` - team members receive notifications when the team is @mentioned.  
 * `notifications_disabled` - no one receives notifications.",
          enum: ["notifications_enabled", "notifications_disabled"],
        },
        permission: {
          type: "string",
          description: "**Closing down notice**. The permission that new repositories will be added to the team with when none is specified.",
          enum: ["pull", "push", "admin"],
        },
        parent_team_id: {
          type: "integer",
          description: "The ID of a team to set as the parent team.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "teamsdeleteLegacy",
    description: "Delete a team (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamslistDiscussionsLegacy",
    description: "List discussions (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamscreateDiscussionLegacy",
    description: "Create a discussion (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The discussion post's title.",
        },
        body: {
          type: "string",
          description: "The discussion post's body text.",
        },
        private: {
          type: "boolean",
          description: "Private posts are only visible to team members, organization owners, and team maintainers. Public posts are visible to all members of the organization. Set to `true` to create a private post.",
        },
      },
      required: ["title", "body"],
    },
  },
  {
    name: "teamsgetDiscussionLegacy",
    description: "Get a discussion (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
      },
      required: ["team_id", "discussion_number"],
    },
  },
  {
    name: "teamsupdateDiscussionLegacy",
    description: "Update a discussion (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The discussion post's title.",
        },
        body: {
          type: "string",
          description: "The discussion post's body text.",
        },
      },
      required: [],
    },
  },
  {
    name: "teamsdeleteDiscussionLegacy",
    description: "Delete a discussion (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
      },
      required: ["team_id", "discussion_number"],
    },
  },
  {
    name: "teamslistDiscussionCommentsLegacy",
    description: "List discussion comments (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
      },
      required: ["team_id", "discussion_number"],
    },
  },
  {
    name: "teamscreateDiscussionCommentLegacy",
    description: "Create a discussion comment (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The discussion comment's body text.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "teamsgetDiscussionCommentLegacy",
    description: "Get a discussion comment (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
        comment_number: {
          type: "string",
          description: "Path parameter: comment_number",
        },
      },
      required: ["team_id", "discussion_number", "comment_number"],
    },
  },
  {
    name: "teamsupdateDiscussionCommentLegacy",
    description: "Update a discussion comment (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The discussion comment's body text.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "teamsdeleteDiscussionCommentLegacy",
    description: "Delete a discussion comment (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        discussion_number: {
          type: "string",
          description: "Path parameter: discussion_number",
        },
        comment_number: {
          type: "string",
          description: "Path parameter: comment_number",
        },
      },
      required: ["team_id", "discussion_number", "comment_number"],
    },
  },
  {
    name: "teamslistPendingInvitationsLegacy",
    description: "List pending team invitations (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamslistMembersLegacy",
    description: "List team members (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        role: {
          type: "string",
          description: "Filters members returned by their role in the team.",
          enum: ["member", "maintainer", "all"],
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamsgetMemberLegacy",
    description: "Get team member (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["team_id", "username"],
    },
  },
  {
    name: "teamsaddMemberLegacy",
    description: "Add team member (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["team_id", "username"],
    },
  },
  {
    name: "teamsremoveMemberLegacy",
    description: "Remove team member (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["team_id", "username"],
    },
  },
  {
    name: "teamsgetMembershipForUserLegacy",
    description: "Get team membership for a user (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["team_id", "username"],
    },
  },
  {
    name: "teamsaddOrUpdateMembershipForUserLegacy",
    description: "Add or update team membership for a user (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        role: {
          type: "string",
          description: "The role that this user should have in the team.",
          enum: ["member", "maintainer"],
        },
      },
      required: [],
    },
  },
  {
    name: "teamsremoveMembershipForUserLegacy",
    description: "Remove team membership for a user (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["team_id", "username"],
    },
  },
  {
    name: "teamslistProjectsLegacy",
    description: "List team projects (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamscheckPermissionsForProjectLegacy",
    description: "Check team permissions for a project (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        project_id: {
          type: "string",
          description: "Path parameter: project_id",
        },
      },
      required: ["team_id", "project_id"],
    },
  },
  {
    name: "teamsaddOrUpdateProjectPermissionsLegacy",
    description: "Add or update team project permissions (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        permission: {
          type: "string",
          description: "The permission to grant to the team for this project. Default: the team's `permission` attribute will be used to determine what permission to grant the team on this project. Note that, if you choose not to pass any parameters, you'll need to set `Content-Length` to zero when calling this endpoint. For more information, see "[HTTP method](https://docs.github.com/rest/guides/getting-started-with-the-rest-api#http-method)."",
          enum: ["read", "write", "admin"],
        },
      },
      required: [],
    },
  },
  {
    name: "teamsremoveProjectLegacy",
    description: "Remove a project from a team (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
        project_id: {
          type: "string",
          description: "Path parameter: project_id",
        },
      },
      required: ["team_id", "project_id"],
    },
  },
  {
    name: "teamslistReposLegacy",
    description: "List team repositories (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamscheckPermissionsForRepoLegacy",
    description: "Check team permissions for a repository (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
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
      required: ["team_id", "owner", "repo"],
    },
  },
  {
    name: "teamsaddOrUpdateRepoPermissionsLegacy",
    description: "Add or update team repository permissions (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        permission: {
          type: "string",
          description: "The permission to grant the team on this repository. If no permission is specified, the team's `permission` attribute will be used to determine what permission to grant the team on this repository.",
          enum: ["pull", "push", "admin"],
        },
      },
      required: [],
    },
  },
  {
    name: "teamsremoveRepoLegacy",
    description: "Remove a repository from a team (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
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
      required: ["team_id", "owner", "repo"],
    },
  },
  {
    name: "teamslistChildLegacy",
    description: "List child teams (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        team_id: {
          type: "string",
          description: "Path parameter: team_id",
        },
      },
      required: ["team_id"],
    },
  },
  {
    name: "teamslistForAuthenticatedUser",
    description: "List teams for the authenticated user",
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
  const client = new GitHubv3RESTAPIteamsClient(accessToken);

  try {
    switch (name) {
      case "teamslist": {
        const result = await client.teamslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscreate": {
        const result = await client.teamscreate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetByName": {
        const result = await client.teamsgetByName(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsupdateInOrg": {
        const result = await client.teamsupdateInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsdeleteInOrg": {
        const result = await client.teamsdeleteInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistDiscussionsInOrg": {
        const result = await client.teamslistDiscussionsInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscreateDiscussionInOrg": {
        const result = await client.teamscreateDiscussionInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetDiscussionInOrg": {
        const result = await client.teamsgetDiscussionInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsupdateDiscussionInOrg": {
        const result = await client.teamsupdateDiscussionInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsdeleteDiscussionInOrg": {
        const result = await client.teamsdeleteDiscussionInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistDiscussionCommentsInOrg": {
        const result = await client.teamslistDiscussionCommentsInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscreateDiscussionCommentInOrg": {
        const result = await client.teamscreateDiscussionCommentInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetDiscussionCommentInOrg": {
        const result = await client.teamsgetDiscussionCommentInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsupdateDiscussionCommentInOrg": {
        const result = await client.teamsupdateDiscussionCommentInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsdeleteDiscussionCommentInOrg": {
        const result = await client.teamsdeleteDiscussionCommentInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistPendingInvitationsInOrg": {
        const result = await client.teamslistPendingInvitationsInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistMembersInOrg": {
        const result = await client.teamslistMembersInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetMembershipForUserInOrg": {
        const result = await client.teamsgetMembershipForUserInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsaddOrUpdateMembershipForUserInOrg": {
        const result = await client.teamsaddOrUpdateMembershipForUserInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsremoveMembershipForUserInOrg": {
        const result = await client.teamsremoveMembershipForUserInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistProjectsInOrg": {
        const result = await client.teamslistProjectsInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscheckPermissionsForProjectInOrg": {
        const result = await client.teamscheckPermissionsForProjectInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsaddOrUpdateProjectPermissionsInOrg": {
        const result = await client.teamsaddOrUpdateProjectPermissionsInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsremoveProjectInOrg": {
        const result = await client.teamsremoveProjectInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistReposInOrg": {
        const result = await client.teamslistReposInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscheckPermissionsForRepoInOrg": {
        const result = await client.teamscheckPermissionsForRepoInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsaddOrUpdateRepoPermissionsInOrg": {
        const result = await client.teamsaddOrUpdateRepoPermissionsInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsremoveRepoInOrg": {
        const result = await client.teamsremoveRepoInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistChildInOrg": {
        const result = await client.teamslistChildInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetLegacy": {
        const result = await client.teamsgetLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsupdateLegacy": {
        const result = await client.teamsupdateLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsdeleteLegacy": {
        const result = await client.teamsdeleteLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistDiscussionsLegacy": {
        const result = await client.teamslistDiscussionsLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscreateDiscussionLegacy": {
        const result = await client.teamscreateDiscussionLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetDiscussionLegacy": {
        const result = await client.teamsgetDiscussionLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsupdateDiscussionLegacy": {
        const result = await client.teamsupdateDiscussionLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsdeleteDiscussionLegacy": {
        const result = await client.teamsdeleteDiscussionLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistDiscussionCommentsLegacy": {
        const result = await client.teamslistDiscussionCommentsLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscreateDiscussionCommentLegacy": {
        const result = await client.teamscreateDiscussionCommentLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetDiscussionCommentLegacy": {
        const result = await client.teamsgetDiscussionCommentLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsupdateDiscussionCommentLegacy": {
        const result = await client.teamsupdateDiscussionCommentLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsdeleteDiscussionCommentLegacy": {
        const result = await client.teamsdeleteDiscussionCommentLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistPendingInvitationsLegacy": {
        const result = await client.teamslistPendingInvitationsLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistMembersLegacy": {
        const result = await client.teamslistMembersLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetMemberLegacy": {
        const result = await client.teamsgetMemberLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsaddMemberLegacy": {
        const result = await client.teamsaddMemberLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsremoveMemberLegacy": {
        const result = await client.teamsremoveMemberLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsgetMembershipForUserLegacy": {
        const result = await client.teamsgetMembershipForUserLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsaddOrUpdateMembershipForUserLegacy": {
        const result = await client.teamsaddOrUpdateMembershipForUserLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsremoveMembershipForUserLegacy": {
        const result = await client.teamsremoveMembershipForUserLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistProjectsLegacy": {
        const result = await client.teamslistProjectsLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscheckPermissionsForProjectLegacy": {
        const result = await client.teamscheckPermissionsForProjectLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsaddOrUpdateProjectPermissionsLegacy": {
        const result = await client.teamsaddOrUpdateProjectPermissionsLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsremoveProjectLegacy": {
        const result = await client.teamsremoveProjectLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistReposLegacy": {
        const result = await client.teamslistReposLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamscheckPermissionsForRepoLegacy": {
        const result = await client.teamscheckPermissionsForRepoLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsaddOrUpdateRepoPermissionsLegacy": {
        const result = await client.teamsaddOrUpdateRepoPermissionsLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamsremoveRepoLegacy": {
        const result = await client.teamsremoveRepoLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistChildLegacy": {
        const result = await client.teamslistChildLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "teamslistForAuthenticatedUser": {
        const result = await client.teamslistForAuthenticatedUser(args as any);
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
  console.error("GitHub v3 REST API - teams MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
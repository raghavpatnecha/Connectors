/**
 * MCP Server: GitHub v3 REST API - issues
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
class GitHubv3RESTAPIissuesClient {
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
   * List issues assigned to the authenticated user
   */
  async issueslist(params: {
    filter?: string;
    state?: string;
    None?: string;
    sort?: string;
    collab?: boolean;
    orgs?: boolean;
    owned?: boolean;
    pulls?: boolean;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/issues";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization issues assigned to the authenticated user
   */
  async issueslistForOrg(params: {
    None?: string;
    filter?: string;
    state?: string;
    type?: string;
    sort?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/issues";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List assignees
   */
  async issueslistAssignees(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/assignees";
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
   * Check if a user can be assigned
   */
  async issuescheckUserCanBeAssigned(params: {
    None?: string;
    assignee: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/assignees/{assignee}";
    path = path.replace("{{ assignee }}}", String(params.assignee));
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
   * List repository issues
   */
  async issueslistForRepo(params: {
    None?: string;
    milestone?: string;
    state?: string;
    assignee?: string;
    type?: string;
    creator?: string;
    mentioned?: string;
    sort?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues";
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
   * Create an issue
   */
  async issuescreate(params: {
    title: ;
    body?: string;
    assignee?: string;
    milestone?: ;
    labels?: array;
    assignees?: array;
    type?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List issue comments for a repository
   */
  async issueslistCommentsForRepo(params: {
    None?: string;
    direction?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/comments";
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
   * Get an issue comment
   */
  async issuesgetComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/comments/{comment_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ comment_id }}}", String(params.comment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an issue comment
   */
  async issuesupdateComment(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/comments/{comment_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an issue comment
   */
  async issuesdeleteComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/comments/{comment_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ comment_id }}}", String(params.comment_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List issue events for a repository
   */
  async issueslistEventsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/events";
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
   * Get an issue event
   */
  async issuesgetEvent(params: {
    None?: string;
    event_id: integer;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/events/{event_id}";
    path = path.replace("{{ event_id }}}", String(params.event_id));
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
   * Get an issue
   */
  async issuesget(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an issue
   */
  async issuesupdate(params: {
    title?: ;
    body?: string;
    assignee?: string;
    state?: string;
    state_reason?: string;
    milestone?: ;
    labels?: array;
    assignees?: array;
    type?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Add assignees to an issue
   */
  async issuesaddAssignees(params: {
    assignees?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/assignees";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove assignees from an issue
   */
  async issuesremoveAssignees(params: {
    assignees?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/assignees";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if a user can be assigned to a issue
   */
  async issuescheckUserCanBeAssignedToIssue(params: {
    None?: string;
    assignee: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}";
    path = path.replace("{{ assignee }}}", String(params.assignee));
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List issue comments
   */
  async issueslistComments(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/comments";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an issue comment
   */
  async issuescreateComment(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/comments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List dependencies an issue is blocked by
   */
  async issueslistDependenciesBlockedBy(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add a dependency an issue is blocked by
   */
  async issuesaddBlockedByDependency(params: {
    issue_id: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove dependency an issue is blocked by
   */
  async issuesremoveDependencyBlockedBy(params: {
    None?: string;
    issue_id: integer;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by/{issue_id}";
    path = path.replace("{{ issue_id }}}", String(params.issue_id));
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List dependencies an issue is blocking
   */
  async issueslistDependenciesBlocking(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocking";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List issue events
   */
  async issueslistEvents(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/events";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List labels for an issue
   */
  async issueslistLabelsOnIssue(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/labels";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add labels to an issue
   */
  async issuesaddLabels(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/labels";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set labels for an issue
   */
  async issuessetLabels(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/labels";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove all labels from an issue
   */
  async issuesremoveAllLabels(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/labels";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Remove a label from an issue
   */
  async issuesremoveLabel(params: {
    None?: string;
    name: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/labels/{name}";
    path = path.replace("{{ name }}}", String(params.name));
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Lock an issue
   */
  async issueslock(params: {
    lock_reason?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/lock";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Unlock an issue
   */
  async issuesunlock(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/lock";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get parent issue
   */
  async issuesgetParent(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/parent";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Remove sub-issue
   */
  async issuesremoveSubIssue(params: {
    sub_issue_id: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/sub_issue";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List sub-issues
   */
  async issueslistSubIssues(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/sub_issues";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add sub-issue
   */
  async issuesaddSubIssue(params: {
    sub_issue_id: integer;
    replace_parent?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/sub_issues";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Reprioritize sub-issue
   */
  async issuesreprioritizeSubIssue(params: {
    sub_issue_id: integer;
    after_id?: integer;
    before_id?: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List timeline events for an issue
   */
  async issueslistEventsForTimeline(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/timeline";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List labels for a repository
   */
  async issueslistLabelsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/labels";
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
   * Create a label
   */
  async issuescreateLabel(params: {
    name: string;
    color?: string;
    description?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/labels";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a label
   */
  async issuesgetLabel(params: {
    None?: string;
    name: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/labels/{name}";
    path = path.replace("{{ name }}}", String(params.name));
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
   * Update a label
   */
  async issuesupdateLabel(params: {
    new_name?: string;
    color?: string;
    description?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/labels/{name}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a label
   */
  async issuesdeleteLabel(params: {
    None?: string;
    name: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/labels/{name}";
    path = path.replace("{{ name }}}", String(params.name));
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
   * List milestones
   */
  async issueslistMilestones(params: {
    None?: string;
    state?: string;
    sort?: string;
    direction?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/milestones";
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
   * Create a milestone
   */
  async issuescreateMilestone(params: {
    title: string;
    state?: string;
    description?: string;
    due_on?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/milestones";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a milestone
   */
  async issuesgetMilestone(params: {
    None?: string;
    owner: string;
    repo: string;
    milestone_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/milestones/{milestone_number}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ milestone_number }}}", String(params.milestone_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a milestone
   */
  async issuesupdateMilestone(params: {
    title?: string;
    state?: string;
    description?: string;
    due_on?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/milestones/{milestone_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a milestone
   */
  async issuesdeleteMilestone(params: {
    None?: string;
    owner: string;
    repo: string;
    milestone_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/milestones/{milestone_number}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ milestone_number }}}", String(params.milestone_number));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List labels for issues in a milestone
   */
  async issueslistLabelsForMilestone(params: {
    None?: string;
    owner: string;
    repo: string;
    milestone_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/milestones/{milestone_number}/labels";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ milestone_number }}}", String(params.milestone_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List user account issues assigned to the authenticated user
   */
  async issueslistForAuthenticatedUser(params: {
    filter?: string;
    state?: string;
    None?: string;
    sort?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/issues";

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
    name: "github-v3-rest-api---issues-16",
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
    name: "issueslist",
    description: "List issues assigned to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Indicates which sorts of issues to return. `assigned` means issues assigned to you. `created` means issues created by you. `mentioned` means issues mentioning you. `subscribed` means issues you're subscribed to updates for. `all` or `repos` means all issues you can see, regardless of participation or creation.",
          enum: ["assigned", "created", "mentioned", "subscribed", "repos", "all"],
        },
        state: {
          type: "string",
          description: "Indicates the state of the issues to return.",
          enum: ["open", "closed", "all"],
        },
        None: {
          type: "string",
          description: "",
        },
        sort: {
          type: "string",
          description: "What to sort results by.",
          enum: ["created", "updated", "comments"],
        },
        collab: {
          type: "boolean",
          description: "",
        },
        orgs: {
          type: "boolean",
          description: "",
        },
        owned: {
          type: "boolean",
          description: "",
        },
        pulls: {
          type: "boolean",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "issueslistForOrg",
    description: "List organization issues assigned to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        filter: {
          type: "string",
          description: "Indicates which sorts of issues to return. `assigned` means issues assigned to you. `created` means issues created by you. `mentioned` means issues mentioning you. `subscribed` means issues you're subscribed to updates for. `all` or `repos` means all issues you can see, regardless of participation or creation.",
          enum: ["assigned", "created", "mentioned", "subscribed", "repos", "all"],
        },
        state: {
          type: "string",
          description: "Indicates the state of the issues to return.",
          enum: ["open", "closed", "all"],
        },
        type: {
          type: "string",
          description: "Can be the name of an issue type.",
        },
        sort: {
          type: "string",
          description: "What to sort results by.",
          enum: ["created", "updated", "comments"],
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
    name: "issueslistAssignees",
    description: "List assignees",
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
    name: "issuescheckUserCanBeAssigned",
    description: "Check if a user can be assigned",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        assignee: {
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
      required: ["assignee", "owner", "repo"],
    },
  },
  {
    name: "issueslistForRepo",
    description: "List repository issues",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        milestone: {
          type: "string",
          description: "If an `integer` is passed, it should refer to a milestone by its `number` field. If the string `*` is passed, issues with any milestone are accepted. If the string `none` is passed, issues without milestones are returned.",
        },
        state: {
          type: "string",
          description: "Indicates the state of the issues to return.",
          enum: ["open", "closed", "all"],
        },
        assignee: {
          type: "string",
          description: "Can be the name of a user. Pass in `none` for issues with no assigned user, and `*` for issues assigned to any user.",
        },
        type: {
          type: "string",
          description: "Can be the name of an issue type. If the string `*` is passed, issues with any type are accepted. If the string `none` is passed, issues without type are returned.",
        },
        creator: {
          type: "string",
          description: "The user that created the issue.",
        },
        mentioned: {
          type: "string",
          description: "A user that's mentioned in the issue.",
        },
        sort: {
          type: "string",
          description: "What to sort results by.",
          enum: ["created", "updated", "comments"],
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
    name: "issuescreate",
    description: "Create an issue",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "",
          description: "The title of the issue.",
        },
        body: {
          type: "string",
          description: "The contents of the issue.",
        },
        assignee: {
          type: "string",
          description: "Login for the user that this issue should be assigned to. _NOTE: Only users with push access can set the assignee for new issues. The assignee is silently dropped otherwise. **This field is closing down.**_",
        },
        milestone: {
          type: "",
          description: "",
        },
        labels: {
          type: "array",
          description: "Labels to associate with this issue. _NOTE: Only users with push access can set labels for new issues. Labels are silently dropped otherwise._",
        },
        assignees: {
          type: "array",
          description: "Logins for Users to assign to this issue. _NOTE: Only users with push access can set assignees for new issues. Assignees are silently dropped otherwise._",
        },
        type: {
          type: "string",
          description: "The name of the issue type to associate with this issue. _NOTE: Only users with push access can set the type for new issues. The type is silently dropped otherwise._",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "issueslistCommentsForRepo",
    description: "List issue comments for a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        direction: {
          type: "string",
          description: "Either `asc` or `desc`. Ignored without the `sort` parameter.",
          enum: ["asc", "desc"],
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
    name: "issuesgetComment",
    description: "Get an issue comment",
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
        comment_id: {
          type: "string",
          description: "Path parameter: comment_id",
        },
      },
      required: ["owner", "repo", "comment_id"],
    },
  },
  {
    name: "issuesupdateComment",
    description: "Update an issue comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The contents of the comment.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "issuesdeleteComment",
    description: "Delete an issue comment",
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
        comment_id: {
          type: "string",
          description: "Path parameter: comment_id",
        },
      },
      required: ["owner", "repo", "comment_id"],
    },
  },
  {
    name: "issueslistEventsForRepo",
    description: "List issue events for a repository",
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
    name: "issuesgetEvent",
    description: "Get an issue event",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        event_id: {
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
      },
      required: ["event_id", "owner", "repo"],
    },
  },
  {
    name: "issuesget",
    description: "Get an issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesupdate",
    description: "Update an issue",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "",
          description: "The title of the issue.",
        },
        body: {
          type: "string",
          description: "The contents of the issue.",
        },
        assignee: {
          type: "string",
          description: "Username to assign to this issue. **This field is closing down.**",
        },
        state: {
          type: "string",
          description: "The open or closed state of the issue.",
          enum: ["open", "closed"],
        },
        state_reason: {
          type: "string",
          description: "The reason for the state change. Ignored unless `state` is changed.",
          enum: ["completed", "not_planned", "duplicate", "reopened"],
        },
        milestone: {
          type: "",
          description: "",
        },
        labels: {
          type: "array",
          description: "Labels to associate with this issue. Pass one or more labels to _replace_ the set of labels on this issue. Send an empty array (`[]`) to clear all labels from the issue. Only users with push access can set labels for issues. Without push access to the repository, label changes are silently dropped.",
        },
        assignees: {
          type: "array",
          description: "Usernames to assign to this issue. Pass one or more user logins to _replace_ the set of assignees on this issue. Send an empty array (`[]`) to clear all assignees from the issue. Only users with push access can set assignees for new issues. Without push access to the repository, assignee changes are silently dropped.",
        },
        type: {
          type: "string",
          description: "The name of the issue type to associate with this issue or use `null` to remove the current issue type. Only users with push access can set the type for issues. Without push access to the repository, type changes are silently dropped.",
        },
      },
      required: [],
    },
  },
  {
    name: "issuesaddAssignees",
    description: "Add assignees to an issue",
    inputSchema: {
      type: "object",
      properties: {
        assignees: {
          type: "array",
          description: "Usernames of people to assign this issue to. _NOTE: Only users with push access can add assignees to an issue. Assignees are silently ignored otherwise._",
        },
      },
      required: [],
    },
  },
  {
    name: "issuesremoveAssignees",
    description: "Remove assignees from an issue",
    inputSchema: {
      type: "object",
      properties: {
        assignees: {
          type: "array",
          description: "Usernames of assignees to remove from an issue. _NOTE: Only users with push access can remove assignees from an issue. Assignees are silently ignored otherwise._",
        },
      },
      required: [],
    },
  },
  {
    name: "issuescheckUserCanBeAssignedToIssue",
    description: "Check if a user can be assigned to a issue",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        assignee: {
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["assignee", "owner", "repo", "issue_number"],
    },
  },
  {
    name: "issueslistComments",
    description: "List issue comments",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuescreateComment",
    description: "Create an issue comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The contents of the comment.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "issueslistDependenciesBlockedBy",
    description: "List dependencies an issue is blocked by",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesaddBlockedByDependency",
    description: "Add a dependency an issue is blocked by",
    inputSchema: {
      type: "object",
      properties: {
        issue_id: {
          type: "integer",
          description: "The id of the issue that blocks the current issue",
        },
      },
      required: ["issue_id"],
    },
  },
  {
    name: "issuesremoveDependencyBlockedBy",
    description: "Remove dependency an issue is blocked by",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        issue_id: {
          type: "integer",
          description: "The id of the blocking issue to remove as a dependency",
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
        repo: {
          type: "string",
          description: "Path parameter: repo",
        },
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["issue_id", "owner", "repo", "issue_number"],
    },
  },
  {
    name: "issueslistDependenciesBlocking",
    description: "List dependencies an issue is blocking",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issueslistEvents",
    description: "List issue events",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issueslistLabelsOnIssue",
    description: "List labels for an issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesaddLabels",
    description: "Add labels to an issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuessetLabels",
    description: "Set labels for an issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesremoveAllLabels",
    description: "Remove all labels from an issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesremoveLabel",
    description: "Remove a label from an issue",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        name: {
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["name", "owner", "repo", "issue_number"],
    },
  },
  {
    name: "issueslock",
    description: "Lock an issue",
    inputSchema: {
      type: "object",
      properties: {
        lock_reason: {
          type: "string",
          description: "The reason for locking the issue or pull request conversation. Lock will fail if you don't use one of these reasons:  
 * `off-topic`  
 * `too heated`  
 * `resolved`  
 * `spam`",
          enum: ["off-topic", "too heated", "resolved", "spam"],
        },
      },
      required: [],
    },
  },
  {
    name: "issuesunlock",
    description: "Unlock an issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesgetParent",
    description: "Get parent issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesremoveSubIssue",
    description: "Remove sub-issue",
    inputSchema: {
      type: "object",
      properties: {
        sub_issue_id: {
          type: "integer",
          description: "The id of the sub-issue to remove",
        },
      },
      required: ["sub_issue_id"],
    },
  },
  {
    name: "issueslistSubIssues",
    description: "List sub-issues",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issuesaddSubIssue",
    description: "Add sub-issue",
    inputSchema: {
      type: "object",
      properties: {
        sub_issue_id: {
          type: "integer",
          description: "The id of the sub-issue to add. The sub-issue must belong to the same repository owner as the parent issue",
        },
        replace_parent: {
          type: "boolean",
          description: "Option that, when true, instructs the operation to replace the sub-issues current parent issue",
        },
      },
      required: ["sub_issue_id"],
    },
  },
  {
    name: "issuesreprioritizeSubIssue",
    description: "Reprioritize sub-issue",
    inputSchema: {
      type: "object",
      properties: {
        sub_issue_id: {
          type: "integer",
          description: "The id of the sub-issue to reprioritize",
        },
        after_id: {
          type: "integer",
          description: "The id of the sub-issue to be prioritized after (either positional argument after OR before should be specified).",
        },
        before_id: {
          type: "integer",
          description: "The id of the sub-issue to be prioritized before (either positional argument after OR before should be specified).",
        },
      },
      required: ["sub_issue_id"],
    },
  },
  {
    name: "issueslistEventsForTimeline",
    description: "List timeline events for an issue",
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
        issue_number: {
          type: "string",
          description: "Path parameter: issue_number",
        },
      },
      required: ["owner", "repo", "issue_number"],
    },
  },
  {
    name: "issueslistLabelsForRepo",
    description: "List labels for a repository",
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
    name: "issuescreateLabel",
    description: "Create a label",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the label. Emoji can be added to label names, using either native emoji or colon-style markup. For example, typing `:strawberry:` will render the emoji ![:strawberry:](https://github.githubassets.com/images/icons/emoji/unicode/1f353.png ":strawberry:"). For a full list of available emoji and codes, see "[Emoji cheat sheet](https://github.com/ikatyang/emoji-cheat-sheet)."",
        },
        color: {
          type: "string",
          description: "The [hexadecimal color code](http://www.color-hex.com/) for the label, without the leading `#`.",
        },
        description: {
          type: "string",
          description: "A short description of the label. Must be 100 characters or fewer.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "issuesgetLabel",
    description: "Get a label",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        name: {
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
      required: ["name", "owner", "repo"],
    },
  },
  {
    name: "issuesupdateLabel",
    description: "Update a label",
    inputSchema: {
      type: "object",
      properties: {
        new_name: {
          type: "string",
          description: "The new name of the label. Emoji can be added to label names, using either native emoji or colon-style markup. For example, typing `:strawberry:` will render the emoji ![:strawberry:](https://github.githubassets.com/images/icons/emoji/unicode/1f353.png ":strawberry:"). For a full list of available emoji and codes, see "[Emoji cheat sheet](https://github.com/ikatyang/emoji-cheat-sheet)."",
        },
        color: {
          type: "string",
          description: "The [hexadecimal color code](http://www.color-hex.com/) for the label, without the leading `#`.",
        },
        description: {
          type: "string",
          description: "A short description of the label. Must be 100 characters or fewer.",
        },
      },
      required: [],
    },
  },
  {
    name: "issuesdeleteLabel",
    description: "Delete a label",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        name: {
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
      required: ["name", "owner", "repo"],
    },
  },
  {
    name: "issueslistMilestones",
    description: "List milestones",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        state: {
          type: "string",
          description: "The state of the milestone. Either `open`, `closed`, or `all`.",
          enum: ["open", "closed", "all"],
        },
        sort: {
          type: "string",
          description: "What to sort results by. Either `due_on` or `completeness`.",
          enum: ["due_on", "completeness"],
        },
        direction: {
          type: "string",
          description: "The direction of the sort. Either `asc` or `desc`.",
          enum: ["asc", "desc"],
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
    name: "issuescreateMilestone",
    description: "Create a milestone",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the milestone.",
        },
        state: {
          type: "string",
          description: "The state of the milestone. Either `open` or `closed`.",
          enum: ["open", "closed"],
        },
        description: {
          type: "string",
          description: "A description of the milestone.",
        },
        due_on: {
          type: "string",
          description: "The milestone due date. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "issuesgetMilestone",
    description: "Get a milestone",
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
        milestone_number: {
          type: "string",
          description: "Path parameter: milestone_number",
        },
      },
      required: ["owner", "repo", "milestone_number"],
    },
  },
  {
    name: "issuesupdateMilestone",
    description: "Update a milestone",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the milestone.",
        },
        state: {
          type: "string",
          description: "The state of the milestone. Either `open` or `closed`.",
          enum: ["open", "closed"],
        },
        description: {
          type: "string",
          description: "A description of the milestone.",
        },
        due_on: {
          type: "string",
          description: "The milestone due date. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`.",
        },
      },
      required: [],
    },
  },
  {
    name: "issuesdeleteMilestone",
    description: "Delete a milestone",
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
        milestone_number: {
          type: "string",
          description: "Path parameter: milestone_number",
        },
      },
      required: ["owner", "repo", "milestone_number"],
    },
  },
  {
    name: "issueslistLabelsForMilestone",
    description: "List labels for issues in a milestone",
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
        milestone_number: {
          type: "string",
          description: "Path parameter: milestone_number",
        },
      },
      required: ["owner", "repo", "milestone_number"],
    },
  },
  {
    name: "issueslistForAuthenticatedUser",
    description: "List user account issues assigned to the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Indicates which sorts of issues to return. `assigned` means issues assigned to you. `created` means issues created by you. `mentioned` means issues mentioning you. `subscribed` means issues you're subscribed to updates for. `all` or `repos` means all issues you can see, regardless of participation or creation.",
          enum: ["assigned", "created", "mentioned", "subscribed", "repos", "all"],
        },
        state: {
          type: "string",
          description: "Indicates the state of the issues to return.",
          enum: ["open", "closed", "all"],
        },
        None: {
          type: "string",
          description: "",
        },
        sort: {
          type: "string",
          description: "What to sort results by.",
          enum: ["created", "updated", "comments"],
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
  const client = new GitHubv3RESTAPIissuesClient(accessToken);

  try {
    switch (name) {
      case "issueslist": {
        const result = await client.issueslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistForOrg": {
        const result = await client.issueslistForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistAssignees": {
        const result = await client.issueslistAssignees(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuescheckUserCanBeAssigned": {
        const result = await client.issuescheckUserCanBeAssigned(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistForRepo": {
        const result = await client.issueslistForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuescreate": {
        const result = await client.issuescreate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistCommentsForRepo": {
        const result = await client.issueslistCommentsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesgetComment": {
        const result = await client.issuesgetComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesupdateComment": {
        const result = await client.issuesupdateComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesdeleteComment": {
        const result = await client.issuesdeleteComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistEventsForRepo": {
        const result = await client.issueslistEventsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesgetEvent": {
        const result = await client.issuesgetEvent(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesget": {
        const result = await client.issuesget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesupdate": {
        const result = await client.issuesupdate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesaddAssignees": {
        const result = await client.issuesaddAssignees(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesremoveAssignees": {
        const result = await client.issuesremoveAssignees(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuescheckUserCanBeAssignedToIssue": {
        const result = await client.issuescheckUserCanBeAssignedToIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistComments": {
        const result = await client.issueslistComments(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuescreateComment": {
        const result = await client.issuescreateComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistDependenciesBlockedBy": {
        const result = await client.issueslistDependenciesBlockedBy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesaddBlockedByDependency": {
        const result = await client.issuesaddBlockedByDependency(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesremoveDependencyBlockedBy": {
        const result = await client.issuesremoveDependencyBlockedBy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistDependenciesBlocking": {
        const result = await client.issueslistDependenciesBlocking(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistEvents": {
        const result = await client.issueslistEvents(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistLabelsOnIssue": {
        const result = await client.issueslistLabelsOnIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesaddLabels": {
        const result = await client.issuesaddLabels(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuessetLabels": {
        const result = await client.issuessetLabels(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesremoveAllLabels": {
        const result = await client.issuesremoveAllLabels(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesremoveLabel": {
        const result = await client.issuesremoveLabel(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslock": {
        const result = await client.issueslock(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesunlock": {
        const result = await client.issuesunlock(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesgetParent": {
        const result = await client.issuesgetParent(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesremoveSubIssue": {
        const result = await client.issuesremoveSubIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistSubIssues": {
        const result = await client.issueslistSubIssues(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesaddSubIssue": {
        const result = await client.issuesaddSubIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesreprioritizeSubIssue": {
        const result = await client.issuesreprioritizeSubIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistEventsForTimeline": {
        const result = await client.issueslistEventsForTimeline(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistLabelsForRepo": {
        const result = await client.issueslistLabelsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuescreateLabel": {
        const result = await client.issuescreateLabel(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesgetLabel": {
        const result = await client.issuesgetLabel(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesupdateLabel": {
        const result = await client.issuesupdateLabel(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesdeleteLabel": {
        const result = await client.issuesdeleteLabel(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistMilestones": {
        const result = await client.issueslistMilestones(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuescreateMilestone": {
        const result = await client.issuescreateMilestone(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesgetMilestone": {
        const result = await client.issuesgetMilestone(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesupdateMilestone": {
        const result = await client.issuesupdateMilestone(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issuesdeleteMilestone": {
        const result = await client.issuesdeleteMilestone(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistLabelsForMilestone": {
        const result = await client.issueslistLabelsForMilestone(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "issueslistForAuthenticatedUser": {
        const result = await client.issueslistForAuthenticatedUser(args as any);
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
  console.error("GitHub v3 REST API - issues MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
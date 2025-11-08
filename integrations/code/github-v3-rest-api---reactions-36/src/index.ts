/**
 * MCP Server: GitHub v3 REST API - reactions
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
class GitHubv3RESTAPIreactionsClient {
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
   * List reactions for a team discussion comment
   */
  async reactionslistForTeamDiscussionCommentInOrg(params: {
    None?: string;
    content?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
    comment_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions";
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
   * Create reaction for a team discussion comment
   */
  async reactionscreateForTeamDiscussionCommentInOrg(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete team discussion comment reaction
   */
  async reactionsdeleteForTeamDiscussionComment(params: {
    None?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
    comment_number: string;
    reaction_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));
    path = path.replace("{{ comment_number }}}", String(params.comment_number));
    path = path.replace("{{ reaction_id }}}", String(params.reaction_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reactions for a team discussion
   */
  async reactionslistForTeamDiscussionInOrg(params: {
    None?: string;
    content?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions";
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
   * Create reaction for a team discussion
   */
  async reactionscreateForTeamDiscussionInOrg(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete team discussion reaction
   */
  async reactionsdeleteForTeamDiscussion(params: {
    None?: string;
    org: string;
    team_slug: string;
    discussion_number: string;
    reaction_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ discussion_number }}}", String(params.discussion_number));
    path = path.replace("{{ reaction_id }}}", String(params.reaction_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reactions for a commit comment
   */
  async reactionslistForCommitComment(params: {
    None?: string;
    content?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/comments/{comment_id}/reactions";
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
   * Create reaction for a commit comment
   */
  async reactionscreateForCommitComment(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/comments/{comment_id}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a commit comment reaction
   */
  async reactionsdeleteForCommitComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
    reaction_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ comment_id }}}", String(params.comment_id));
    path = path.replace("{{ reaction_id }}}", String(params.reaction_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reactions for an issue comment
   */
  async reactionslistForIssueComment(params: {
    None?: string;
    content?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/comments/{comment_id}/reactions";
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
   * Create reaction for an issue comment
   */
  async reactionscreateForIssueComment(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/comments/{comment_id}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an issue comment reaction
   */
  async reactionsdeleteForIssueComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
    reaction_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ comment_id }}}", String(params.comment_id));
    path = path.replace("{{ reaction_id }}}", String(params.reaction_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reactions for an issue
   */
  async reactionslistForIssue(params: {
    None?: string;
    content?: string;
    owner: string;
    repo: string;
    issue_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/reactions";
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
   * Create reaction for an issue
   */
  async reactionscreateForIssue(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an issue reaction
   */
  async reactionsdeleteForIssue(params: {
    None?: string;
    owner: string;
    repo: string;
    issue_number: string;
    reaction_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ issue_number }}}", String(params.issue_number));
    path = path.replace("{{ reaction_id }}}", String(params.reaction_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reactions for a pull request review comment
   */
  async reactionslistForPullRequestReviewComment(params: {
    None?: string;
    content?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions";
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
   * Create reaction for a pull request review comment
   */
  async reactionscreateForPullRequestReviewComment(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a pull request comment reaction
   */
  async reactionsdeleteForPullRequestComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
    reaction_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ comment_id }}}", String(params.comment_id));
    path = path.replace("{{ reaction_id }}}", String(params.reaction_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reactions for a release
   */
  async reactionslistForRelease(params: {
    None?: string;
    content?: string;
    owner: string;
    repo: string;
    release_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}/reactions";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ release_id }}}", String(params.release_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create reaction for a release
   */
  async reactionscreateForRelease(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a release reaction
   */
  async reactionsdeleteForRelease(params: {
    None?: string;
    owner: string;
    repo: string;
    release_id: string;
    reaction_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ release_id }}}", String(params.release_id));
    path = path.replace("{{ reaction_id }}}", String(params.reaction_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reactions for a team discussion comment (Legacy)
   */
  async reactionslistForTeamDiscussionCommentLegacy(params: {
    None?: string;
    content?: string;
    team_id: string;
    discussion_number: string;
    comment_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions";
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
   * Create reaction for a team discussion comment (Legacy)
   */
  async reactionscreateForTeamDiscussionCommentLegacy(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/comments/{comment_number}/reactions";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List reactions for a team discussion (Legacy)
   */
  async reactionslistForTeamDiscussionLegacy(params: {
    None?: string;
    content?: string;
    team_id: string;
    discussion_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/reactions";
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
   * Create reaction for a team discussion (Legacy)
   */
  async reactionscreateForTeamDiscussionLegacy(params: {
    content: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/teams/{team_id}/discussions/{discussion_number}/reactions";

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
    name: "github-v3-rest-api---reactions-36",
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
    name: "reactionslistForTeamDiscussionCommentInOrg",
    description: "List reactions for a team discussion comment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to a team discussion comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForTeamDiscussionCommentInOrg",
    description: "Create reaction for a team discussion comment",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the team discussion comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionsdeleteForTeamDiscussionComment",
    description: "Delete team discussion comment reaction",
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
        reaction_id: {
          type: "string",
          description: "Path parameter: reaction_id",
        },
      },
      required: ["org", "team_slug", "discussion_number", "comment_number", "reaction_id"],
    },
  },
  {
    name: "reactionslistForTeamDiscussionInOrg",
    description: "List reactions for a team discussion",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to a team discussion.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForTeamDiscussionInOrg",
    description: "Create reaction for a team discussion",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the team discussion.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionsdeleteForTeamDiscussion",
    description: "Delete team discussion reaction",
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
        reaction_id: {
          type: "string",
          description: "Path parameter: reaction_id",
        },
      },
      required: ["org", "team_slug", "discussion_number", "reaction_id"],
    },
  },
  {
    name: "reactionslistForCommitComment",
    description: "List reactions for a commit comment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to a commit comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForCommitComment",
    description: "Create reaction for a commit comment",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the commit comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionsdeleteForCommitComment",
    description: "Delete a commit comment reaction",
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
        reaction_id: {
          type: "string",
          description: "Path parameter: reaction_id",
        },
      },
      required: ["owner", "repo", "comment_id", "reaction_id"],
    },
  },
  {
    name: "reactionslistForIssueComment",
    description: "List reactions for an issue comment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to an issue comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForIssueComment",
    description: "Create reaction for an issue comment",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the issue comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionsdeleteForIssueComment",
    description: "Delete an issue comment reaction",
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
        reaction_id: {
          type: "string",
          description: "Path parameter: reaction_id",
        },
      },
      required: ["owner", "repo", "comment_id", "reaction_id"],
    },
  },
  {
    name: "reactionslistForIssue",
    description: "List reactions for an issue",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to an issue.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForIssue",
    description: "Create reaction for an issue",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the issue.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionsdeleteForIssue",
    description: "Delete an issue reaction",
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
        reaction_id: {
          type: "string",
          description: "Path parameter: reaction_id",
        },
      },
      required: ["owner", "repo", "issue_number", "reaction_id"],
    },
  },
  {
    name: "reactionslistForPullRequestReviewComment",
    description: "List reactions for a pull request review comment",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to a pull request review comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForPullRequestReviewComment",
    description: "Create reaction for a pull request review comment",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the pull request review comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionsdeleteForPullRequestComment",
    description: "Delete a pull request comment reaction",
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
        reaction_id: {
          type: "string",
          description: "Path parameter: reaction_id",
        },
      },
      required: ["owner", "repo", "comment_id", "reaction_id"],
    },
  },
  {
    name: "reactionslistForRelease",
    description: "List reactions for a release",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to a release.",
          enum: ["+1", "laugh", "heart", "hooray", "rocket", "eyes"],
        },
        owner: {
          type: "string",
          description: "Path parameter: owner",
        },
        repo: {
          type: "string",
          description: "Path parameter: repo",
        },
        release_id: {
          type: "string",
          description: "Path parameter: release_id",
        },
      },
      required: ["owner", "repo", "release_id"],
    },
  },
  {
    name: "reactionscreateForRelease",
    description: "Create reaction for a release",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the release.",
          enum: ["+1", "laugh", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionsdeleteForRelease",
    description: "Delete a release reaction",
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
        release_id: {
          type: "string",
          description: "Path parameter: release_id",
        },
        reaction_id: {
          type: "string",
          description: "Path parameter: reaction_id",
        },
      },
      required: ["owner", "repo", "release_id", "reaction_id"],
    },
  },
  {
    name: "reactionslistForTeamDiscussionCommentLegacy",
    description: "List reactions for a team discussion comment (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to a team discussion comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForTeamDiscussionCommentLegacy",
    description: "Create reaction for a team discussion comment (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the team discussion comment.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
    },
  },
  {
    name: "reactionslistForTeamDiscussionLegacy",
    description: "List reactions for a team discussion (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        content: {
          type: "string",
          description: "Returns a single [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions). Omit this parameter to list all reactions to a team discussion.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
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
    name: "reactionscreateForTeamDiscussionLegacy",
    description: "Create reaction for a team discussion (Legacy)",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The [reaction type](https://docs.github.com/rest/reactions/reactions#about-reactions) to add to the team discussion.",
          enum: ["+1", "-1", "laugh", "confused", "heart", "hooray", "rocket", "eyes"],
        },
      },
      required: ["content"],
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
  const client = new GitHubv3RESTAPIreactionsClient(accessToken);

  try {
    switch (name) {
      case "reactionslistForTeamDiscussionCommentInOrg": {
        const result = await client.reactionslistForTeamDiscussionCommentInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForTeamDiscussionCommentInOrg": {
        const result = await client.reactionscreateForTeamDiscussionCommentInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionsdeleteForTeamDiscussionComment": {
        const result = await client.reactionsdeleteForTeamDiscussionComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForTeamDiscussionInOrg": {
        const result = await client.reactionslistForTeamDiscussionInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForTeamDiscussionInOrg": {
        const result = await client.reactionscreateForTeamDiscussionInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionsdeleteForTeamDiscussion": {
        const result = await client.reactionsdeleteForTeamDiscussion(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForCommitComment": {
        const result = await client.reactionslistForCommitComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForCommitComment": {
        const result = await client.reactionscreateForCommitComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionsdeleteForCommitComment": {
        const result = await client.reactionsdeleteForCommitComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForIssueComment": {
        const result = await client.reactionslistForIssueComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForIssueComment": {
        const result = await client.reactionscreateForIssueComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionsdeleteForIssueComment": {
        const result = await client.reactionsdeleteForIssueComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForIssue": {
        const result = await client.reactionslistForIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForIssue": {
        const result = await client.reactionscreateForIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionsdeleteForIssue": {
        const result = await client.reactionsdeleteForIssue(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForPullRequestReviewComment": {
        const result = await client.reactionslistForPullRequestReviewComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForPullRequestReviewComment": {
        const result = await client.reactionscreateForPullRequestReviewComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionsdeleteForPullRequestComment": {
        const result = await client.reactionsdeleteForPullRequestComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForRelease": {
        const result = await client.reactionslistForRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForRelease": {
        const result = await client.reactionscreateForRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionsdeleteForRelease": {
        const result = await client.reactionsdeleteForRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForTeamDiscussionCommentLegacy": {
        const result = await client.reactionslistForTeamDiscussionCommentLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForTeamDiscussionCommentLegacy": {
        const result = await client.reactionscreateForTeamDiscussionCommentLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionslistForTeamDiscussionLegacy": {
        const result = await client.reactionslistForTeamDiscussionLegacy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reactionscreateForTeamDiscussionLegacy": {
        const result = await client.reactionscreateForTeamDiscussionLegacy(args as any);
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
  console.error("GitHub v3 REST API - reactions MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
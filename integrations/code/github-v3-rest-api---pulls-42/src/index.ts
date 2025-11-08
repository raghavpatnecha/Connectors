/**
 * MCP Server: GitHub v3 REST API - pulls
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
class GitHubv3RESTAPIpullsClient {
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
   * List pull requests
   */
  async pullslist(params: {
    None?: string;
    state?: string;
    head?: string;
    base?: string;
    sort?: string;
    direction?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls";
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
   * Create a pull request
   */
  async pullscreate(params: {
    title?: string;
    head: string;
    head_repo?: string;
    base: string;
    body?: string;
    maintainer_can_modify?: boolean;
    draft?: boolean;
    issue?: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List review comments in a repository
   */
  async pullslistReviewCommentsForRepo(params: {
    None?: string;
    sort?: string;
    direction?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/comments";
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
   * Get a review comment for a pull request
   */
  async pullsgetReviewComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/comments/{comment_id}";
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
   * Update a review comment for a pull request
   */
  async pullsupdateReviewComment(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/comments/{comment_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a review comment for a pull request
   */
  async pullsdeleteReviewComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/comments/{comment_id}";
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
   * Get a pull request
   */
  async pullsget(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a pull request
   */
  async pullsupdate(params: {
    title?: string;
    body?: string;
    state?: string;
    base?: string;
    maintainer_can_modify?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List review comments on a pull request
   */
  async pullslistReviewComments(params: {
    None?: string;
    direction?: string;
    owner: string;
    repo: string;
    pull_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/comments";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a review comment for a pull request
   */
  async pullscreateReviewComment(params: {
    body: string;
    commit_id: string;
    path: string;
    position?: integer;
    side?: string;
    line?: integer;
    start_line?: integer;
    start_side?: string;
    in_reply_to?: integer;
    subject_type?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/comments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Create a reply for a review comment
   */
  async pullscreateReplyForReviewComment(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List commits on a pull request
   */
  async pullslistCommits(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/commits";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List pull requests files
   */
  async pullslistFiles(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/files";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if a pull request has been merged
   */
  async pullscheckIfMerged(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/merge";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Merge a pull request
   */
  async pullsmerge(params: {
    commit_title?: string;
    commit_message?: string;
    sha?: string;
    merge_method?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/merge";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get all requested reviewers for a pull request
   */
  async pullslistRequestedReviewers(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Request reviewers for a pull request
   */
  async pullsrequestReviewers(params: {
    reviewers?: array;
    team_reviewers?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove requested reviewers from a pull request
   */
  async pullsremoveRequestedReviewers(params: {
    reviewers: array;
    team_reviewers?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List reviews for a pull request
   */
  async pullslistReviews(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a review for a pull request
   */
  async pullscreateReview(params: {
    commit_id?: string;
    body?: string;
    event?: string;
    comments?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a review for a pull request
   */
  async pullsgetReview(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
    review_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));
    path = path.replace("{{ review_id }}}", String(params.review_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a review for a pull request
   */
  async pullsupdateReview(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a pending review for a pull request
   */
  async pullsdeletePendingReview(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
    review_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));
    path = path.replace("{{ review_id }}}", String(params.review_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List comments for a pull request review
   */
  async pullslistCommentsForReview(params: {
    None?: string;
    owner: string;
    repo: string;
    pull_number: string;
    review_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pull_number }}}", String(params.pull_number));
    path = path.replace("{{ review_id }}}", String(params.review_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Dismiss a review for a pull request
   */
  async pullsdismissReview(params: {
    message: string;
    event?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Submit a review for a pull request
   */
  async pullssubmitReview(params: {
    body?: string;
    event: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Update a pull request branch
   */
  async pullsupdateBranch(params: {
    expected_head_sha?: string;
  }): Promise<{
  message?: string;
  url?: string;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pulls/{pull_number}/update-branch";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
}

// MCP Server
const server = new Server(
  {
    name: "github-v3-rest-api---pulls-42",
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
    name: "pullslist",
    description: "List pull requests",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        state: {
          type: "string",
          description: "Either `open`, `closed`, or `all` to filter by state.",
          enum: ["open", "closed", "all"],
        },
        head: {
          type: "string",
          description: "Filter pulls by head user or head organization and branch name in the format of `user:ref-name` or `organization:ref-name`. For example: `github:new-script-format` or `octocat:test-branch`.",
        },
        base: {
          type: "string",
          description: "Filter pulls by base branch name. Example: `gh-pages`.",
        },
        sort: {
          type: "string",
          description: "What to sort results by. `popularity` will sort by the number of comments. `long-running` will sort by date created and will limit the results to pull requests that have been open for more than a month and have had activity within the past month.",
          enum: ["created", "updated", "popularity", "long-running"],
        },
        direction: {
          type: "string",
          description: "The direction of the sort. Default: `desc` when sort is `created` or sort is not specified, otherwise `asc`.",
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
    name: "pullscreate",
    description: "Create a pull request",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the new pull request. Required unless `issue` is specified.",
        },
        head: {
          type: "string",
          description: "The name of the branch where your changes are implemented. For cross-repository pull requests in the same network, namespace `head` with a user like this: `username:branch`.",
        },
        head_repo: {
          type: "string",
          description: "The name of the repository where the changes in the pull request were made. This field is required for cross-repository pull requests if both repositories are owned by the same organization.",
        },
        base: {
          type: "string",
          description: "The name of the branch you want the changes pulled into. This should be an existing branch on the current repository. You cannot submit a pull request to one repository that requests a merge to a base of another repository.",
        },
        body: {
          type: "string",
          description: "The contents of the pull request.",
        },
        maintainer_can_modify: {
          type: "boolean",
          description: "Indicates whether [maintainers can modify](https://docs.github.com/articles/allowing-changes-to-a-pull-request-branch-created-from-a-fork/) the pull request.",
        },
        draft: {
          type: "boolean",
          description: "Indicates whether the pull request is a draft. See "[Draft Pull Requests](https://docs.github.com/articles/about-pull-requests#draft-pull-requests)" in the GitHub Help documentation to learn more.",
        },
        issue: {
          type: "integer",
          description: "An issue in the repository to convert to a pull request. The issue title, body, and comments will become the title, body, and comments on the new pull request. Required unless `title` is specified.",
        },
      },
      required: ["head", "base"],
    },
  },
  {
    name: "pullslistReviewCommentsForRepo",
    description: "List review comments in a repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sort: {
          type: "string",
          description: "",
          enum: ["created", "updated", "created_at"],
        },
        direction: {
          type: "string",
          description: "The direction to sort results. Ignored without `sort` parameter.",
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
    name: "pullsgetReviewComment",
    description: "Get a review comment for a pull request",
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
    name: "pullsupdateReviewComment",
    description: "Update a review comment for a pull request",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The text of the reply to the review comment.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "pullsdeleteReviewComment",
    description: "Delete a review comment for a pull request",
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
    name: "pullsget",
    description: "Get a pull request",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "pullsupdate",
    description: "Update a pull request",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the pull request.",
        },
        body: {
          type: "string",
          description: "The contents of the pull request.",
        },
        state: {
          type: "string",
          description: "State of this Pull Request. Either `open` or `closed`.",
          enum: ["open", "closed"],
        },
        base: {
          type: "string",
          description: "The name of the branch you want your changes pulled into. This should be an existing branch on the current repository. You cannot update the base branch on a pull request to point to another repository.",
        },
        maintainer_can_modify: {
          type: "boolean",
          description: "Indicates whether [maintainers can modify](https://docs.github.com/articles/allowing-changes-to-a-pull-request-branch-created-from-a-fork/) the pull request.",
        },
      },
      required: [],
    },
  },
  {
    name: "pullslistReviewComments",
    description: "List review comments on a pull request",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        direction: {
          type: "string",
          description: "The direction to sort results. Ignored without `sort` parameter.",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "pullscreateReviewComment",
    description: "Create a review comment for a pull request",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The text of the review comment.",
        },
        commit_id: {
          type: "string",
          description: "The SHA of the commit needing a comment. Not using the latest commit SHA may render your comment outdated if a subsequent commit modifies the line you specify as the `position`.",
        },
        path: {
          type: "string",
          description: "The relative path to the file that necessitates a comment.",
        },
        position: {
          type: "integer",
          description: "**This parameter is closing down. Use `line` instead**. The position in the diff where you want to add a review comment. Note this value is not the same as the line number in the file. The position value equals the number of lines down from the first "@@" hunk header in the file you want to add a comment. The line just below the "@@" line is position 1, the next line is position 2, and so on. The position in the diff continues to increase through lines of whitespace and additional hunks until the beginning of a new file.",
        },
        side: {
          type: "string",
          description: "In a split diff view, the side of the diff that the pull request's changes appear on. Can be `LEFT` or `RIGHT`. Use `LEFT` for deletions that appear in red. Use `RIGHT` for additions that appear in green or unchanged lines that appear in white and are shown for context. For a multi-line comment, side represents whether the last line of the comment range is a deletion or addition. For more information, see "[Diff view options](https://docs.github.com/articles/about-comparing-branches-in-pull-requests#diff-view-options)" in the GitHub Help documentation.",
          enum: ["LEFT", "RIGHT"],
        },
        line: {
          type: "integer",
          description: "**Required unless using `subject_type:file`**. The line of the blob in the pull request diff that the comment applies to. For a multi-line comment, the last line of the range that your comment applies to.",
        },
        start_line: {
          type: "integer",
          description: "**Required when using multi-line comments unless using `in_reply_to`**. The `start_line` is the first line in the pull request diff that your multi-line comment applies to. To learn more about multi-line comments, see "[Commenting on a pull request](https://docs.github.com/articles/commenting-on-a-pull-request#adding-line-comments-to-a-pull-request)" in the GitHub Help documentation.",
        },
        start_side: {
          type: "string",
          description: "**Required when using multi-line comments unless using `in_reply_to`**. The `start_side` is the starting side of the diff that the comment applies to. Can be `LEFT` or `RIGHT`. To learn more about multi-line comments, see "[Commenting on a pull request](https://docs.github.com/articles/commenting-on-a-pull-request#adding-line-comments-to-a-pull-request)" in the GitHub Help documentation. See `side` in this table for additional context.",
          enum: ["LEFT", "RIGHT", "side"],
        },
        in_reply_to: {
          type: "integer",
          description: "The ID of the review comment to reply to. To find the ID of a review comment with ["List review comments on a pull request"](#list-review-comments-on-a-pull-request). When specified, all parameters other than `body` in the request body are ignored.",
        },
        subject_type: {
          type: "string",
          description: "The level at which the comment is targeted.",
          enum: ["line", "file"],
        },
      },
      required: ["body", "commit_id", "path"],
    },
  },
  {
    name: "pullscreateReplyForReviewComment",
    description: "Create a reply for a review comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The text of the review comment.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "pullslistCommits",
    description: "List commits on a pull request",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "pullslistFiles",
    description: "List pull requests files",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "pullscheckIfMerged",
    description: "Check if a pull request has been merged",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "pullsmerge",
    description: "Merge a pull request",
    inputSchema: {
      type: "object",
      properties: {
        commit_title: {
          type: "string",
          description: "Title for the automatic commit message.",
        },
        commit_message: {
          type: "string",
          description: "Extra detail to append to automatic commit message.",
        },
        sha: {
          type: "string",
          description: "SHA that pull request head must match to allow merge.",
        },
        merge_method: {
          type: "string",
          description: "The merge method to use.",
          enum: ["merge", "squash", "rebase"],
        },
      },
      required: [],
    },
  },
  {
    name: "pullslistRequestedReviewers",
    description: "Get all requested reviewers for a pull request",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "pullsrequestReviewers",
    description: "Request reviewers for a pull request",
    inputSchema: {
      type: "object",
      properties: {
        reviewers: {
          type: "array",
          description: "An array of user `login`s that will be requested.",
        },
        team_reviewers: {
          type: "array",
          description: "An array of team `slug`s that will be requested.",
        },
      },
      required: [],
    },
  },
  {
    name: "pullsremoveRequestedReviewers",
    description: "Remove requested reviewers from a pull request",
    inputSchema: {
      type: "object",
      properties: {
        reviewers: {
          type: "array",
          description: "An array of user `login`s that will be removed.",
        },
        team_reviewers: {
          type: "array",
          description: "An array of team `slug`s that will be removed.",
        },
      },
      required: ["reviewers"],
    },
  },
  {
    name: "pullslistReviews",
    description: "List reviews for a pull request",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
      },
      required: ["owner", "repo", "pull_number"],
    },
  },
  {
    name: "pullscreateReview",
    description: "Create a review for a pull request",
    inputSchema: {
      type: "object",
      properties: {
        commit_id: {
          type: "string",
          description: "The SHA of the commit that needs a review. Not using the latest commit SHA may render your review comment outdated if a subsequent commit modifies the line you specify as the `position`. Defaults to the most recent commit in the pull request when you do not specify a value.",
        },
        body: {
          type: "string",
          description: "**Required** when using `REQUEST_CHANGES` or `COMMENT` for the `event` parameter. The body text of the pull request review.",
        },
        event: {
          type: "string",
          description: "The review action you want to perform. The review actions include: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`. By leaving this blank, you set the review action state to `PENDING`, which means you will need to [submit the pull request review](https://docs.github.com/rest/pulls/reviews#submit-a-review-for-a-pull-request) when you are ready.",
          enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
        },
        comments: {
          type: "array",
          description: "Use the following table to specify the location, destination, and contents of the draft review comment.",
        },
      },
      required: [],
    },
  },
  {
    name: "pullsgetReview",
    description: "Get a review for a pull request",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
        review_id: {
          type: "string",
          description: "Path parameter: review_id",
        },
      },
      required: ["owner", "repo", "pull_number", "review_id"],
    },
  },
  {
    name: "pullsupdateReview",
    description: "Update a review for a pull request",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The body text of the pull request review.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "pullsdeletePendingReview",
    description: "Delete a pending review for a pull request",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
        review_id: {
          type: "string",
          description: "Path parameter: review_id",
        },
      },
      required: ["owner", "repo", "pull_number", "review_id"],
    },
  },
  {
    name: "pullslistCommentsForReview",
    description: "List comments for a pull request review",
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
        pull_number: {
          type: "string",
          description: "Path parameter: pull_number",
        },
        review_id: {
          type: "string",
          description: "Path parameter: review_id",
        },
      },
      required: ["owner", "repo", "pull_number", "review_id"],
    },
  },
  {
    name: "pullsdismissReview",
    description: "Dismiss a review for a pull request",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message for the pull request review dismissal",
        },
        event: {
          type: "string",
          description: "",
          enum: ["DISMISS"],
        },
      },
      required: ["message"],
    },
  },
  {
    name: "pullssubmitReview",
    description: "Submit a review for a pull request",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The body text of the pull request review",
        },
        event: {
          type: "string",
          description: "The review action you want to perform. The review actions include: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`. When you leave this blank, the API returns _HTTP 422 (Unrecognizable entity)_ and sets the review action state to `PENDING`, which means you will need to re-submit the pull request review using a review action.",
          enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
        },
      },
      required: ["event"],
    },
  },
  {
    name: "pullsupdateBranch",
    description: "Update a pull request branch",
    inputSchema: {
      type: "object",
      properties: {
        expected_head_sha: {
          type: "string",
          description: "The expected SHA of the pull request's HEAD ref. This is the most recent commit on the pull request's branch. If the expected SHA does not match the pull request's HEAD, you will receive a `422 Unprocessable Entity` status. You can use the "[List commits](https://docs.github.com/rest/commits/commits#list-commits)" endpoint to find the most recent commit SHA. Default: SHA of the pull request's current HEAD ref.",
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
  const client = new GitHubv3RESTAPIpullsClient(accessToken);

  try {
    switch (name) {
      case "pullslist": {
        const result = await client.pullslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullscreate": {
        const result = await client.pullscreate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullslistReviewCommentsForRepo": {
        const result = await client.pullslistReviewCommentsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsgetReviewComment": {
        const result = await client.pullsgetReviewComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsupdateReviewComment": {
        const result = await client.pullsupdateReviewComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsdeleteReviewComment": {
        const result = await client.pullsdeleteReviewComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsget": {
        const result = await client.pullsget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsupdate": {
        const result = await client.pullsupdate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullslistReviewComments": {
        const result = await client.pullslistReviewComments(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullscreateReviewComment": {
        const result = await client.pullscreateReviewComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullscreateReplyForReviewComment": {
        const result = await client.pullscreateReplyForReviewComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullslistCommits": {
        const result = await client.pullslistCommits(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullslistFiles": {
        const result = await client.pullslistFiles(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullscheckIfMerged": {
        const result = await client.pullscheckIfMerged(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsmerge": {
        const result = await client.pullsmerge(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullslistRequestedReviewers": {
        const result = await client.pullslistRequestedReviewers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsrequestReviewers": {
        const result = await client.pullsrequestReviewers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsremoveRequestedReviewers": {
        const result = await client.pullsremoveRequestedReviewers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullslistReviews": {
        const result = await client.pullslistReviews(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullscreateReview": {
        const result = await client.pullscreateReview(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsgetReview": {
        const result = await client.pullsgetReview(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsupdateReview": {
        const result = await client.pullsupdateReview(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsdeletePendingReview": {
        const result = await client.pullsdeletePendingReview(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullslistCommentsForReview": {
        const result = await client.pullslistCommentsForReview(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsdismissReview": {
        const result = await client.pullsdismissReview(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullssubmitReview": {
        const result = await client.pullssubmitReview(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "pullsupdateBranch": {
        const result = await client.pullsupdateBranch(args as any);
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
  console.error("GitHub v3 REST API - pulls MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
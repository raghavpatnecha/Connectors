/**
 * MCP Server: GitHub v3 REST API - repos
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
class GitHubv3RESTAPIreposClient {
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
   * List organization repositories
   */
  async reposlistForOrg(params: {
    None?: string;
    type?: string;
    sort?: string;
    direction?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/repos";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an organization repository
   */
  async reposcreateInOrg(params: {
    name: string;
    description?: string;
    homepage?: string;
    private?: boolean;
    visibility?: string;
    has_issues?: boolean;
    has_projects?: boolean;
    has_wiki?: boolean;
    has_downloads?: boolean;
    is_template?: boolean;
    team_id?: integer;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
    allow_squash_merge?: boolean;
    allow_merge_commit?: boolean;
    allow_rebase_merge?: boolean;
    allow_auto_merge?: boolean;
    delete_branch_on_merge?: boolean;
    use_squash_pr_title_as_default?: boolean;
    squash_merge_commit_title?: string;
    squash_merge_commit_message?: string;
    merge_commit_title?: string;
    merge_commit_message?: string;
    custom_properties?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/repos";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get all organization repository rulesets
   */
  async reposgetOrgRulesets(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an organization repository ruleset
   */
  async reposcreateOrgRuleset(params: {
    name: string;
    target?: string;
    enforcement: ;
    bypass_actors?: array;
    conditions?: ;
    rules?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List organization rule suites
   */
  async reposgetOrgRuleSuites(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets/rule-suites";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization rule suite
   */
  async reposgetOrgRuleSuite(params: {
    None?: string;
    org: string;
    rule_suite_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets/rule-suites/{rule_suite_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ rule_suite_id }}}", String(params.rule_suite_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization repository ruleset
   */
  async reposgetOrgRuleset(params: {
    None?: string;
    ruleset_id: integer;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets/{ruleset_id}";
    path = path.replace("{{ ruleset_id }}}", String(params.ruleset_id));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an organization repository ruleset
   */
  async reposupdateOrgRuleset(params: {
    name?: string;
    target?: string;
    enforcement?: ;
    bypass_actors?: array;
    conditions?: ;
    rules?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets/{ruleset_id}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an organization repository ruleset
   */
  async reposdeleteOrgRuleset(params: {
    None?: string;
    ruleset_id: integer;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets/{ruleset_id}";
    path = path.replace("{{ ruleset_id }}}", String(params.ruleset_id));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a repository
   */
  async reposget(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}";
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
   * Update a repository
   */
  async reposupdate(params: {
    name?: string;
    description?: string;
    homepage?: string;
    private?: boolean;
    visibility?: string;
    security_and_analysis?: any;
    has_issues?: boolean;
    has_projects?: boolean;
    has_wiki?: boolean;
    is_template?: boolean;
    default_branch?: string;
    allow_squash_merge?: boolean;
    allow_merge_commit?: boolean;
    allow_rebase_merge?: boolean;
    allow_auto_merge?: boolean;
    delete_branch_on_merge?: boolean;
    allow_update_branch?: boolean;
    use_squash_pr_title_as_default?: boolean;
    squash_merge_commit_title?: string;
    squash_merge_commit_message?: string;
    merge_commit_title?: string;
    merge_commit_message?: string;
    archived?: boolean;
    allow_forking?: boolean;
    web_commit_signoff_required?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository
   */
  async reposdelete(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}";
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
   * List repository activities
   */
  async reposlistActivities(params: {
    None?: string;
    ref?: string;
    actor?: string;
    time_period?: string;
    activity_type?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/activity";
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
   * Create an attestation
   */
  async reposcreateAttestation(params: {
    bundle: any;
  }): Promise<{
  id?: number;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/attestations";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List attestations
   */
  async reposlistAttestations(params: {
    None?: string;
    subject_digest: string;
    predicate_type?: string;
    owner: string;
    repo: string;
  }): Promise<{
  attestations?: Array<{
    bundle?: {
      mediaType?: string;
      verificationMaterial?: Record<string, any>;
      dsseEnvelope?: Record<string, any>;
    };
    repository_id?: number;
    bundle_url?: string;
    initiator?: string;
  }>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/attestations/{subject_digest}";
    path = path.replace("{{ subject_digest }}}", String(params.subject_digest));
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
   * Get all autolinks of a repository
   */
  async reposlistAutolinks(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/autolinks";
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
   * Create an autolink reference for a repository
   */
  async reposcreateAutolink(params: {
    key_prefix: string;
    url_template: string;
    is_alphanumeric?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/autolinks";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an autolink reference of a repository
   */
  async reposgetAutolink(params: {
    None?: string;
    owner: string;
    repo: string;
    autolink_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/autolinks/{autolink_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ autolink_id }}}", String(params.autolink_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete an autolink reference from a repository
   */
  async reposdeleteAutolink(params: {
    None?: string;
    owner: string;
    repo: string;
    autolink_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/autolinks/{autolink_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ autolink_id }}}", String(params.autolink_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if Dependabot security updates are enabled for a repository
   */
  async reposcheckAutomatedSecurityFixes(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/automated-security-fixes";
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
   * Enable Dependabot security updates
   */
  async reposenableAutomatedSecurityFixes(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/automated-security-fixes";
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
   * Disable Dependabot security updates
   */
  async reposdisableAutomatedSecurityFixes(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/automated-security-fixes";
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
   * List branches
   */
  async reposlistBranches(params: {
    None?: string;
    protected?: boolean;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches";
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
   * Get a branch
   */
  async reposgetBranch(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get branch protection
   */
  async reposgetBranchProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update branch protection
   */
  async reposupdateBranchProtection(params: {
    required_status_checks: any;
    enforce_admins: boolean;
    required_pull_request_reviews: any;
    restrictions: any;
    required_linear_history?: boolean;
    allow_force_pushes?: boolean;
    allow_deletions?: boolean;
    block_creations?: boolean;
    required_conversation_resolution?: boolean;
    lock_branch?: boolean;
    allow_fork_syncing?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete branch protection
   */
  async reposdeleteBranchProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get admin branch protection
   */
  async reposgetAdminBranchProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set admin branch protection
   */
  async repossetAdminBranchProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete admin branch protection
   */
  async reposdeleteAdminBranchProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get pull request review protection
   */
  async reposgetPullRequestReviewProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update pull request review protection
   */
  async reposupdatePullRequestReviewProtection(params: {
    dismissal_restrictions?: any;
    dismiss_stale_reviews?: boolean;
    require_code_owner_reviews?: boolean;
    required_approving_review_count?: integer;
    require_last_push_approval?: boolean;
    bypass_pull_request_allowances?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete pull request review protection
   */
  async reposdeletePullRequestReviewProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get commit signature protection
   */
  async reposgetCommitSignatureProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_signatures";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create commit signature protection
   */
  async reposcreateCommitSignatureProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_signatures";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete commit signature protection
   */
  async reposdeleteCommitSignatureProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_signatures";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get status checks protection
   */
  async reposgetStatusChecksProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update status check protection
   */
  async reposupdateStatusCheckProtection(params: {
    strict?: boolean;
    contexts?: array;
    checks?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove status check protection
   */
  async reposremoveStatusCheckProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get all status check contexts
   */
  async reposgetAllStatusCheckContexts(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<string>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add status check contexts
   */
  async reposaddStatusCheckContexts(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<string>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set status check contexts
   */
  async repossetStatusCheckContexts(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<string>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove status check contexts
   */
  async reposremoveStatusCheckContexts(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<string>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get access restrictions
   */
  async reposgetAccessRestrictions(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete access restrictions
   */
  async reposdeleteAccessRestrictions(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get apps with access to the protected branch
   */
  async reposgetAppsWithAccessToProtectedBranch(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add app access restrictions
   */
  async reposaddAppAccessRestrictions(params: {
    apps: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set app access restrictions
   */
  async repossetAppAccessRestrictions(params: {
    apps: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove app access restrictions
   */
  async reposremoveAppAccessRestrictions(params: {
    apps: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get teams with access to the protected branch
   */
  async reposgetTeamsWithAccessToProtectedBranch(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add team access restrictions
   */
  async reposaddTeamAccessRestrictions(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set team access restrictions
   */
  async repossetTeamAccessRestrictions(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove team access restrictions
   */
  async reposremoveTeamAccessRestrictions(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get users with access to the protected branch
   */
  async reposgetUsersWithAccessToProtectedBranch(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add user access restrictions
   */
  async reposaddUserAccessRestrictions(params: {
    users: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Set user access restrictions
   */
  async repossetUserAccessRestrictions(params: {
    users: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove user access restrictions
   */
  async reposremoveUserAccessRestrictions(params: {
    users: array;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Rename a branch
   */
  async reposrenameBranch(params: {
    new_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/branches/{branch}/rename";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List CODEOWNERS errors
   */
  async reposcodeownersErrors(params: {
    None?: string;
    ref?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/codeowners/errors";
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
   * List repository collaborators
   */
  async reposlistCollaborators(params: {
    None?: string;
    affiliation?: string;
    permission?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/collaborators";
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
   * Check if a user is a repository collaborator
   */
  async reposcheckCollaborator(params: {
    None?: string;
    owner: string;
    repo: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/collaborators/{username}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add a repository collaborator
   */
  async reposaddCollaborator(params: {
    permission?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/collaborators/{username}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a repository collaborator
   */
  async reposremoveCollaborator(params: {
    None?: string;
    owner: string;
    repo: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/collaborators/{username}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get repository permissions for a user
   */
  async reposgetCollaboratorPermissionLevel(params: {
    None?: string;
    owner: string;
    repo: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/collaborators/{username}/permission";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List commit comments for a repository
   */
  async reposlistCommitCommentsForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/comments";
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
   * Get a commit comment
   */
  async reposgetCommitComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/comments/{comment_id}";
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
   * Update a commit comment
   */
  async reposupdateCommitComment(params: {
    body: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/comments/{comment_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a commit comment
   */
  async reposdeleteCommitComment(params: {
    None?: string;
    owner: string;
    repo: string;
    comment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/comments/{comment_id}";
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
   * List commits
   */
  async reposlistCommits(params: {
    None?: string;
    sha?: string;
    path?: string;
    author?: string;
    committer?: string;
    since?: string;
    until?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits";
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
   * List branches for HEAD commit
   */
  async reposlistBranchesForHeadCommit(params: {
    None?: string;
    owner: string;
    repo: string;
    commit_sha: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ commit_sha }}}", String(params.commit_sha));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List commit comments
   */
  async reposlistCommentsForCommit(params: {
    None?: string;
    owner: string;
    repo: string;
    commit_sha: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{commit_sha}/comments";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ commit_sha }}}", String(params.commit_sha));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a commit comment
   */
  async reposcreateCommitComment(params: {
    body: string;
    path?: string;
    position?: integer;
    line?: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{commit_sha}/comments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List pull requests associated with a commit
   */
  async reposlistPullRequestsAssociatedWithCommit(params: {
    None?: string;
    owner: string;
    repo: string;
    commit_sha: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{commit_sha}/pulls";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ commit_sha }}}", String(params.commit_sha));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a commit
   */
  async reposgetCommit(params: {
    None?: string;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{ref}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ref }}}", String(params.ref));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get the combined status for a specific reference
   */
  async reposgetCombinedStatusForRef(params: {
    None?: string;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{ref}/status";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ref }}}", String(params.ref));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List commit statuses for a reference
   */
  async reposlistCommitStatusesForRef(params: {
    None?: string;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/commits/{ref}/statuses";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ref }}}", String(params.ref));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get community profile metrics
   */
  async reposgetCommunityProfileMetrics(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/community/profile";
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
   * Compare two commits
   */
  async reposcompareCommits(params: {
    None?: string;
    basehead: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/compare/{basehead}";
    path = path.replace("{{ basehead }}}", String(params.basehead));
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
   * Get repository content
   */
  async reposgetContent(params: {
    None?: string;
    path: string;
    ref?: string;
    owner: string;
    repo: string;
  }): Promise<any | any | any | any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/contents/{path}";
    path = path.replace("{{ path }}}", String(params.path));
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
   * Create or update file contents
   */
  async reposcreateOrUpdateFileContents(params: {
    message: string;
    content: string;
    sha?: string;
    branch?: string;
    committer?: any;
    author?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/contents/{path}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a file
   */
  async reposdeleteFile(params: {
    message: string;
    sha: string;
    branch?: string;
    committer?: any;
    author?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/contents/{path}";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repository contributors
   */
  async reposlistContributors(params: {
    None?: string;
    anon?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/contributors";
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
   * List deployments
   */
  async reposlistDeployments(params: {
    None?: string;
    sha?: string;
    ref?: string;
    task?: string;
    environment?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/deployments";
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
   * Create a deployment
   */
  async reposcreateDeployment(params: {
    ref: string;
    task?: string;
    auto_merge?: boolean;
    required_contexts?: array;
    payload?: ;
    environment?: string;
    description?: string;
    transient_environment?: boolean;
    production_environment?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/deployments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a deployment
   */
  async reposgetDeployment(params: {
    None?: string;
    owner: string;
    repo: string;
    deployment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/deployments/{deployment_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ deployment_id }}}", String(params.deployment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a deployment
   */
  async reposdeleteDeployment(params: {
    None?: string;
    owner: string;
    repo: string;
    deployment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/deployments/{deployment_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ deployment_id }}}", String(params.deployment_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List deployment statuses
   */
  async reposlistDeploymentStatuses(params: {
    None?: string;
    owner: string;
    repo: string;
    deployment_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/deployments/{deployment_id}/statuses";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ deployment_id }}}", String(params.deployment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a deployment status
   */
  async reposcreateDeploymentStatus(params: {
    state: string;
    target_url?: string;
    log_url?: string;
    description?: string;
    environment?: string;
    environment_url?: string;
    auto_inactive?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/deployments/{deployment_id}/statuses";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a deployment status
   */
  async reposgetDeploymentStatus(params: {
    None?: string;
    status_id: integer;
    owner: string;
    repo: string;
    deployment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}";
    path = path.replace("{{ status_id }}}", String(params.status_id));
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ deployment_id }}}", String(params.deployment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a repository dispatch event
   */
  async reposcreateDispatchEvent(params: {
    event_type: string;
    client_payload?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/dispatches";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List environments
   */
  async reposgetAllEnvironments(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  total_count?: number;
  environments?: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments";
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
   * Get an environment
   */
  async reposgetEnvironment(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}";
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
   * Create or update an environment
   */
  async reposcreateOrUpdateEnvironment(params: {
    wait_timer?: ;
    prevent_self_review?: ;
    reviewers?: array;
    deployment_branch_policy?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an environment
   */
  async reposdeleteAnEnvironment(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List deployment branch policies
   */
  async reposlistDeploymentBranchPolicies(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<{
  total_count: number;
  branch_policies: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies";
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
   * Create a deployment branch policy
   */
  async reposcreateDeploymentBranchPolicy(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a deployment branch policy
   */
  async reposgetDeploymentBranchPolicy(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    branch_policy_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ branch_policy_id }}}", String(params.branch_policy_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a deployment branch policy
   */
  async reposupdateDeploymentBranchPolicy(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    branch_policy_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ branch_policy_id }}}", String(params.branch_policy_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a deployment branch policy
   */
  async reposdeleteDeploymentBranchPolicy(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    branch_policy_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ branch_policy_id }}}", String(params.branch_policy_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get all deployment protection rules for an environment
   */
  async reposgetAllDeploymentProtectionRules(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<{
  total_count?: number;
  custom_deployment_protection_rules?: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules";
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
   * Create a custom deployment protection rule on an environment
   */
  async reposcreateDeploymentProtectionRule(params: {
    integration_id?: integer;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List custom deployment rule integrations available for an environment
   */
  async reposlistCustomDeploymentRuleIntegrations(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
  }): Promise<{
  total_count?: number;
  available_custom_deployment_protection_rule_integrations?: Array<any>;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps";
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
   * Get a custom deployment protection rule
   */
  async reposgetCustomDeploymentProtectionRule(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    protection_rule_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ protection_rule_id }}}", String(params.protection_rule_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Disable a custom protection rule for an environment
   */
  async reposdisableDeploymentProtectionRule(params: {
    None?: string;
    owner: string;
    repo: string;
    environment_name: string;
    protection_rule_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ environment_name }}}", String(params.environment_name));
    path = path.replace("{{ protection_rule_id }}}", String(params.protection_rule_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List forks
   */
  async reposlistForks(params: {
    None?: string;
    sort?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/forks";
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
   * Create a fork
   */
  async reposcreateFork(params: {
    organization?: string;
    name?: string;
    default_branch_only?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/forks";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repository webhooks
   */
  async reposlistWebhooks(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks";
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
   * Create a repository webhook
   */
  async reposcreateWebhook(params: {
    name?: string;
    config?: any;
    events?: array;
    active?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a repository webhook
   */
  async reposgetWebhook(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a repository webhook
   */
  async reposupdateWebhook(params: {
    config?: ;
    events?: array;
    add_events?: array;
    remove_events?: array;
    active?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository webhook
   */
  async reposdeleteWebhook(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a webhook configuration for a repository
   */
  async reposgetWebhookConfigForRepo(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}/config";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a webhook configuration for a repository
   */
  async reposupdateWebhookConfigForRepo(params: {
    url?: ;
    content_type?: ;
    secret?: ;
    insecure_ssl?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}/config";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List deliveries for a repository webhook
   */
  async reposlistWebhookDeliveries(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}/deliveries";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a delivery for a repository webhook
   */
  async reposgetWebhookDelivery(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
    delivery_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));
    path = path.replace("{{ delivery_id }}}", String(params.delivery_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Redeliver a delivery for a repository webhook
   */
  async reposredeliverWebhookDelivery(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
    delivery_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));
    path = path.replace("{{ delivery_id }}}", String(params.delivery_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Ping a repository webhook
   */
  async repospingWebhook(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}/pings";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Test the push repository webhook
   */
  async repostestPushWebhook(params: {
    None?: string;
    owner: string;
    repo: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/hooks/{hook_id}/tests";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Check if immutable releases are enabled for a repository
   */
  async reposcheckImmutableReleases(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/immutable-releases";
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
   * Enable immutable releases
   */
  async reposenableImmutableReleases(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/immutable-releases";
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
   * Disable immutable releases
   */
  async reposdisableImmutableReleases(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/immutable-releases";
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
   * List repository invitations
   */
  async reposlistInvitations(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/invitations";
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
   * Update a repository invitation
   */
  async reposupdateInvitation(params: {
    permissions?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/invitations/{invitation_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository invitation
   */
  async reposdeleteInvitation(params: {
    None?: string;
    owner: string;
    repo: string;
    invitation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/invitations/{invitation_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ invitation_id }}}", String(params.invitation_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List deploy keys
   */
  async reposlistDeployKeys(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/keys";
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
   * Create a deploy key
   */
  async reposcreateDeployKey(params: {
    title?: string;
    key: string;
    read_only?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/keys";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a deploy key
   */
  async reposgetDeployKey(params: {
    None?: string;
    owner: string;
    repo: string;
    key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/keys/{key_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ key_id }}}", String(params.key_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a deploy key
   */
  async reposdeleteDeployKey(params: {
    None?: string;
    owner: string;
    repo: string;
    key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/keys/{key_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ key_id }}}", String(params.key_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repository languages
   */
  async reposlistLanguages(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/languages";
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
   * Sync a fork branch with the upstream repository
   */
  async reposmergeUpstream(params: {
    branch: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/merge-upstream";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Merge a branch
   */
  async reposmerge(params: {
    base: string;
    head: string;
    commit_message?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/merges";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a GitHub Pages site
   */
  async reposgetPages(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages";
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
   * Create a GitHub Pages site
   */
  async reposcreatePagesSite(params: {
    build_type?: string;
    source?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Update information about a GitHub Pages site
   */
  async reposupdateInformationAboutPagesSite(params: {
    cname?: string;
    https_enforced?: boolean;
    build_type?: string;
    source?: ;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a GitHub Pages site
   */
  async reposdeletePagesSite(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages";
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
   * List GitHub Pages builds
   */
  async reposlistPagesBuilds(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/builds";
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
   * Request a GitHub Pages build
   */
  async reposrequestPagesBuild(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/builds";
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
   * Get latest Pages build
   */
  async reposgetLatestPagesBuild(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/builds/latest";
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
   * Get GitHub Pages build
   */
  async reposgetPagesBuild(params: {
    None?: string;
    build_id: integer;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/builds/{build_id}";
    path = path.replace("{{ build_id }}}", String(params.build_id));
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
   * Create a GitHub Pages deployment
   */
  async reposcreatePagesDeployment(params: {
    artifact_id?: number;
    artifact_url?: string;
    environment?: string;
    pages_build_version: string;
    oidc_token: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/deployments";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get the status of a GitHub Pages deployment
   */
  async reposgetPagesDeployment(params: {
    None?: string;
    owner: string;
    repo: string;
    pages_deployment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pages_deployment_id }}}", String(params.pages_deployment_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Cancel a GitHub Pages deployment
   */
  async reposcancelPagesDeployment(params: {
    None?: string;
    owner: string;
    repo: string;
    pages_deployment_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ pages_deployment_id }}}", String(params.pages_deployment_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a DNS health check for GitHub Pages
   */
  async reposgetPagesHealthCheck(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/pages/health";
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
   * Check if private vulnerability reporting is enabled for a repository
   */
  async reposcheckPrivateVulnerabilityReporting(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<{
  enabled: boolean;
}> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/private-vulnerability-reporting";
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
   * Enable private vulnerability reporting for a repository
   */
  async reposenablePrivateVulnerabilityReporting(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/private-vulnerability-reporting";
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
   * Disable private vulnerability reporting for a repository
   */
  async reposdisablePrivateVulnerabilityReporting(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/private-vulnerability-reporting";
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
   * Get all custom property values for a repository
   */
  async reposcustomPropertiesForReposGetRepositoryValues(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/properties/values";
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
   * Create or update custom property values for a repository
   */
  async reposcustomPropertiesForReposCreateOrUpdateReposit(params: {
    properties: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/properties/values";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a repository README
   */
  async reposgetReadme(params: {
    None?: string;
    ref?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/readme";
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
   * Get a repository README for a directory
   */
  async reposgetReadmeInDirectory(params: {
    None?: string;
    dir: string;
    ref?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/readme/{dir}";
    path = path.replace("{{ dir }}}", String(params.dir));
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
   * List releases
   */
  async reposlistReleases(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases";
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
   * Create a release
   */
  async reposcreateRelease(params: {
    tag_name: string;
    target_commitish?: string;
    name?: string;
    body?: string;
    draft?: boolean;
    prerelease?: boolean;
    discussion_category_name?: string;
    generate_release_notes?: boolean;
    make_latest?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a release asset
   */
  async reposgetReleaseAsset(params: {
    None?: string;
    owner: string;
    repo: string;
    asset_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/assets/{asset_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ asset_id }}}", String(params.asset_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a release asset
   */
  async reposupdateReleaseAsset(params: {
    name?: string;
    label?: string;
    state?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/assets/{asset_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a release asset
   */
  async reposdeleteReleaseAsset(params: {
    None?: string;
    owner: string;
    repo: string;
    asset_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/assets/{asset_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ asset_id }}}", String(params.asset_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Generate release notes content for a release
   */
  async reposgenerateReleaseNotes(params: {
    tag_name: string;
    target_commitish?: string;
    previous_tag_name?: string;
    configuration_file_path?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/generate-notes";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get the latest release
   */
  async reposgetLatestRelease(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/latest";
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
   * Get a release by tag name
   */
  async reposgetReleaseByTag(params: {
    None?: string;
    tag: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/tags/{tag}";
    path = path.replace("{{ tag }}}", String(params.tag));
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
   * Get a release
   */
  async reposgetRelease(params: {
    None?: string;
    owner: string;
    repo: string;
    release_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}";
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
   * Update a release
   */
  async reposupdateRelease(params: {
    tag_name?: string;
    target_commitish?: string;
    name?: string;
    body?: string;
    draft?: boolean;
    prerelease?: boolean;
    make_latest?: string;
    discussion_category_name?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a release
   */
  async reposdeleteRelease(params: {
    None?: string;
    owner: string;
    repo: string;
    release_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ release_id }}}", String(params.release_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List release assets
   */
  async reposlistReleaseAssets(params: {
    None?: string;
    owner: string;
    repo: string;
    release_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}/assets";
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
   * Upload a release asset
   */
  async reposuploadReleaseAsset(params: {
    None?: string;
    name: string;
    label?: string;
    owner: string;
    repo: string;
    release_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/releases/{release_id}/assets";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ release_id }}}", String(params.release_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get rules for a branch
   */
  async reposgetBranchRules(params: {
    None?: string;
    owner: string;
    repo: string;
    branch: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rules/branches/{branch}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ branch }}}", String(params.branch));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get all repository rulesets
   */
  async reposgetRepoRulesets(params: {
    None?: string;
    includes_parents?: boolean;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets";
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
   * Create a repository ruleset
   */
  async reposcreateRepoRuleset(params: {
    name: string;
    target?: string;
    enforcement: ;
    bypass_actors?: array;
    conditions?: ;
    rules?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repository rule suites
   */
  async reposgetRepoRuleSuites(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets/rule-suites";
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
   * Get a repository rule suite
   */
  async reposgetRepoRuleSuite(params: {
    None?: string;
    owner: string;
    repo: string;
    rule_suite_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ rule_suite_id }}}", String(params.rule_suite_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a repository ruleset
   */
  async reposgetRepoRuleset(params: {
    None?: string;
    ruleset_id: integer;
    includes_parents?: boolean;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets/{ruleset_id}";
    path = path.replace("{{ ruleset_id }}}", String(params.ruleset_id));
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
   * Update a repository ruleset
   */
  async reposupdateRepoRuleset(params: {
    name?: string;
    target?: string;
    enforcement?: ;
    bypass_actors?: array;
    conditions?: ;
    rules?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets/{ruleset_id}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a repository ruleset
   */
  async reposdeleteRepoRuleset(params: {
    None?: string;
    ruleset_id: integer;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets/{ruleset_id}";
    path = path.replace("{{ ruleset_id }}}", String(params.ruleset_id));
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
   * Get repository ruleset history
   */
  async reposgetRepoRulesetHistory(params: {
    None?: string;
    ruleset_id: integer;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets/{ruleset_id}/history";
    path = path.replace("{{ ruleset_id }}}", String(params.ruleset_id));
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
   * Get repository ruleset version
   */
  async reposgetRepoRulesetVersion(params: {
    None?: string;
    ruleset_id: integer;
    version_id: integer;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/rulesets/{ruleset_id}/history/{version_id}";
    path = path.replace("{{ ruleset_id }}}", String(params.ruleset_id));
    path = path.replace("{{ version_id }}}", String(params.version_id));
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
   * Get the weekly commit activity
   */
  async reposgetCodeFrequencyStats(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/stats/code_frequency";
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
   * Get the last year of commit activity
   */
  async reposgetCommitActivityStats(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/stats/commit_activity";
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
   * Get all contributor commit activity
   */
  async reposgetContributorsStats(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/stats/contributors";
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
   * Get the weekly commit count
   */
  async reposgetParticipationStats(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/stats/participation";
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
   * Get the hourly commit count for each day
   */
  async reposgetPunchCardStats(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/stats/punch_card";
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
   * Create a commit status
   */
  async reposcreateCommitStatus(params: {
    state: string;
    target_url?: string;
    description?: string;
    context?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/statuses/{sha}";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repository tags
   */
  async reposlistTags(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/tags";
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
   * Closing down - List tag protection states for a repository
   */
  async reposlistTagProtection(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/tags/protection";
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
   * Closing down - Create a tag protection state for a repository
   */
  async reposcreateTagProtection(params: {
    pattern: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/tags/protection";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Closing down - Delete a tag protection state for a repository
   */
  async reposdeleteTagProtection(params: {
    None?: string;
    owner: string;
    repo: string;
    tag_protection_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/tags/protection/{tag_protection_id}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ tag_protection_id }}}", String(params.tag_protection_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Download a repository archive (tar)
   */
  async reposdownloadTarballArchive(params: {
    None?: string;
    ref: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/tarball/{ref}";
    path = path.replace("{{ ref }}}", String(params.ref));
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
   * List repository teams
   */
  async reposlistTeams(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/teams";
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
   * Get all repository topics
   */
  async reposgetAllTopics(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/topics";
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
   * Replace all repository topics
   */
  async reposreplaceAllTopics(params: {
    names: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/topics";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get repository clones
   */
  async reposgetClones(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/traffic/clones";
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
   * Get top referral paths
   */
  async reposgetTopPaths(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/traffic/popular/paths";
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
   * Get top referral sources
   */
  async reposgetTopReferrers(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/traffic/popular/referrers";
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
   * Get page views
   */
  async reposgetViews(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/traffic/views";
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
   * Transfer a repository
   */
  async repostransfer(params: {
    new_owner: string;
    new_name?: string;
    team_ids?: array;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/transfer";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Check if vulnerability alerts are enabled for a repository
   */
  async reposcheckVulnerabilityAlerts(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/vulnerability-alerts";
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
   * Enable vulnerability alerts
   */
  async reposenableVulnerabilityAlerts(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/vulnerability-alerts";
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
   * Disable vulnerability alerts
   */
  async reposdisableVulnerabilityAlerts(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/vulnerability-alerts";
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
   * Download a repository archive (zip)
   */
  async reposdownloadZipballArchive(params: {
    None?: string;
    ref: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/zipball/{ref}";
    path = path.replace("{{ ref }}}", String(params.ref));
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
   * Create a repository using a template
   */
  async reposcreateUsingTemplate(params: {
    owner?: string;
    name: string;
    description?: string;
    include_all_branches?: boolean;
    private?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{template_owner}/{template_repo}/generate";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List public repositories
   */
  async reposlistPublic(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repositories";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories for the authenticated user
   */
  async reposlistForAuthenticatedUser(params: {
    visibility?: string;
    affiliation?: string;
    type?: string;
    sort?: string;
    direction?: string;
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/repos";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a repository for the authenticated user
   */
  async reposcreateForAuthenticatedUser(params: {
    name: string;
    description?: string;
    homepage?: string;
    private?: boolean;
    has_issues?: boolean;
    has_projects?: boolean;
    has_wiki?: boolean;
    has_discussions?: boolean;
    team_id?: integer;
    auto_init?: boolean;
    gitignore_template?: string;
    license_template?: string;
    allow_squash_merge?: boolean;
    allow_merge_commit?: boolean;
    allow_rebase_merge?: boolean;
    allow_auto_merge?: boolean;
    delete_branch_on_merge?: boolean;
    squash_merge_commit_title?: string;
    squash_merge_commit_message?: string;
    merge_commit_title?: string;
    merge_commit_message?: string;
    has_downloads?: boolean;
    is_template?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/repos";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repository invitations for the authenticated user
   */
  async reposlistInvitationsForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/repository_invitations";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Accept a repository invitation
   */
  async reposacceptInvitationForAuthenticatedUser(params: {
    None?: string;
    invitation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/repository_invitations/{invitation_id}";
    path = path.replace("{{ invitation_id }}}", String(params.invitation_id));

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Decline a repository invitation
   */
  async reposdeclineInvitationForAuthenticatedUser(params: {
    None?: string;
    invitation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/repository_invitations/{invitation_id}";
    path = path.replace("{{ invitation_id }}}", String(params.invitation_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories for a user
   */
  async reposlistForUser(params: {
    None?: string;
    type?: string;
    sort?: string;
    direction?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/repos";
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
    name: "github-v3-rest-api---repos-32",
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
    name: "reposlistForOrg",
    description: "List organization repositories",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        type: {
          type: "string",
          description: "Specifies the types of repositories you want returned.",
          enum: ["all", "public", "private", "forks", "sources", "member"],
        },
        sort: {
          type: "string",
          description: "The property to sort the results by.",
          enum: ["created", "updated", "pushed", "full_name"],
        },
        direction: {
          type: "string",
          description: "The order to sort by. Default: `asc` when using `full_name`, otherwise `desc`.",
          enum: ["asc", "desc"],
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
    name: "reposcreateInOrg",
    description: "Create an organization repository",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the repository.",
        },
        description: {
          type: "string",
          description: "A short description of the repository.",
        },
        homepage: {
          type: "string",
          description: "A URL with more information about the repository.",
        },
        private: {
          type: "boolean",
          description: "Whether the repository is private.",
        },
        visibility: {
          type: "string",
          description: "The visibility of the repository.",
          enum: ["public", "private"],
        },
        has_issues: {
          type: "boolean",
          description: "Either `true` to enable issues for this repository or `false` to disable them.",
        },
        has_projects: {
          type: "boolean",
          description: "Either `true` to enable projects for this repository or `false` to disable them. **Note:** If you're creating a repository in an organization that has disabled repository projects, the default is `false`, and if you pass `true`, the API returns an error.",
        },
        has_wiki: {
          type: "boolean",
          description: "Either `true` to enable the wiki for this repository or `false` to disable it.",
        },
        has_downloads: {
          type: "boolean",
          description: "Whether downloads are enabled.",
        },
        is_template: {
          type: "boolean",
          description: "Either `true` to make this repo available as a template repository or `false` to prevent it.",
        },
        team_id: {
          type: "integer",
          description: "The id of the team that will be granted access to this repository. This is only valid when creating a repository in an organization.",
        },
        auto_init: {
          type: "boolean",
          description: "Pass `true` to create an initial commit with empty README.",
        },
        gitignore_template: {
          type: "string",
          description: "Desired language or platform [.gitignore template](https://github.com/github/gitignore) to apply. Use the name of the template without the extension. For example, "Haskell".",
        },
        license_template: {
          type: "string",
          description: "Choose an [open source license template](https://choosealicense.com/) that best suits your needs, and then use the [license keyword](https://docs.github.com/articles/licensing-a-repository/#searching-github-by-license-type) as the `license_template` string. For example, "mit" or "mpl-2.0".",
        },
        allow_squash_merge: {
          type: "boolean",
          description: "Either `true` to allow squash-merging pull requests, or `false` to prevent squash-merging.",
        },
        allow_merge_commit: {
          type: "boolean",
          description: "Either `true` to allow merging pull requests with a merge commit, or `false` to prevent merging pull requests with merge commits.",
        },
        allow_rebase_merge: {
          type: "boolean",
          description: "Either `true` to allow rebase-merging pull requests, or `false` to prevent rebase-merging.",
        },
        allow_auto_merge: {
          type: "boolean",
          description: "Either `true` to allow auto-merge on pull requests, or `false` to disallow auto-merge.",
        },
        delete_branch_on_merge: {
          type: "boolean",
          description: "Either `true` to allow automatically deleting head branches when pull requests are merged, or `false` to prevent automatic deletion. **The authenticated user must be an organization owner to set this property to `true`.**",
        },
        use_squash_pr_title_as_default: {
          type: "boolean",
          description: "Either `true` to allow squash-merge commits to use pull request title, or `false` to use commit message. **This property is closing down. Please use `squash_merge_commit_title` instead.",
        },
        squash_merge_commit_title: {
          type: "string",
          description: "Required when using `squash_merge_commit_message`.

The default value for a squash merge commit title:

- `PR_TITLE` - default to the pull request's title.
- `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull request's title (when more than one commit).",
          enum: ["PR_TITLE", "COMMIT_OR_PR_TITLE"],
        },
        squash_merge_commit_message: {
          type: "string",
          description: "The default value for a squash merge commit message:

- `PR_BODY` - default to the pull request's body.
- `COMMIT_MESSAGES` - default to the branch's commit messages.
- `BLANK` - default to a blank commit message.",
          enum: ["PR_BODY", "COMMIT_MESSAGES", "BLANK"],
        },
        merge_commit_title: {
          type: "string",
          description: "Required when using `merge_commit_message`.

The default value for a merge commit title.

- `PR_TITLE` - default to the pull request's title.
- `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull request #123 from branch-name).",
          enum: ["PR_TITLE", "MERGE_MESSAGE"],
        },
        merge_commit_message: {
          type: "string",
          description: "The default value for a merge commit message.

- `PR_TITLE` - default to the pull request's title.
- `PR_BODY` - default to the pull request's body.
- `BLANK` - default to a blank commit message.",
          enum: ["PR_BODY", "PR_TITLE", "BLANK"],
        },
        custom_properties: {
          type: "object",
          description: "The custom properties for the new repository. The keys are the custom property names, and the values are the corresponding custom property values.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "reposgetOrgRulesets",
    description: "Get all organization repository rulesets",
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
    name: "reposcreateOrgRuleset",
    description: "Create an organization repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the ruleset.",
        },
        target: {
          type: "string",
          description: "The target of the ruleset",
          enum: ["branch", "tag", "push", "repository"],
        },
        enforcement: {
          type: "",
          description: "",
        },
        bypass_actors: {
          type: "array",
          description: "The actors that can bypass the rules in this ruleset",
        },
        conditions: {
          type: "",
          description: "",
        },
        rules: {
          type: "array",
          description: "An array of rules within the ruleset.",
        },
      },
      required: ["name", "enforcement"],
    },
  },
  {
    name: "reposgetOrgRuleSuites",
    description: "List organization rule suites",
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
    name: "reposgetOrgRuleSuite",
    description: "Get an organization rule suite",
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
        rule_suite_id: {
          type: "string",
          description: "Path parameter: rule_suite_id",
        },
      },
      required: ["org", "rule_suite_id"],
    },
  },
  {
    name: "reposgetOrgRuleset",
    description: "Get an organization repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ruleset_id: {
          type: "integer",
          description: "The ID of the ruleset.",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["ruleset_id", "org"],
    },
  },
  {
    name: "reposupdateOrgRuleset",
    description: "Update an organization repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the ruleset.",
        },
        target: {
          type: "string",
          description: "The target of the ruleset",
          enum: ["branch", "tag", "push", "repository"],
        },
        enforcement: {
          type: "",
          description: "",
        },
        bypass_actors: {
          type: "array",
          description: "The actors that can bypass the rules in this ruleset",
        },
        conditions: {
          type: "",
          description: "",
        },
        rules: {
          type: "array",
          description: "An array of rules within the ruleset.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeleteOrgRuleset",
    description: "Delete an organization repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ruleset_id: {
          type: "integer",
          description: "The ID of the ruleset.",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["ruleset_id", "org"],
    },
  },
  {
    name: "reposget",
    description: "Get a repository",
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
    name: "reposupdate",
    description: "Update a repository",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the repository.",
        },
        description: {
          type: "string",
          description: "A short description of the repository.",
        },
        homepage: {
          type: "string",
          description: "A URL with more information about the repository.",
        },
        private: {
          type: "boolean",
          description: "Either `true` to make the repository private or `false` to make it public. Default: `false`.  
**Note**: You will get a `422` error if the organization restricts [changing repository visibility](https://docs.github.com/articles/repository-permission-levels-for-an-organization#changing-the-visibility-of-repositories) to organization owners and a non-owner tries to change the value of private.",
        },
        visibility: {
          type: "string",
          description: "The visibility of the repository.",
          enum: ["public", "private"],
        },
        security_and_analysis: {
          type: "object",
          description: "Specify which security and analysis features to enable or disable for the repository.

To use this parameter, you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository. For more information, see "[Managing security managers in your organization](https://docs.github.com/organizations/managing-peoples-access-to-your-organization-with-roles/managing-security-managers-in-your-organization)."

For example, to enable GitHub Advanced Security, use this data in the body of the `PATCH` request:
`{ "security_and_analysis": {"advanced_security": { "status": "enabled" } } }`.

You can check which security and analysis features are currently enabled by using a `GET /repos/{owner}/{repo}` request.",
        },
        has_issues: {
          type: "boolean",
          description: "Either `true` to enable issues for this repository or `false` to disable them.",
        },
        has_projects: {
          type: "boolean",
          description: "Either `true` to enable projects for this repository or `false` to disable them. **Note:** If you're creating a repository in an organization that has disabled repository projects, the default is `false`, and if you pass `true`, the API returns an error.",
        },
        has_wiki: {
          type: "boolean",
          description: "Either `true` to enable the wiki for this repository or `false` to disable it.",
        },
        is_template: {
          type: "boolean",
          description: "Either `true` to make this repo available as a template repository or `false` to prevent it.",
        },
        default_branch: {
          type: "string",
          description: "Updates the default branch for this repository.",
        },
        allow_squash_merge: {
          type: "boolean",
          description: "Either `true` to allow squash-merging pull requests, or `false` to prevent squash-merging.",
        },
        allow_merge_commit: {
          type: "boolean",
          description: "Either `true` to allow merging pull requests with a merge commit, or `false` to prevent merging pull requests with merge commits.",
        },
        allow_rebase_merge: {
          type: "boolean",
          description: "Either `true` to allow rebase-merging pull requests, or `false` to prevent rebase-merging.",
        },
        allow_auto_merge: {
          type: "boolean",
          description: "Either `true` to allow auto-merge on pull requests, or `false` to disallow auto-merge.",
        },
        delete_branch_on_merge: {
          type: "boolean",
          description: "Either `true` to allow automatically deleting head branches when pull requests are merged, or `false` to prevent automatic deletion.",
        },
        allow_update_branch: {
          type: "boolean",
          description: "Either `true` to always allow a pull request head branch that is behind its base branch to be updated even if it is not required to be up to date before merging, or false otherwise.",
        },
        use_squash_pr_title_as_default: {
          type: "boolean",
          description: "Either `true` to allow squash-merge commits to use pull request title, or `false` to use commit message. **This property is closing down. Please use `squash_merge_commit_title` instead.",
        },
        squash_merge_commit_title: {
          type: "string",
          description: "Required when using `squash_merge_commit_message`.

The default value for a squash merge commit title:

- `PR_TITLE` - default to the pull request's title.
- `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull request's title (when more than one commit).",
          enum: ["PR_TITLE", "COMMIT_OR_PR_TITLE"],
        },
        squash_merge_commit_message: {
          type: "string",
          description: "The default value for a squash merge commit message:

- `PR_BODY` - default to the pull request's body.
- `COMMIT_MESSAGES` - default to the branch's commit messages.
- `BLANK` - default to a blank commit message.",
          enum: ["PR_BODY", "COMMIT_MESSAGES", "BLANK"],
        },
        merge_commit_title: {
          type: "string",
          description: "Required when using `merge_commit_message`.

The default value for a merge commit title.

- `PR_TITLE` - default to the pull request's title.
- `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull request #123 from branch-name).",
          enum: ["PR_TITLE", "MERGE_MESSAGE"],
        },
        merge_commit_message: {
          type: "string",
          description: "The default value for a merge commit message.

- `PR_TITLE` - default to the pull request's title.
- `PR_BODY` - default to the pull request's body.
- `BLANK` - default to a blank commit message.",
          enum: ["PR_BODY", "PR_TITLE", "BLANK"],
        },
        archived: {
          type: "boolean",
          description: "Whether to archive this repository. `false` will unarchive a previously archived repository.",
        },
        allow_forking: {
          type: "boolean",
          description: "Either `true` to allow private forks, or `false` to prevent private forks.",
        },
        web_commit_signoff_required: {
          type: "boolean",
          description: "Either `true` to require contributors to sign off on web-based commits, or `false` to not require contributors to sign off on web-based commits.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdelete",
    description: "Delete a repository",
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
    name: "reposlistActivities",
    description: "List repository activities",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
          type: "string",
          description: "The Git reference for the activities you want to list.

The `ref` for a branch can be formatted either as `refs/heads/BRANCH_NAME` or `BRANCH_NAME`, where `BRANCH_NAME` is the name of your branch.",
        },
        actor: {
          type: "string",
          description: "The GitHub username to use to filter by the actor who performed the activity.",
        },
        time_period: {
          type: "string",
          description: "The time period to filter by.

For example, `day` will filter for activity that occurred in the past 24 hours, and `week` will filter for activity that occurred in the past 7 days (168 hours).",
          enum: ["day", "week", "month", "quarter", "year"],
        },
        activity_type: {
          type: "string",
          description: "The activity type to filter by.

For example, you can choose to filter by "force_push", to see all force pushes to the repository.",
          enum: ["push", "force_push", "branch_creation", "branch_deletion", "pr_merge", "merge_queue_merge"],
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
    name: "reposcreateAttestation",
    description: "Create an attestation",
    inputSchema: {
      type: "object",
      properties: {
        bundle: {
          type: "object",
          description: "The attestation's Sigstore Bundle.
Refer to the [Sigstore Bundle Specification](https://github.com/sigstore/protobuf-specs/blob/main/protos/sigstore_bundle.proto) for more information.",
        },
      },
      required: ["bundle"],
    },
  },
  {
    name: "reposlistAttestations",
    description: "List attestations",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        subject_digest: {
          type: "string",
          description: "The parameter should be set to the attestation's subject's SHA256 digest, in the form `sha256:HEX_DIGEST`.",
        },
        predicate_type: {
          type: "string",
          description: "Optional filter for fetching attestations with a given predicate type.
This option accepts `provenance`, `sbom`, `release`, or freeform text
for custom predicate types.",
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
      required: ["subject_digest", "owner", "repo"],
    },
  },
  {
    name: "reposlistAutolinks",
    description: "Get all autolinks of a repository",
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
    name: "reposcreateAutolink",
    description: "Create an autolink reference for a repository",
    inputSchema: {
      type: "object",
      properties: {
        key_prefix: {
          type: "string",
          description: "This prefix appended by certain characters will generate a link any time it is found in an issue, pull request, or commit.",
        },
        url_template: {
          type: "string",
          description: "The URL must contain `<num>` for the reference number. `<num>` matches different characters depending on the value of `is_alphanumeric`.",
        },
        is_alphanumeric: {
          type: "boolean",
          description: "Whether this autolink reference matches alphanumeric characters. If true, the `<num>` parameter of the `url_template` matches alphanumeric characters `A-Z` (case insensitive), `0-9`, and `-`. If false, this autolink reference only matches numeric characters.",
        },
      },
      required: ["key_prefix", "url_template"],
    },
  },
  {
    name: "reposgetAutolink",
    description: "Get an autolink reference of a repository",
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
        autolink_id: {
          type: "string",
          description: "Path parameter: autolink_id",
        },
      },
      required: ["owner", "repo", "autolink_id"],
    },
  },
  {
    name: "reposdeleteAutolink",
    description: "Delete an autolink reference from a repository",
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
        autolink_id: {
          type: "string",
          description: "Path parameter: autolink_id",
        },
      },
      required: ["owner", "repo", "autolink_id"],
    },
  },
  {
    name: "reposcheckAutomatedSecurityFixes",
    description: "Check if Dependabot security updates are enabled for a repository",
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
    name: "reposenableAutomatedSecurityFixes",
    description: "Enable Dependabot security updates",
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
    name: "reposdisableAutomatedSecurityFixes",
    description: "Disable Dependabot security updates",
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
    name: "reposlistBranches",
    description: "List branches",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        protected: {
          type: "boolean",
          description: "Setting to `true` returns only branches protected by branch protections or rulesets. When set to `false`, only unprotected branches are returned. Omitting this parameter returns all branches.",
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
    name: "reposgetBranch",
    description: "Get a branch",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetBranchProtection",
    description: "Get branch protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposupdateBranchProtection",
    description: "Update branch protection",
    inputSchema: {
      type: "object",
      properties: {
        required_status_checks: {
          type: "object",
          description: "Require status checks to pass before merging. Set to `null` to disable.",
        },
        enforce_admins: {
          type: "boolean",
          description: "Enforce all configured restrictions for administrators. Set to `true` to enforce required status checks for repository administrators. Set to `null` to disable.",
        },
        required_pull_request_reviews: {
          type: "object",
          description: "Require at least one approving review on a pull request, before merging. Set to `null` to disable.",
        },
        restrictions: {
          type: "object",
          description: "Restrict who can push to the protected branch. User, app, and team `restrictions` are only available for organization-owned repositories. Set to `null` to disable.",
        },
        required_linear_history: {
          type: "boolean",
          description: "Enforces a linear commit Git history, which prevents anyone from pushing merge commits to a branch. Set to `true` to enforce a linear commit history. Set to `false` to disable a linear commit Git history. Your repository must allow squash merging or rebase merging before you can enable a linear commit history. Default: `false`. For more information, see "[Requiring a linear commit history](https://docs.github.com/github/administering-a-repository/requiring-a-linear-commit-history)" in the GitHub Help documentation.",
        },
        allow_force_pushes: {
          type: "boolean",
          description: "Permits force pushes to the protected branch by anyone with write access to the repository. Set to `true` to allow force pushes. Set to `false` or `null` to block force pushes. Default: `false`. For more information, see "[Enabling force pushes to a protected branch](https://docs.github.com/github/administering-a-repository/enabling-force-pushes-to-a-protected-branch)" in the GitHub Help documentation."",
        },
        allow_deletions: {
          type: "boolean",
          description: "Allows deletion of the protected branch by anyone with write access to the repository. Set to `false` to prevent deletion of the protected branch. Default: `false`. For more information, see "[Enabling force pushes to a protected branch](https://docs.github.com/github/administering-a-repository/enabling-force-pushes-to-a-protected-branch)" in the GitHub Help documentation.",
        },
        block_creations: {
          type: "boolean",
          description: "If set to `true`, the `restrictions` branch protection settings which limits who can push will also block pushes which create new branches, unless the push is initiated by a user, team, or app which has the ability to push. Set to `true` to restrict new branch creation. Default: `false`.",
        },
        required_conversation_resolution: {
          type: "boolean",
          description: "Requires all conversations on code to be resolved before a pull request can be merged into a branch that matches this rule. Set to `false` to disable. Default: `false`.",
        },
        lock_branch: {
          type: "boolean",
          description: "Whether to set the branch as read-only. If this is true, users will not be able to push to the branch. Default: `false`.",
        },
        allow_fork_syncing: {
          type: "boolean",
          description: "Whether users can pull changes from upstream when the branch is locked. Set to `true` to allow fork syncing. Set to `false` to prevent fork syncing. Default: `false`.",
        },
      },
      required: ["required_status_checks", "enforce_admins", "required_pull_request_reviews", "restrictions"],
    },
  },
  {
    name: "reposdeleteBranchProtection",
    description: "Delete branch protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetAdminBranchProtection",
    description: "Get admin branch protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "repossetAdminBranchProtection",
    description: "Set admin branch protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposdeleteAdminBranchProtection",
    description: "Delete admin branch protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetPullRequestReviewProtection",
    description: "Get pull request review protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposupdatePullRequestReviewProtection",
    description: "Update pull request review protection",
    inputSchema: {
      type: "object",
      properties: {
        dismissal_restrictions: {
          type: "object",
          description: "Specify which users, teams, and apps can dismiss pull request reviews. Pass an empty `dismissal_restrictions` object to disable. User and team `dismissal_restrictions` are only available for organization-owned repositories. Omit this parameter for personal repositories.",
        },
        dismiss_stale_reviews: {
          type: "boolean",
          description: "Set to `true` if you want to automatically dismiss approving reviews when someone pushes a new commit.",
        },
        require_code_owner_reviews: {
          type: "boolean",
          description: "Blocks merging pull requests until [code owners](https://docs.github.com/articles/about-code-owners/) have reviewed.",
        },
        required_approving_review_count: {
          type: "integer",
          description: "Specifies the number of reviewers required to approve pull requests. Use a number between 1 and 6 or 0 to not require reviewers.",
        },
        require_last_push_approval: {
          type: "boolean",
          description: "Whether the most recent push must be approved by someone other than the person who pushed it. Default: `false`",
        },
        bypass_pull_request_allowances: {
          type: "object",
          description: "Allow specific users, teams, or apps to bypass pull request requirements.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeletePullRequestReviewProtection",
    description: "Delete pull request review protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetCommitSignatureProtection",
    description: "Get commit signature protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposcreateCommitSignatureProtection",
    description: "Create commit signature protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposdeleteCommitSignatureProtection",
    description: "Delete commit signature protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetStatusChecksProtection",
    description: "Get status checks protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposupdateStatusCheckProtection",
    description: "Update status check protection",
    inputSchema: {
      type: "object",
      properties: {
        strict: {
          type: "boolean",
          description: "Require branches to be up to date before merging.",
        },
        contexts: {
          type: "array",
          description: "**Closing down notice**: The list of status checks to require in order to merge into this branch. If any of these checks have recently been set by a particular GitHub App, they will be required to come from that app in future for the branch to merge. Use `checks` instead of `contexts` for more fine-grained control.",
        },
        checks: {
          type: "array",
          description: "The list of status checks to require in order to merge into this branch.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposremoveStatusCheckProtection",
    description: "Remove status check protection",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetAllStatusCheckContexts",
    description: "Get all status check contexts",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposaddStatusCheckContexts",
    description: "Add status check contexts",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "repossetStatusCheckContexts",
    description: "Set status check contexts",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposremoveStatusCheckContexts",
    description: "Remove status check contexts",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetAccessRestrictions",
    description: "Get access restrictions",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposdeleteAccessRestrictions",
    description: "Delete access restrictions",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetAppsWithAccessToProtectedBranch",
    description: "Get apps with access to the protected branch",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposaddAppAccessRestrictions",
    description: "Add app access restrictions",
    inputSchema: {
      type: "object",
      properties: {
        apps: {
          type: "array",
          description: "The GitHub Apps that have push access to this branch. Use the slugified version of the app name. **Note**: The list of users, apps, and teams in total is limited to 100 items.",
        },
      },
      required: ["apps"],
    },
  },
  {
    name: "repossetAppAccessRestrictions",
    description: "Set app access restrictions",
    inputSchema: {
      type: "object",
      properties: {
        apps: {
          type: "array",
          description: "The GitHub Apps that have push access to this branch. Use the slugified version of the app name. **Note**: The list of users, apps, and teams in total is limited to 100 items.",
        },
      },
      required: ["apps"],
    },
  },
  {
    name: "reposremoveAppAccessRestrictions",
    description: "Remove app access restrictions",
    inputSchema: {
      type: "object",
      properties: {
        apps: {
          type: "array",
          description: "The GitHub Apps that have push access to this branch. Use the slugified version of the app name. **Note**: The list of users, apps, and teams in total is limited to 100 items.",
        },
      },
      required: ["apps"],
    },
  },
  {
    name: "reposgetTeamsWithAccessToProtectedBranch",
    description: "Get teams with access to the protected branch",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposaddTeamAccessRestrictions",
    description: "Add team access restrictions",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "repossetTeamAccessRestrictions",
    description: "Set team access restrictions",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposremoveTeamAccessRestrictions",
    description: "Remove team access restrictions",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetUsersWithAccessToProtectedBranch",
    description: "Get users with access to the protected branch",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposaddUserAccessRestrictions",
    description: "Add user access restrictions",
    inputSchema: {
      type: "object",
      properties: {
        users: {
          type: "array",
          description: "The username for users",
        },
      },
      required: ["users"],
    },
  },
  {
    name: "repossetUserAccessRestrictions",
    description: "Set user access restrictions",
    inputSchema: {
      type: "object",
      properties: {
        users: {
          type: "array",
          description: "The username for users",
        },
      },
      required: ["users"],
    },
  },
  {
    name: "reposremoveUserAccessRestrictions",
    description: "Remove user access restrictions",
    inputSchema: {
      type: "object",
      properties: {
        users: {
          type: "array",
          description: "The username for users",
        },
      },
      required: ["users"],
    },
  },
  {
    name: "reposrenameBranch",
    description: "Rename a branch",
    inputSchema: {
      type: "object",
      properties: {
        new_name: {
          type: "string",
          description: "The new name of the branch.",
        },
      },
      required: ["new_name"],
    },
  },
  {
    name: "reposcodeownersErrors",
    description: "List CODEOWNERS errors",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
          type: "string",
          description: "A branch, tag or commit name used to determine which version of the CODEOWNERS file to use. Default: the repository's default branch (e.g. `main`)",
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
    name: "reposlistCollaborators",
    description: "List repository collaborators",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        affiliation: {
          type: "string",
          description: "Filter collaborators returned by their affiliation. `outside` means all outside collaborators of an organization-owned repository. `direct` means all collaborators with permissions to an organization-owned repository, regardless of organization membership status. `all` means all collaborators the authenticated user can see.",
          enum: ["outside", "direct", "all"],
        },
        permission: {
          type: "string",
          description: "Filter collaborators by the permissions they have on the repository. If not specified, all collaborators will be returned.",
          enum: ["pull", "triage", "push", "maintain", "admin"],
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
    name: "reposcheckCollaborator",
    description: "Check if a user is a repository collaborator",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["owner", "repo", "username"],
    },
  },
  {
    name: "reposaddCollaborator",
    description: "Add a repository collaborator",
    inputSchema: {
      type: "object",
      properties: {
        permission: {
          type: "string",
          description: "The permission to grant the collaborator. **Only valid on organization-owned repositories.** We accept the following permissions to be set: `pull`, `triage`, `push`, `maintain`, `admin` and you can also specify a custom repository role name, if the owning organization has defined any.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposremoveCollaborator",
    description: "Remove a repository collaborator",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["owner", "repo", "username"],
    },
  },
  {
    name: "reposgetCollaboratorPermissionLevel",
    description: "Get repository permissions for a user",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["owner", "repo", "username"],
    },
  },
  {
    name: "reposlistCommitCommentsForRepo",
    description: "List commit comments for a repository",
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
    name: "reposgetCommitComment",
    description: "Get a commit comment",
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
    name: "reposupdateCommitComment",
    description: "Update a commit comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The contents of the comment",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "reposdeleteCommitComment",
    description: "Delete a commit comment",
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
    name: "reposlistCommits",
    description: "List commits",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sha: {
          type: "string",
          description: "SHA or branch to start listing commits from. Default: the repository’s default branch (usually `main`).",
        },
        path: {
          type: "string",
          description: "Only commits containing this file path will be returned.",
        },
        author: {
          type: "string",
          description: "GitHub username or email address to use to filter by commit author.",
        },
        committer: {
          type: "string",
          description: "GitHub username or email address to use to filter by commit committer.",
        },
        since: {
          type: "string",
          description: "Only show results that were last updated after the given time. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`. Due to limitations of Git, timestamps must be between 1970-01-01 and 2099-12-31 (inclusive) or unexpected results may be returned.",
        },
        until: {
          type: "string",
          description: "Only commits before this date will be returned. This is a timestamp in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format: `YYYY-MM-DDTHH:MM:SSZ`. Due to limitations of Git, timestamps must be between 1970-01-01 and 2099-12-31 (inclusive) or unexpected results may be returned.",
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
    name: "reposlistBranchesForHeadCommit",
    description: "List branches for HEAD commit",
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
        commit_sha: {
          type: "string",
          description: "Path parameter: commit_sha",
        },
      },
      required: ["owner", "repo", "commit_sha"],
    },
  },
  {
    name: "reposlistCommentsForCommit",
    description: "List commit comments",
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
        commit_sha: {
          type: "string",
          description: "Path parameter: commit_sha",
        },
      },
      required: ["owner", "repo", "commit_sha"],
    },
  },
  {
    name: "reposcreateCommitComment",
    description: "Create a commit comment",
    inputSchema: {
      type: "object",
      properties: {
        body: {
          type: "string",
          description: "The contents of the comment.",
        },
        path: {
          type: "string",
          description: "Relative path of the file to comment on.",
        },
        position: {
          type: "integer",
          description: "Line index in the diff to comment on.",
        },
        line: {
          type: "integer",
          description: "**Closing down notice**. Use **position** parameter instead. Line number in the file to comment on.",
        },
      },
      required: ["body"],
    },
  },
  {
    name: "reposlistPullRequestsAssociatedWithCommit",
    description: "List pull requests associated with a commit",
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
        commit_sha: {
          type: "string",
          description: "Path parameter: commit_sha",
        },
      },
      required: ["owner", "repo", "commit_sha"],
    },
  },
  {
    name: "reposgetCommit",
    description: "Get a commit",
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
        ref: {
          type: "string",
          description: "Path parameter: ref",
        },
      },
      required: ["owner", "repo", "ref"],
    },
  },
  {
    name: "reposgetCombinedStatusForRef",
    description: "Get the combined status for a specific reference",
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
        ref: {
          type: "string",
          description: "Path parameter: ref",
        },
      },
      required: ["owner", "repo", "ref"],
    },
  },
  {
    name: "reposlistCommitStatusesForRef",
    description: "List commit statuses for a reference",
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
        ref: {
          type: "string",
          description: "Path parameter: ref",
        },
      },
      required: ["owner", "repo", "ref"],
    },
  },
  {
    name: "reposgetCommunityProfileMetrics",
    description: "Get community profile metrics",
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
    name: "reposcompareCommits",
    description: "Compare two commits",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        basehead: {
          type: "string",
          description: "The base branch and head branch to compare. This parameter expects the format `BASE...HEAD`. Both must be branch names in `repo`. To compare with a branch that exists in a different repository in the same network as `repo`, the `basehead` parameter expects the format `USERNAME:BASE...USERNAME:HEAD`.",
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
      required: ["basehead", "owner", "repo"],
    },
  },
  {
    name: "reposgetContent",
    description: "Get repository content",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        path: {
          type: "string",
          description: "path parameter",
        },
        ref: {
          type: "string",
          description: "The name of the commit/branch/tag. Default: the repository’s default branch.",
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
      required: ["path", "owner", "repo"],
    },
  },
  {
    name: "reposcreateOrUpdateFileContents",
    description: "Create or update file contents",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message.",
        },
        content: {
          type: "string",
          description: "The new file content, using Base64 encoding.",
        },
        sha: {
          type: "string",
          description: "**Required if you are updating a file**. The blob SHA of the file being replaced.",
        },
        branch: {
          type: "string",
          description: "The branch name. Default: the repository’s default branch.",
        },
        committer: {
          type: "object",
          description: "The person that committed the file. Default: the authenticated user.",
        },
        author: {
          type: "object",
          description: "The author of the file. Default: The `committer` or the authenticated user if you omit `committer`.",
        },
      },
      required: ["message", "content"],
    },
  },
  {
    name: "reposdeleteFile",
    description: "Delete a file",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message.",
        },
        sha: {
          type: "string",
          description: "The blob SHA of the file being deleted.",
        },
        branch: {
          type: "string",
          description: "The branch name. Default: the repository’s default branch",
        },
        committer: {
          type: "object",
          description: "object containing information about the committer.",
        },
        author: {
          type: "object",
          description: "object containing information about the author.",
        },
      },
      required: ["message", "sha"],
    },
  },
  {
    name: "reposlistContributors",
    description: "List repository contributors",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        anon: {
          type: "string",
          description: "Set to `1` or `true` to include anonymous contributors in results.",
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
    name: "reposlistDeployments",
    description: "List deployments",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sha: {
          type: "string",
          description: "The SHA recorded at creation time.",
        },
        ref: {
          type: "string",
          description: "The name of the ref. This can be a branch, tag, or SHA.",
        },
        task: {
          type: "string",
          description: "The name of the task for the deployment (e.g., `deploy` or `deploy:migrations`).",
        },
        environment: {
          type: "string",
          description: "The name of the environment that was deployed to (e.g., `staging` or `production`).",
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
    name: "reposcreateDeployment",
    description: "Create a deployment",
    inputSchema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description: "The ref to deploy. This can be a branch, tag, or SHA.",
        },
        task: {
          type: "string",
          description: "Specifies a task to execute (e.g., `deploy` or `deploy:migrations`).",
        },
        auto_merge: {
          type: "boolean",
          description: "Attempts to automatically merge the default branch into the requested ref, if it's behind the default branch.",
        },
        required_contexts: {
          type: "array",
          description: "The [status](https://docs.github.com/rest/commits/statuses) contexts to verify against commit status checks. If you omit this parameter, GitHub verifies all unique contexts before creating a deployment. To bypass checking entirely, pass an empty array. Defaults to all unique contexts.",
        },
        payload: {
          type: "",
          description: "",
        },
        environment: {
          type: "string",
          description: "Name for the target deployment environment (e.g., `production`, `staging`, `qa`).",
        },
        description: {
          type: "string",
          description: "Short description of the deployment.",
        },
        transient_environment: {
          type: "boolean",
          description: "Specifies if the given environment is specific to the deployment and will no longer exist at some point in the future. Default: `false`",
        },
        production_environment: {
          type: "boolean",
          description: "Specifies if the given environment is one that end-users directly interact with. Default: `true` when `environment` is `production` and `false` otherwise.",
        },
      },
      required: ["ref"],
    },
  },
  {
    name: "reposgetDeployment",
    description: "Get a deployment",
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
        deployment_id: {
          type: "string",
          description: "Path parameter: deployment_id",
        },
      },
      required: ["owner", "repo", "deployment_id"],
    },
  },
  {
    name: "reposdeleteDeployment",
    description: "Delete a deployment",
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
        deployment_id: {
          type: "string",
          description: "Path parameter: deployment_id",
        },
      },
      required: ["owner", "repo", "deployment_id"],
    },
  },
  {
    name: "reposlistDeploymentStatuses",
    description: "List deployment statuses",
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
        deployment_id: {
          type: "string",
          description: "Path parameter: deployment_id",
        },
      },
      required: ["owner", "repo", "deployment_id"],
    },
  },
  {
    name: "reposcreateDeploymentStatus",
    description: "Create a deployment status",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "The state of the status. When you set a transient deployment to `inactive`, the deployment will be shown as `destroyed` in GitHub.",
          enum: ["error", "failure", "inactive", "in_progress", "queued", "pending", "success"],
        },
        target_url: {
          type: "string",
          description: "The target URL to associate with this status. This URL should contain output to keep the user updated while the task is running or serve as historical information for what happened in the deployment.

> [!NOTE]
> It's recommended to use the `log_url` parameter, which replaces `target_url`.",
        },
        log_url: {
          type: "string",
          description: "The full URL of the deployment's output. This parameter replaces `target_url`. We will continue to accept `target_url` to support legacy uses, but we recommend replacing `target_url` with `log_url`. Setting `log_url` will automatically set `target_url` to the same value. Default: `""`",
        },
        description: {
          type: "string",
          description: "A short description of the status. The maximum description length is 140 characters.",
        },
        environment: {
          type: "string",
          description: "Name for the target deployment environment, which can be changed when setting a deploy status. For example, `production`, `staging`, or `qa`. If not defined, the environment of the previous status on the deployment will be used, if it exists. Otherwise, the environment of the deployment will be used.",
        },
        environment_url: {
          type: "string",
          description: "Sets the URL for accessing your environment. Default: `""`",
        },
        auto_inactive: {
          type: "boolean",
          description: "Adds a new `inactive` status to all prior non-transient, non-production environment deployments with the same repository and `environment` name as the created status's deployment. An `inactive` status is only added to deployments that had a `success` state. Default: `true`",
        },
      },
      required: ["state"],
    },
  },
  {
    name: "reposgetDeploymentStatus",
    description: "Get a deployment status",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        status_id: {
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
        deployment_id: {
          type: "string",
          description: "Path parameter: deployment_id",
        },
      },
      required: ["status_id", "owner", "repo", "deployment_id"],
    },
  },
  {
    name: "reposcreateDispatchEvent",
    description: "Create a repository dispatch event",
    inputSchema: {
      type: "object",
      properties: {
        event_type: {
          type: "string",
          description: "A custom webhook event name. Must be 100 characters or fewer.",
        },
        client_payload: {
          type: "object",
          description: "JSON payload with extra information about the webhook event that your action or workflow may use. The maximum number of top-level properties is 10. The total size of the JSON payload must be less than 64KB.",
        },
      },
      required: ["event_type"],
    },
  },
  {
    name: "reposgetAllEnvironments",
    description: "List environments",
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
    name: "reposgetEnvironment",
    description: "Get an environment",
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
    name: "reposcreateOrUpdateEnvironment",
    description: "Create or update an environment",
    inputSchema: {
      type: "object",
      properties: {
        wait_timer: {
          type: "",
          description: "",
        },
        prevent_self_review: {
          type: "",
          description: "",
        },
        reviewers: {
          type: "array",
          description: "The people or teams that may review jobs that reference the environment. You can list up to six users or teams as reviewers. The reviewers must have at least read access to the repository. Only one of the required reviewers needs to approve the job for it to proceed.",
        },
        deployment_branch_policy: {
          type: "",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeleteAnEnvironment",
    description: "Delete an environment",
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
    name: "reposlistDeploymentBranchPolicies",
    description: "List deployment branch policies",
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
    name: "reposcreateDeploymentBranchPolicy",
    description: "Create a deployment branch policy",
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
    name: "reposgetDeploymentBranchPolicy",
    description: "Get a deployment branch policy",
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
        branch_policy_id: {
          type: "string",
          description: "Path parameter: branch_policy_id",
        },
      },
      required: ["owner", "repo", "environment_name", "branch_policy_id"],
    },
  },
  {
    name: "reposupdateDeploymentBranchPolicy",
    description: "Update a deployment branch policy",
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
        branch_policy_id: {
          type: "string",
          description: "Path parameter: branch_policy_id",
        },
      },
      required: ["owner", "repo", "environment_name", "branch_policy_id"],
    },
  },
  {
    name: "reposdeleteDeploymentBranchPolicy",
    description: "Delete a deployment branch policy",
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
        branch_policy_id: {
          type: "string",
          description: "Path parameter: branch_policy_id",
        },
      },
      required: ["owner", "repo", "environment_name", "branch_policy_id"],
    },
  },
  {
    name: "reposgetAllDeploymentProtectionRules",
    description: "Get all deployment protection rules for an environment",
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
    name: "reposcreateDeploymentProtectionRule",
    description: "Create a custom deployment protection rule on an environment",
    inputSchema: {
      type: "object",
      properties: {
        integration_id: {
          type: "integer",
          description: "The ID of the custom app that will be enabled on the environment.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposlistCustomDeploymentRuleIntegrations",
    description: "List custom deployment rule integrations available for an environment",
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
    name: "reposgetCustomDeploymentProtectionRule",
    description: "Get a custom deployment protection rule",
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
        protection_rule_id: {
          type: "string",
          description: "Path parameter: protection_rule_id",
        },
      },
      required: ["owner", "repo", "environment_name", "protection_rule_id"],
    },
  },
  {
    name: "reposdisableDeploymentProtectionRule",
    description: "Disable a custom protection rule for an environment",
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
        protection_rule_id: {
          type: "string",
          description: "Path parameter: protection_rule_id",
        },
      },
      required: ["owner", "repo", "environment_name", "protection_rule_id"],
    },
  },
  {
    name: "reposlistForks",
    description: "List forks",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        sort: {
          type: "string",
          description: "The sort order. `stargazers` will sort by star count.",
          enum: ["newest", "oldest", "stargazers", "watchers"],
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
    name: "reposcreateFork",
    description: "Create a fork",
    inputSchema: {
      type: "object",
      properties: {
        organization: {
          type: "string",
          description: "Optional parameter to specify the organization name if forking into an organization.",
        },
        name: {
          type: "string",
          description: "When forking from an existing repository, a new name for the fork.",
        },
        default_branch_only: {
          type: "boolean",
          description: "When forking from an existing repository, fork with only the default branch.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposlistWebhooks",
    description: "List repository webhooks",
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
    name: "reposcreateWebhook",
    description: "Create a repository webhook",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Use `web` to create a webhook. Default: `web`. This parameter only accepts the value `web`.",
        },
        config: {
          type: "object",
          description: "Key/value pairs to provide settings for this webhook.",
        },
        events: {
          type: "array",
          description: "Determines what [events](https://docs.github.com/webhooks/event-payloads) the hook is triggered for.",
        },
        active: {
          type: "boolean",
          description: "Determines if notifications are sent when the webhook is triggered. Set to `true` to send notifications.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposgetWebhook",
    description: "Get a repository webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["owner", "repo", "hook_id"],
    },
  },
  {
    name: "reposupdateWebhook",
    description: "Update a repository webhook",
    inputSchema: {
      type: "object",
      properties: {
        config: {
          type: "",
          description: "",
        },
        events: {
          type: "array",
          description: "Determines what [events](https://docs.github.com/webhooks/event-payloads) the hook is triggered for. This replaces the entire array of events.",
        },
        add_events: {
          type: "array",
          description: "Determines a list of events to be added to the list of events that the Hook triggers for.",
        },
        remove_events: {
          type: "array",
          description: "Determines a list of events to be removed from the list of events that the Hook triggers for.",
        },
        active: {
          type: "boolean",
          description: "Determines if notifications are sent when the webhook is triggered. Set to `true` to send notifications.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeleteWebhook",
    description: "Delete a repository webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["owner", "repo", "hook_id"],
    },
  },
  {
    name: "reposgetWebhookConfigForRepo",
    description: "Get a webhook configuration for a repository",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["owner", "repo", "hook_id"],
    },
  },
  {
    name: "reposupdateWebhookConfigForRepo",
    description: "Update a webhook configuration for a repository",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "",
          description: "",
        },
        content_type: {
          type: "",
          description: "",
        },
        secret: {
          type: "",
          description: "",
        },
        insecure_ssl: {
          type: "",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "reposlistWebhookDeliveries",
    description: "List deliveries for a repository webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["owner", "repo", "hook_id"],
    },
  },
  {
    name: "reposgetWebhookDelivery",
    description: "Get a delivery for a repository webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
        delivery_id: {
          type: "string",
          description: "Path parameter: delivery_id",
        },
      },
      required: ["owner", "repo", "hook_id", "delivery_id"],
    },
  },
  {
    name: "reposredeliverWebhookDelivery",
    description: "Redeliver a delivery for a repository webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
        delivery_id: {
          type: "string",
          description: "Path parameter: delivery_id",
        },
      },
      required: ["owner", "repo", "hook_id", "delivery_id"],
    },
  },
  {
    name: "repospingWebhook",
    description: "Ping a repository webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["owner", "repo", "hook_id"],
    },
  },
  {
    name: "repostestPushWebhook",
    description: "Test the push repository webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["owner", "repo", "hook_id"],
    },
  },
  {
    name: "reposcheckImmutableReleases",
    description: "Check if immutable releases are enabled for a repository",
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
    name: "reposenableImmutableReleases",
    description: "Enable immutable releases",
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
    name: "reposdisableImmutableReleases",
    description: "Disable immutable releases",
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
    name: "reposlistInvitations",
    description: "List repository invitations",
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
    name: "reposupdateInvitation",
    description: "Update a repository invitation",
    inputSchema: {
      type: "object",
      properties: {
        permissions: {
          type: "string",
          description: "The permissions that the associated user will have on the repository. Valid values are `read`, `write`, `maintain`, `triage`, and `admin`.",
          enum: ["read", "write", "maintain", "triage", "admin"],
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeleteInvitation",
    description: "Delete a repository invitation",
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
        invitation_id: {
          type: "string",
          description: "Path parameter: invitation_id",
        },
      },
      required: ["owner", "repo", "invitation_id"],
    },
  },
  {
    name: "reposlistDeployKeys",
    description: "List deploy keys",
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
    name: "reposcreateDeployKey",
    description: "Create a deploy key",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "A name for the key.",
        },
        key: {
          type: "string",
          description: "The contents of the key.",
        },
        read_only: {
          type: "boolean",
          description: "If `true`, the key will only be able to read repository contents. Otherwise, the key will be able to read and write.  
  
Deploy keys with write access can perform the same actions as an organization member with admin access, or a collaborator on a personal repository. For more information, see "[Repository permission levels for an organization](https://docs.github.com/articles/repository-permission-levels-for-an-organization/)" and "[Permission levels for a user account repository](https://docs.github.com/articles/permission-levels-for-a-user-account-repository/)."",
        },
      },
      required: ["key"],
    },
  },
  {
    name: "reposgetDeployKey",
    description: "Get a deploy key",
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
        key_id: {
          type: "string",
          description: "Path parameter: key_id",
        },
      },
      required: ["owner", "repo", "key_id"],
    },
  },
  {
    name: "reposdeleteDeployKey",
    description: "Delete a deploy key",
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
        key_id: {
          type: "string",
          description: "Path parameter: key_id",
        },
      },
      required: ["owner", "repo", "key_id"],
    },
  },
  {
    name: "reposlistLanguages",
    description: "List repository languages",
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
    name: "reposmergeUpstream",
    description: "Sync a fork branch with the upstream repository",
    inputSchema: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "The name of the branch which should be updated to match upstream.",
        },
      },
      required: ["branch"],
    },
  },
  {
    name: "reposmerge",
    description: "Merge a branch",
    inputSchema: {
      type: "object",
      properties: {
        base: {
          type: "string",
          description: "The name of the base branch that the head will be merged into.",
        },
        head: {
          type: "string",
          description: "The head to merge. This can be a branch name or a commit SHA1.",
        },
        commit_message: {
          type: "string",
          description: "Commit message to use for the merge commit. If omitted, a default message will be used.",
        },
      },
      required: ["base", "head"],
    },
  },
  {
    name: "reposgetPages",
    description: "Get a GitHub Pages site",
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
    name: "reposcreatePagesSite",
    description: "Create a GitHub Pages site",
    inputSchema: {
      type: "object",
      properties: {
        build_type: {
          type: "string",
          description: "The process in which the Page will be built. Possible values are `"legacy"` and `"workflow"`.",
          enum: ["legacy", "workflow"],
        },
        source: {
          type: "object",
          description: "The source branch and directory used to publish your Pages site.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposupdateInformationAboutPagesSite",
    description: "Update information about a GitHub Pages site",
    inputSchema: {
      type: "object",
      properties: {
        cname: {
          type: "string",
          description: "Specify a custom domain for the repository. Sending a `null` value will remove the custom domain. For more about custom domains, see "[Using a custom domain with GitHub Pages](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)."",
        },
        https_enforced: {
          type: "boolean",
          description: "Specify whether HTTPS should be enforced for the repository.",
        },
        build_type: {
          type: "string",
          description: "The process by which the GitHub Pages site will be built. `workflow` means that the site is built by a custom GitHub Actions workflow. `legacy` means that the site is built by GitHub when changes are pushed to a specific branch.",
          enum: ["legacy", "workflow"],
        },
        source: {
          type: "",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeletePagesSite",
    description: "Delete a GitHub Pages site",
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
    name: "reposlistPagesBuilds",
    description: "List GitHub Pages builds",
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
    name: "reposrequestPagesBuild",
    description: "Request a GitHub Pages build",
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
    name: "reposgetLatestPagesBuild",
    description: "Get latest Pages build",
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
    name: "reposgetPagesBuild",
    description: "Get GitHub Pages build",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        build_id: {
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
      required: ["build_id", "owner", "repo"],
    },
  },
  {
    name: "reposcreatePagesDeployment",
    description: "Create a GitHub Pages deployment",
    inputSchema: {
      type: "object",
      properties: {
        artifact_id: {
          type: "number",
          description: "The ID of an artifact that contains the .zip or .tar of static assets to deploy. The artifact belongs to the repository. Either `artifact_id` or `artifact_url` are required.",
        },
        artifact_url: {
          type: "string",
          description: "The URL of an artifact that contains the .zip or .tar of static assets to deploy. The artifact belongs to the repository. Either `artifact_id` or `artifact_url` are required.",
        },
        environment: {
          type: "string",
          description: "The target environment for this GitHub Pages deployment.",
        },
        pages_build_version: {
          type: "string",
          description: "A unique string that represents the version of the build for this deployment.",
        },
        oidc_token: {
          type: "string",
          description: "The OIDC token issued by GitHub Actions certifying the origin of the deployment.",
        },
      },
      required: ["pages_build_version", "oidc_token"],
    },
  },
  {
    name: "reposgetPagesDeployment",
    description: "Get the status of a GitHub Pages deployment",
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
        pages_deployment_id: {
          type: "string",
          description: "Path parameter: pages_deployment_id",
        },
      },
      required: ["owner", "repo", "pages_deployment_id"],
    },
  },
  {
    name: "reposcancelPagesDeployment",
    description: "Cancel a GitHub Pages deployment",
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
        pages_deployment_id: {
          type: "string",
          description: "Path parameter: pages_deployment_id",
        },
      },
      required: ["owner", "repo", "pages_deployment_id"],
    },
  },
  {
    name: "reposgetPagesHealthCheck",
    description: "Get a DNS health check for GitHub Pages",
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
    name: "reposcheckPrivateVulnerabilityReporting",
    description: "Check if private vulnerability reporting is enabled for a repository",
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
    name: "reposenablePrivateVulnerabilityReporting",
    description: "Enable private vulnerability reporting for a repository",
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
    name: "reposdisablePrivateVulnerabilityReporting",
    description: "Disable private vulnerability reporting for a repository",
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
    name: "reposcustomPropertiesForReposGetRepositoryValues",
    description: "Get all custom property values for a repository",
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
    name: "reposcustomPropertiesForReposCreateOrUpdateReposit",
    description: "Create or update custom property values for a repository",
    inputSchema: {
      type: "object",
      properties: {
        properties: {
          type: "array",
          description: "A list of custom property names and associated values to apply to the repositories.",
        },
      },
      required: ["properties"],
    },
  },
  {
    name: "reposgetReadme",
    description: "Get a repository README",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
          type: "string",
          description: "The name of the commit/branch/tag. Default: the repository’s default branch.",
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
    name: "reposgetReadmeInDirectory",
    description: "Get a repository README for a directory",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        dir: {
          type: "string",
          description: "The alternate path to look for a README file",
        },
        ref: {
          type: "string",
          description: "The name of the commit/branch/tag. Default: the repository’s default branch.",
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
      required: ["dir", "owner", "repo"],
    },
  },
  {
    name: "reposlistReleases",
    description: "List releases",
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
    name: "reposcreateRelease",
    description: "Create a release",
    inputSchema: {
      type: "object",
      properties: {
        tag_name: {
          type: "string",
          description: "The name of the tag.",
        },
        target_commitish: {
          type: "string",
          description: "Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists. Default: the repository's default branch.",
        },
        name: {
          type: "string",
          description: "The name of the release.",
        },
        body: {
          type: "string",
          description: "Text describing the contents of the tag.",
        },
        draft: {
          type: "boolean",
          description: "`true` to create a draft (unpublished) release, `false` to create a published one.",
        },
        prerelease: {
          type: "boolean",
          description: "`true` to identify the release as a prerelease. `false` to identify the release as a full release.",
        },
        discussion_category_name: {
          type: "string",
          description: "If specified, a discussion of the specified category is created and linked to the release. The value must be a category that already exists in the repository. For more information, see "[Managing categories for discussions in your repository](https://docs.github.com/discussions/managing-discussions-for-your-community/managing-categories-for-discussions-in-your-repository)."",
        },
        generate_release_notes: {
          type: "boolean",
          description: "Whether to automatically generate the name and body for this release. If `name` is specified, the specified name will be used; otherwise, a name will be automatically generated. If `body` is specified, the body will be pre-pended to the automatically generated notes.",
        },
        make_latest: {
          type: "string",
          description: "Specifies whether this release should be set as the latest release for the repository. Drafts and prereleases cannot be set as latest. Defaults to `true` for newly published releases. `legacy` specifies that the latest release should be determined based on the release creation date and higher semantic version.",
          enum: ["true", "false", "legacy"],
        },
      },
      required: ["tag_name"],
    },
  },
  {
    name: "reposgetReleaseAsset",
    description: "Get a release asset",
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
        asset_id: {
          type: "string",
          description: "Path parameter: asset_id",
        },
      },
      required: ["owner", "repo", "asset_id"],
    },
  },
  {
    name: "reposupdateReleaseAsset",
    description: "Update a release asset",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The file name of the asset.",
        },
        label: {
          type: "string",
          description: "An alternate short description of the asset. Used in place of the filename.",
        },
        state: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeleteReleaseAsset",
    description: "Delete a release asset",
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
        asset_id: {
          type: "string",
          description: "Path parameter: asset_id",
        },
      },
      required: ["owner", "repo", "asset_id"],
    },
  },
  {
    name: "reposgenerateReleaseNotes",
    description: "Generate release notes content for a release",
    inputSchema: {
      type: "object",
      properties: {
        tag_name: {
          type: "string",
          description: "The tag name for the release. This can be an existing tag or a new one.",
        },
        target_commitish: {
          type: "string",
          description: "Specifies the commitish value that will be the target for the release's tag. Required if the supplied tag_name does not reference an existing tag. Ignored if the tag_name already exists.",
        },
        previous_tag_name: {
          type: "string",
          description: "The name of the previous tag to use as the starting point for the release notes. Use to manually specify the range for the set of changes considered as part this release.",
        },
        configuration_file_path: {
          type: "string",
          description: "Specifies a path to a file in the repository containing configuration settings used for generating the release notes. If unspecified, the configuration file located in the repository at '.github/release.yml' or '.github/release.yaml' will be used. If that is not present, the default configuration will be used.",
        },
      },
      required: ["tag_name"],
    },
  },
  {
    name: "reposgetLatestRelease",
    description: "Get the latest release",
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
    name: "reposgetReleaseByTag",
    description: "Get a release by tag name",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        tag: {
          type: "string",
          description: "tag parameter",
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
      required: ["tag", "owner", "repo"],
    },
  },
  {
    name: "reposgetRelease",
    description: "Get a release",
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
      },
      required: ["owner", "repo", "release_id"],
    },
  },
  {
    name: "reposupdateRelease",
    description: "Update a release",
    inputSchema: {
      type: "object",
      properties: {
        tag_name: {
          type: "string",
          description: "The name of the tag.",
        },
        target_commitish: {
          type: "string",
          description: "Specifies the commitish value that determines where the Git tag is created from. Can be any branch or commit SHA. Unused if the Git tag already exists. Default: the repository's default branch.",
        },
        name: {
          type: "string",
          description: "The name of the release.",
        },
        body: {
          type: "string",
          description: "Text describing the contents of the tag.",
        },
        draft: {
          type: "boolean",
          description: "`true` makes the release a draft, and `false` publishes the release.",
        },
        prerelease: {
          type: "boolean",
          description: "`true` to identify the release as a prerelease, `false` to identify the release as a full release.",
        },
        make_latest: {
          type: "string",
          description: "Specifies whether this release should be set as the latest release for the repository. Drafts and prereleases cannot be set as latest. Defaults to `true` for newly published releases. `legacy` specifies that the latest release should be determined based on the release creation date and higher semantic version.",
          enum: ["true", "false", "legacy"],
        },
        discussion_category_name: {
          type: "string",
          description: "If specified, a discussion of the specified category is created and linked to the release. The value must be a category that already exists in the repository. If there is already a discussion linked to the release, this parameter is ignored. For more information, see "[Managing categories for discussions in your repository](https://docs.github.com/discussions/managing-discussions-for-your-community/managing-categories-for-discussions-in-your-repository)."",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeleteRelease",
    description: "Delete a release",
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
      },
      required: ["owner", "repo", "release_id"],
    },
  },
  {
    name: "reposlistReleaseAssets",
    description: "List release assets",
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
      },
      required: ["owner", "repo", "release_id"],
    },
  },
  {
    name: "reposuploadReleaseAsset",
    description: "Upload a release asset",
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
        label: {
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
      },
      required: ["name", "owner", "repo", "release_id"],
    },
  },
  {
    name: "reposgetBranchRules",
    description: "Get rules for a branch",
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
        branch: {
          type: "string",
          description: "Path parameter: branch",
        },
      },
      required: ["owner", "repo", "branch"],
    },
  },
  {
    name: "reposgetRepoRulesets",
    description: "Get all repository rulesets",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        includes_parents: {
          type: "boolean",
          description: "Include rulesets configured at higher levels that apply to this repository",
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
    name: "reposcreateRepoRuleset",
    description: "Create a repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the ruleset.",
        },
        target: {
          type: "string",
          description: "The target of the ruleset",
          enum: ["branch", "tag", "push"],
        },
        enforcement: {
          type: "",
          description: "",
        },
        bypass_actors: {
          type: "array",
          description: "The actors that can bypass the rules in this ruleset",
        },
        conditions: {
          type: "",
          description: "",
        },
        rules: {
          type: "array",
          description: "An array of rules within the ruleset.",
        },
      },
      required: ["name", "enforcement"],
    },
  },
  {
    name: "reposgetRepoRuleSuites",
    description: "List repository rule suites",
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
    name: "reposgetRepoRuleSuite",
    description: "Get a repository rule suite",
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
        rule_suite_id: {
          type: "string",
          description: "Path parameter: rule_suite_id",
        },
      },
      required: ["owner", "repo", "rule_suite_id"],
    },
  },
  {
    name: "reposgetRepoRuleset",
    description: "Get a repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ruleset_id: {
          type: "integer",
          description: "The ID of the ruleset.",
        },
        includes_parents: {
          type: "boolean",
          description: "Include rulesets configured at higher levels that apply to this repository",
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
      required: ["ruleset_id", "owner", "repo"],
    },
  },
  {
    name: "reposupdateRepoRuleset",
    description: "Update a repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the ruleset.",
        },
        target: {
          type: "string",
          description: "The target of the ruleset",
          enum: ["branch", "tag", "push"],
        },
        enforcement: {
          type: "",
          description: "",
        },
        bypass_actors: {
          type: "array",
          description: "The actors that can bypass the rules in this ruleset",
        },
        conditions: {
          type: "",
          description: "",
        },
        rules: {
          type: "array",
          description: "An array of rules within the ruleset.",
        },
      },
      required: [],
    },
  },
  {
    name: "reposdeleteRepoRuleset",
    description: "Delete a repository ruleset",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ruleset_id: {
          type: "integer",
          description: "The ID of the ruleset.",
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
      required: ["ruleset_id", "owner", "repo"],
    },
  },
  {
    name: "reposgetRepoRulesetHistory",
    description: "Get repository ruleset history",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ruleset_id: {
          type: "integer",
          description: "The ID of the ruleset.",
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
      required: ["ruleset_id", "owner", "repo"],
    },
  },
  {
    name: "reposgetRepoRulesetVersion",
    description: "Get repository ruleset version",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ruleset_id: {
          type: "integer",
          description: "The ID of the ruleset.",
        },
        version_id: {
          type: "integer",
          description: "The ID of the version",
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
      required: ["ruleset_id", "version_id", "owner", "repo"],
    },
  },
  {
    name: "reposgetCodeFrequencyStats",
    description: "Get the weekly commit activity",
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
    name: "reposgetCommitActivityStats",
    description: "Get the last year of commit activity",
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
    name: "reposgetContributorsStats",
    description: "Get all contributor commit activity",
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
    name: "reposgetParticipationStats",
    description: "Get the weekly commit count",
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
    name: "reposgetPunchCardStats",
    description: "Get the hourly commit count for each day",
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
    name: "reposcreateCommitStatus",
    description: "Create a commit status",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "The state of the status.",
          enum: ["error", "failure", "pending", "success"],
        },
        target_url: {
          type: "string",
          description: "The target URL to associate with this status. This URL will be linked from the GitHub UI to allow users to easily see the source of the status.  
For example, if your continuous integration system is posting build status, you would want to provide the deep link for the build output for this specific SHA:  
`http://ci.example.com/user/repo/build/sha`",
        },
        description: {
          type: "string",
          description: "A short description of the status.",
        },
        context: {
          type: "string",
          description: "A string label to differentiate this status from the status of other systems. This field is case-insensitive.",
        },
      },
      required: ["state"],
    },
  },
  {
    name: "reposlistTags",
    description: "List repository tags",
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
    name: "reposlistTagProtection",
    description: "Closing down - List tag protection states for a repository",
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
    name: "reposcreateTagProtection",
    description: "Closing down - Create a tag protection state for a repository",
    inputSchema: {
      type: "object",
      properties: {
        pattern: {
          type: "string",
          description: "An optional glob pattern to match against when enforcing tag protection.",
        },
      },
      required: ["pattern"],
    },
  },
  {
    name: "reposdeleteTagProtection",
    description: "Closing down - Delete a tag protection state for a repository",
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
        tag_protection_id: {
          type: "string",
          description: "Path parameter: tag_protection_id",
        },
      },
      required: ["owner", "repo", "tag_protection_id"],
    },
  },
  {
    name: "reposdownloadTarballArchive",
    description: "Download a repository archive (tar)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
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
      required: ["ref", "owner", "repo"],
    },
  },
  {
    name: "reposlistTeams",
    description: "List repository teams",
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
    name: "reposgetAllTopics",
    description: "Get all repository topics",
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
    name: "reposreplaceAllTopics",
    description: "Replace all repository topics",
    inputSchema: {
      type: "object",
      properties: {
        names: {
          type: "array",
          description: "An array of topics to add to the repository. Pass one or more topics to _replace_ the set of existing topics. Send an empty array (`[]`) to clear all topics from the repository. **Note:** Topic `names` will be saved as lowercase.",
        },
      },
      required: ["names"],
    },
  },
  {
    name: "reposgetClones",
    description: "Get repository clones",
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
    name: "reposgetTopPaths",
    description: "Get top referral paths",
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
    name: "reposgetTopReferrers",
    description: "Get top referral sources",
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
    name: "reposgetViews",
    description: "Get page views",
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
    name: "repostransfer",
    description: "Transfer a repository",
    inputSchema: {
      type: "object",
      properties: {
        new_owner: {
          type: "string",
          description: "The username or organization name the repository will be transferred to.",
        },
        new_name: {
          type: "string",
          description: "The new name to be given to the repository.",
        },
        team_ids: {
          type: "array",
          description: "ID of the team or teams to add to the repository. Teams can only be added to organization-owned repositories.",
        },
      },
      required: ["new_owner"],
    },
  },
  {
    name: "reposcheckVulnerabilityAlerts",
    description: "Check if vulnerability alerts are enabled for a repository",
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
    name: "reposenableVulnerabilityAlerts",
    description: "Enable vulnerability alerts",
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
    name: "reposdisableVulnerabilityAlerts",
    description: "Disable vulnerability alerts",
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
    name: "reposdownloadZipballArchive",
    description: "Download a repository archive (zip)",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ref: {
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
      required: ["ref", "owner", "repo"],
    },
  },
  {
    name: "reposcreateUsingTemplate",
    description: "Create a repository using a template",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "The organization or person who will own the new repository. To create a new repository in an organization, the authenticated user must be a member of the specified organization.",
        },
        name: {
          type: "string",
          description: "The name of the new repository.",
        },
        description: {
          type: "string",
          description: "A short description of the new repository.",
        },
        include_all_branches: {
          type: "boolean",
          description: "Set to `true` to include the directory structure and files from all branches in the template repository, and not just the default branch. Default: `false`.",
        },
        private: {
          type: "boolean",
          description: "Either `true` to create a new private repository or `false` to create a new public one.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "reposlistPublic",
    description: "List public repositories",
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
    name: "reposlistForAuthenticatedUser",
    description: "List repositories for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        visibility: {
          type: "string",
          description: "Limit results to repositories with the specified visibility.",
          enum: ["all", "public", "private"],
        },
        affiliation: {
          type: "string",
          description: "Comma-separated list of values. Can include:  
 * `owner`: Repositories that are owned by the authenticated user.  
 * `collaborator`: Repositories that the user has been added to as a collaborator.  
 * `organization_member`: Repositories that the user has access to through being a member of an organization. This includes every repository on every team that the user is on.",
        },
        type: {
          type: "string",
          description: "Limit results to repositories of the specified type. Will cause a `422` error if used in the same request as **visibility** or **affiliation**.",
          enum: ["all", "owner", "public", "private", "member"],
        },
        sort: {
          type: "string",
          description: "The property to sort the results by.",
          enum: ["created", "updated", "pushed", "full_name"],
        },
        direction: {
          type: "string",
          description: "The order to sort by. Default: `asc` when using `full_name`, otherwise `desc`.",
          enum: ["asc", "desc"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "reposcreateForAuthenticatedUser",
    description: "Create a repository for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the repository.",
        },
        description: {
          type: "string",
          description: "A short description of the repository.",
        },
        homepage: {
          type: "string",
          description: "A URL with more information about the repository.",
        },
        private: {
          type: "boolean",
          description: "Whether the repository is private.",
        },
        has_issues: {
          type: "boolean",
          description: "Whether issues are enabled.",
        },
        has_projects: {
          type: "boolean",
          description: "Whether projects are enabled.",
        },
        has_wiki: {
          type: "boolean",
          description: "Whether the wiki is enabled.",
        },
        has_discussions: {
          type: "boolean",
          description: "Whether discussions are enabled.",
        },
        team_id: {
          type: "integer",
          description: "The id of the team that will be granted access to this repository. This is only valid when creating a repository in an organization.",
        },
        auto_init: {
          type: "boolean",
          description: "Whether the repository is initialized with a minimal README.",
        },
        gitignore_template: {
          type: "string",
          description: "The desired language or platform to apply to the .gitignore.",
        },
        license_template: {
          type: "string",
          description: "The license keyword of the open source license for this repository.",
        },
        allow_squash_merge: {
          type: "boolean",
          description: "Whether to allow squash merges for pull requests.",
        },
        allow_merge_commit: {
          type: "boolean",
          description: "Whether to allow merge commits for pull requests.",
        },
        allow_rebase_merge: {
          type: "boolean",
          description: "Whether to allow rebase merges for pull requests.",
        },
        allow_auto_merge: {
          type: "boolean",
          description: "Whether to allow Auto-merge to be used on pull requests.",
        },
        delete_branch_on_merge: {
          type: "boolean",
          description: "Whether to delete head branches when pull requests are merged",
        },
        squash_merge_commit_title: {
          type: "string",
          description: "Required when using `squash_merge_commit_message`.

The default value for a squash merge commit title:

- `PR_TITLE` - default to the pull request's title.
- `COMMIT_OR_PR_TITLE` - default to the commit's title (if only one commit) or the pull request's title (when more than one commit).",
          enum: ["PR_TITLE", "COMMIT_OR_PR_TITLE"],
        },
        squash_merge_commit_message: {
          type: "string",
          description: "The default value for a squash merge commit message:

- `PR_BODY` - default to the pull request's body.
- `COMMIT_MESSAGES` - default to the branch's commit messages.
- `BLANK` - default to a blank commit message.",
          enum: ["PR_BODY", "COMMIT_MESSAGES", "BLANK"],
        },
        merge_commit_title: {
          type: "string",
          description: "Required when using `merge_commit_message`.

The default value for a merge commit title.

- `PR_TITLE` - default to the pull request's title.
- `MERGE_MESSAGE` - default to the classic title for a merge message (e.g., Merge pull request #123 from branch-name).",
          enum: ["PR_TITLE", "MERGE_MESSAGE"],
        },
        merge_commit_message: {
          type: "string",
          description: "The default value for a merge commit message.

- `PR_TITLE` - default to the pull request's title.
- `PR_BODY` - default to the pull request's body.
- `BLANK` - default to a blank commit message.",
          enum: ["PR_BODY", "PR_TITLE", "BLANK"],
        },
        has_downloads: {
          type: "boolean",
          description: "Whether downloads are enabled.",
        },
        is_template: {
          type: "boolean",
          description: "Whether this repository acts as a template that can be used to generate new repositories.",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "reposlistInvitationsForAuthenticatedUser",
    description: "List repository invitations for the authenticated user",
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
    name: "reposacceptInvitationForAuthenticatedUser",
    description: "Accept a repository invitation",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        invitation_id: {
          type: "string",
          description: "Path parameter: invitation_id",
        },
      },
      required: ["invitation_id"],
    },
  },
  {
    name: "reposdeclineInvitationForAuthenticatedUser",
    description: "Decline a repository invitation",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        invitation_id: {
          type: "string",
          description: "Path parameter: invitation_id",
        },
      },
      required: ["invitation_id"],
    },
  },
  {
    name: "reposlistForUser",
    description: "List repositories for a user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        type: {
          type: "string",
          description: "Limit results to repositories of the specified type.",
          enum: ["all", "owner", "member"],
        },
        sort: {
          type: "string",
          description: "The property to sort the results by.",
          enum: ["created", "updated", "pushed", "full_name"],
        },
        direction: {
          type: "string",
          description: "The order to sort by. Default: `asc` when using `full_name`, otherwise `desc`.",
          enum: ["asc", "desc"],
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
  const client = new GitHubv3RESTAPIreposClient(accessToken);

  try {
    switch (name) {
      case "reposlistForOrg": {
        const result = await client.reposlistForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateInOrg": {
        const result = await client.reposcreateInOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetOrgRulesets": {
        const result = await client.reposgetOrgRulesets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateOrgRuleset": {
        const result = await client.reposcreateOrgRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetOrgRuleSuites": {
        const result = await client.reposgetOrgRuleSuites(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetOrgRuleSuite": {
        const result = await client.reposgetOrgRuleSuite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetOrgRuleset": {
        const result = await client.reposgetOrgRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateOrgRuleset": {
        const result = await client.reposupdateOrgRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteOrgRuleset": {
        const result = await client.reposdeleteOrgRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposget": {
        const result = await client.reposget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdate": {
        const result = await client.reposupdate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdelete": {
        const result = await client.reposdelete(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistActivities": {
        const result = await client.reposlistActivities(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateAttestation": {
        const result = await client.reposcreateAttestation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistAttestations": {
        const result = await client.reposlistAttestations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistAutolinks": {
        const result = await client.reposlistAutolinks(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateAutolink": {
        const result = await client.reposcreateAutolink(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAutolink": {
        const result = await client.reposgetAutolink(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteAutolink": {
        const result = await client.reposdeleteAutolink(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcheckAutomatedSecurityFixes": {
        const result = await client.reposcheckAutomatedSecurityFixes(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposenableAutomatedSecurityFixes": {
        const result = await client.reposenableAutomatedSecurityFixes(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdisableAutomatedSecurityFixes": {
        const result = await client.reposdisableAutomatedSecurityFixes(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistBranches": {
        const result = await client.reposlistBranches(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetBranch": {
        const result = await client.reposgetBranch(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetBranchProtection": {
        const result = await client.reposgetBranchProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateBranchProtection": {
        const result = await client.reposupdateBranchProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteBranchProtection": {
        const result = await client.reposdeleteBranchProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAdminBranchProtection": {
        const result = await client.reposgetAdminBranchProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repossetAdminBranchProtection": {
        const result = await client.repossetAdminBranchProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteAdminBranchProtection": {
        const result = await client.reposdeleteAdminBranchProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetPullRequestReviewProtection": {
        const result = await client.reposgetPullRequestReviewProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdatePullRequestReviewProtection": {
        const result = await client.reposupdatePullRequestReviewProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeletePullRequestReviewProtection": {
        const result = await client.reposdeletePullRequestReviewProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCommitSignatureProtection": {
        const result = await client.reposgetCommitSignatureProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateCommitSignatureProtection": {
        const result = await client.reposcreateCommitSignatureProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteCommitSignatureProtection": {
        const result = await client.reposdeleteCommitSignatureProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetStatusChecksProtection": {
        const result = await client.reposgetStatusChecksProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateStatusCheckProtection": {
        const result = await client.reposupdateStatusCheckProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposremoveStatusCheckProtection": {
        const result = await client.reposremoveStatusCheckProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAllStatusCheckContexts": {
        const result = await client.reposgetAllStatusCheckContexts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposaddStatusCheckContexts": {
        const result = await client.reposaddStatusCheckContexts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repossetStatusCheckContexts": {
        const result = await client.repossetStatusCheckContexts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposremoveStatusCheckContexts": {
        const result = await client.reposremoveStatusCheckContexts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAccessRestrictions": {
        const result = await client.reposgetAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteAccessRestrictions": {
        const result = await client.reposdeleteAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAppsWithAccessToProtectedBranch": {
        const result = await client.reposgetAppsWithAccessToProtectedBranch(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposaddAppAccessRestrictions": {
        const result = await client.reposaddAppAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repossetAppAccessRestrictions": {
        const result = await client.repossetAppAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposremoveAppAccessRestrictions": {
        const result = await client.reposremoveAppAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetTeamsWithAccessToProtectedBranch": {
        const result = await client.reposgetTeamsWithAccessToProtectedBranch(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposaddTeamAccessRestrictions": {
        const result = await client.reposaddTeamAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repossetTeamAccessRestrictions": {
        const result = await client.repossetTeamAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposremoveTeamAccessRestrictions": {
        const result = await client.reposremoveTeamAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetUsersWithAccessToProtectedBranch": {
        const result = await client.reposgetUsersWithAccessToProtectedBranch(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposaddUserAccessRestrictions": {
        const result = await client.reposaddUserAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repossetUserAccessRestrictions": {
        const result = await client.repossetUserAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposremoveUserAccessRestrictions": {
        const result = await client.reposremoveUserAccessRestrictions(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposrenameBranch": {
        const result = await client.reposrenameBranch(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcodeownersErrors": {
        const result = await client.reposcodeownersErrors(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistCollaborators": {
        const result = await client.reposlistCollaborators(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcheckCollaborator": {
        const result = await client.reposcheckCollaborator(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposaddCollaborator": {
        const result = await client.reposaddCollaborator(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposremoveCollaborator": {
        const result = await client.reposremoveCollaborator(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCollaboratorPermissionLevel": {
        const result = await client.reposgetCollaboratorPermissionLevel(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistCommitCommentsForRepo": {
        const result = await client.reposlistCommitCommentsForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCommitComment": {
        const result = await client.reposgetCommitComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateCommitComment": {
        const result = await client.reposupdateCommitComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteCommitComment": {
        const result = await client.reposdeleteCommitComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistCommits": {
        const result = await client.reposlistCommits(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistBranchesForHeadCommit": {
        const result = await client.reposlistBranchesForHeadCommit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistCommentsForCommit": {
        const result = await client.reposlistCommentsForCommit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateCommitComment": {
        const result = await client.reposcreateCommitComment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistPullRequestsAssociatedWithCommit": {
        const result = await client.reposlistPullRequestsAssociatedWithCommit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCommit": {
        const result = await client.reposgetCommit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCombinedStatusForRef": {
        const result = await client.reposgetCombinedStatusForRef(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistCommitStatusesForRef": {
        const result = await client.reposlistCommitStatusesForRef(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCommunityProfileMetrics": {
        const result = await client.reposgetCommunityProfileMetrics(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcompareCommits": {
        const result = await client.reposcompareCommits(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetContent": {
        const result = await client.reposgetContent(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateOrUpdateFileContents": {
        const result = await client.reposcreateOrUpdateFileContents(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteFile": {
        const result = await client.reposdeleteFile(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistContributors": {
        const result = await client.reposlistContributors(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistDeployments": {
        const result = await client.reposlistDeployments(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateDeployment": {
        const result = await client.reposcreateDeployment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetDeployment": {
        const result = await client.reposgetDeployment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteDeployment": {
        const result = await client.reposdeleteDeployment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistDeploymentStatuses": {
        const result = await client.reposlistDeploymentStatuses(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateDeploymentStatus": {
        const result = await client.reposcreateDeploymentStatus(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetDeploymentStatus": {
        const result = await client.reposgetDeploymentStatus(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateDispatchEvent": {
        const result = await client.reposcreateDispatchEvent(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAllEnvironments": {
        const result = await client.reposgetAllEnvironments(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetEnvironment": {
        const result = await client.reposgetEnvironment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateOrUpdateEnvironment": {
        const result = await client.reposcreateOrUpdateEnvironment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteAnEnvironment": {
        const result = await client.reposdeleteAnEnvironment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistDeploymentBranchPolicies": {
        const result = await client.reposlistDeploymentBranchPolicies(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateDeploymentBranchPolicy": {
        const result = await client.reposcreateDeploymentBranchPolicy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetDeploymentBranchPolicy": {
        const result = await client.reposgetDeploymentBranchPolicy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateDeploymentBranchPolicy": {
        const result = await client.reposupdateDeploymentBranchPolicy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteDeploymentBranchPolicy": {
        const result = await client.reposdeleteDeploymentBranchPolicy(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAllDeploymentProtectionRules": {
        const result = await client.reposgetAllDeploymentProtectionRules(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateDeploymentProtectionRule": {
        const result = await client.reposcreateDeploymentProtectionRule(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistCustomDeploymentRuleIntegrations": {
        const result = await client.reposlistCustomDeploymentRuleIntegrations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCustomDeploymentProtectionRule": {
        const result = await client.reposgetCustomDeploymentProtectionRule(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdisableDeploymentProtectionRule": {
        const result = await client.reposdisableDeploymentProtectionRule(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistForks": {
        const result = await client.reposlistForks(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateFork": {
        const result = await client.reposcreateFork(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistWebhooks": {
        const result = await client.reposlistWebhooks(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateWebhook": {
        const result = await client.reposcreateWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetWebhook": {
        const result = await client.reposgetWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateWebhook": {
        const result = await client.reposupdateWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteWebhook": {
        const result = await client.reposdeleteWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetWebhookConfigForRepo": {
        const result = await client.reposgetWebhookConfigForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateWebhookConfigForRepo": {
        const result = await client.reposupdateWebhookConfigForRepo(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistWebhookDeliveries": {
        const result = await client.reposlistWebhookDeliveries(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetWebhookDelivery": {
        const result = await client.reposgetWebhookDelivery(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposredeliverWebhookDelivery": {
        const result = await client.reposredeliverWebhookDelivery(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repospingWebhook": {
        const result = await client.repospingWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repostestPushWebhook": {
        const result = await client.repostestPushWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcheckImmutableReleases": {
        const result = await client.reposcheckImmutableReleases(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposenableImmutableReleases": {
        const result = await client.reposenableImmutableReleases(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdisableImmutableReleases": {
        const result = await client.reposdisableImmutableReleases(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistInvitations": {
        const result = await client.reposlistInvitations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateInvitation": {
        const result = await client.reposupdateInvitation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteInvitation": {
        const result = await client.reposdeleteInvitation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistDeployKeys": {
        const result = await client.reposlistDeployKeys(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateDeployKey": {
        const result = await client.reposcreateDeployKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetDeployKey": {
        const result = await client.reposgetDeployKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteDeployKey": {
        const result = await client.reposdeleteDeployKey(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistLanguages": {
        const result = await client.reposlistLanguages(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposmergeUpstream": {
        const result = await client.reposmergeUpstream(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposmerge": {
        const result = await client.reposmerge(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetPages": {
        const result = await client.reposgetPages(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreatePagesSite": {
        const result = await client.reposcreatePagesSite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateInformationAboutPagesSite": {
        const result = await client.reposupdateInformationAboutPagesSite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeletePagesSite": {
        const result = await client.reposdeletePagesSite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistPagesBuilds": {
        const result = await client.reposlistPagesBuilds(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposrequestPagesBuild": {
        const result = await client.reposrequestPagesBuild(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetLatestPagesBuild": {
        const result = await client.reposgetLatestPagesBuild(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetPagesBuild": {
        const result = await client.reposgetPagesBuild(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreatePagesDeployment": {
        const result = await client.reposcreatePagesDeployment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetPagesDeployment": {
        const result = await client.reposgetPagesDeployment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcancelPagesDeployment": {
        const result = await client.reposcancelPagesDeployment(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetPagesHealthCheck": {
        const result = await client.reposgetPagesHealthCheck(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcheckPrivateVulnerabilityReporting": {
        const result = await client.reposcheckPrivateVulnerabilityReporting(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposenablePrivateVulnerabilityReporting": {
        const result = await client.reposenablePrivateVulnerabilityReporting(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdisablePrivateVulnerabilityReporting": {
        const result = await client.reposdisablePrivateVulnerabilityReporting(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcustomPropertiesForReposGetRepositoryValues": {
        const result = await client.reposcustomPropertiesForReposGetRepositoryValues(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcustomPropertiesForReposCreateOrUpdateReposit": {
        const result = await client.reposcustomPropertiesForReposCreateOrUpdateReposit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetReadme": {
        const result = await client.reposgetReadme(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetReadmeInDirectory": {
        const result = await client.reposgetReadmeInDirectory(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistReleases": {
        const result = await client.reposlistReleases(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateRelease": {
        const result = await client.reposcreateRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetReleaseAsset": {
        const result = await client.reposgetReleaseAsset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateReleaseAsset": {
        const result = await client.reposupdateReleaseAsset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteReleaseAsset": {
        const result = await client.reposdeleteReleaseAsset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgenerateReleaseNotes": {
        const result = await client.reposgenerateReleaseNotes(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetLatestRelease": {
        const result = await client.reposgetLatestRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetReleaseByTag": {
        const result = await client.reposgetReleaseByTag(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetRelease": {
        const result = await client.reposgetRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateRelease": {
        const result = await client.reposupdateRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteRelease": {
        const result = await client.reposdeleteRelease(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistReleaseAssets": {
        const result = await client.reposlistReleaseAssets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposuploadReleaseAsset": {
        const result = await client.reposuploadReleaseAsset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetBranchRules": {
        const result = await client.reposgetBranchRules(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetRepoRulesets": {
        const result = await client.reposgetRepoRulesets(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateRepoRuleset": {
        const result = await client.reposcreateRepoRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetRepoRuleSuites": {
        const result = await client.reposgetRepoRuleSuites(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetRepoRuleSuite": {
        const result = await client.reposgetRepoRuleSuite(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetRepoRuleset": {
        const result = await client.reposgetRepoRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposupdateRepoRuleset": {
        const result = await client.reposupdateRepoRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteRepoRuleset": {
        const result = await client.reposdeleteRepoRuleset(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetRepoRulesetHistory": {
        const result = await client.reposgetRepoRulesetHistory(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetRepoRulesetVersion": {
        const result = await client.reposgetRepoRulesetVersion(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCodeFrequencyStats": {
        const result = await client.reposgetCodeFrequencyStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetCommitActivityStats": {
        const result = await client.reposgetCommitActivityStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetContributorsStats": {
        const result = await client.reposgetContributorsStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetParticipationStats": {
        const result = await client.reposgetParticipationStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetPunchCardStats": {
        const result = await client.reposgetPunchCardStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateCommitStatus": {
        const result = await client.reposcreateCommitStatus(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistTags": {
        const result = await client.reposlistTags(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistTagProtection": {
        const result = await client.reposlistTagProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateTagProtection": {
        const result = await client.reposcreateTagProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeleteTagProtection": {
        const result = await client.reposdeleteTagProtection(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdownloadTarballArchive": {
        const result = await client.reposdownloadTarballArchive(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistTeams": {
        const result = await client.reposlistTeams(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetAllTopics": {
        const result = await client.reposgetAllTopics(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposreplaceAllTopics": {
        const result = await client.reposreplaceAllTopics(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetClones": {
        const result = await client.reposgetClones(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetTopPaths": {
        const result = await client.reposgetTopPaths(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetTopReferrers": {
        const result = await client.reposgetTopReferrers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposgetViews": {
        const result = await client.reposgetViews(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "repostransfer": {
        const result = await client.repostransfer(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcheckVulnerabilityAlerts": {
        const result = await client.reposcheckVulnerabilityAlerts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposenableVulnerabilityAlerts": {
        const result = await client.reposenableVulnerabilityAlerts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdisableVulnerabilityAlerts": {
        const result = await client.reposdisableVulnerabilityAlerts(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdownloadZipballArchive": {
        const result = await client.reposdownloadZipballArchive(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateUsingTemplate": {
        const result = await client.reposcreateUsingTemplate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistPublic": {
        const result = await client.reposlistPublic(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistForAuthenticatedUser": {
        const result = await client.reposlistForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposcreateForAuthenticatedUser": {
        const result = await client.reposcreateForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistInvitationsForAuthenticatedUser": {
        const result = await client.reposlistInvitationsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposacceptInvitationForAuthenticatedUser": {
        const result = await client.reposacceptInvitationForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposdeclineInvitationForAuthenticatedUser": {
        const result = await client.reposdeclineInvitationForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "reposlistForUser": {
        const result = await client.reposlistForUser(args as any);
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
  console.error("GitHub v3 REST API - repos MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
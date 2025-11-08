/**
 * MCP Server: GitHub v3 REST API - orgs
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
class GitHubv3RESTAPIorgsClient {
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
   * List organizations
   */
  async orgslist(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/organizations";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get all custom property values for an organization
   */
  async orgscustomPropertiesForOrgsGetOrganizationValues(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/organizations/{org}/org-properties/values";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update custom property values for an organization
   */
  async orgscustomPropertiesForOrgsCreateOrUpdateOrganizat(params: {
    properties: Array<any>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/organizations/{org}/org-properties/values";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an organization
   */
  async orgsget(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an organization
   */
  async orgsupdate(params: {
    billing_email?: string;
    company?: string;
    email?: string;
    twitter_username?: string;
    location?: string;
    name?: string;
    description?: string;
    has_organization_projects?: boolean;
    has_repository_projects?: boolean;
    default_repository_permission?: "read" | "write" | "admin" | "none";
    members_can_create_repositories?: boolean;
    members_can_create_internal_repositories?: boolean;
    members_can_create_private_repositories?: boolean;
    members_can_create_public_repositories?: boolean;
    members_allowed_repository_creation_type?: "all" | "private" | "none";
    members_can_create_pages?: boolean;
    members_can_create_public_pages?: boolean;
    members_can_create_private_pages?: boolean;
    members_can_fork_private_repositories?: boolean;
    web_commit_signoff_required?: boolean;
    blog?: string;
    advanced_security_enabled_for_new_repositories?: boolean;
    dependabot_alerts_enabled_for_new_repositories?: boolean;
    dependabot_security_updates_enabled_for_new_repositories?: boolean;
    dependency_graph_enabled_for_new_repositories?: boolean;
    secret_scanning_enabled_for_new_repositories?: boolean;
    secret_scanning_push_protection_enabled_for_new_repositories?: boolean;
    secret_scanning_push_protection_custom_link_enabled?: boolean;
    secret_scanning_push_protection_custom_link?: string;
    deploy_keys_enabled_for_repositories?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an organization
   */
  async orgsdelete(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create artifact metadata storage record
   */
  async orgscreateArtifactStorageRecord(params: {
    name: string;
    digest: string;
    version?: string;
    artifact_url?: string;
    path?: string;
    registry_url: string;
    repository?: string;
    status?: "active" | "eol" | "deleted";
    github_repository?: string;
  }): Promise<{
  total_count?: number;
  storage_records?: Array<{
    id?: number;
    name?: string;
    digest?: string;
    artifact_url?: string;
    registry_url?: string;
    repository?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
  }>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/artifacts/metadata/storage-record";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List artifact storage records
   */
  async orgslistArtifactStorageRecords(params: {
    None?: string;
    subject_digest: string;
    org: string;
  }): Promise<{
  total_count?: number;
  storage_records?: Array<{
    id?: number;
    name?: string;
    digest?: string;
    artifact_url?: string;
    registry_url?: string;
    repository?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
  }>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/artifacts/{subject_digest}/metadata/storage-records";
    path = path.replace("{{ subject_digest }}}", String(params.subject_digest));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List attestations by bulk subject digests
   */
  async orgslistAttestationsBulk(params: {
    subject_digests: Array<string>;
    predicate_type?: string;
  }): Promise<{
  attestations_subject_digests?: Record<string, any>;
  page_info?: {
    has_next?: boolean;
    has_previous?: boolean;
    next?: string;
    previous?: string;
  };
}> {

    // Build path with parameters
    let path = "/orgs/{org}/attestations/bulk-list";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete attestations in bulk
   */
  async orgsdeleteAttestationsBulk(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/attestations/delete-request";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete attestations by subject digest
   */
  async orgsdeleteAttestationsBySubjectDigest(params: {
    None?: string;
    subject_digest: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/attestations/digest/{subject_digest}";
    path = path.replace("{{ subject_digest }}}", String(params.subject_digest));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List attestation repositories
   */
  async orgslistAttestationRepositories(params: {
    None?: string;
    predicate_type?: string;
    org: string;
  }): Promise<Array<{
  id?: number;
  name?: string;
}>> {

    // Build path with parameters
    let path = "/orgs/{org}/attestations/repositories";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete attestations by ID
   */
  async orgsdeleteAttestationsById(params: {
    None?: string;
    attestation_id: number;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/attestations/{attestation_id}";
    path = path.replace("{{ attestation_id }}}", String(params.attestation_id));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List attestations
   */
  async orgslistAttestations(params: {
    None?: string;
    subject_digest: string;
    predicate_type?: string;
    org: string;
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
    let path = "/orgs/{org}/attestations/{subject_digest}";
    path = path.replace("{{ subject_digest }}}", String(params.subject_digest));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List users blocked by an organization
   */
  async orgslistBlockedUsers(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/blocks";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if a user is blocked by an organization
   */
  async orgscheckBlockedUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/blocks/{username}";
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
   * Block a user from an organization
   */
  async orgsblockUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/blocks/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Unblock a user from an organization
   */
  async orgsunblockUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/blocks/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List failed organization invitations
   */
  async orgslistFailedInvitations(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/failed_invitations";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization webhooks
   */
  async orgslistWebhooks(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an organization webhook
   */
  async orgscreateWebhook(params: {
    name: string;
    config: {
  url: any;
  content_type?: any;
  secret?: any;
  insecure_ssl?: any;
  username?: string;
  password?: string;
};
    events?: Array<string>;
    active?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an organization webhook
   */
  async orgsgetWebhook(params: {
    None?: string;
    org: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an organization webhook
   */
  async orgsupdateWebhook(params: {
    config?: {
  url: any;
  content_type?: any;
  secret?: any;
  insecure_ssl?: any;
};
    events?: Array<string>;
    active?: boolean;
    name?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an organization webhook
   */
  async orgsdeleteWebhook(params: {
    None?: string;
    org: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a webhook configuration for an organization
   */
  async orgsgetWebhookConfigForOrg(params: {
    None?: string;
    org: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}/config";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update a webhook configuration for an organization
   */
  async orgsupdateWebhookConfigForOrg(params: {
    url?: any;
    content_type?: any;
    secret?: any;
    insecure_ssl?: any;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}/config";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List deliveries for an organization webhook
   */
  async orgslistWebhookDeliveries(params: {
    None?: string;
    org: string;
    hook_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}/deliveries";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a webhook delivery for an organization webhook
   */
  async orgsgetWebhookDelivery(params: {
    None?: string;
    org: string;
    hook_id: string;
    delivery_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}";
    path = path.replace("{{ org }}}", String(params.org));
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
   * Redeliver a delivery for an organization webhook
   */
  async orgsredeliverWebhookDelivery(params: {
    None?: string;
    org: string;
    hook_id: string;
    delivery_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts";
    path = path.replace("{{ org }}}", String(params.org));
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
   * Ping an organization webhook
   */
  async orgspingWebhook(params: {
    None?: string;
    org: string;
    hook_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/hooks/{hook_id}/pings";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ hook_id }}}", String(params.hook_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get route stats by actor
   */
  async apiInsightsgetRouteStatsByActor(params: {
    None?: string;
    org: string;
    actor_type: string;
    actor_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/route-stats/{actor_type}/{actor_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ actor_type }}}", String(params.actor_type));
    path = path.replace("{{ actor_id }}}", String(params.actor_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get subject stats
   */
  async apiInsightsgetSubjectStats(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/subject-stats";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get summary stats
   */
  async apiInsightsgetSummaryStats(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/summary-stats";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get summary stats by user
   */
  async apiInsightsgetSummaryStatsByUser(params: {
    None?: string;
    org: string;
    user_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/summary-stats/users/{user_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ user_id }}}", String(params.user_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get summary stats by actor
   */
  async apiInsightsgetSummaryStatsByActor(params: {
    None?: string;
    org: string;
    actor_type: string;
    actor_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/summary-stats/{actor_type}/{actor_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ actor_type }}}", String(params.actor_type));
    path = path.replace("{{ actor_id }}}", String(params.actor_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get time stats
   */
  async apiInsightsgetTimeStats(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/time-stats";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get time stats by user
   */
  async apiInsightsgetTimeStatsByUser(params: {
    None?: string;
    org: string;
    user_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/time-stats/users/{user_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ user_id }}}", String(params.user_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get time stats by actor
   */
  async apiInsightsgetTimeStatsByActor(params: {
    None?: string;
    org: string;
    actor_type: string;
    actor_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/time-stats/{actor_type}/{actor_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ actor_type }}}", String(params.actor_type));
    path = path.replace("{{ actor_id }}}", String(params.actor_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get user stats
   */
  async apiInsightsgetUserStats(params: {
    None?: string;
    org: string;
    user_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/insights/api/user-stats/{user_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ user_id }}}", String(params.user_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List app installations for an organization
   */
  async orgslistAppInstallations(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  installations: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/installations";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List pending organization invitations
   */
  async orgslistPendingInvitations(params: {
    None?: string;
    role?: "all" | "admin" | "direct_member" | "billing_manager" | "hiring_manager";
    invitation_source?: "all" | "member" | "scim";
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/invitations";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create an organization invitation
   */
  async orgscreateInvitation(params: {
    invitee_id?: number;
    email?: string;
    role?: "admin" | "direct_member" | "billing_manager" | "reinstate";
    team_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/invitations";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Cancel an organization invitation
   */
  async orgscancelInvitation(params: {
    None?: string;
    org: string;
    invitation_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/invitations/{invitation_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ invitation_id }}}", String(params.invitation_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization invitation teams
   */
  async orgslistInvitationTeams(params: {
    None?: string;
    org: string;
    invitation_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/invitations/{invitation_id}/teams";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ invitation_id }}}", String(params.invitation_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List issue types for an organization
   */
  async orgslistIssueTypes(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/issue-types";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create issue type for an organization
   */
  async orgscreateIssueType(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/issue-types";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Update issue type for an organization
   */
  async orgsupdateIssueType(params: {
    None?: string;
    org: string;
    issue_type_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/issue-types/{issue_type_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ issue_type_id }}}", String(params.issue_type_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete issue type for an organization
   */
  async orgsdeleteIssueType(params: {
    None?: string;
    org: string;
    issue_type_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/issue-types/{issue_type_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ issue_type_id }}}", String(params.issue_type_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organization members
   */
  async orgslistMembers(params: {
    None?: string;
    filter?: "2fa_disabled" | "2fa_insecure" | "all";
    role?: "all" | "admin" | "member";
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/members";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check organization membership for a user
   */
  async orgscheckMembershipForUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/members/{username}";
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
   * Remove an organization member
   */
  async orgsremoveMember(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/members/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get organization membership for a user
   */
  async orgsgetMembershipForUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/memberships/{username}";
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
   * Set organization membership for a user
   */
  async orgssetMembershipForUser(params: {
    role?: "admin" | "member";
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/memberships/{username}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove organization membership for a user
   */
  async orgsremoveMembershipForUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/memberships/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get all organization roles for an organization
   */
  async orgslistOrgRoles(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count?: number;
  roles?: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Remove all organization roles for a team
   */
  async orgsrevokeAllOrgRolesTeam(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/teams/{team_slug}";
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
   * Assign an organization role to a team
   */
  async orgsassignTeamToOrgRole(params: {
    None?: string;
    org: string;
    team_slug: string;
    role_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/teams/{team_slug}/{role_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ role_id }}}", String(params.role_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove an organization role from a team
   */
  async orgsrevokeOrgRoleTeam(params: {
    None?: string;
    org: string;
    team_slug: string;
    role_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/teams/{team_slug}/{role_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));
    path = path.replace("{{ role_id }}}", String(params.role_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Remove all organization roles for a user
   */
  async orgsrevokeAllOrgRolesUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/users/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Assign an organization role to a user
   */
  async orgsassignUserToOrgRole(params: {
    None?: string;
    org: string;
    username: string;
    role_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/users/{username}/{role_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ role_id }}}", String(params.role_id));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove an organization role from a user
   */
  async orgsrevokeOrgRoleUser(params: {
    None?: string;
    org: string;
    username: string;
    role_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/users/{username}/{role_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ role_id }}}", String(params.role_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization role
   */
  async orgsgetOrgRole(params: {
    None?: string;
    org: string;
    role_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/{role_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ role_id }}}", String(params.role_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List teams that are assigned to an organization role
   */
  async orgslistOrgRoleTeams(params: {
    None?: string;
    org: string;
    role_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/{role_id}/teams";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ role_id }}}", String(params.role_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List users that are assigned to an organization role
   */
  async orgslistOrgRoleUsers(params: {
    None?: string;
    org: string;
    role_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/organization-roles/{role_id}/users";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ role_id }}}", String(params.role_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List outside collaborators for an organization
   */
  async orgslistOutsideCollaborators(params: {
    None?: string;
    filter?: "2fa_disabled" | "2fa_insecure" | "all";
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/outside_collaborators";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Convert an organization member to outside collaborator
   */
  async orgsconvertMemberToOutsideCollaborator(params: {
    async?: boolean;
  }): Promise<Record<string, any>> {

    // Build path with parameters
    let path = "/orgs/{org}/outside_collaborators/{username}";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove outside collaborator from an organization
   */
  async orgsremoveOutsideCollaborator(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/outside_collaborators/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List requests to access organization resources with fine-grained personal access tokens
   */
  async orgslistPatGrantRequests(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-token-requests";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Review requests to access organization resources with fine-grained personal access tokens
   */
  async orgsreviewPatGrantRequestsInBulk(params: {
    pat_request_ids?: Array<number>;
    action: "approve" | "deny";
    reason?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-token-requests";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Review a request to access organization resources with a fine-grained personal access token
   */
  async orgsreviewPatGrantRequest(params: {
    action: "approve" | "deny";
    reason?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-token-requests/{pat_request_id}";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repositories requested to be accessed by a fine-grained personal access token
   */
  async orgslistPatGrantRequestRepositories(params: {
    None?: string;
    pat_request_id: number;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories";
    path = path.replace("{{ pat_request_id }}}", String(params.pat_request_id));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List fine-grained personal access tokens with access to organization resources
   */
  async orgslistPatGrants(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-tokens";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update the access to organization resources via fine-grained personal access tokens
   */
  async orgsupdatePatAccesses(params: {
    action: "revoke";
    pat_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-tokens";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Update the access a fine-grained personal access token has to organization resources
   */
  async orgsupdatePatAccess(params: {
    action: "revoke";
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-tokens/{pat_id}";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List repositories a fine-grained personal access token has access to
   */
  async orgslistPatGrantRepositories(params: {
    None?: string;
    pat_id: number;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/personal-access-tokens/{pat_id}/repositories";
    path = path.replace("{{ pat_id }}}", String(params.pat_id));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get all custom properties for an organization
   */
  async orgscustomPropertiesForReposGetOrganizationDefinit(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/properties/schema";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update custom properties for an organization
   */
  async orgscustomPropertiesForReposCreateOrUpdateOrganiza(params: {
    properties: Array<any>;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/properties/schema";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a custom property for an organization
   */
  async orgscustomPropertiesForReposGetOrganizationDefinit(params: {
    None?: string;
    org: string;
    custom_property_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/properties/schema/{custom_property_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ custom_property_name }}}", String(params.custom_property_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update a custom property for an organization
   */
  async orgscustomPropertiesForReposCreateOrUpdateOrganiza(params: {
    None?: string;
    org: string;
    custom_property_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/properties/schema/{custom_property_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ custom_property_name }}}", String(params.custom_property_name));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a custom property for an organization
   */
  async orgscustomPropertiesForReposDeleteOrganizationDefi(params: {
    None?: string;
    org: string;
    custom_property_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/properties/schema/{custom_property_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ custom_property_name }}}", String(params.custom_property_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List custom property values for organization repositories
   */
  async orgscustomPropertiesForReposGetOrganizationValues(params: {
    None?: string;
    repository_query?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/properties/values";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create or update custom property values for organization repositories
   */
  async orgscustomPropertiesForReposCreateOrUpdateOrganiza(params: {
    repository_names: Array<string>;
    properties: Array<any>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/properties/values";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List public organization members
   */
  async orgslistPublicMembers(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/public_members";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check public organization membership for a user
   */
  async orgscheckPublicMembershipForUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/public_members/{username}";
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
   * Set public organization membership for the authenticated user
   */
  async orgssetPublicMembershipForAuthenticatedUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/public_members/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove public organization membership for the authenticated user
   */
  async orgsremovePublicMembershipForAuthenticatedUser(params: {
    None?: string;
    org: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/public_members/{username}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get organization ruleset history
   */
  async orgsgetOrgRulesetHistory(params: {
    None?: string;
    ruleset_id: number;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets/{ruleset_id}/history";
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
   * Get organization ruleset version
   */
  async orgsgetOrgRulesetVersion(params: {
    None?: string;
    ruleset_id: number;
    version_id: number;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/rulesets/{ruleset_id}/history/{version_id}";
    path = path.replace("{{ ruleset_id }}}", String(params.ruleset_id));
    path = path.replace("{{ version_id }}}", String(params.version_id));
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List security manager teams
   */
  async orgslistSecurityManagerTeams(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/security-managers";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add a security manager team
   */
  async orgsaddSecurityManagerTeam(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/security-managers/teams/{team_slug}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ team_slug }}}", String(params.team_slug));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Remove a security manager team
   */
  async orgsremoveSecurityManagerTeam(params: {
    None?: string;
    org: string;
    team_slug: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/security-managers/teams/{team_slug}";
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
   * Get immutable releases settings for an organization
   */
  async orgsgetImmutableReleasesSettings(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/immutable-releases";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set immutable releases settings for an organization
   */
  async orgssetImmutableReleasesSettings(params: {
    enforced_repositories: "all" | "none" | "selected";
    selected_repository_ids?: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/immutable-releases";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List selected repositories for immutable releases enforcement
   */
  async orgsgetImmutableReleasesSettingsRepositories(params: {
    None?: string;
    org: string;
  }): Promise<{
  total_count: number;
  repositories: Array<any>;
}> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/immutable-releases/repositories";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set selected repositories for immutable releases enforcement
   */
  async orgssetImmutableReleasesSettingsRepositories(params: {
    selected_repository_ids: Array<number>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/immutable-releases/repositories";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Enable a selected repository for immutable releases in an organization
   */
  async orgsenableSelectedRepositoryImmutableReleasesOrgan(params: {
    None?: string;
    org: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/immutable-releases/repositories/{repository_id}";
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
   * Disable a selected repository for immutable releases in an organization
   */
  async orgsdisableSelectedRepositoryImmutableReleasesOrga(params: {
    None?: string;
    org: string;
    repository_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/settings/immutable-releases/repositories/{repository_id}";
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
   * Enable or disable a security feature for an organization
   */
  async orgsenableOrDisableSecurityProductOnAllOrgRepos(params: {
    None?: string;
    org: string;
    security_product: string;
    enablement: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/{security_product}/{enablement}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ security_product }}}", String(params.security_product));
    path = path.replace("{{ enablement }}}", String(params.enablement));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List organization memberships for the authenticated user
   */
  async orgslistMembershipsForAuthenticatedUser(params: {
    state?: "active" | "pending";
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/memberships/orgs";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an organization membership for the authenticated user
   */
  async orgsgetMembershipForAuthenticatedUser(params: {
    None?: string;
    org: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/memberships/orgs/{org}";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update an organization membership for the authenticated user
   */
  async orgsupdateMembershipForAuthenticatedUser(params: {
    state: "active";
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/memberships/orgs/{org}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List organizations for the authenticated user
   */
  async orgslistForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/orgs";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List organizations for a user
   */
  async orgslistForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/orgs";
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
    name: "github-v3-rest-api---orgs-19",
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
    name: "orgslist",
    description: "List organizations",
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
    name: "orgscustomPropertiesForOrgsGetOrganizationValues",
    description: "Get all custom property values for an organization",
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
    name: "orgscustomPropertiesForOrgsCreateOrUpdateOrganizat",
    description: "Create or update custom property values for an organization",
    inputSchema: {
      type: "object",
      properties: {
        properties: {
          type: "array",
          description: "A list of custom property names and associated values to apply to the organization.",
        },
      },
      required: ["properties"],
    },
  },
  {
    name: "orgsget",
    description: "Get an organization",
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
    name: "orgsupdate",
    description: "Update an organization",
    inputSchema: {
      type: "object",
      properties: {
        billing_email: {
          type: "string",
          description: "Billing email address. This address is not publicized.",
        },
        company: {
          type: "string",
          description: "The company name.",
        },
        email: {
          type: "string",
          description: "The publicly visible email address.",
        },
        twitter_username: {
          type: "string",
          description: "The Twitter username of the company.",
        },
        location: {
          type: "string",
          description: "The location.",
        },
        name: {
          type: "string",
          description: "The shorthand name of the company.",
        },
        description: {
          type: "string",
          description: "The description of the company. The maximum size is 160 characters.",
        },
        has_organization_projects: {
          type: "boolean",
          description: "Whether an organization can use organization projects.",
        },
        has_repository_projects: {
          type: "boolean",
          description: "Whether repositories that belong to the organization can use repository projects.",
        },
        default_repository_permission: {
          type: "string",
          description: "Default permission level members have for organization repositories.",
          enum: ["read", "write", "admin", "none"],
        },
        members_can_create_repositories: {
          type: "boolean",
          description: "Whether of non-admin organization members can create repositories. **Note:** A parameter can override this parameter. See `members_allowed_repository_creation_type` in this table for details.",
        },
        members_can_create_internal_repositories: {
          type: "boolean",
          description: "Whether organization members can create internal repositories, which are visible to all enterprise members. You can only allow members to create internal repositories if your organization is associated with an enterprise account using GitHub Enterprise Cloud or GitHub Enterprise Server 2.20+. For more information, see "[Restricting repository creation in your organization](https://docs.github.com/github/setting-up-and-managing-organizations-and-teams/restricting-repository-creation-in-your-organization)" in the GitHub Help documentation.",
        },
        members_can_create_private_repositories: {
          type: "boolean",
          description: "Whether organization members can create private repositories, which are visible to organization members with permission. For more information, see "[Restricting repository creation in your organization](https://docs.github.com/github/setting-up-and-managing-organizations-and-teams/restricting-repository-creation-in-your-organization)" in the GitHub Help documentation.",
        },
        members_can_create_public_repositories: {
          type: "boolean",
          description: "Whether organization members can create public repositories, which are visible to anyone. For more information, see "[Restricting repository creation in your organization](https://docs.github.com/github/setting-up-and-managing-organizations-and-teams/restricting-repository-creation-in-your-organization)" in the GitHub Help documentation.",
        },
        members_allowed_repository_creation_type: {
          type: "string",
          description: "Specifies which types of repositories non-admin organization members can create. `private` is only available to repositories that are part of an organization on GitHub Enterprise Cloud. 
**Note:** This parameter is closing down and will be removed in the future. Its return value ignores internal repositories. Using this parameter overrides values set in `members_can_create_repositories`. See the parameter deprecation notice in the operation description for details.",
          enum: ["all", "private", "none"],
        },
        members_can_create_pages: {
          type: "boolean",
          description: "Whether organization members can create GitHub Pages sites. Existing published sites will not be impacted.",
        },
        members_can_create_public_pages: {
          type: "boolean",
          description: "Whether organization members can create public GitHub Pages sites. Existing published sites will not be impacted.",
        },
        members_can_create_private_pages: {
          type: "boolean",
          description: "Whether organization members can create private GitHub Pages sites. Existing published sites will not be impacted.",
        },
        members_can_fork_private_repositories: {
          type: "boolean",
          description: "Whether organization members can fork private organization repositories.",
        },
        web_commit_signoff_required: {
          type: "boolean",
          description: "Whether contributors to organization repositories are required to sign off on commits they make through GitHub's web interface.",
        },
        blog: {
          type: "string",
          description: "",
        },
        advanced_security_enabled_for_new_repositories: {
          type: "boolean",
          description: "**Endpoint closing down notice.** Please use [code security configurations](https://docs.github.com/rest/code-security/configurations) instead.

Whether GitHub Advanced Security is automatically enabled for new repositories and repositories transferred to this organization.

To use this parameter, you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository. For more information, see "[Managing security managers in your organization](https://docs.github.com/organizations/managing-peoples-access-to-your-organization-with-roles/managing-security-managers-in-your-organization)."

You can check which security and analysis features are currently enabled by using a `GET /orgs/{org}` request.",
        },
        dependabot_alerts_enabled_for_new_repositories: {
          type: "boolean",
          description: "**Endpoint closing down notice.** Please use [code security configurations](https://docs.github.com/rest/code-security/configurations) instead.

Whether Dependabot alerts are automatically enabled for new repositories and repositories transferred to this organization.

To use this parameter, you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository. For more information, see "[Managing security managers in your organization](https://docs.github.com/organizations/managing-peoples-access-to-your-organization-with-roles/managing-security-managers-in-your-organization)."

You can check which security and analysis features are currently enabled by using a `GET /orgs/{org}` request.",
        },
        dependabot_security_updates_enabled_for_new_repositories: {
          type: "boolean",
          description: "**Endpoint closing down notice.** Please use [code security configurations](https://docs.github.com/rest/code-security/configurations) instead.

Whether Dependabot security updates are automatically enabled for new repositories and repositories transferred to this organization.

To use this parameter, you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository. For more information, see "[Managing security managers in your organization](https://docs.github.com/organizations/managing-peoples-access-to-your-organization-with-roles/managing-security-managers-in-your-organization)."

You can check which security and analysis features are currently enabled by using a `GET /orgs/{org}` request.",
        },
        dependency_graph_enabled_for_new_repositories: {
          type: "boolean",
          description: "**Endpoint closing down notice.** Please use [code security configurations](https://docs.github.com/rest/code-security/configurations) instead.

Whether dependency graph is automatically enabled for new repositories and repositories transferred to this organization.

To use this parameter, you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository. For more information, see "[Managing security managers in your organization](https://docs.github.com/organizations/managing-peoples-access-to-your-organization-with-roles/managing-security-managers-in-your-organization)."

You can check which security and analysis features are currently enabled by using a `GET /orgs/{org}` request.",
        },
        secret_scanning_enabled_for_new_repositories: {
          type: "boolean",
          description: "**Endpoint closing down notice.** Please use [code security configurations](https://docs.github.com/rest/code-security/configurations) instead.

Whether secret scanning is automatically enabled for new repositories and repositories transferred to this organization.

To use this parameter, you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository. For more information, see "[Managing security managers in your organization](https://docs.github.com/organizations/managing-peoples-access-to-your-organization-with-roles/managing-security-managers-in-your-organization)."

You can check which security and analysis features are currently enabled by using a `GET /orgs/{org}` request.",
        },
        secret_scanning_push_protection_enabled_for_new_repositories: {
          type: "boolean",
          description: "**Endpoint closing down notice.** Please use [code security configurations](https://docs.github.com/rest/code-security/configurations) instead.

Whether secret scanning push protection is automatically enabled for new repositories and repositories transferred to this organization.

To use this parameter, you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository. For more information, see "[Managing security managers in your organization](https://docs.github.com/organizations/managing-peoples-access-to-your-organization-with-roles/managing-security-managers-in-your-organization)."

You can check which security and analysis features are currently enabled by using a `GET /orgs/{org}` request.",
        },
        secret_scanning_push_protection_custom_link_enabled: {
          type: "boolean",
          description: "Whether a custom link is shown to contributors who are blocked from pushing a secret by push protection.",
        },
        secret_scanning_push_protection_custom_link: {
          type: "string",
          description: "If `secret_scanning_push_protection_custom_link_enabled` is true, the URL that will be displayed to contributors who are blocked from pushing a secret.",
        },
        deploy_keys_enabled_for_repositories: {
          type: "boolean",
          description: "Controls whether or not deploy keys may be added and used for repositories in the organization.",
        },
      },
      required: [],
    },
  },
  {
    name: "orgsdelete",
    description: "Delete an organization",
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
    name: "orgscreateArtifactStorageRecord",
    description: "Create artifact metadata storage record",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the artifact.",
        },
        digest: {
          type: "string",
          description: "The digest of the artifact (algorithm:hex-encoded-digest).",
        },
        version: {
          type: "string",
          description: "The artifact version.",
        },
        artifact_url: {
          type: "string",
          description: "The URL where the artifact is stored.",
        },
        path: {
          type: "string",
          description: "The path of the artifact.",
        },
        registry_url: {
          type: "string",
          description: "The base URL of the artifact registry.",
        },
        repository: {
          type: "string",
          description: "The repository name within the registry.",
        },
        status: {
          type: "string",
          description: "The status of the artifact (e.g., active, inactive).",
          enum: ["active", "eol", "deleted"],
        },
        github_repository: {
          type: "string",
          description: "The name of the GitHub repository associated with the artifact. This should be used
when there are no provenance attestations available for the artifact. The repository
must belong to the organization specified in the path parameter.

If a provenance attestation is available for the artifact, the API will use
the repository information from the attestation instead of this parameter.",
        },
      },
      required: ["name", "digest", "registry_url"],
    },
  },
  {
    name: "orgslistArtifactStorageRecords",
    description: "List artifact storage records",
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
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["subject_digest", "org"],
    },
  },
  {
    name: "orgslistAttestationsBulk",
    description: "List attestations by bulk subject digests",
    inputSchema: {
      type: "object",
      properties: {
        subject_digests: {
          type: "array",
          description: "List of subject digests to fetch attestations for.",
        },
        predicate_type: {
          type: "string",
          description: "Optional filter for fetching attestations with a given predicate type.
This option accepts `provenance`, `sbom`, `release`, or freeform text
for custom predicate types.",
        },
      },
      required: ["subject_digests"],
    },
  },
  {
    name: "orgsdeleteAttestationsBulk",
    description: "Delete attestations in bulk",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "orgsdeleteAttestationsBySubjectDigest",
    description: "Delete attestations by subject digest",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        subject_digest: {
          type: "string",
          description: "Subject Digest",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["subject_digest", "org"],
    },
  },
  {
    name: "orgslistAttestationRepositories",
    description: "List attestation repositories",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        predicate_type: {
          type: "string",
          description: "Optional filter for fetching attestations with a given predicate type.
This option accepts `provenance`, `sbom`, `release`, or freeform text
for custom predicate types.",
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
    name: "orgsdeleteAttestationsById",
    description: "Delete attestations by ID",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        attestation_id: {
          type: "integer",
          description: "Attestation ID",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["attestation_id", "org"],
    },
  },
  {
    name: "orgslistAttestations",
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
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["subject_digest", "org"],
    },
  },
  {
    name: "orgslistBlockedUsers",
    description: "List users blocked by an organization",
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
    name: "orgscheckBlockedUser",
    description: "Check if a user is blocked by an organization",
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
    name: "orgsblockUser",
    description: "Block a user from an organization",
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
    name: "orgsunblockUser",
    description: "Unblock a user from an organization",
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
    name: "orgslistFailedInvitations",
    description: "List failed organization invitations",
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
    name: "orgslistWebhooks",
    description: "List organization webhooks",
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
    name: "orgscreateWebhook",
    description: "Create an organization webhook",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Must be passed as "web".",
        },
        config: {
          type: "object",
          description: "Key/value pairs to provide settings for this webhook.",
        },
        events: {
          type: "array",
          description: "Determines what [events](https://docs.github.com/webhooks/event-payloads) the hook is triggered for. Set to `["*"]` to receive all possible events.",
        },
        active: {
          type: "boolean",
          description: "Determines if notifications are sent when the webhook is triggered. Set to `true` to send notifications.",
        },
      },
      required: ["name", "config"],
    },
  },
  {
    name: "orgsgetWebhook",
    description: "Get an organization webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["org", "hook_id"],
    },
  },
  {
    name: "orgsupdateWebhook",
    description: "Update an organization webhook",
    inputSchema: {
      type: "object",
      properties: {
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
        name: {
          type: "string",
          description: "",
        },
      },
      required: [],
    },
  },
  {
    name: "orgsdeleteWebhook",
    description: "Delete an organization webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["org", "hook_id"],
    },
  },
  {
    name: "orgsgetWebhookConfigForOrg",
    description: "Get a webhook configuration for an organization",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["org", "hook_id"],
    },
  },
  {
    name: "orgsupdateWebhookConfigForOrg",
    description: "Update a webhook configuration for an organization",
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
    name: "orgslistWebhookDeliveries",
    description: "List deliveries for an organization webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["org", "hook_id"],
    },
  },
  {
    name: "orgsgetWebhookDelivery",
    description: "Get a webhook delivery for an organization webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
        delivery_id: {
          type: "string",
          description: "Path parameter: delivery_id",
        },
      },
      required: ["org", "hook_id", "delivery_id"],
    },
  },
  {
    name: "orgsredeliverWebhookDelivery",
    description: "Redeliver a delivery for an organization webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
        delivery_id: {
          type: "string",
          description: "Path parameter: delivery_id",
        },
      },
      required: ["org", "hook_id", "delivery_id"],
    },
  },
  {
    name: "orgspingWebhook",
    description: "Ping an organization webhook",
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
        hook_id: {
          type: "string",
          description: "Path parameter: hook_id",
        },
      },
      required: ["org", "hook_id"],
    },
  },
  {
    name: "apiInsightsgetRouteStatsByActor",
    description: "Get route stats by actor",
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
        actor_type: {
          type: "string",
          description: "Path parameter: actor_type",
        },
        actor_id: {
          type: "string",
          description: "Path parameter: actor_id",
        },
      },
      required: ["org", "actor_type", "actor_id"],
    },
  },
  {
    name: "apiInsightsgetSubjectStats",
    description: "Get subject stats",
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
    name: "apiInsightsgetSummaryStats",
    description: "Get summary stats",
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
    name: "apiInsightsgetSummaryStatsByUser",
    description: "Get summary stats by user",
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
        user_id: {
          type: "string",
          description: "Path parameter: user_id",
        },
      },
      required: ["org", "user_id"],
    },
  },
  {
    name: "apiInsightsgetSummaryStatsByActor",
    description: "Get summary stats by actor",
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
        actor_type: {
          type: "string",
          description: "Path parameter: actor_type",
        },
        actor_id: {
          type: "string",
          description: "Path parameter: actor_id",
        },
      },
      required: ["org", "actor_type", "actor_id"],
    },
  },
  {
    name: "apiInsightsgetTimeStats",
    description: "Get time stats",
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
    name: "apiInsightsgetTimeStatsByUser",
    description: "Get time stats by user",
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
        user_id: {
          type: "string",
          description: "Path parameter: user_id",
        },
      },
      required: ["org", "user_id"],
    },
  },
  {
    name: "apiInsightsgetTimeStatsByActor",
    description: "Get time stats by actor",
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
        actor_type: {
          type: "string",
          description: "Path parameter: actor_type",
        },
        actor_id: {
          type: "string",
          description: "Path parameter: actor_id",
        },
      },
      required: ["org", "actor_type", "actor_id"],
    },
  },
  {
    name: "apiInsightsgetUserStats",
    description: "Get user stats",
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
        user_id: {
          type: "string",
          description: "Path parameter: user_id",
        },
      },
      required: ["org", "user_id"],
    },
  },
  {
    name: "orgslistAppInstallations",
    description: "List app installations for an organization",
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
    name: "orgslistPendingInvitations",
    description: "List pending organization invitations",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        role: {
          type: "string",
          description: "Filter invitations by their member role.",
          enum: ["all", "admin", "direct_member", "billing_manager", "hiring_manager"],
        },
        invitation_source: {
          type: "string",
          description: "Filter invitations by their invitation source.",
          enum: ["all", "member", "scim"],
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
    name: "orgscreateInvitation",
    description: "Create an organization invitation",
    inputSchema: {
      type: "object",
      properties: {
        invitee_id: {
          type: "integer",
          description: "**Required unless you provide `email`**. GitHub user ID for the person you are inviting.",
        },
        email: {
          type: "string",
          description: "**Required unless you provide `invitee_id`**. Email address of the person you are inviting, which can be an existing GitHub user.",
        },
        role: {
          type: "string",
          description: "The role for the new member. 
 * `admin` - Organization owners with full administrative rights to the organization and complete access to all repositories and teams.  
 * `direct_member` - Non-owner organization members with ability to see other members and join teams by invitation.  
 * `billing_manager` - Non-owner organization members with ability to manage the billing settings of your organization. 
 * `reinstate` - The previous role assigned to the invitee before they were removed from your organization. Can be one of the roles listed above. Only works if the invitee was previously part of your organization.",
          enum: ["admin", "direct_member", "billing_manager", "reinstate"],
        },
        team_ids: {
          type: "array",
          description: "Specify IDs for the teams you want to invite new members to.",
        },
      },
      required: [],
    },
  },
  {
    name: "orgscancelInvitation",
    description: "Cancel an organization invitation",
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
        invitation_id: {
          type: "string",
          description: "Path parameter: invitation_id",
        },
      },
      required: ["org", "invitation_id"],
    },
  },
  {
    name: "orgslistInvitationTeams",
    description: "List organization invitation teams",
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
        invitation_id: {
          type: "string",
          description: "Path parameter: invitation_id",
        },
      },
      required: ["org", "invitation_id"],
    },
  },
  {
    name: "orgslistIssueTypes",
    description: "List issue types for an organization",
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
    name: "orgscreateIssueType",
    description: "Create issue type for an organization",
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
    name: "orgsupdateIssueType",
    description: "Update issue type for an organization",
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
        issue_type_id: {
          type: "string",
          description: "Path parameter: issue_type_id",
        },
      },
      required: ["org", "issue_type_id"],
    },
  },
  {
    name: "orgsdeleteIssueType",
    description: "Delete issue type for an organization",
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
        issue_type_id: {
          type: "string",
          description: "Path parameter: issue_type_id",
        },
      },
      required: ["org", "issue_type_id"],
    },
  },
  {
    name: "orgslistMembers",
    description: "List organization members",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        filter: {
          type: "string",
          description: "Filter members returned in the list. `2fa_disabled` means that only members without [two-factor authentication](https://github.com/blog/1614-two-factor-authentication) enabled will be returned. `2fa_insecure` means that only members with [insecure 2FA methods](https://docs.github.com/organizations/keeping-your-organization-secure/managing-two-factor-authentication-for-your-organization/requiring-two-factor-authentication-in-your-organization#requiring-secure-methods-of-two-factor-authentication-in-your-organization) will be returned. These options are only available for organization owners.",
          enum: ["2fa_disabled", "2fa_insecure", "all"],
        },
        role: {
          type: "string",
          description: "Filter members returned by their role.",
          enum: ["all", "admin", "member"],
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
    name: "orgscheckMembershipForUser",
    description: "Check organization membership for a user",
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
    name: "orgsremoveMember",
    description: "Remove an organization member",
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
    name: "orgsgetMembershipForUser",
    description: "Get organization membership for a user",
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
    name: "orgssetMembershipForUser",
    description: "Set organization membership for a user",
    inputSchema: {
      type: "object",
      properties: {
        role: {
          type: "string",
          description: "The role to give the user in the organization. Can be one of:  
 * `admin` - The user will become an owner of the organization.  
 * `member` - The user will become a non-owner member of the organization.",
          enum: ["admin", "member"],
        },
      },
      required: [],
    },
  },
  {
    name: "orgsremoveMembershipForUser",
    description: "Remove organization membership for a user",
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
    name: "orgslistOrgRoles",
    description: "Get all organization roles for an organization",
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
    name: "orgsrevokeAllOrgRolesTeam",
    description: "Remove all organization roles for a team",
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
    name: "orgsassignTeamToOrgRole",
    description: "Assign an organization role to a team",
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
        role_id: {
          type: "string",
          description: "Path parameter: role_id",
        },
      },
      required: ["org", "team_slug", "role_id"],
    },
  },
  {
    name: "orgsrevokeOrgRoleTeam",
    description: "Remove an organization role from a team",
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
        role_id: {
          type: "string",
          description: "Path parameter: role_id",
        },
      },
      required: ["org", "team_slug", "role_id"],
    },
  },
  {
    name: "orgsrevokeAllOrgRolesUser",
    description: "Remove all organization roles for a user",
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
    name: "orgsassignUserToOrgRole",
    description: "Assign an organization role to a user",
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
        role_id: {
          type: "string",
          description: "Path parameter: role_id",
        },
      },
      required: ["org", "username", "role_id"],
    },
  },
  {
    name: "orgsrevokeOrgRoleUser",
    description: "Remove an organization role from a user",
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
        role_id: {
          type: "string",
          description: "Path parameter: role_id",
        },
      },
      required: ["org", "username", "role_id"],
    },
  },
  {
    name: "orgsgetOrgRole",
    description: "Get an organization role",
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
        role_id: {
          type: "string",
          description: "Path parameter: role_id",
        },
      },
      required: ["org", "role_id"],
    },
  },
  {
    name: "orgslistOrgRoleTeams",
    description: "List teams that are assigned to an organization role",
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
        role_id: {
          type: "string",
          description: "Path parameter: role_id",
        },
      },
      required: ["org", "role_id"],
    },
  },
  {
    name: "orgslistOrgRoleUsers",
    description: "List users that are assigned to an organization role",
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
        role_id: {
          type: "string",
          description: "Path parameter: role_id",
        },
      },
      required: ["org", "role_id"],
    },
  },
  {
    name: "orgslistOutsideCollaborators",
    description: "List outside collaborators for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        filter: {
          type: "string",
          description: "Filter the list of outside collaborators. `2fa_disabled` means that only outside collaborators without [two-factor authentication](https://github.com/blog/1614-two-factor-authentication) enabled will be returned. `2fa_insecure` means that only outside collaborators with [insecure 2FA methods](https://docs.github.com/organizations/keeping-your-organization-secure/managing-two-factor-authentication-for-your-organization/requiring-two-factor-authentication-in-your-organization#requiring-secure-methods-of-two-factor-authentication-in-your-organization) will be returned.",
          enum: ["2fa_disabled", "2fa_insecure", "all"],
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
    name: "orgsconvertMemberToOutsideCollaborator",
    description: "Convert an organization member to outside collaborator",
    inputSchema: {
      type: "object",
      properties: {
        async: {
          type: "boolean",
          description: "When set to `true`, the request will be performed asynchronously. Returns a 202 status code when the job is successfully queued.",
        },
      },
      required: [],
    },
  },
  {
    name: "orgsremoveOutsideCollaborator",
    description: "Remove outside collaborator from an organization",
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
    name: "orgslistPatGrantRequests",
    description: "List requests to access organization resources with fine-grained personal access tokens",
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
    name: "orgsreviewPatGrantRequestsInBulk",
    description: "Review requests to access organization resources with fine-grained personal access tokens",
    inputSchema: {
      type: "object",
      properties: {
        pat_request_ids: {
          type: "array",
          description: "Unique identifiers of the requests for access via fine-grained personal access token. Must be formed of between 1 and 100 `pat_request_id` values.",
        },
        action: {
          type: "string",
          description: "Action to apply to the requests.",
          enum: ["approve", "deny"],
        },
        reason: {
          type: "string",
          description: "Reason for approving or denying the requests. Max 1024 characters.",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "orgsreviewPatGrantRequest",
    description: "Review a request to access organization resources with a fine-grained personal access token",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "Action to apply to the request.",
          enum: ["approve", "deny"],
        },
        reason: {
          type: "string",
          description: "Reason for approving or denying the request. Max 1024 characters.",
        },
      },
      required: ["action"],
    },
  },
  {
    name: "orgslistPatGrantRequestRepositories",
    description: "List repositories requested to be accessed by a fine-grained personal access token",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        pat_request_id: {
          type: "integer",
          description: "Unique identifier of the request for access via fine-grained personal access token.",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["pat_request_id", "org"],
    },
  },
  {
    name: "orgslistPatGrants",
    description: "List fine-grained personal access tokens with access to organization resources",
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
    name: "orgsupdatePatAccesses",
    description: "Update the access to organization resources via fine-grained personal access tokens",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "Action to apply to the fine-grained personal access token.",
          enum: ["revoke"],
        },
        pat_ids: {
          type: "array",
          description: "The IDs of the fine-grained personal access tokens.",
        },
      },
      required: ["action", "pat_ids"],
    },
  },
  {
    name: "orgsupdatePatAccess",
    description: "Update the access a fine-grained personal access token has to organization resources",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description: "Action to apply to the fine-grained personal access token.",
          enum: ["revoke"],
        },
      },
      required: ["action"],
    },
  },
  {
    name: "orgslistPatGrantRepositories",
    description: "List repositories a fine-grained personal access token has access to",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        pat_id: {
          type: "integer",
          description: "Unique identifier of the fine-grained personal access token.",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["pat_id", "org"],
    },
  },
  {
    name: "orgscustomPropertiesForReposGetOrganizationDefinit",
    description: "Get all custom properties for an organization",
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
    name: "orgscustomPropertiesForReposCreateOrUpdateOrganiza",
    description: "Create or update custom properties for an organization",
    inputSchema: {
      type: "object",
      properties: {
        properties: {
          type: "array",
          description: "The array of custom properties to create or update.",
        },
      },
      required: ["properties"],
    },
  },
  {
    name: "orgscustomPropertiesForReposGetOrganizationDefinit",
    description: "Get a custom property for an organization",
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
        custom_property_name: {
          type: "string",
          description: "Path parameter: custom_property_name",
        },
      },
      required: ["org", "custom_property_name"],
    },
  },
  {
    name: "orgscustomPropertiesForReposCreateOrUpdateOrganiza",
    description: "Create or update a custom property for an organization",
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
        custom_property_name: {
          type: "string",
          description: "Path parameter: custom_property_name",
        },
      },
      required: ["org", "custom_property_name"],
    },
  },
  {
    name: "orgscustomPropertiesForReposDeleteOrganizationDefi",
    description: "Remove a custom property for an organization",
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
        custom_property_name: {
          type: "string",
          description: "Path parameter: custom_property_name",
        },
      },
      required: ["org", "custom_property_name"],
    },
  },
  {
    name: "orgscustomPropertiesForReposGetOrganizationValues",
    description: "List custom property values for organization repositories",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        repository_query: {
          type: "string",
          description: "Finds repositories in the organization with a query containing one or more search keywords and qualifiers. Qualifiers allow you to limit your search to specific areas of GitHub. The REST API supports the same qualifiers as the web interface for GitHub. To learn more about the format of the query, see [Constructing a search query](https://docs.github.com/rest/search/search#constructing-a-search-query). See "[Searching for repositories](https://docs.github.com/articles/searching-for-repositories/)" for a detailed list of qualifiers.",
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
    name: "orgscustomPropertiesForReposCreateOrUpdateOrganiza",
    description: "Create or update custom property values for organization repositories",
    inputSchema: {
      type: "object",
      properties: {
        repository_names: {
          type: "array",
          description: "The names of repositories that the custom property values will be applied to.",
        },
        properties: {
          type: "array",
          description: "List of custom property names and associated values to apply to the repositories.",
        },
      },
      required: ["repository_names", "properties"],
    },
  },
  {
    name: "orgslistPublicMembers",
    description: "List public organization members",
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
    name: "orgscheckPublicMembershipForUser",
    description: "Check public organization membership for a user",
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
    name: "orgssetPublicMembershipForAuthenticatedUser",
    description: "Set public organization membership for the authenticated user",
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
    name: "orgsremovePublicMembershipForAuthenticatedUser",
    description: "Remove public organization membership for the authenticated user",
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
    name: "orgsgetOrgRulesetHistory",
    description: "Get organization ruleset history",
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
    name: "orgsgetOrgRulesetVersion",
    description: "Get organization ruleset version",
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
        org: {
          type: "string",
          description: "Path parameter: org",
        },
      },
      required: ["ruleset_id", "version_id", "org"],
    },
  },
  {
    name: "orgslistSecurityManagerTeams",
    description: "List security manager teams",
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
    name: "orgsaddSecurityManagerTeam",
    description: "Add a security manager team",
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
    name: "orgsremoveSecurityManagerTeam",
    description: "Remove a security manager team",
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
    name: "orgsgetImmutableReleasesSettings",
    description: "Get immutable releases settings for an organization",
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
    name: "orgssetImmutableReleasesSettings",
    description: "Set immutable releases settings for an organization",
    inputSchema: {
      type: "object",
      properties: {
        enforced_repositories: {
          type: "string",
          description: "The policy that controls how immutable releases are enforced in the organization.",
          enum: ["all", "none", "selected"],
        },
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids for which immutable releases enforcement should be applied. You can only provide a list of repository ids when the `enforced_repositories` is set to `selected`. You can add and remove individual repositories using the [Enable a selected repository for immutable releases in an organization](https://docs.github.com/rest/orgs/orgs#enable-a-selected-repository-for-immutable-releases-in-an-organization) and [Disable a selected repository for immutable releases in an organization](https://docs.github.com/rest/orgs/orgs#disable-a-selected-repository-for-immutable-releases-in-an-organization) endpoints.",
        },
      },
      required: ["enforced_repositories"],
    },
  },
  {
    name: "orgsgetImmutableReleasesSettingsRepositories",
    description: "List selected repositories for immutable releases enforcement",
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
    name: "orgssetImmutableReleasesSettingsRepositories",
    description: "Set selected repositories for immutable releases enforcement",
    inputSchema: {
      type: "object",
      properties: {
        selected_repository_ids: {
          type: "array",
          description: "An array of repository ids for which immutable releases enforcement should be applied. You can only provide a list of repository ids when the `enforced_repositories` is set to `selected`. You can add and remove individual repositories using the [Enable a selected repository for immutable releases in an organization](https://docs.github.com/rest/orgs/orgs#enable-a-selected-repository-for-immutable-releases-in-an-organization) and [Disable a selected repository for immutable releases in an organization](https://docs.github.com/rest/orgs/orgs#disable-a-selected-repository-for-immutable-releases-in-an-organization) endpoints.",
        },
      },
      required: ["selected_repository_ids"],
    },
  },
  {
    name: "orgsenableSelectedRepositoryImmutableReleasesOrgan",
    description: "Enable a selected repository for immutable releases in an organization",
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
    name: "orgsdisableSelectedRepositoryImmutableReleasesOrga",
    description: "Disable a selected repository for immutable releases in an organization",
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
    name: "orgsenableOrDisableSecurityProductOnAllOrgRepos",
    description: "Enable or disable a security feature for an organization",
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
        security_product: {
          type: "string",
          description: "Path parameter: security_product",
        },
        enablement: {
          type: "string",
          description: "Path parameter: enablement",
        },
      },
      required: ["org", "security_product", "enablement"],
    },
  },
  {
    name: "orgslistMembershipsForAuthenticatedUser",
    description: "List organization memberships for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "Indicates the state of the memberships to return. If not specified, the API returns both active and pending memberships.",
          enum: ["active", "pending"],
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
    name: "orgsgetMembershipForAuthenticatedUser",
    description: "Get an organization membership for the authenticated user",
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
    name: "orgsupdateMembershipForAuthenticatedUser",
    description: "Update an organization membership for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "The state that the membership should be in. Only `"active"` will be accepted.",
          enum: ["active"],
        },
      },
      required: ["state"],
    },
  },
  {
    name: "orgslistForAuthenticatedUser",
    description: "List organizations for the authenticated user",
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
    name: "orgslistForUser",
    description: "List organizations for a user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
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
  const client = new GitHubv3RESTAPIorgsClient(accessToken);

  try {
    switch (name) {
      case "orgslist": {
        const result = await client.orgslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForOrgsGetOrganizationValues": {
        const result = await client.orgscustomPropertiesForOrgsGetOrganizationValues(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForOrgsCreateOrUpdateOrganizat": {
        const result = await client.orgscustomPropertiesForOrgsCreateOrUpdateOrganizat(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsget": {
        const result = await client.orgsget(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsupdate": {
        const result = await client.orgsupdate(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsdelete": {
        const result = await client.orgsdelete(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscreateArtifactStorageRecord": {
        const result = await client.orgscreateArtifactStorageRecord(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistArtifactStorageRecords": {
        const result = await client.orgslistArtifactStorageRecords(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistAttestationsBulk": {
        const result = await client.orgslistAttestationsBulk(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsdeleteAttestationsBulk": {
        const result = await client.orgsdeleteAttestationsBulk(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsdeleteAttestationsBySubjectDigest": {
        const result = await client.orgsdeleteAttestationsBySubjectDigest(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistAttestationRepositories": {
        const result = await client.orgslistAttestationRepositories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsdeleteAttestationsById": {
        const result = await client.orgsdeleteAttestationsById(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistAttestations": {
        const result = await client.orgslistAttestations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistBlockedUsers": {
        const result = await client.orgslistBlockedUsers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscheckBlockedUser": {
        const result = await client.orgscheckBlockedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsblockUser": {
        const result = await client.orgsblockUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsunblockUser": {
        const result = await client.orgsunblockUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistFailedInvitations": {
        const result = await client.orgslistFailedInvitations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistWebhooks": {
        const result = await client.orgslistWebhooks(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscreateWebhook": {
        const result = await client.orgscreateWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetWebhook": {
        const result = await client.orgsgetWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsupdateWebhook": {
        const result = await client.orgsupdateWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsdeleteWebhook": {
        const result = await client.orgsdeleteWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetWebhookConfigForOrg": {
        const result = await client.orgsgetWebhookConfigForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsupdateWebhookConfigForOrg": {
        const result = await client.orgsupdateWebhookConfigForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistWebhookDeliveries": {
        const result = await client.orgslistWebhookDeliveries(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetWebhookDelivery": {
        const result = await client.orgsgetWebhookDelivery(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsredeliverWebhookDelivery": {
        const result = await client.orgsredeliverWebhookDelivery(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgspingWebhook": {
        const result = await client.orgspingWebhook(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetRouteStatsByActor": {
        const result = await client.apiInsightsgetRouteStatsByActor(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetSubjectStats": {
        const result = await client.apiInsightsgetSubjectStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetSummaryStats": {
        const result = await client.apiInsightsgetSummaryStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetSummaryStatsByUser": {
        const result = await client.apiInsightsgetSummaryStatsByUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetSummaryStatsByActor": {
        const result = await client.apiInsightsgetSummaryStatsByActor(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetTimeStats": {
        const result = await client.apiInsightsgetTimeStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetTimeStatsByUser": {
        const result = await client.apiInsightsgetTimeStatsByUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetTimeStatsByActor": {
        const result = await client.apiInsightsgetTimeStatsByActor(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "apiInsightsgetUserStats": {
        const result = await client.apiInsightsgetUserStats(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistAppInstallations": {
        const result = await client.orgslistAppInstallations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistPendingInvitations": {
        const result = await client.orgslistPendingInvitations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscreateInvitation": {
        const result = await client.orgscreateInvitation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscancelInvitation": {
        const result = await client.orgscancelInvitation(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistInvitationTeams": {
        const result = await client.orgslistInvitationTeams(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistIssueTypes": {
        const result = await client.orgslistIssueTypes(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscreateIssueType": {
        const result = await client.orgscreateIssueType(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsupdateIssueType": {
        const result = await client.orgsupdateIssueType(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsdeleteIssueType": {
        const result = await client.orgsdeleteIssueType(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistMembers": {
        const result = await client.orgslistMembers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscheckMembershipForUser": {
        const result = await client.orgscheckMembershipForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsremoveMember": {
        const result = await client.orgsremoveMember(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetMembershipForUser": {
        const result = await client.orgsgetMembershipForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgssetMembershipForUser": {
        const result = await client.orgssetMembershipForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsremoveMembershipForUser": {
        const result = await client.orgsremoveMembershipForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistOrgRoles": {
        const result = await client.orgslistOrgRoles(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsrevokeAllOrgRolesTeam": {
        const result = await client.orgsrevokeAllOrgRolesTeam(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsassignTeamToOrgRole": {
        const result = await client.orgsassignTeamToOrgRole(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsrevokeOrgRoleTeam": {
        const result = await client.orgsrevokeOrgRoleTeam(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsrevokeAllOrgRolesUser": {
        const result = await client.orgsrevokeAllOrgRolesUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsassignUserToOrgRole": {
        const result = await client.orgsassignUserToOrgRole(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsrevokeOrgRoleUser": {
        const result = await client.orgsrevokeOrgRoleUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetOrgRole": {
        const result = await client.orgsgetOrgRole(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistOrgRoleTeams": {
        const result = await client.orgslistOrgRoleTeams(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistOrgRoleUsers": {
        const result = await client.orgslistOrgRoleUsers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistOutsideCollaborators": {
        const result = await client.orgslistOutsideCollaborators(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsconvertMemberToOutsideCollaborator": {
        const result = await client.orgsconvertMemberToOutsideCollaborator(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsremoveOutsideCollaborator": {
        const result = await client.orgsremoveOutsideCollaborator(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistPatGrantRequests": {
        const result = await client.orgslistPatGrantRequests(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsreviewPatGrantRequestsInBulk": {
        const result = await client.orgsreviewPatGrantRequestsInBulk(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsreviewPatGrantRequest": {
        const result = await client.orgsreviewPatGrantRequest(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistPatGrantRequestRepositories": {
        const result = await client.orgslistPatGrantRequestRepositories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistPatGrants": {
        const result = await client.orgslistPatGrants(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsupdatePatAccesses": {
        const result = await client.orgsupdatePatAccesses(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsupdatePatAccess": {
        const result = await client.orgsupdatePatAccess(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistPatGrantRepositories": {
        const result = await client.orgslistPatGrantRepositories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForReposGetOrganizationDefinit": {
        const result = await client.orgscustomPropertiesForReposGetOrganizationDefinit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForReposCreateOrUpdateOrganiza": {
        const result = await client.orgscustomPropertiesForReposCreateOrUpdateOrganiza(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForReposGetOrganizationDefinit": {
        const result = await client.orgscustomPropertiesForReposGetOrganizationDefinit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForReposCreateOrUpdateOrganiza": {
        const result = await client.orgscustomPropertiesForReposCreateOrUpdateOrganiza(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForReposDeleteOrganizationDefi": {
        const result = await client.orgscustomPropertiesForReposDeleteOrganizationDefi(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForReposGetOrganizationValues": {
        const result = await client.orgscustomPropertiesForReposGetOrganizationValues(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscustomPropertiesForReposCreateOrUpdateOrganiza": {
        const result = await client.orgscustomPropertiesForReposCreateOrUpdateOrganiza(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistPublicMembers": {
        const result = await client.orgslistPublicMembers(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgscheckPublicMembershipForUser": {
        const result = await client.orgscheckPublicMembershipForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgssetPublicMembershipForAuthenticatedUser": {
        const result = await client.orgssetPublicMembershipForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsremovePublicMembershipForAuthenticatedUser": {
        const result = await client.orgsremovePublicMembershipForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetOrgRulesetHistory": {
        const result = await client.orgsgetOrgRulesetHistory(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetOrgRulesetVersion": {
        const result = await client.orgsgetOrgRulesetVersion(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistSecurityManagerTeams": {
        const result = await client.orgslistSecurityManagerTeams(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsaddSecurityManagerTeam": {
        const result = await client.orgsaddSecurityManagerTeam(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsremoveSecurityManagerTeam": {
        const result = await client.orgsremoveSecurityManagerTeam(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetImmutableReleasesSettings": {
        const result = await client.orgsgetImmutableReleasesSettings(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgssetImmutableReleasesSettings": {
        const result = await client.orgssetImmutableReleasesSettings(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetImmutableReleasesSettingsRepositories": {
        const result = await client.orgsgetImmutableReleasesSettingsRepositories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgssetImmutableReleasesSettingsRepositories": {
        const result = await client.orgssetImmutableReleasesSettingsRepositories(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsenableSelectedRepositoryImmutableReleasesOrgan": {
        const result = await client.orgsenableSelectedRepositoryImmutableReleasesOrgan(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsdisableSelectedRepositoryImmutableReleasesOrga": {
        const result = await client.orgsdisableSelectedRepositoryImmutableReleasesOrga(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsenableOrDisableSecurityProductOnAllOrgRepos": {
        const result = await client.orgsenableOrDisableSecurityProductOnAllOrgRepos(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistMembershipsForAuthenticatedUser": {
        const result = await client.orgslistMembershipsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsgetMembershipForAuthenticatedUser": {
        const result = await client.orgsgetMembershipForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgsupdateMembershipForAuthenticatedUser": {
        const result = await client.orgsupdateMembershipForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistForAuthenticatedUser": {
        const result = await client.orgslistForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "orgslistForUser": {
        const result = await client.orgslistForUser(args as any);
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
  console.error("GitHub v3 REST API - orgs MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
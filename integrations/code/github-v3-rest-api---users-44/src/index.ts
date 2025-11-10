/**
 * MCP Server: GitHub v3 REST API - users
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
class GitHubv3RESTAPIusersClient {
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
   * Get the authenticated user
   */
  async usersgetAuthenticated(params: {
  }): Promise<any | any> {

    // Build path with parameters
    let path = "/user";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Update the authenticated user
   */
  async usersupdateAuthenticated(params: {
    name?: string;
    email?: string;
    blog?: string;
    twitter_username?: string;
    company?: string;
    location?: string;
    hireable?: boolean;
    bio?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List users blocked by the authenticated user
   */
  async userslistBlockedByAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/blocks";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if a user is blocked by the authenticated user
   */
  async userscheckBlocked(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/blocks/{username}";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Block a user
   */
  async usersblock(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/blocks/{username}";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Unblock a user
   */
  async usersunblock(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/blocks/{username}";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Set primary email visibility for the authenticated user
   */
  async userssetPrimaryEmailVisibilityForAuthenticatedUser(params: {
    visibility: "public" | "private";
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/email/visibility";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List email addresses for the authenticated user
   */
  async userslistEmailsForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/emails";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add an email address for the authenticated user
   */
  async usersaddEmailForAuthenticatedUser(params: {
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/emails";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete an email address for the authenticated user
   */
  async usersdeleteEmailForAuthenticatedUser(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/emails";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List followers of the authenticated user
   */
  async userslistFollowersForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/followers";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List the people the authenticated user follows
   */
  async userslistFollowedByAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/following";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if a person is followed by the authenticated user
   */
  async userscheckPersonIsFollowedByAuthenticated(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/following/{username}";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Follow a user
   */
  async usersfollow(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/following/{username}";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Unfollow a user
   */
  async usersunfollow(params: {
    None?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/following/{username}";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List GPG keys for the authenticated user
   */
  async userslistGpgKeysForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/gpg_keys";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a GPG key for the authenticated user
   */
  async userscreateGpgKeyForAuthenticatedUser(params: {
    name?: string;
    armored_public_key: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/gpg_keys";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a GPG key for the authenticated user
   */
  async usersgetGpgKeyForAuthenticatedUser(params: {
    None?: string;
    gpg_key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/gpg_keys/{gpg_key_id}";
    path = path.replace("{{ gpg_key_id }}}", String(params.gpg_key_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a GPG key for the authenticated user
   */
  async usersdeleteGpgKeyForAuthenticatedUser(params: {
    None?: string;
    gpg_key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/gpg_keys/{gpg_key_id}";
    path = path.replace("{{ gpg_key_id }}}", String(params.gpg_key_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List public SSH keys for the authenticated user
   */
  async userslistPublicSshKeysForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/keys";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a public SSH key for the authenticated user
   */
  async userscreatePublicSshKeyForAuthenticatedUser(params: {
    title?: string;
    key: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/keys";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a public SSH key for the authenticated user
   */
  async usersgetPublicSshKeyForAuthenticatedUser(params: {
    None?: string;
    key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/keys/{key_id}";
    path = path.replace("{{ key_id }}}", String(params.key_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a public SSH key for the authenticated user
   */
  async usersdeletePublicSshKeyForAuthenticatedUser(params: {
    None?: string;
    key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/keys/{key_id}";
    path = path.replace("{{ key_id }}}", String(params.key_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List public email addresses for the authenticated user
   */
  async userslistPublicEmailsForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/public_emails";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List social accounts for the authenticated user
   */
  async userslistSocialAccountsForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/social_accounts";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Add social accounts for the authenticated user
   */
  async usersaddSocialAccountForAuthenticatedUser(params: {
    account_urls: Array<string>;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/social_accounts";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete social accounts for the authenticated user
   */
  async usersdeleteSocialAccountForAuthenticatedUser(params: {
    account_urls: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/social_accounts";

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List SSH signing keys for the authenticated user
   */
  async userslistSshSigningKeysForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/ssh_signing_keys";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a SSH signing key for the authenticated user
   */
  async userscreateSshSigningKeyForAuthenticatedUser(params: {
    title?: string;
    key: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/ssh_signing_keys";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an SSH signing key for the authenticated user
   */
  async usersgetSshSigningKeyForAuthenticatedUser(params: {
    None?: string;
    ssh_signing_key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/ssh_signing_keys/{ssh_signing_key_id}";
    path = path.replace("{{ ssh_signing_key_id }}}", String(params.ssh_signing_key_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete an SSH signing key for the authenticated user
   */
  async usersdeleteSshSigningKeyForAuthenticatedUser(params: {
    None?: string;
    ssh_signing_key_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/ssh_signing_keys/{ssh_signing_key_id}";
    path = path.replace("{{ ssh_signing_key_id }}}", String(params.ssh_signing_key_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a user using their ID
   */
  async usersgetById(params: {
    None?: string;
    account_id: string;
  }): Promise<any | any> {

    // Build path with parameters
    let path = "/user/{account_id}";
    path = path.replace("{{ account_id }}}", String(params.account_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List users
   */
  async userslist(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a user
   */
  async usersgetByUsername(params: {
    None?: string;
    username: string;
  }): Promise<any | any> {

    // Build path with parameters
    let path = "/users/{username}";
    path = path.replace("{{ username }}}", String(params.username));

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
  async userslistAttestationsBulk(params: {
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
    let path = "/users/{username}/attestations/bulk-list";

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
  async usersdeleteAttestationsBulk(params: {
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/attestations/delete-request";

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
  async usersdeleteAttestationsBySubjectDigest(params: {
    None?: string;
    subject_digest: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/attestations/digest/{subject_digest}";
    path = path.replace("{{ subject_digest }}}", String(params.subject_digest));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete attestations by ID
   */
  async usersdeleteAttestationsById(params: {
    None?: string;
    attestation_id: number;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/attestations/{attestation_id}";
    path = path.replace("{{ attestation_id }}}", String(params.attestation_id));
    path = path.replace("{{ username }}}", String(params.username));

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
  async userslistAttestations(params: {
    None?: string;
    subject_digest: string;
    predicate_type?: string;
    username: string;
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
    let path = "/users/{username}/attestations/{subject_digest}";
    path = path.replace("{{ subject_digest }}}", String(params.subject_digest));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List followers of a user
   */
  async userslistFollowersForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/followers";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List the people a user follows
   */
  async userslistFollowingForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/following";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Check if a user follows another user
   */
  async userscheckFollowingForUser(params: {
    None?: string;
    target_user: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/following/{target_user}";
    path = path.replace("{{ target_user }}}", String(params.target_user));
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List GPG keys for a user
   */
  async userslistGpgKeysForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/gpg_keys";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get contextual information for a user
   */
  async usersgetContextForUser(params: {
    None?: string;
    subject_type?: "organization" | "repository" | "issue" | "pull_request";
    subject_id?: string;
    username: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/hovercard";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List public keys for a user
   */
  async userslistPublicKeysForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/keys";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List social accounts for a user
   */
  async userslistSocialAccountsForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/social_accounts";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List SSH signing keys for a user
   */
  async userslistSshSigningKeysForUser(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/ssh_signing_keys";
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
    name: "github-v3-rest-api---users-44",
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
    name: "usersgetAuthenticated",
    description: "Get the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "usersupdateAuthenticated",
    description: "Update the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The new name of the user.",
        },
        email: {
          type: "string",
          description: "The publicly visible email address of the user.",
        },
        blog: {
          type: "string",
          description: "The new blog URL of the user.",
        },
        twitter_username: {
          type: "string",
          description: "The new Twitter username of the user.",
        },
        company: {
          type: "string",
          description: "The new company of the user.",
        },
        location: {
          type: "string",
          description: "The new location of the user.",
        },
        hireable: {
          type: "boolean",
          description: "The new hiring availability of the user.",
        },
        bio: {
          type: "string",
          description: "The new short biography of the user.",
        },
      },
      required: [],
    },
  },
  {
    name: "userslistBlockedByAuthenticatedUser",
    description: "List users blocked by the authenticated user",
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
    name: "userscheckBlocked",
    description: "Check if a user is blocked by the authenticated user",
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
  {
    name: "usersblock",
    description: "Block a user",
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
  {
    name: "usersunblock",
    description: "Unblock a user",
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
  {
    name: "userssetPrimaryEmailVisibilityForAuthenticatedUser",
    description: "Set primary email visibility for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        visibility: {
          type: "string",
          description: "Denotes whether an email is publicly visible.",
          enum: ["public", "private"],
        },
      },
      required: ["visibility"],
    },
  },
  {
    name: "userslistEmailsForAuthenticatedUser",
    description: "List email addresses for the authenticated user",
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
    name: "usersaddEmailForAuthenticatedUser",
    description: "Add an email address for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "usersdeleteEmailForAuthenticatedUser",
    description: "Delete an email address for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "userslistFollowersForAuthenticatedUser",
    description: "List followers of the authenticated user",
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
    name: "userslistFollowedByAuthenticatedUser",
    description: "List the people the authenticated user follows",
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
    name: "userscheckPersonIsFollowedByAuthenticated",
    description: "Check if a person is followed by the authenticated user",
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
  {
    name: "usersfollow",
    description: "Follow a user",
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
  {
    name: "usersunfollow",
    description: "Unfollow a user",
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
  {
    name: "userslistGpgKeysForAuthenticatedUser",
    description: "List GPG keys for the authenticated user",
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
    name: "userscreateGpgKeyForAuthenticatedUser",
    description: "Create a GPG key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "A descriptive name for the new key.",
        },
        armored_public_key: {
          type: "string",
          description: "A GPG key in ASCII-armored format.",
        },
      },
      required: ["armored_public_key"],
    },
  },
  {
    name: "usersgetGpgKeyForAuthenticatedUser",
    description: "Get a GPG key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gpg_key_id: {
          type: "string",
          description: "Path parameter: gpg_key_id",
        },
      },
      required: ["gpg_key_id"],
    },
  },
  {
    name: "usersdeleteGpgKeyForAuthenticatedUser",
    description: "Delete a GPG key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        gpg_key_id: {
          type: "string",
          description: "Path parameter: gpg_key_id",
        },
      },
      required: ["gpg_key_id"],
    },
  },
  {
    name: "userslistPublicSshKeysForAuthenticatedUser",
    description: "List public SSH keys for the authenticated user",
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
    name: "userscreatePublicSshKeyForAuthenticatedUser",
    description: "Create a public SSH key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "A descriptive name for the new key.",
        },
        key: {
          type: "string",
          description: "The public SSH key to add to your GitHub account.",
        },
      },
      required: ["key"],
    },
  },
  {
    name: "usersgetPublicSshKeyForAuthenticatedUser",
    description: "Get a public SSH key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        key_id: {
          type: "string",
          description: "Path parameter: key_id",
        },
      },
      required: ["key_id"],
    },
  },
  {
    name: "usersdeletePublicSshKeyForAuthenticatedUser",
    description: "Delete a public SSH key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        key_id: {
          type: "string",
          description: "Path parameter: key_id",
        },
      },
      required: ["key_id"],
    },
  },
  {
    name: "userslistPublicEmailsForAuthenticatedUser",
    description: "List public email addresses for the authenticated user",
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
    name: "userslistSocialAccountsForAuthenticatedUser",
    description: "List social accounts for the authenticated user",
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
    name: "usersaddSocialAccountForAuthenticatedUser",
    description: "Add social accounts for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        account_urls: {
          type: "array",
          description: "Full URLs for the social media profiles to add.",
        },
      },
      required: ["account_urls"],
    },
  },
  {
    name: "usersdeleteSocialAccountForAuthenticatedUser",
    description: "Delete social accounts for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        account_urls: {
          type: "array",
          description: "Full URLs for the social media profiles to delete.",
        },
      },
      required: ["account_urls"],
    },
  },
  {
    name: "userslistSshSigningKeysForAuthenticatedUser",
    description: "List SSH signing keys for the authenticated user",
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
    name: "userscreateSshSigningKeyForAuthenticatedUser",
    description: "Create a SSH signing key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "A descriptive name for the new key.",
        },
        key: {
          type: "string",
          description: "The public SSH key to add to your GitHub account. For more information, see "[Checking for existing SSH keys](https://docs.github.com/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys)."",
        },
      },
      required: ["key"],
    },
  },
  {
    name: "usersgetSshSigningKeyForAuthenticatedUser",
    description: "Get an SSH signing key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ssh_signing_key_id: {
          type: "string",
          description: "Path parameter: ssh_signing_key_id",
        },
      },
      required: ["ssh_signing_key_id"],
    },
  },
  {
    name: "usersdeleteSshSigningKeyForAuthenticatedUser",
    description: "Delete an SSH signing key for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        ssh_signing_key_id: {
          type: "string",
          description: "Path parameter: ssh_signing_key_id",
        },
      },
      required: ["ssh_signing_key_id"],
    },
  },
  {
    name: "usersgetById",
    description: "Get a user using their ID",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        account_id: {
          type: "string",
          description: "Path parameter: account_id",
        },
      },
      required: ["account_id"],
    },
  },
  {
    name: "userslist",
    description: "List users",
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
    name: "usersgetByUsername",
    description: "Get a user",
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
  {
    name: "userslistAttestationsBulk",
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
    name: "usersdeleteAttestationsBulk",
    description: "Delete attestations in bulk",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "usersdeleteAttestationsBySubjectDigest",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["subject_digest", "username"],
    },
  },
  {
    name: "usersdeleteAttestationsById",
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
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["attestation_id", "username"],
    },
  },
  {
    name: "userslistAttestations",
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
          description: "Subject Digest",
        },
        predicate_type: {
          type: "string",
          description: "Optional filter for fetching attestations with a given predicate type.
This option accepts `provenance`, `sbom`, `release`, or freeform text
for custom predicate types.",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["subject_digest", "username"],
    },
  },
  {
    name: "userslistFollowersForUser",
    description: "List followers of a user",
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
  {
    name: "userslistFollowingForUser",
    description: "List the people a user follows",
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
  {
    name: "userscheckFollowingForUser",
    description: "Check if a user follows another user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        target_user: {
          type: "string",
          description: "",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["target_user", "username"],
    },
  },
  {
    name: "userslistGpgKeysForUser",
    description: "List GPG keys for a user",
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
  {
    name: "usersgetContextForUser",
    description: "Get contextual information for a user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        subject_type: {
          type: "string",
          description: "Identifies which additional information you'd like to receive about the person's hovercard. Can be `organization`, `repository`, `issue`, `pull_request`. **Required** when using `subject_id`.",
          enum: ["organization", "repository", "issue", "pull_request"],
        },
        subject_id: {
          type: "string",
          description: "Uses the ID for the `subject_type` you specified. **Required** when using `subject_type`.",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["username"],
    },
  },
  {
    name: "userslistPublicKeysForUser",
    description: "List public keys for a user",
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
  {
    name: "userslistSocialAccountsForUser",
    description: "List social accounts for a user",
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
  {
    name: "userslistSshSigningKeysForUser",
    description: "List SSH signing keys for a user",
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
  const client = new GitHubv3RESTAPIusersClient(accessToken);

  try {
    switch (name) {
      case "usersgetAuthenticated": {
        const result = await client.usersgetAuthenticated(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersupdateAuthenticated": {
        const result = await client.usersupdateAuthenticated(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistBlockedByAuthenticatedUser": {
        const result = await client.userslistBlockedByAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userscheckBlocked": {
        const result = await client.userscheckBlocked(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersblock": {
        const result = await client.usersblock(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersunblock": {
        const result = await client.usersunblock(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userssetPrimaryEmailVisibilityForAuthenticatedUser": {
        const result = await client.userssetPrimaryEmailVisibilityForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistEmailsForAuthenticatedUser": {
        const result = await client.userslistEmailsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersaddEmailForAuthenticatedUser": {
        const result = await client.usersaddEmailForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeleteEmailForAuthenticatedUser": {
        const result = await client.usersdeleteEmailForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistFollowersForAuthenticatedUser": {
        const result = await client.userslistFollowersForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistFollowedByAuthenticatedUser": {
        const result = await client.userslistFollowedByAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userscheckPersonIsFollowedByAuthenticated": {
        const result = await client.userscheckPersonIsFollowedByAuthenticated(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersfollow": {
        const result = await client.usersfollow(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersunfollow": {
        const result = await client.usersunfollow(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistGpgKeysForAuthenticatedUser": {
        const result = await client.userslistGpgKeysForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userscreateGpgKeyForAuthenticatedUser": {
        const result = await client.userscreateGpgKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersgetGpgKeyForAuthenticatedUser": {
        const result = await client.usersgetGpgKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeleteGpgKeyForAuthenticatedUser": {
        const result = await client.usersdeleteGpgKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistPublicSshKeysForAuthenticatedUser": {
        const result = await client.userslistPublicSshKeysForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userscreatePublicSshKeyForAuthenticatedUser": {
        const result = await client.userscreatePublicSshKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersgetPublicSshKeyForAuthenticatedUser": {
        const result = await client.usersgetPublicSshKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeletePublicSshKeyForAuthenticatedUser": {
        const result = await client.usersdeletePublicSshKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistPublicEmailsForAuthenticatedUser": {
        const result = await client.userslistPublicEmailsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistSocialAccountsForAuthenticatedUser": {
        const result = await client.userslistSocialAccountsForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersaddSocialAccountForAuthenticatedUser": {
        const result = await client.usersaddSocialAccountForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeleteSocialAccountForAuthenticatedUser": {
        const result = await client.usersdeleteSocialAccountForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistSshSigningKeysForAuthenticatedUser": {
        const result = await client.userslistSshSigningKeysForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userscreateSshSigningKeyForAuthenticatedUser": {
        const result = await client.userscreateSshSigningKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersgetSshSigningKeyForAuthenticatedUser": {
        const result = await client.usersgetSshSigningKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeleteSshSigningKeyForAuthenticatedUser": {
        const result = await client.usersdeleteSshSigningKeyForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersgetById": {
        const result = await client.usersgetById(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslist": {
        const result = await client.userslist(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersgetByUsername": {
        const result = await client.usersgetByUsername(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistAttestationsBulk": {
        const result = await client.userslistAttestationsBulk(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeleteAttestationsBulk": {
        const result = await client.usersdeleteAttestationsBulk(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeleteAttestationsBySubjectDigest": {
        const result = await client.usersdeleteAttestationsBySubjectDigest(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersdeleteAttestationsById": {
        const result = await client.usersdeleteAttestationsById(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistAttestations": {
        const result = await client.userslistAttestations(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistFollowersForUser": {
        const result = await client.userslistFollowersForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistFollowingForUser": {
        const result = await client.userslistFollowingForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userscheckFollowingForUser": {
        const result = await client.userscheckFollowingForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistGpgKeysForUser": {
        const result = await client.userslistGpgKeysForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "usersgetContextForUser": {
        const result = await client.usersgetContextForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistPublicKeysForUser": {
        const result = await client.userslistPublicKeysForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistSocialAccountsForUser": {
        const result = await client.userslistSocialAccountsForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "userslistSshSigningKeysForUser": {
        const result = await client.userslistSshSigningKeysForUser(args as any);
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
  console.error("GitHub v3 REST API - users MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
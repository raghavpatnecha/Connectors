/**
 * MCP Server: GitHub v3 REST API - packages
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
class GitHubv3RESTAPIpackagesClient {
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
   * Get list of conflicting packages during Docker migration for organization
   */
  async packageslistDockerMigrationConflictingPackagesForO(params: {
    None?: string;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/docker/conflicts";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List packages for an organization
   */
  async packageslistPackagesForOrganization(params: {
    package_type: string;
    None?: string;
    page?: integer;
    per_page?: integer;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/packages";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a package for an organization
   */
  async packagesgetPackageForOrganization(params: {
    None?: string;
    org: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/packages/{package_type}/{package_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a package for an organization
   */
  async packagesdeletePackageForOrg(params: {
    None?: string;
    org: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/packages/{package_type}/{package_name}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Restore a package for an organization
   */
  async packagesrestorePackageForOrg(params: {
    None?: string;
    token?: string;
    org: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/packages/{package_type}/{package_name}/restore";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List package versions for a package owned by an organization
   */
  async packagesgetAllPackageVersionsForPackageOwnedByOrg(params: {
    None?: string;
    state?: string;
    org: string;
    package_type: string;
    package_name: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/packages/{package_type}/{package_name}/versions";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a package version for an organization
   */
  async packagesgetPackageVersionForOrganization(params: {
    None?: string;
    org: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete package version for an organization
   */
  async packagesdeletePackageVersionForOrg(params: {
    None?: string;
    org: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Restore package version for an organization
   */
  async packagesrestorePackageVersionForOrg(params: {
    None?: string;
    org: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get list of conflicting packages during Docker migration for authenticated-user
   */
  async packageslistDockerMigrationConflictingPackagesForA(params: {
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/docker/conflicts";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List packages for the authenticated user's namespace
   */
  async packageslistPackagesForAuthenticatedUser(params: {
    package_type: string;
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/packages";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a package for the authenticated user
   */
  async packagesgetPackageForAuthenticatedUser(params: {
    None?: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/packages/{package_type}/{package_name}";
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a package for the authenticated user
   */
  async packagesdeletePackageForAuthenticatedUser(params: {
    None?: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/packages/{package_type}/{package_name}";
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Restore a package for the authenticated user
   */
  async packagesrestorePackageForAuthenticatedUser(params: {
    None?: string;
    token?: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/packages/{package_type}/{package_name}/restore";
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List package versions for a package owned by the authenticated user
   */
  async packagesgetAllPackageVersionsForPackageOwnedByAuth(params: {
    None?: string;
    state?: string;
    package_type: string;
    package_name: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/packages/{package_type}/{package_name}/versions";
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a package version for the authenticated user
   */
  async packagesgetPackageVersionForAuthenticatedUser(params: {
    None?: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/packages/{package_type}/{package_name}/versions/{package_version_id}";
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a package version for the authenticated user
   */
  async packagesdeletePackageVersionForAuthenticatedUser(params: {
    None?: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/packages/{package_type}/{package_name}/versions/{package_version_id}";
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Restore a package version for the authenticated user
   */
  async packagesrestorePackageVersionForAuthenticatedUser(params: {
    None?: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore";
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get list of conflicting packages during Docker migration for user
   */
  async packageslistDockerMigrationConflictingPackagesForU(params: {
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/docker/conflicts";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List packages for a user
   */
  async packageslistPackagesForUser(params: {
    package_type: string;
    None?: string;
    username: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/packages";
    path = path.replace("{{ username }}}", String(params.username));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a package for a user
   */
  async packagesgetPackageForUser(params: {
    None?: string;
    username: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/packages/{package_type}/{package_name}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a package for a user
   */
  async packagesdeletePackageForUser(params: {
    None?: string;
    username: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/packages/{package_type}/{package_name}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Restore a package for a user
   */
  async packagesrestorePackageForUser(params: {
    None?: string;
    token?: string;
    username: string;
    package_type: string;
    package_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/packages/{package_type}/{package_name}/restore";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List package versions for a package owned by a user
   */
  async packagesgetAllPackageVersionsForPackageOwnedByUser(params: {
    None?: string;
    username: string;
    package_type: string;
    package_name: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/users/{username}/packages/{package_type}/{package_name}/versions";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get a package version for a user
   */
  async packagesgetPackageVersionForUser(params: {
    None?: string;
    username: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete package version for a user
   */
  async packagesdeletePackageVersionForUser(params: {
    None?: string;
    username: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Restore package version for a user
   */
  async packagesrestorePackageVersionForUser(params: {
    None?: string;
    username: string;
    package_type: string;
    package_name: string;
    package_version_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore";
    path = path.replace("{{ username }}}", String(params.username));
    path = path.replace("{{ package_type }}}", String(params.package_type));
    path = path.replace("{{ package_name }}}", String(params.package_name));
    path = path.replace("{{ package_version_id }}}", String(params.package_version_id));

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
    name: "github-v3-rest-api---packages-27",
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
    name: "packageslistDockerMigrationConflictingPackagesForO",
    description: "Get list of conflicting packages during Docker migration for organization",
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
    name: "packageslistPackagesForOrganization",
    description: "List packages for an organization",
    inputSchema: {
      type: "object",
      properties: {
        package_type: {
          type: "string",
          description: "The type of supported package. Packages in GitHub's Gradle registry have the type `maven`. Docker images pushed to GitHub's Container registry (`ghcr.io`) have the type `container`. You can use the type `docker` to find images that were pushed to GitHub's Docker registry (`docker.pkg.github.com`), even if these have now been migrated to the Container registry.",
          enum: ["npm", "maven", "rubygems", "docker", "nuget", "container"],
        },
        None: {
          type: "string",
          description: "",
        },
        page: {
          type: "integer",
          description: "The page number of the results to fetch. For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."",
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
      required: ["package_type", "org"],
    },
  },
  {
    name: "packagesgetPackageForOrganization",
    description: "Get a package for an organization",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["org", "package_type", "package_name"],
    },
  },
  {
    name: "packagesdeletePackageForOrg",
    description: "Delete a package for an organization",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["org", "package_type", "package_name"],
    },
  },
  {
    name: "packagesrestorePackageForOrg",
    description: "Restore a package for an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        token: {
          type: "string",
          description: "package token",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["org", "package_type", "package_name"],
    },
  },
  {
    name: "packagesgetAllPackageVersionsForPackageOwnedByOrg",
    description: "List package versions for a package owned by an organization",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        state: {
          type: "string",
          description: "The state of the package, either active or deleted.",
          enum: ["active", "deleted"],
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["org", "package_type", "package_name"],
    },
  },
  {
    name: "packagesgetPackageVersionForOrganization",
    description: "Get a package version for an organization",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["org", "package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packagesdeletePackageVersionForOrg",
    description: "Delete package version for an organization",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["org", "package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packagesrestorePackageVersionForOrg",
    description: "Restore package version for an organization",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["org", "package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packageslistDockerMigrationConflictingPackagesForA",
    description: "Get list of conflicting packages during Docker migration for authenticated-user",
    inputSchema: {
      type: "object",
      properties: {
      },
      required: [],
    },
  },
  {
    name: "packageslistPackagesForAuthenticatedUser",
    description: "List packages for the authenticated user's namespace",
    inputSchema: {
      type: "object",
      properties: {
        package_type: {
          type: "string",
          description: "The type of supported package. Packages in GitHub's Gradle registry have the type `maven`. Docker images pushed to GitHub's Container registry (`ghcr.io`) have the type `container`. You can use the type `docker` to find images that were pushed to GitHub's Docker registry (`docker.pkg.github.com`), even if these have now been migrated to the Container registry.",
          enum: ["npm", "maven", "rubygems", "docker", "nuget", "container"],
        },
        None: {
          type: "string",
          description: "",
        },
      },
      required: ["package_type"],
    },
  },
  {
    name: "packagesgetPackageForAuthenticatedUser",
    description: "Get a package for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["package_type", "package_name"],
    },
  },
  {
    name: "packagesdeletePackageForAuthenticatedUser",
    description: "Delete a package for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["package_type", "package_name"],
    },
  },
  {
    name: "packagesrestorePackageForAuthenticatedUser",
    description: "Restore a package for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        token: {
          type: "string",
          description: "package token",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["package_type", "package_name"],
    },
  },
  {
    name: "packagesgetAllPackageVersionsForPackageOwnedByAuth",
    description: "List package versions for a package owned by the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        state: {
          type: "string",
          description: "The state of the package, either active or deleted.",
          enum: ["active", "deleted"],
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["package_type", "package_name"],
    },
  },
  {
    name: "packagesgetPackageVersionForAuthenticatedUser",
    description: "Get a package version for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packagesdeletePackageVersionForAuthenticatedUser",
    description: "Delete a package version for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packagesrestorePackageVersionForAuthenticatedUser",
    description: "Restore a package version for the authenticated user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packageslistDockerMigrationConflictingPackagesForU",
    description: "Get list of conflicting packages during Docker migration for user",
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
    name: "packageslistPackagesForUser",
    description: "List packages for a user",
    inputSchema: {
      type: "object",
      properties: {
        package_type: {
          type: "string",
          description: "The type of supported package. Packages in GitHub's Gradle registry have the type `maven`. Docker images pushed to GitHub's Container registry (`ghcr.io`) have the type `container`. You can use the type `docker` to find images that were pushed to GitHub's Docker registry (`docker.pkg.github.com`), even if these have now been migrated to the Container registry.",
          enum: ["npm", "maven", "rubygems", "docker", "nuget", "container"],
        },
        None: {
          type: "string",
          description: "",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
      },
      required: ["package_type", "username"],
    },
  },
  {
    name: "packagesgetPackageForUser",
    description: "Get a package for a user",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["username", "package_type", "package_name"],
    },
  },
  {
    name: "packagesdeletePackageForUser",
    description: "Delete a package for a user",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["username", "package_type", "package_name"],
    },
  },
  {
    name: "packagesrestorePackageForUser",
    description: "Restore a package for a user",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        token: {
          type: "string",
          description: "package token",
        },
        username: {
          type: "string",
          description: "Path parameter: username",
        },
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["username", "package_type", "package_name"],
    },
  },
  {
    name: "packagesgetAllPackageVersionsForPackageOwnedByUser",
    description: "List package versions for a package owned by a user",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
      },
      required: ["username", "package_type", "package_name"],
    },
  },
  {
    name: "packagesgetPackageVersionForUser",
    description: "Get a package version for a user",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["username", "package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packagesdeletePackageVersionForUser",
    description: "Delete package version for a user",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["username", "package_type", "package_name", "package_version_id"],
    },
  },
  {
    name: "packagesrestorePackageVersionForUser",
    description: "Restore package version for a user",
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
        package_type: {
          type: "string",
          description: "Path parameter: package_type",
        },
        package_name: {
          type: "string",
          description: "Path parameter: package_name",
        },
        package_version_id: {
          type: "string",
          description: "Path parameter: package_version_id",
        },
      },
      required: ["username", "package_type", "package_name", "package_version_id"],
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
  const client = new GitHubv3RESTAPIpackagesClient(accessToken);

  try {
    switch (name) {
      case "packageslistDockerMigrationConflictingPackagesForO": {
        const result = await client.packageslistDockerMigrationConflictingPackagesForO(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packageslistPackagesForOrganization": {
        const result = await client.packageslistPackagesForOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetPackageForOrganization": {
        const result = await client.packagesgetPackageForOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesdeletePackageForOrg": {
        const result = await client.packagesdeletePackageForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesrestorePackageForOrg": {
        const result = await client.packagesrestorePackageForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetAllPackageVersionsForPackageOwnedByOrg": {
        const result = await client.packagesgetAllPackageVersionsForPackageOwnedByOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetPackageVersionForOrganization": {
        const result = await client.packagesgetPackageVersionForOrganization(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesdeletePackageVersionForOrg": {
        const result = await client.packagesdeletePackageVersionForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesrestorePackageVersionForOrg": {
        const result = await client.packagesrestorePackageVersionForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packageslistDockerMigrationConflictingPackagesForA": {
        const result = await client.packageslistDockerMigrationConflictingPackagesForA(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packageslistPackagesForAuthenticatedUser": {
        const result = await client.packageslistPackagesForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetPackageForAuthenticatedUser": {
        const result = await client.packagesgetPackageForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesdeletePackageForAuthenticatedUser": {
        const result = await client.packagesdeletePackageForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesrestorePackageForAuthenticatedUser": {
        const result = await client.packagesrestorePackageForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetAllPackageVersionsForPackageOwnedByAuth": {
        const result = await client.packagesgetAllPackageVersionsForPackageOwnedByAuth(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetPackageVersionForAuthenticatedUser": {
        const result = await client.packagesgetPackageVersionForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesdeletePackageVersionForAuthenticatedUser": {
        const result = await client.packagesdeletePackageVersionForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesrestorePackageVersionForAuthenticatedUser": {
        const result = await client.packagesrestorePackageVersionForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packageslistDockerMigrationConflictingPackagesForU": {
        const result = await client.packageslistDockerMigrationConflictingPackagesForU(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packageslistPackagesForUser": {
        const result = await client.packageslistPackagesForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetPackageForUser": {
        const result = await client.packagesgetPackageForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesdeletePackageForUser": {
        const result = await client.packagesdeletePackageForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesrestorePackageForUser": {
        const result = await client.packagesrestorePackageForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetAllPackageVersionsForPackageOwnedByUser": {
        const result = await client.packagesgetAllPackageVersionsForPackageOwnedByUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesgetPackageVersionForUser": {
        const result = await client.packagesgetPackageVersionForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesdeletePackageVersionForUser": {
        const result = await client.packagesdeletePackageVersionForUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "packagesrestorePackageVersionForUser": {
        const result = await client.packagesrestorePackageVersionForUser(args as any);
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
  console.error("GitHub v3 REST API - packages MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
/**
 * MCP Server: GitHub v3 REST API - migrations
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
class GitHubv3RESTAPImigrationsClient {
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
   * List organization migrations
   */
  async migrationslistForOrg(params: {
    None?: string;
    exclude?: Array<"repositories">;
    org: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/migrations";
    path = path.replace("{{ org }}}", String(params.org));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Start an organization migration
   */
  async migrationsstartForOrg(params: {
    repositories: Array<string>;
    lock_repositories?: boolean;
    exclude_metadata?: boolean;
    exclude_git_data?: boolean;
    exclude_attachments?: boolean;
    exclude_releases?: boolean;
    exclude_owner_projects?: boolean;
    org_metadata_only?: boolean;
    exclude?: Array<"repositories">;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/migrations";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get an organization migration status
   */
  async migrationsgetStatusForOrg(params: {
    None?: string;
    exclude?: Array<"repositories">;
    org: string;
    migration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/migrations/{migration_id}";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Download an organization migration archive
   */
  async migrationsdownloadArchiveForOrg(params: {
    None?: string;
    org: string;
    migration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/migrations/{migration_id}/archive";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete an organization migration archive
   */
  async migrationsdeleteArchiveForOrg(params: {
    None?: string;
    org: string;
    migration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/migrations/{migration_id}/archive";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Unlock an organization repository
   */
  async migrationsunlockRepoForOrg(params: {
    None?: string;
    org: string;
    migration_id: string;
    repo_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ migration_id }}}", String(params.migration_id));
    path = path.replace("{{ repo_name }}}", String(params.repo_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories in an organization migration
   */
  async migrationslistReposForOrg(params: {
    None?: string;
    org: string;
    migration_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/orgs/{org}/migrations/{migration_id}/repositories";
    path = path.replace("{{ org }}}", String(params.org));
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Get an import status
   */
  async migrationsgetImportStatus(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import";
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
   * Start an import
   */
  async migrationsstartImport(params: {
    vcs_url: string;
    vcs?: "subversion" | "git" | "mercurial" | "tfvc";
    vcs_username?: string;
    vcs_password?: string;
    tfvc_project?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import";

    const response = await this.client.request({
      method: "PUT",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Update an import
   */
  async migrationsupdateImport(params: {
    vcs_username?: string;
    vcs_password?: string;
    vcs?: "subversion" | "tfvc" | "git" | "mercurial";
    tfvc_project?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Cancel an import
   */
  async migrationscancelImport(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import";
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
   * Get commit authors
   */
  async migrationsgetCommitAuthors(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import/authors";
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
   * Map a commit author
   */
  async migrationsmapCommitAuthor(params: {
    email?: string;
    name?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import/authors/{author_id}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get large files
   */
  async migrationsgetLargeFiles(params: {
    None?: string;
    owner: string;
    repo: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import/large_files";
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
   * Update Git LFS preference
   */
  async migrationssetLfsPreference(params: {
    use_lfs: "opt_in" | "opt_out";
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/import/lfs";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * List user migrations
   */
  async migrationslistForAuthenticatedUser(params: {
    None?: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/migrations";

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Start a user migration
   */
  async migrationsstartForAuthenticatedUser(params: {
    lock_repositories?: boolean;
    exclude_metadata?: boolean;
    exclude_git_data?: boolean;
    exclude_attachments?: boolean;
    exclude_releases?: boolean;
    exclude_owner_projects?: boolean;
    org_metadata_only?: boolean;
    exclude?: Array<"repositories">;
    repositories: Array<string>;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/migrations";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a user migration status
   */
  async migrationsgetStatusForAuthenticatedUser(params: {
    None?: string;
    exclude?: Array<string>;
    migration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/migrations/{migration_id}";
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Download a user migration archive
   */
  async migrationsgetArchiveForAuthenticatedUser(params: {
    None?: string;
    migration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/migrations/{migration_id}/archive";
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

    const response = await this.client.request({
      method: "GET",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Delete a user migration archive
   */
  async migrationsdeleteArchiveForAuthenticatedUser(params: {
    None?: string;
    migration_id: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/migrations/{migration_id}/archive";
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Unlock a user repository
   */
  async migrationsunlockRepoForAuthenticatedUser(params: {
    None?: string;
    migration_id: string;
    repo_name: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/user/migrations/{migration_id}/repos/{repo_name}/lock";
    path = path.replace("{{ migration_id }}}", String(params.migration_id));
    path = path.replace("{{ repo_name }}}", String(params.repo_name));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * List repositories for a user migration
   */
  async migrationslistReposForAuthenticatedUser(params: {
    None?: string;
    migration_id: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/user/migrations/{migration_id}/repositories";
    path = path.replace("{{ migration_id }}}", String(params.migration_id));

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
    name: "github-v3-rest-api---migrations-29",
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
    name: "migrationslistForOrg",
    description: "List organization migrations",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        exclude: {
          type: "array",
          description: "Exclude attributes from the API response to improve performance",
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
    name: "migrationsstartForOrg",
    description: "Start an organization migration",
    inputSchema: {
      type: "object",
      properties: {
        repositories: {
          type: "array",
          description: "A list of arrays indicating which repositories should be migrated.",
        },
        lock_repositories: {
          type: "boolean",
          description: "Indicates whether repositories should be locked (to prevent manipulation) while migrating data.",
        },
        exclude_metadata: {
          type: "boolean",
          description: "Indicates whether metadata should be excluded and only git source should be included for the migration.",
        },
        exclude_git_data: {
          type: "boolean",
          description: "Indicates whether the repository git data should be excluded from the migration.",
        },
        exclude_attachments: {
          type: "boolean",
          description: "Indicates whether attachments should be excluded from the migration (to reduce migration archive file size).",
        },
        exclude_releases: {
          type: "boolean",
          description: "Indicates whether releases should be excluded from the migration (to reduce migration archive file size).",
        },
        exclude_owner_projects: {
          type: "boolean",
          description: "Indicates whether projects owned by the organization or users should be excluded. from the migration.",
        },
        org_metadata_only: {
          type: "boolean",
          description: "Indicates whether this should only include organization metadata (repositories array should be empty and will ignore other flags).",
        },
        exclude: {
          type: "array",
          description: "Exclude related items from being returned in the response in order to improve performance of the request.",
        },
      },
      required: ["repositories"],
    },
  },
  {
    name: "migrationsgetStatusForOrg",
    description: "Get an organization migration status",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        exclude: {
          type: "array",
          description: "Exclude attributes from the API response to improve performance",
        },
        org: {
          type: "string",
          description: "Path parameter: org",
        },
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["org", "migration_id"],
    },
  },
  {
    name: "migrationsdownloadArchiveForOrg",
    description: "Download an organization migration archive",
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
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["org", "migration_id"],
    },
  },
  {
    name: "migrationsdeleteArchiveForOrg",
    description: "Delete an organization migration archive",
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
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["org", "migration_id"],
    },
  },
  {
    name: "migrationsunlockRepoForOrg",
    description: "Unlock an organization repository",
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
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
        repo_name: {
          type: "string",
          description: "Path parameter: repo_name",
        },
      },
      required: ["org", "migration_id", "repo_name"],
    },
  },
  {
    name: "migrationslistReposForOrg",
    description: "List repositories in an organization migration",
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
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["org", "migration_id"],
    },
  },
  {
    name: "migrationsgetImportStatus",
    description: "Get an import status",
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
    name: "migrationsstartImport",
    description: "Start an import",
    inputSchema: {
      type: "object",
      properties: {
        vcs_url: {
          type: "string",
          description: "The URL of the originating repository.",
        },
        vcs: {
          type: "string",
          description: "The originating VCS type. Without this parameter, the import job will take additional time to detect the VCS type before beginning the import. This detection step will be reflected in the response.",
          enum: ["subversion", "git", "mercurial", "tfvc"],
        },
        vcs_username: {
          type: "string",
          description: "If authentication is required, the username to provide to `vcs_url`.",
        },
        vcs_password: {
          type: "string",
          description: "If authentication is required, the password to provide to `vcs_url`.",
        },
        tfvc_project: {
          type: "string",
          description: "For a tfvc import, the name of the project that is being imported.",
        },
      },
      required: ["vcs_url"],
    },
  },
  {
    name: "migrationsupdateImport",
    description: "Update an import",
    inputSchema: {
      type: "object",
      properties: {
        vcs_username: {
          type: "string",
          description: "The username to provide to the originating repository.",
        },
        vcs_password: {
          type: "string",
          description: "The password to provide to the originating repository.",
        },
        vcs: {
          type: "string",
          description: "The type of version control system you are migrating from.",
          enum: ["subversion", "tfvc", "git", "mercurial"],
        },
        tfvc_project: {
          type: "string",
          description: "For a tfvc import, the name of the project that is being imported.",
        },
      },
      required: [],
    },
  },
  {
    name: "migrationscancelImport",
    description: "Cancel an import",
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
    name: "migrationsgetCommitAuthors",
    description: "Get commit authors",
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
    name: "migrationsmapCommitAuthor",
    description: "Map a commit author",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "The new Git author email.",
        },
        name: {
          type: "string",
          description: "The new Git author name.",
        },
      },
      required: [],
    },
  },
  {
    name: "migrationsgetLargeFiles",
    description: "Get large files",
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
    name: "migrationssetLfsPreference",
    description: "Update Git LFS preference",
    inputSchema: {
      type: "object",
      properties: {
        use_lfs: {
          type: "string",
          description: "Whether to store large files during the import. `opt_in` means large files will be stored using Git LFS. `opt_out` means large files will be removed during the import.",
          enum: ["opt_in", "opt_out"],
        },
      },
      required: ["use_lfs"],
    },
  },
  {
    name: "migrationslistForAuthenticatedUser",
    description: "List user migrations",
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
    name: "migrationsstartForAuthenticatedUser",
    description: "Start a user migration",
    inputSchema: {
      type: "object",
      properties: {
        lock_repositories: {
          type: "boolean",
          description: "Lock the repositories being migrated at the start of the migration",
        },
        exclude_metadata: {
          type: "boolean",
          description: "Indicates whether metadata should be excluded and only git source should be included for the migration.",
        },
        exclude_git_data: {
          type: "boolean",
          description: "Indicates whether the repository git data should be excluded from the migration.",
        },
        exclude_attachments: {
          type: "boolean",
          description: "Do not include attachments in the migration",
        },
        exclude_releases: {
          type: "boolean",
          description: "Do not include releases in the migration",
        },
        exclude_owner_projects: {
          type: "boolean",
          description: "Indicates whether projects owned by the organization or users should be excluded.",
        },
        org_metadata_only: {
          type: "boolean",
          description: "Indicates whether this should only include organization metadata (repositories array should be empty and will ignore other flags).",
        },
        exclude: {
          type: "array",
          description: "Exclude attributes from the API response to improve performance",
        },
        repositories: {
          type: "array",
          description: "",
        },
      },
      required: ["repositories"],
    },
  },
  {
    name: "migrationsgetStatusForAuthenticatedUser",
    description: "Get a user migration status",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        exclude: {
          type: "array",
          description: "",
        },
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["migration_id"],
    },
  },
  {
    name: "migrationsgetArchiveForAuthenticatedUser",
    description: "Download a user migration archive",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["migration_id"],
    },
  },
  {
    name: "migrationsdeleteArchiveForAuthenticatedUser",
    description: "Delete a user migration archive",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["migration_id"],
    },
  },
  {
    name: "migrationsunlockRepoForAuthenticatedUser",
    description: "Unlock a user repository",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
        repo_name: {
          type: "string",
          description: "Path parameter: repo_name",
        },
      },
      required: ["migration_id", "repo_name"],
    },
  },
  {
    name: "migrationslistReposForAuthenticatedUser",
    description: "List repositories for a user migration",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        migration_id: {
          type: "string",
          description: "Path parameter: migration_id",
        },
      },
      required: ["migration_id"],
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
  const client = new GitHubv3RESTAPImigrationsClient(accessToken);

  try {
    switch (name) {
      case "migrationslistForOrg": {
        const result = await client.migrationslistForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsstartForOrg": {
        const result = await client.migrationsstartForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsgetStatusForOrg": {
        const result = await client.migrationsgetStatusForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsdownloadArchiveForOrg": {
        const result = await client.migrationsdownloadArchiveForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsdeleteArchiveForOrg": {
        const result = await client.migrationsdeleteArchiveForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsunlockRepoForOrg": {
        const result = await client.migrationsunlockRepoForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationslistReposForOrg": {
        const result = await client.migrationslistReposForOrg(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsgetImportStatus": {
        const result = await client.migrationsgetImportStatus(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsstartImport": {
        const result = await client.migrationsstartImport(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsupdateImport": {
        const result = await client.migrationsupdateImport(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationscancelImport": {
        const result = await client.migrationscancelImport(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsgetCommitAuthors": {
        const result = await client.migrationsgetCommitAuthors(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsmapCommitAuthor": {
        const result = await client.migrationsmapCommitAuthor(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsgetLargeFiles": {
        const result = await client.migrationsgetLargeFiles(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationssetLfsPreference": {
        const result = await client.migrationssetLfsPreference(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationslistForAuthenticatedUser": {
        const result = await client.migrationslistForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsstartForAuthenticatedUser": {
        const result = await client.migrationsstartForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsgetStatusForAuthenticatedUser": {
        const result = await client.migrationsgetStatusForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsgetArchiveForAuthenticatedUser": {
        const result = await client.migrationsgetArchiveForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsdeleteArchiveForAuthenticatedUser": {
        const result = await client.migrationsdeleteArchiveForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationsunlockRepoForAuthenticatedUser": {
        const result = await client.migrationsunlockRepoForAuthenticatedUser(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "migrationslistReposForAuthenticatedUser": {
        const result = await client.migrationslistReposForAuthenticatedUser(args as any);
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
  console.error("GitHub v3 REST API - migrations MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
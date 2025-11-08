/**
 * MCP Server: GitHub v3 REST API - git
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
class GitHubv3RESTAPIgitClient {
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
   * Create a blob
   */
  async gitcreateBlob(params: {
    content: string;
    encoding?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/blobs";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a blob
   */
  async gitgetBlob(params: {
    None?: string;
    file_sha: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/blobs/{file_sha}";
    path = path.replace("{{ file_sha }}}", String(params.file_sha));
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
   * Create a commit
   */
  async gitcreateCommit(params: {
    message: string;
    tree: string;
    parents?: Array<string>;
    author?: {
  name: string;
  email: string;
  date?: string;
};
    committer?: {
  name?: string;
  email?: string;
  date?: string;
};
    signature?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/commits";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a commit object
   */
  async gitgetCommit(params: {
    None?: string;
    owner: string;
    repo: string;
    commit_sha: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/commits/{commit_sha}";
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
   * List matching references
   */
  async gitlistMatchingRefs(params: {
    None?: string;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<Array<any>> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/matching-refs/{ref}";
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
   * Get a reference
   */
  async gitgetRef(params: {
    None?: string;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/ref/{ref}";
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
   * Create a reference
   */
  async gitcreateRef(params: {
    ref: string;
    sha: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/refs";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Update a reference
   */
  async gitupdateRef(params: {
    sha: string;
    force?: boolean;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/refs/{ref}";

    const response = await this.client.request({
      method: "PATCH",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Delete a reference
   */
  async gitdeleteRef(params: {
    None?: string;
    owner: string;
    repo: string;
    ref: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/refs/{ref}";
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));
    path = path.replace("{{ ref }}}", String(params.ref));

    const response = await this.client.request({
      method: "DELETE",
      url: path,
      params: params,
    });


    return response.data;
  }
  /**
   * Create a tag object
   */
  async gitcreateTag(params: {
    tag: string;
    message: string;
    object: string;
    type: "commit" | "tree" | "blob";
    tagger?: {
  name: string;
  email: string;
  date?: string;
};
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/tags";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a tag
   */
  async gitgetTag(params: {
    None?: string;
    tag_sha: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/tags/{tag_sha}";
    path = path.replace("{{ tag_sha }}}", String(params.tag_sha));
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
   * Create a tree
   */
  async gitcreateTree(params: {
    tree: Array<{
  path?: string;
  mode?: "100644" | "100755" | "040000" | "160000" | "120000";
  type?: "blob" | "tree" | "commit";
  sha?: string;
  content?: string;
}>;
    base_tree?: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/trees";

    const response = await this.client.request({
      method: "POST",
      url: path,
      data: params,
    });


    return response.data;
  }
  /**
   * Get a tree
   */
  async gitgetTree(params: {
    None?: string;
    tree_sha: string;
    recursive?: string;
    owner: string;
    repo: string;
  }): Promise<any> {

    // Build path with parameters
    let path = "/repos/{owner}/{repo}/git/trees/{tree_sha}";
    path = path.replace("{{ tree_sha }}}", String(params.tree_sha));
    path = path.replace("{{ owner }}}", String(params.owner));
    path = path.replace("{{ repo }}}", String(params.repo));

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
    name: "github-v3-rest-api---git-41",
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
    name: "gitcreateBlob",
    description: "Create a blob",
    inputSchema: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "The new blob's content.",
        },
        encoding: {
          type: "string",
          description: "The encoding used for `content`. Currently, `"utf-8"` and `"base64"` are supported.",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "gitgetBlob",
    description: "Get a blob",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        file_sha: {
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
      required: ["file_sha", "owner", "repo"],
    },
  },
  {
    name: "gitcreateCommit",
    description: "Create a commit",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The commit message",
        },
        tree: {
          type: "string",
          description: "The SHA of the tree object this commit points to",
        },
        parents: {
          type: "array",
          description: "The full SHAs of the commits that were the parents of this commit. If omitted or empty, the commit will be written as a root commit. For a single parent, an array of one SHA should be provided; for a merge commit, an array of more than one should be provided.",
        },
        author: {
          type: "object",
          description: "Information about the author of the commit. By default, the `author` will be the authenticated user and the current date. See the `author` and `committer` object below for details.",
        },
        committer: {
          type: "object",
          description: "Information about the person who is making the commit. By default, `committer` will use the information set in `author`. See the `author` and `committer` object below for details.",
        },
        signature: {
          type: "string",
          description: "The [PGP signature](https://en.wikipedia.org/wiki/Pretty_Good_Privacy) of the commit. GitHub adds the signature to the `gpgsig` header of the created commit. For a commit signature to be verifiable by Git or GitHub, it must be an ASCII-armored detached PGP signature over the string commit as it would be written to the object database. To pass a `signature` parameter, you need to first manually create a valid PGP signature, which can be complicated. You may find it easier to [use the command line](https://git-scm.com/book/id/v2/Git-Tools-Signing-Your-Work) to create signed commits.",
        },
      },
      required: ["message", "tree"],
    },
  },
  {
    name: "gitgetCommit",
    description: "Get a commit object",
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
    name: "gitlistMatchingRefs",
    description: "List matching references",
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
    name: "gitgetRef",
    description: "Get a reference",
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
    name: "gitcreateRef",
    description: "Create a reference",
    inputSchema: {
      type: "object",
      properties: {
        ref: {
          type: "string",
          description: "The name of the fully qualified reference (ie: `refs/heads/master`). If it doesn't start with 'refs' and have at least two slashes, it will be rejected.",
        },
        sha: {
          type: "string",
          description: "The SHA1 value for this reference.",
        },
      },
      required: ["ref", "sha"],
    },
  },
  {
    name: "gitupdateRef",
    description: "Update a reference",
    inputSchema: {
      type: "object",
      properties: {
        sha: {
          type: "string",
          description: "The SHA1 value to set this reference to",
        },
        force: {
          type: "boolean",
          description: "Indicates whether to force the update or to make sure the update is a fast-forward update. Leaving this out or setting it to `false` will make sure you're not overwriting work.",
        },
      },
      required: ["sha"],
    },
  },
  {
    name: "gitdeleteRef",
    description: "Delete a reference",
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
    name: "gitcreateTag",
    description: "Create a tag object",
    inputSchema: {
      type: "object",
      properties: {
        tag: {
          type: "string",
          description: "The tag's name. This is typically a version (e.g., "v0.0.1").",
        },
        message: {
          type: "string",
          description: "The tag message.",
        },
        object: {
          type: "string",
          description: "The SHA of the git object this is tagging.",
        },
        type: {
          type: "string",
          description: "The type of the object we're tagging. Normally this is a `commit` but it can also be a `tree` or a `blob`.",
          enum: ["commit", "tree", "blob"],
        },
        tagger: {
          type: "object",
          description: "An object with information about the individual creating the tag.",
        },
      },
      required: ["tag", "message", "object", "type"],
    },
  },
  {
    name: "gitgetTag",
    description: "Get a tag",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        tag_sha: {
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
      required: ["tag_sha", "owner", "repo"],
    },
  },
  {
    name: "gitcreateTree",
    description: "Create a tree",
    inputSchema: {
      type: "object",
      properties: {
        tree: {
          type: "array",
          description: "Objects (of `path`, `mode`, `type`, and `sha`) specifying a tree structure.",
        },
        base_tree: {
          type: "string",
          description: "The SHA1 of an existing Git tree object which will be used as the base for the new tree. If provided, a new Git tree object will be created from entries in the Git tree object pointed to by `base_tree` and entries defined in the `tree` parameter. Entries defined in the `tree` parameter will overwrite items from `base_tree` with the same `path`. If you're creating new changes on a branch, then normally you'd set `base_tree` to the SHA1 of the Git tree object of the current latest commit on the branch you're working on.
If not provided, GitHub will create a new Git tree object from only the entries defined in the `tree` parameter. If you create a new commit pointing to such a tree, then all files which were a part of the parent commit's tree and were not defined in the `tree` parameter will be listed as deleted by the new commit.",
        },
      },
      required: ["tree"],
    },
  },
  {
    name: "gitgetTree",
    description: "Get a tree",
    inputSchema: {
      type: "object",
      properties: {
        None: {
          type: "string",
          description: "",
        },
        tree_sha: {
          type: "string",
          description: "The SHA1 value or ref (branch or tag) name of the tree.",
        },
        recursive: {
          type: "string",
          description: "Setting this parameter to any value returns the objects or subtrees referenced by the tree specified in `:tree_sha`. For example, setting `recursive` to any of the following will enable returning objects or subtrees: `0`, `1`, `"true"`, and `"false"`. Omit this parameter to prevent recursively returning objects or subtrees.",
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
      required: ["tree_sha", "owner", "repo"],
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
  const client = new GitHubv3RESTAPIgitClient(accessToken);

  try {
    switch (name) {
      case "gitcreateBlob": {
        const result = await client.gitcreateBlob(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitgetBlob": {
        const result = await client.gitgetBlob(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitcreateCommit": {
        const result = await client.gitcreateCommit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitgetCommit": {
        const result = await client.gitgetCommit(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitlistMatchingRefs": {
        const result = await client.gitlistMatchingRefs(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitgetRef": {
        const result = await client.gitgetRef(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitcreateRef": {
        const result = await client.gitcreateRef(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitupdateRef": {
        const result = await client.gitupdateRef(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitdeleteRef": {
        const result = await client.gitdeleteRef(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitcreateTag": {
        const result = await client.gitcreateTag(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitgetTag": {
        const result = await client.gitgetTag(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitcreateTree": {
        const result = await client.gitcreateTree(args as any);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }
      case "gitgetTree": {
        const result = await client.gitgetTree(args as any);
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
  console.error("GitHub v3 REST API - git MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
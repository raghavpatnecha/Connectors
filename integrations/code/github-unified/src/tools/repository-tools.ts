/**
 * GitHub Repository Tools
 */

import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GitHubClient } from '../clients/github-client.js';
import { logger } from '../utils/logger.js';

export function registerRepositoryTools(
  registry: ToolRegistry,
  githubClient: GitHubClient
): void {
  /**
   * Get repository information
   */
  registry.registerTool(
    {
      name: 'github_get_repository',
      description: 'Get detailed information about a GitHub repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner (username or organization)',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.repos.get({
          owner: args.owner,
          repo: args.repo,
        });
        return response.data;
      });
    }
  );

  /**
   * List repositories for a user
   */
  registry.registerTool(
    {
      name: 'github_list_repositories',
      description: 'List repositories for a user or organization',
      inputSchema: {
        type: 'object',
        properties: {
          username: {
            type: 'string',
            description: 'Username or organization name',
          },
          type: {
            type: 'string',
            enum: ['all', 'owner', 'member'],
            description: 'Repository type filter',
            default: 'all',
          },
          sort: {
            type: 'string',
            enum: ['created', 'updated', 'pushed', 'full_name'],
            description: 'Sort order',
            default: 'updated',
          },
          per_page: {
            type: 'number',
            description: 'Results per page (max 100)',
            default: 30,
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['username', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.repos.listForUser({
          username: args.username,
          type: args.type || 'all',
          sort: args.sort || 'updated',
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * Create a new repository
   */
  registry.registerTool(
    {
      name: 'github_create_repository',
      description: 'Create a new GitHub repository',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Repository name',
          },
          description: {
            type: 'string',
            description: 'Repository description',
          },
          private: {
            type: 'boolean',
            description: 'Whether the repository is private',
            default: false,
          },
          auto_init: {
            type: 'boolean',
            description: 'Initialize with README',
            default: false,
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['name', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.repos.createForAuthenticatedUser({
          name: args.name,
          description: args.description,
          private: args.private ?? false,
          auto_init: args.auto_init ?? false,
        });
        return response.data;
      });
    }
  );

  /**
   * Get repository contents
   */
  registry.registerTool(
    {
      name: 'github_get_contents',
      description: 'Get contents of a file or directory in a repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          path: {
            type: 'string',
            description: 'Path to file or directory',
          },
          ref: {
            type: 'string',
            description: 'Branch, tag, or commit SHA',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'path', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.repos.getContent({
          owner: args.owner,
          repo: args.repo,
          path: args.path,
          ref: args.ref,
        });
        return response.data;
      });
    }
  );

  /**
   * Create or update file contents
   */
  registry.registerTool(
    {
      name: 'github_create_or_update_file',
      description: 'Create or update a file in a repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          path: {
            type: 'string',
            description: 'Path to file',
          },
          message: {
            type: 'string',
            description: 'Commit message',
          },
          content: {
            type: 'string',
            description: 'File content (base64 encoded)',
          },
          sha: {
            type: 'string',
            description: 'SHA of file being replaced (required for updates)',
          },
          branch: {
            type: 'string',
            description: 'Branch name',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'path', 'message', 'content', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.repos.createOrUpdateFileContents({
          owner: args.owner,
          repo: args.repo,
          path: args.path,
          message: args.message,
          content: args.content,
          sha: args.sha,
          branch: args.branch,
        });
        return response.data;
      });
    }
  );

  /**
   * List branches
   */
  registry.registerTool(
    {
      name: 'github_list_branches',
      description: 'List branches for a repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          per_page: {
            type: 'number',
            description: 'Results per page',
            default: 30,
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.repos.listBranches({
          owner: args.owner,
          repo: args.repo,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * List commits
   */
  registry.registerTool(
    {
      name: 'github_list_commits',
      description: 'List commits for a repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          sha: {
            type: 'string',
            description: 'SHA or branch to start listing from',
          },
          path: {
            type: 'string',
            description: 'Only commits containing this file path',
          },
          per_page: {
            type: 'number',
            description: 'Results per page',
            default: 30,
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.repos.listCommits({
          owner: args.owner,
          repo: args.repo,
          sha: args.sha,
          path: args.path,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  logger.info('Registered repository tools', { count: 7 });
}

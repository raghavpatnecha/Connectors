/**
 * GitHub Pull Request Tools
 */

import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GitHubClient } from '../clients/github-client.js';
import { logger } from '../utils/logger.js';

export function registerPullRequestTools(
  registry: ToolRegistry,
  githubClient: GitHubClient
): void {
  /**
   * List pull requests
   */
  registry.registerTool(
    {
      name: 'github_list_pull_requests',
      description: 'List pull requests for a repository',
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
          state: {
            type: 'string',
            enum: ['open', 'closed', 'all'],
            description: 'PR state filter',
            default: 'open',
          },
          sort: {
            type: 'string',
            enum: ['created', 'updated', 'popularity', 'long-running'],
            description: 'Sort order',
            default: 'created',
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
        const response = await client.pulls.list({
          owner: args.owner,
          repo: args.repo,
          state: args.state || 'open',
          sort: args.sort || 'created',
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * Get pull request
   */
  registry.registerTool(
    {
      name: 'github_get_pull_request',
      description: 'Get a specific pull request by number',
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
          pull_number: {
            type: 'number',
            description: 'Pull request number',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'pull_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.pulls.get({
          owner: args.owner,
          repo: args.repo,
          pull_number: args.pull_number,
        });
        return response.data;
      });
    }
  );

  /**
   * Create pull request
   */
  registry.registerTool(
    {
      name: 'github_create_pull_request',
      description: 'Create a new pull request',
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
          title: {
            type: 'string',
            description: 'PR title',
          },
          head: {
            type: 'string',
            description: 'Branch containing changes',
          },
          base: {
            type: 'string',
            description: 'Branch to merge into',
          },
          body: {
            type: 'string',
            description: 'PR description',
          },
          draft: {
            type: 'boolean',
            description: 'Create as draft PR',
            default: false,
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'title', 'head', 'base', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.pulls.create({
          owner: args.owner,
          repo: args.repo,
          title: args.title,
          head: args.head,
          base: args.base,
          body: args.body,
          draft: args.draft ?? false,
        });
        return response.data;
      });
    }
  );

  /**
   * Update pull request
   */
  registry.registerTool(
    {
      name: 'github_update_pull_request',
      description: 'Update an existing pull request',
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
          pull_number: {
            type: 'number',
            description: 'Pull request number',
          },
          title: {
            type: 'string',
            description: 'New title',
          },
          body: {
            type: 'string',
            description: 'New description',
          },
          state: {
            type: 'string',
            enum: ['open', 'closed'],
            description: 'PR state',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'pull_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.pulls.update({
          owner: args.owner,
          repo: args.repo,
          pull_number: args.pull_number,
          title: args.title,
          body: args.body,
          state: args.state,
        });
        return response.data;
      });
    }
  );

  /**
   * Merge pull request
   */
  registry.registerTool(
    {
      name: 'github_merge_pull_request',
      description: 'Merge a pull request',
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
          pull_number: {
            type: 'number',
            description: 'Pull request number',
          },
          commit_title: {
            type: 'string',
            description: 'Merge commit title',
          },
          commit_message: {
            type: 'string',
            description: 'Merge commit message',
          },
          merge_method: {
            type: 'string',
            enum: ['merge', 'squash', 'rebase'],
            description: 'Merge method',
            default: 'merge',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'pull_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.pulls.merge({
          owner: args.owner,
          repo: args.repo,
          pull_number: args.pull_number,
          commit_title: args.commit_title,
          commit_message: args.commit_message,
          merge_method: args.merge_method || 'merge',
        });
        return response.data;
      });
    }
  );

  /**
   * List PR files
   */
  registry.registerTool(
    {
      name: 'github_list_pr_files',
      description: 'List files changed in a pull request',
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
          pull_number: {
            type: 'number',
            description: 'Pull request number',
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
        required: ['owner', 'repo', 'pull_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.pulls.listFiles({
          owner: args.owner,
          repo: args.repo,
          pull_number: args.pull_number,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  /**
   * Request reviewers
   */
  registry.registerTool(
    {
      name: 'github_request_pr_reviewers',
      description: 'Request reviewers for a pull request',
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
          pull_number: {
            type: 'number',
            description: 'Pull request number',
          },
          reviewers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Reviewer usernames',
          },
          team_reviewers: {
            type: 'array',
            items: { type: 'string' },
            description: 'Team slugs',
          },
          tenantId: {
            type: 'string',
            description: 'Tenant identifier for OAuth',
          },
        },
        required: ['owner', 'repo', 'pull_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.pulls.requestReviewers({
          owner: args.owner,
          repo: args.repo,
          pull_number: args.pull_number,
          reviewers: args.reviewers,
          team_reviewers: args.team_reviewers,
        });
        return response.data;
      });
    }
  );

  /**
   * List PR reviews
   */
  registry.registerTool(
    {
      name: 'github_list_pr_reviews',
      description: 'List reviews for a pull request',
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
          pull_number: {
            type: 'number',
            description: 'Pull request number',
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
        required: ['owner', 'repo', 'pull_number', 'tenantId'],
      },
    },
    async (args, tenantId) => {
      return githubClient.execute(tenantId, async (client) => {
        const response = await client.pulls.listReviews({
          owner: args.owner,
          repo: args.repo,
          pull_number: args.pull_number,
          per_page: args.per_page || 30,
        });
        return response.data;
      });
    }
  );

  logger.info('Registered pull request tools', { count: 8 });
}

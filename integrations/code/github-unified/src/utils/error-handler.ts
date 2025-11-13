/**
 * Error handling utilities for GitHub Unified MCP Server
 */

import { logger } from './logger.js';

/**
 * Base error class for GitHub MCP
 */
export class GitHubMCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'GitHubMCPError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * OAuth-related errors
 */
export class OAuthError extends GitHubMCPError {
  constructor(message: string, details?: any) {
    super(message, 'OAUTH_ERROR', 401, details);
    this.name = 'OAuthError';
  }
}

/**
 * GitHub API errors
 */
export class GitHubAPIError extends GitHubMCPError {
  constructor(message: string, statusCode: number, details?: any) {
    super(message, 'GITHUB_API_ERROR', statusCode, details);
    this.name = 'GitHubAPIError';
  }
}

/**
 * Rate limit errors
 */
export class RateLimitError extends GitHubMCPError {
  constructor(
    message: string,
    public readonly resetAt: Date,
    public readonly limit: number,
    public readonly remaining: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, { resetAt, limit, remaining });
    this.name = 'RateLimitError';
  }
}

/**
 * Vault-related errors
 */
export class VaultError extends GitHubMCPError {
  constructor(message: string, details?: any) {
    super(message, 'VAULT_ERROR', 500, details);
    this.name = 'VaultError';
  }
}

/**
 * Tool invocation errors
 */
export class ToolInvocationError extends GitHubMCPError {
  constructor(
    message: string,
    public readonly toolName: string,
    details?: any
  ) {
    super(message, 'TOOL_INVOCATION_ERROR', 500, details);
    this.name = 'ToolInvocationError';
  }
}

/**
 * Handle Octokit errors and convert to appropriate error types
 */
export function handleOctokitError(error: any): never {
  logger.error('Octokit error', {
    status: error.status,
    message: error.message,
    headers: error.response?.headers,
  });

  // Rate limit error
  if (error.status === 403 && error.response?.headers?.['x-ratelimit-remaining'] === '0') {
    const resetTimestamp = parseInt(error.response.headers['x-ratelimit-reset'] || '0', 10);
    const resetAt = new Date(resetTimestamp * 1000);
    const limit = parseInt(error.response.headers['x-ratelimit-limit'] || '0', 10);

    throw new RateLimitError(
      `GitHub API rate limit exceeded. Resets at ${resetAt.toISOString()}`,
      resetAt,
      limit,
      0
    );
  }

  // Authentication errors
  if (error.status === 401) {
    throw new OAuthError('GitHub authentication failed. Token may be expired or invalid.', {
      message: error.message,
    });
  }

  // Permission errors
  if (error.status === 403) {
    throw new GitHubAPIError(
      'GitHub API access forbidden. Check token permissions.',
      403,
      { message: error.message }
    );
  }

  // Not found errors
  if (error.status === 404) {
    throw new GitHubAPIError(
      'GitHub resource not found',
      404,
      { message: error.message }
    );
  }

  // Generic API errors
  throw new GitHubAPIError(
    error.message || 'GitHub API request failed',
    error.status || 500,
    {
      message: error.message,
      documentation: error.response?.data?.documentation_url,
    }
  );
}

/**
 * Format error for client response
 */
export function formatErrorResponse(error: Error): {
  error: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
} {
  if (error instanceof GitHubMCPError) {
    return {
      error: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Generic error
  return {
    error: 'InternalServerError',
    message: error.message || 'An unexpected error occurred',
    statusCode: 500,
  };
}

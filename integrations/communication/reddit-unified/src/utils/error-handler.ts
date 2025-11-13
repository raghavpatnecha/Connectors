/**
 * Reddit Unified MCP - Error Handler
 *
 * Centralized error handling with proper error types and
 * user-friendly error messages.
 *
 * @module utils/error-handler
 */

import { logger } from './logger';

export class RedditAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = 'RedditAPIError';
  }
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly tenantId?: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Handle and format errors for MCP responses
 */
export function handleToolError(error: unknown, context: { tool: string; params?: unknown }): never {
  logger.error('Tool execution failed', {
    tool: context.tool,
    params: context.params,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });

  if (error instanceof AuthenticationError) {
    throw new Error(`Authentication failed: ${error.message}`);
  }

  if (error instanceof RateLimitError) {
    throw new Error(`Rate limit exceeded: ${error.message}`);
  }

  if (error instanceof ValidationError) {
    throw new Error(`Validation error: ${error.message}`);
  }

  if (error instanceof RedditAPIError) {
    throw new Error(`Reddit API error: ${error.message}`);
  }

  throw error;
}

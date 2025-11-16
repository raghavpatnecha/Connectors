/**
 * Error handling utilities for Product Hunt MCP Server
 */

import { logger } from './logger.js';

/**
 * Custom error class for Product Hunt API errors
 */
export class ProductHuntError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ProductHuntError';
  }
}

/**
 * API Token error
 */
export class TokenError extends ProductHuntError {
  constructor(message: string) {
    super(message, 'TOKEN_ERROR', 401);
    this.name = 'TokenError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends ProductHuntError {
  constructor(
    message: string,
    public readonly resetAt: string,
    public readonly retryAfter: number
  ) {
    super(message, 'RATE_LIMIT_ERROR', 429, { resetAt, retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * GraphQL error
 */
export class GraphQLError extends ProductHuntError {
  constructor(message: string, details?: any) {
    super(message, 'GRAPHQL_ERROR', 400, details);
    this.name = 'GraphQLError';
  }
}

/**
 * Format error response for MCP tools
 */
export function formatErrorResponse(error: Error | ProductHuntError): {
  code: string;
  message: string;
  statusCode?: number;
  details?: any;
} {
  if (error instanceof ProductHuntError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Generic error
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
  });

  return {
    code: 'INTERNAL_ERROR',
    message: error.message || 'An unexpected error occurred',
  };
}

/**
 * Map HTTP status codes to friendly error messages
 */
export function mapHttpError(statusCode: number, responseText: string): ProductHuntError {
  switch (statusCode) {
    case 401:
      return new TokenError(
        'Authentication failed. Please check your Product Hunt API token.'
      );
    case 403:
      return new ProductHuntError(
        'You don\'t have permission to access this resource.',
        'PERMISSION_DENIED',
        403
      );
    case 404:
      return new ProductHuntError(
        'The requested resource was not found.',
        'NOT_FOUND',
        404
      );
    case 429:
      return new RateLimitError(
        'Rate limit exceeded. Please try again later.',
        new Date(Date.now() + 900000).toISOString(), // 15 min default
        900
      );
    case 500:
    case 502:
    case 503:
    case 504:
      return new ProductHuntError(
        'The Product Hunt API is currently unavailable. Please try again later.',
        'SERVER_ERROR',
        statusCode
      );
    default:
      return new ProductHuntError(
        'An error occurred while communicating with the Product Hunt API.',
        'API_ERROR',
        statusCode,
        responseText
      );
  }
}

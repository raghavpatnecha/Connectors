/**
 * Error handling utilities for Google Search MCP
 */

import { logger } from './logger';

export class SearchError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SearchError';
  }
}

export class RateLimitError extends SearchError {
  constructor(message: string, public readonly resetTime?: number) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429);
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends SearchError {
  constructor(message: string) {
    super(message, 'QUOTA_EXCEEDED', 429);
    this.name = 'QuotaExceededError';
  }
}

export class InvalidParameterError extends SearchError {
  constructor(message: string) {
    super(message, 'INVALID_PARAMETER', 400);
    this.name = 'InvalidParameterError';
  }
}

/**
 * Map Google API errors to custom error types
 */
export function mapSearchError(error: any): Error {
  const message = error.message || 'Unknown error';
  const code = error.code || error.statusCode;

  logger.error('Search API error', {
    message,
    code,
    error: error.toString()
  });

  // Rate limit errors
  if (code === 429 || message.includes('rate limit') || message.includes('quota')) {
    if (message.includes('quota')) {
      return new QuotaExceededError('Search API quota exceeded. Please try again later.');
    }
    return new RateLimitError('Search API rate limit exceeded. Please try again later.');
  }

  // Invalid parameter errors
  if (code === 400 || message.includes('invalid')) {
    return new InvalidParameterError(`Invalid search parameter: ${message}`);
  }

  // Authentication errors
  if (code === 401 || code === 403) {
    return new SearchError(
      'Authentication failed. Please check your API credentials.',
      'AUTH_ERROR',
      code
    );
  }

  // Generic search error
  return new SearchError(message, 'SEARCH_ERROR', code, error);
}

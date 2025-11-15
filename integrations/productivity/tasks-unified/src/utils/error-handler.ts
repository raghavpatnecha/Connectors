/**
 * Error handling utilities for Tasks MCP server
 */

import { logger } from './logger';

/**
 * Handle Google API errors with proper logging and transformation
 */
export function handleGoogleAPIError(error: any, operation: string): never {
  const status = error.response?.status || error.code || 500;
  const message = error.message || 'Unknown error occurred';

  logger.error('Google Tasks API error', {
    operation,
    status,
    message,
    details: error.response?.data
  });

  // Transform to consistent error format
  const errorResponse = {
    error: 'Google Tasks API Error',
    operation,
    status,
    message,
    details: error.response?.data?.error?.message
  };

  throw new Error(JSON.stringify(errorResponse));
}

/**
 * Handle validation errors
 */
export function handleValidationError(error: any, toolName: string): never {
  logger.error('Validation error', {
    tool: toolName,
    error: error.message,
    issues: error.issues
  });

  throw new Error(`Validation failed for ${toolName}: ${error.message}`);
}

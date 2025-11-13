/**
 * Centralized Error Handling
 */

import { logger } from './logger';

export class LinkedInAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'LinkedInAPIError';
  }
}

export class LinkedInAuthError extends Error {
  constructor(message: string, public tenantId?: string, public cause?: Error) {
    super(message);
    this.name = 'LinkedInAuthError';
  }
}

export class LinkedInAutomationError extends Error {
  constructor(message: string, public action?: string, public cause?: Error) {
    super(message);
    this.name = 'LinkedInAutomationError';
  }
}

export function handleError(error: any, context: string): never {
  logger.error(`Error in ${context}`, {
    error: error.message,
    stack: error.stack,
    context
  });

  if (error instanceof LinkedInAPIError) {
    throw error;
  }

  if (error instanceof LinkedInAuthError) {
    throw error;
  }

  if (error instanceof LinkedInAutomationError) {
    throw error;
  }

  throw new Error(`${context} failed: ${error.message}`);
}

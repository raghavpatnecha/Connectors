/**
 * Google API Error Mapper
 * Maps Google API errors to standardized error types
 */

import { GaxiosError } from 'gaxios';

export class GoogleAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly errorCode?: string,
    public readonly service?: string
  ) {
    super(message);
    this.name = 'GoogleAPIError';
  }
}

export class OAuthError extends Error {
  constructor(
    message: string,
    public readonly integration: string = 'google',
    public readonly tenantId?: string
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

export class VaultError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VaultError';
  }
}

export class RateLimitError extends GoogleAPIError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    public readonly service?: string
  ) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', service);
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends GoogleAPIError {
  constructor(
    message: string,
    public readonly quotaType?: string,
    public readonly service?: string
  ) {
    super(message, 403, 'QUOTA_EXCEEDED', service);
    this.name = 'QuotaExceededError';
  }
}

export class AuthenticationError extends GoogleAPIError {
  constructor(message: string, public readonly service?: string) {
    super(message, 401, 'AUTHENTICATION_FAILED', service);
    this.name = 'AuthenticationError';
  }
}

export class PermissionDeniedError extends GoogleAPIError {
  constructor(message: string, public readonly service?: string) {
    super(message, 403, 'PERMISSION_DENIED', service);
    this.name = 'PermissionDeniedError';
  }
}

export class NotFoundError extends GoogleAPIError {
  constructor(
    message: string,
    public readonly resourceType?: string,
    public readonly service?: string
  ) {
    super(message, 404, 'NOT_FOUND', service);
    this.name = 'NotFoundError';
  }
}

export class InvalidRequestError extends GoogleAPIError {
  constructor(
    message: string,
    public readonly validationErrors?: string[],
    public readonly service?: string
  ) {
    super(message, 400, 'INVALID_REQUEST', service);
    this.name = 'InvalidRequestError';
  }
}

/**
 * Map Google API (Gaxios) errors to our standardized error types
 */
export function mapGoogleAPIError(
  error: any,
  service?: string
): GoogleAPIError {
  // Handle Gaxios errors (from googleapis)
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data?.error || {};
    const message = errorData.message || error.message || 'Unknown error';

    switch (status) {
      case 400:
        return new InvalidRequestError(
          message,
          errorData.details?.map((d: any) => d.message),
          service
        );

      case 401:
        return new AuthenticationError(message, service);

      case 403:
        // Check if it's a quota error or permission error
        const errorCode = errorData.code;
        const errorReason = errorData.errors?.[0]?.reason;

        if (
          errorReason === 'quotaExceeded' ||
          errorReason === 'userRateLimitExceeded' ||
          errorReason === 'rateLimitExceeded'
        ) {
          return new QuotaExceededError(message, errorReason, service);
        }

        return new PermissionDeniedError(message, service);

      case 404:
        return new NotFoundError(message, undefined, service);

      case 429:
        // Extract retry-after header if present
        const retryAfter = error.response.headers['retry-after'];
        return new RateLimitError(
          message,
          retryAfter ? parseInt(retryAfter) : undefined,
          service
        );

      case 500:
      case 502:
      case 503:
      case 504:
        return new GoogleAPIError(
          `Google API server error: ${message}`,
          status,
          'SERVER_ERROR',
          service
        );

      default:
        return new GoogleAPIError(message, status, errorCode, service);
    }
  }

  // Handle network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return new GoogleAPIError(
      'Network error - cannot reach Google API',
      undefined,
      'NETWORK_ERROR',
      service
    );
  }

  // Generic error
  return new GoogleAPIError(
    error.message || 'Unknown Google API error',
    undefined,
    'UNKNOWN_ERROR',
    service
  );
}

/**
 * Check if error is retryable (5xx, rate limit, network)
 */
export function isRetryableError(error: GoogleAPIError): boolean {
  if (error instanceof RateLimitError) {
    return true;
  }

  if (error.statusCode && error.statusCode >= 500) {
    return true;
  }

  if (error.errorCode === 'NETWORK_ERROR') {
    return true;
  }

  return false;
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(
  error: GoogleAPIError,
  attemptNumber: number
): number {
  if (error instanceof RateLimitError && error.retryAfter) {
    return error.retryAfter * 1000;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attemptNumber), 16000);
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: GoogleAPIError): Record<string, any> {
  return {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode,
    errorCode: error.errorCode,
    service: error.service,
    ...(error instanceof RateLimitError && { retryAfter: error.retryAfter }),
    ...(error instanceof QuotaExceededError && { quotaType: error.quotaType }),
    ...(error instanceof NotFoundError && {
      resourceType: error.resourceType,
    }),
    ...(error instanceof InvalidRequestError && {
      validationErrors: error.validationErrors,
    }),
  };
}

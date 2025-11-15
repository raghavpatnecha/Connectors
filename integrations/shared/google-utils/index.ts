/**
 * Shared Google Utilities Module
 * Entry point for all Google Workspace MCP utility functions
 */

export {
  GoogleAPIError,
  OAuthError,
  VaultError,
  RateLimitError,
  QuotaExceededError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  InvalidRequestError,
  mapGoogleAPIError,
  isRetryableError,
  getRetryDelay,
  formatErrorForLog,
} from './error-mapper.js';

export {
  executeBatch,
  chunk,
  delay,
  retryWithBackoff,
  parallelBatch,
  rateLimitedMap,
  BatchRequest,
  BatchResult,
  BatchOptions,
} from './batch-helper.js';

export {
  RateLimiter,
  globalRateLimiter,
  rateLimit,
  RateLimitConfig,
  DEFAULT_RATE_LIMITS,
} from './rate-limiter.js';

export {
  logger,
  logAPIRequest,
  logAPIResponse,
  logAPIError,
  logOAuthEvent,
  logRateLimit,
  logBatchOperation,
  logPerformance,
  createChildLogger,
  logStartup,
  logShutdown,
  measureExecutionTime,
} from './logger.js';

export * from './types.js';

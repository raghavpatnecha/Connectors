/**
 * Structured Logger for Google Workspace integrations
 * Uses Winston for consistent logging across all MCP servers
 */

import { createLogger, format, transports, Logger } from 'winston';

/**
 * Log levels: error, warn, info, debug
 */
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

/**
 * Create Winston logger instance
 */
export const logger: Logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: {
    service: 'google-workspace-mcp',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console output (pretty for development, JSON for production)
    new transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? format.json()
          : format.combine(
              format.colorize(),
              format.printf(({ timestamp, level, message, service, ...meta }) => {
                const metaStr = Object.keys(meta).length
                  ? `\n${JSON.stringify(meta, null, 2)}`
                  : '';
                return `${timestamp} [${level}] [${service}] ${message}${metaStr}`;
              })
            ),
    }),

    // Error log file
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.json(),
    }),

    // Combined log file
    new transports.File({
      filename: 'logs/combined.log',
      format: format.json(),
    }),
  ],
});

/**
 * Log Google API request
 */
export function logAPIRequest(
  service: string,
  method: string,
  params?: Record<string, any>
): void {
  logger.debug('Google API request', {
    service,
    method,
    params: params ? sanitizeParams(params) : undefined,
  });
}

/**
 * Log Google API response
 */
export function logAPIResponse(
  service: string,
  method: string,
  statusCode: number,
  latency: number
): void {
  logger.debug('Google API response', {
    service,
    method,
    statusCode,
    latency,
  });
}

/**
 * Log Google API error
 */
export function logAPIError(
  service: string,
  method: string,
  error: Error,
  params?: Record<string, any>
): void {
  logger.error('Google API error', {
    service,
    method,
    error: error.message,
    stack: error.stack,
    params: params ? sanitizeParams(params) : undefined,
  });
}

/**
 * Log OAuth flow event
 */
export function logOAuthEvent(
  event: string,
  tenantId: string,
  details?: Record<string, any>
): void {
  logger.info('OAuth event', {
    event,
    tenantId,
    ...details,
  });
}

/**
 * Log rate limit event
 */
export function logRateLimit(
  service: string,
  action: 'acquired' | 'waiting' | 'exceeded',
  details?: Record<string, any>
): void {
  logger.debug('Rate limit event', {
    service,
    action,
    ...details,
  });
}

/**
 * Log batch operation
 */
export function logBatchOperation(
  operation: string,
  totalItems: number,
  successCount: number,
  errorCount: number,
  duration: number
): void {
  logger.info('Batch operation completed', {
    operation,
    totalItems,
    successCount,
    errorCount,
    duration,
    successRate: ((successCount / totalItems) * 100).toFixed(2) + '%',
  });
}

/**
 * Log performance metric
 */
export function logPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
): void {
  logger.info('Performance metric', {
    operation,
    duration,
    ...metadata,
  });
}

/**
 * Sanitize sensitive parameters for logging
 */
function sanitizeParams(params: Record<string, any>): Record<string, any> {
  const sanitized = { ...params };
  const sensitiveKeys = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'clientSecret',
    'apiKey',
    'credentials',
  ];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      sanitized[key] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: Record<string, any>): Logger {
  return logger.child(context);
}

/**
 * Log startup information
 */
export function logStartup(service: string, version: string, config?: Record<string, any>): void {
  logger.info('Service starting', {
    service,
    version,
    nodeVersion: process.version,
    platform: process.platform,
    config: config ? sanitizeParams(config) : undefined,
  });
}

/**
 * Log shutdown information
 */
export function logShutdown(service: string, reason?: string): void {
  logger.info('Service shutting down', {
    service,
    reason,
  });
}

/**
 * Measure and log execution time
 */
export async function measureExecutionTime<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    logPerformance(operation, duration, {
      ...metadata,
      success: true,
    });

    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logPerformance(operation, duration, {
      ...metadata,
      success: false,
      error: error.message,
    });

    throw error;
  }
}

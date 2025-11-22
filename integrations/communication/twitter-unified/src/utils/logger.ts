/**
 * Logger utility for Twitter Unified MCP Server
 * Structured logging with Winston
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'twitter-unified-mcp' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

/**
 * Log OAuth event
 */
export function logOAuthEvent(
  event: string,
  tenantId: string,
  metadata?: Record<string, any>
): void {
  logger.info(`OAuth: ${event}`, {
    tenantId,
    event,
    ...metadata
  });
}

/**
 * Log API call
 */
export function logAPICall(
  method: string,
  endpoint: string,
  tenantId: string,
  status: number,
  duration: number
): void {
  logger.debug('Twitter API call', {
    method,
    endpoint,
    tenantId,
    status,
    durationMs: duration
  });
}

/**
 * Log error with context
 */
export function logError(
  error: Error,
  context: Record<string, any>
): void {
  logger.error('Twitter error', {
    error: error.message,
    stack: error.stack,
    ...context
  });
}

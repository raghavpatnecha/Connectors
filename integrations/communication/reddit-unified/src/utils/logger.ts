/**
 * Reddit Unified MCP - Structured Logger
 *
 * Winston-based structured logging with support for:
 * - Multiple log levels
 * - JSON formatting
 * - File and console transports
 * - Contextual metadata
 *
 * @module utils/logger
 */

import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'reddit-unified-mcp' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

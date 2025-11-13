/**
 * Structured logging for GitHub Unified MCP Server
 */

import winston from 'winston';
import { resolve } from 'path';

const logLevel = process.env.LOG_LEVEL || 'info';
const logDir = resolve(process.cwd(), 'logs');

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'github-unified-mcp' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...metadata }) => {
            let msg = `${timestamp} [${level}] : ${message}`;
            if (Object.keys(metadata).length > 0) {
              msg += ` ${JSON.stringify(metadata)}`;
            }
            return msg;
          }
        )
      ),
    }),
    // File transport for errors
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Create stream for morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

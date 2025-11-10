/**
 * Structured logging for gateway operations
 */

import { createLogger, format, transports, Logger as WinstonLogger } from 'winston';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || 'logs';

export const logger: WinstonLogger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'mcp-gateway' },
  transports: [
    // Console output (pretty print in development)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata, null, 2)}`;
          }
          return msg;
        })
      )
    }),

    // Error log file
    new transports.File({
      filename: `${LOG_DIR}/error.log`,
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),

    // Combined log file
    new transports.File({
      filename: `${LOG_DIR}/combined.log`,
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

/**
 * Log tool selection performance metrics
 */
export function logToolSelectionMetrics(metrics: {
  query: string;
  categoriesFound: number;
  toolsSelected: number;
  faissLatency: number;
  totalLatency: number;
  tokenCost: number;
  tokenReductionPct: number;
  cacheHit: boolean;
}): void {
  logger.info('tool_selection_performance', {
    query: metrics.query,
    categories_found: metrics.categoriesFound,
    tools_selected: metrics.toolsSelected,
    faiss_latency_ms: metrics.faissLatency,
    total_latency_ms: metrics.totalLatency,
    token_cost: metrics.tokenCost,
    token_reduction_pct: metrics.tokenReductionPct,
    cache_hit: metrics.cacheHit
  });
}

/**
 * Log embedding generation metrics
 */
export function logEmbeddingMetrics(metrics: {
  textCount: number;
  model: string;
  latency: number;
  cacheHit: boolean;
}): void {
  logger.debug('embedding_generation', {
    text_count: metrics.textCount,
    model: metrics.model,
    latency_ms: metrics.latency,
    cache_hit: metrics.cacheHit
  });
}

/**
 * Log FAISS search metrics
 */
export function logFAISSMetrics(metrics: {
  operation: string;
  queryDimension: number;
  k: number;
  latency: number;
  resultsFound: number;
}): void {
  logger.debug('faiss_search', {
    operation: metrics.operation,
    query_dimension: metrics.queryDimension,
    k: metrics.k,
    latency_ms: metrics.latency,
    results_found: metrics.resultsFound
  });
}

/**
 * Log cache operations
 */
export function logCacheOperation(operation: 'get' | 'set', key: string, hit: boolean): void {
  logger.debug('cache_operation', {
    operation,
    key,
    hit
  });
}

// Create logs directory on startup
import { promises as fs } from 'fs';
fs.mkdir(LOG_DIR, { recursive: true }).catch(err => {
  console.error('Failed to create logs directory:', err);
});

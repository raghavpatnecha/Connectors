/**
 * Google API Batch Request Helper
 * Utilities for batching multiple API calls efficiently
 */

import { logger } from './logger.js';

export interface BatchRequest<T> {
  id: string;
  execute: () => Promise<T>;
}

export interface BatchResult<T> {
  id: string;
  success: boolean;
  data?: T;
  error?: Error;
}

export interface BatchOptions {
  maxBatchSize?: number;
  concurrency?: number;
  delayBetweenBatches?: number;
  continueOnError?: boolean;
}

/**
 * Execute requests in batches with controlled concurrency
 */
export async function executeBatch<T>(
  requests: BatchRequest<T>[],
  options: BatchOptions = {}
): Promise<BatchResult<T>[]> {
  const {
    maxBatchSize = 100,
    concurrency = 10,
    delayBetweenBatches = 0,
    continueOnError = true,
  } = options;

  logger.info('Executing batch requests', {
    totalRequests: requests.length,
    maxBatchSize,
    concurrency,
  });

  const results: BatchResult<T>[] = [];

  // Split into batches
  for (let i = 0; i < requests.length; i += maxBatchSize) {
    const batch = requests.slice(i, i + maxBatchSize);

    logger.debug('Processing batch', {
      batchNumber: Math.floor(i / maxBatchSize) + 1,
      batchSize: batch.length,
    });

    // Execute batch with controlled concurrency
    const batchResults = await executeWithConcurrency(
      batch,
      concurrency,
      continueOnError
    );

    results.push(...batchResults);

    // Delay between batches to avoid rate limits
    if (delayBetweenBatches > 0 && i + maxBatchSize < requests.length) {
      await delay(delayBetweenBatches);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const errorCount = results.filter((r) => !r.success).length;

  logger.info('Batch execution completed', {
    total: results.length,
    success: successCount,
    errors: errorCount,
  });

  return results;
}

/**
 * Execute requests with controlled concurrency
 */
async function executeWithConcurrency<T>(
  requests: BatchRequest<T>[],
  concurrency: number,
  continueOnError: boolean
): Promise<BatchResult<T>[]> {
  const results: BatchResult<T>[] = [];
  const executing: Promise<void>[] = [];

  for (const request of requests) {
    const promise = (async () => {
      try {
        const data = await request.execute();
        results.push({
          id: request.id,
          success: true,
          data,
        });
      } catch (error: any) {
        results.push({
          id: request.id,
          success: false,
          error,
        });

        if (!continueOnError) {
          throw error;
        }
      }
    })();

    executing.push(promise);

    // Limit concurrency
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // Remove completed promises
      executing.splice(
        executing.findIndex((p) => Promise.race([p]).then(() => true)),
        1
      );
    }
  }

  // Wait for remaining promises
  await Promise.all(executing);

  return results;
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 16000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delayMs = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      logger.debug('Retrying after error', {
        attempt: attempt + 1,
        maxRetries,
        delayMs,
        error: error.message,
      });

      await delay(delayMs);
    }
  }

  throw lastError;
}

/**
 * Execute requests in parallel with automatic batching
 */
export async function parallelBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: BatchOptions = {}
): Promise<BatchResult<R>[]> {
  const requests = items.map((item, index) => ({
    id: `item-${index}`,
    execute: () => processor(item),
  }));

  return executeBatch(requests, options);
}

/**
 * Map over array with rate limiting
 */
export async function rateLimitedMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  requestsPerSecond: number = 10
): Promise<R[]> {
  const delayMs = 1000 / requestsPerSecond;
  const results: R[] = [];

  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      await delay(delayMs);
    }

    results.push(await mapper(items[i], i));
  }

  return results;
}

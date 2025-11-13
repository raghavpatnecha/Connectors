/**
 * Reddit Unified MCP - Rate Limiter
 *
 * Implements Reddit API rate limiting with:
 * - Per-endpoint rate limits
 * - Token bucket algorithm
 * - Automatic backoff on 429 responses
 * - Request queuing
 *
 * Reddit Rate Limits:
 * - OAuth: 60 requests per minute
 * - Burst: 600 requests per 10 minutes
 *
 * @module clients/rate-limiter
 */

import { logger } from '../utils/logger';

export interface RateLimitConfig {
  maxRequestsPerMinute?: number;
  maxRequestsPer10Minutes?: number;
  enableAutoBackoff?: boolean;
}

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per millisecond
}

interface QueuedRequest {
  resolve: (value: void) => void;
  reject: (reason?: Error) => void;
  timestamp: number;
}

export class RateLimiter {
  private readonly _perMinuteBucket: RateLimitBucket;
  private readonly _per10MinuteBucket: RateLimitBucket;
  private readonly _enableAutoBackoff: boolean;
  private readonly _requestQueue: QueuedRequest[] = [];
  private _processingQueue: boolean = false;
  private _backoffUntil: number = 0;

  constructor(config: RateLimitConfig = {}) {
    const maxPerMinute = config.maxRequestsPerMinute || 60;
    const maxPer10Minutes = config.maxRequestsPer10Minutes || 600;
    this._enableAutoBackoff = config.enableAutoBackoff !== false;

    // Initialize per-minute bucket (60 requests per 60 seconds)
    this._perMinuteBucket = {
      tokens: maxPerMinute,
      lastRefill: Date.now(),
      maxTokens: maxPerMinute,
      refillRate: maxPerMinute / 60000 // tokens per ms
    };

    // Initialize 10-minute bucket (600 requests per 600 seconds)
    this._per10MinuteBucket = {
      tokens: maxPer10Minutes,
      lastRefill: Date.now(),
      maxTokens: maxPer10Minutes,
      refillRate: maxPer10Minutes / 600000 // tokens per ms
    };

    logger.info('RateLimiter initialized', {
      maxPerMinute,
      maxPer10Minutes,
      enableAutoBackoff: this._enableAutoBackoff
    });
  }

  /**
   * Acquire rate limit token
   * Returns a promise that resolves when rate limit allows the request
   */
  async acquire(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._requestQueue.push({
        resolve,
        reject,
        timestamp: Date.now()
      });

      if (!this._processingQueue) {
        this._processQueue();
      }
    });
  }

  /**
   * Process queued requests
   */
  private async _processQueue(): Promise<void> {
    if (this._processingQueue) {
      return;
    }

    this._processingQueue = true;

    while (this._requestQueue.length > 0) {
      const now = Date.now();

      // Check if we're in backoff period
      if (this._backoffUntil > now) {
        const waitTime = this._backoffUntil - now;
        logger.debug('Rate limiter in backoff', {
          waitTimeMs: waitTime,
          queueLength: this._requestQueue.length
        });
        await this._sleep(waitTime);
        continue;
      }

      // Refill buckets
      this._refillBucket(this._perMinuteBucket);
      this._refillBucket(this._per10MinuteBucket);

      // Check if we have tokens available
      if (this._perMinuteBucket.tokens >= 1 && this._per10MinuteBucket.tokens >= 1) {
        // Consume tokens
        this._perMinuteBucket.tokens -= 1;
        this._per10MinuteBucket.tokens -= 1;

        // Resolve the next request
        const request = this._requestQueue.shift();
        if (request) {
          request.resolve();
        }
      } else {
        // No tokens available, wait for refill
        const waitTime = this._calculateWaitTime();
        logger.debug('Rate limit reached, waiting', {
          waitTimeMs: waitTime,
          perMinuteTokens: this._perMinuteBucket.tokens,
          per10MinuteTokens: this._per10MinuteBucket.tokens,
          queueLength: this._requestQueue.length
        });
        await this._sleep(waitTime);
      }
    }

    this._processingQueue = false;
  }

  /**
   * Refill bucket based on time elapsed
   */
  private _refillBucket(bucket: RateLimitBucket): void {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;

    if (elapsed > 0) {
      const tokensToAdd = elapsed * bucket.refillRate;
      bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  /**
   * Calculate wait time until next token available
   */
  private _calculateWaitTime(): number {
    const perMinuteWait = this._perMinuteBucket.tokens < 1
      ? (1 - this._perMinuteBucket.tokens) / this._perMinuteBucket.refillRate
      : 0;

    const per10MinuteWait = this._per10MinuteBucket.tokens < 1
      ? (1 - this._per10MinuteBucket.tokens) / this._per10MinuteBucket.refillRate
      : 0;

    return Math.max(perMinuteWait, per10MinuteWait, 100); // Minimum 100ms
  }

  /**
   * Handle 429 Too Many Requests response
   * Implements automatic backoff based on Retry-After header
   *
   * @param retryAfter - Seconds to wait (from Retry-After header)
   */
  handle429(retryAfter?: number): void {
    const backoffSeconds = retryAfter || 60; // Default 60 seconds
    this._backoffUntil = Date.now() + backoffSeconds * 1000;

    logger.warn('Rate limit exceeded (429), backing off', {
      backoffSeconds,
      backoffUntil: new Date(this._backoffUntil).toISOString(),
      queueLength: this._requestQueue.length
    });

    // Resume queue processing after backoff
    if (this._requestQueue.length > 0 && !this._processingQueue) {
      setTimeout(() => this._processQueue(), backoffSeconds * 1000);
    }
  }

  /**
   * Reset rate limiter (for testing)
   */
  reset(): void {
    const now = Date.now();

    this._perMinuteBucket.tokens = this._perMinuteBucket.maxTokens;
    this._perMinuteBucket.lastRefill = now;

    this._per10MinuteBucket.tokens = this._per10MinuteBucket.maxTokens;
    this._per10MinuteBucket.lastRefill = now;

    this._backoffUntil = 0;
    this._requestQueue.length = 0;

    logger.info('RateLimiter reset');
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    perMinuteTokens: number;
    per10MinuteTokens: number;
    queueLength: number;
    inBackoff: boolean;
    backoffUntil?: string;
  } {
    // Refill before checking status
    this._refillBucket(this._perMinuteBucket);
    this._refillBucket(this._per10MinuteBucket);

    const now = Date.now();
    const inBackoff = this._backoffUntil > now;

    return {
      perMinuteTokens: Math.floor(this._perMinuteBucket.tokens),
      per10MinuteTokens: Math.floor(this._per10MinuteBucket.tokens),
      queueLength: this._requestQueue.length,
      inBackoff,
      backoffUntil: inBackoff ? new Date(this._backoffUntil).toISOString() : undefined
    };
  }

  /**
   * Sleep helper
   */
  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

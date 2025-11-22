/**
 * Rate Limiter for Twitter API
 * Implements token bucket algorithm with multiple time windows
 *
 * Twitter API Rate Limits:
 * - Free tier: 50 tweets/day, 500 reads/month
 * - Basic ($100/mo): 3,000 tweets/month, 10,000 reads/month
 * - Pro ($5,000/mo): 300,000 tweets/month, 1M reads/month
 */

import { logger } from '../utils/logger';

interface RateLimitConfig {
  requestsPerMinute?: number;
  requestsPerDay?: number;
  requestsPerMonth?: number;
}

interface TokenBucket {
  tokens: number;
  capacity: number;
  refillRate: number; // tokens per second
  lastRefill: number;
}

export class RateLimiter {
  private readonly _minuteBucket: TokenBucket;
  private readonly _dayBucket: TokenBucket;
  private readonly _monthBucket: TokenBucket;
  private _requestCount: {
    minute: number;
    day: number;
    month: number;
  };
  private _lastReset: {
    minute: number;
    day: number;
    month: number;
  };

  constructor(config: RateLimitConfig = {}) {
    const perMinute = config.requestsPerMinute || 15;
    const perDay = config.requestsPerDay || 50;
    const perMonth = config.requestsPerMonth || 500;

    const now = Date.now();

    // Minute bucket
    this._minuteBucket = {
      tokens: perMinute,
      capacity: perMinute,
      refillRate: perMinute / 60, // tokens per second
      lastRefill: now
    };

    // Day bucket
    this._dayBucket = {
      tokens: perDay,
      capacity: perDay,
      refillRate: perDay / (24 * 60 * 60), // tokens per second
      lastRefill: now
    };

    // Month bucket (30 days)
    this._monthBucket = {
      tokens: perMonth,
      capacity: perMonth,
      refillRate: perMonth / (30 * 24 * 60 * 60), // tokens per second
      lastRefill: now
    };

    this._requestCount = { minute: 0, day: 0, month: 0 };
    this._lastReset = { minute: now, day: now, month: now };

    logger.info('RateLimiter initialized', {
      perMinute,
      perDay,
      perMonth
    });
  }

  /**
   * Acquire a token (wait if needed)
   * Checks all three buckets and waits for the longest required wait time
   */
  async acquire(): Promise<void> {
    const now = Date.now();

    // Reset counters if needed
    this._resetCounters(now);

    // Refill all buckets
    this._refillBucket(this._minuteBucket);
    this._refillBucket(this._dayBucket);
    this._refillBucket(this._monthBucket);

    // Calculate wait times for each bucket
    const waitTimes: number[] = [];

    if (this._minuteBucket.tokens < 1) {
      waitTimes.push(this._calculateWaitTime(this._minuteBucket));
    }
    if (this._dayBucket.tokens < 1) {
      waitTimes.push(this._calculateWaitTime(this._dayBucket));
    }
    if (this._monthBucket.tokens < 1) {
      waitTimes.push(this._calculateWaitTime(this._monthBucket));
    }

    // Wait for the longest required time
    if (waitTimes.length > 0) {
      const maxWaitTime = Math.max(...waitTimes);
      logger.warn('Rate limit throttling', {
        waitTimeMs: maxWaitTime.toFixed(0),
        availableTokens: {
          minute: this._minuteBucket.tokens.toFixed(2),
          day: this._dayBucket.tokens.toFixed(2),
          month: this._monthBucket.tokens.toFixed(2)
        }
      });

      await new Promise(resolve => setTimeout(resolve, maxWaitTime));

      // Refill again after waiting
      this._refillBucket(this._minuteBucket);
      this._refillBucket(this._dayBucket);
      this._refillBucket(this._monthBucket);
    }

    // Consume token from all buckets
    this._minuteBucket.tokens -= 1;
    this._dayBucket.tokens -= 1;
    this._monthBucket.tokens -= 1;

    // Increment counters
    this._requestCount.minute++;
    this._requestCount.day++;
    this._requestCount.month++;
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    available: {
      minute: number;
      day: number;
      month: number;
    };
    capacity: {
      minute: number;
      day: number;
      month: number;
    };
    used: {
      minute: number;
      day: number;
      month: number;
    };
  } {
    // Refill before reporting
    this._refillBucket(this._minuteBucket);
    this._refillBucket(this._dayBucket);
    this._refillBucket(this._monthBucket);

    return {
      available: {
        minute: Math.floor(this._minuteBucket.tokens),
        day: Math.floor(this._dayBucket.tokens),
        month: Math.floor(this._monthBucket.tokens)
      },
      capacity: {
        minute: this._minuteBucket.capacity,
        day: this._dayBucket.capacity,
        month: this._monthBucket.capacity
      },
      used: {
        minute: this._requestCount.minute,
        day: this._requestCount.day,
        month: this._requestCount.month
      }
    };
  }

  /**
   * Refill a token bucket based on elapsed time
   */
  private _refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const elapsed = (now - bucket.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * bucket.refillRate;

    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  /**
   * Calculate wait time needed for a bucket to have 1 token
   */
  private _calculateWaitTime(bucket: TokenBucket): number {
    const tokensNeeded = 1 - bucket.tokens;
    const secondsToWait = tokensNeeded / bucket.refillRate;
    return secondsToWait * 1000; // convert to milliseconds
  }

  /**
   * Reset counters based on time windows
   */
  private _resetCounters(now: number): void {
    // Reset minute counter (every 60 seconds)
    if (now - this._lastReset.minute >= 60 * 1000) {
      this._requestCount.minute = 0;
      this._lastReset.minute = now;
    }

    // Reset day counter (every 24 hours)
    if (now - this._lastReset.day >= 24 * 60 * 60 * 1000) {
      this._requestCount.day = 0;
      this._lastReset.day = now;
    }

    // Reset month counter (every 30 days)
    if (now - this._lastReset.month >= 30 * 24 * 60 * 60 * 1000) {
      this._requestCount.month = 0;
      this._lastReset.month = now;
    }
  }
}

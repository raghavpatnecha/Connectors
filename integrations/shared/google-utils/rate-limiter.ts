/**
 * Rate Limiter for Google API calls
 * Implements token bucket algorithm with per-service quotas
 */

import { logger } from './logger.js';

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute?: number;
  requestsPerDay?: number;
  burstSize?: number;
}

/**
 * Google API rate limits by service
 * Based on standard Google Workspace API quotas
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  gmail: {
    requestsPerSecond: 25,
    requestsPerMinute: 250,
    requestsPerDay: 1_000_000_000, // 1 billion quota units
    burstSize: 50,
  },
  drive: {
    requestsPerSecond: 10,
    requestsPerMinute: 1000,
    requestsPerDay: 20_000,
    burstSize: 20,
  },
  calendar: {
    requestsPerSecond: 5,
    requestsPerMinute: 500,
    requestsPerDay: 1_000_000,
    burstSize: 10,
  },
  sheets: {
    requestsPerSecond: 10,
    requestsPerMinute: 500,
    requestsPerDay: 500,
    burstSize: 20,
  },
  docs: {
    requestsPerSecond: 5,
    requestsPerMinute: 300,
    burstSize: 10,
  },
  slides: {
    requestsPerSecond: 5,
    requestsPerMinute: 300,
    burstSize: 10,
  },
  forms: {
    requestsPerSecond: 5,
    requestsPerMinute: 300,
    burstSize: 10,
  },
  tasks: {
    requestsPerSecond: 5,
    requestsPerMinute: 500,
    burstSize: 10,
  },
  chat: {
    requestsPerSecond: 1,
    requestsPerMinute: 60,
    burstSize: 5,
  },
  people: {
    requestsPerSecond: 10,
    requestsPerMinute: 600,
    burstSize: 20,
  },
  admin: {
    requestsPerSecond: 5,
    requestsPerMinute: 1500,
    requestsPerDay: 100_000,
    burstSize: 10,
  },
};

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  minuteCount: number;
  minuteReset: number;
  dayCount: number;
  dayReset: number;
}

export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();
  private waitQueue: Array<{
    service: string;
    resolve: () => void;
    timestamp: number;
  }> = [];

  constructor(customConfigs?: Record<string, RateLimitConfig>) {
    // Initialize with default configs
    Object.entries(DEFAULT_RATE_LIMITS).forEach(([service, config]) => {
      this.configs.set(service, config);
      this.initBucket(service, config);
    });

    // Override with custom configs
    if (customConfigs) {
      Object.entries(customConfigs).forEach(([service, config]) => {
        this.configs.set(service, config);
        this.initBucket(service, config);
      });
    }

    logger.info('Rate limiter initialized', {
      services: Array.from(this.configs.keys()),
    });
  }

  private initBucket(service: string, config: RateLimitConfig): void {
    const now = Date.now();
    this.buckets.set(service, {
      tokens: config.burstSize || config.requestsPerSecond,
      lastRefill: now,
      minuteCount: 0,
      minuteReset: now + 60_000,
      dayCount: 0,
      dayReset: now + 86_400_000,
    });
  }

  /**
   * Acquire permission to make a request
   * Returns a promise that resolves when request can proceed
   */
  async acquire(service: string): Promise<void> {
    const config = this.configs.get(service);

    if (!config) {
      logger.warn('No rate limit config for service, using default', {
        service,
      });
      return; // No rate limiting
    }

    const bucket = this.buckets.get(service)!;
    const now = Date.now();

    // Refill tokens based on time passed
    this.refillTokens(service, bucket, config, now);

    // Check minute and day limits
    if (this.isOverLimit(bucket, config, now)) {
      logger.debug('Rate limit reached, waiting', { service });
      await this.waitForCapacity(service, bucket, config, now);
    }

    // Consume a token
    bucket.tokens -= 1;
    bucket.minuteCount += 1;
    bucket.dayCount += 1;

    logger.debug('Rate limit token acquired', {
      service,
      tokensRemaining: bucket.tokens,
      minuteCount: bucket.minuteCount,
      dayCount: bucket.dayCount,
    });
  }

  private refillTokens(
    service: string,
    bucket: TokenBucket,
    config: RateLimitConfig,
    now: number
  ): void {
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd =
      (timePassed / 1000) * config.requestsPerSecond;
    const maxTokens = config.burstSize || config.requestsPerSecond;

    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, maxTokens);
    bucket.lastRefill = now;

    // Reset minute counter
    if (now >= bucket.minuteReset) {
      bucket.minuteCount = 0;
      bucket.minuteReset = now + 60_000;
    }

    // Reset day counter
    if (now >= bucket.dayReset) {
      bucket.dayCount = 0;
      bucket.dayReset = now + 86_400_000;
    }
  }

  private isOverLimit(
    bucket: TokenBucket,
    config: RateLimitConfig,
    now: number
  ): boolean {
    // Check if we have tokens available
    if (bucket.tokens < 1) {
      return true;
    }

    // Check minute limit
    if (
      config.requestsPerMinute &&
      bucket.minuteCount >= config.requestsPerMinute
    ) {
      return true;
    }

    // Check day limit
    if (config.requestsPerDay && bucket.dayCount >= config.requestsPerDay) {
      return true;
    }

    return false;
  }

  private async waitForCapacity(
    service: string,
    bucket: TokenBucket,
    config: RateLimitConfig,
    now: number
  ): Promise<void> {
    return new Promise((resolve) => {
      // Calculate wait time
      let waitMs = 0;

      if (bucket.tokens < 1) {
        // Wait for tokens to refill
        waitMs = (1 / config.requestsPerSecond) * 1000;
      } else if (
        config.requestsPerMinute &&
        bucket.minuteCount >= config.requestsPerMinute
      ) {
        // Wait for minute reset
        waitMs = bucket.minuteReset - now;
      } else if (
        config.requestsPerDay &&
        bucket.dayCount >= config.requestsPerDay
      ) {
        // Wait for day reset
        waitMs = bucket.dayReset - now;
      }

      logger.debug('Waiting for rate limit capacity', {
        service,
        waitMs,
      });

      setTimeout(resolve, waitMs);
    });
  }

  /**
   * Get current rate limit status for a service
   */
  getStatus(service: string): {
    tokensAvailable: number;
    minuteCountUsed: number;
    dayCountUsed: number;
    minuteResetIn: number;
    dayResetIn: number;
  } | null {
    const bucket = this.buckets.get(service);
    const config = this.configs.get(service);

    if (!bucket || !config) {
      return null;
    }

    const now = Date.now();
    this.refillTokens(service, bucket, config, now);

    return {
      tokensAvailable: Math.floor(bucket.tokens),
      minuteCountUsed: bucket.minuteCount,
      dayCountUsed: bucket.dayCount,
      minuteResetIn: Math.max(0, bucket.minuteReset - now),
      dayResetIn: Math.max(0, bucket.dayReset - now),
    };
  }

  /**
   * Reset rate limits for a service (for testing)
   */
  reset(service: string): void {
    const config = this.configs.get(service);
    if (config) {
      this.initBucket(service, config);
      logger.debug('Rate limiter reset', { service });
    }
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.configs.forEach((config, service) => {
      this.initBucket(service, config);
    });
    logger.debug('All rate limiters reset');
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter();

/**
 * Rate limit decorator for async functions
 */
export function rateLimit(service: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      await globalRateLimiter.acquire(service);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

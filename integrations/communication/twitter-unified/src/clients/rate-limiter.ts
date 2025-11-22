/**
 * Endpoint-Specific Rate Limiter for Twitter API
 * Based on mcp-twikit implementation
 *
 * Twitter API Rate Limits (per endpoint type):
 * - Tweets: 300 per 15 minutes (from mcp-twikit)
 * - DMs: 1,000 per 15 minutes (from mcp-twikit)
 * - General: 15 per minute (default Twitter API limit)
 *
 * Also supports global tier-based limits:
 * - Free tier: 50 tweets/day, 500 reads/month
 * - Basic ($100/mo): 3,000 tweets/month, 10,000 reads/month
 * - Pro ($5,000/mo): 300,000 tweets/month, 1M reads/month
 */

import { logger } from '../utils/logger';

type EndpointType = 'tweet' | 'dm' | 'general';

interface RateLimitConfig {
  // Global tier-based limits
  requestsPerMinute?: number;
  requestsPerDay?: number;
  requestsPerMonth?: number;
}

interface EndpointRateLimit {
  timestamps: number[]; // Timestamps of recent requests
  limit: number; // Max requests in window
  window: number; // Window duration in milliseconds
}

/**
 * Endpoint-specific rate limiter with token bucket algorithm
 * Implements both endpoint-specific and global tier-based limits
 */
export class EndpointAwareRateLimiter {
  // Endpoint-specific limits (15 minute windows)
  private readonly _endpointLimits: Map<EndpointType, EndpointRateLimit>;
  private readonly _windowDuration = 15 * 60 * 1000; // 15 minutes in ms

  // Global tier-based limits
  private _globalMinuteTokens: number;
  private _globalDayTokens: number;
  private _globalMonthTokens: number;
  private readonly _globalMinuteCapacity: number;
  private readonly _globalDayCapacity: number;
  private readonly _globalMonthCapacity: number;
  private _lastGlobalReset: {
    minute: number;
    day: number;
    month: number;
  };

  constructor(config: RateLimitConfig = {}) {
    // Initialize endpoint-specific limits
    this._endpointLimits = new Map([
      ['tweet', { timestamps: [], limit: 300, window: this._windowDuration }],
      ['dm', { timestamps: [], limit: 1000, window: this._windowDuration }],
      ['general', { timestamps: [], limit: 900, window: this._windowDuration }] // 15min * 60req/min
    ]);

    // Initialize global tier-based limits
    this._globalMinuteCapacity = config.requestsPerMinute || 15;
    this._globalDayCapacity = config.requestsPerDay || 50;
    this._globalMonthCapacity = config.requestsPerMonth || 500;

    const now = Date.now();
    this._globalMinuteTokens = this._globalMinuteCapacity;
    this._globalDayTokens = this._globalDayCapacity;
    this._globalMonthTokens = this._globalMonthCapacity;
    this._lastGlobalReset = { minute: now, day: now, month: now };

    logger.info('EndpointAwareRateLimiter initialized', {
      endpointLimits: {
        tweet: '300/15min',
        dm: '1000/15min',
        general: '900/15min'
      },
      globalLimits: {
        perMinute: this._globalMinuteCapacity,
        perDay: this._globalDayCapacity,
        perMonth: this._globalMonthCapacity
      }
    });
  }

  /**
   * Get endpoint type from tool name
   */
  private _getEndpointType(toolName: string): EndpointType {
    // Tweet operations
    if (toolName.includes('tweet') || toolName.includes('post') ||
        toolName === 'reply_to_tweet' || toolName === 'quote_tweet') {
      return 'tweet';
    }

    // DM operations
    if (toolName.includes('dm') || toolName.includes('message')) {
      return 'dm';
    }

    // Everything else
    return 'general';
  }

  /**
   * Check if request is within endpoint-specific rate limit
   */
  private _checkEndpointLimit(endpointType: EndpointType): boolean {
    const limit = this._endpointLimits.get(endpointType)!;
    const now = Date.now();
    const windowStart = now - limit.window;

    // Remove timestamps outside the window
    limit.timestamps = limit.timestamps.filter(ts => ts >= windowStart);

    // Check if we're within the limit
    return limit.timestamps.length < limit.limit;
  }

  /**
   * Record a request for an endpoint
   */
  private _recordEndpointRequest(endpointType: EndpointType): void {
    const limit = this._endpointLimits.get(endpointType)!;
    limit.timestamps.push(Date.now());
  }

  /**
   * Calculate wait time for endpoint limit
   */
  private _calculateEndpointWaitTime(endpointType: EndpointType): number {
    const limit = this._endpointLimits.get(endpointType)!;
    const now = Date.now();
    const windowStart = now - limit.window;

    // Find oldest timestamp in current window
    const oldestInWindow = limit.timestamps.find(ts => ts >= windowStart);
    if (!oldestInWindow) return 0;

    // Wait until oldest timestamp falls out of window
    return (oldestInWindow + limit.window) - now;
  }

  /**
   * Reset global counters if needed
   */
  private _resetGlobalCounters(): void {
    const now = Date.now();

    if (now - this._lastGlobalReset.minute >= 60 * 1000) {
      this._globalMinuteTokens = this._globalMinuteCapacity;
      this._lastGlobalReset.minute = now;
    }

    if (now - this._lastGlobalReset.day >= 24 * 60 * 60 * 1000) {
      this._globalDayTokens = this._globalDayCapacity;
      this._lastGlobalReset.day = now;
    }

    if (now - this._lastGlobalReset.month >= 30 * 24 * 60 * 60 * 1000) {
      this._globalMonthTokens = this._globalMonthCapacity;
      this._lastGlobalReset.month = now;
    }
  }

  /**
   * Acquire a token for a specific tool/endpoint
   * Checks both endpoint-specific AND global tier-based limits
   */
  async acquire(toolName: string): Promise<void> {
    const endpointType = this._getEndpointType(toolName);

    // Reset global counters
    this._resetGlobalCounters();

    // Calculate wait times
    const waitTimes: number[] = [];

    // Check endpoint-specific limit
    if (!this._checkEndpointLimit(endpointType)) {
      const endpointWait = this._calculateEndpointWaitTime(endpointType);
      if (endpointWait > 0) {
        waitTimes.push(endpointWait);
      }
    }

    // Check global limits
    if (this._globalMinuteTokens < 1) {
      waitTimes.push((60 - ((Date.now() - this._lastGlobalReset.minute) / 1000)) * 1000);
    }
    if (this._globalDayTokens < 1) {
      waitTimes.push((24 * 60 * 60 - ((Date.now() - this._lastGlobalReset.day) / 1000)) * 1000);
    }
    if (this._globalMonthTokens < 1) {
      waitTimes.push((30 * 24 * 60 * 60 - ((Date.now() - this._lastGlobalReset.month) / 1000)) * 1000);
    }

    // Wait if needed
    if (waitTimes.length > 0) {
      const maxWaitTime = Math.max(...waitTimes);

      logger.warn('Rate limit throttling', {
        toolName,
        endpointType,
        waitTimeMs: Math.round(maxWaitTime),
        endpointStatus: this._getEndpointStatus(endpointType),
        globalStatus: {
          minute: this._globalMinuteTokens,
          day: this._globalDayTokens,
          month: this._globalMonthTokens
        }
      });

      await new Promise(resolve => setTimeout(resolve, maxWaitTime));

      // Reset counters after wait
      this._resetGlobalCounters();
    }

    // Consume tokens
    this._recordEndpointRequest(endpointType);
    this._globalMinuteTokens -= 1;
    this._globalDayTokens -= 1;
    this._globalMonthTokens -= 1;
  }

  /**
   * Get endpoint status
   */
  private _getEndpointStatus(endpointType: EndpointType): {
    used: number;
    limit: number;
    remaining: number;
  } {
    const limit = this._endpointLimits.get(endpointType)!;
    const now = Date.now();
    const windowStart = now - limit.window;
    const used = limit.timestamps.filter(ts => ts >= windowStart).length;

    return {
      used,
      limit: limit.limit,
      remaining: limit.limit - used
    };
  }

  /**
   * Get comprehensive rate limit status
   */
  getStatus(): {
    endpoints: Record<EndpointType, { used: number; limit: number; remaining: number }>;
    global: {
      minute: { available: number; capacity: number };
      day: { available: number; capacity: number };
      month: { available: number; capacity: number };
    };
  } {
    this._resetGlobalCounters();

    return {
      endpoints: {
        tweet: this._getEndpointStatus('tweet'),
        dm: this._getEndpointStatus('dm'),
        general: this._getEndpointStatus('general')
      },
      global: {
        minute: {
          available: Math.floor(this._globalMinuteTokens),
          capacity: this._globalMinuteCapacity
        },
        day: {
          available: Math.floor(this._globalDayTokens),
          capacity: this._globalDayCapacity
        },
        month: {
          available: Math.floor(this._globalMonthTokens),
          capacity: this._globalMonthCapacity
        }
      }
    };
  }

  /**
   * Check if a request would be rate limited
   */
  wouldBeRateLimited(toolName: string): boolean {
    const endpointType = this._getEndpointType(toolName);
    this._resetGlobalCounters();

    return !this._checkEndpointLimit(endpointType) ||
           this._globalMinuteTokens < 1 ||
           this._globalDayTokens < 1 ||
           this._globalMonthTokens < 1;
  }
}

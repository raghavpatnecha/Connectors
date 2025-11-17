/**
 * Rate limit management for Product Hunt API
 *
 * Product Hunt uses complexity-based GraphQL rate limiting:
 * - 6250 complexity points per hour
 * - Resets hourly
 */

import { logger } from './logger.js';

export interface RateLimitInfo {
  remaining: number;
  resetAt: string | null;
  resetInSeconds: number;
}

export class RateLimiter {
  private static remaining: number = 6250; // Product Hunt complexity limit
  private static resetTimestamp: number = 0;

  /**
   * Get current rate limit information
   */
  static getRateLimitInfo(): RateLimitInfo {
    const now = Math.floor(Date.now() / 1000);
    const resetIn = Math.max(0, this.resetTimestamp - now);

    let resetAt: string | null = null;
    if (this.resetTimestamp > 0) {
      try {
        resetAt = new Date((now + resetIn) * 1000).toISOString();
      } catch (error) {
        logger.warn('Failed to format reset timestamp', { error });
      }
    }

    return {
      remaining: this.remaining,
      resetAt,
      resetInSeconds: resetIn,
    };
  }

  /**
   * Update rate limit info from Product Hunt API response headers
   */
  static updateFromHeaders(headers: Record<string, string>): void {
    // Product Hunt uses these headers:
    // x-rate-limit-remaining: remaining complexity points
    // x-rate-limit-reset: seconds until reset

    const remainingHeader = headers['x-rate-limit-remaining'];
    const resetHeader = headers['x-rate-limit-reset'];

    if (remainingHeader) {
      try {
        this.remaining = parseInt(remainingHeader, 10);
        logger.debug('Updated rate limit remaining', { remaining: this.remaining });
      } catch (error) {
        logger.warn('Failed to parse rate limit remaining', { remainingHeader });
      }
    }

    if (resetHeader) {
      try {
        const resetSeconds = parseInt(resetHeader, 10);
        const currentTime = Math.floor(Date.now() / 1000);
        this.resetTimestamp = currentTime + resetSeconds;
        logger.debug('Updated rate limit reset', {
          resetTimestamp: this.resetTimestamp,
          resetSeconds,
        });
      } catch (error) {
        logger.warn('Failed to parse rate limit reset', { resetHeader });
      }
    }
  }

  /**
   * Check if we're currently rate limited
   */
  static isRateLimited(): boolean {
    const now = Math.floor(Date.now() / 1000);
    return now < this.resetTimestamp && this.remaining <= 0;
  }

  /**
   * Get seconds until rate limit resets
   */
  static getResetWaitTime(): number {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, this.resetTimestamp - now);
  }
}

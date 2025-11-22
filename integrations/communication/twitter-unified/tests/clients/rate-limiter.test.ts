/**
 * Rate Limiter Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RateLimiter } from '../../src/clients/rate-limiter';

describe('RateLimiter', () => {
  describe('token bucket algorithm', () => {
    it('should allow requests within rate limit', async () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 60,
        requestsPerDay: 100,
        requestsPerMonth: 500
      });

      // Should not throw or block
      await limiter.acquire();
      await limiter.acquire();
      await limiter.acquire();

      const status = limiter.getStatus();
      expect(status.used.minute).toBe(3);
    });

    it('should throttle when exceeding rate limit', async () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 2, // Very low limit for testing
        requestsPerDay: 100,
        requestsPerMonth: 500
      });

      const start = Date.now();

      // Consume all tokens
      await limiter.acquire();
      await limiter.acquire();

      // This should wait
      await limiter.acquire();

      const duration = Date.now() - start;

      // Should have waited some time (>100ms)
      expect(duration).toBeGreaterThan(100);
    });

    it('should track usage across multiple time windows', async () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 15,
        requestsPerDay: 50,
        requestsPerMonth: 500
      });

      await limiter.acquire();
      await limiter.acquire();
      await limiter.acquire();

      const status = limiter.getStatus();

      expect(status.used.minute).toBe(3);
      expect(status.used.day).toBe(3);
      expect(status.used.month).toBe(3);
    });

    it('should report available tokens', () => {
      const limiter = new RateLimiter({
        requestsPerMinute: 15,
        requestsPerDay: 50,
        requestsPerMonth: 500
      });

      const status = limiter.getStatus();

      expect(status.capacity.minute).toBe(15);
      expect(status.capacity.day).toBe(50);
      expect(status.capacity.month).toBe(500);
      expect(status.available.minute).toBeGreaterThan(0);
    });
  });
});

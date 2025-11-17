/**
 * Multi-layer rate limiting middleware with Redis backend
 *
 * Implements three layers of rate limiting:
 * 1. Global per-IP rate limiting (DDoS protection)
 * 2. Per-tenant rate limiting (multi-tenancy fairness)
 * 3. Per-endpoint rate limiting (resource protection)
 *
 * Uses Redis for distributed rate limiting across gateway instances.
 */

import { Request, Response, RequestHandler } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient, RedisClientType } from 'redis';
import { logger } from '../logging/logger';

// Rate limit configuration from environment variables
const GLOBAL_RATE_LIMIT = parseInt(process.env.RATE_LIMIT_GLOBAL_RPS || '1000', 10);
const TENANT_RATE_LIMIT = parseInt(process.env.RATE_LIMIT_TENANT_RPS || '100', 10);
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const KEY_PREFIX = process.env.RATE_LIMIT_KEY_PREFIX || 'rl:';

// Exempt paths (health checks, monitoring)
const EXEMPT_PATHS = (process.env.RATE_LIMIT_EXEMPT_PATHS || '/health,/ready')
  .split(',')
  .map(path => path.trim());

/**
 * Redis client for rate limiting
 */
let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis client for rate limiting
 */
export async function initializeRateLimitRedis(): Promise<void> {
  if (redisClient) {
    return; // Already initialized
  }

  try {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on('error', (err) => {
      logger.error('Rate limit Redis client error', { error: err.message });
    });

    redisClient.on('connect', () => {
      logger.info('Rate limit Redis client connected', { url: REDIS_URL });
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to initialize rate limit Redis client', { error });
    // Don't throw - allow in-memory fallback
  }
}

/**
 * Close Redis connection
 */
export async function closeRateLimitRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Check if path is exempt from rate limiting
 */
function isExemptPath(path: string): boolean {
  return EXEMPT_PATHS.some(exemptPath => path.startsWith(exemptPath));
}

/**
 * Custom error handler for rate limit exceeded
 */
function rateLimitHandler(req: Request, res: Response): void {
  const scope = (req as any).rateLimitScope || 'unknown';
  const limit = (req as any).rateLimit?.limit || 0;
  const resetTime = (req as any).rateLimit?.resetTime || new Date(Date.now() + 60000);

  logger.warn('Rate limit exceeded', {
    scope,
    ip: req.ip,
    path: req.path,
    method: req.method,
    tenantId: extractTenantId(req),
    limit,
    resetTime
  });

  res.status(429).json({
    error: 'Rate Limit Exceeded',
    message: 'Too many requests. Please try again later.',
    retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
    limits: {
      scope,
      limit,
      window: '1 minute',
      remaining: 0,
      resetAt: resetTime.toISOString()
    }
  });
}

/**
 * Extract tenant ID from request
 * Checks body, query params, and URL params
 */
function extractTenantId(req: Request): string | undefined {
  return (
    req.body?.tenantId ||
    req.body?.context?.tenantId ||
    req.query?.tenantId as string ||
    req.params?.tenantId
  );
}

/**
 * Create Redis store for rate limiting
 */
function createRedisStore(keyPrefix: string): RedisStore | undefined {
  if (!redisClient) {
    logger.warn('Redis client not available, using in-memory rate limiting');
    return undefined;
  }

  return new RedisStore({
    // @ts-expect-error - RedisStore expects redis v3 client, but works with v4
    client: redisClient,
    prefix: keyPrefix,
    sendCommand: (...args: string[]) => redisClient!.sendCommand(args),
  });
}

/**
 * Global rate limiter (per-IP)
 * Protects against DDoS attacks and resource exhaustion
 *
 * Default: 1000 req/s per IP address
 * Window: 1 second
 * Exempt: /health, /ready
 */
export function createGlobalRateLimiter(): RateLimitRequestHandler {
  const store = createRedisStore(`${KEY_PREFIX}global:`);

  return rateLimit({
    windowMs: 1000, // 1 second window
    max: GLOBAL_RATE_LIMIT,
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    store,
    skip: (req: Request) => isExemptPath(req.path),
    handler: (req: Request, res: Response) => {
      (req as any).rateLimitScope = 'global';
      rateLimitHandler(req, res);
    },
    keyGenerator: (req: Request) => {
      // Use IP address as key
      return req.ip || 'unknown';
    },
  });
}

/**
 * Tenant rate limiter (per-tenant)
 * Ensures multi-tenancy fairness
 *
 * Default: 100 req/s per tenant
 * Window: 1 minute
 */
export function createTenantRateLimiter(): RequestHandler {
  const store = createRedisStore(`${KEY_PREFIX}tenant:`);

  const limiter = rateLimit({
    windowMs: 60000, // 1 minute window
    max: TENANT_RATE_LIMIT,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    skip: (req: Request) => {
      // Skip if no tenant ID (public endpoints)
      const tenantId = extractTenantId(req);
      return !tenantId || isExemptPath(req.path);
    },
    handler: (req: Request, res: Response) => {
      (req as any).rateLimitScope = 'tenant';
      rateLimitHandler(req, res);
    },
    keyGenerator: (req: Request) => {
      const tenantId = extractTenantId(req);
      return tenantId || 'anonymous';
    },
  });

  return limiter;
}

/**
 * Create endpoint-specific rate limiter
 * Protects expensive operations with granular limits
 *
 * @param endpoint - Endpoint name for logging and key generation
 * @param requestsPerSecond - Maximum requests per second per tenant
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 */
export function createEndpointRateLimiter(
  endpoint: string,
  requestsPerSecond: number,
  windowMs: number = 60000
): RateLimitRequestHandler {
  const store = createRedisStore(`${KEY_PREFIX}endpoint:${endpoint}:`);

  // Calculate max requests per window
  const maxRequests = Math.ceil((requestsPerSecond * windowMs) / 1000);

  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    store,
    handler: (req: Request, res: Response) => {
      (req as any).rateLimitScope = `endpoint:${endpoint}`;
      rateLimitHandler(req, res);
    },
    keyGenerator: (req: Request) => {
      const tenantId = extractTenantId(req);
      return `${endpoint}:${tenantId || 'anonymous'}`;
    },
  });
}

/**
 * Pre-configured endpoint limiters
 */
export function createEndpointLimiters() {
  return {
    // Tool selection (FAISS + semantic routing)
    toolsSelect: createEndpointRateLimiter('tools-select', 10, 60000),

    // Tool invocation (integration API calls)
    toolsInvoke: createEndpointRateLimiter('tools-invoke', 20, 60000),

    // Tool listing (paginated queries)
    toolsList: createEndpointRateLimiter('tools-list', 5, 60000),

    // OAuth configuration - POST (Vault write operations)
    oauthConfigPost: createEndpointRateLimiter('oauth-config-post', 1, 60000),

    // OAuth configuration - GET (Vault read operations)
    oauthConfigGet: createEndpointRateLimiter('oauth-config-get', 10, 60000),

    // OAuth configuration - DELETE (Vault delete operations)
    oauthConfigDelete: createEndpointRateLimiter('oauth-config-delete', 1, 60000),

    // Integration listing
    integrationsList: createEndpointRateLimiter('integrations-list', 5, 60000),
  };
}

/**
 * Example 429 response format for documentation
 */
export const EXAMPLE_429_RESPONSE = {
  error: 'Rate Limit Exceeded',
  message: 'Too many requests. Please try again later.',
  retryAfter: 60,
  limits: {
    scope: 'tenant',
    limit: 100,
    window: '1 minute',
    remaining: 0,
    resetAt: '2025-11-17T12:34:45Z'
  }
};

/**
 * Rate limit middleware configuration
 */
export interface RateLimitConfig {
  globalEnabled: boolean;
  globalRps: number;
  tenantEnabled: boolean;
  tenantRps: number;
  endpointLimitsEnabled: boolean;
  exemptPaths: string[];
}

/**
 * Get current rate limit configuration
 */
export function getRateLimitConfig(): RateLimitConfig {
  return {
    globalEnabled: process.env.RATE_LIMIT_GLOBAL_ENABLED !== 'false',
    globalRps: GLOBAL_RATE_LIMIT,
    tenantEnabled: process.env.RATE_LIMIT_TENANT_ENABLED !== 'false',
    tenantRps: TENANT_RATE_LIMIT,
    endpointLimitsEnabled: process.env.RATE_LIMIT_ENDPOINT_ENABLED !== 'false',
    exemptPaths: EXEMPT_PATHS,
  };
}

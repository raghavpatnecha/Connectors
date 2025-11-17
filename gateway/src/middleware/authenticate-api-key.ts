/**
 * API Key Authentication Middleware
 *
 * Validates API keys from Authorization header and attaches auth context to requests.
 * Implements caching for performance (5-minute TTL).
 */

import { Request, Response, NextFunction } from 'express';
import { VaultClient } from '../auth/vault-client';
import { logger } from '../logging/logger';
import { AuthenticationError } from '../errors/gateway-errors';

/**
 * Authentication context attached to requests after successful authentication
 */
export interface AuthContext {
  /** API key ID (for audit logging) */
  apiKeyId: string;

  /** Tenant ID associated with this API key */
  tenantId: string;

  /** Scopes/permissions granted to this API key */
  scopes: string[];

  /** Rate limit configuration for this tenant */
  rateLimit: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };

  /** API key metadata */
  metadata?: {
    name?: string;
    createdAt?: Date;
    lastUsedAt?: Date;
  };
}

/**
 * API key data stored in Vault
 */
export interface APIKeyData {
  id: string;
  tenantId: string;
  scopes: string[];
  rateLimit: {
    requestsPerSecond: number;
    requestsPerMinute: number;
  };
  metadata?: {
    name?: string;
    createdAt?: Date;
    lastUsedAt?: Date;
  };
  hashedKey?: string;
}

/**
 * Extend Express Request to include auth context
 */
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * In-memory cache for API keys (5-minute TTL)
 *
 * NOTE: This in-memory cache works for single-instance deployments.
 * For multi-instance deployments, use a distributed cache (Redis) instead.
 */
interface CacheEntry {
  authContext: AuthContext;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

/**
 * APIKeyAuthenticator handles API key validation and caching
 */
export class APIKeyAuthenticator {
  private readonly _vault: VaultClient;
  private readonly _cache: Map<string, CacheEntry>;
  private _cleanupInterval: NodeJS.Timeout | null = null;

  constructor(vaultClient: VaultClient) {
    this._vault = vaultClient;
    this._cache = new Map<string, CacheEntry>();
    this._startCleanupInterval();
  }

  /**
   * Start periodic cache cleanup
   * @private
   */
  private _startCleanupInterval(): void {
    // Clean expired cache entries every minute
    this._cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;

      for (const [key, entry] of this._cache.entries()) {
        if (entry.expiresAt < now) {
          this._cache.delete(key);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.debug('Cleaned expired API key cache entries', { count: cleanedCount });
      }
    }, CACHE_CLEANUP_INTERVAL_MS);

    // Prevent the interval from keeping the process alive
    this._cleanupInterval.unref();
  }

  /**
   * Express middleware for API key authentication
   *
   * Extracts Bearer token from Authorization header, validates it,
   * and attaches auth context to request.
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Extract Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
          throw new AuthenticationError(
            'Missing Authorization header. Please provide an API key using: Authorization: Bearer <api-key>',
            'MISSING_AUTH_HEADER'
          );
        }

        // Validate Bearer token format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
          throw new AuthenticationError(
            'Invalid Authorization header format. Expected: Authorization: Bearer <api-key>',
            'INVALID_AUTH_FORMAT'
          );
        }

        const apiKey = parts[1];
        if (!apiKey || apiKey.length < 32) {
          throw new AuthenticationError(
            'Invalid API key format. API keys must be at least 32 characters long.',
            'INVALID_API_KEY_FORMAT'
          );
        }

        // Check cache first
        const cached = this._getFromCache(apiKey);
        if (cached) {
          req.auth = cached;
          logger.debug('API key authentication succeeded (cached)', {
            apiKeyId: cached.apiKeyId,
            tenantId: cached.tenantId,
            path: req.path,
          });
          next();
          return;
        }

        // Validate API key via Vault
        const authContext = await this.validateAPIKey(apiKey);

        // Cache the result
        this._addToCache(apiKey, authContext);

        // Attach to request
        req.auth = authContext;

        logger.info('API key authentication succeeded', {
          apiKeyId: authContext.apiKeyId,
          tenantId: authContext.tenantId,
          path: req.path,
          method: req.method,
        });

        next();
      } catch (error) {
        if (error instanceof AuthenticationError) {
          logger.warn('API key authentication failed', {
            error: error.message,
            code: error.code,
            path: req.path,
            ip: req.ip,
          });

          res.status(401).json({
            success: false,
            error: {
              code: error.code,
              message: error.message,
              type: 'AuthenticationError',
            },
            metadata: {
              timestamp: new Date().toISOString(),
              path: req.path,
            },
          });
        } else {
          logger.error('Unexpected error during API key authentication', {
            error: error instanceof Error ? error.message : String(error),
            path: req.path,
          });

          res.status(500).json({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'An unexpected error occurred during authentication',
            },
            metadata: {
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
    };
  }

  /**
   * Validate API key against Vault
   *
   * @param apiKey - API key to validate
   * @returns Auth context if valid
   * @throws AuthenticationError if invalid
   */
  async validateAPIKey(apiKey: string): Promise<AuthContext> {
    try {
      // Retrieve API key data from Vault
      const apiKeyData = await this._vault.getAPIKey(apiKey);

      if (!apiKeyData) {
        throw new AuthenticationError(
          'Invalid API key. Please check your credentials or generate a new API key.',
          'INVALID_API_KEY'
        );
      }

      // Build auth context
      const authContext: AuthContext = {
        apiKeyId: apiKeyData.id,
        tenantId: apiKeyData.tenantId,
        scopes: apiKeyData.scopes || [],
        rateLimit: apiKeyData.rateLimit || {
          requestsPerSecond: 10,
          requestsPerMinute: 100,
        },
        metadata: apiKeyData.metadata,
      };

      return authContext;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      logger.error('Failed to validate API key', {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new AuthenticationError(
        'Failed to validate API key. Please try again or contact support.',
        'VALIDATION_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get API key from cache
   */
  private _getFromCache(apiKey: string): AuthContext | null {
    const entry = this._cache.get(apiKey);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this._cache.delete(apiKey);
      return null;
    }

    return entry.authContext;
  }

  /**
   * Add API key to cache
   */
  private _addToCache(apiKey: string, authContext: AuthContext): void {
    this._cache.set(apiKey, {
      authContext,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  clearCache(): void {
    this._cache.clear();
    logger.info('API key cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; ttl: number } {
    return {
      size: this._cache.size,
      ttl: CACHE_TTL_MS,
    };
  }

  /**
   * Dispose of resources and stop background cleanup
   * Call this when shutting down the authenticator
   */
  dispose(): void {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
      logger.debug('API key cache cleanup interval stopped');
    }

    this.clearCache();
    logger.info('APIKeyAuthenticator disposed');
  }
}

/**
 * Factory function to create API key middleware
 *
 * @param vaultClient - VaultClient instance for API key validation
 * @returns Express middleware function
 */
export function createAPIKeyMiddleware(vaultClient: VaultClient) {
  const authenticator = new APIKeyAuthenticator(vaultClient);
  return authenticator.middleware();
}

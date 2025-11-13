/**
 * Reddit Unified MCP - Session Manager
 *
 * Manages user sessions with Redis caching for high-performance
 * access token retrieval and session validation.
 *
 * Features:
 * - Redis-backed session cache
 * - Automatic session expiration
 * - Session validation and renewal
 * - Multi-tenant session isolation
 *
 * @module auth/session-manager
 */

import { createClient, RedisClientType } from 'redis';
import type {
  SessionData,
  OAuthCredentials,
  SessionValidationResult
} from './types';
import { OAuthManager } from './oauth-manager';
import { logger } from '../utils/logger';

export interface SessionManagerConfig {
  redisUrl: string;
  sessionTTL?: number; // Session TTL in seconds (default: 1 hour)
  refreshBuffer?: number; // Refresh buffer in seconds (default: 5 minutes)
}

export class SessionManager {
  private readonly _redis: RedisClientType;
  private readonly _oauthManager: OAuthManager;
  private readonly _sessionTTL: number;
  private readonly _refreshBuffer: number;
  private _connected: boolean = false;

  // Redis key prefixes
  private readonly _sessionPrefix = 'session:';
  private readonly _userPrefix = 'user:';

  constructor(config: SessionManagerConfig, oauthManager: OAuthManager) {
    this._redis = createClient({ url: config.redisUrl });
    this._oauthManager = oauthManager;
    this._sessionTTL = config.sessionTTL || 3600; // 1 hour default
    this._refreshBuffer = config.refreshBuffer || 300; // 5 minutes default

    // Setup Redis event handlers
    this._redis.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
    });

    this._redis.on('connect', () => {
      logger.info('Redis client connected');
      this._connected = true;
    });

    this._redis.on('disconnect', () => {
      logger.warn('Redis client disconnected');
      this._connected = false;
    });

    logger.info('SessionManager initialized', {
      redisUrl: config.redisUrl,
      sessionTTL: this._sessionTTL,
      refreshBuffer: this._refreshBuffer
    });
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    if (!this._connected) {
      try {
        await this._redis.connect();
        logger.info('SessionManager connected to Redis');
      } catch (error) {
        logger.error('Failed to connect to Redis', {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this._connected) {
      try {
        await this._redis.quit();
        this._connected = false;
        logger.info('SessionManager disconnected from Redis');
      } catch (error) {
        logger.error('Failed to disconnect from Redis', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  /**
   * Create or update session from OAuth credentials
   *
   * @param tenantId - Unique tenant identifier
   * @param credentials - OAuth credentials
   * @param username - Optional Reddit username
   * @returns Session data
   */
  async createSession(
    tenantId: string,
    credentials: OAuthCredentials,
    username?: string
  ): Promise<SessionData> {
    try {
      logger.info('Creating session', { tenantId, username });

      const now = Date.now();
      const sessionData: SessionData = {
        tenantId,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        expiresAt: credentials.expiresAt.getTime(),
        scopes: credentials.scopes,
        username,
        createdAt: now,
        lastUsedAt: now
      };

      // Store session in Redis
      const sessionKey = this._getSessionKey(tenantId);
      await this._redis.setEx(
        sessionKey,
        this._sessionTTL,
        JSON.stringify(sessionData)
      );

      // If username provided, create username -> tenantId mapping
      if (username) {
        const userKey = this._getUserKey(username);
        await this._redis.setEx(userKey, this._sessionTTL, tenantId);
      }

      logger.info('Session created', {
        tenantId,
        username,
        expiresAt: new Date(sessionData.expiresAt).toISOString()
      });

      return sessionData;
    } catch (error) {
      logger.error('Failed to create session', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get session by tenant ID
   *
   * @param tenantId - Unique tenant identifier
   * @returns Session data or null if not found
   */
  async getSession(tenantId: string): Promise<SessionData | null> {
    try {
      const sessionKey = this._getSessionKey(tenantId);
      const data = await this._redis.get(sessionKey);

      if (!data) {
        logger.debug('Session not found in cache', { tenantId });
        return null;
      }

      const session: SessionData = JSON.parse(data);

      // Update last used timestamp
      session.lastUsedAt = Date.now();
      await this._redis.setEx(
        sessionKey,
        this._sessionTTL,
        JSON.stringify(session)
      );

      logger.debug('Session retrieved from cache', { tenantId });
      return session;
    } catch (error) {
      logger.error('Failed to get session', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Get session by username
   *
   * @param username - Reddit username
   * @returns Session data or null if not found
   */
  async getSessionByUsername(username: string): Promise<SessionData | null> {
    try {
      const userKey = this._getUserKey(username);
      const tenantId = await this._redis.get(userKey);

      if (!tenantId) {
        logger.debug('User not found in cache', { username });
        return null;
      }

      return await this.getSession(tenantId);
    } catch (error) {
      logger.error('Failed to get session by username', {
        username,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Validate session and get valid access token
   *
   * @param tenantId - Unique tenant identifier
   * @returns Validation result with session data
   */
  async validateSession(tenantId: string): Promise<SessionValidationResult> {
    try {
      logger.debug('Validating session', { tenantId });

      // Get session from cache
      const session = await this.getSession(tenantId);

      if (!session) {
        logger.debug('Session not found', { tenantId });
        return {
          valid: false,
          reason: 'Session not found in cache'
        };
      }

      const now = Date.now();
      const expiresAt = session.expiresAt;
      const timeUntilExpiry = expiresAt - now;

      // Check if token is expired
      if (timeUntilExpiry <= 0) {
        logger.info('Session token expired, attempting refresh', {
          tenantId,
          expiredAt: new Date(expiresAt).toISOString()
        });

        // Try to refresh token
        const refreshed = await this._refreshSessionToken(tenantId, session);
        if (refreshed) {
          return {
            valid: true,
            session: refreshed
          };
        }

        return {
          valid: false,
          reason: 'Token expired and refresh failed'
        };
      }

      // Check if token needs refresh (within buffer time)
      if (timeUntilExpiry < this._refreshBuffer * 1000) {
        logger.info('Session token about to expire, attempting refresh', {
          tenantId,
          expiresAt: new Date(expiresAt).toISOString(),
          timeUntilExpiry: Math.round(timeUntilExpiry / 1000) + 's'
        });

        // Try to refresh token (but don't fail if refresh fails)
        const refreshed = await this._refreshSessionToken(tenantId, session);
        if (refreshed) {
          return {
            valid: true,
            session: refreshed
          };
        }

        // Refresh failed, but token still valid for a bit
        logger.warn('Token refresh failed, but token still valid', { tenantId });
      }

      logger.debug('Session valid', {
        tenantId,
        expiresIn: Math.round(timeUntilExpiry / 1000) + 's'
      });

      return {
        valid: true,
        session
      };
    } catch (error) {
      logger.error('Session validation failed', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        valid: false,
        reason: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Refresh session token
   *
   * @param tenantId - Unique tenant identifier
   * @param currentSession - Current session data
   * @returns Updated session data or null if refresh failed
   */
  private async _refreshSessionToken(
    tenantId: string,
    currentSession: SessionData
  ): Promise<SessionData | null> {
    try {
      if (!currentSession.refreshToken) {
        logger.warn('No refresh token available', { tenantId });
        return null;
      }

      // Use OAuth manager to refresh token
      const credentials = await this._oauthManager.getValidToken(tenantId);

      // Update session with new credentials
      const updatedSession = await this.createSession(
        tenantId,
        credentials,
        currentSession.username
      );

      logger.info('Session token refreshed successfully', { tenantId });
      return updatedSession;
    } catch (error) {
      logger.error('Failed to refresh session token', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  /**
   * Delete session
   *
   * @param tenantId - Unique tenant identifier
   */
  async deleteSession(tenantId: string): Promise<void> {
    try {
      logger.info('Deleting session', { tenantId });

      // Get session to find username
      const session = await this.getSession(tenantId);

      // Delete session
      const sessionKey = this._getSessionKey(tenantId);
      await this._redis.del(sessionKey);

      // Delete username mapping if exists
      if (session?.username) {
        const userKey = this._getUserKey(session.username);
        await this._redis.del(userKey);
      }

      logger.info('Session deleted', { tenantId });
    } catch (error) {
      logger.error('Failed to delete session', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Extend session TTL (refresh session expiration)
   *
   * @param tenantId - Unique tenant identifier
   */
  async extendSession(tenantId: string): Promise<void> {
    try {
      const sessionKey = this._getSessionKey(tenantId);
      const exists = await this._redis.exists(sessionKey);

      if (exists) {
        await this._redis.expire(sessionKey, this._sessionTTL);
        logger.debug('Session TTL extended', { tenantId });
      }
    } catch (error) {
      logger.error('Failed to extend session', {
        tenantId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get all active sessions (for admin/debugging)
   *
   * @returns Array of tenant IDs with active sessions
   */
  async getActiveSessions(): Promise<string[]> {
    try {
      const pattern = `${this._sessionPrefix}*`;
      const keys = await this._redis.keys(pattern);

      const tenantIds = keys.map(key =>
        key.replace(this._sessionPrefix, '')
      );

      logger.debug('Retrieved active sessions', { count: tenantIds.length });
      return tenantIds;
    } catch (error) {
      logger.error('Failed to get active sessions', {
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  /**
   * Clear all sessions (for maintenance/testing)
   */
  async clearAllSessions(): Promise<void> {
    try {
      logger.warn('Clearing all sessions');

      const sessionKeys = await this._redis.keys(`${this._sessionPrefix}*`);
      const userKeys = await this._redis.keys(`${this._userPrefix}*`);
      const allKeys = [...sessionKeys, ...userKeys];

      if (allKeys.length > 0) {
        await this._redis.del(allKeys);
        logger.info('All sessions cleared', { count: allKeys.length });
      }
    } catch (error) {
      logger.error('Failed to clear sessions', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get session key for Redis
   *
   * @param tenantId - Unique tenant identifier
   * @returns Redis key
   */
  private _getSessionKey(tenantId: string): string {
    return `${this._sessionPrefix}${tenantId}`;
  }

  /**
   * Get user key for Redis
   *
   * @param username - Reddit username
   * @returns Redis key
   */
  private _getUserKey(username: string): string {
    return `${this._userPrefix}${username.toLowerCase()}`;
  }

  /**
   * Check if Redis is connected
   *
   * @returns True if connected
   */
  isConnected(): boolean {
    return this._connected;
  }

  /**
   * Get Redis client health
   *
   * @returns Health information
   */
  async getHealth(): Promise<{ connected: boolean; activeSessions: number }> {
    try {
      const activeSessions = await this.getActiveSessions();
      return {
        connected: this._connected,
        activeSessions: activeSessions.length
      };
    } catch (error) {
      return {
        connected: false,
        activeSessions: 0
      };
    }
  }
}

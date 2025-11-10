/**
 * Redis-based caching for tool selections and embeddings
 */

import { createClient, RedisClientType } from 'redis';
import { CacheError } from '../errors/gateway-errors';
import { logger, logCacheOperation } from '../logging/logger';
import { ToolSelection, QueryContext } from '../types/routing.types';
import { createHash } from 'crypto';

const DEFAULT_TTL = 3600; // 1 hour
const EMBEDDING_TTL = 86400; // 24 hours

export class RedisCache {
  private _client: RedisClientType | null = null;
  private readonly _redisUrl: string;

  constructor(redisUrl?: string) {
    this._redisUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    try {
      this._client = createClient({ url: this._redisUrl });

      this._client.on('error', (err) => {
        logger.error('Redis client error', { error: err.message });
      });

      this._client.on('connect', () => {
        logger.info('Redis client connected', { url: this._redisUrl });
      });

      await this._client.connect();
    } catch (error) {
      throw new CacheError(
        'Failed to connect to Redis',
        this._redisUrl,
        error as Error
      );
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.quit();
      this._client = null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    if (!this._client) {
      return false;
    }

    try {
      await this._client.ping();
      return true;
    } catch (error) {
      logger.error('Redis health check failed', { error });
      return false;
    }
  }

  /**
   * Get cached tool selection
   */
  async getToolSelection(
    query: string,
    context: QueryContext
  ): Promise<ToolSelection[] | null> {
    if (!this._client) {
      logger.warn('Redis client not connected, skipping cache');
      return null;
    }

    const key = this._generateToolSelectionKey(query, context);

    try {
      const cached = await this._client.get(key);

      if (cached) {
        logCacheOperation('get', key, true);
        return JSON.parse(cached) as ToolSelection[];
      }

      logCacheOperation('get', key, false);
      return null;
    } catch (error) {
      logger.error('Failed to get cached tool selection', {
        key,
        error: (error as Error).message
      });
      return null;
    }
  }

  /**
   * Set cached tool selection
   */
  async setToolSelection(
    query: string,
    context: QueryContext,
    tools: ToolSelection[],
    ttl: number = DEFAULT_TTL
  ): Promise<void> {
    if (!this._client) {
      return;
    }

    const key = this._generateToolSelectionKey(query, context);

    try {
      await this._client.setEx(key, ttl, JSON.stringify(tools));
      logCacheOperation('set', key, true);
    } catch (error) {
      logger.error('Failed to cache tool selection', {
        key,
        error: (error as Error).message
      });
    }
  }

  /**
   * Get cached embedding
   */
  async getEmbedding(text: string): Promise<number[] | null> {
    if (!this._client) {
      return null;
    }

    const key = this._generateEmbeddingKey(text);

    try {
      const cached = await this._client.get(key);

      if (cached) {
        logCacheOperation('get', key, true);
        return JSON.parse(cached) as number[];
      }

      logCacheOperation('get', key, false);
      return null;
    } catch (error) {
      logger.error('Failed to get cached embedding', {
        key,
        error: (error as Error).message
      });
      return null;
    }
  }

  /**
   * Set cached embedding
   */
  async setEmbedding(
    text: string,
    embedding: number[],
    ttl: number = EMBEDDING_TTL
  ): Promise<void> {
    if (!this._client) {
      return;
    }

    const key = this._generateEmbeddingKey(text);

    try {
      await this._client.setEx(key, ttl, JSON.stringify(embedding));
      logCacheOperation('set', key, true);
    } catch (error) {
      logger.error('Failed to cache embedding', {
        key,
        error: (error as Error).message
      });
    }
  }

  /**
   * Batch get embeddings
   */
  async getEmbeddings(texts: string[]): Promise<Map<string, number[]>> {
    if (!this._client || texts.length === 0) {
      return new Map();
    }

    const keys = texts.map(text => this._generateEmbeddingKey(text));
    const results = new Map<string, number[]>();

    try {
      const cached = await this._client.mGet(keys);

      texts.forEach((text, idx) => {
        if (cached[idx]) {
          results.set(text, JSON.parse(cached[idx]!) as number[]);
        }
      });

      logger.debug('Batch embedding cache check', {
        requested: texts.length,
        hits: results.size
      });

      return results;
    } catch (error) {
      logger.error('Failed to batch get embeddings', {
        error: (error as Error).message
      });
      return new Map();
    }
  }

  /**
   * Batch set embeddings
   */
  async setEmbeddings(
    embeddings: Map<string, number[]>,
    ttl: number = EMBEDDING_TTL
  ): Promise<void> {
    if (!this._client || embeddings.size === 0) {
      return;
    }

    try {
      const pipeline = this._client.multi();

      embeddings.forEach((embedding, text) => {
        const key = this._generateEmbeddingKey(text);
        pipeline.setEx(key, ttl, JSON.stringify(embedding));
      });

      await pipeline.exec();

      logger.debug('Batch embeddings cached', { count: embeddings.size });
    } catch (error) {
      logger.error('Failed to batch set embeddings', {
        error: (error as Error).message
      });
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    if (!this._client) {
      return;
    }

    try {
      await this._client.flushDb();
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Failed to clear cache', {
        error: (error as Error).message
      });
    }
  }

  /**
   * Generate cache key for tool selection
   */
  private _generateToolSelectionKey(query: string, context: QueryContext): string {
    const contextStr = JSON.stringify({
      categories: context.allowedCategories?.sort(),
      budget: context.tokenBudget,
      primaryCategory: context.primaryCategory
    });

    const hash = createHash('sha256')
      .update(query + contextStr)
      .digest('hex')
      .substring(0, 16);

    return `tool-selection:${hash}`;
  }

  /**
   * Generate cache key for embedding
   */
  private _generateEmbeddingKey(text: string): string {
    const hash = createHash('sha256')
      .update(text)
      .digest('hex')
      .substring(0, 16);

    return `embedding:${hash}`;
  }
}

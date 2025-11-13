/**
 * Reddit Unified MCP - Cache Manager
 *
 * Implements intelligent caching for Reddit API responses with:
 * - TTL-based expiration
 * - Memory-efficient storage
 * - Cache invalidation
 * - Cache statistics
 *
 * @module clients/cache-manager
 */

import { LRUCache } from 'lru-cache';
import { logger } from '../utils/logger';

export interface CacheConfig {
  maxSize?: number; // Maximum number of items
  ttl?: number; // Time-to-live in milliseconds
  enableStats?: boolean;
}

interface CacheEntry<T> {
  value: T;
  cached_at: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
}

export class CacheManager {
  private readonly _cache: LRUCache<string, CacheEntry<unknown>>;
  private readonly _defaultTTL: number;
  private readonly _enableStats: boolean;
  private _stats: CacheStats;

  constructor(config: CacheConfig = {}) {
    const maxSize = config.maxSize || 1000;
    this._defaultTTL = config.ttl || 300000; // 5 minutes default
    this._enableStats = config.enableStats !== false;

    this._cache = new LRUCache({
      max: maxSize,
      ttl: this._defaultTTL,
      updateAgeOnGet: true,
      updateAgeOnHas: false
    });

    this._stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0
    };

    logger.info('CacheManager initialized', {
      maxSize,
      defaultTTL: this._defaultTTL,
      enableStats: this._enableStats
    });
  }

  /**
   * Get value from cache
   *
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  get<T>(key: string): T | undefined {
    const entry = this._cache.get(key) as CacheEntry<T> | undefined;

    if (entry) {
      entry.hits++;
      if (this._enableStats) {
        this._stats.hits++;
        this._updateHitRate();
      }

      logger.debug('Cache hit', { key, hits: entry.hits });
      return entry.value;
    }

    if (this._enableStats) {
      this._stats.misses++;
      this._updateHitRate();
    }

    logger.debug('Cache miss', { key });
    return undefined;
  }

  /**
   * Set value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional custom TTL in milliseconds
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      cached_at: Date.now(),
      hits: 0
    };

    this._cache.set(key, entry as CacheEntry<unknown>, { ttl: ttl || this._defaultTTL });

    if (this._enableStats) {
      this._stats.sets++;
      this._stats.size = this._cache.size;
    }

    logger.debug('Cache set', {
      key,
      ttl: ttl || this._defaultTTL,
      size: this._cache.size
    });
  }

  /**
   * Check if key exists in cache
   *
   * @param key - Cache key
   * @returns True if key exists
   */
  has(key: string): boolean {
    return this._cache.has(key);
  }

  /**
   * Delete value from cache
   *
   * @param key - Cache key
   * @returns True if key was deleted
   */
  delete(key: string): boolean {
    const deleted = this._cache.delete(key);

    if (deleted && this._enableStats) {
      this._stats.deletes++;
      this._stats.size = this._cache.size;
    }

    logger.debug('Cache delete', { key, deleted });
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this._cache.size;
    this._cache.clear();

    if (this._enableStats) {
      this._stats.size = 0;
    }

    logger.info('Cache cleared', { entriesCleared: size });
  }

  /**
   * Invalidate cache entries matching pattern
   *
   * @param pattern - Regex pattern or prefix string
   */
  invalidate(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(`^${pattern}`) : pattern;
    let invalidated = 0;

    const keys = Array.from(this._cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this._cache.delete(key);
        invalidated++;
      }
    }

    if (this._enableStats) {
      this._stats.deletes += invalidated;
      this._stats.size = this._cache.size;
    }

    logger.info('Cache invalidated', { pattern: pattern.toString(), count: invalidated });
    return invalidated;
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics object
   */
  getStats(): CacheStats {
    return {
      ...this._stats,
      size: this._cache.size
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this._stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: this._cache.size,
      hitRate: 0
    };

    logger.info('Cache stats reset');
  }

  /**
   * Update hit rate calculation
   */
  private _updateHitRate(): void {
    const total = this._stats.hits + this._stats.misses;
    this._stats.hitRate = total > 0 ? this._stats.hits / total : 0;
  }

  /**
   * Get cache size
   *
   * @returns Number of entries in cache
   */
  size(): number {
    return this._cache.size;
  }

  /**
   * Get all cache keys (for debugging)
   *
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this._cache.keys());
  }
}

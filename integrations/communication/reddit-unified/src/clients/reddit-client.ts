/**
 * Reddit Unified MCP - Reddit API Client
 *
 * Comprehensive Reddit API client with:
 * - OAuth 2.0 authentication
 * - Automatic rate limiting
 * - Response caching
 * - Error handling
 * - Type-safe API methods
 *
 * @module clients/reddit-client
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { RateLimiter } from './rate-limiter';
import { CacheManager } from './cache-manager';
import { SessionManager } from '../auth/session-manager';
import { logger } from '../utils/logger';

export interface RedditClientConfig {
  userAgent: string;
  rateLimiter: RateLimiter;
  cacheManager: CacheManager;
  sessionManager: SessionManager;
}

export interface RedditAPIError {
  message: string;
  error: string;
  statusCode: number;
}

export interface RedditListing<T> {
  kind: 'Listing';
  data: {
    after: string | null;
    before: string | null;
    dist: number;
    children: Array<{ kind: string; data: T }>;
  };
}

export interface RedditPost {
  id: string;
  name: string;
  title: string;
  author: string;
  subreddit: string;
  selftext?: string;
  url?: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
  is_self: boolean;
  thumbnail?: string;
  [key: string]: unknown;
}

export interface RedditComment {
  id: string;
  name: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  permalink: string;
  parent_id: string;
  replies?: RedditListing<RedditComment>;
  [key: string]: unknown;
}

export interface RedditSubreddit {
  id: string;
  name: string;
  display_name: string;
  title: string;
  public_description: string;
  description: string;
  subscribers: number;
  active_user_count?: number;
  created_utc: number;
  [key: string]: unknown;
}

export interface RedditUser {
  id: string;
  name: string;
  link_karma: number;
  comment_karma: number;
  total_karma: number;
  created_utc: number;
  is_gold: boolean;
  is_mod: boolean;
  icon_img?: string;
  [key: string]: unknown;
}

export class RedditClient {
  private readonly _httpClient: AxiosInstance;
  private readonly _rateLimiter: RateLimiter;
  private readonly _cache: CacheManager;
  private readonly _sessionManager: SessionManager;
  private readonly _userAgent: string;
  private readonly _baseURL = 'https://oauth.reddit.com';

  constructor(config: RedditClientConfig) {
    this._userAgent = config.userAgent;
    this._rateLimiter = config.rateLimiter;
    this._cache = config.cacheManager;
    this._sessionManager = config.sessionManager;

    this._httpClient = axios.create({
      baseURL: this._baseURL,
      headers: {
        'User-Agent': this._userAgent
      },
      timeout: 30000
    });

    // Request interceptor for rate limiting and auth
    this._httpClient.interceptors.request.use(
      async (config) => {
        await this._rateLimiter.acquire();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this._httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this._handleError(error)
    );

    logger.info('RedditClient initialized', {
      baseURL: this._baseURL,
      userAgent: this._userAgent
    });
  }

  /**
   * Make authenticated API request
   *
   * @param tenantId - Tenant identifier for authentication
   * @param method - HTTP method
   * @param path - API endpoint path
   * @param params - Query parameters
   * @param data - Request body
   * @param cacheKey - Optional cache key
   * @param cacheTTL - Optional cache TTL
   * @returns API response data
   */
  private async _request<T>(
    tenantId: string | null,
    method: string,
    path: string,
    params?: Record<string, unknown>,
    data?: unknown,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<T> {
    // Check cache first
    if (cacheKey && method === 'GET') {
      const cached = this._cache.get<T>(cacheKey);
      if (cached) {
        logger.debug('Returning cached response', { cacheKey });
        return cached;
      }
    }

    // Get access token if tenant provided
    let accessToken: string | undefined;
    if (tenantId) {
      const validation = await this._sessionManager.validateSession(tenantId);
      if (!validation.valid || !validation.session) {
        throw new Error('Invalid or expired session');
      }
      accessToken = validation.session.accessToken;
    }

    // Make request
    const config: AxiosRequestConfig = {
      method,
      url: path,
      params,
      data,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    };

    try {
      const response = await this._httpClient.request<T>(config);

      // Cache successful GET responses
      if (cacheKey && method === 'GET') {
        this._cache.set(cacheKey, response.data, cacheTTL);
      }

      return response.data;
    } catch (error) {
      logger.error('API request failed', {
        method,
        path,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private _handleError(error: AxiosError): Promise<never> {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string; error?: string };

      // Handle rate limiting
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const seconds = retryAfter ? parseInt(retryAfter, 10) : undefined;
        this._rateLimiter.handle429(seconds);

        logger.warn('Rate limit exceeded', { retryAfter: seconds });
        return Promise.reject(new Error(`Rate limit exceeded. Retry after ${seconds || 60} seconds`));
      }

      // Handle authentication errors
      if (status === 401 || status === 403) {
        logger.error('Authentication error', { status, data });
        return Promise.reject(new Error('Authentication failed. Please reconnect your Reddit account'));
      }

      // Handle not found
      if (status === 404) {
        logger.warn('Resource not found', { url: error.config?.url });
        return Promise.reject(new Error('Resource not found'));
      }

      // Generic error
      const message = data?.message || data?.error || error.message;
      logger.error('API error', { status, message });
      return Promise.reject(new Error(`Reddit API error: ${message}`));
    }

    // Network error
    if (error.request) {
      logger.error('Network error', { message: error.message });
      return Promise.reject(new Error('Network error. Please check your connection'));
    }

    // Other error
    logger.error('Unexpected error', { error: error.message });
    return Promise.reject(error);
  }

  // ====== BROWSE ENDPOINTS ======

  /**
   * Get frontpage posts
   */
  async getFrontpage(
    tenantId: string | null,
    params: { limit?: number; after?: string; before?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `frontpage:${params.limit || 25}:${params.after || 'null'}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      '/',
      params,
      undefined,
      cacheKey,
      300000 // 5 min cache
    );
  }

  /**
   * Get subreddit posts (hot)
   */
  async getSubredditPosts(
    tenantId: string | null,
    subreddit: string,
    params: { limit?: number; after?: string; before?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `subreddit:${subreddit}:hot:${params.limit || 25}:${params.after || 'null'}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      `/r/${subreddit}/hot`,
      params,
      undefined,
      cacheKey,
      300000
    );
  }

  /**
   * Get subreddit new posts
   */
  async getSubredditNew(
    tenantId: string | null,
    subreddit: string,
    params: { limit?: number; after?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `subreddit:${subreddit}:new:${params.limit || 25}:${params.after || 'null'}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      `/r/${subreddit}/new`,
      params,
      undefined,
      cacheKey,
      180000 // 3 min cache (new posts change faster)
    );
  }

  /**
   * Get subreddit top posts
   */
  async getSubredditTop(
    tenantId: string | null,
    subreddit: string,
    params: { limit?: number; time?: string; after?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `subreddit:${subreddit}:top:${params.time || 'day'}:${params.limit || 25}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      `/r/${subreddit}/top`,
      params,
      undefined,
      cacheKey,
      600000 // 10 min cache
    );
  }

  /**
   * Get subreddit rising posts
   */
  async getSubredditRising(
    tenantId: string | null,
    subreddit: string,
    params: { limit?: number; after?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `subreddit:${subreddit}:rising:${params.limit || 25}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      `/r/${subreddit}/rising`,
      params,
      undefined,
      cacheKey,
      180000
    );
  }

  /**
   * Get subreddit controversial posts
   */
  async getSubredditControversial(
    tenantId: string | null,
    subreddit: string,
    params: { limit?: number; time?: string; after?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `subreddit:${subreddit}:controversial:${params.time || 'day'}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      `/r/${subreddit}/controversial`,
      params,
      undefined,
      cacheKey,
      600000
    );
  }

  /**
   * Get popular posts
   */
  async getPopular(
    tenantId: string | null,
    params: { limit?: number; after?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `popular:${params.limit || 25}:${params.after || 'null'}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      '/r/popular/hot',
      params,
      undefined,
      cacheKey,
      300000
    );
  }

  /**
   * Get trending subreddits
   */
  async getTrendingSubreddits(tenantId: string | null): Promise<string[]> {
    const cacheKey = 'trending_subreddits';
    return this._request<string[]>(
      tenantId,
      'GET',
      '/api/trending_subreddits',
      undefined,
      undefined,
      cacheKey,
      3600000 // 1 hour cache
    );
  }

  // ====== SEARCH ENDPOINTS ======

  /**
   * Search posts
   */
  async searchPosts(
    tenantId: string | null,
    query: string,
    params: {
      subreddit?: string;
      sort?: string;
      time?: string;
      limit?: number;
      after?: string;
    } = {}
  ): Promise<RedditListing<RedditPost>> {
    const path = params.subreddit ? `/r/${params.subreddit}/search` : '/search';
    const searchParams = {
      q: query,
      restrict_sr: params.subreddit ? 'true' : undefined,
      sort: params.sort,
      t: params.time,
      limit: params.limit,
      after: params.after,
      type: 'link'
    };

    const cacheKey = `search:posts:${query}:${params.subreddit || 'all'}:${params.sort || 'relevance'}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      path,
      searchParams,
      undefined,
      cacheKey,
      600000
    );
  }

  /**
   * Search subreddits
   */
  async searchSubreddits(
    tenantId: string | null,
    query: string,
    params: { limit?: number; after?: string } = {}
  ): Promise<RedditListing<RedditSubreddit>> {
    const cacheKey = `search:subreddits:${query}:${params.limit || 25}`;
    return this._request<RedditListing<RedditSubreddit>>(
      tenantId,
      'GET',
      '/subreddits/search',
      { q: query, ...params },
      undefined,
      cacheKey,
      600000
    );
  }

  // ====== POST ENDPOINTS ======

  /**
   * Get post by ID
   */
  async getPost(
    tenantId: string | null,
    subreddit: string,
    postId: string
  ): Promise<[RedditListing<RedditPost>, RedditListing<RedditComment>]> {
    const cacheKey = `post:${postId}`;
    return this._request<[RedditListing<RedditPost>, RedditListing<RedditComment>]>(
      tenantId,
      'GET',
      `/r/${subreddit}/comments/${postId}`,
      undefined,
      undefined,
      cacheKey,
      300000
    );
  }

  /**
   * Get post comments
   */
  async getPostComments(
    tenantId: string | null,
    subreddit: string,
    postId: string,
    params: { sort?: string; limit?: number; depth?: number } = {}
  ): Promise<[RedditListing<RedditPost>, RedditListing<RedditComment>]> {
    return this._request<[RedditListing<RedditPost>, RedditListing<RedditComment>]>(
      tenantId,
      'GET',
      `/r/${subreddit}/comments/${postId}`,
      params
    );
  }

  // ====== SUBREDDIT ENDPOINTS ======

  /**
   * Get subreddit info
   */
  async getSubredditInfo(
    tenantId: string | null,
    subreddit: string
  ): Promise<{ kind: string; data: RedditSubreddit }> {
    const cacheKey = `subreddit:${subreddit}:info`;
    return this._request<{ kind: string; data: RedditSubreddit }>(
      tenantId,
      'GET',
      `/r/${subreddit}/about`,
      undefined,
      undefined,
      cacheKey,
      3600000 // 1 hour cache
    );
  }

  // ====== USER ENDPOINTS ======

  /**
   * Get user info
   */
  async getUserInfo(
    tenantId: string | null,
    username: string
  ): Promise<{ kind: string; data: RedditUser }> {
    const cacheKey = `user:${username}:info`;
    return this._request<{ kind: string; data: RedditUser }>(
      tenantId,
      'GET',
      `/user/${username}/about`,
      undefined,
      undefined,
      cacheKey,
      600000
    );
  }

  /**
   * Get user posts
   */
  async getUserPosts(
    tenantId: string | null,
    username: string,
    params: { limit?: number; after?: string; sort?: string; time?: string } = {}
  ): Promise<RedditListing<RedditPost>> {
    const cacheKey = `user:${username}:posts:${params.sort || 'new'}`;
    return this._request<RedditListing<RedditPost>>(
      tenantId,
      'GET',
      `/user/${username}/submitted`,
      params,
      undefined,
      cacheKey,
      300000
    );
  }

  /**
   * Get user comments
   */
  async getUserComments(
    tenantId: string | null,
    username: string,
    params: { limit?: number; after?: string; sort?: string } = {}
  ): Promise<RedditListing<RedditComment>> {
    const cacheKey = `user:${username}:comments:${params.sort || 'new'}`;
    return this._request<RedditListing<RedditComment>>(
      tenantId,
      'GET',
      `/user/${username}/comments`,
      params,
      undefined,
      cacheKey,
      300000
    );
  }

  /**
   * Get current user (me)
   */
  async getCurrentUser(tenantId: string): Promise<RedditUser> {
    return this._request<RedditUser>(tenantId, 'GET', '/api/v1/me');
  }

  /**
   * Get user karma breakdown
   */
  async getUserKarma(tenantId: string): Promise<{ data: Array<{ sr: string; link_karma: number; comment_karma: number }> }> {
    return this._request(tenantId, 'GET', '/api/v1/me/karma');
  }

  /**
   * Get user trophies
   */
  async getUserTrophies(
    tenantId: string | null,
    username: string
  ): Promise<{ kind: string; data: { trophies: unknown[] } }> {
    return this._request(tenantId, 'GET', `/api/v1/user/${username}/trophies`);
  }

  // ====== AUTHENTICATED WRITE ENDPOINTS ======

  /**
   * Submit a post
   */
  async submitPost(
    tenantId: string,
    data: {
      sr: string;
      kind: 'self' | 'link' | 'image' | 'video';
      title: string;
      text?: string;
      url?: string;
      nsfw?: boolean;
      spoiler?: boolean;
    }
  ): Promise<{ json: { data: { id: string; name: string; url: string } } }> {
    // Invalidate subreddit cache
    this._cache.invalidate(`subreddit:${data.sr}:`);

    return this._request(tenantId, 'POST', '/api/submit', undefined, data);
  }

  /**
   * Submit a comment
   */
  async submitComment(
    tenantId: string,
    data: {
      thing_id: string;
      text: string;
    }
  ): Promise<{ json: { data: { things: Array<{ data: RedditComment }> } } }> {
    return this._request(tenantId, 'POST', '/api/comment', undefined, data);
  }

  /**
   * Vote on a post or comment
   */
  async vote(
    tenantId: string,
    data: {
      id: string;
      dir: 1 | 0 | -1; // 1 = upvote, 0 = unvote, -1 = downvote
    }
  ): Promise<void> {
    return this._request(tenantId, 'POST', '/api/vote', undefined, data);
  }

  /**
   * Save a post or comment
   */
  async save(tenantId: string, id: string): Promise<void> {
    return this._request(tenantId, 'POST', '/api/save', undefined, { id });
  }

  /**
   * Unsave a post or comment
   */
  async unsave(tenantId: string, id: string): Promise<void> {
    return this._request(tenantId, 'POST', '/api/unsave', undefined, { id });
  }

  /**
   * Get rate limiter status
   */
  getRateLimitStatus() {
    return this._rateLimiter.getStatus();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this._cache.getStats();
  }
}

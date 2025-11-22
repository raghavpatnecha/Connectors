/**
 * Unified Twitter API Client
 * Supports OAuth 1.0a, session cookies, and SocialData API
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { OAuthManager } from '../auth/oauth-manager';
import { VaultClient, SessionCookies } from '../auth/vault-client';
import { RateLimiter } from './rate-limiter';
import { logger, logAPICall } from '../utils/logger';

export interface TwitterClientConfig {
  oauthManager: OAuthManager;
  vaultClient: VaultClient;
  rateLimiter: RateLimiter;
  socialDataApiKey?: string;
}

export class TwitterClient {
  private readonly _axios: AxiosInstance;
  private readonly _socialDataAxios: AxiosInstance;
  private readonly _oauthManager: OAuthManager;
  private readonly _vaultClient: VaultClient;
  private readonly _rateLimiter: RateLimiter;
  private readonly _socialDataApiKey?: string;

  constructor(config: TwitterClientConfig) {
    this._oauthManager = config.oauthManager;
    this._vaultClient = config.vaultClient;
    this._rateLimiter = config.rateLimiter;
    this._socialDataApiKey = config.socialDataApiKey;

    // Twitter API v2 client
    this._axios = axios.create({
      baseURL: 'https://api.twitter.com/2',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // SocialData API client
    this._socialDataAxios = axios.create({
      baseURL: 'https://api.socialdata.tools',
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this._socialDataApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info('TwitterClient initialized');
  }

  /**
   * Make authenticated Twitter API request using OAuth 1.0a
   */
  async request<T = any>(
    method: string,
    endpoint: string,
    tenantId: string,
    data?: any,
    params?: any
  ): Promise<T> {
    await this._rateLimiter.acquire();

    const startTime = Date.now();
    const url = `https://api.twitter.com/2${endpoint}`;

    try {
      // Get OAuth authorization header
      const authHeader = await this._oauthManager.getAuthorizationHeader(
        tenantId,
        method,
        url,
        data
      );

      const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        headers: {
          Authorization: authHeader
        },
        data,
        params
      };

      const response = await this._axios.request<T>(config);
      const duration = Date.now() - startTime;

      logAPICall(method, endpoint, tenantId, response.status, duration);

      return response.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const status = error.response?.status || 0;

      logAPICall(method, endpoint, tenantId, status, duration);

      throw this._handleError(error);
    }
  }

  /**
   * Make request using session cookies (fallback auth method)
   */
  async requestWithCookies<T = any>(
    method: string,
    endpoint: string,
    tenantId: string,
    data?: any
  ): Promise<T> {
    await this._rateLimiter.acquire();

    const cookies = await this._vaultClient.getSessionCookies(tenantId);

    if (!cookies) {
      throw new Error('No session cookies found for tenant');
    }

    const startTime = Date.now();

    try {
      const response = await axios.request<T>({
        method,
        url: `https://twitter.com${endpoint}`,
        headers: {
          Cookie: this._formatCookies(cookies),
          'x-csrf-token': cookies.ct0,
          'Content-Type': 'application/json'
        },
        data
      });

      const duration = Date.now() - startTime;
      logAPICall(method, endpoint, tenantId, response.status, duration);

      return response.data;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logAPICall(method, endpoint, tenantId, error.response?.status || 0, duration);

      throw this._handleError(error);
    }
  }

  /**
   * Make request to SocialData API for enhanced analytics
   */
  async socialDataRequest<T = any>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    if (!this._socialDataApiKey) {
      throw new Error('SocialData API key not configured');
    }

    await this._rateLimiter.acquire();

    const startTime = Date.now();

    try {
      const response = await this._socialDataAxios.request<T>({
        method,
        url: endpoint,
        data
      });

      const duration = Date.now() - startTime;
      logger.debug('SocialData API call', {
        method,
        endpoint,
        status: response.status,
        durationMs: duration
      });

      return response.data;
    } catch (error: any) {
      logger.error('SocialData API error', {
        method,
        endpoint,
        status: error.response?.status,
        error: error.message
      });

      throw this._handleError(error);
    }
  }

  /**
   * Format cookies for Cookie header
   */
  private _formatCookies(cookies: SessionCookies): string {
    return `auth_token=${cookies.authToken}; ct0=${cookies.ct0}; twid=${cookies.twid}`;
  }

  /**
   * Handle API errors with proper error messages
   */
  private _handleError(error: any): Error {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.response?.data?.errors?.[0]?.message || error.message;

    // Twitter-specific error handling
    if (status === 401) {
      return new Error('Twitter authentication failed - token may be expired');
    }
    if (status === 403) {
      return new Error('Twitter request forbidden - insufficient permissions or rate limited');
    }
    if (status === 404) {
      return new Error('Twitter resource not found');
    }
    if (status === 429) {
      const resetTime = error.response?.headers['x-rate-limit-reset'];
      return new Error(
        `Twitter rate limit exceeded. Resets at ${resetTime ? new Date(resetTime * 1000).toISOString() : 'unknown'}`
      );
    }

    return new Error(`Twitter API error: ${message}`);
  }
}

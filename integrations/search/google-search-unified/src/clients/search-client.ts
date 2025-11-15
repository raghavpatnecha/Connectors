/**
 * Google Custom Search API Client
 * Provides methods to interact with Google Custom Search JSON API
 */

import { google, customsearch_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';

export interface SearchClientConfig {
  apiKey?: string;
  searchEngineId?: string;
}

/**
 * Custom Search API client wrapper
 */
export class SearchClient {
  private _config: SearchClientConfig;

  constructor(config: SearchClientConfig = {}) {
    this._config = {
      apiKey: config.apiKey || process.env.GOOGLE_PSE_API_KEY,
      searchEngineId: config.searchEngineId || process.env.GOOGLE_PSE_ENGINE_ID,
    };

    logger.info('Search client initialized', {
      hasApiKey: !!this._config.apiKey,
      hasSearchEngineId: !!this._config.searchEngineId,
    });
  }

  /**
   * Get Custom Search API client with OAuth
   */
  getClient(auth: OAuth2Client): customsearch_v1.Customsearch {
    return google.customsearch({ version: 'v1', auth });
  }

  /**
   * Get API key from config
   */
  getApiKey(): string {
    if (!this._config.apiKey) {
      throw new Error('GOOGLE_PSE_API_KEY environment variable not set');
    }
    return this._config.apiKey;
  }

  /**
   * Get search engine ID from config
   */
  getSearchEngineId(): string {
    if (!this._config.searchEngineId) {
      throw new Error('GOOGLE_PSE_ENGINE_ID environment variable not set');
    }
    return this._config.searchEngineId;
  }

  /**
   * Set custom API key
   */
  setApiKey(apiKey: string): void {
    this._config.apiKey = apiKey;
  }

  /**
   * Set custom search engine ID
   */
  setSearchEngineId(searchEngineId: string): void {
    this._config.searchEngineId = searchEngineId;
  }
}

/**
 * Factory class for creating Custom Search API clients
 */
export class SearchClientFactory {
  private _searchClient: SearchClient;

  constructor(searchClient: SearchClient) {
    this._searchClient = searchClient;
  }

  /**
   * Get Custom Search client with authentication
   */
  getCustomSearchClient(auth: OAuth2Client): customsearch_v1.Customsearch {
    logger.debug('Created Custom Search client');
    return this._searchClient.getClient(auth);
  }

  /**
   * Get API key
   */
  getApiKey(): string {
    return this._searchClient.getApiKey();
  }

  /**
   * Get search engine ID
   */
  getSearchEngineId(): string {
    return this._searchClient.getSearchEngineId();
  }
}

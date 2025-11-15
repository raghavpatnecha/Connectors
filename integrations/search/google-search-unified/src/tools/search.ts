/**
 * Google Custom Search MCP - Search Tools
 * Tools for executing web searches using Google Custom Search API
 */

import { z } from 'zod';
import { customsearch_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { SearchClientFactory } from '../clients/search-client';
import { mapSearchError } from '../utils/error-handler';
import { logger } from '../utils/logger';

/**
 * OAuth manager interface (for getting authenticated clients)
 */
interface OAuthManager {
  getAuthenticatedClient(tenantId: string): Promise<any>;
}

/**
 * Register all search execution tools
 */
export function registerSearchTools(
  registry: ToolRegistry,
  searchClientFactory: SearchClientFactory,
  oauthManager: OAuthManager
): void {
  // Execute search query
  registry.registerTool(
    'search_execute_search',
    'Execute a search query using Google Custom Search with advanced filtering options',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      q: z.string().describe('The search query string'),
      num: z.number().int().min(1).max(10).optional().describe('Number of results to return (1-10, default: 10)'),
      start: z.number().int().min(1).optional().describe('The index of the first result to return (1-based, default: 1)'),
      safe: z.enum(['active', 'moderate', 'off']).optional().describe('Safe search level (default: off)'),
      siteSearch: z.string().optional().describe('Restrict search to a specific site/domain'),
      siteSearchFilter: z.enum(['e', 'i']).optional().describe('Exclude (e) or include (i) siteSearch results'),
      dateRestrict: z.string().optional().describe('Restrict by date (e.g., "d5" for past 5 days, "m3" for past 3 months)'),
      fileType: z.string().optional().describe('Filter by file type (e.g., "pdf", "doc")'),
      language: z.string().optional().describe('Language code for results (e.g., "lang_en")'),
      country: z.string().optional().describe('Country code for results (e.g., "countryUS")'),
    }),
    async (args) => {
      try {
        const auth = await oauthManager.getAuthenticatedClient(args.tenantId);
        const client = searchClientFactory.getCustomSearchClient(auth);
        const apiKey = searchClientFactory.getApiKey();
        const cx = searchClientFactory.getSearchEngineId();

        const params: customsearch_v1.Params$Resource$Cse$List = {
          key: apiKey,
          cx: cx,
          q: args.q,
          num: args.num || 10,
          start: args.start || 1,
          safe: args.safe || 'off',
        };

        // Add optional parameters
        if (args.siteSearch) params.siteSearch = args.siteSearch;
        if (args.siteSearchFilter) params.siteSearchFilter = args.siteSearchFilter;
        if (args.dateRestrict) params.dateRestrict = args.dateRestrict;
        if (args.fileType) params.fileType = args.fileType;
        if (args.language) params.lr = args.language;
        if (args.country) params.cr = args.country;

        const response = await client.cse.list(params);

        const searchInfo = response.data.searchInformation || {};
        const items = response.data.items || [];
        const queries = response.data.queries || {};

        const result = {
          query: args.q,
          searchEngineId: cx,
          totalResults: searchInfo.totalResults || '0',
          searchTime: searchInfo.searchTime || 0,
          resultsReturned: items.length,
          results: items.map((item) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            displayLink: item.displayLink,
            formattedUrl: item.formattedUrl,
            htmlTitle: item.htmlTitle,
            htmlSnippet: item.htmlSnippet,
            pagemap: item.pagemap,
          })),
          nextPageStart: queries.nextPage?.[0]?.startIndex,
        };

        logger.info('Search executed successfully', {
          tenantId: args.tenantId,
          query: args.q,
          resultsCount: items.length,
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to execute search', {
          tenantId: args.tenantId,
          query: args.q,
          error: error.message,
        });
        throw mapSearchError(error);
      }
    }
  );

  // Search for images
  registry.registerTool(
    'search_search_images',
    'Execute an image-specific search using Google Custom Search',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      q: z.string().describe('The image search query string'),
      num: z.number().int().min(1).max(10).optional().describe('Number of results to return (1-10, default: 10)'),
      start: z.number().int().min(1).optional().describe('The index of the first result to return (1-based, default: 1)'),
      safe: z.enum(['active', 'moderate', 'off']).optional().describe('Safe search level (default: off)'),
      imgSize: z.enum(['huge', 'icon', 'large', 'medium', 'small', 'xlarge', 'xxlarge']).optional().describe('Image size filter'),
      imgType: z.enum(['clipart', 'face', 'lineart', 'stock', 'photo', 'animated']).optional().describe('Image type filter'),
      imgColorType: z.enum(['color', 'gray', 'mono', 'trans']).optional().describe('Image color type filter'),
      imgDominantColor: z.enum(['black', 'blue', 'brown', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'white', 'yellow']).optional().describe('Dominant color filter'),
    }),
    async (args) => {
      try {
        const auth = await oauthManager.getAuthenticatedClient(args.tenantId);
        const client = searchClientFactory.getCustomSearchClient(auth);
        const apiKey = searchClientFactory.getApiKey();
        const cx = searchClientFactory.getSearchEngineId();

        const params: customsearch_v1.Params$Resource$Cse$List = {
          key: apiKey,
          cx: cx,
          q: args.q,
          num: args.num || 10,
          start: args.start || 1,
          safe: args.safe || 'off',
          searchType: 'image',
        };

        // Add image-specific parameters
        if (args.imgSize) params.imgSize = args.imgSize;
        if (args.imgType) params.imgType = args.imgType;
        if (args.imgColorType) params.imgColorType = args.imgColorType;
        if (args.imgDominantColor) params.imgDominantColor = args.imgDominantColor;

        const response = await client.cse.list(params);

        const searchInfo = response.data.searchInformation || {};
        const items = response.data.items || [];

        const result = {
          query: args.q,
          searchType: 'image',
          totalResults: searchInfo.totalResults || '0',
          searchTime: searchInfo.searchTime || 0,
          resultsReturned: items.length,
          images: items.map((item) => ({
            title: item.title,
            link: item.link,
            displayLink: item.displayLink,
            snippet: item.snippet,
            image: item.image,
            mime: item.mime,
          })),
        };

        logger.info('Image search executed successfully', {
          tenantId: args.tenantId,
          query: args.q,
          resultsCount: items.length,
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to execute image search', {
          tenantId: args.tenantId,
          query: args.q,
          error: error.message,
        });
        throw mapSearchError(error);
      }
    }
  );

  // Search for news
  registry.registerTool(
    'search_search_news',
    'Execute a news-specific search using Google Custom Search with date filtering',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      q: z.string().describe('The news search query string'),
      num: z.number().int().min(1).max(10).optional().describe('Number of results to return (1-10, default: 10)'),
      start: z.number().int().min(1).optional().describe('The index of the first result to return (1-based, default: 1)'),
      safe: z.enum(['active', 'moderate', 'off']).optional().describe('Safe search level (default: off)'),
      dateRestrict: z.string().optional().describe('Restrict by date (e.g., "d1" for past day, "w1" for past week, "m1" for past month)'),
      sortBy: z.enum(['date']).optional().describe('Sort results by date'),
    }),
    async (args) => {
      try {
        const auth = await oauthManager.getAuthenticatedClient(args.tenantId);
        const client = searchClientFactory.getCustomSearchClient(auth);
        const apiKey = searchClientFactory.getApiKey();
        const cx = searchClientFactory.getSearchEngineId();

        const params: customsearch_v1.Params$Resource$Cse$List = {
          key: apiKey,
          cx: cx,
          q: args.q,
          num: args.num || 10,
          start: args.start || 1,
          safe: args.safe || 'off',
        };

        // Add news-specific parameters
        if (args.dateRestrict) {
          params.dateRestrict = args.dateRestrict;
        } else {
          params.dateRestrict = 'm1'; // Default to past month for news
        }

        if (args.sortBy === 'date') {
          params.sort = 'date';
        }

        const response = await client.cse.list(params);

        const searchInfo = response.data.searchInformation || {};
        const items = response.data.items || [];

        const result = {
          query: args.q,
          searchType: 'news',
          dateRestrict: params.dateRestrict,
          totalResults: searchInfo.totalResults || '0',
          searchTime: searchInfo.searchTime || 0,
          resultsReturned: items.length,
          news: items.map((item) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            displayLink: item.displayLink,
            formattedUrl: item.formattedUrl,
            publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'],
            author: item.pagemap?.metatags?.[0]?.['article:author'],
            section: item.pagemap?.metatags?.[0]?.['article:section'],
          })),
        };

        logger.info('News search executed successfully', {
          tenantId: args.tenantId,
          query: args.q,
          resultsCount: items.length,
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to execute news search', {
          tenantId: args.tenantId,
          query: args.q,
          error: error.message,
        });
        throw mapSearchError(error);
      }
    }
  );
}

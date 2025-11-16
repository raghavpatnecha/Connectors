/**
 * Product Hunt GraphQL API Client
 *
 * Handles GraphQL queries to the Product Hunt API with rate limiting and error handling
 */

import axios, { AxiosError } from 'axios';
import { TokenManager } from '../auth/token-manager.js';
import { logger } from '../utils/logger.js';
import { RateLimiter, RateLimitInfo } from '../utils/rate-limiter.js';
import {
  ProductHuntError,
  TokenError,
  RateLimitError,
  GraphQLError,
  mapHttpError,
} from '../utils/error-handler.js';

const API_BASE_URL = 'https://api.producthunt.com/v2';
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/api/graphql`;

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
    extensions?: any;
  }>;
}

export interface QueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  rateLimits: RateLimitInfo;
}

export class ProductHuntClient {
  private tokenManager: TokenManager;

  constructor(tokenManager: TokenManager) {
    this.tokenManager = tokenManager;
    logger.info('Product Hunt GraphQL client initialized');
  }

  /**
   * Execute a GraphQL query
   */
  async query<T = any>(
    query: string,
    variables: Record<string, any> = {},
    tenantId: string,
    operationName?: string
  ): Promise<QueryResult<T>> {
    try {
      // Check rate limits before making the request
      if (RateLimiter.isRateLimited()) {
        const waitTime = RateLimiter.getResetWaitTime();
        logger.warn('Rate limit exceeded', { waitTime });

        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Reset in ${waitTime} seconds.`,
            details: { retryAfter: waitTime },
          },
          rateLimits: RateLimiter.getRateLimitInfo(),
        };
      }

      // Get API token for tenant
      const apiToken = await this.tokenManager.getToken(tenantId);

      // Prepare request
      const payload: any = { query };
      if (Object.keys(variables).length > 0) {
        payload.variables = variables;
      }
      if (operationName) {
        payload.operationName = operationName;
      }

      logger.debug('Executing GraphQL query', {
        tenantId,
        operationName,
        variablesCount: Object.keys(variables).length,
      });

      // Execute request
      const response = await axios.post<GraphQLResponse<T>>(
        GRAPHQL_ENDPOINT,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
            'User-Agent': 'ProductHunt-MCP-Unified/1.0.0',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      // Update rate limits from response headers
      RateLimiter.updateFromHeaders(response.headers as Record<string, string>);

      const rateLimits = RateLimiter.getRateLimitInfo();

      // Check for GraphQL errors
      if (response.data.errors && response.data.errors.length > 0) {
        const error = response.data.errors[0];
        logger.error('GraphQL error', {
          message: error.message,
          path: error.path,
        });

        // Map common GraphQL errors to friendly messages
        const friendlyError = this.mapGraphQLError(error);

        return {
          success: false,
          error: friendlyError,
          rateLimits,
        };
      }

      // Success
      logger.debug('GraphQL query successful', { tenantId });

      return {
        success: true,
        data: response.data.data,
        rateLimits,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Map GraphQL errors to user-friendly messages
   */
  private mapGraphQLError(error: {
    message: string;
    path?: string[];
  }): { code: string; message: string; details?: any } {
    const message = error.message;

    // Invalid date format
    if (message.includes('DateTime') && message.includes('invalid value')) {
      return {
        code: 'INVALID_DATE_FORMAT',
        message:
          'Invalid date format. Dates must be in ISO 8601 format (e.g., 2023-01-01T00:00:00Z).',
        details: error,
      };
    }

    // Invalid parameter type
    if (message.includes('was provided invalid value')) {
      return {
        code: 'INVALID_PARAMETER',
        message: 'One of the parameters has an invalid value. Please check your input.',
        details: error,
      };
    }

    // Not found
    if (
      message.toLowerCase().includes('not found') ||
      message.toLowerCase().includes("doesn't exist")
    ) {
      return {
        code: 'NOT_FOUND',
        message: error.path
          ? `Resource not found: ${error.path.join('.')}`
          : 'The requested resource could not be found.',
        details: error,
      };
    }

    // Generic GraphQL error
    return {
      code: 'GRAPHQL_ERROR',
      message,
      details: error,
    };
  }

  /**
   * Handle axios/network errors
   */
  private handleError(error: unknown): QueryResult {
    const rateLimits = RateLimiter.getRateLimitInfo();

    // Axios error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Rate limit (429)
      if (axiosError.response?.status === 429) {
        const resetHeader = axiosError.response.headers['x-rate-limit-reset'];
        const waitTime = resetHeader ? parseInt(resetHeader, 10) : 900;

        logger.warn('Rate limited by API', { waitTime });

        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Reset in ${waitTime} seconds.`,
            details: { retryAfter: waitTime },
          },
          rateLimits,
        };
      }

      // Other HTTP errors
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const mappedError = mapHttpError(
          statusCode,
          axiosError.response.data as string
        );

        logger.error('HTTP error', {
          statusCode,
          error: mappedError.message,
        });

        return {
          success: false,
          error: {
            code: mappedError.code,
            message: mappedError.message,
            details: {
              statusCode: mappedError.statusCode,
            },
          },
          rateLimits,
        };
      }

      // Network error
      if (axiosError.code === 'ECONNABORTED') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'Request to Product Hunt API timed out. Please try again.',
          },
          rateLimits,
        };
      }

      // Connection error
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Could not connect to the Product Hunt API. Please check your internet connection.',
          details: axiosError.message,
        },
        rateLimits,
      };
    }

    // Token error
    if (error instanceof TokenError) {
      logger.error('Token error', { error: error.message });
      return {
        success: false,
        error: {
          code: 'TOKEN_ERROR',
          message: error.message,
        },
        rateLimits,
      };
    }

    // Generic error
    logger.error('Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      rateLimits,
    };
  }
}

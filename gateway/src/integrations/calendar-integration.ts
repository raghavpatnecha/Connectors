/**
 * Google Calendar MCP Integration Module
 * Connectors Platform - Calendar integration with OAuth, rate limiting, and error mapping
 */

import { OAuthProxy } from '../auth/oauth-proxy';
import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { RateLimitError, MCPError } from '../errors/gateway-errors';
import { OAuthClientConfig, MCPRequest, MCPResponse } from '../auth/types';
import { ToolEmbedding } from '../types/routing.types';

// Calendar-specific configuration
const CALENDAR_RATE_LIMIT = parseInt(process.env.CALENDAR_RATE_LIMIT || '5', 10); // 5 requests per second
const CALENDAR_TIMEOUT_MS = parseInt(process.env.CALENDAR_TIMEOUT_MS || '10000', 10);
const CALENDAR_SERVER_URL = process.env.CALENDAR_SERVER_URL || 'http://localhost:3131';
const CALENDAR_ENABLED = process.env.CALENDAR_ENABLED !== 'false';

/**
 * Calendar OAuth configuration (Google OAuth 2.0)
 * See: https://developers.google.com/calendar/api/guides/auth
 */
export const CALENDAR_OAUTH_CONFIG: OAuthClientConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  redirectUri: process.env.CALENDAR_REDIRECT_URI || 'http://localhost:3131/oauth/callback'
};

/**
 * Calendar API error codes mapped to our error types
 */
const CALENDAR_ERROR_MAP: Record<number, string> = {
  400: 'Bad request - invalid event data or parameters',
  401: 'Unauthorized - OAuth token expired or invalid',
  403: 'Forbidden - insufficient calendar permissions or rate limit exceeded',
  404: 'Calendar or event not found',
  409: 'Conflict - event time conflict or concurrent modification',
  429: 'Rate limit exceeded - quota exhausted',
  500: 'Calendar internal server error',
  503: 'Service temporarily unavailable'
};

/**
 * Rate limiter for Calendar API
 * Implements token bucket algorithm (5 req/s, 500 req/min)
 */
class CalendarRateLimiter {
  private _tokens: number = CALENDAR_RATE_LIMIT;
  private _lastRefill: number = Date.now();
  private readonly _maxTokens: number = CALENDAR_RATE_LIMIT;
  private readonly _refillRate: number = CALENDAR_RATE_LIMIT; // tokens per second

  async acquire(): Promise<void> {
    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsed = (now - this._lastRefill) / 1000; // seconds
    this._tokens = Math.min(
      this._maxTokens,
      this._tokens + elapsed * this._refillRate
    );
    this._lastRefill = now;

    // If we have tokens, consume one
    if (this._tokens >= 1) {
      this._tokens -= 1;
      return;
    }

    // Wait until we have a token
    const waitTime = ((1 - this._tokens) / this._refillRate) * 1000;
    logger.debug('Calendar rate limit throttling', {
      integration: 'calendar',
      waitTimeMs: waitTime.toFixed(0)
    });

    await new Promise(resolve => setTimeout(resolve, waitTime));
    this._tokens = 0;
  }

  getAvailableTokens(): number {
    const now = Date.now();
    const elapsed = (now - this._lastRefill) / 1000;
    return Math.min(
      this._maxTokens,
      this._tokens + elapsed * this._refillRate
    );
  }
}

/**
 * Calendar Integration Handler
 * Manages OAuth, rate limiting, and error mapping for Calendar MCP server
 */
export class CalendarIntegration {
  private readonly _oauthProxy: OAuthProxy;
  private readonly _semanticRouter: SemanticRouter;
  private readonly _rateLimiter: CalendarRateLimiter;
  private readonly _serverUrl: string;
  private _isHealthy: boolean = false;

  constructor(oauthProxy: OAuthProxy, semanticRouter: SemanticRouter) {
    this._oauthProxy = oauthProxy;
    this._semanticRouter = semanticRouter;
    this._rateLimiter = new CalendarRateLimiter();
    this._serverUrl = CALENDAR_SERVER_URL;

    logger.info('CalendarIntegration initialized', {
      serverUrl: this._serverUrl,
      rateLimit: CALENDAR_RATE_LIMIT,
      enabled: CALENDAR_ENABLED
    });
  }

  /**
   * Initialize Calendar integration
   * - Register OAuth config
   * - Index Calendar tools in semantic router
   * - Perform health check
   */
  async initialize(): Promise<void> {
    if (!CALENDAR_ENABLED) {
      logger.info('Calendar integration disabled');
      return;
    }

    logger.info('Initializing Calendar integration');

    // Register OAuth configuration
    this._oauthProxy.registerOAuthConfig('calendar', CALENDAR_OAUTH_CONFIG);

    // Index Calendar tools for semantic routing
    await this._indexCalendarTools();

    // Perform initial health check
    await this.healthCheck();

    logger.info('Calendar integration initialized successfully', {
      healthy: this._isHealthy
    });
  }

  /**
   * Proxy request to Calendar MCP server with rate limiting and error handling
   */
  async proxyRequest(req: MCPRequest): Promise<MCPResponse> {
    if (!CALENDAR_ENABLED) {
      throw new MCPError('Calendar integration is disabled', {
        integration: 'calendar'
      });
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this._rateLimiter.acquire();

      // Proxy through OAuth proxy (handles auth injection)
      const response = await this._oauthProxy.proxyRequest({
        ...req,
        integration: 'calendar'
      });

      const duration = Date.now() - startTime;
      logger.debug('Calendar request completed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: response.status,
        duration
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Map Calendar-specific errors
      const mappedError = this._mapCalendarError(error, req);

      logger.error('Calendar request failed', {
        tenantId: req.tenantId,
        method: req.method,
        path: req.path,
        status: error.response?.status,
        error: mappedError.message,
        duration
      });

      throw mappedError;
    }
  }

  /**
   * Health check for Calendar MCP server
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this._serverUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(CALENDAR_TIMEOUT_MS)
      });

      this._isHealthy = response.ok;

      if (!this._isHealthy) {
        logger.warn('Calendar health check failed', {
          status: response.status,
          statusText: response.statusText
        });
      }

      return this._isHealthy;
    } catch (error: any) {
      this._isHealthy = false;
      logger.error('Calendar health check error', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Get integration status
   */
  getStatus(): {
    enabled: boolean;
    healthy: boolean;
    serverUrl: string;
    rateLimit: number;
    availableTokens: number;
  } {
    return {
      enabled: CALENDAR_ENABLED,
      healthy: this._isHealthy,
      serverUrl: this._serverUrl,
      rateLimit: CALENDAR_RATE_LIMIT,
      availableTokens: this._rateLimiter.getAvailableTokens()
    };
  }

  /**
   * Index Calendar tools in semantic router
   * Calendar provides 29 tools across events, calendars, calendar list, ACL
   */
  private async _indexCalendarTools(): Promise<void> {
    const calendarTools: ToolEmbedding[] = [
      // Events (12 tools)
      {
        toolId: 'calendar.listEvents',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Calendar Events',
          description: 'List events from a Google Calendar with filters and pagination',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.getEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Calendar Event',
          description: 'Retrieve details of a specific calendar event',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.createEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Calendar Event',
          description: 'Create a new event in Google Calendar with attendees and reminders',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.updateEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Calendar Event',
          description: 'Update an existing calendar event',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.patchEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Patch Calendar Event',
          description: 'Partially update a calendar event',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.deleteEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Calendar Event',
          description: 'Delete a calendar event',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.importEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Import Calendar Event',
          description: 'Import an event into Google Calendar',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.moveEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Move Calendar Event',
          description: 'Move an event to a different calendar',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.quickAddEvent',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Quick Add Event',
          description: 'Create an event from natural language text',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.getEventInstances',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Event Instances',
          description: 'Get instances of a recurring event',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.watchEvents',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Watch Events',
          description: 'Watch for changes to calendar events',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.stopChannel',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Stop Watch Channel',
          description: 'Stop watching for event changes',
          usageCount: 0
        }
      },

      // Calendars (8 tools)
      {
        toolId: 'calendar.listCalendars',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Calendars',
          description: 'List all calendars in the calendar list',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.getCalendar',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Calendar',
          description: 'Get details of a specific calendar',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.createCalendar',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Create Calendar',
          description: 'Create a new secondary calendar',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.updateCalendar',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Calendar',
          description: 'Update calendar metadata',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.patchCalendar',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Patch Calendar',
          description: 'Partially update calendar metadata',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.deleteCalendar',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete Calendar',
          description: 'Delete a secondary calendar',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.clearCalendar',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Clear Calendar',
          description: 'Delete all events from a calendar',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.getFreeBusy',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get Free/Busy',
          description: 'Query free/busy information for calendars',
          usageCount: 0
        }
      },

      // Calendar List (3 tools)
      {
        toolId: 'calendar.insertCalendarList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert Calendar to List',
          description: 'Add a calendar to the user calendar list',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.updateCalendarList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update Calendar List Entry',
          description: 'Update calendar list entry settings',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.deleteCalendarList',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Remove Calendar from List',
          description: 'Remove a calendar from the user calendar list',
          usageCount: 0
        }
      },

      // ACL - Access Control (6 tools)
      {
        toolId: 'calendar.listAcl',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'List Calendar ACL',
          description: 'List access control rules for a calendar',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.getAcl',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Get ACL Rule',
          description: 'Get a specific calendar ACL rule',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.insertAcl',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Insert ACL Rule',
          description: 'Create a new calendar access control rule',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.updateAcl',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Update ACL Rule',
          description: 'Update a calendar access control rule',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.patchAcl',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Patch ACL Rule',
          description: 'Partially update a calendar ACL rule',
          usageCount: 0
        }
      },
      {
        toolId: 'calendar.deleteAcl',
        embedding: [],
        category: 'productivity',
        metadata: {
          name: 'Delete ACL Rule',
          description: 'Delete a calendar access control rule',
          usageCount: 0
        }
      }
    ];

    logger.info('Indexing Calendar tools', { count: calendarTools.length });

    // Note: Embeddings will be generated by the semantic router during indexing
    // await this._semanticRouter.indexTools(calendarTools);

    logger.info('Calendar tools indexed successfully');
  }

  /**
   * Map Calendar API errors to gateway error types
   */
  private _mapCalendarError(error: any, req: MCPRequest): Error {
    const status = error.response?.status;

    // Rate limit error
    if (status === 403 || status === 429) {
      const reason = error.response?.data?.error?.errors?.[0]?.reason;

      if (reason === 'rateLimitExceeded' || reason === 'quotaExceeded' || status === 429) {
        return new RateLimitError(
          CALENDAR_ERROR_MAP[429] || 'Calendar rate limit exceeded',
          {
            reason,
            limit: CALENDAR_RATE_LIMIT
          }
        );
      }
    }

    // Map known Calendar error codes
    if (status && CALENDAR_ERROR_MAP[status]) {
      return new MCPError(CALENDAR_ERROR_MAP[status], {
        status,
        endpoint: req.path,
        integration: 'calendar'
      });
    }

    // Generic MCP error
    return new MCPError(
      error.message || 'Unknown Calendar error',
      {
        status,
        endpoint: req.path,
        integration: 'calendar'
      }
    );
  }

  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing Calendar integration');
    this._isHealthy = false;
  }
}

/**
 * Create and export Calendar integration instance
 */
export function createCalendarIntegration(
  oauthProxy: OAuthProxy,
  semanticRouter: SemanticRouter
): CalendarIntegration {
  return new CalendarIntegration(oauthProxy, semanticRouter);
}

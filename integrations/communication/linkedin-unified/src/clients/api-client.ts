/**
 * LinkedIn REST API Client - HONEST VERSION
 *
 * ⚠️ IMPORTANT: LinkedIn's public API is EXTREMELY LIMITED
 *
 * Without LinkedIn Partnership approval, only 3 endpoints are available:
 * 1. GET /v2/me - Get authenticated user's LITE profile (firstName, lastName, profilePicture, id)
 * 2. GET /v2/emailAddress - Get authenticated user's email
 * 3. POST /v2/ugcPosts - Share content to LinkedIn
 *
 * ALL OTHER FUNCTIONALITY requires browser automation (web scraping), which is what
 * the BrowserClient handles.
 *
 * What DOES NOT EXIST in LinkedIn's public API:
 * ❌ Search People API
 * ❌ Search Jobs API
 * ❌ View Other Profiles API (can only view your own lite profile)
 * ❌ Messaging API (requires LinkedIn Partnership)
 * ❌ Browse Feed API
 * ❌ Company Search API
 * ❌ Get Connections API
 * ❌ Get Conversations API
 * ❌ Job Recommendations API
 *
 * Reference: https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api
 * Partnership Program: https://docs.microsoft.com/en-us/linkedin/shared/references/partner-program
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';
import { OAuthManager } from '../auth/oauth-manager';
import { LinkedInAPIError, LinkedInAuthError } from '../utils/error-handler';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Rate limit information from LinkedIn API headers
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * LinkedIn API Error Response
 */
interface LinkedInErrorResponse {
  status: number;
  message: string;
  serviceErrorCode?: number;
}

/**
 * Rate Limit Error with retry information
 */
export class RateLimitError extends LinkedInAPIError {
  constructor(
    message: string,
    public resetAt: number,
    public remaining: number = 0
  ) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * LinkedIn Lite Profile (Only available via /v2/me)
 * This is ALL that LinkedIn's public API returns without partnership.
 *
 * Does NOT include: headline, summary, experience, education, skills, industry
 */
export interface LiteProfile {
  id: string;
  firstName: {
    localized: {
      en_US: string;
    };
  };
  lastName: {
    localized: {
      en_US: string;
    };
  };
  profilePicture?: {
    displayImage: string;
  };
}

/**
 * Profile for external use
 *
 * Note: API only returns id, firstName, lastName, profilePicture
 * Browser automation can return additional fields (headline, summary, etc.)
 */
export interface Profile {
  id: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: {
    displayImage: string;
  };
  // Additional fields from browser automation
  headline?: string;
  summary?: string;
  industry?: string;
  location?: {
    country?: string;
    city?: string;
  };
  positions?: any[];
  educations?: any[];
  skills?: any[];
}

/**
 * LinkedIn Email Address Response
 */
export interface EmailAddress {
  handle: string;
  'handle~': {
    emailAddress: string;
  };
}

/**
 * Parameters for sharing a post on LinkedIn
 */
export interface SharePostParams {
  author: string; // URN format: urn:li:person:{personId}
  lifecycleState: 'PUBLISHED' | 'DRAFT';
  visibility: 'PUBLIC' | 'CONNECTIONS';
  text: string;
  media?: {
    status: 'READY';
    description: {
      text: string;
    };
    media: string; // Media URN
    title: {
      text: string;
    };
  };
}

/**
 * Share Post Response
 */
export interface SharePostResponse {
  id: string;
  activity: string; // Activity URN
}

// ============================================================================
// Request Options
// ============================================================================

/**
 * Options for making API requests
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// ============================================================================
// API Client Implementation
// ============================================================================

/**
 * LinkedIn REST API Client (Honest Version)
 *
 * ⚠️ This client ONLY implements the 3 endpoints that actually exist in
 * LinkedIn's public API. All other functionality requires browser automation.
 *
 * For search, profiles, jobs, messaging, etc., use the BrowserClient instead.
 */
export class APIClient {
  private readonly baseURL = 'https://api.linkedin.com/v2';
  private readonly oauthManager: OAuthManager;
  private readonly tenantId: string;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(tenantId: string, oauthManager: OAuthManager) {
    this.tenantId = tenantId;
    this.oauthManager = oauthManager;
    logger.info('API Client initialized (limited to 3 public endpoints)', { tenantId });
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Make authenticated request to LinkedIn API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      method = 'GET',
      data,
      params,
      headers = {},
      timeout = 30000,
      retries = 1
    } = options;

    // Check rate limit before making request
    if (this.rateLimitInfo && this.rateLimitInfo.remaining === 0) {
      const resetIn = this.rateLimitInfo.resetAt - Date.now();
      if (resetIn > 0) {
        throw new RateLimitError(
          `Rate limit exceeded. Resets in ${Math.ceil(resetIn / 1000)}s`,
          this.rateLimitInfo.resetAt,
          0
        );
      }
    }

    try {
      // Get valid access token (auto-refreshes if needed)
      const token = await this.oauthManager.getValidToken(this.tenantId);

      // Prepare request config
      const config: AxiosRequestConfig = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202401', // API version
          ...headers
        },
        timeout
      };

      if (data) {
        config.data = data;
      }

      if (params) {
        config.params = params;
      }

      logger.debug('Making API request', {
        tenantId: this.tenantId,
        method,
        endpoint,
        params
      });

      // Make the request
      const response: AxiosResponse<T> = await axios(config);

      // Update rate limit info from response headers
      this.updateRateLimitInfo(response);

      logger.info('API request successful', {
        tenantId: this.tenantId,
        endpoint,
        status: response.status
      });

      return response.data;

    } catch (error: any) {
      // Handle different error types
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData: LinkedInErrorResponse = error.response?.data;

        // Handle 401 Unauthorized - token may be invalid
        if (status === 401) {
          logger.warn('Authentication error, token may be invalid', {
            tenantId: this.tenantId,
            endpoint
          });

          // Try refreshing token and retry once
          if (retries > 0) {
            logger.info('Attempting token refresh and retry', { tenantId: this.tenantId });
            try {
              await this.oauthManager.refreshToken(this.tenantId);
              return this.makeRequest<T>(endpoint, { ...options, retries: retries - 1 });
            } catch (refreshError) {
              throw new LinkedInAuthError(
                'Authentication failed - please re-authenticate',
                this.tenantId,
                refreshError as Error
              );
            }
          }

          throw new LinkedInAuthError(
            'Authentication failed - token invalid or expired',
            this.tenantId,
            error
          );
        }

        // Handle 403 Forbidden - insufficient permissions
        if (status === 403) {
          throw new LinkedInAuthError(
            `Insufficient permissions: ${errorData?.message || 'Access denied'}. This endpoint may require LinkedIn Partnership approval.`,
            this.tenantId,
            error
          );
        }

        // Handle 429 Rate Limit
        if (status === 429) {
          const resetTime = this.getRateLimitResetTime(error.response);
          throw new RateLimitError(
            `LinkedIn API rate limit exceeded. Try again after ${new Date(resetTime).toISOString()}`,
            resetTime,
            0
          );
        }

        // Handle 404 Not Found
        if (status === 404) {
          throw new LinkedInAPIError(
            `Resource not found: ${endpoint}. This endpoint may not exist in LinkedIn's public API.`,
            404,
            endpoint,
            error
          );
        }

        // Handle 400 Bad Request
        if (status === 400) {
          throw new LinkedInAPIError(
            `Bad request: ${errorData?.message || 'Invalid parameters'}`,
            400,
            endpoint,
            error
          );
        }

        // Handle 500+ Server Errors
        if (status && status >= 500) {
          throw new LinkedInAPIError(
            `LinkedIn API server error (${status}): ${errorData?.message || 'Server error'}`,
            status,
            endpoint,
            error
          );
        }

        // Generic API error
        throw new LinkedInAPIError(
          `LinkedIn API error: ${errorData?.message || error.message}`,
          status,
          endpoint,
          error
        );
      }

      // Network or other errors
      throw new LinkedInAPIError(
        `Request failed: ${error.message}`,
        undefined,
        endpoint,
        error
      );
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(response: AxiosResponse): void {
    const limit = response.headers['x-ratelimit-limit'];
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];

    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        resetAt: parseInt(reset, 10) * 1000 // Convert to milliseconds
      };

      logger.debug('Rate limit updated', this.rateLimitInfo);
    }
  }

  /**
   * Get rate limit reset time from error response
   */
  private getRateLimitResetTime(response?: AxiosResponse): number {
    const reset = response?.headers['x-ratelimit-reset'];
    if (reset) {
      return parseInt(reset, 10) * 1000;
    }
    // Default to 1 hour from now if header not present
    return Date.now() + 60 * 60 * 1000;
  }

  // ==========================================================================
  // Public API Methods (ONLY THE 3 THAT ACTUALLY WORK)
  // ==========================================================================

  /**
   * ✅ METHOD 1/3: Get current user's Lite Profile
   *
   * This is the ONLY profile endpoint available in LinkedIn's public API.
   * It only returns: id, firstName, lastName, profilePicture
   *
   * Does NOT include: headline, summary, experience, education, skills, industry
   *
   * Scope required: r_liteprofile or r_basicprofile
   *
   * @returns Current user's lite profile information
   */
  async getMyLiteProfile(): Promise<Profile> {
    logger.info('Getting my lite profile', { tenantId: this.tenantId });

    const response = await this.makeRequest<LiteProfile>('/me');

    return {
      id: response.id,
      firstName: response.firstName?.localized?.en_US,
      lastName: response.lastName?.localized?.en_US,
      profilePicture: response.profilePicture
    };
  }

  /**
   * Alias for getMyLiteProfile() to maintain compatibility with UnifiedClient
   */
  async getMyProfile(): Promise<Profile> {
    return this.getMyLiteProfile();
  }

  /**
   * ✅ METHOD 2/3: Get current user's email address
   *
   * Scope required: r_emailaddress
   *
   * @returns Current user's email address
   */
  async getMyEmail(): Promise<string> {
    logger.info('Getting my email', { tenantId: this.tenantId });

    const response = await this.makeRequest<EmailAddress>(
      '/emailAddress?q=members&projection=(elements*(handle~))'
    );

    const email = response['handle~']?.emailAddress;

    if (!email) {
      throw new LinkedInAPIError(
        'Email address not found in response',
        undefined,
        '/emailAddress'
      );
    }

    return email;
  }

  /**
   * ✅ METHOD 3/3: Share a post on LinkedIn
   *
   * This allows posting content to the authenticated user's LinkedIn feed.
   *
   * Scope required: w_member_social
   *
   * @param params Post content and visibility settings
   * @returns Share post response with activity URN
   */
  async sharePost(params: SharePostParams): Promise<SharePostResponse> {
    logger.info('Sharing post', { tenantId: this.tenantId });

    const postData = {
      author: params.author,
      lifecycleState: params.lifecycleState || 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: params.text
          },
          shareMediaCategory: params.media ? 'ARTICLE' : 'NONE',
          ...(params.media && { media: [params.media] })
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': params.visibility || 'PUBLIC'
      }
    };

    const response = await this.makeRequest<any>(
      '/ugcPosts',
      {
        method: 'POST',
        data: postData
      }
    );

    return {
      id: response.id,
      activity: response.activity || `urn:li:activity:${response.id}`
    };
  }

  /**
   * Get current rate limit information
   *
   * @returns Current rate limit status or null if not available
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }

  // ==========================================================================
  // METHODS THAT DO NOT EXIST (Documented for clarity)
  // ==========================================================================

  /**
   * ❌ NOT AVAILABLE: Search People
   *
   * LinkedIn does NOT provide a public search API for people.
   * Use BrowserClient.searchPeopleViaUI() instead.
   *
   * @throws Error explaining this method doesn't exist
   */
  async searchPeople(): Promise<never> {
    throw new LinkedInAPIError(
      'LinkedIn does NOT provide a public People Search API. Use BrowserClient.searchPeopleViaUI() instead.',
      403,
      '/search/people'
    );
  }

  /**
   * ❌ NOT AVAILABLE: Get Other User's Profile
   *
   * LinkedIn's public API only allows getting YOUR OWN lite profile via /v2/me.
   * Viewing other profiles requires browser automation.
   * Use BrowserClient.getProfileComprehensive() instead.
   *
   * @throws Error explaining this method doesn't exist
   */
  async getProfile(): Promise<never> {
    throw new LinkedInAPIError(
      'LinkedIn does NOT allow viewing other profiles via public API. Use BrowserClient.getProfileComprehensive() instead.',
      403,
      '/people'
    );
  }

  /**
   * ❌ NOT AVAILABLE: Search Jobs
   *
   * LinkedIn does NOT provide a public job search API.
   * Use BrowserClient for job searching via browser automation.
   *
   * @throws Error explaining this method doesn't exist
   */
  async searchJobs(): Promise<never> {
    throw new LinkedInAPIError(
      'LinkedIn does NOT provide a public Job Search API. Use BrowserClient for job searches.',
      403,
      '/jobs/search'
    );
  }

  /**
   * ❌ NOT AVAILABLE: Send Messages
   *
   * LinkedIn's Messaging API requires LinkedIn Partnership Program approval.
   * Without partnership, use BrowserClient for messaging via browser automation.
   *
   * @throws Error explaining this method requires partnership
   */
  async sendMessage(): Promise<never> {
    throw new LinkedInAPIError(
      'LinkedIn Messaging API requires Partnership Program approval. Use BrowserClient.sendMessageViaUI() for messaging.',
      403,
      '/messaging/conversations'
    );
  }

  /**
   * ❌ NOT AVAILABLE: Get Conversations
   *
   * LinkedIn's Messaging API requires LinkedIn Partnership Program approval.
   * Use BrowserClient for messaging operations.
   *
   * @throws Error explaining this method requires partnership
   */
  async getConversations(): Promise<never> {
    throw new LinkedInAPIError(
      'LinkedIn Messaging API requires Partnership Program approval. Use BrowserClient for messaging.',
      403,
      '/messaging/conversations'
    );
  }

  /**
   * ❌ NOT AVAILABLE: Get Messages
   *
   * LinkedIn's Messaging API requires LinkedIn Partnership Program approval.
   * Use BrowserClient for messaging operations.
   *
   * @throws Error explaining this method requires partnership
   */
  async getMessages(): Promise<never> {
    throw new LinkedInAPIError(
      'LinkedIn Messaging API requires Partnership Program approval. Use BrowserClient for messaging.',
      403,
      '/messaging/conversations'
    );
  }

  /**
   * ❌ LIMITED AVAILABILITY: Network Stats
   *
   * LinkedIn's public API only provides very limited network statistics
   * (just connection count). For comprehensive network analysis, use
   * browser automation.
   *
   * @throws Error explaining limited availability
   */
  async getNetworkStats(): Promise<never> {
    throw new LinkedInAPIError(
      'LinkedIn Network API is very limited (connection count only). Not implemented in this version.',
      403,
      '/networkSizes'
    );
  }
}

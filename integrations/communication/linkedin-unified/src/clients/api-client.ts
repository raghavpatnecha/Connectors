/**
 * LinkedIn REST API Client
 *
 * Wraps LinkedIn's official REST API v2 with:
 * - Automatic OAuth token management
 * - Rate limit handling
 * - Error handling
 * - Type-safe interfaces
 *
 * Reference: https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts
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

// ============================================================================
// Search & Profile Parameters
// ============================================================================

/**
 * Parameters for searching people on LinkedIn
 */
export interface PeopleSearchParams {
  keywords?: string;
  currentCompany?: string[];
  pastCompany?: string[];
  industries?: string[];
  location?: string;
  schools?: string[];
  firstName?: string;
  lastName?: string;
  title?: string;
  start?: number;
  count?: number;
}

/**
 * LinkedIn Profile Response
 */
export interface Profile {
  id: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  industry?: string;
  location?: {
    country?: string;
    city?: string;
  };
  profilePicture?: {
    displayImage: string;
  };
  positions?: Position[];
  educations?: Education[];
  skills?: Skill[];
}

/**
 * Position/Experience on LinkedIn
 */
export interface Position {
  title: string;
  companyName: string;
  companyUrn?: string;
  description?: string;
  startDate?: {
    year: number;
    month?: number;
  };
  endDate?: {
    year: number;
    month?: number;
  };
  location?: string;
}

/**
 * Education on LinkedIn
 */
export interface Education {
  schoolName: string;
  schoolUrn?: string;
  degreeName?: string;
  fieldOfStudy?: string;
  startDate?: {
    year: number;
  };
  endDate?: {
    year: number;
  };
}

/**
 * Skill on LinkedIn
 */
export interface Skill {
  name: string;
  urn?: string;
}

// ============================================================================
// Job Search Parameters
// ============================================================================

/**
 * Parameters for searching jobs on LinkedIn
 */
export interface JobSearchParams {
  keywords?: string;
  companies?: string[];
  location?: string;
  jobType?: string[]; // FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERNSHIP, VOLUNTEER
  experienceLevel?: string[]; // ENTRY_LEVEL, ASSOCIATE, MID_SENIOR, DIRECTOR, EXECUTIVE
  industries?: string[];
  datePosted?: string; // PAST_24_HOURS, PAST_WEEK, PAST_MONTH
  remoteFilter?: string; // ON_SITE, REMOTE, HYBRID
  start?: number;
  count?: number;
}

/**
 * LinkedIn Job Posting Response
 */
export interface JobPosting {
  id: string;
  title: string;
  companyName: string;
  companyUrn?: string;
  location?: string;
  description?: string;
  employmentType?: string;
  experienceLevel?: string;
  industries?: string[];
  postedAt?: number;
  expiresAt?: number;
  applyUrl?: string;
}

// ============================================================================
// Messaging Parameters
// ============================================================================

/**
 * Parameters for sending a message
 */
export interface SendMessageParams {
  recipientUrn: string;
  messageBody: string;
  subject?: string;
}

/**
 * LinkedIn Conversation
 */
export interface Conversation {
  id: string;
  participants: string[];
  lastActivityAt: number;
  unreadCount: number;
  lastMessage?: Message;
}

/**
 * LinkedIn Message
 */
export interface Message {
  id: string;
  conversationId: string;
  from: string;
  body: string;
  createdAt: number;
  attachments?: Attachment[];
}

/**
 * Message Attachment
 */
export interface Attachment {
  type: string;
  url: string;
  name?: string;
}

// ============================================================================
// Network Statistics
// ============================================================================

/**
 * LinkedIn Network Statistics
 */
export interface NetworkStats {
  firstDegreeSize: number;
  secondDegreeSize: number;
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
 * LinkedIn REST API Client
 *
 * Handles all interactions with LinkedIn's official REST API v2
 */
export class APIClient {
  private readonly baseURL = 'https://api.linkedin.com/v2';
  private readonly oauthManager: OAuthManager;
  private readonly tenantId: string;
  private rateLimitInfo: RateLimitInfo | null = null;

  constructor(tenantId: string, oauthManager: OAuthManager) {
    this.tenantId = tenantId;
    this.oauthManager = oauthManager;
    logger.info('API Client initialized', { tenantId });
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
            `Insufficient permissions: ${errorData?.message || 'Access denied'}`,
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
            `Resource not found: ${endpoint}`,
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

  /**
   * Build query string from search parameters
   */
  private buildSearchQuery(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          queryParams.append(`${key}[${index}]`, item);
        });
      } else {
        queryParams.append(key, String(value));
      }
    });

    return queryParams.toString();
  }

  // ==========================================================================
  // Public API Methods
  // ==========================================================================

  /**
   * Search for people on LinkedIn
   *
   * @param params Search parameters (keywords, location, company, etc.)
   * @returns Array of profiles matching search criteria
   */
  async searchPeople(params: PeopleSearchParams): Promise<Profile[]> {
    logger.info('Searching people', { tenantId: this.tenantId, params });

    const queryString = this.buildSearchQuery({
      keywords: params.keywords,
      'current-company': params.currentCompany,
      'past-company': params.pastCompany,
      'facet-industry': params.industries,
      location: params.location,
      schools: params.schools,
      'first-name': params.firstName,
      'last-name': params.lastName,
      title: params.title,
      start: params.start || 0,
      count: params.count || 25
    });

    const response = await this.makeRequest<any>(
      `/search/people?${queryString}`
    );

    // Transform response to Profile[] format
    const profiles: Profile[] = (response.elements || []).map((element: any) => ({
      id: element.entityUrn || element.id,
      firstName: element.firstName?.localized?.en_US,
      lastName: element.lastName?.localized?.en_US,
      headline: element.headline?.localized?.en_US,
      summary: element.summary,
      industry: element.industryName,
      location: element.location,
      profilePicture: element.profilePicture,
      positions: element.positions?.elements || [],
      educations: element.educations?.elements || [],
      skills: element.skills?.elements || []
    }));

    return profiles;
  }

  /**
   * Get detailed profile by URN or public ID
   *
   * @param id Profile URN or public identifier
   * @returns Detailed profile information
   */
  async getProfile(id: string): Promise<Profile> {
    logger.info('Getting profile', { tenantId: this.tenantId, id });

    const encodedId = encodeURIComponent(id);
    const projection = '(id,firstName,lastName,profilePicture,headline,summary,industry,location,positions,educations,skills)';

    const response = await this.makeRequest<any>(
      `/people/${encodedId}?projection=${projection}`
    );

    return {
      id: response.id,
      firstName: response.firstName?.localized?.en_US,
      lastName: response.lastName?.localized?.en_US,
      headline: response.headline?.localized?.en_US,
      summary: response.summary,
      industry: response.industryName,
      location: response.location,
      profilePicture: response.profilePicture,
      positions: response.positions?.elements || [],
      educations: response.educations?.elements || [],
      skills: response.skills?.elements || []
    };
  }

  /**
   * Get current user's profile
   *
   * @returns Current user's profile information
   */
  async getMyProfile(): Promise<Profile> {
    logger.info('Getting my profile', { tenantId: this.tenantId });

    const projection = '(id,firstName,lastName,profilePicture,headline,summary,industry,location,positions,educations,skills)';

    const response = await this.makeRequest<any>(
      `/me?projection=${projection}`
    );

    return {
      id: response.id,
      firstName: response.firstName?.localized?.en_US,
      lastName: response.lastName?.localized?.en_US,
      headline: response.headline?.localized?.en_US,
      summary: response.summary,
      industry: response.industryName,
      location: response.location,
      profilePicture: response.profilePicture,
      positions: response.positions?.elements || [],
      educations: response.educations?.elements || [],
      skills: response.skills?.elements || []
    };
  }

  /**
   * Search for jobs on LinkedIn
   *
   * @param params Job search parameters
   * @returns Array of job postings matching criteria
   */
  async searchJobs(params: JobSearchParams): Promise<JobPosting[]> {
    logger.info('Searching jobs', { tenantId: this.tenantId, params });

    const queryString = this.buildSearchQuery({
      keywords: params.keywords,
      'company-name': params.companies,
      location: params.location,
      'job-type': params.jobType,
      'experience-level': params.experienceLevel,
      'facet-industry': params.industries,
      'date-posted': params.datePosted,
      'remote-filter': params.remoteFilter,
      start: params.start || 0,
      count: params.count || 25
    });

    const response = await this.makeRequest<any>(
      `/jobs/search?${queryString}`
    );

    // Transform response to JobPosting[] format
    const jobs: JobPosting[] = (response.elements || []).map((element: any) => ({
      id: element.entityUrn || element.id,
      title: element.title,
      companyName: element.companyDetails?.company?.name,
      companyUrn: element.companyDetails?.company?.entityUrn,
      location: element.location,
      description: element.description?.text,
      employmentType: element.employmentType,
      experienceLevel: element.experienceLevel,
      industries: element.industries,
      postedAt: element.listedAt,
      expiresAt: element.expireAt,
      applyUrl: element.applyMethod?.url
    }));

    return jobs;
  }

  /**
   * Send a message to a LinkedIn connection
   *
   * @param params Message parameters (recipient, body, subject)
   * @returns Message send confirmation
   */
  async sendMessage(params: SendMessageParams): Promise<{ messageId: string; status: string }> {
    logger.info('Sending message', { tenantId: this.tenantId, recipient: params.recipientUrn });

    const messageData = {
      recipients: [params.recipientUrn],
      subject: params.subject || 'LinkedIn Message',
      body: {
        text: params.messageBody
      },
      messageType: 'MEMBER_TO_MEMBER'
    };

    const response = await this.makeRequest<any>(
      '/messaging/conversations',
      {
        method: 'POST',
        data: messageData
      }
    );

    return {
      messageId: response.value?.entityUrn || response.id,
      status: 'sent'
    };
  }

  /**
   * Get network statistics
   *
   * @returns Network size statistics (1st and 2nd degree connections)
   */
  async getNetworkStats(): Promise<NetworkStats> {
    logger.info('Getting network stats', { tenantId: this.tenantId });

    const response = await this.makeRequest<any>(
      '/networkSizes/urn:li:person:~?edgeType=FIRST_DEGREE_CONNECTION'
    );

    return {
      firstDegreeSize: response.firstDegreeSize || 0,
      secondDegreeSize: response.secondDegreeSize || 0
    };
  }

  /**
   * Get recent conversations
   *
   * @param limit Maximum number of conversations to retrieve (default: 25)
   * @returns Array of recent conversations
   */
  async getConversations(limit: number = 25): Promise<Conversation[]> {
    logger.info('Getting conversations', { tenantId: this.tenantId, limit });

    const response = await this.makeRequest<any>(
      '/messaging/conversations',
      {
        params: {
          count: limit
        }
      }
    );

    // Transform response to Conversation[] format
    const conversations: Conversation[] = (response.elements || []).map((element: any) => ({
      id: element.entityUrn || element.id,
      participants: element.participants?.map((p: any) => p.entityUrn) || [],
      lastActivityAt: element.lastActivityAt || 0,
      unreadCount: element.unreadCount || 0,
      lastMessage: element.lastMessage ? {
        id: element.lastMessage.entityUrn,
        conversationId: element.entityUrn,
        from: element.lastMessage.from,
        body: element.lastMessage.body?.text || '',
        createdAt: element.lastMessage.createdAt
      } : undefined
    }));

    return conversations;
  }

  /**
   * Get messages from a conversation
   *
   * @param conversationId Conversation URN
   * @param limit Maximum number of messages to retrieve (default: 50)
   * @returns Array of messages in the conversation
   */
  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    logger.info('Getting messages', { tenantId: this.tenantId, conversationId, limit });

    const encodedId = encodeURIComponent(conversationId);
    const response = await this.makeRequest<any>(
      `/messaging/conversations/${encodedId}/messages`,
      {
        params: {
          count: limit
        }
      }
    );

    // Transform response to Message[] format
    const messages: Message[] = (response.elements || []).map((element: any) => ({
      id: element.entityUrn || element.id,
      conversationId,
      from: element.from,
      body: element.body?.text || '',
      createdAt: element.createdAt || 0,
      attachments: element.attachments?.map((a: any) => ({
        type: a.type,
        url: a.url,
        name: a.name
      })) || []
    }));

    return messages;
  }

  /**
   * Get current rate limit information
   *
   * @returns Current rate limit status or null if not available
   */
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }
}

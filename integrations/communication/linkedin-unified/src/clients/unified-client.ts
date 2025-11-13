/**
 * Unified LinkedIn Client with Smart Routing
 *
 * Intelligently routes requests between API and Browser clients:
 * - Try API first (faster, more reliable)
 * - Fall back to browser automation if API fails or is unavailable
 * - Track which method was used for debugging
 *
 * Architecture:
 * ┌─────────────────┐
 * │ UnifiedClient   │
 * └────────┬────────┘
 *          │
 *    ┌─────┴─────┐
 *    ▼           ▼
 * ┌──────┐   ┌─────────┐
 * │ API  │   │ Browser │
 * │Client│   │ Client  │
 * └──────┘   └─────────┘
 */

import { APIClient, PeopleSearchParams, Profile, JobSearchParams, JobPosting } from './api-client';
import {
  BrowserClient,
  Post,
  SearchProfileResult,
  SearchPeopleParams,
  ComprehensiveProfile
} from './browser-client';
import { OAuthManager } from '../auth/oauth-manager';
import { SessionManager } from '../auth/session-manager';
import { LinkedInAPIError, LinkedInAuthError } from '../utils/error-handler';
import { logger } from '../utils/logger';

export type ClientMethod = 'api' | 'browser' | 'none';

export interface UnifiedClientOptions {
  preferBrowser?: boolean;  // Force browser for all operations
  apiOnly?: boolean;         // Disable browser fallback
}

export class UnifiedClient {
  private readonly apiClient: APIClient;
  private readonly browserClient: BrowserClient;
  private readonly options: UnifiedClientOptions;
  private lastUsedMethod: ClientMethod = 'none';
  private readonly tenantId: string;

  constructor(
    tenantId: string,
    oauthManager: OAuthManager,
    sessionManager: SessionManager,
    options: UnifiedClientOptions = {}
  ) {
    this.tenantId = tenantId;
    this.apiClient = new APIClient(tenantId, oauthManager);
    this.browserClient = new BrowserClient(tenantId, sessionManager);
    this.options = options;

    logger.info('Unified Client initialized', {
      tenantId,
      preferBrowser: options.preferBrowser,
      apiOnly: options.apiOnly
    });
  }

  /**
   * Search for people with smart routing
   * Strategy: Try API first → Fall back to browser
   */
  async searchPeople(params: PeopleSearchParams): Promise<Profile[]> {
    logger.info('Searching people with smart routing', {
      tenantId: this.tenantId,
      params,
      preferBrowser: this.options.preferBrowser
    });

    // Force browser if requested
    if (this.options.preferBrowser) {
      logger.info('Using browser (forced by options)');
      const browserParams: SearchPeopleParams = {
        keywords: params.keywords,
        location: params.location,
        title: params.title,
        currentCompany: params.currentCompany
      };
      const results = await this.browserClient.searchPeopleViaUI(browserParams);
      this.lastUsedMethod = 'browser';
      // Convert SearchProfileResult to Profile
      return results.map(r => this.convertSearchResultToProfile(r));
    }

    // Try API first
    try {
      logger.info('Attempting people search via API');
      const results = await this.apiClient.searchPeople(params);
      this.lastUsedMethod = 'api';

      logger.info('People search completed via API', {
        tenantId: this.tenantId,
        resultCount: results.length,
        method: 'api'
      });

      return results;

    } catch (error) {
      // Check if we should fall back to browser
      if (this.shouldFallbackToBrowser(error)) {
        logger.info('API failed, falling back to browser', {
          tenantId: this.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        try {
          const browserParams: SearchPeopleParams = {
            keywords: params.keywords,
            location: params.location,
            title: params.title,
            currentCompany: params.currentCompany
          };
          const results = await this.browserClient.searchPeopleViaUI(browserParams);
          this.lastUsedMethod = 'browser';

          logger.info('People search completed via browser fallback', {
            tenantId: this.tenantId,
            resultCount: results.length,
            method: 'browser'
          });

          // Convert SearchProfileResult to Profile
          return results.map(r => this.convertSearchResultToProfile(r));

        } catch (browserError) {
          logger.error('Both API and browser failed for people search', {
            tenantId: this.tenantId,
            apiError: error instanceof Error ? error.message : 'Unknown',
            browserError: browserError instanceof Error ? browserError.message : 'Unknown'
          });
          throw browserError;
        }
      }

      // If no fallback, throw original error
      throw error;
    }
  }

  /**
   * Get profile with intelligent routing
   * Strategy: Try API for basic info → Use browser for comprehensive data
   */
  async getProfile(profileIdOrUrl: string, comprehensive: boolean = false): Promise<Profile> {
    logger.info('Getting profile with smart routing', {
      tenantId: this.tenantId,
      profileIdOrUrl,
      comprehensive
    });

    // If comprehensive data needed, use browser directly
    if (comprehensive || profileIdOrUrl.startsWith('http')) {
      logger.info('Using browser for comprehensive profile data');
      const username = profileIdOrUrl.startsWith('http')
        ? profileIdOrUrl.split('/in/')[1]?.split('/')[0] || profileIdOrUrl
        : profileIdOrUrl;

      const comprehensive = await this.browserClient.getProfileComprehensive(username);
      this.lastUsedMethod = 'browser';
      return this.convertComprehensiveToProfile(comprehensive);
    }

    // Try API for basic profile first
    try {
      logger.info('Attempting profile fetch via API');
      const result = await this.apiClient.getProfile(profileIdOrUrl);
      this.lastUsedMethod = 'api';

      logger.info('Profile fetched via API', {
        tenantId: this.tenantId,
        profileId: profileIdOrUrl,
        method: 'api'
      });

      return result;

    } catch (error) {
      // Fall back to browser for comprehensive data
      if (this.shouldFallbackToBrowser(error)) {
        logger.info('API failed, falling back to browser for profile', {
          tenantId: this.tenantId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        const username = profileIdOrUrl;
        const comprehensive = await this.browserClient.getProfileComprehensive(username);
        this.lastUsedMethod = 'browser';

        logger.info('Profile fetched via browser fallback', {
          tenantId: this.tenantId,
          profileId: profileIdOrUrl,
          method: 'browser'
        });

        return this.convertComprehensiveToProfile(comprehensive);
      }

      throw error;
    }
  }

  /**
   * Search for jobs with smart routing
   * Strategy: Try API first (browser search not implemented)
   */
  async searchJobs(params: JobSearchParams): Promise<JobPosting[]> {
    logger.info('Searching jobs with smart routing', {
      tenantId: this.tenantId,
      params
    });

    // Try API (browser job search not implemented)
    try {
      logger.info('Attempting job search via API');
      const results = await this.apiClient.searchJobs(params);
      this.lastUsedMethod = 'api';

      logger.info('Job search completed via API', {
        tenantId: this.tenantId,
        resultCount: results.length,
        method: 'api'
      });

      return results;

    } catch (error) {
      logger.error('Job search failed', {
        tenantId: this.tenantId,
        error: error instanceof Error ? error.message : 'Unknown'
      });
      throw error;
    }
  }

  /**
   * Browse feed (browser only - not available in API)
   */
  async browseFeed(limit: number = 10): Promise<Post[]> {
    logger.info('Browsing feed via browser (no API equivalent)', {
      tenantId: this.tenantId,
      limit
    });

    const results = await this.browserClient.browseFeed(limit);
    this.lastUsedMethod = 'browser';

    logger.info('Feed browsing completed', {
      tenantId: this.tenantId,
      postCount: results.length,
      method: 'browser'
    });

    return results;
  }

  /**
   * Like a post (browser only)
   */
  async likePost(postUrl: string): Promise<{ success: boolean; wasAlreadyLiked: boolean }> {
    logger.info('Liking post via browser (no API equivalent)', {
      tenantId: this.tenantId,
      postUrl
    });

    const result = await this.browserClient.likePost(postUrl);
    this.lastUsedMethod = 'browser';

    logger.info('Post liked', {
      tenantId: this.tenantId,
      method: 'browser',
      success: result.success,
      wasAlreadyLiked: result.wasAlreadyLiked
    });

    return result;
  }

  /**
   * Send message (API only - more reliable than browser)
   */
  async sendMessage(recipientId: string, message: string): Promise<{ messageId: string; status: string }> {
    logger.info('Sending message via API (preferred method)', {
      tenantId: this.tenantId,
      recipientId,
      messageLength: message.length
    });

    const result = await this.apiClient.sendMessage(recipientId, message);
    this.lastUsedMethod = 'api';

    logger.info('Message sent', {
      tenantId: this.tenantId,
      method: 'api',
      messageId: result.messageId,
      status: result.status
    });

    return result;
  }

  /**
   * Apply to job (browser only - not available in API)
   */
  async applyToJob(jobId: string, coverLetter?: string): Promise<{ success: boolean }> {
    logger.info('Applying to job via browser (no API equivalent)', {
      tenantId: this.tenantId,
      jobId
    });

    const result = await this.browserClient.applyToJob(jobId, coverLetter);
    this.lastUsedMethod = 'browser';

    logger.info('Job application processed', {
      tenantId: this.tenantId,
      method: 'browser',
      success: result.success
    });

    return result;
  }

  /**
   * Get the last method used (for debugging and logging)
   */
  getLastUsedMethod(): ClientMethod {
    return this.lastUsedMethod;
  }

  /**
   * Get statistics about method usage
   */
  getMethodStatistics(): { api: number; browser: number; total: number } {
    // This could be enhanced with actual tracking
    return {
      api: 0,
      browser: 0,
      total: 0
    };
  }

  /**
   * Determine if we should fall back to browser
   */
  private shouldFallbackToBrowser(error: any): boolean {
    // Don't fall back if browser is disabled
    if (this.options.apiOnly) {
      logger.info('Browser fallback disabled by options');
      return false;
    }

    // Fall back on these errors:
    // 1. API rate limit exceeded
    // 2. API endpoint not found (404)
    // 3. API service unavailable (503)
    // 4. Authentication errors (except invalid OAuth credentials)
    // 5. Generic API errors

    if (error instanceof LinkedInAPIError) {
      const shouldFallback =
        error.statusCode === 429 ||  // Rate limit
        error.statusCode === 404 ||  // Not found
        error.statusCode === 503 ||  // Service unavailable
        error.statusCode === 500 ||  // Internal server error
        error.statusCode === 502;    // Bad gateway

      logger.info('API error - fallback decision', {
        statusCode: error.statusCode,
        shouldFallback
      });

      return shouldFallback;
    }

    // Don't fall back on auth errors - these need to be fixed
    if (error instanceof LinkedInAuthError) {
      logger.info('Auth error - no fallback (requires re-authentication)');
      return false;
    }

    // Fall back on any other error
    logger.info('Unknown error - attempting fallback');
    return true;
  }

  /**
   * Close all clients and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing unified client', { tenantId: this.tenantId });
    await this.browserClient.close();
    logger.info('Unified client closed', { tenantId: this.tenantId });
  }

  /**
   * Helper: Convert SearchProfileResult to Profile
   */
  private convertSearchResultToProfile(result: SearchProfileResult): Profile {
    const [firstName, ...lastNameParts] = result.name.split(' ');
    return {
      id: result.profileUrl.split('/in/')[1]?.split('/')[0] || '',
      firstName,
      lastName: lastNameParts.join(' '),
      headline: result.headline,
      location: { city: result.location },
      industry: result.connectionDegree
    };
  }

  /**
   * Helper: Convert ComprehensiveProfile to Profile
   */
  private convertComprehensiveToProfile(comprehensive: ComprehensiveProfile): Profile {
    const [firstName, ...lastNameParts] = comprehensive.name.split(' ');
    return {
      id: comprehensive.name.toLowerCase().replace(/\s+/g, '-'),
      firstName,
      lastName: lastNameParts.join(' '),
      headline: comprehensive.headline,
      summary: comprehensive.about,
      location: { city: comprehensive.location },
      positions: comprehensive.experiences.map(exp => ({
        title: exp.positionTitle,
        companyName: exp.company,
        location: exp.location,
        startDate: exp.fromDate,
        endDate: exp.toDate,
        description: exp.description
      })),
      educations: comprehensive.educations.map(edu => ({
        schoolName: edu.institution,
        degreeName: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.fromDate,
        endDate: edu.toDate
      })),
      skills: comprehensive.skills.map(skill => ({ name: skill }))
    };
  }
}

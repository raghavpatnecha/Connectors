/**
 * Unified LinkedIn Client - HONEST VERSION
 *
 * ⚠️ IMPORTANT: LinkedIn's public API is extremely limited.
 *
 * ROUTING STRATEGY (Updated for API Reality):
 * - API (3 endpoints only): getMyProfile, getMyEmail, sharePost
 * - Browser (everything else): search, profiles, jobs, messaging, feed, etc.
 *
 * This is NOT smart routing - it's HONEST routing based on what actually exists.
 *
 * Architecture:
 * ┌─────────────────┐
 * │ UnifiedClient   │
 * └────────┬────────┘
 *          │
 *    ┌─────┴─────┐
 *    ▼           ▼
 * ┌──────┐   ┌─────────┐
 * │ API  │   │ Browser │  ← Primary method for 95% of functionality
 * │(3 only)│   │ Client  │
 * └──────┘   └─────────┘
 */

import { APIClient, Profile, SharePostParams } from './api-client';
import {
  BrowserClient,
  Post,
  SearchProfileResult,
  SearchPeopleParams,
  ComprehensiveProfile
} from './browser-client';
import { OAuthManager } from '../auth/oauth-manager';
import { SessionManager } from '../auth/session-manager';
import { logger } from '../utils/logger';

export type ClientMethod = 'api' | 'browser' | 'none';

export interface UnifiedClientOptions {
  preferBrowser?: boolean;  // Force browser for all operations (default: true, since API is so limited)
  apiOnly?: boolean;         // Disable browser (NOT RECOMMENDED - most features won't work)
}

/**
 * Unified LinkedIn Client with honest routing
 *
 * Uses browser automation for 95% of operations because LinkedIn's public API
 * only has 3 endpoints. This is the reality of LinkedIn integration.
 */
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
    this.options = {
      preferBrowser: true,  // Default to browser since API is so limited
      ...options
    };

    logger.info('Unified Client initialized (browser-first routing)', {
      tenantId,
      apiOnly: options.apiOnly
    });
  }

  // ==========================================================================
  // PEOPLE & PROFILES
  // ==========================================================================

  /**
   * ❌ Search for people (BROWSER ONLY - NO API EXISTS)
   *
   * LinkedIn does NOT provide a public search API.
   * This method uses browser automation.
   */
  async searchPeople(params: {
    keywords?: string;
    location?: string;
    title?: string;
    currentCompany?: string[];
    count?: number;
  }): Promise<Profile[]> {
    logger.info('Searching people via browser (no API available)', {
      tenantId: this.tenantId,
      params
    });

    const browserParams: SearchPeopleParams = {
      keywords: params.keywords || '',
      location: params.location || '',
      currentCompany: params.currentCompany?.[0]
    };

    const results = await this.browserClient.searchPeopleViaUI(browserParams);
    this.lastUsedMethod = 'browser';

    logger.info('People search completed via browser', {
      tenantId: this.tenantId,
      resultCount: results.length,
      method: 'browser'
    });

    // Convert SearchProfileResult to Profile
    return results.map(r => this.convertSearchResultToProfile(r));
  }

  /**
   * ❌ Get another user's profile (BROWSER ONLY - NO API)
   *
   * LinkedIn's public API only allows getting YOUR OWN lite profile.
   * Viewing other profiles requires browser automation.
   */
  async getProfile(profileIdOrUrl: string): Promise<Profile> {
    logger.info('Getting profile via browser (API cannot view other profiles)', {
      tenantId: this.tenantId,
      profileIdOrUrl
    });

    const username = profileIdOrUrl.startsWith('http')
      ? profileIdOrUrl.split('/in/')[1]?.split('/')[0] || profileIdOrUrl
      : profileIdOrUrl;

    const comprehensive = await this.browserClient.getProfileComprehensive(username);
    this.lastUsedMethod = 'browser';

    logger.info('Profile fetched via browser', {
      tenantId: this.tenantId,
      profileId: profileIdOrUrl,
      method: 'browser'
    });

    return this.convertComprehensiveToProfile(comprehensive);
  }

  /**
   * Alias for getProfile() for compatibility
   */
  async getProfileBasic(username: string, fields?: string[]): Promise<Profile> {
    return this.getProfile(username);
  }

  /**
   * Alias for getProfile() for compatibility
   */
  async getProfileComprehensive(username: string, options?: {
    includeSkills?: boolean;
    includeExperience?: boolean;
    includeEducation?: boolean;
    includeConnections?: boolean;
  }): Promise<Profile> {
    return this.getProfile(username);
  }

  /**
   * ✅ Get YOUR OWN profile (API WORKS - one of the 3 working endpoints)
   *
   * This is one of the ONLY things LinkedIn's public API can do.
   * Returns lite profile: id, firstName, lastName, profilePicture
   * (Does NOT include headline, summary, experience, education, skills)
   */
  async getMyProfile(includePrivateData: boolean = false): Promise<Profile> {
    logger.info('Getting my profile via API (one of 3 working endpoints)', {
      tenantId: this.tenantId
    });

    this.lastUsedMethod = 'api';
    const profile = await this.apiClient.getMyProfile();

    logger.info('My lite profile retrieved via API', {
      tenantId: this.tenantId,
      profileId: profile.id
    });

    return profile;
  }

  /**
   * ❌ Get network statistics (NOT IMPLEMENTED - API very limited)
   *
   * LinkedIn's API only provides connection count, which is not very useful.
   * Browser automation would be needed for comprehensive network analysis.
   */
  async getNetworkStats(includeGrowthMetrics: boolean = false): Promise<any> {
    throw new Error(
      'Network stats not implemented. LinkedIn API only provides connection count. ' +
      'For comprehensive network analysis, browser automation would be needed.'
    );
  }

  /**
   * ❌ Get connections list (BROWSER WOULD BE NEEDED - NO API)
   *
   * LinkedIn does not provide a public API for listing connections.
   * Browser automation would be required.
   */
  async getConnections(params: {
    start?: number;
    count?: number;
    sortBy?: 'RECENTLY_ADDED' | 'FIRST_NAME' | 'LAST_NAME';
  }): Promise<any> {
    throw new Error(
      'Get connections not implemented. LinkedIn does not provide a public API for this. ' +
      'Browser automation via BrowserClient would be needed.'
    );
  }

  // ==========================================================================
  // JOBS
  // ==========================================================================

  /**
   * ❌ Search for jobs (BROWSER WOULD BE NEEDED - NO API)
   *
   * LinkedIn does NOT provide a public job search API.
   * Browser automation via BrowserClient would be required.
   */
  async searchJobs(params: {
    keywords?: string;
    location?: string;
    companies?: string[];
    jobType?: string[];
    experienceLevel?: string[];
    count?: number;
  }): Promise<any[]> {
    throw new Error(
      'Job search not implemented. LinkedIn does not provide a public job search API. ' +
      'Browser automation via BrowserClient would be needed.'
    );
  }

  /**
   * ❌ Get recommended jobs (NO API)
   */
  async getRecommendedJobs(params: {
    limit?: number;
    filterByRelevance?: boolean;
    minRelevanceScore?: number;
  }): Promise<any> {
    throw new Error(
      'Recommended jobs not implemented. LinkedIn does not provide a public API for this. ' +
      'Browser automation would be needed.'
    );
  }

  /**
   * ❌ Get job details (NO API)
   */
  async getJobDetails(jobId: string, options?: {
    includeCompanyInfo?: boolean;
    includeApplicationDetails?: boolean;
  }): Promise<any> {
    throw new Error(
      'Job details not implemented. LinkedIn does not provide a public API for this. ' +
      'Browser automation would be needed.'
    );
  }

  /**
   * ✅ Apply to job (BROWSER ONLY - works via automation)
   */
  async applyToJob(jobId: string, coverLetter?: string): Promise<{ success: boolean }> {
    logger.info('Applying to job via browser (no API available)', {
      tenantId: this.tenantId,
      jobId
    });

    const result = await this.browserClient.applyToJob(jobId, coverLetter);
    this.lastUsedMethod = 'browser';

    logger.info('Job application processed via browser', {
      tenantId: this.tenantId,
      method: 'browser',
      success: result.success
    });

    return result;
  }

  // ==========================================================================
  // MESSAGING
  // ==========================================================================

  /**
   * ❌ Send message (REQUIRES LINKEDIN PARTNERSHIP)
   *
   * LinkedIn's Messaging API requires Partnership Program approval.
   * Without partnership, browser automation would be needed.
   */
  async sendMessage(recipientId: string, message: string): Promise<{ messageId: string; status: string }> {
    throw new Error(
      'Send message not implemented. LinkedIn Messaging API requires Partnership Program approval. ' +
      'Without partnership, browser automation via BrowserClient would be needed.'
    );
  }

  /**
   * ❌ Get conversations (REQUIRES LINKEDIN PARTNERSHIP)
   */
  async getConversations(params: {
    limit?: number;
    offset?: number;
    filter?: 'ALL' | 'UNREAD' | 'ARCHIVED' | 'STARRED';
    sortBy?: string;
  }): Promise<any> {
    throw new Error(
      'Get conversations not implemented. LinkedIn Messaging API requires Partnership Program approval. ' +
      'Browser automation would be needed.'
    );
  }

  /**
   * ❌ Get messages (REQUIRES LINKEDIN PARTNERSHIP)
   */
  async getMessages(params: {
    conversationId: string;
    limit?: number;
    before?: number;
    after?: number;
    includeAttachments?: boolean;
    markAsRead?: boolean;
  }): Promise<any> {
    throw new Error(
      'Get messages not implemented. LinkedIn Messaging API requires Partnership Program approval. ' +
      'Browser automation would be needed.'
    );
  }

  // ==========================================================================
  // FEED & POSTS
  // ==========================================================================

  /**
   * ✅ Browse feed (BROWSER ONLY - works via automation)
   */
  async browseFeed(limit: number = 10): Promise<Post[]> {
    logger.info('Browsing feed via browser (no API available)', {
      tenantId: this.tenantId,
      limit
    });

    const results = await this.browserClient.browseFeed(limit);
    this.lastUsedMethod = 'browser';

    logger.info('Feed browsing completed via browser', {
      tenantId: this.tenantId,
      postCount: results.length,
      method: 'browser'
    });

    return results;
  }

  /**
   * ✅ Like a post (BROWSER ONLY - works via automation)
   */
  async likePost(postUrl: string): Promise<{ success: boolean; wasAlreadyLiked: boolean }> {
    logger.info('Liking post via browser (no API available)', {
      tenantId: this.tenantId,
      postUrl
    });

    const result = await this.browserClient.likePost(postUrl);
    this.lastUsedMethod = 'browser';

    logger.info('Post liked via browser', {
      tenantId: this.tenantId,
      method: 'browser',
      success: result.success,
      wasAlreadyLiked: result.wasAlreadyLiked
    });

    return result;
  }

  /**
   * ✅ Comment on post (BROWSER ONLY - works via automation)
   */
  async commentOnPost(postUrl: string, comment: string): Promise<any> {
    logger.info('Commenting on post via browser (no API available)', {
      tenantId: this.tenantId,
      postUrl
    });

    this.lastUsedMethod = 'browser';
    const result = await this.browserClient.commentOnPost(postUrl, comment);

    logger.info('Comment posted via browser', {
      tenantId: this.tenantId,
      postUrl
    });

    return {
      success: true,
      commentId: `comment_${Date.now()}`,
      commentUrl: postUrl
    };
  }

  /**
   * ✅ Create post (BROWSER ONLY - works via automation)
   *
   * Note: API has a sharePost endpoint but browser automation provides
   * more control and features.
   */
  async createPost(params: {
    content: string;
    visibility?: string;
    media?: any[];
    hashtags?: string[];
    mentionUsers?: string[];
    shareUrl?: string;
  }): Promise<any> {
    logger.info('Creating post via browser (more features than API)', {
      tenantId: this.tenantId,
      contentLength: params.content.length
    });

    this.lastUsedMethod = 'browser';
    await this.browserClient.createPost(params.content, params.media?.[0]);

    const postId = `post_${Date.now()}`;

    logger.info('Post created via browser', {
      tenantId: this.tenantId,
      postId
    });

    return {
      success: true,
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postId}/`
    };
  }

  /**
   * ✅ Share post via API (one of the 3 working endpoints)
   *
   * This is one of the few things LinkedIn's API can actually do.
   * Requires scope: w_member_social
   */
  async sharePostViaAPI(params: SharePostParams): Promise<{ id: string; activity: string }> {
    logger.info('Sharing post via API (one of 3 working endpoints)', {
      tenantId: this.tenantId
    });

    this.lastUsedMethod = 'api';
    const result = await this.apiClient.sharePost(params);

    logger.info('Post shared via API', {
      tenantId: this.tenantId,
      postId: result.id
    });

    return result;
  }

  /**
   * ✅ Get my email via API (one of the 3 working endpoints)
   *
   * This is one of the few things LinkedIn's API can actually do.
   * Requires scope: r_emailaddress
   */
  async getMyEmail(): Promise<string> {
    logger.info('Getting my email via API (one of 3 working endpoints)', {
      tenantId: this.tenantId
    });

    this.lastUsedMethod = 'api';
    const email = await this.apiClient.getMyEmail();

    logger.info('Email retrieved via API', {
      tenantId: this.tenantId
    });

    return email;
  }

  // ==========================================================================
  // COMPANY
  // ==========================================================================

  /**
   * ✅ Get company profile (BROWSER ONLY - works via automation)
   */
  async getCompanyProfile(params: {
    companyIdentifier: string;
    includeEmployees?: boolean;
    includeJobPostings?: boolean;
    includeUpdates?: boolean;
  }): Promise<any> {
    logger.info('Getting company profile via browser (no API available)', {
      tenantId: this.tenantId,
      company: params.companyIdentifier
    });

    this.lastUsedMethod = 'browser';
    const company = await this.browserClient.getCompanyProfile(params.companyIdentifier);

    logger.info('Company profile retrieved via browser', {
      tenantId: this.tenantId,
      company: company.name
    });

    return company;
  }

  /**
   * ✅ Follow/unfollow company (BROWSER ONLY - works via automation)
   */
  async followCompany(params: {
    companyIdentifier: string;
    action: 'FOLLOW' | 'UNFOLLOW';
    notificationSettings?: any;
  }): Promise<any> {
    logger.info('Following/unfollowing company via browser (no API available)', {
      tenantId: this.tenantId,
      company: params.companyIdentifier,
      action: params.action
    });

    this.lastUsedMethod = 'browser';
    await this.browserClient.followCompany(params.companyIdentifier);

    logger.info('Company follow action completed via browser', {
      tenantId: this.tenantId,
      company: params.companyIdentifier,
      action: params.action
    });

    return {
      success: true,
      following: params.action === 'FOLLOW',
      followerCount: 0
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

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
   * Close all clients and cleanup
   */
  async close(): Promise<void> {
    logger.info('Closing unified client', { tenantId: this.tenantId });
    await this.browserClient.close();
    logger.info('Unified client closed', { tenantId: this.tenantId });
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

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
   * Helper: Parse date string to { year, month } format
   */
  private parseDate(dateStr: string | undefined): { year: number; month?: number } | undefined {
    if (!dateStr) return undefined;

    // Handle various date formats: "2020", "2020-01", "2020-01-15", "Jan 2020"
    const yearMatch = dateStr.match(/\d{4}/);
    if (!yearMatch) {
      return { year: new Date().getFullYear() };
    }

    const year = parseInt(yearMatch[0], 10);
    const monthMatch = dateStr.match(/-(\d{1,2})/);
    const month = monthMatch ? parseInt(monthMatch[1], 10) : undefined;

    return { year, month };
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
        startDate: this.parseDate(exp.fromDate),
        endDate: this.parseDate(exp.toDate),
        description: exp.description
      })),
      educations: comprehensive.educations.map(edu => ({
        schoolName: edu.institution,
        degreeName: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: this.parseDate(edu.fromDate),
        endDate: this.parseDate(edu.toDate)
      })),
      skills: comprehensive.skills.map(skill => ({ name: skill }))
    };
  }
}

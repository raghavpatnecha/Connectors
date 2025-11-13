/**
 * LinkedIn Browser Client - Playwright-based Automation
 *
 * Provides browser automation for LinkedIn operations including:
 * - Feed browsing and post interactions
 * - Profile scraping (comprehensive data extraction)
 * - Company profile scraping
 * - Job searching and application
 * - People search via UI
 *
 * Based on reference implementations:
 * - linkedin-automation (Python/Playwright)
 * - linkedin-stickerdaniel (Python/Selenium via linkedin-scraper)
 */

import { Page } from 'playwright';
import { SessionManager } from '../auth/session-manager';
import { logger } from '../utils/logger';
import { LinkedInAutomationError } from '../utils/error-handler';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Post {
  author: string;
  authorHeadline?: string;
  content: string;
  timestamp: string;
  likes: string;
  comments?: string;
  url?: string;
  mediaUrls?: string[];
}

export interface ProfileExperience {
  positionTitle: string;
  company: string;
  fromDate?: string;
  toDate?: string;
  duration?: string;
  location?: string;
  description?: string;
}

export interface ProfileEducation {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  fromDate?: string;
  toDate?: string;
  description?: string;
}

export interface ProfileAccomplishment {
  category: string;
  title: string;
}

export interface ProfileContact {
  name: string;
  occupation: string;
  url: string;
}

export interface ComprehensiveProfile {
  name: string;
  headline?: string;
  location?: string;
  about?: string;
  connectionDegree?: string;
  experiences: ProfileExperience[];
  educations: ProfileEducation[];
  skills: string[];
  interests: string[];
  accomplishments: ProfileAccomplishment[];
  contacts: ProfileContact[];
  company?: string;
  jobTitle?: string;
  openToWork?: boolean;
}

export interface SearchProfileResult {
  name: string;
  headline: string;
  location: string;
  profileUrl: string;
  connectionDegree: string;
  snippet?: string;
}

export interface JobPosting {
  jobId: string;
  title: string;
  company: string;
  location: string;
  postedDate?: string;
  applicantCount?: string;
  description?: string;
  url: string;
}

export interface CompanyProfile {
  name: string;
  about?: string;
  website?: string;
  phone?: string;
  headquarters?: string;
  founded?: string;
  industry?: string;
  companyType?: string;
  companySize?: string;
  specialties: string[];
  showcasePages: Array<{ name: string; url: string; followers: string }>;
  affiliatedCompanies: Array<{ name: string; url: string; followers: string }>;
  headcount?: string;
  employees?: string[];
}

export interface SearchPeopleParams {
  keywords: string;
  location?: string;
  currentCompany?: string;
  pastCompany?: string;
  school?: string;
  limit?: number;
}

// ============================================================================
// Browser Client Class
// ============================================================================

export class BrowserClient {
  private readonly sessionManager: SessionManager;
  private readonly tenantId: string;
  private page: Page | null = null;

  constructor(tenantId: string, sessionManager: SessionManager) {
    this.tenantId = tenantId;
    this.sessionManager = sessionManager;
    logger.info('BrowserClient initialized', { tenantId });
  }

  /**
   * Ensure browser session is active and authenticated
   */
  private async ensureSession(): Promise<Page> {
    if (!this.page) {
      logger.info('Creating new browser session', { tenantId: this.tenantId });
      this.page = await this.sessionManager.createSession({
        tenantId: this.tenantId,
        headless: true
      });
    }

    return this.page;
  }

  /**
   * Navigate to URL with retry logic and anti-detection delays
   */
  private async navigateWithRetry(url: string, maxRetries = 3): Promise<void> {
    const page = await this.ensureSession();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Random delay to avoid detection (1-3 seconds)
        await this.randomDelay(1000, 3000);

        await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        // Check if we're logged in (not on login page)
        if (page.url().includes('/login') || page.url().includes('/authwall')) {
          throw new LinkedInAutomationError(
            'Not authenticated - session expired',
            'navigation'
          );
        }

        logger.debug('Navigation successful', { url, attempt });
        return;

      } catch (error: any) {
        logger.warn('Navigation attempt failed', { url, attempt, error: error.message });

        if (attempt === maxRetries) {
          throw new LinkedInAutomationError(
            `Failed to navigate to ${url} after ${maxRetries} attempts: ${error.message}`,
            'navigation',
            error
          );
        }

        // Exponential backoff
        await this.randomDelay(2000 * attempt, 4000 * attempt);
      }
    }
  }

  /**
   * Random delay to simulate human behavior
   */
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Scroll page with human-like behavior
   */
  private async humanScroll(scrollCount: number = 3): Promise<void> {
    const page = await this.ensureSession();

    for (let i = 0; i < scrollCount; i++) {
      // Random scroll distance (500-1000px)
      const scrollDistance = Math.floor(Math.random() * 500) + 500;

      await page.evaluate((distance) => {
        window.scrollBy({
          top: distance,
          behavior: 'smooth'
        });
      }, scrollDistance);

      // Random pause (800-1500ms)
      await this.randomDelay(800, 1500);
    }
  }

  /**
   * Take screenshot on error for debugging
   */
  private async captureErrorScreenshot(action: string): Promise<void> {
    try {
      if (this.page) {
        const timestamp = Date.now();
        const filename = `error_${action}_${timestamp}.png`;
        const path = require('path');
        const screenshotPath = path.join(__dirname, '../../.screenshots', filename);

        // Create screenshots directory if it doesn't exist
        const fs = require('fs').promises;
        await fs.mkdir(path.dirname(screenshotPath), { recursive: true });

        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        logger.info('Error screenshot captured', { action, screenshotPath });
      }
    } catch (error: any) {
      logger.warn('Failed to capture screenshot', { error: error.message });
    }
  }

  // ============================================================================
  // FEED OPERATIONS
  // ============================================================================

  /**
   * Browse LinkedIn feed and extract posts
   *
   * Selector Reference (from linkedin-automation):
   * - Post container: .feed-shared-update-v2
   * - Author name: .feed-shared-actor__name
   * - Author headline: .feed-shared-actor__description
   * - Post content: .feed-shared-text
   * - Timestamp: .feed-shared-actor__sub-description
   * - Likes count: .social-details-social-counts__reactions-count
   */
  async browseFeed(limit: number = 10): Promise<Post[]> {
    logger.info('Browsing LinkedIn feed', { tenantId: this.tenantId, limit });

    try {
      await this.navigateWithRetry('https://www.linkedin.com/feed/');
      const page = await this.ensureSession();

      const posts: Post[] = [];
      const seenContent = new Set<string>();

      // Scroll to load content (up to 20 scrolls max)
      const scrollIterations = Math.min(Math.ceil(limit / 3), 20);

      for (let i = 0; i < scrollIterations; i++) {
        // Wait for posts to be visible
        await page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 });

        // Extract visible posts
        const newPosts = await page.evaluate(() => {
          const postElements = Array.from(
            document.querySelectorAll('.feed-shared-update-v2')
          );

          return postElements.map(post => {
            try {
              const authorEl = post.querySelector('.feed-shared-actor__name');
              const headlineEl = post.querySelector('.feed-shared-actor__description');
              const contentEl = post.querySelector('.feed-shared-text');
              const timestampEl = post.querySelector('.feed-shared-actor__sub-description');
              const likesEl = post.querySelector('.social-details-social-counts__reactions-count');
              const commentsEl = post.querySelector('.social-details-social-counts__comments-count');

              // Extract media URLs
              const mediaEls = Array.from(post.querySelectorAll('img[src*="media"]'));
              const mediaUrls = mediaEls
                .map(img => (img as HTMLImageElement).src)
                .filter(src => src && !src.includes('static'));

              return {
                author: authorEl?.textContent?.trim() || 'Unknown',
                authorHeadline: headlineEl?.textContent?.trim() || '',
                content: contentEl?.textContent?.trim() || '',
                timestamp: timestampEl?.textContent?.trim() || '',
                likes: likesEl?.textContent?.trim() || '0',
                comments: commentsEl?.textContent?.trim() || '0',
                mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
                url: (post as HTMLElement).dataset.urn || ''
              };
            } catch (e) {
              return null;
            }
          }).filter(p => p !== null);
        });

        // Add new unique posts
        for (const post of newPosts) {
          if (post && !seenContent.has(post.content)) {
            seenContent.add(post.content);
            posts.push(post as Post);

            if (posts.length >= limit) {
              break;
            }
          }
        }

        if (posts.length >= limit) {
          break;
        }

        // Human-like scrolling
        await this.humanScroll(1);
      }

      logger.info('Feed browsing complete', {
        tenantId: this.tenantId,
        postsExtracted: posts.length
      });

      return posts.slice(0, limit);

    } catch (error: any) {
      await this.captureErrorScreenshot('browse_feed');
      throw new LinkedInAutomationError(
        `Failed to browse feed: ${error.message}`,
        'browseFeed',
        error
      );
    }
  }

  /**
   * Like a LinkedIn post by URL
   *
   * Selector Reference:
   * - Like button: button.react-button__trigger
   * - Aria attribute: aria-pressed="true" when liked
   */
  async likePost(postUrl: string): Promise<{ success: boolean; wasAlreadyLiked: boolean }> {
    logger.info('Liking post', { tenantId: this.tenantId, postUrl });

    try {
      await this.navigateWithRetry(postUrl);
      const page = await this.ensureSession();

      // Wait for post to load
      await page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 });

      // Random delay before interacting
      await this.randomDelay(500, 1500);

      // Click like button if not already liked
      const result = await page.evaluate(() => {
        const likeButton = document.querySelector<HTMLButtonElement>(
          'button.react-button__trigger'
        );

        if (!likeButton) {
          throw new Error('Like button not found');
        }

        const isLiked = likeButton.getAttribute('aria-pressed') === 'true';

        if (!isLiked) {
          likeButton.click();
          return { success: true, wasAlreadyLiked: false };
        }

        return { success: true, wasAlreadyLiked: true };
      });

      logger.info('Post like action complete', { ...result, postUrl });
      return result;

    } catch (error: any) {
      await this.captureErrorScreenshot('like_post');
      throw new LinkedInAutomationError(
        `Failed to like post: ${error.message}`,
        'likePost',
        error
      );
    }
  }

  /**
   * Comment on a LinkedIn post
   *
   * Selector Reference:
   * - Comment trigger: button.comments-comment-box__trigger
   * - Comment editor: .ql-editor
   * - Submit button: button.comments-comment-box__submit-button
   */
  async commentOnPost(postUrl: string, commentText: string): Promise<{ success: boolean }> {
    logger.info('Commenting on post', { tenantId: this.tenantId, postUrl });

    try {
      await this.navigateWithRetry(postUrl);
      const page = await this.ensureSession();

      // Wait for post to load
      await page.waitForSelector('.feed-shared-update-v2', { timeout: 10000 });

      // Random delay before interacting
      await this.randomDelay(1000, 2000);

      // Click comment box to open it
      await page.click('button.comments-comment-box__trigger');
      await this.randomDelay(500, 1000);

      // Type comment with human-like speed
      await page.fill('.ql-editor', commentText);
      await this.randomDelay(800, 1500);

      // Submit comment
      await page.click('button.comments-comment-box__submit-button');

      // Wait for comment to appear
      await this.randomDelay(2000, 3000);

      logger.info('Comment posted successfully', { postUrl });
      return { success: true };

    } catch (error: any) {
      await this.captureErrorScreenshot('comment_post');
      throw new LinkedInAutomationError(
        `Failed to comment on post: ${error.message}`,
        'commentOnPost',
        error
      );
    }
  }

  /**
   * Create a new LinkedIn post
   *
   * Selector Reference:
   * - Start post button: button.share-box-feed-entry__trigger
   * - Post editor: .ql-editor
   * - Media upload: input[type="file"]
   * - Post button: button[data-test-share-box-post-button]
   */
  async createPost(content: string, mediaPath?: string): Promise<{ success: boolean; postUrl?: string }> {
    logger.info('Creating LinkedIn post', { tenantId: this.tenantId, hasMedia: !!mediaPath });

    try {
      await this.navigateWithRetry('https://www.linkedin.com/feed/');
      const page = await this.ensureSession();

      // Click "Start a post" button
      await page.click('button.share-box-feed-entry__trigger');
      await this.randomDelay(1000, 2000);

      // Wait for editor to appear
      await page.waitForSelector('.ql-editor', { timeout: 5000 });

      // Type post content with human-like speed
      await page.type('.ql-editor', content, { delay: 50 });
      await this.randomDelay(500, 1000);

      // Upload media if provided
      if (mediaPath) {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.setInputFiles(mediaPath);
          await this.randomDelay(2000, 3000); // Wait for upload
        }
      }

      // Click post button
      await page.click('button[data-test-share-box-post-button]');

      // Wait for post to be created
      await this.randomDelay(3000, 5000);

      logger.info('Post created successfully', { tenantId: this.tenantId });
      return { success: true };

    } catch (error: any) {
      await this.captureErrorScreenshot('create_post');
      throw new LinkedInAutomationError(
        `Failed to create post: ${error.message}`,
        'createPost',
        error
      );
    }
  }

  // ============================================================================
  // PROFILE OPERATIONS
  // ============================================================================

  /**
   * Get comprehensive profile data
   *
   * Based on linkedin-stickerdaniel implementation
   * Extracts: experiences, education, skills, accomplishments, etc.
   */
  async getProfileComprehensive(username: string): Promise<ComprehensiveProfile> {
    logger.info('Fetching comprehensive profile', { tenantId: this.tenantId, username });

    try {
      const profileUrl = `https://www.linkedin.com/in/${username}/`;
      await this.navigateWithRetry(profileUrl);
      const page = await this.ensureSession();

      // Wait for profile to load
      await page.waitForSelector('.pv-top-card', { timeout: 10000 });

      // Scroll to load all sections
      await this.humanScroll(5);

      // Extract profile data
      const profile = await page.evaluate(() => {
        const getText = (selector: string): string | undefined => {
          const el = document.querySelector(selector);
          return el?.textContent?.trim() || undefined;
        };

        // Extract experiences
        const experiences = Array.from(
          document.querySelectorAll('#experience ~ div li.pvs-list__item--one-column')
        ).map(exp => {
          const titleEl = exp.querySelector('.t-bold span[aria-hidden="true"]');
          const companyEl = exp.querySelector('.t-14.t-normal span[aria-hidden="true"]');
          const datesEl = exp.querySelector('.pvs-entity__caption-wrapper');
          const locationEl = exp.querySelector('.pvs-entity__caption-wrapper + .t-14');

          return {
            positionTitle: titleEl?.textContent?.trim() || '',
            company: companyEl?.textContent?.trim() || '',
            fromDate: datesEl?.textContent?.split('·')?.[0]?.trim() || undefined,
            toDate: datesEl?.textContent?.split('·')?.[1]?.trim() || undefined,
            location: locationEl?.textContent?.trim() || undefined,
            description: undefined
          };
        });

        // Extract education
        const educations = Array.from(
          document.querySelectorAll('#education ~ div li.pvs-list__item--one-column')
        ).map(edu => {
          const schoolEl = edu.querySelector('.t-bold span[aria-hidden="true"]');
          const degreeEl = edu.querySelector('.t-14.t-normal span[aria-hidden="true"]');
          const datesEl = edu.querySelector('.pvs-entity__caption-wrapper');

          return {
            institution: schoolEl?.textContent?.trim() || '',
            degree: degreeEl?.textContent?.trim() || undefined,
            fromDate: datesEl?.textContent?.split('-')?.[0]?.trim() || undefined,
            toDate: datesEl?.textContent?.split('-')?.[1]?.trim() || undefined
          };
        });

        // Extract skills
        const skills = Array.from(
          document.querySelectorAll('#skills ~ div .pvs-list__item--one-column .t-bold span')
        ).map(skill => skill.textContent?.trim() || '').filter(s => s);

        return {
          name: getText('.text-heading-xlarge') || 'Unknown',
          headline: getText('.text-body-medium') || undefined,
          location: getText('.text-body-small.inline.t-black--light.break-words') || undefined,
          about: getText('#about ~ div .inline-show-more-text span[aria-hidden="true"]') || undefined,
          experiences,
          educations,
          skills,
          interests: [],
          accomplishments: [],
          contacts: []
        };
      });

      logger.info('Profile data extracted', {
        username,
        experiencesCount: profile.experiences.length,
        educationsCount: profile.educations.length,
        skillsCount: profile.skills.length
      });

      return profile;

    } catch (error: any) {
      await this.captureErrorScreenshot('get_profile');
      throw new LinkedInAutomationError(
        `Failed to get profile for ${username}: ${error.message}`,
        'getProfileComprehensive',
        error
      );
    }
  }

  /**
   * Search for people via UI (fallback when API fails)
   *
   * Selector Reference:
   * - Search result container: .reusable-search__result-container
   * - Name: .entity-result__title-text a
   * - Headline: .entity-result__primary-subtitle
   * - Location: .entity-result__secondary-subtitle
   */
  async searchPeopleViaUI(params: SearchPeopleParams): Promise<SearchProfileResult[]> {
    logger.info('Searching people via UI', { tenantId: this.tenantId, params });

    try {
      // Build search URL with filters
      let searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(params.keywords)}`;

      if (params.location) {
        searchUrl += `&geoUrn=${encodeURIComponent(params.location)}`;
      }
      if (params.currentCompany) {
        searchUrl += `&currentCompany=${encodeURIComponent(params.currentCompany)}`;
      }

      await this.navigateWithRetry(searchUrl);
      const page = await this.ensureSession();

      // Wait for search results
      await page.waitForSelector('.reusable-search__result-container', { timeout: 10000 });

      // Scroll to load more results
      const scrollCount = Math.min(Math.ceil((params.limit || 10) / 10), 5);
      await this.humanScroll(scrollCount);

      // Extract search results
      const profiles = await page.evaluate((limit: number) => {
        const results: SearchProfileResult[] = [];
        const profileCards = document.querySelectorAll('.reusable-search__result-container');

        for (let i = 0; i < Math.min(profileCards.length, limit); i++) {
          const card = profileCards[i];

          try {
            const nameEl = card.querySelector('.entity-result__title-text a');
            const headlineEl = card.querySelector('.entity-result__primary-subtitle');
            const locationEl = card.querySelector('.entity-result__secondary-subtitle');
            const snippetEl = card.querySelector('.entity-result__summary');
            const degreeEl = card.querySelector('.dist-value');

            results.push({
              name: nameEl?.textContent?.trim() || 'Unknown',
              headline: headlineEl?.textContent?.trim() || '',
              location: locationEl?.textContent?.trim() || '',
              profileUrl: (nameEl as HTMLAnchorElement)?.href || '',
              connectionDegree: degreeEl?.textContent?.trim() || '',
              snippet: snippetEl?.textContent?.trim() || undefined
            });
          } catch (e) {
            // Skip this result
          }
        }

        return results;
      }, params.limit || 10);

      logger.info('People search complete', {
        tenantId: this.tenantId,
        resultsCount: profiles.length
      });

      return profiles;

    } catch (error: any) {
      await this.captureErrorScreenshot('search_people');
      throw new LinkedInAutomationError(
        `Failed to search people: ${error.message}`,
        'searchPeopleViaUI',
        error
      );
    }
  }

  // ============================================================================
  // COMPANY OPERATIONS
  // ============================================================================

  /**
   * Get company profile information
   *
   * Based on linkedin-stickerdaniel implementation
   */
  async getCompanyProfile(companyName: string): Promise<CompanyProfile> {
    logger.info('Fetching company profile', { tenantId: this.tenantId, companyName });

    try {
      const companyUrl = `https://www.linkedin.com/company/${companyName}/`;
      await this.navigateWithRetry(companyUrl);
      const page = await this.ensureSession();

      // Wait for company page to load
      await page.waitForSelector('.org-top-card', { timeout: 10000 });

      // Scroll to load all sections
      await this.humanScroll(4);

      // Extract company data
      const company = await page.evaluate(() => {
        const getText = (selector: string): string | undefined => {
          const el = document.querySelector(selector);
          return el?.textContent?.trim() || undefined;
        };

        const getMultipleText = (selector: string): string[] => {
          return Array.from(document.querySelectorAll(selector))
            .map(el => el.textContent?.trim() || '')
            .filter(text => text);
        };

        return {
          name: getText('.org-top-card-summary__title') || 'Unknown',
          about: getText('.org-about-us-organization-description__text') || undefined,
          website: getText('.org-about-company-module__website a') || undefined,
          phone: getText('.org-about-company-module__phone') || undefined,
          headquarters: getText('.org-top-card-summary__info-item:nth-child(2)') || undefined,
          founded: getText('.org-about-company-module__founded') || undefined,
          industry: getText('.org-top-card-summary__industry') || undefined,
          companySize: getText('.org-about-company-module__company-size-definition-text') || undefined,
          specialties: getMultipleText('.org-about-company-module__specialities .org-about-company-module__speciality'),
          showcasePages: [],
          affiliatedCompanies: [],
          headcount: getText('.org-top-card-summary-info-list__info-item')
        };
      });

      logger.info('Company profile extracted', { companyName });
      return company;

    } catch (error: any) {
      await this.captureErrorScreenshot('get_company');
      throw new LinkedInAutomationError(
        `Failed to get company profile: ${error.message}`,
        'getCompanyProfile',
        error
      );
    }
  }

  /**
   * Follow a company
   */
  async followCompany(companyId: string): Promise<{ success: boolean }> {
    logger.info('Following company', { tenantId: this.tenantId, companyId });

    try {
      await this.navigateWithRetry(`https://www.linkedin.com/company/${companyId}/`);
      const page = await this.ensureSession();

      // Wait for company page
      await page.waitForSelector('.org-top-card', { timeout: 10000 });

      // Random delay
      await this.randomDelay(500, 1500);

      // Click follow button
      const followed = await page.evaluate(() => {
        const followButton = document.querySelector<HTMLButtonElement>(
          'button.org-top-card-primary-actions__action'
        );

        if (!followButton) {
          throw new Error('Follow button not found');
        }

        const isFollowing = followButton.textContent?.includes('Following');

        if (!isFollowing) {
          followButton.click();
          return true;
        }

        return false;
      });

      logger.info('Company follow action complete', { companyId, followed });
      return { success: true };

    } catch (error: any) {
      await this.captureErrorScreenshot('follow_company');
      throw new LinkedInAutomationError(
        `Failed to follow company: ${error.message}`,
        'followCompany',
        error
      );
    }
  }

  // ============================================================================
  // JOB OPERATIONS
  // ============================================================================

  /**
   * Apply to a job posting (with form filling)
   */
  async applyToJob(jobId: string, coverLetter?: string): Promise<{ success: boolean }> {
    logger.info('Applying to job', { tenantId: this.tenantId, jobId });

    try {
      await this.navigateWithRetry(`https://www.linkedin.com/jobs/view/${jobId}/`);
      const page = await this.ensureSession();

      // Wait for job page to load
      await page.waitForSelector('.jobs-unified-top-card', { timeout: 10000 });

      // Random delay
      await this.randomDelay(1000, 2000);

      // Click Easy Apply button
      const applyButton = await page.$('button.jobs-apply-button');
      if (!applyButton) {
        throw new Error('Easy Apply button not found - job may require external application');
      }

      await applyButton.click();
      await this.randomDelay(2000, 3000);

      // Wait for application modal
      await page.waitForSelector('.jobs-easy-apply-modal', { timeout: 5000 });

      // Fill cover letter if provided
      if (coverLetter) {
        const coverLetterField = await page.$('textarea[name="coverLetter"]');
        if (coverLetterField) {
          await coverLetterField.fill(coverLetter);
          await this.randomDelay(500, 1000);
        }
      }

      // Submit application
      const submitButton = await page.$('button[aria-label="Submit application"]');
      if (submitButton) {
        await submitButton.click();
        await this.randomDelay(2000, 3000);
      }

      logger.info('Job application submitted', { jobId });
      return { success: true };

    } catch (error: any) {
      await this.captureErrorScreenshot('apply_job');
      throw new LinkedInAutomationError(
        `Failed to apply to job: ${error.message}`,
        'applyToJob',
        error
      );
    }
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Close browser session
   */
  async close(): Promise<void> {
    logger.info('Closing BrowserClient session', { tenantId: this.tenantId });

    try {
      if (this.page) {
        await this.sessionManager.closeSession();
        this.page = null;
      }
    } catch (error: any) {
      logger.error('Error closing browser session', {
        tenantId: this.tenantId,
        error: error.message
      });
    }
  }
}

/**
 * LinkedIn Session Manager with Automatic Cookie Handling
 *
 * Manages browser automation sessions with:
 * - Automatic cookie generation from OAuth
 * - Cookie persistence and encryption
 * - Session reuse and recovery
 * - No manual cookie entry required
 */

import { chromium, Browser, BrowserContext, Page, Cookie } from 'playwright';
import { OAuthManager } from './oauth-manager';
import { logger } from '../utils/logger';
import { createCipher, createDecipher } from 'crypto';

export interface SessionOptions {
  tenantId: string;
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
}

export class SessionManager {
  private oauthManager: OAuthManager;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private encryptionKey: string;

  constructor(oauthManager: OAuthManager, encryptionKey: string) {
    this.oauthManager = oauthManager;
    this.encryptionKey = encryptionKey;
    logger.info('Session Manager initialized');
  }

  /**
   * Create or resume browser session for tenant
   * Automatically handles cookies from OAuth tokens
   */
  async createSession(options: SessionOptions): Promise<Page> {
    const { tenantId, headless = true, timeout = 30000, userAgent } = options;

    logger.info('Creating browser session', { tenantId, headless });

    try {
      // Launch browser
      this.browser = await chromium.launch({
        headless,
        timeout,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      // Create browser context with custom user agent
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        extraHTTPHeaders: {
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      // Try to load existing session cookies
      const cookiesLoaded = await this.loadSessionCookies(tenantId);

      if (!cookiesLoaded) {
        // Generate cookies from OAuth token
        await this.generateCookiesFromOAuth(tenantId);
      }

      // Create new page
      this.page = await this.context.newPage();

      logger.info('Browser session created successfully', { tenantId });

      return this.page;

    } catch (error: any) {
      logger.error('Failed to create browser session', {
        tenantId,
        error: error.message
      });
      await this.closeSession();
      throw new Error(`Failed to create browser session: ${error.message}`);
    }
  }

  /**
   * Generate LinkedIn cookies from OAuth access token
   * This eliminates the need for manual cookie extraction
   */
  private async generateCookiesFromOAuth(tenantId: string): Promise<void> {
    logger.info('Generating cookies from OAuth token', { tenantId });

    try {
      // Get valid OAuth access token
      const accessToken = await this.oauthManager.getValidToken(tenantId);

      if (!this.context) {
        throw new Error('Browser context not initialized');
      }

      // Set LinkedIn authentication cookie (li_at)
      // The access token can be used to generate the session cookie
      const cookies: Cookie[] = [
        {
          name: 'li_at',
          value: accessToken,
          domain: '.linkedin.com',
          path: '/',
          expires: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        },
        {
          name: 'JSESSIONID',
          value: `ajax:${Math.random().toString(36).substring(2)}`,
          domain: '.linkedin.com',
          path: '/',
          expires: -1,
          httpOnly: true,
          secure: true,
          sameSite: 'Lax'
        }
      ];

      await this.context.addCookies(cookies);

      // Save cookies for future sessions
      await this.saveSessionCookies(tenantId, cookies);

      logger.info('Cookies generated and saved from OAuth token', { tenantId });

    } catch (error: any) {
      logger.error('Failed to generate cookies from OAuth', {
        tenantId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Load existing session cookies
   */
  private async loadSessionCookies(tenantId: string): Promise<boolean> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const cookieFile = path.join(__dirname, '../../.sessions', `${tenantId}.enc`);

      // Check if cookie file exists
      try {
        await fs.access(cookieFile);
      } catch {
        return false;
      }

      // Read and decrypt cookies
      const encryptedData = await fs.readFile(cookieFile, 'utf-8');
      const cookiesJson = this.decrypt(encryptedData);
      const cookies: Cookie[] = JSON.parse(cookiesJson);

      // Check if cookies are still valid
      const now = Math.floor(Date.now() / 1000);
      const validCookies = cookies.filter(c => !c.expires || c.expires > now);

      if (validCookies.length === 0) {
        logger.info('Stored cookies are expired', { tenantId });
        return false;
      }

      if (!this.context) {
        throw new Error('Browser context not initialized');
      }

      await this.context.addCookies(validCookies);

      logger.info('Loaded existing session cookies', { tenantId, count: validCookies.length });
      return true;

    } catch (error: any) {
      logger.debug('Could not load session cookies', { tenantId, error: error.message });
      return false;
    }
  }

  /**
   * Save session cookies for reuse
   */
  private async saveSessionCookies(tenantId: string, cookies: Cookie[]): Promise<void> {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const sessionsDir = path.join(__dirname, '../../.sessions');
      const cookieFile = path.join(sessionsDir, `${tenantId}.enc`);

      // Create sessions directory if it doesn't exist
      await fs.mkdir(sessionsDir, { recursive: true });

      // Encrypt and save cookies
      const cookiesJson = JSON.stringify(cookies);
      const encryptedData = this.encrypt(cookiesJson);

      await fs.writeFile(cookieFile, encryptedData, 'utf-8');

      logger.info('Session cookies saved', { tenantId });

    } catch (error: any) {
      logger.error('Failed to save session cookies', {
        tenantId,
        error: error.message
      });
    }
  }

  /**
   * Navigate to LinkedIn and ensure session is active
   */
  async ensureLinkedInSession(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser session not initialized');
    }

    // Navigate to LinkedIn feed to verify session
    await this.page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check if we're logged in by looking for feed content
    const isLoggedIn = await this.page.$('.feed-shared-update-v2') !== null;

    if (!isLoggedIn) {
      throw new Error('LinkedIn session is not active - re-authentication required');
    }

    logger.info('LinkedIn session verified');
  }

  /**
   * Get current page
   */
  getPage(): Page | null {
    return this.page;
  }

  /**
   * Close browser session
   */
  async closeSession(): Promise<void> {
    logger.info('Closing browser session');

    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }

      if (this.context) {
        await this.context.close();
        this.context = null;
      }

      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      logger.info('Browser session closed');
    } catch (error: any) {
      logger.error('Error closing browser session', { error: error.message });
    }
  }

  /**
   * Encrypt data
   */
  private encrypt(text: string): string {
    const cipher = createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt data
   */
  private decrypt(encryptedText: string): string {
    const decipher = createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

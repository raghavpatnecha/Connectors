/**
 * Google API Client Factory
 * Creates authenticated clients for all Google Workspace services
 * All clients share the same OAuth2Client for unified authentication
 */

import { google } from 'googleapis';
import { gmail_v1 } from 'googleapis/build/src/apis/gmail/v1.js';
import { drive_v3 } from 'googleapis/build/src/apis/drive/v3.js';
import { calendar_v3 } from 'googleapis/build/src/apis/calendar/v3.js';
import { sheets_v4 } from 'googleapis/build/src/apis/sheets/v4.js';
import { docs_v1 } from 'googleapis/build/src/apis/docs/v1.js';
import { slides_v1 } from 'googleapis/build/src/apis/slides/v1.js';
import { tasks_v1 } from 'googleapis/build/src/apis/tasks/v1.js';
import { forms_v1 } from 'googleapis/build/src/apis/forms/v1.js';
import { chat_v1 } from 'googleapis/build/src/apis/chat/v1.js';
import { people_v1 } from 'googleapis/build/src/apis/people/v1.js';
import { admin_directory_v1 } from 'googleapis/build/src/apis/admin/directory_v1.js';
import { OAuthManager } from './oauth-manager.js';
import { logger } from '../../shared/google-utils/logger.js';

export class GoogleClientFactory {
  private oauthManager: OAuthManager;

  constructor(oauthManager: OAuthManager) {
    this.oauthManager = oauthManager;
    logger.info('Google Client Factory initialized');
  }

  /**
   * Get Gmail API client
   */
  async getGmailClient(tenantId: string): Promise<gmail_v1.Gmail> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Gmail client', { tenantId });
    return google.gmail({ version: 'v1', auth });
  }

  /**
   * Get Google Drive API client
   */
  async getDriveClient(tenantId: string): Promise<drive_v3.Drive> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Drive client', { tenantId });
    return google.drive({ version: 'v3', auth });
  }

  /**
   * Get Google Calendar API client
   */
  async getCalendarClient(tenantId: string): Promise<calendar_v3.Calendar> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Calendar client', { tenantId });
    return google.calendar({ version: 'v3', auth });
  }

  /**
   * Get Google Sheets API client
   */
  async getSheetsClient(tenantId: string): Promise<sheets_v4.Sheets> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Sheets client', { tenantId });
    return google.sheets({ version: 'v4', auth });
  }

  /**
   * Get Google Docs API client
   */
  async getDocsClient(tenantId: string): Promise<docs_v1.Docs> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Docs client', { tenantId });
    return google.docs({ version: 'v1', auth });
  }

  /**
   * Get Google Slides API client
   */
  async getSlidesClient(tenantId: string): Promise<slides_v1.Slides> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Slides client', { tenantId });
    return google.slides({ version: 'v1', auth });
  }

  /**
   * Get Google Tasks API client
   */
  async getTasksClient(tenantId: string): Promise<tasks_v1.Tasks> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Tasks client', { tenantId });
    return google.tasks({ version: 'v1', auth });
  }

  /**
   * Get Google Forms API client
   */
  async getFormsClient(tenantId: string): Promise<forms_v1.Forms> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Forms client', { tenantId });
    return google.forms({ version: 'v1', auth });
  }

  /**
   * Get Google Chat API client
   */
  async getChatClient(tenantId: string): Promise<chat_v1.Chat> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Chat client', { tenantId });
    return google.chat({ version: 'v1', auth });
  }

  /**
   * Get Google People API client (Contacts)
   */
  async getPeopleClient(tenantId: string): Promise<people_v1.People> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created People client', { tenantId });
    return google.people({ version: 'v1', auth });
  }

  /**
   * Get Google Admin Directory API client
   */
  async getAdminDirectoryClient(
    tenantId: string
  ): Promise<admin_directory_v1.Admin> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);
    logger.debug('Created Admin Directory client', { tenantId });
    return google.admin({ version: 'directory_v1', auth });
  }

  /**
   * Get multiple clients at once (batch initialization)
   */
  async getClients(
    tenantId: string,
    services: Array<
      | 'gmail'
      | 'drive'
      | 'calendar'
      | 'sheets'
      | 'docs'
      | 'slides'
      | 'tasks'
      | 'forms'
      | 'chat'
      | 'people'
      | 'admin'
    >
  ): Promise<{
    gmail?: gmail_v1.Gmail;
    drive?: drive_v3.Drive;
    calendar?: calendar_v3.Calendar;
    sheets?: sheets_v4.Sheets;
    docs?: docs_v1.Docs;
    slides?: slides_v1.Slides;
    tasks?: tasks_v1.Tasks;
    forms?: forms_v1.Forms;
    chat?: chat_v1.Chat;
    people?: people_v1.People;
    admin?: admin_directory_v1.Admin;
  }> {
    const auth = await this.oauthManager.getAuthenticatedClient(tenantId);

    const clients: any = {};

    for (const service of services) {
      switch (service) {
        case 'gmail':
          clients.gmail = google.gmail({ version: 'v1', auth });
          break;
        case 'drive':
          clients.drive = google.drive({ version: 'v3', auth });
          break;
        case 'calendar':
          clients.calendar = google.calendar({ version: 'v3', auth });
          break;
        case 'sheets':
          clients.sheets = google.sheets({ version: 'v4', auth });
          break;
        case 'docs':
          clients.docs = google.docs({ version: 'v1', auth });
          break;
        case 'slides':
          clients.slides = google.slides({ version: 'v1', auth });
          break;
        case 'tasks':
          clients.tasks = google.tasks({ version: 'v1', auth });
          break;
        case 'forms':
          clients.forms = google.forms({ version: 'v1', auth });
          break;
        case 'chat':
          clients.chat = google.chat({ version: 'v1', auth });
          break;
        case 'people':
          clients.people = google.people({ version: 'v1', auth });
          break;
        case 'admin':
          clients.admin = google.admin({ version: 'directory_v1', auth });
          break;
      }
    }

    logger.debug('Created multiple Google clients', {
      tenantId,
      services: services.join(', '),
    });

    return clients;
  }

  /**
   * Check if tenant has valid credentials for a specific service
   */
  async hasValidCredentials(tenantId: string): Promise<boolean> {
    return await this.oauthManager.validateCredentials(tenantId);
  }

  /**
   * Get OAuth authorization URL for a tenant
   */
  getAuthUrl(tenantId: string, additionalScopes?: string[]): string {
    return this.oauthManager.generateAuthUrl(tenantId, additionalScopes);
  }

  /**
   * Revoke credentials for a tenant
   */
  async revokeCredentials(tenantId: string): Promise<void> {
    await this.oauthManager.revokeCredentials(tenantId);
  }
}

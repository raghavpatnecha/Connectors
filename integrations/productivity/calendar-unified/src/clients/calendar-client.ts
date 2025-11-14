/**
 * Google Calendar Client Factory
 * Handles OAuth credentials via gateway and creates authenticated Calendar API clients
 */

import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface CalendarClientConfig {
  accessToken: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
}

export class GoogleCalendarClientFactory {
  /**
   * Create an authenticated Google Calendar client
   * Credentials are injected by the MCP gateway OAuth proxy
   */
  async getCalendarClient(tenantId: string, accessToken: string): Promise<calendar_v3.Calendar> {
    const auth = new OAuth2Client();
    auth.setCredentials({
      access_token: accessToken,
    });

    return google.calendar({ version: 'v3', auth });
  }

  /**
   * Create OAuth2 client for direct use
   */
  createOAuth2Client(config: CalendarClientConfig): OAuth2Client {
    const oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret
    );

    oauth2Client.setCredentials({
      access_token: config.accessToken,
      refresh_token: config.refreshToken,
    });

    return oauth2Client;
  }
}

export const calendarClientFactory = new GoogleCalendarClientFactory();

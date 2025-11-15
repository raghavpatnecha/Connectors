/**
 * Google Drive Client Factory
 * Handles OAuth2 authentication and Drive API client creation using shared google-auth
 */

import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { OAuthManager } from '../../../shared/google-auth/oauth-manager';

export class GoogleClientFactory {
  private readonly _driveClients: Map<string, drive_v3.Drive> = new Map();

  constructor(private readonly _oauthManager: OAuthManager) {}

  /**
   * Get or create Drive client for a tenant
   */
  async getDriveClient(tenantId: string): Promise<drive_v3.Drive> {
    // Check cache first
    let driveClient = this._driveClients.get(tenantId);

    if (!driveClient) {
      try {
        // Get authenticated OAuth2 client from manager
        const oauth2Client = await this._oauthManager.getAuthenticatedClient(tenantId);

        // Create Drive client with authenticated client
        driveClient = google.drive({ version: 'v3', auth: oauth2Client });

        // Cache the client
        this._driveClients.set(tenantId, driveClient);
      } catch (error: any) {
        console.error(`Failed to create Drive client for tenant ${tenantId}:`, error.message);
        throw new Error(`Authentication failed for tenant ${tenantId}: ${error.message}`);
      }
    }

    return driveClient;
  }

  /**
   * Clear cached client for tenant (e.g., after token refresh)
   */
  clearClient(tenantId: string): void {
    this._driveClients.delete(tenantId);
  }

  /**
   * Clear all cached clients
   */
  clearAllClients(): void {
    this._driveClients.clear();
  }
}

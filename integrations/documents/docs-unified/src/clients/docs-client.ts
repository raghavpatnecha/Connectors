/**
 * Google Docs MCP - Docs Client
 * Wrapper around Google Docs API client
 */

import { google, docs_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';

/**
 * Docs API Client
 * Provides authenticated access to Google Docs API
 */
export class DocsClient {
  private _client: docs_v1.Docs;

  constructor(auth: OAuth2Client) {
    this._client = google.docs({ version: 'v1', auth });
    logger.debug('DocsClient initialized');
  }

  /**
   * Get the underlying Google Docs API client
   */
  get api(): docs_v1.Docs {
    return this._client;
  }

  /**
   * Create a new document
   */
  async createDocument(title: string): Promise<docs_v1.Schema$Document> {
    const response = await this._client.documents.create({
      requestBody: { title }
    });
    return response.data;
  }

  /**
   * Get a document
   */
  async getDocument(documentId: string): Promise<docs_v1.Schema$Document> {
    const response = await this._client.documents.get({ documentId });
    return response.data;
  }

  /**
   * Batch update a document
   */
  async batchUpdate(
    documentId: string,
    requests: docs_v1.Schema$Request[]
  ): Promise<docs_v1.Schema$BatchUpdateDocumentResponse> {
    const response = await this._client.documents.batchUpdate({
      documentId,
      requestBody: { requests }
    });
    return response.data;
  }
}

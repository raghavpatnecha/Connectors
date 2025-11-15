/**
 * Google Sheets MCP - Sheets Client
 * Wrapper around Google Sheets API client
 */

import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../utils/logger';

/**
 * Sheets API Client
 * Provides authenticated access to Google Sheets API
 */
export class SheetsClient {
  private _client: sheets_v4.Sheets;

  constructor(auth: OAuth2Client) {
    this._client = google.sheets({ version: 'v4', auth });
    logger.debug('SheetsClient initialized');
  }

  /**
   * Get the underlying Google Sheets API client
   */
  get api(): sheets_v4.Sheets {
    return this._client;
  }

  /**
   * Get spreadsheet metadata
   */
  async getSpreadsheet(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
    const response = await this._client.spreadsheets.get({ spreadsheetId });
    return response.data;
  }

  /**
   * Create a new spreadsheet
   */
  async createSpreadsheet(title: string, sheets?: sheets_v4.Schema$Sheet[]): Promise<sheets_v4.Schema$Spreadsheet> {
    const response = await this._client.spreadsheets.create({
      requestBody: {
        properties: { title },
        ...(sheets && { sheets })
      }
    });
    return response.data;
  }

  /**
   * Batch update spreadsheet
   */
  async batchUpdate(
    spreadsheetId: string,
    requests: sheets_v4.Schema$Request[]
  ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
    const response = await this._client.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests }
    });
    return response.data;
  }

  /**
   * Get values from a range
   */
  async getValues(spreadsheetId: string, range: string): Promise<sheets_v4.Schema$ValueRange> {
    const response = await this._client.spreadsheets.values.get({
      spreadsheetId,
      range
    });
    return response.data;
  }

  /**
   * Update values in a range
   */
  async updateValues(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<sheets_v4.Schema$UpdateValuesResponse> {
    const response = await this._client.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: { values }
    });
    return response.data;
  }

  /**
   * Append values to a sheet
   */
  async appendValues(
    spreadsheetId: string,
    range: string,
    values: any[][],
    valueInputOption: 'RAW' | 'USER_ENTERED' = 'USER_ENTERED'
  ): Promise<sheets_v4.Schema$AppendValuesResponse> {
    const response = await this._client.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: { values }
    });
    return response.data;
  }

  /**
   * Clear values from a range
   */
  async clearValues(spreadsheetId: string, range: string): Promise<sheets_v4.Schema$ClearValuesResponse> {
    const response = await this._client.spreadsheets.values.clear({
      spreadsheetId,
      range,
      requestBody: {}
    });
    return response.data;
  }
}

/**
 * Google Sheets MCP - Spreadsheet Management Tools
 * Tools for managing spreadsheets and sheets
 */

import { z } from 'zod';
import { sheets_v4, drive_v3 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all spreadsheet management tools
 */
export function registerSpreadsheetTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // List spreadsheets
  registry.registerTool(
    'sheets_list_spreadsheets',
    'List all Google Sheets spreadsheets accessible to the user',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      maxResults: z.number().int().min(1).max(1000).optional().describe('Maximum number of spreadsheets (default: 25)')
    }),
    async (args) => {
      try {
        const driveClient = await clientFactory.getDriveClient(args.tenantId);

        const response = await driveClient.files.list({
          q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
          pageSize: args.maxResults || 25,
          fields: 'files(id, name, modifiedTime, webViewLink)',
          orderBy: 'modifiedTime desc',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true
        });

        const spreadsheets = (response.data.files || []).map(file => ({
          id: file.id,
          name: file.name,
          modifiedTime: file.modifiedTime,
          link: file.webViewLink
        }));

        logger.info('Listed spreadsheets', {
          tenantId: args.tenantId,
          count: spreadsheets.length
        });

        return {
          totalSpreadsheets: spreadsheets.length,
          spreadsheets
        };
      } catch (error: any) {
        logger.error('Failed to list spreadsheets', {
          tenantId: args.tenantId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Get spreadsheet info
  registry.registerTool(
    'sheets_get_spreadsheet_info',
    'Get metadata and sheet list for a specific spreadsheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.get({
          spreadsheetId: args.spreadsheetId
        });

        const sheets = (response.data.sheets || []).map(sheet => ({
          sheetId: sheet.properties?.sheetId,
          title: sheet.properties?.title,
          index: sheet.properties?.index,
          rowCount: sheet.properties?.gridProperties?.rowCount,
          columnCount: sheet.properties?.gridProperties?.columnCount,
          frozen: {
            rows: sheet.properties?.gridProperties?.frozenRowCount,
            columns: sheet.properties?.gridProperties?.frozenColumnCount
          }
        }));

        const result = {
          spreadsheetId: response.data.spreadsheetId,
          title: response.data.properties?.title,
          locale: response.data.properties?.locale,
          timeZone: response.data.properties?.timeZone,
          totalSheets: sheets.length,
          sheets,
          link: response.data.spreadsheetUrl
        };

        logger.info('Retrieved spreadsheet info', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          totalSheets: sheets.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get spreadsheet info', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Create spreadsheet
  registry.registerTool(
    'sheets_create_spreadsheet',
    'Create a new Google Sheets spreadsheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      title: z.string().describe('Title of the spreadsheet'),
      sheetTitles: z.array(z.string()).optional().describe('Titles for initial sheets (default: one sheet named "Sheet1")')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const sheets: sheets_v4.Schema$Sheet[] = (args.sheetTitles || ['Sheet1']).map((title, index) => ({
          properties: {
            title,
            index,
            gridProperties: {
              rowCount: 1000,
              columnCount: 26
            }
          }
        }));

        const response = await client.spreadsheets.create({
          requestBody: {
            properties: {
              title: args.title
            },
            sheets
          }
        });

        const result = {
          spreadsheetId: response.data.spreadsheetId,
          title: response.data.properties?.title,
          totalSheets: response.data.sheets?.length || 0,
          link: response.data.spreadsheetUrl
        };

        logger.info('Created spreadsheet', {
          tenantId: args.tenantId,
          spreadsheetId: response.data.spreadsheetId,
          title: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create spreadsheet', {
          tenantId: args.tenantId,
          title: args.title,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Create sheet (add sheet to existing spreadsheet)
  registry.registerTool(
    'sheets_create_sheet',
    'Add a new sheet to an existing spreadsheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      title: z.string().describe('Title for the new sheet'),
      rowCount: z.number().int().min(1).optional().describe('Number of rows (default: 1000)'),
      columnCount: z.number().int().min(1).optional().describe('Number of columns (default: 26)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              addSheet: {
                properties: {
                  title: args.title,
                  gridProperties: {
                    rowCount: args.rowCount || 1000,
                    columnCount: args.columnCount || 26
                  }
                }
              }
            }]
          }
        });

        const addedSheet = response.data.replies?.[0]?.addSheet;

        const result = {
          spreadsheetId: args.spreadsheetId,
          sheetId: addedSheet?.properties?.sheetId,
          title: addedSheet?.properties?.title,
          rowCount: addedSheet?.properties?.gridProperties?.rowCount,
          columnCount: addedSheet?.properties?.gridProperties?.columnCount
        };

        logger.info('Created sheet', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          sheetId: addedSheet?.properties?.sheetId,
          title: args.title
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to create sheet', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          title: args.title,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Delete sheet
  registry.registerTool(
    'sheets_delete_sheet',
    'Delete a sheet from a spreadsheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('ID of the sheet to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              deleteSheet: {
                sheetId: args.sheetId
              }
            }]
          }
        });

        logger.info('Deleted sheet', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          sheetId: args.sheetId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          deletedSheetId: args.sheetId
        };
      } catch (error: any) {
        logger.error('Failed to delete sheet', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          sheetId: args.sheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Copy sheet
  registry.registerTool(
    'sheets_copy_sheet',
    'Copy a sheet within the same spreadsheet or to another spreadsheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the source spreadsheet'),
      sheetId: z.number().int().describe('ID of the sheet to copy'),
      destinationSpreadsheetId: z.string().optional().describe('ID of destination spreadsheet (default: same spreadsheet)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.sheets.copyTo({
          spreadsheetId: args.spreadsheetId,
          sheetId: args.sheetId,
          requestBody: {
            destinationSpreadsheetId: args.destinationSpreadsheetId || args.spreadsheetId
          }
        });

        const result = {
          spreadsheetId: args.destinationSpreadsheetId || args.spreadsheetId,
          copiedSheetId: response.data.sheetId,
          copiedSheetTitle: response.data.title
        };

        logger.info('Copied sheet', {
          tenantId: args.tenantId,
          sourceSpreadsheetId: args.spreadsheetId,
          sourceSheetId: args.sheetId,
          copiedSheetId: response.data.sheetId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to copy sheet', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          sheetId: args.sheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Batch update spreadsheet
  registry.registerTool(
    'sheets_batch_update',
    'Execute multiple spreadsheet operations in a single batch',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      requests: z.array(z.any()).describe('Array of batch update requests (Google Sheets API format)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: args.requests
          }
        });

        const result = {
          spreadsheetId: args.spreadsheetId,
          updatedSpreadsheetId: response.data.spreadsheetId,
          repliesCount: response.data.replies?.length || 0,
          replies: response.data.replies
        };

        logger.info('Executed batch update', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          requestsCount: args.requests.length,
          repliesCount: result.repliesCount
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to execute batch update', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );
}

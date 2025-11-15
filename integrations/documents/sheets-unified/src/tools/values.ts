/**
 * Google Sheets MCP - Values Operations Tools
 * Tools for reading and writing cell values
 */

import { z } from 'zod';
import { sheets_v4 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all values operation tools (15 tools)
 */
export function registerValuesTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Get values
  registry.registerTool(
    'sheets_get_values',
    'Read values from a specific range in a sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      range: z.string().describe('Range in A1 notation (e.g., "Sheet1!A1:D10" or "A1:D10")')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.values.get({
          spreadsheetId: args.spreadsheetId,
          range: args.range
        });

        const result = {
          range: response.data.range,
          majorDimension: response.data.majorDimension,
          values: response.data.values || [],
          rowCount: (response.data.values || []).length,
          columnCount: (response.data.values?.[0] || []).length
        };

        logger.info('Retrieved values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          range: args.range,
          rowCount: result.rowCount
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          range: args.range,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Batch get values
  registry.registerTool(
    'sheets_batch_get_values',
    'Read values from multiple ranges in a single request',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      ranges: z.array(z.string()).describe('Array of ranges in A1 notation')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.values.batchGet({
          spreadsheetId: args.spreadsheetId,
          ranges: args.ranges
        });

        const valueRanges = (response.data.valueRanges || []).map(vr => ({
          range: vr.range,
          values: vr.values || [],
          rowCount: (vr.values || []).length
        }));

        logger.info('Batch retrieved values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          rangesCount: args.ranges.length
        });

        return {
          spreadsheetId: response.data.spreadsheetId,
          totalRanges: valueRanges.length,
          valueRanges
        };
      } catch (error: any) {
        logger.error('Failed to batch get values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Update values
  registry.registerTool(
    'sheets_update_values',
    'Update values in a specific range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      range: z.string().describe('Range in A1 notation'),
      values: z.array(z.array(z.any())).describe('2D array of values [[row1col1, row1col2], [row2col1, row2col2]]'),
      valueInputOption: z.enum(['RAW', 'USER_ENTERED']).optional().describe('How to interpret values (default: USER_ENTERED)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.values.update({
          spreadsheetId: args.spreadsheetId,
          range: args.range,
          valueInputOption: args.valueInputOption || 'USER_ENTERED',
          requestBody: {
            values: args.values
          }
        });

        const result = {
          updatedRange: response.data.updatedRange,
          updatedRows: response.data.updatedRows,
          updatedColumns: response.data.updatedColumns,
          updatedCells: response.data.updatedCells
        };

        logger.info('Updated values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          range: args.range,
          updatedCells: result.updatedCells
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to update values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Batch update values
  registry.registerTool(
    'sheets_batch_update_values',
    'Update multiple ranges in a single request',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      data: z.array(z.object({
        range: z.string(),
        values: z.array(z.array(z.any()))
      })).describe('Array of range-values pairs'),
      valueInputOption: z.enum(['RAW', 'USER_ENTERED']).optional()
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.values.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            valueInputOption: args.valueInputOption || 'USER_ENTERED',
            data: args.data
          }
        });

        logger.info('Batch updated values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          totalUpdates: response.data.totalUpdatedCells
        });

        return {
          spreadsheetId: args.spreadsheetId,
          totalUpdatedRanges: args.data.length,
          totalUpdatedCells: response.data.totalUpdatedCells,
          totalUpdatedRows: response.data.totalUpdatedRows,
          totalUpdatedColumns: response.data.totalUpdatedColumns
        };
      } catch (error: any) {
        logger.error('Failed to batch update values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Append values
  registry.registerTool(
    'sheets_append_values',
    'Append rows of data to the end of a sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      range: z.string().describe('Range to append to (e.g., "Sheet1!A1" or "Sheet1")'),
      values: z.array(z.array(z.any())).describe('2D array of values to append'),
      valueInputOption: z.enum(['RAW', 'USER_ENTERED']).optional(),
      insertDataOption: z.enum(['OVERWRITE', 'INSERT_ROWS']).optional().describe('How to insert data (default: INSERT_ROWS)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.values.append({
          spreadsheetId: args.spreadsheetId,
          range: args.range,
          valueInputOption: args.valueInputOption || 'USER_ENTERED',
          insertDataOption: args.insertDataOption || 'INSERT_ROWS',
          requestBody: {
            values: args.values
          }
        });

        const result = {
          spreadsheetId: response.data.spreadsheetId,
          tableRange: response.data.tableRange,
          updatedRange: response.data.updates?.updatedRange,
          updatedRows: response.data.updates?.updatedRows,
          updatedCells: response.data.updates?.updatedCells
        };

        logger.info('Appended values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          range: args.range,
          appendedRows: args.values.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to append values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Clear values
  registry.registerTool(
    'sheets_clear_values',
    'Clear values from a specific range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      range: z.string().describe('Range to clear in A1 notation')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.values.clear({
          spreadsheetId: args.spreadsheetId,
          range: args.range,
          requestBody: {}
        });

        logger.info('Cleared values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          range: args.range
        });

        return {
          spreadsheetId: response.data.spreadsheetId,
          clearedRange: response.data.clearedRange
        };
      } catch (error: any) {
        logger.error('Failed to clear values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Batch clear values
  registry.registerTool(
    'sheets_batch_clear_values',
    'Clear values from multiple ranges',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      ranges: z.array(z.string()).describe('Array of ranges to clear')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.values.batchClear({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            ranges: args.ranges
          }
        });

        logger.info('Batch cleared values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          rangesCount: args.ranges.length
        });

        return {
          spreadsheetId: response.data.spreadsheetId,
          clearedRanges: response.data.clearedRanges,
          totalCleared: response.data.clearedRanges?.length || 0
        };
      } catch (error: any) {
        logger.error('Failed to batch clear values', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Find and replace
  registry.registerTool(
    'sheets_find_replace',
    'Find and replace text or values in a spreadsheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      find: z.string().describe('Text to find'),
      replacement: z.string().describe('Replacement text'),
      sheetId: z.number().int().optional().describe('Specific sheet ID to search (default: all sheets)'),
      matchCase: z.boolean().optional().describe('Match case (default: false)'),
      matchEntireCell: z.boolean().optional().describe('Match entire cell (default: false)'),
      searchByRegex: z.boolean().optional().describe('Use regex search (default: false)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              findReplace: {
                find: args.find,
                replacement: args.replacement,
                ...(args.sheetId !== undefined && { sheetId: args.sheetId }),
                matchCase: args.matchCase || false,
                matchEntireCell: args.matchEntireCell || false,
                searchByRegex: args.searchByRegex || false,
                allSheets: args.sheetId === undefined
              }
            }]
          }
        });

        const occurrencesChanged = response.data.replies?.[0]?.findReplace?.occurrencesChanged || 0;

        logger.info('Find and replace completed', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          find: args.find,
          occurrencesChanged
        });

        return {
          spreadsheetId: args.spreadsheetId,
          occurrencesChanged,
          find: args.find,
          replacement: args.replacement
        };
      } catch (error: any) {
        logger.error('Failed to find and replace', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Copy paste
  registry.registerTool(
    'sheets_copy_paste',
    'Copy a range and paste it to another location',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sourceSheetId: z.number().int().describe('Source sheet ID'),
      sourceStartRowIndex: z.number().int().describe('Source start row (0-based)'),
      sourceEndRowIndex: z.number().int().describe('Source end row (exclusive)'),
      sourceStartColumnIndex: z.number().int().describe('Source start column (0-based)'),
      sourceEndColumnIndex: z.number().int().describe('Source end column (exclusive)'),
      destinationSheetId: z.number().int().describe('Destination sheet ID'),
      destinationStartRowIndex: z.number().int().describe('Destination start row (0-based)'),
      destinationStartColumnIndex: z.number().int().describe('Destination start column (0-based)'),
      pasteType: z.enum(['NORMAL', 'VALUES', 'FORMAT', 'NO_BORDERS', 'FORMULA', 'DATA_VALIDATION', 'CONDITIONAL_FORMATTING']).optional().describe('What to paste (default: NORMAL)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              copyPaste: {
                source: {
                  sheetId: args.sourceSheetId,
                  startRowIndex: args.sourceStartRowIndex,
                  endRowIndex: args.sourceEndRowIndex,
                  startColumnIndex: args.sourceStartColumnIndex,
                  endColumnIndex: args.sourceEndColumnIndex
                },
                destination: {
                  sheetId: args.destinationSheetId,
                  startRowIndex: args.destinationStartRowIndex,
                  startColumnIndex: args.destinationStartColumnIndex
                },
                pasteType: args.pasteType || 'NORMAL'
              }
            }]
          }
        });

        logger.info('Copy paste completed', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          sourceSheetId: args.sourceSheetId,
          destinationSheetId: args.destinationSheetId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          pasteType: args.pasteType || 'NORMAL'
        };
      } catch (error: any) {
        logger.error('Failed to copy paste', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Cut paste
  registry.registerTool(
    'sheets_cut_paste',
    'Cut a range and paste it to another location',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sourceSheetId: z.number().int().describe('Source sheet ID'),
      sourceStartRowIndex: z.number().int().describe('Source start row (0-based)'),
      sourceEndRowIndex: z.number().int().describe('Source end row (exclusive)'),
      sourceStartColumnIndex: z.number().int().describe('Source start column (0-based)'),
      sourceEndColumnIndex: z.number().int().describe('Source end column (exclusive)'),
      destinationSheetId: z.number().int().describe('Destination sheet ID'),
      destinationStartRowIndex: z.number().int().describe('Destination start row (0-based)'),
      destinationStartColumnIndex: z.number().int().describe('Destination start column (0-based)'),
      pasteType: z.enum(['NORMAL', 'VALUES', 'FORMAT', 'NO_BORDERS', 'FORMULA', 'DATA_VALIDATION', 'CONDITIONAL_FORMATTING']).optional()
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              cutPaste: {
                source: {
                  sheetId: args.sourceSheetId,
                  startRowIndex: args.sourceStartRowIndex,
                  endRowIndex: args.sourceEndRowIndex,
                  startColumnIndex: args.sourceStartColumnIndex,
                  endColumnIndex: args.sourceEndColumnIndex
                },
                destination: {
                  sheetId: args.destinationSheetId,
                  rowIndex: args.destinationStartRowIndex,
                  columnIndex: args.destinationStartColumnIndex
                },
                pasteType: args.pasteType || 'NORMAL'
              }
            }]
          }
        });

        logger.info('Cut paste completed', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId
        };
      } catch (error: any) {
        logger.error('Failed to cut paste', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Sort range
  registry.registerTool(
    'sheets_sort_range',
    'Sort data in a range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      startRowIndex: z.number().int().describe('Start row (0-based)'),
      endRowIndex: z.number().int().describe('End row (exclusive)'),
      startColumnIndex: z.number().int().describe('Start column (0-based)'),
      endColumnIndex: z.number().int().describe('End column (exclusive)'),
      sortSpecs: z.array(z.object({
        dimensionIndex: z.number().int().describe('Column index to sort by'),
        sortOrder: z.enum(['ASCENDING', 'DESCENDING'])
      })).describe('Sort specifications (can sort by multiple columns)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              sortRange: {
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRowIndex,
                  endRowIndex: args.endRowIndex,
                  startColumnIndex: args.startColumnIndex,
                  endColumnIndex: args.endColumnIndex
                },
                sortSpecs: args.sortSpecs
              }
            }]
          }
        });

        logger.info('Sorted range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          sheetId: args.sheetId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          sortedBy: args.sortSpecs.length
        };
      } catch (error: any) {
        logger.error('Failed to sort range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Auto fill
  registry.registerTool(
    'sheets_auto_fill',
    'Auto-fill a range based on neighboring cells',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      sourceStartRowIndex: z.number().int().describe('Source start row (0-based)'),
      sourceEndRowIndex: z.number().int().describe('Source end row (exclusive)'),
      sourceStartColumnIndex: z.number().int().describe('Source start column (0-based)'),
      sourceEndColumnIndex: z.number().int().describe('Source end column (exclusive)'),
      destinationStartRowIndex: z.number().int().describe('Destination start row'),
      destinationEndRowIndex: z.number().int().describe('Destination end row (exclusive)'),
      destinationStartColumnIndex: z.number().int().describe('Destination start column'),
      destinationEndColumnIndex: z.number().int().describe('Destination end column (exclusive)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              autoFill: {
                useAlternateSeries: false,
                sourceAndDestination: {
                  source: {
                    sheetId: args.sheetId,
                    startRowIndex: args.sourceStartRowIndex,
                    endRowIndex: args.sourceEndRowIndex,
                    startColumnIndex: args.sourceStartColumnIndex,
                    endColumnIndex: args.sourceEndColumnIndex
                  },
                  fillLength: args.destinationEndRowIndex - args.destinationStartRowIndex
                }
              }
            }]
          }
        });

        logger.info('Auto-filled range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          sheetId: args.sheetId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId
        };
      } catch (error: any) {
        logger.error('Failed to auto-fill', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Text to columns
  registry.registerTool(
    'sheets_text_to_columns',
    'Split text in cells into multiple columns',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      startRowIndex: z.number().int().describe('Start row (0-based)'),
      endRowIndex: z.number().int().describe('End row (exclusive)'),
      startColumnIndex: z.number().int().describe('Start column (0-based)'),
      endColumnIndex: z.number().int().describe('End column (exclusive)'),
      delimiter: z.string().describe('Delimiter character (e.g., "," or "\\t" for tab)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              textToColumns: {
                source: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRowIndex,
                  endRowIndex: args.endRowIndex,
                  startColumnIndex: args.startColumnIndex,
                  endColumnIndex: args.endColumnIndex
                },
                delimiter: args.delimiter,
                delimiterType: 'CUSTOM'
              }
            }]
          }
        });

        logger.info('Text to columns completed', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          delimiter: args.delimiter
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          delimiter: args.delimiter
        };
      } catch (error: any) {
        logger.error('Failed to split text to columns', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Copy to (copy sheet data to another location)
  registry.registerTool(
    'sheets_copy_to',
    'Copy data from one sheet to another location (within same or different spreadsheet)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      sourceSpreadsheetId: z.string().describe('Source spreadsheet ID'),
      sourceSheetId: z.number().int().describe('Source sheet ID'),
      sourceStartRowIndex: z.number().int().describe('Source start row (0-based)'),
      sourceEndRowIndex: z.number().int().describe('Source end row (exclusive)'),
      sourceStartColumnIndex: z.number().int().describe('Source start column (0-based)'),
      sourceEndColumnIndex: z.number().int().describe('Source end column (exclusive)'),
      destinationSpreadsheetId: z.string().describe('Destination spreadsheet ID (can be same as source)'),
      destinationSheetId: z.number().int().optional().describe('Destination sheet ID (if copying to different sheet)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        // If copying within same spreadsheet, use copyPaste
        if (args.sourceSpreadsheetId === args.destinationSpreadsheetId) {
          await client.spreadsheets.batchUpdate({
            spreadsheetId: args.sourceSpreadsheetId,
            requestBody: {
              requests: [{
                copyPaste: {
                  source: {
                    sheetId: args.sourceSheetId,
                    startRowIndex: args.sourceStartRowIndex,
                    endRowIndex: args.sourceEndRowIndex,
                    startColumnIndex: args.sourceStartColumnIndex,
                    endColumnIndex: args.sourceEndColumnIndex
                  },
                  destination: {
                    sheetId: args.destinationSheetId || args.sourceSheetId,
                    startRowIndex: args.sourceStartRowIndex,
                    endRowIndex: args.sourceEndRowIndex,
                    startColumnIndex: args.sourceStartColumnIndex,
                    endColumnIndex: args.sourceEndColumnIndex
                  },
                  pasteType: 'PASTE_NORMAL'
                }
              }]
            }
          });
        } else {
          // Cross-spreadsheet copy: read from source, write to destination
          const sourceRange = `${String.fromCharCode(65 + args.sourceStartColumnIndex)}${args.sourceStartRowIndex + 1}:${String.fromCharCode(65 + args.sourceEndColumnIndex - 1)}${args.sourceEndRowIndex}`;

          const sourceData = await client.spreadsheets.values.get({
            spreadsheetId: args.sourceSpreadsheetId,
            range: sourceRange
          });

          if (sourceData.data.values) {
            const destRange = `${String.fromCharCode(65 + args.sourceStartColumnIndex)}${args.sourceStartRowIndex + 1}`;
            await client.spreadsheets.values.update({
              spreadsheetId: args.destinationSpreadsheetId,
              range: destRange,
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values: sourceData.data.values
              }
            });
          }
        }

        logger.info('Copied sheet data', {
          tenantId: args.tenantId,
          sourceSpreadsheetId: args.sourceSpreadsheetId,
          destinationSpreadsheetId: args.destinationSpreadsheetId
        });

        return {
          success: true,
          sourceSpreadsheetId: args.sourceSpreadsheetId,
          destinationSpreadsheetId: args.destinationSpreadsheetId
        };
      } catch (error: any) {
        logger.error('Failed to copy sheet data', {
          tenantId: args.tenantId,
          sourceSpreadsheetId: args.sourceSpreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );
}

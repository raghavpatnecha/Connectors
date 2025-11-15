/**
 * Google Sheets MCP - Formatting and Advanced Operations Tools
 * Tools for formatting, dimensions, charts, protection, and validation (18 tools)
 */

import { z } from 'zod';
import { sheets_v4 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory.js';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all formatting and advanced operation tools
 */
export function registerFormattingTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Merge cells
  registry.registerTool(
    'sheets_merge_cells',
    'Merge cells in a range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      startRowIndex: z.number().int().describe('Start row (0-based)'),
      endRowIndex: z.number().int().describe('End row (exclusive)'),
      startColumnIndex: z.number().int().describe('Start column (0-based)'),
      endColumnIndex: z.number().int().describe('End column (exclusive)'),
      mergeType: z.enum(['MERGE_ALL', 'MERGE_COLUMNS', 'MERGE_ROWS']).optional().describe('Type of merge (default: MERGE_ALL)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              mergeCells: {
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRowIndex,
                  endRowIndex: args.endRowIndex,
                  startColumnIndex: args.startColumnIndex,
                  endColumnIndex: args.endColumnIndex
                },
                mergeType: args.mergeType || 'MERGE_ALL'
              }
            }]
          }
        });

        logger.info('Merged cells', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          mergeType: args.mergeType
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          mergeType: args.mergeType || 'MERGE_ALL'
        };
      } catch (error: any) {
        logger.error('Failed to merge cells', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Unmerge cells
  registry.registerTool(
    'sheets_unmerge_cells',
    'Unmerge cells in a range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      startRowIndex: z.number().int().describe('Start row (0-based)'),
      endRowIndex: z.number().int().describe('End row (exclusive)'),
      startColumnIndex: z.number().int().describe('Start column (0-based)'),
      endColumnIndex: z.number().int().describe('End column (exclusive)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              unmergeCells: {
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRowIndex,
                  endRowIndex: args.endRowIndex,
                  startColumnIndex: args.startColumnIndex,
                  endColumnIndex: args.endColumnIndex
                }
              }
            }]
          }
        });

        logger.info('Unmerged cells', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId
        };
      } catch (error: any) {
        logger.error('Failed to unmerge cells', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Set number format
  registry.registerTool(
    'sheets_set_number_format',
    'Set number format for a range of cells',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      startRowIndex: z.number().int().describe('Start row (0-based)'),
      endRowIndex: z.number().int().describe('End row (exclusive)'),
      startColumnIndex: z.number().int().describe('Start column (0-based)'),
      endColumnIndex: z.number().int().describe('End column (exclusive)'),
      numberFormatType: z.enum(['NUMBER', 'CURRENCY', 'PERCENT', 'DATE', 'TIME', 'DATE_TIME', 'SCIENTIFIC', 'TEXT']).describe('Type of number format'),
      pattern: z.string().optional().describe('Custom format pattern (e.g., "$#,##0.00")')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const numberFormat: sheets_v4.Schema$NumberFormat = {
          type: args.numberFormatType
        };
        if (args.pattern) numberFormat.pattern = args.pattern;

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              repeatCell: {
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRowIndex,
                  endRowIndex: args.endRowIndex,
                  startColumnIndex: args.startColumnIndex,
                  endColumnIndex: args.endColumnIndex
                },
                cell: {
                  userEnteredFormat: {
                    numberFormat
                  }
                },
                fields: 'userEnteredFormat.numberFormat'
              }
            }]
          }
        });

        logger.info('Set number format', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          numberFormatType: args.numberFormatType
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          numberFormatType: args.numberFormatType
        };
      } catch (error: any) {
        logger.error('Failed to set number format', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Auto-resize dimensions
  registry.registerTool(
    'sheets_auto_resize_dimensions',
    'Auto-resize rows or columns to fit content',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      dimension: z.enum(['ROWS', 'COLUMNS']).describe('Which dimension to resize'),
      startIndex: z.number().int().describe('Start index (0-based)'),
      endIndex: z.number().int().describe('End index (exclusive)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              autoResizeDimensions: {
                dimensions: {
                  sheetId: args.sheetId,
                  dimension: args.dimension,
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                }
              }
            }]
          }
        });

        logger.info('Auto-resized dimensions', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension
        };
      } catch (error: any) {
        logger.error('Failed to auto-resize dimensions', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Insert dimension (rows/columns)
  registry.registerTool(
    'sheets_insert_dimension',
    'Insert rows or columns in a sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      dimension: z.enum(['ROWS', 'COLUMNS']).describe('Which dimension to insert'),
      startIndex: z.number().int().describe('Start index (0-based)'),
      endIndex: z.number().int().describe('End index (exclusive)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              insertDimension: {
                range: {
                  sheetId: args.sheetId,
                  dimension: args.dimension,
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                },
                inheritFromBefore: false
              }
            }]
          }
        });

        const count = args.endIndex - args.startIndex;
        logger.info('Inserted dimension', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension,
          count
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension,
          inserted: count
        };
      } catch (error: any) {
        logger.error('Failed to insert dimension', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Delete dimension
  registry.registerTool(
    'sheets_delete_dimension',
    'Delete rows or columns from a sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      dimension: z.enum(['ROWS', 'COLUMNS']).describe('Which dimension to delete'),
      startIndex: z.number().int().describe('Start index (0-based)'),
      endIndex: z.number().int().describe('End index (exclusive)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              deleteDimension: {
                range: {
                  sheetId: args.sheetId,
                  dimension: args.dimension,
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                }
              }
            }]
          }
        });

        const count = args.endIndex - args.startIndex;
        logger.info('Deleted dimension', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension,
          count
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension,
          deleted: count
        };
      } catch (error: any) {
        logger.error('Failed to delete dimension', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Move dimension
  registry.registerTool(
    'sheets_move_dimension',
    'Move rows or columns to a different position',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      dimension: z.enum(['ROWS', 'COLUMNS']).describe('Which dimension to move'),
      startIndex: z.number().int().describe('Start index of range to move (0-based)'),
      endIndex: z.number().int().describe('End index of range to move (exclusive)'),
      destinationIndex: z.number().int().describe('Destination index where rows/columns will be moved')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              moveDimension: {
                source: {
                  sheetId: args.sheetId,
                  dimension: args.dimension,
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                },
                destinationIndex: args.destinationIndex
              }
            }]
          }
        });

        logger.info('Moved dimension', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension
        };
      } catch (error: any) {
        logger.error('Failed to move dimension', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Update dimension properties
  registry.registerTool(
    'sheets_update_dimension_properties',
    'Update properties of rows or columns (e.g., pixel size, hide/show)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      dimension: z.enum(['ROWS', 'COLUMNS']).describe('Which dimension to update'),
      startIndex: z.number().int().describe('Start index (0-based)'),
      endIndex: z.number().int().describe('End index (exclusive)'),
      pixelSize: z.number().int().optional().describe('Size in pixels'),
      hiddenByUser: z.boolean().optional().describe('Whether to hide rows/columns')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const properties: sheets_v4.Schema$DimensionProperties = {};
        if (args.pixelSize !== undefined) properties.pixelSize = args.pixelSize;
        if (args.hiddenByUser !== undefined) properties.hiddenByUser = args.hiddenByUser;

        const fields = [];
        if (args.pixelSize !== undefined) fields.push('pixelSize');
        if (args.hiddenByUser !== undefined) fields.push('hiddenByUser');

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              updateDimensionProperties: {
                range: {
                  sheetId: args.sheetId,
                  dimension: args.dimension,
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                },
                properties,
                fields: fields.join(',')
              }
            }]
          }
        });

        logger.info('Updated dimension properties', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          dimension: args.dimension,
          updatedProperties: fields
        };
      } catch (error: any) {
        logger.error('Failed to update dimension properties', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Add chart
  registry.registerTool(
    'sheets_add_chart',
    'Add a chart to a sheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID where chart will be placed'),
      chartType: z.enum(['BAR', 'LINE', 'AREA', 'COLUMN', 'SCATTER', 'COMBO', 'PIE', 'DONUT', 'HISTOGRAM']).describe('Type of chart'),
      dataRangeSheetId: z.number().int().describe('Sheet ID containing the data'),
      dataStartRowIndex: z.number().int().describe('Data start row (0-based)'),
      dataEndRowIndex: z.number().int().describe('Data end row (exclusive)'),
      dataStartColumnIndex: z.number().int().describe('Data start column (0-based)'),
      dataEndColumnIndex: z.number().int().describe('Data end column (exclusive)'),
      title: z.string().optional().describe('Chart title'),
      overlayRow: z.number().int().optional().describe('Row where chart will be placed (default: 0)'),
      overlayColumn: z.number().int().optional().describe('Column where chart will be placed (default: 0)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              addChart: {
                chart: {
                  spec: {
                    title: args.title,
                    basicChart: {
                      chartType: args.chartType,
                      domains: [{
                        domain: {
                          sourceRange: {
                            sources: [{
                              sheetId: args.dataRangeSheetId,
                              startRowIndex: args.dataStartRowIndex,
                              endRowIndex: args.dataEndRowIndex,
                              startColumnIndex: args.dataStartColumnIndex,
                              endColumnIndex: args.dataStartColumnIndex + 1
                            }]
                          }
                        }
                      }],
                      series: [{
                        series: {
                          sourceRange: {
                            sources: [{
                              sheetId: args.dataRangeSheetId,
                              startRowIndex: args.dataStartRowIndex,
                              endRowIndex: args.dataEndRowIndex,
                              startColumnIndex: args.dataStartColumnIndex + 1,
                              endColumnIndex: args.dataEndColumnIndex
                            }]
                          }
                        }
                      }],
                      headerCount: 1
                    }
                  },
                  position: {
                    overlayPosition: {
                      anchorCell: {
                        sheetId: args.sheetId,
                        rowIndex: args.overlayRow || 0,
                        columnIndex: args.overlayColumn || 0
                      }
                    }
                  }
                }
              }
            }]
          }
        });

        const chartId = response.data.replies?.[0]?.addChart?.chart?.chartId;

        logger.info('Added chart', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          chartType: args.chartType,
          chartId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          chartId,
          chartType: args.chartType
        };
      } catch (error: any) {
        logger.error('Failed to add chart', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Update chart
  registry.registerTool(
    'sheets_update_chart',
    'Update an existing chart',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      chartId: z.number().int().describe('ID of the chart to update'),
      title: z.string().optional().describe('New chart title')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        // Get current chart spec first
        const spreadsheet = await client.spreadsheets.get({ spreadsheetId: args.spreadsheetId });

        let currentChart: sheets_v4.Schema$EmbeddedChart | undefined;
        for (const sheet of spreadsheet.data.sheets || []) {
          currentChart = sheet.charts?.find(c => c.chartId === args.chartId);
          if (currentChart) break;
        }

        if (!currentChart || !currentChart.spec) {
          throw new Error(`Chart ${args.chartId} not found`);
        }

        // Update the chart
        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              updateChartSpec: {
                chartId: args.chartId,
                spec: {
                  ...currentChart.spec,
                  ...(args.title && { title: args.title })
                }
              }
            }]
          }
        });

        logger.info('Updated chart', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          chartId: args.chartId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          chartId: args.chartId
        };
      } catch (error: any) {
        logger.error('Failed to update chart', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          chartId: args.chartId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Delete chart
  registry.registerTool(
    'sheets_delete_chart',
    'Delete a chart from a spreadsheet',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      chartId: z.number().int().describe('ID of the chart to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              deleteEmbeddedObject: {
                objectId: args.chartId
              }
            }]
          }
        });

        logger.info('Deleted chart', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          chartId: args.chartId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          deletedChartId: args.chartId
        };
      } catch (error: any) {
        logger.error('Failed to delete chart', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          chartId: args.chartId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Set data validation
  registry.registerTool(
    'sheets_set_data_validation',
    'Set data validation rules for a range of cells',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      startRowIndex: z.number().int().describe('Start row (0-based)'),
      endRowIndex: z.number().int().describe('End row (exclusive)'),
      startColumnIndex: z.number().int().describe('Start column (0-based)'),
      endColumnIndex: z.number().int().describe('End column (exclusive)'),
      validationType: z.enum(['NUMBER_GREATER', 'NUMBER_LESS', 'NUMBER_BETWEEN', 'TEXT_CONTAINS', 'TEXT_NOT_CONTAINS', 'DATE_BEFORE', 'DATE_AFTER', 'ONE_OF_LIST']).describe('Type of validation'),
      values: z.array(z.string()).describe('Values for validation (e.g., for ONE_OF_LIST)'),
      strict: z.boolean().optional().describe('Whether to show warning or reject invalid input (default: true = reject)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        let condition: sheets_v4.Schema$BooleanCondition;

        if (args.validationType === 'ONE_OF_LIST') {
          condition = {
            type: 'ONE_OF_LIST',
            values: args.values.map(v => ({ userEnteredValue: v }))
          };
        } else {
          condition = {
            type: args.validationType,
            values: args.values.map(v => ({ userEnteredValue: v }))
          };
        }

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              setDataValidation: {
                range: {
                  sheetId: args.sheetId,
                  startRowIndex: args.startRowIndex,
                  endRowIndex: args.endRowIndex,
                  startColumnIndex: args.startColumnIndex,
                  endColumnIndex: args.endColumnIndex
                },
                rule: {
                  condition,
                  strict: args.strict !== false,
                  showCustomUi: true
                }
              }
            }]
          }
        });

        logger.info('Set data validation', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          validationType: args.validationType
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          validationType: args.validationType
        };
      } catch (error: any) {
        logger.error('Failed to set data validation', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Add protected range
  registry.registerTool(
    'sheets_add_protected_range',
    'Protect a range of cells from editing',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      sheetId: z.number().int().describe('Sheet ID'),
      startRowIndex: z.number().int().describe('Start row (0-based)'),
      endRowIndex: z.number().int().describe('End row (exclusive)'),
      startColumnIndex: z.number().int().describe('Start column (0-based)'),
      endColumnIndex: z.number().int().describe('End column (exclusive)'),
      description: z.string().optional().describe('Description of the protected range'),
      warningOnly: z.boolean().optional().describe('Show warning instead of preventing edits (default: false)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const response = await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              addProtectedRange: {
                protectedRange: {
                  range: {
                    sheetId: args.sheetId,
                    startRowIndex: args.startRowIndex,
                    endRowIndex: args.endRowIndex,
                    startColumnIndex: args.startColumnIndex,
                    endColumnIndex: args.endColumnIndex
                  },
                  description: args.description,
                  warningOnly: args.warningOnly || false
                }
              }
            }]
          }
        });

        const protectedRangeId = response.data.replies?.[0]?.addProtectedRange?.protectedRange?.protectedRangeId;

        logger.info('Added protected range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          protectedRangeId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          protectedRangeId
        };
      } catch (error: any) {
        logger.error('Failed to add protected range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Update protected range
  registry.registerTool(
    'sheets_update_protected_range',
    'Update properties of a protected range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      protectedRangeId: z.number().int().describe('ID of the protected range to update'),
      description: z.string().optional().describe('New description'),
      warningOnly: z.boolean().optional().describe('Update warning mode')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        const fields = [];
        const protectedRange: sheets_v4.Schema$ProtectedRange = {
          protectedRangeId: args.protectedRangeId
        };

        if (args.description !== undefined) {
          protectedRange.description = args.description;
          fields.push('description');
        }
        if (args.warningOnly !== undefined) {
          protectedRange.warningOnly = args.warningOnly;
          fields.push('warningOnly');
        }

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              updateProtectedRange: {
                protectedRange,
                fields: fields.join(',')
              }
            }]
          }
        });

        logger.info('Updated protected range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          protectedRangeId: args.protectedRangeId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          protectedRangeId: args.protectedRangeId
        };
      } catch (error: any) {
        logger.error('Failed to update protected range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );

  // Delete protected range
  registry.registerTool(
    'sheets_delete_protected_range',
    'Remove protection from a range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      spreadsheetId: z.string().describe('ID of the spreadsheet'),
      protectedRangeId: z.number().int().describe('ID of the protected range to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getSheetsClient(args.tenantId);

        await client.spreadsheets.batchUpdate({
          spreadsheetId: args.spreadsheetId,
          requestBody: {
            requests: [{
              deleteProtectedRange: {
                protectedRangeId: args.protectedRangeId
              }
            }]
          }
        });

        logger.info('Deleted protected range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          protectedRangeId: args.protectedRangeId
        });

        return {
          success: true,
          spreadsheetId: args.spreadsheetId,
          deletedProtectedRangeId: args.protectedRangeId
        };
      } catch (error: any) {
        logger.error('Failed to delete protected range', {
          tenantId: args.tenantId,
          spreadsheetId: args.spreadsheetId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'sheets');
      }
    }
  );
}

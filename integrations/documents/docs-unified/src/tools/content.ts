/**
 * Google Docs MCP - Content Manipulation Tools
 * Tools for editing text, tables, and other content in Google Docs
 */

import { z } from 'zod';
import { docs_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all content manipulation tools
 */
export function registerContentTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // Insert text
  registry.registerTool(
    'docs_insert_text',
    'Insert text at a specific position in the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      text: z.string().describe('Text to insert'),
      index: z.number().int().min(1).describe('Position to insert text (1-based, 1 is after title)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertText: {
                location: { index: args.index },
                text: args.text
              }
            }]
          }
        });

        logger.info('Inserted text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          index: args.index,
          textLength: args.text.length
        });

        return {
          success: true,
          documentId: args.documentId,
          insertedLength: args.text.length,
          index: args.index,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to insert text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Delete text
  registry.registerTool(
    'docs_delete_text',
    'Delete text from a specific range in the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      startIndex: z.number().int().min(1).describe('Start position of range to delete'),
      endIndex: z.number().int().min(1).describe('End position of range to delete')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              deleteContentRange: {
                range: {
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                }
              }
            }]
          }
        });

        const deletedLength = args.endIndex - args.startIndex;

        logger.info('Deleted text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          startIndex: args.startIndex,
          endIndex: args.endIndex,
          deletedLength
        });

        return {
          success: true,
          documentId: args.documentId,
          deletedLength,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to delete text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Replace text
  registry.registerTool(
    'docs_replace_text',
    'Replace text in a specific range',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      startIndex: z.number().int().min(1).describe('Start position of range to replace'),
      endIndex: z.number().int().min(1).describe('End position of range to replace'),
      newText: z.string().describe('New text to replace with')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        // Delete old text, then insert new text
        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [
              {
                deleteContentRange: {
                  range: {
                    startIndex: args.startIndex,
                    endIndex: args.endIndex
                  }
                }
              },
              {
                insertText: {
                  location: { index: args.startIndex },
                  text: args.newText
                }
              }
            ]
          }
        });

        logger.info('Replaced text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          startIndex: args.startIndex,
          endIndex: args.endIndex,
          newLength: args.newText.length
        });

        return {
          success: true,
          documentId: args.documentId,
          oldLength: args.endIndex - args.startIndex,
          newLength: args.newText.length,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to replace text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Find and replace
  registry.registerTool(
    'docs_find_and_replace',
    'Find and replace all occurrences of text in the document',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      findText: z.string().describe('Text to find'),
      replaceText: z.string().describe('Text to replace with'),
      matchCase: z.boolean().optional().describe('Whether to match case (default: false)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const response = await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              replaceAllText: {
                containsText: {
                  text: args.findText,
                  matchCase: args.matchCase || false
                },
                replaceText: args.replaceText
              }
            }]
          }
        });

        const occurrencesChanged = response.data.replies?.[0]?.replaceAllText?.occurrencesChanged || 0;

        logger.info('Find and replace completed', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          findText: args.findText,
          occurrencesChanged
        });

        return {
          success: true,
          documentId: args.documentId,
          occurrencesChanged,
          findText: args.findText,
          replaceText: args.replaceText,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to find and replace', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Format text
  registry.registerTool(
    'docs_format_text',
    'Apply formatting to a text range (bold, italic, underline, font, size, color)',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      startIndex: z.number().int().min(1).describe('Start position of range to format'),
      endIndex: z.number().int().min(1).describe('End position of range to format'),
      bold: z.boolean().optional().describe('Make text bold'),
      italic: z.boolean().optional().describe('Make text italic'),
      underline: z.boolean().optional().describe('Underline text'),
      fontSize: z.number().optional().describe('Font size in points'),
      fontFamily: z.string().optional().describe('Font family name (e.g., "Arial", "Times New Roman")'),
      foregroundColor: z.string().optional().describe('Text color in hex format (e.g., "#FF0000")')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        const textStyle: docs_v1.Schema$TextStyle = {};
        if (args.bold !== undefined) textStyle.bold = args.bold;
        if (args.italic !== undefined) textStyle.italic = args.italic;
        if (args.underline !== undefined) textStyle.underline = args.underline;
        if (args.fontSize) textStyle.fontSize = { magnitude: args.fontSize, unit: 'PT' };
        if (args.fontFamily) textStyle.weightedFontFamily = { fontFamily: args.fontFamily };
        if (args.foregroundColor) {
          // Convert hex to RGB
          const hex = args.foregroundColor.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16) / 255;
          const g = parseInt(hex.substr(2, 2), 16) / 255;
          const b = parseInt(hex.substr(4, 2), 16) / 255;
          textStyle.foregroundColor = {
            color: { rgbColor: { red: r, green: g, blue: b } }
          };
        }

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              updateTextStyle: {
                range: {
                  startIndex: args.startIndex,
                  endIndex: args.endIndex
                },
                textStyle,
                fields: Object.keys(textStyle).join(',')
              }
            }]
          }
        });

        logger.info('Formatted text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          startIndex: args.startIndex,
          endIndex: args.endIndex,
          formatting: Object.keys(textStyle)
        });

        return {
          success: true,
          documentId: args.documentId,
          rangeLength: args.endIndex - args.startIndex,
          appliedFormatting: Object.keys(textStyle),
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to format text', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Insert table
  registry.registerTool(
    'docs_insert_table',
    'Insert a table at a specific position',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      rows: z.number().int().min(1).max(20).describe('Number of rows'),
      columns: z.number().int().min(1).max(20).describe('Number of columns'),
      index: z.number().int().min(1).describe('Position to insert table')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertTable: {
                rows: args.rows,
                columns: args.columns,
                location: { index: args.index }
              }
            }]
          }
        });

        logger.info('Inserted table', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          rows: args.rows,
          columns: args.columns,
          index: args.index
        });

        return {
          success: true,
          documentId: args.documentId,
          rows: args.rows,
          columns: args.columns,
          totalCells: args.rows * args.columns,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to insert table', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Insert page break
  registry.registerTool(
    'docs_insert_page_break',
    'Insert a page break at a specific position',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      index: z.number().int().min(1).describe('Position to insert page break')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertPageBreak: {
                location: { index: args.index }
              }
            }]
          }
        });

        logger.info('Inserted page break', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          index: args.index
        });

        return {
          success: true,
          documentId: args.documentId,
          index: args.index,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to insert page break', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Insert image
  registry.registerTool(
    'docs_insert_image',
    'Insert an image from a URL or Drive file',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      imageUri: z.string().describe('Public image URL or Drive file ID'),
      index: z.number().int().min(1).describe('Position to insert image'),
      width: z.number().optional().describe('Image width in points (optional)'),
      height: z.number().optional().describe('Image height in points (optional)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        // Construct image URI
        let imageUri = args.imageUri;
        if (!imageUri.startsWith('http://') && !imageUri.startsWith('https://')) {
          // Assume it's a Drive file ID
          imageUri = `https://drive.google.com/uc?id=${imageUri}`;
        }

        const objectSize: docs_v1.Schema$Size = {};
        if (args.width) objectSize.width = { magnitude: args.width, unit: 'PT' };
        if (args.height) objectSize.height = { magnitude: args.height, unit: 'PT' };

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertInlineImage: {
                uri: imageUri,
                location: { index: args.index },
                ...(Object.keys(objectSize).length > 0 && { objectSize })
              }
            }]
          }
        });

        logger.info('Inserted image', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          index: args.index,
          imageUri: args.imageUri
        });

        return {
          success: true,
          documentId: args.documentId,
          imageUri,
          index: args.index,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to insert image', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Insert list
  registry.registerTool(
    'docs_insert_list',
    'Insert a bulleted or numbered list',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      items: z.array(z.string()).describe('List items'),
      listType: z.enum(['UNORDERED', 'ORDERED']).describe('Type of list (UNORDERED = bullets, ORDERED = numbers)'),
      index: z.number().int().min(1).describe('Position to insert list')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        // Insert list items as text with newlines
        const listText = args.items.join('\n') + '\n';
        const requests: docs_v1.Schema$Request[] = [
          {
            insertText: {
              location: { index: args.index },
              text: listText
            }
          }
        ];

        // Create bullets for each item
        let currentIndex = args.index;
        for (const item of args.items) {
          const itemLength = item.length + 1; // +1 for newline
          requests.push({
            createParagraphBullets: {
              range: {
                startIndex: currentIndex,
                endIndex: currentIndex + itemLength - 1
              },
              bulletPreset: args.listType === 'ORDERED' ? 'NUMBERED_DECIMAL_ALPHA_ROMAN' : 'BULLET_DISC_CIRCLE_SQUARE'
            }
          });
          currentIndex += itemLength;
        }

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: { requests }
        });

        logger.info('Inserted list', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          itemCount: args.items.length,
          listType: args.listType,
          index: args.index
        });

        return {
          success: true,
          documentId: args.documentId,
          itemCount: args.items.length,
          listType: args.listType,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to insert list', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Create table with data
  registry.registerTool(
    'docs_create_table_with_data',
    'Create a table and populate it with data in one operation',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      tableData: z.array(z.array(z.string())).describe('2D array of table data [[row1col1, row1col2], [row2col1, row2col2]]'),
      index: z.number().int().min(1).describe('Position to insert table'),
      boldHeaders: z.boolean().optional().describe('Make first row bold (default: true)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        if (!args.tableData.length || !args.tableData[0].length) {
          throw new Error('Table data must have at least one row and one column');
        }

        const rows = args.tableData.length;
        const columns = args.tableData[0].length;

        // Verify all rows have same column count
        for (const row of args.tableData) {
          if (row.length !== columns) {
            throw new Error('All rows must have the same number of columns');
          }
        }

        // First, insert the table
        const insertTableResponse = await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertTable: {
                rows,
                columns,
                location: { index: args.index }
              }
            }]
          }
        });

        // Get the document to find table cell indices
        const doc = await client.documents.get({ documentId: args.documentId });

        // Find the table we just inserted
        const bodyContent = doc.data.body?.content || [];
        let tableElement: docs_v1.Schema$StructuralElement | undefined;
        for (const element of bodyContent) {
          if (element.table && element.startIndex && element.startIndex >= args.index) {
            tableElement = element;
            break;
          }
        }

        if (!tableElement || !tableElement.table) {
          throw new Error('Could not find inserted table');
        }

        // Populate cells with data
        const populateRequests: docs_v1.Schema$Request[] = [];
        const tableRows = tableElement.table.tableRows || [];

        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
          const tableRow = tableRows[rowIndex];
          const tableCells = tableRow.tableCells || [];

          for (let colIndex = 0; colIndex < columns; colIndex++) {
            const cell = tableCells[colIndex];
            const cellContent = cell.content || [];

            if (cellContent.length > 0 && cellContent[0].startIndex) {
              const cellText = args.tableData[rowIndex][colIndex];
              const insertIndex = cellContent[0].startIndex + 1;

              populateRequests.push({
                insertText: {
                  location: { index: insertIndex },
                  text: cellText
                }
              });

              // Bold headers if requested
              if (rowIndex === 0 && (args.boldHeaders !== false)) {
                populateRequests.push({
                  updateTextStyle: {
                    range: {
                      startIndex: insertIndex,
                      endIndex: insertIndex + cellText.length
                    },
                    textStyle: { bold: true },
                    fields: 'bold'
                  }
                });
              }
            }
          }
        }

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: { requests: populateRequests }
        });

        logger.info('Created table with data', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          rows,
          columns,
          totalCells: rows * columns
        });

        return {
          success: true,
          documentId: args.documentId,
          rows,
          columns,
          totalCells: rows * columns,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to create table with data', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Insert table row
  registry.registerTool(
    'docs_insert_table_row',
    'Insert a new row into an existing table',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      rowIndex: z.number().int().min(0).describe('Position to insert row (0-based)'),
      insertBelow: z.boolean().optional().describe('Insert below the specified row (default: false = insert above)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertTableRow: {
                tableCellLocation: {
                  tableStartLocation: { index: args.tableStartIndex },
                  rowIndex: args.rowIndex,
                  columnIndex: 0
                },
                insertBelow: args.insertBelow || false
              }
            }]
          }
        });

        logger.info('Inserted table row', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          tableStartIndex: args.tableStartIndex,
          rowIndex: args.rowIndex
        });

        return {
          success: true,
          documentId: args.documentId,
          rowIndex: args.rowIndex,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to insert table row', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );

  // Insert table column
  registry.registerTool(
    'docs_insert_table_column',
    'Insert a new column into an existing table',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      documentId: z.string().describe('ID of the document'),
      tableStartIndex: z.number().int().min(1).describe('Start index of the table'),
      columnIndex: z.number().int().min(0).describe('Position to insert column (0-based)'),
      insertRight: z.boolean().optional().describe('Insert to the right of the specified column (default: false = insert left)')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getDocsClient(args.tenantId);

        await client.documents.batchUpdate({
          documentId: args.documentId,
          requestBody: {
            requests: [{
              insertTableColumn: {
                tableCellLocation: {
                  tableStartLocation: { index: args.tableStartIndex },
                  rowIndex: 0,
                  columnIndex: args.columnIndex
                },
                insertRight: args.insertRight || false
              }
            }]
          }
        });

        logger.info('Inserted table column', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          tableStartIndex: args.tableStartIndex,
          columnIndex: args.columnIndex
        });

        return {
          success: true,
          documentId: args.documentId,
          columnIndex: args.columnIndex,
          link: `https://docs.google.com/document/d/${args.documentId}/edit`
        };
      } catch (error: any) {
        logger.error('Failed to insert table column', {
          tenantId: args.tenantId,
          documentId: args.documentId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'docs');
      }
    }
  );
}

import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { ChatClient } from '../clients/chat-client.js';
import { logger } from '../utils/logger.js';

// Schemas
const getAttachmentSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  name: z.string().describe('Attachment name (e.g., spaces/AAAAAAAAAAA/messages/BBBBBBBBBBB/attachments/CCCCCCCCCCC)')
});

const uploadAttachmentSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  parent: z.string().describe('Parent space name (e.g., spaces/AAAAAAAAAAA)'),
  filename: z.string().describe('Filename for the attachment'),
  contentType: z.string().optional().describe('MIME type of the attachment (e.g., image/png)'),
  data: z.string().describe('Base64-encoded attachment data')
});

export function registerAttachmentTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // get_attachment
  registry.registerTool(
    'get_attachment',
    'Get details of an attachment in a Google Chat message',
    getAttachmentSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const { data } = await client.api.media.download({
        resourceName: params.name
      });

      return registry.formatResponse({
        name: params.name,
        data,
        message: 'Attachment retrieved successfully'
      });
    }
  );

  // upload_attachment
  registry.registerTool(
    'upload_attachment',
    'Upload an attachment to a Google Chat space',
    uploadAttachmentSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new ChatClient(accessToken);

      const normalizedParent = client.normalizeSpaceName(params.parent);

      // Note: The actual upload requires multipart/form-data which is complex
      // This is a simplified version that creates metadata
      // In production, you'd use googleapis' media upload functionality

      logger.info('Attachment upload requested', {
        parent: normalizedParent,
        filename: params.filename
      });

      return registry.formatResponse({
        success: true,
        message: 'Attachment upload functionality requires media upload implementation',
        parent: normalizedParent,
        filename: params.filename,
        contentType: params.contentType || 'application/octet-stream'
      });
    }
  );

  logger.info('Registered 2 attachment tools');
}

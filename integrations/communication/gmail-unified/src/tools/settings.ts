import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper.js';
import { GmailClient } from '../clients/gmail-client.js';
import { logger } from '../utils/logger.js';

// Base schema
const tenantSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials')
});

// Auto-forwarding schemas
const updateAutoForwardingSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  enabled: z.boolean().describe('Enable automatic forwarding'),
  emailAddress: z.string().describe('Email address to forward to'),
  disposition: z.enum(['leaveInInbox', 'archive', 'trash', 'markRead']).describe('Action after forwarding')
});

// IMAP schemas
const updateImapSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  enabled: z.boolean().describe('Enable IMAP'),
  expungeBehavior: z.enum(['archive', 'trash', 'deleteForever']).optional().describe('Action on expunge'),
  maxFolderSize: z.number().optional().describe('Max messages accessible via IMAP')
});

// Language schemas
const updateLanguageSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  displayLanguage: z.string().describe('RFC 3066 Language Tag')
});

// POP schemas
const updatePopSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  accessWindow: z.enum(['disabled', 'allMail', 'fromNowOn']).describe('Range of accessible messages'),
  disposition: z.enum(['archive', 'trash', 'leaveInInbox']).describe('Action after POP fetch')
});

// Vacation schemas
const updateVacationSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  enableAutoReply: z.boolean().describe('Enable vacation responder'),
  responseSubject: z.string().optional().describe('Auto-reply subject'),
  responseBodyPlainText: z.string().describe('Auto-reply body (plain text)'),
  restrictToContacts: z.boolean().optional().describe('Only reply to contacts'),
  restrictToDomain: z.boolean().optional().describe('Only reply to same domain'),
  startTime: z.string().optional().describe('Start time (epoch ms)'),
  endTime: z.string().optional().describe('End time (epoch ms)')
});

// Delegate schemas
const addDelegateSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  delegateEmail: z.string().describe('Delegate email address to add')
});

const removeDelegateSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  delegateEmail: z.string().describe('Delegate email address to remove')
});

const getDelegateSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  delegateEmail: z.string().describe('Delegate email address')
});

// Filter schemas
const createFilterSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  criteria: z.object({
    from: z.string().optional().describe('Sender email'),
    to: z.string().optional().describe('Recipient email'),
    subject: z.string().optional().describe('Subject phrase'),
    query: z.string().optional().describe('Gmail search query'),
    negatedQuery: z.string().optional().describe('Negated query'),
    hasAttachment: z.boolean().optional().describe('Has attachment'),
    excludeChats: z.boolean().optional().describe('Exclude chats'),
    size: z.number().optional().describe('Message size in bytes'),
    sizeComparison: z.enum(['smaller', 'larger']).optional().describe('Size comparison')
  }).describe('Filter criteria'),
  action: z.object({
    addLabelIds: z.array(z.string()).optional().describe('Labels to add'),
    removeLabelIds: z.array(z.string()).optional().describe('Labels to remove'),
    forward: z.string().optional().describe('Forward to email')
  }).describe('Filter actions')
});

const deleteFilterSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Filter ID to delete')
});

const getFilterSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  id: z.string().describe('Filter ID')
});

// Forwarding Address schemas
const createForwardingAddressSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  forwardingEmail: z.string().describe('Forwarding email address')
});

const deleteForwardingAddressSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  forwardingEmail: z.string().describe('Forwarding email address to delete')
});

const getForwardingAddressSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  forwardingEmail: z.string().describe('Forwarding email address')
});

// Send-as schemas
const createSendAsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address'),
  displayName: z.string().optional().describe('Display name'),
  replyToAddress: z.string().optional().describe('Reply-to address'),
  signature: z.string().optional().describe('HTML signature'),
  isPrimary: z.boolean().optional().describe('Is primary address'),
  treatAsAlias: z.boolean().optional().describe('Treat as alias')
});

const updateSendAsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address'),
  displayName: z.string().optional().describe('Display name'),
  replyToAddress: z.string().optional().describe('Reply-to address'),
  signature: z.string().optional().describe('HTML signature'),
  isPrimary: z.boolean().optional().describe('Is primary address'),
  treatAsAlias: z.boolean().optional().describe('Treat as alias')
});

const patchSendAsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address'),
  displayName: z.string().optional().describe('Display name'),
  replyToAddress: z.string().optional().describe('Reply-to address'),
  signature: z.string().optional().describe('HTML signature'),
  isPrimary: z.boolean().optional().describe('Is primary address'),
  treatAsAlias: z.boolean().optional().describe('Treat as alias')
});

const deleteSendAsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address to delete')
});

const getSendAsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address')
});

const verifySendAsSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address to verify')
});

// S/MIME schemas
const insertSmimeInfoSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address'),
  encryptedKeyPassword: z.string().describe('Encrypted key password'),
  pkcs12: z.string().describe('PKCS#12 format certificate')
});

const deleteSmimeInfoSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address'),
  id: z.string().describe('S/MIME config ID')
});

const getSmimeInfoSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address'),
  id: z.string().describe('S/MIME config ID')
});

const listSmimeInfoSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address')
});

const setDefaultSmimeInfoSchema = z.object({
  tenantId: z.string().describe('Tenant ID for OAuth credentials'),
  sendAsEmail: z.string().describe('Send-as email address'),
  id: z.string().describe('S/MIME config ID to set as default')
});

export function registerSettingsTools(
  registry: ToolRegistry,
  getAccessToken: (tenantId: string) => Promise<string>
) {
  // AUTO-FORWARDING (2 tools)
  registry.registerTool(
    'get_auto_forwarding',
    'Get auto-forwarding settings',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.getAutoForwarding({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'update_auto_forwarding',
    'Update auto-forwarding settings',
    updateAutoForwardingSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, ...settings } = params;
      const { data } = await client.api.users.settings.updateAutoForwarding({
        userId: 'me',
        requestBody: settings
      });
      return registry.formatResponse(data);
    }
  );

  // IMAP (2 tools)
  registry.registerTool(
    'get_imap',
    'Get IMAP settings',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.getImap({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'update_imap',
    'Update IMAP settings',
    updateImapSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, ...settings } = params;
      const { data } = await client.api.users.settings.updateImap({
        userId: 'me',
        requestBody: settings
      });
      return registry.formatResponse(data);
    }
  );

  // LANGUAGE (2 tools)
  registry.registerTool(
    'get_language',
    'Get language settings',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.getLanguage({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'update_language',
    'Update language settings',
    updateLanguageSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, ...settings } = params;
      const { data } = await client.api.users.settings.updateLanguage({
        userId: 'me',
        requestBody: settings
      });
      return registry.formatResponse(data);
    }
  );

  // POP (2 tools)
  registry.registerTool(
    'get_pop',
    'Get POP settings',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.getPop({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'update_pop',
    'Update POP settings',
    updatePopSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, ...settings } = params;
      const { data } = await client.api.users.settings.updatePop({
        userId: 'me',
        requestBody: settings
      });
      return registry.formatResponse(data);
    }
  );

  // VACATION (2 tools)
  registry.registerTool(
    'get_vacation',
    'Get vacation responder settings',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.getVacation({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'update_vacation',
    'Update vacation responder settings',
    updateVacationSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, ...settings } = params;
      const { data } = await client.api.users.settings.updateVacation({
        userId: 'me',
        requestBody: settings
      });
      return registry.formatResponse(data);
    }
  );

  // DELEGATES (4 tools)
  registry.registerTool(
    'list_delegates',
    'List all delegates for the account',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.delegates.list({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'get_delegate',
    'Get a specific delegate',
    getDelegateSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.delegates.get({
        userId: 'me',
        delegateEmail: params.delegateEmail
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'add_delegate',
    'Add a delegate to the account',
    addDelegateSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.delegates.create({
        userId: 'me',
        requestBody: { delegateEmail: params.delegateEmail }
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'remove_delegate',
    'Remove a delegate from the account',
    removeDelegateSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.delegates.delete({
        userId: 'me',
        delegateEmail: params.delegateEmail
      });
      return registry.formatResponse(data);
    }
  );

  // FILTERS (4 tools)
  registry.registerTool(
    'list_filters',
    'List all message filters',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.filters.list({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'get_filter',
    'Get a specific filter',
    getFilterSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.filters.get({
        userId: 'me',
        id: params.id
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'create_filter',
    'Create a new filter',
    createFilterSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, ...filterData } = params;
      const { data } = await client.api.users.settings.filters.create({
        userId: 'me',
        requestBody: filterData
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'delete_filter',
    'Delete a filter',
    deleteFilterSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.filters.delete({
        userId: 'me',
        id: params.id
      });
      return registry.formatResponse(data);
    }
  );

  // FORWARDING ADDRESSES (4 tools)
  registry.registerTool(
    'list_forwarding_addresses',
    'List all forwarding addresses',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.forwardingAddresses.list({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'get_forwarding_address',
    'Get a specific forwarding address',
    getForwardingAddressSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.forwardingAddresses.get({
        userId: 'me',
        forwardingEmail: params.forwardingEmail
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'create_forwarding_address',
    'Create a forwarding address',
    createForwardingAddressSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.forwardingAddresses.create({
        userId: 'me',
        requestBody: { forwardingEmail: params.forwardingEmail }
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'delete_forwarding_address',
    'Delete a forwarding address',
    deleteForwardingAddressSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.forwardingAddresses.delete({
        userId: 'me',
        forwardingEmail: params.forwardingEmail
      });
      return registry.formatResponse(data);
    }
  );

  // SEND-AS (7 tools)
  registry.registerTool(
    'list_send_as',
    'List all send-as aliases',
    tenantSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.list({ userId: 'me' });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'get_send_as',
    'Get a specific send-as alias',
    getSendAsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.get({
        userId: 'me',
        sendAsEmail: params.sendAsEmail
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'create_send_as',
    'Create a custom send-as alias',
    createSendAsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, ...sendAsData } = params;
      const { data } = await client.api.users.settings.sendAs.create({
        userId: 'me',
        requestBody: sendAsData
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'update_send_as',
    'Update a send-as alias',
    updateSendAsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, sendAsEmail, ...sendAsData } = params;
      const { data } = await client.api.users.settings.sendAs.update({
        userId: 'me',
        sendAsEmail,
        requestBody: sendAsData
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'patch_send_as',
    'Patch a send-as alias (partial update)',
    patchSendAsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, sendAsEmail, ...sendAsData } = params;
      const { data } = await client.api.users.settings.sendAs.patch({
        userId: 'me',
        sendAsEmail,
        requestBody: sendAsData
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'delete_send_as',
    'Delete a send-as alias',
    deleteSendAsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.delete({
        userId: 'me',
        sendAsEmail: params.sendAsEmail
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'verify_send_as',
    'Send verification email to a send-as alias',
    verifySendAsSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.verify({
        userId: 'me',
        sendAsEmail: params.sendAsEmail
      });
      return registry.formatResponse(data);
    }
  );

  // S/MIME (5 tools)
  registry.registerTool(
    'list_smime_info',
    'List S/MIME configs for a send-as alias',
    listSmimeInfoSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.smimeInfo.list({
        userId: 'me',
        sendAsEmail: params.sendAsEmail
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'get_smime_info',
    'Get a specific S/MIME config',
    getSmimeInfoSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.smimeInfo.get({
        userId: 'me',
        sendAsEmail: params.sendAsEmail,
        id: params.id
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'insert_smime_info',
    'Upload a new S/MIME config',
    insertSmimeInfoSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { tenantId, sendAsEmail, ...smimeData } = params;
      const { data } = await client.api.users.settings.sendAs.smimeInfo.insert({
        userId: 'me',
        sendAsEmail,
        requestBody: smimeData
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'delete_smime_info',
    'Delete an S/MIME config',
    deleteSmimeInfoSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.smimeInfo.delete({
        userId: 'me',
        sendAsEmail: params.sendAsEmail,
        id: params.id
      });
      return registry.formatResponse(data);
    }
  );

  registry.registerTool(
    'set_default_smime_info',
    'Set default S/MIME config for a send-as alias',
    setDefaultSmimeInfoSchema,
    async (params) => {
      const accessToken = await getAccessToken(params.tenantId);
      const client = new GmailClient(accessToken);
      const { data } = await client.api.users.settings.sendAs.smimeInfo.setDefault({
        userId: 'me',
        sendAsEmail: params.sendAsEmail,
        id: params.id
      });
      return registry.formatResponse(data);
    }
  );

  logger.info('Registered 34 settings tools');
}

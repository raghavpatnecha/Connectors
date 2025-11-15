/**
 * Google Calendar ACL (Access Control List) Tools (6 tools)
 * Manages calendar sharing and permissions
 */

import { calendar_v3 } from 'googleapis';
import { z } from 'zod';

// ==================== Acl.list ====================
export const listAclSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  showDeleted: z.boolean().default(false).describe('Show deleted ACL rules'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function listAcl(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof listAclSchema>
): Promise<string> {
  const response = await calendar.acl.list({
    calendarId: args.calendarId,
    showDeleted: args.showDeleted,
  });

  const rules = response.data.items || [];
  if (rules.length === 0) {
    return `No ACL rules found for calendar ${args.calendarId}`;
  }

  const ruleList = rules
    .map((rule) => {
      const scopeType = rule.scope?.type || 'unknown';
      const scopeValue = rule.scope?.value || 'N/A';
      const deleted = rule.deleted ? ' [Deleted]' : '';
      return `- ${rule.role} for ${scopeType}: ${scopeValue}${deleted}\n  Rule ID: ${rule.id}`;
    })
    .join('\n');

  return `ACL rules for calendar ${args.calendarId} (${rules.length} rules):\n${ruleList}`;
}

// ==================== Acl.get ====================
export const getAclSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  ruleId: z.string().describe('ACL rule ID'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function getAcl(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof getAclSchema>
): Promise<string> {
  const response = await calendar.acl.get({
    calendarId: args.calendarId,
    ruleId: args.ruleId,
  });

  const rule = response.data;
  const scopeType = rule.scope?.type || 'unknown';
  const scopeValue = rule.scope?.value || 'N/A';

  return `ACL Rule Details:
- Rule ID: ${rule.id}
- Role: ${rule.role}
- Scope Type: ${scopeType}
- Scope Value: ${scopeValue}
- ETag: ${rule.etag}`;
}

// ==================== Acl.insert ====================
export const insertAclSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  role: z.enum(['owner', 'writer', 'reader', 'freeBusyReader']).describe('Access role'),
  scopeType: z.enum(['default', 'user', 'group', 'domain']).describe('Scope type'),
  scopeValue: z.string().optional().describe('Email, domain, or group (not needed for "default")'),
  sendNotifications: z.boolean().default(true).describe('Send sharing notifications'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function insertAcl(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof insertAclSchema>
): Promise<string> {
  const response = await calendar.acl.insert({
    calendarId: args.calendarId,
    sendNotifications: args.sendNotifications,
    requestBody: {
      role: args.role,
      scope: {
        type: args.scopeType,
        value: args.scopeValue,
      },
    },
  });

  const rule = response.data;
  const scopeValue = rule.scope?.value || 'N/A';
  return `Successfully created ACL rule\nRole: ${rule.role}\nScope: ${rule.scope?.type} (${scopeValue})\nRule ID: ${rule.id}`;
}

// ==================== Acl.update ====================
export const updateAclSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  ruleId: z.string().describe('ACL rule ID'),
  role: z.enum(['owner', 'writer', 'reader', 'freeBusyReader']).describe('New access role'),
  sendNotifications: z.boolean().default(true).describe('Send update notifications'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function updateAcl(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof updateAclSchema>
): Promise<string> {
  // Get existing rule
  const existing = await calendar.acl.get({
    calendarId: args.calendarId,
    ruleId: args.ruleId,
  });

  const response = await calendar.acl.update({
    calendarId: args.calendarId,
    ruleId: args.ruleId,
    sendNotifications: args.sendNotifications,
    requestBody: {
      ...existing.data,
      role: args.role,
    },
  });

  const rule = response.data;
  return `Successfully updated ACL rule ${args.ruleId}\nNew role: ${rule.role}`;
}

// ==================== Acl.patch ====================
export const patchAclSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  ruleId: z.string().describe('ACL rule ID'),
  role: z.enum(['owner', 'writer', 'reader', 'freeBusyReader']).optional().describe('New access role'),
  sendNotifications: z.boolean().default(true).describe('Send update notifications'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function patchAcl(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof patchAclSchema>
): Promise<string> {
  const requestBody: calendar_v3.Schema$AclRule = {};
  if (args.role !== undefined) {
    requestBody.role = args.role;
  }

  const response = await calendar.acl.patch({
    calendarId: args.calendarId,
    ruleId: args.ruleId,
    sendNotifications: args.sendNotifications,
    requestBody,
  });

  const rule = response.data;
  return `Successfully patched ACL rule ${args.ruleId}\nRole: ${rule.role}`;
}

// ==================== Acl.delete ====================
export const deleteAclSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  ruleId: z.string().describe('ACL rule ID to delete'),
  sendNotifications: z.boolean().default(true).describe('Send deletion notifications'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function deleteAcl(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof deleteAclSchema>
): Promise<string> {
  await calendar.acl.delete({
    calendarId: args.calendarId,
    ruleId: args.ruleId,
    sendNotifications: args.sendNotifications,
  });

  return `Successfully deleted ACL rule ${args.ruleId} from calendar ${args.calendarId}`;
}

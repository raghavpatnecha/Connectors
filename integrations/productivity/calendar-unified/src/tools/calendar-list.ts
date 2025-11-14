/**
 * Google Calendar CalendarList Tools (3 tools)
 * Manages user's calendar list (subscriptions)
 */

import { calendar_v3 } from 'googleapis';
import { z } from 'zod';

// ==================== CalendarList.list ====================
export const listCalendarListSchema = z.object({
  showHidden: z.boolean().default(false).describe('Show hidden calendar list entries'),
  showDeleted: z.boolean().default(false).describe('Show deleted calendar list entries'),
  minAccessRole: z.enum(['freeBusyReader', 'owner', 'reader', 'writer']).optional().describe('Minimum access role'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function listCalendarList(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof listCalendarListSchema>
): Promise<string> {
  const response = await calendar.calendarList.list({
    showHidden: args.showHidden,
    showDeleted: args.showDeleted,
    minAccessRole: args.minAccessRole,
  });

  const entries = response.data.items || [];
  if (entries.length === 0) {
    return 'No calendar list entries found';
  }

  const entryList = entries
    .map((entry) => {
      const primary = entry.primary ? ' (Primary)' : '';
      const hidden = entry.hidden ? ' [Hidden]' : '';
      const deleted = entry.deleted ? ' [Deleted]' : '';
      return `- "${entry.summary}"${primary}${hidden}${deleted}\n  ID: ${entry.id}\n  Access: ${entry.accessRole}\n  Color: ${entry.colorId || 'default'}\n  Selected: ${entry.selected}`;
    })
    .join('\n');

  return `Successfully listed ${entries.length} calendar list entries:\n${entryList}`;
}

// ==================== CalendarList.insert ====================
export const insertCalendarListSchema = z.object({
  calendarId: z.string().describe('Calendar ID to add to list'),
  colorId: z.string().optional().describe('Color ID (1-24)'),
  hidden: z.boolean().default(false).describe('Hide from calendar list'),
  selected: z.boolean().default(true).describe('Show events in main calendar view'),
  summaryOverride: z.string().optional().describe('Override calendar summary'),
  defaultReminders: z.array(z.object({ method: z.string(), minutes: z.number() })).optional().describe('Default reminders'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function insertCalendarList(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof insertCalendarListSchema>
): Promise<string> {
  const response = await calendar.calendarList.insert({
    requestBody: {
      id: args.calendarId,
      colorId: args.colorId,
      hidden: args.hidden,
      selected: args.selected,
      summaryOverride: args.summaryOverride,
      defaultReminders: args.defaultReminders,
    },
  });

  const entry = response.data;
  return `Successfully added calendar to list: "${entry.summary}"\nID: ${entry.id}\nAccess: ${entry.accessRole}`;
}

// ==================== CalendarList.delete ====================
export const deleteCalendarListSchema = z.object({
  calendarId: z.string().describe('Calendar ID to remove from list'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function deleteCalendarList(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof deleteCalendarListSchema>
): Promise<string> {
  await calendar.calendarList.delete({
    calendarId: args.calendarId,
  });

  return `Successfully removed calendar (ID: ${args.calendarId}) from calendar list`;
}

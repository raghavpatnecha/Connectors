/**
 * Google Calendar Calendars Tools (8 tools)
 * Implements calendar management operations
 */

import { calendar_v3 } from 'googleapis';
import { z } from 'zod';
import { validateColorId } from '../utils/helpers.js';

// ==================== Calendars.list (via CalendarList) ====================
export const listCalendarsSchema = z.object({
  showHidden: z.boolean().default(false).describe('Show hidden calendars'),
  showDeleted: z.boolean().default(false).describe('Show deleted calendars'),
  minAccessRole: z.enum(['freeBusyReader', 'owner', 'reader', 'writer']).optional().describe('Minimum access role'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function listCalendars(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof listCalendarsSchema>
): Promise<string> {
  const response = await calendar.calendarList.list({
    showHidden: args.showHidden,
    showDeleted: args.showDeleted,
    minAccessRole: args.minAccessRole,
  });

  const calendars = response.data.items || [];
  if (calendars.length === 0) {
    return 'No calendars found';
  }

  const calendarList = calendars
    .map((cal) => {
      const primary = cal.primary ? ' (Primary)' : '';
      const summary = cal.summary || 'No Summary';
      return `- "${summary}"${primary}\n  ID: ${cal.id}\n  Access: ${cal.accessRole}`;
    })
    .join('\n');

  return `Successfully listed ${calendars.length} calendars:\n${calendarList}`;
}

// ==================== Calendars.get ====================
export const getCalendarSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function getCalendar(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof getCalendarSchema>
): Promise<string> {
  const response = await calendar.calendars.get({
    calendarId: args.calendarId,
  });

  const cal = response.data;
  return `Calendar Details:
- Summary: ${cal.summary}
- Description: ${cal.description || 'No description'}
- Location: ${cal.location || 'No location'}
- Timezone: ${cal.timeZone}
- ID: ${cal.id}`;
}

// ==================== Calendars.insert ====================
export const insertCalendarSchema = z.object({
  summary: z.string().describe('Calendar name'),
  description: z.string().optional().describe('Calendar description'),
  location: z.string().optional().describe('Geographic location'),
  timezone: z.string().optional().describe('Timezone (e.g., America/New_York)'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function insertCalendar(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof insertCalendarSchema>
): Promise<string> {
  const response = await calendar.calendars.insert({
    requestBody: {
      summary: args.summary,
      description: args.description,
      location: args.location,
      timeZone: args.timezone,
    },
  });

  const cal = response.data;
  return `Successfully created calendar "${cal.summary}"\nID: ${cal.id}`;
}

// ==================== Calendars.update ====================
export const updateCalendarSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  summary: z.string().optional().describe('New calendar name'),
  description: z.string().optional().describe('New description'),
  location: z.string().optional().describe('New location'),
  timezone: z.string().optional().describe('New timezone'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function updateCalendar(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof updateCalendarSchema>
): Promise<string> {
  // Get existing calendar
  const existing = await calendar.calendars.get({ calendarId: args.calendarId });
  const calendarBody: calendar_v3.Schema$Calendar = { ...existing.data };

  if (args.summary !== undefined) calendarBody.summary = args.summary;
  if (args.description !== undefined) calendarBody.description = args.description;
  if (args.location !== undefined) calendarBody.location = args.location;
  if (args.timezone !== undefined) calendarBody.timeZone = args.timezone;

  const response = await calendar.calendars.update({
    calendarId: args.calendarId,
    requestBody: calendarBody,
  });

  return `Successfully updated calendar "${response.data.summary}" (ID: ${args.calendarId})`;
}

// ==================== Calendars.patch ====================
export const patchCalendarSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  summary: z.string().optional().describe('New calendar name'),
  description: z.string().optional().describe('New description'),
  location: z.string().optional().describe('New location'),
  timezone: z.string().optional().describe('New timezone'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function patchCalendar(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof patchCalendarSchema>
): Promise<string> {
  const calendarBody: calendar_v3.Schema$Calendar = {};

  if (args.summary !== undefined) calendarBody.summary = args.summary;
  if (args.description !== undefined) calendarBody.description = args.description;
  if (args.location !== undefined) calendarBody.location = args.location;
  if (args.timezone !== undefined) calendarBody.timeZone = args.timezone;

  const response = await calendar.calendars.patch({
    calendarId: args.calendarId,
    requestBody: calendarBody,
  });

  return `Successfully patched calendar "${response.data.summary}" (ID: ${args.calendarId})`;
}

// ==================== Calendars.delete ====================
export const deleteCalendarSchema = z.object({
  calendarId: z.string().describe('Calendar ID to delete'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function deleteCalendar(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof deleteCalendarSchema>
): Promise<string> {
  await calendar.calendars.delete({
    calendarId: args.calendarId,
  });

  return `Successfully deleted calendar (ID: ${args.calendarId})`;
}

// ==================== Calendars.clear ====================
export const clearCalendarSchema = z.object({
  calendarId: z.string().describe('Calendar ID'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function clearCalendar(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof clearCalendarSchema>
): Promise<string> {
  await calendar.calendars.clear({
    calendarId: args.calendarId,
  });

  return `Successfully cleared all events from calendar (ID: ${args.calendarId})`;
}

// ==================== Freebusy.query ====================
export const freebusyQuerySchema = z.object({
  timeMin: z.string().describe('Start of time range (RFC3339)'),
  timeMax: z.string().describe('End of time range (RFC3339)'),
  calendarIds: z.array(z.string()).describe('Calendar IDs to check'),
  groupExpansionMax: z.number().optional().describe('Max groups to expand'),
  calendarExpansionMax: z.number().optional().describe('Max calendars to expand'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function freebusyQuery(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof freebusyQuerySchema>
): Promise<string> {
  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: args.timeMin,
      timeMax: args.timeMax,
      items: args.calendarIds.map((id) => ({ id })),
      groupExpansionMax: args.groupExpansionMax,
      calendarExpansionMax: args.calendarExpansionMax,
    },
  });

  const calendars = response.data.calendars || {};
  const results: string[] = [];

  for (const [calId, data] of Object.entries(calendars)) {
    const busy = data.busy || [];
    if (busy.length === 0) {
      results.push(`${calId}: Free during entire period`);
    } else {
      const busyTimes = busy.map((b) => `  ${b.start} to ${b.end}`).join('\n');
      results.push(`${calId}: Busy during:\n${busyTimes}`);
    }
  }

  return `Free/Busy Query Results:\n${results.join('\n\n')}`;
}

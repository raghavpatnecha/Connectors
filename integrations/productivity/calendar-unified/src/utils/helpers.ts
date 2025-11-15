/**
 * Utility functions for Calendar MCP server
 */

import { calendar_v3 } from 'googleapis';

/**
 * Parse and validate reminders input
 */
export function parseReminders(
  reminders: string | Array<{ method: string; minutes: number }> | undefined
): Array<{ method: string; minutes: number }> {
  if (!reminders) return [];

  let reminderList: Array<{ method: string; minutes: number }>;

  if (typeof reminders === 'string') {
    try {
      reminderList = JSON.parse(reminders);
    } catch (e) {
      console.warn(`Invalid JSON for reminders: ${e}`);
      return [];
    }
  } else {
    reminderList = reminders;
  }

  if (!Array.isArray(reminderList)) {
    console.warn('Reminders must be an array');
    return [];
  }

  // Validate and truncate to max 5 reminders
  const validated = reminderList
    .slice(0, 5)
    .filter((r) => {
      if (!r.method || !['popup', 'email'].includes(r.method.toLowerCase())) {
        console.warn(`Invalid reminder method: ${r.method}`);
        return false;
      }
      if (typeof r.minutes !== 'number' || r.minutes < 0 || r.minutes > 40320) {
        console.warn(`Invalid reminder minutes: ${r.minutes}`);
        return false;
      }
      return true;
    })
    .map((r) => ({ method: r.method.toLowerCase(), minutes: r.minutes }));

  return validated;
}

/**
 * Validate transparency value
 */
export function validateTransparency(transparency: string | undefined): 'opaque' | 'transparent' | undefined {
  if (!transparency) return undefined;
  if (transparency === 'opaque' || transparency === 'transparent') {
    return transparency;
  }
  console.warn(`Invalid transparency value: ${transparency}. Must be 'opaque' or 'transparent'`);
  return undefined;
}

/**
 * Format RFC3339 datetime string
 */
export function correctTimeFormat(timeStr: string | undefined): string | undefined {
  if (!timeStr) return undefined;

  // Date-only format (YYYY-MM-DD)
  if (timeStr.length === 10 && timeStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return `${timeStr}T00:00:00Z`;
  }

  // DateTime without timezone (YYYY-MM-DDTHH:MM:SS)
  if (
    timeStr.length === 19 &&
    timeStr[10] === 'T' &&
    !timeStr.endsWith('Z') &&
    !timeStr.includes('+') &&
    timeStr.lastIndexOf('-') < 10
  ) {
    return `${timeStr}Z`;
  }

  return timeStr;
}

/**
 * Format attendee details for display
 */
export function formatAttendees(attendees: calendar_v3.Schema$EventAttendee[] | undefined): string {
  if (!attendees || attendees.length === 0) return 'None';

  return attendees
    .map((a) => {
      const parts = [`${a.email}: ${a.responseStatus || 'unknown'}`];
      if (a.organizer) parts.push('(organizer)');
      if (a.optional) parts.push('(optional)');
      return parts.join(' ');
    })
    .join('\n  ');
}

/**
 * Format attachment details for display
 */
export function formatAttachments(attachments: calendar_v3.Schema$EventAttachment[] | undefined): string {
  if (!attachments || attachments.length === 0) return 'None';

  return attachments
    .map((att) => {
      return `${att.title || 'Untitled'}\n  File URL: ${att.fileUrl || 'No URL'}\n  File ID: ${att.fileId || 'No ID'}\n  MIME Type: ${att.mimeType || 'Unknown'}`;
    })
    .join('\n  ');
}

/**
 * Extract Google Drive file ID from URL
 */
export function extractFileId(urlOrId: string): string | null {
  if (urlOrId.startsWith('https://')) {
    const match = urlOrId.match(/(?:\/d\/|\/file\/d\/|id=)([\w-]+)/);
    return match ? match[1] : null;
  }
  return urlOrId;
}

/**
 * Parse color ID (1-24 for events, 1-24 for calendars)
 */
export function validateColorId(colorId: string | number | undefined, type: 'event' | 'calendar'): string | undefined {
  if (!colorId) return undefined;
  const id = typeof colorId === 'number' ? colorId.toString() : colorId;
  const num = parseInt(id, 10);
  if (num >= 1 && num <= 24) {
    return id;
  }
  console.warn(`Invalid ${type} colorId: ${colorId}. Must be 1-24`);
  return undefined;
}

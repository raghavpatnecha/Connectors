/**
 * Google Calendar Events Tools (12 tools)
 * Implements all event-related operations for Calendar API
 */

import { calendar_v3 } from 'googleapis';
import { z } from 'zod';
import {
  parseReminders,
  validateTransparency,
  correctTimeFormat,
  formatAttendees,
  formatAttachments,
  extractFileId,
} from '../utils/helpers.js';

// ==================== Events.list ====================
export const listEventsSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  timeMin: z.string().optional().describe('Start of time range (RFC3339)'),
  timeMax: z.string().optional().describe('End of time range (RFC3339)'),
  maxResults: z.number().default(25).describe('Maximum number of events'),
  query: z.string().optional().describe('Free text search'),
  showDeleted: z.boolean().default(false).describe('Show deleted events'),
  singleEvents: z.boolean().default(true).describe('Expand recurring events'),
  orderBy: z.enum(['startTime', 'updated']).default('startTime').describe('Order results by'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function listEvents(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof listEventsSchema>
): Promise<string> {
  const timeMin = correctTimeFormat(args.timeMin) || new Date().toISOString();
  const timeMax = correctTimeFormat(args.timeMax);

  const response = await calendar.events.list({
    calendarId: args.calendarId,
    timeMin,
    timeMax,
    maxResults: args.maxResults,
    q: args.query,
    showDeleted: args.showDeleted,
    singleEvents: args.singleEvents,
    orderBy: args.orderBy,
  });

  const events = response.data.items || [];
  if (events.length === 0) {
    return `No events found in calendar '${args.calendarId}'`;
  }

  const eventList = events
    .map((e) => {
      const start = e.start?.dateTime || e.start?.date || 'Unknown';
      const end = e.end?.dateTime || e.end?.date || 'Unknown';
      return `- "${e.summary || 'No Title'}" (Start: ${start}, End: ${end}) ID: ${e.id}`;
    })
    .join('\n');

  return `Successfully retrieved ${events.length} events:\n${eventList}`;
}

// ==================== Events.get ====================
export const getEventSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  eventId: z.string().describe('Event ID'),
  detailed: z.boolean().default(false).describe('Include detailed information'),
  includeAttachments: z.boolean().default(false).describe('Include attachment details'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function getEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof getEventSchema>
): Promise<string> {
  const response = await calendar.events.get({
    calendarId: args.calendarId,
    eventId: args.eventId,
  });

  const event = response.data;
  const start = event.start?.dateTime || event.start?.date || 'Unknown';
  const end = event.end?.dateTime || event.end?.date || 'Unknown';

  if (!args.detailed) {
    return `Event: "${event.summary || 'No Title'}" (Start: ${start}, End: ${end}) ID: ${event.id}\nLink: ${event.htmlLink}`;
  }

  let details = `Event Details:
- Title: ${event.summary || 'No Title'}
- Starts: ${start}
- Ends: ${end}
- Description: ${event.description || 'No Description'}
- Location: ${event.location || 'No Location'}
- Attendees: ${formatAttendees(event.attendees)}`;

  if (args.includeAttachments) {
    details += `\n- Attachments: ${formatAttachments(event.attachments)}`;
  }

  details += `\n- Event ID: ${event.id}\n- Link: ${event.htmlLink}`;

  return details;
}

// ==================== Events.insert (create) ====================
export const createEventSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  summary: z.string().describe('Event title'),
  startTime: z.string().describe('Start time (RFC3339 or YYYY-MM-DD)'),
  endTime: z.string().describe('End time (RFC3339 or YYYY-MM-DD)'),
  description: z.string().optional().describe('Event description'),
  location: z.string().optional().describe('Event location'),
  attendees: z.array(z.string()).optional().describe('Attendee emails'),
  timezone: z.string().optional().describe('Timezone (e.g., America/New_York)'),
  attachments: z.array(z.string()).optional().describe('Google Drive file URLs or IDs'),
  addGoogleMeet: z.boolean().default(false).describe('Add Google Meet conference'),
  reminders: z.union([z.string(), z.array(z.object({ method: z.string(), minutes: z.number() }))]).optional().describe('Custom reminders'),
  useDefaultReminders: z.boolean().default(true).describe('Use default calendar reminders'),
  transparency: z.enum(['opaque', 'transparent']).optional().describe('Busy/Free status'),
  colorId: z.string().optional().describe('Event color (1-11)'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function createEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof createEventSchema>
): Promise<string> {
  const eventBody: calendar_v3.Schema$Event = {
    summary: args.summary,
    start: args.startTime.includes('T')
      ? { dateTime: args.startTime, timeZone: args.timezone }
      : { date: args.startTime },
    end: args.endTime.includes('T')
      ? { dateTime: args.endTime, timeZone: args.timezone }
      : { date: args.endTime },
    description: args.description,
    location: args.location,
    colorId: args.colorId,
    transparency: validateTransparency(args.transparency),
  };

  if (args.attendees && args.attendees.length > 0) {
    eventBody.attendees = args.attendees.map((email) => ({ email }));
  }

  // Handle reminders
  const validatedReminders = parseReminders(args.reminders);
  if (validatedReminders.length > 0) {
    eventBody.reminders = { useDefault: false, overrides: validatedReminders };
  } else if (!args.useDefaultReminders) {
    eventBody.reminders = { useDefault: false };
  }

  // Add Google Meet
  if (args.addGoogleMeet) {
    eventBody.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  // Handle attachments (simplified - would need Drive API integration)
  if (args.attachments && args.attachments.length > 0) {
    eventBody.attachments = args.attachments.map((att) => {
      const fileId = extractFileId(att);
      return {
        fileUrl: `https://drive.google.com/open?id=${fileId}`,
        fileId: fileId || undefined,
        title: 'Drive Attachment',
        mimeType: 'application/vnd.google-apps.drive-sdk',
      };
    });
  }

  const response = await calendar.events.insert({
    calendarId: args.calendarId,
    requestBody: eventBody,
    conferenceDataVersion: args.addGoogleMeet ? 1 : 0,
    supportsAttachments: args.attachments && args.attachments.length > 0,
  });

  const event = response.data;
  let message = `Successfully created event "${event.summary}" (ID: ${event.id})\nLink: ${event.htmlLink}`;

  // Add Meet link if available
  if (args.addGoogleMeet && event.conferenceData?.entryPoints) {
    const meetEntry = event.conferenceData.entryPoints.find((e) => e.entryPointType === 'video');
    if (meetEntry?.uri) {
      message += `\nGoogle Meet: ${meetEntry.uri}`;
    }
  }

  return message;
}

// ==================== Events.update ====================
export const updateEventSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  eventId: z.string().describe('Event ID'),
  summary: z.string().optional().describe('New event title'),
  startTime: z.string().optional().describe('New start time'),
  endTime: z.string().optional().describe('New end time'),
  description: z.string().optional().describe('New description'),
  location: z.string().optional().describe('New location'),
  attendees: z.array(z.string()).optional().describe('New attendee emails'),
  timezone: z.string().optional().describe('New timezone'),
  addGoogleMeet: z.boolean().optional().describe('Add/remove Google Meet'),
  reminders: z.union([z.string(), z.array(z.object({ method: z.string(), minutes: z.number() }))]).optional().describe('New reminders'),
  useDefaultReminders: z.boolean().optional().describe('Use default reminders'),
  transparency: z.enum(['opaque', 'transparent']).optional().describe('Busy/Free status'),
  colorId: z.string().optional().describe('Event color'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function updateEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof updateEventSchema>
): Promise<string> {
  // Get existing event
  const existing = await calendar.events.get({
    calendarId: args.calendarId,
    eventId: args.eventId,
  });

  const eventBody: calendar_v3.Schema$Event = { ...existing.data };

  // Update fields
  if (args.summary !== undefined) eventBody.summary = args.summary;
  if (args.description !== undefined) eventBody.description = args.description;
  if (args.location !== undefined) eventBody.location = args.location;
  if (args.colorId !== undefined) eventBody.colorId = args.colorId;
  if (args.transparency !== undefined) eventBody.transparency = validateTransparency(args.transparency);

  if (args.startTime) {
    eventBody.start = args.startTime.includes('T')
      ? { dateTime: args.startTime, timeZone: args.timezone }
      : { date: args.startTime };
  }

  if (args.endTime) {
    eventBody.end = args.endTime.includes('T')
      ? { dateTime: args.endTime, timeZone: args.timezone }
      : { date: args.endTime };
  }

  if (args.attendees) {
    eventBody.attendees = args.attendees.map((email) => ({ email }));
  }

  // Handle reminders
  if (args.reminders !== undefined || args.useDefaultReminders !== undefined) {
    const validatedReminders = parseReminders(args.reminders);
    if (validatedReminders.length > 0) {
      eventBody.reminders = { useDefault: false, overrides: validatedReminders };
    } else if (args.useDefaultReminders !== undefined) {
      eventBody.reminders = { useDefault: args.useDefaultReminders };
    }
  }

  // Handle Google Meet
  if (args.addGoogleMeet === true) {
    eventBody.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  } else if (args.addGoogleMeet === false) {
    eventBody.conferenceData = undefined;
  }

  const response = await calendar.events.update({
    calendarId: args.calendarId,
    eventId: args.eventId,
    requestBody: eventBody,
    conferenceDataVersion: args.addGoogleMeet !== undefined ? 1 : 0,
  });

  return `Successfully updated event "${response.data.summary}" (ID: ${args.eventId})\nLink: ${response.data.htmlLink}`;
}

// ==================== Events.patch ====================
export const patchEventSchema = updateEventSchema;

export async function patchEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof patchEventSchema>
): Promise<string> {
  const eventBody: calendar_v3.Schema$Event = {};

  if (args.summary !== undefined) eventBody.summary = args.summary;
  if (args.description !== undefined) eventBody.description = args.description;
  if (args.location !== undefined) eventBody.location = args.location;
  if (args.colorId !== undefined) eventBody.colorId = args.colorId;

  if (args.startTime) {
    eventBody.start = args.startTime.includes('T')
      ? { dateTime: args.startTime, timeZone: args.timezone }
      : { date: args.startTime };
  }

  if (args.endTime) {
    eventBody.end = args.endTime.includes('T')
      ? { dateTime: args.endTime, timeZone: args.timezone }
      : { date: args.endTime };
  }

  const response = await calendar.events.patch({
    calendarId: args.calendarId,
    eventId: args.eventId,
    requestBody: eventBody,
  });

  return `Successfully patched event "${response.data.summary}" (ID: ${args.eventId})`;
}

// ==================== Events.delete ====================
export const deleteEventSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  eventId: z.string().describe('Event ID'),
  sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Send cancellation notifications'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function deleteEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof deleteEventSchema>
): Promise<string> {
  await calendar.events.delete({
    calendarId: args.calendarId,
    eventId: args.eventId,
    sendUpdates: args.sendUpdates,
  });

  return `Successfully deleted event (ID: ${args.eventId}) from calendar '${args.calendarId}'`;
}

// ==================== Events.import ====================
export const importEventSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  eventData: z.string().describe('Event data (JSON string)'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function importEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof importEventSchema>
): Promise<string> {
  const eventBody = JSON.parse(args.eventData) as calendar_v3.Schema$Event;

  const response = await calendar.events.import({
    calendarId: args.calendarId,
    requestBody: eventBody,
  });

  return `Successfully imported event "${response.data.summary}" (ID: ${response.data.id})`;
}

// ==================== Events.move ====================
export const moveEventSchema = z.object({
  calendarId: z.string().describe('Source calendar ID'),
  eventId: z.string().describe('Event ID'),
  destination: z.string().describe('Destination calendar ID'),
  sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Send update notifications'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function moveEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof moveEventSchema>
): Promise<string> {
  const response = await calendar.events.move({
    calendarId: args.calendarId,
    eventId: args.eventId,
    destination: args.destination,
    sendUpdates: args.sendUpdates,
  });

  return `Successfully moved event "${response.data.summary}" (ID: ${args.eventId}) from '${args.calendarId}' to '${args.destination}'`;
}

// ==================== Events.quickAdd ====================
export const quickAddEventSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  text: z.string().describe('Natural language event description (e.g., "Lunch with John tomorrow at 12pm")'),
  sendUpdates: z.enum(['all', 'externalOnly', 'none']).default('all').describe('Send notifications'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function quickAddEvent(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof quickAddEventSchema>
): Promise<string> {
  const response = await calendar.events.quickAdd({
    calendarId: args.calendarId,
    text: args.text,
    sendUpdates: args.sendUpdates,
  });

  const event = response.data;
  const start = event.start?.dateTime || event.start?.date || 'Unknown';
  return `Successfully created event "${event.summary}" via quick add\nStart: ${start}\nID: ${event.id}\nLink: ${event.htmlLink}`;
}

// ==================== Events.instances ====================
export const getInstancesSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  eventId: z.string().describe('Recurring event ID'),
  timeMin: z.string().optional().describe('Start of time range'),
  timeMax: z.string().optional().describe('End of time range'),
  maxResults: z.number().default(25).describe('Maximum instances'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function getInstances(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof getInstancesSchema>
): Promise<string> {
  const response = await calendar.events.instances({
    calendarId: args.calendarId,
    eventId: args.eventId,
    timeMin: correctTimeFormat(args.timeMin),
    timeMax: correctTimeFormat(args.timeMax),
    maxResults: args.maxResults,
  });

  const instances = response.data.items || [];
  if (instances.length === 0) {
    return `No instances found for recurring event ${args.eventId}`;
  }

  const instanceList = instances
    .map((e) => {
      const start = e.start?.dateTime || e.start?.date || 'Unknown';
      return `- "${e.summary}" at ${start} (ID: ${e.id})`;
    })
    .join('\n');

  return `Found ${instances.length} instances:\n${instanceList}`;
}

// ==================== Events.watch ====================
export const watchEventsSchema = z.object({
  calendarId: z.string().default('primary').describe('Calendar ID'),
  channelId: z.string().describe('Unique channel ID'),
  address: z.string().describe('Webhook URL'),
  expiration: z.number().optional().describe('Expiration timestamp (ms)'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function watchEvents(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof watchEventsSchema>
): Promise<string> {
  const response = await calendar.events.watch({
    calendarId: args.calendarId,
    requestBody: {
      id: args.channelId,
      type: 'web_hook',
      address: args.address,
      expiration: args.expiration?.toString(),
    },
  });

  return `Successfully created watch channel\nChannel ID: ${response.data.id}\nResource ID: ${response.data.resourceId}\nExpiration: ${response.data.expiration}`;
}

// ==================== Channels.stop ====================
export const stopChannelSchema = z.object({
  channelId: z.string().describe('Channel ID'),
  resourceId: z.string().describe('Resource ID from watch response'),
  tenantId: z.string().describe('Tenant ID for OAuth'),
});

export async function stopChannel(
  calendar: calendar_v3.Calendar,
  args: z.infer<typeof stopChannelSchema>
): Promise<string> {
  await calendar.channels.stop({
    requestBody: {
      id: args.channelId,
      resourceId: args.resourceId,
    },
  });

  return `Successfully stopped channel ${args.channelId}`;
}

#!/usr/bin/env node

/**
 * Google Calendar MCP Server
 * Provides 29 tools for comprehensive Calendar management
 *
 * Categories:
 * - Events (12 tools): list, get, create, update, patch, delete, import, move, quickAdd, instances, watch, stopChannel
 * - Calendars (8 tools): list, get, insert, update, patch, delete, clear, freebusyQuery
 * - CalendarList (3 tools): list, insert, delete
 * - ACL (6 tools): list, get, insert, update, patch, delete
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { calendarClientFactory } from './clients/calendar-client.js';

// Import all tool schemas and handlers
import {
  // Events
  listEventsSchema, listEvents,
  getEventSchema, getEvent,
  createEventSchema, createEvent,
  updateEventSchema, updateEvent,
  patchEventSchema, patchEvent,
  deleteEventSchema, deleteEvent,
  importEventSchema, importEvent,
  moveEventSchema, moveEvent,
  quickAddEventSchema, quickAddEvent,
  getInstancesSchema, getInstances,
  watchEventsSchema, watchEvents,
  stopChannelSchema, stopChannel,
  // Calendars
  listCalendarsSchema, listCalendars,
  getCalendarSchema, getCalendar,
  insertCalendarSchema, insertCalendar,
  updateCalendarSchema, updateCalendar,
  patchCalendarSchema, patchCalendar,
  deleteCalendarSchema, deleteCalendar,
  clearCalendarSchema, clearCalendar,
  freebusyQuerySchema, freebusyQuery,
  // CalendarList
  listCalendarListSchema, listCalendarList,
  insertCalendarListSchema, insertCalendarList,
  deleteCalendarListSchema, deleteCalendarList,
  // ACL
  listAclSchema, listAcl,
  getAclSchema, getAcl,
  insertAclSchema, insertAcl,
  updateAclSchema, updateAcl,
  patchAclSchema, patchAcl,
  deleteAclSchema, deleteAcl,
} from './tools/index.js';

const server = new Server(
  {
    name: 'calendar-unified',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions (29 tools)
const TOOLS = [
  // Events (12)
  { name: 'calendar_list_events', description: 'List events from a calendar with filtering options', schema: listEventsSchema, handler: listEvents },
  { name: 'calendar_get_event', description: 'Get detailed information about a specific event', schema: getEventSchema, handler: getEvent },
  { name: 'calendar_create_event', description: 'Create a new calendar event with attendees, reminders, and attachments', schema: createEventSchema, handler: createEvent },
  { name: 'calendar_update_event', description: 'Update all fields of an existing event', schema: updateEventSchema, handler: updateEvent },
  { name: 'calendar_patch_event', description: 'Partially update specific fields of an event', schema: patchEventSchema, handler: patchEvent },
  { name: 'calendar_delete_event', description: 'Delete an event from a calendar', schema: deleteEventSchema, handler: deleteEvent },
  { name: 'calendar_import_event', description: 'Import an event from external calendar data', schema: importEventSchema, handler: importEvent },
  { name: 'calendar_move_event', description: 'Move an event to a different calendar', schema: moveEventSchema, handler: moveEvent },
  { name: 'calendar_quick_add_event', description: 'Create event from natural language (e.g., "Lunch tomorrow at 12pm")', schema: quickAddEventSchema, handler: quickAddEvent },
  { name: 'calendar_get_instances', description: 'Get instances of a recurring event', schema: getInstancesSchema, handler: getInstances },
  { name: 'calendar_watch_events', description: 'Set up push notifications for event changes', schema: watchEventsSchema, handler: watchEvents },
  { name: 'calendar_stop_channel', description: 'Stop receiving push notifications for a channel', schema: stopChannelSchema, handler: stopChannel },

  // Calendars (8)
  { name: 'calendar_list_calendars', description: 'List all calendars accessible to the user', schema: listCalendarsSchema, handler: listCalendars },
  { name: 'calendar_get_calendar', description: 'Get metadata for a specific calendar', schema: getCalendarSchema, handler: getCalendar },
  { name: 'calendar_insert_calendar', description: 'Create a new calendar', schema: insertCalendarSchema, handler: insertCalendar },
  { name: 'calendar_update_calendar', description: 'Update calendar metadata (full update)', schema: updateCalendarSchema, handler: updateCalendar },
  { name: 'calendar_patch_calendar', description: 'Partially update calendar metadata', schema: patchCalendarSchema, handler: patchCalendar },
  { name: 'calendar_delete_calendar', description: 'Delete a calendar', schema: deleteCalendarSchema, handler: deleteCalendar },
  { name: 'calendar_clear_calendar', description: 'Delete all events from a calendar', schema: clearCalendarSchema, handler: clearCalendar },
  { name: 'calendar_freebusy_query', description: 'Query free/busy information for calendars', schema: freebusyQuerySchema, handler: freebusyQuery },

  // CalendarList (3)
  { name: 'calendar_list_calendar_list', description: 'List user\'s calendar subscriptions', schema: listCalendarListSchema, handler: listCalendarList },
  { name: 'calendar_insert_calendar_list', description: 'Subscribe to a calendar', schema: insertCalendarListSchema, handler: insertCalendarList },
  { name: 'calendar_delete_calendar_list', description: 'Unsubscribe from a calendar', schema: deleteCalendarListSchema, handler: deleteCalendarList },

  // ACL (6)
  { name: 'calendar_list_acl', description: 'List access control rules for a calendar', schema: listAclSchema, handler: listAcl },
  { name: 'calendar_get_acl', description: 'Get a specific ACL rule', schema: getAclSchema, handler: getAcl },
  { name: 'calendar_insert_acl', description: 'Create a new ACL rule (share calendar)', schema: insertAclSchema, handler: insertAcl },
  { name: 'calendar_update_acl', description: 'Update an ACL rule (full update)', schema: updateAclSchema, handler: updateAcl },
  { name: 'calendar_patch_acl', description: 'Partially update an ACL rule', schema: patchAclSchema, handler: patchAcl },
  { name: 'calendar_delete_acl', description: 'Delete an ACL rule (unshare calendar)', schema: deleteAclSchema, handler: deleteAcl },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.schema.shape,
    })),
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    // Validate arguments
    const validatedArgs = tool.schema.parse(args);

    // Extract tenant ID and access token (injected by gateway)
    const tenantId = validatedArgs.tenantId;
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN || '';

    // Create Calendar client
    const calendar = await calendarClientFactory.getCalendarClient(tenantId, accessToken);

    // Execute tool
    const result = await tool.handler(calendar, validatedArgs);

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Calendar MCP Server running on stdio');
  console.error('29 tools available: Events(12), Calendars(8), CalendarList(3), ACL(6)');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

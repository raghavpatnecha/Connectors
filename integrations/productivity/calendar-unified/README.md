# Google Calendar MCP Server

Complete Google Calendar integration with **29 tools** for comprehensive calendar management.

## 📋 Tool Inventory

### Events (12 tools)
1. `calendar_list_events` - List events with filtering
2. `calendar_get_event` - Get event details
3. `calendar_create_event` - Create event with attachments & reminders
4. `calendar_update_event` - Full event update
5. `calendar_patch_event` - Partial event update
6. `calendar_delete_event` - Delete event
7. `calendar_import_event` - Import external event
8. `calendar_move_event` - Move event between calendars
9. `calendar_quick_add_event` - Natural language event creation
10. `calendar_get_instances` - Get recurring event instances
11. `calendar_watch_events` - Setup push notifications
12. `calendar_stop_channel` - Stop push notifications

### Calendars (8 tools)
13. `calendar_list_calendars` - List all calendars
14. `calendar_get_calendar` - Get calendar metadata
15. `calendar_insert_calendar` - Create new calendar
16. `calendar_update_calendar` - Full calendar update
17. `calendar_patch_calendar` - Partial calendar update
18. `calendar_delete_calendar` - Delete calendar
19. `calendar_clear_calendar` - Clear all events
20. `calendar_freebusy_query` - Query free/busy times

### CalendarList (3 tools)
21. `calendar_list_calendar_list` - List subscriptions
22. `calendar_insert_calendar_list` - Subscribe to calendar
23. `calendar_delete_calendar_list` - Unsubscribe

### ACL (6 tools)
24. `calendar_list_acl` - List access rules
25. `calendar_get_acl` - Get ACL rule
26. `calendar_insert_acl` - Share calendar
27. `calendar_update_acl` - Update permissions
28. `calendar_patch_acl` - Patch ACL rule
29. `calendar_delete_acl` - Revoke access

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## 🐳 Docker

```bash
docker build -t calendar-unified .
docker run -p 3131:3131 calendar-unified
```

## 🔧 Configuration

- **Port**: 3131
- **OAuth**: Credentials injected by MCP Gateway
- **API**: Google Calendar v3

## 📚 Reference

Based on [taylorwilsdon/google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp)

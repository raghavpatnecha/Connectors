# Google Calendar Integration

**Status:** ✅ Complete | **Category:** Productivity | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Calendar Unified MCP Server provides comprehensive calendar management with 29 tools covering events, calendars, access control, and free/busy queries. Enterprise-grade implementation with multi-tenant OAuth support.

### Key Features
- ✅ **29 Calendar Tools** - Complete calendar management
- ✅ **Event Management** - Create, update, move, recurring events
- ✅ **Calendar Operations** - Multiple calendars, sharing, subscriptions
- ✅ **Access Control** - Granular sharing permissions
- ✅ **Smart Features** - Quick add (natural language), free/busy queries
- ✅ **Push Notifications** - Watch for calendar changes

### Use Cases
- Automated meeting scheduling
- Calendar synchronization
- Room/resource booking
- Availability checking
- Recurring event management
- Team calendar sharing
- Event reminders and notifications

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google account with Calendar access

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services
- Enable Google Calendar API
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:3131/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3131/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
PORT=3131
```

**3. Run:**
```bash
cd integrations/productivity/calendar-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3131/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (29)

**Events (12):** `calendar_list_events`, `calendar_get_event`, `calendar_create_event`, `calendar_update_event`, `calendar_patch_event`, `calendar_delete_event`, `calendar_import_event`, `calendar_move_event`, `calendar_quick_add_event`, `calendar_get_instances`, `calendar_watch_events`, `calendar_stop_channel`

**Calendars (8):** `calendar_list_calendars`, `calendar_get_calendar`, `calendar_insert_calendar`, `calendar_update_calendar`, `calendar_patch_calendar`, `calendar_delete_calendar`, `calendar_clear_calendar`, `calendar_freebusy_query`

**CalendarList (3):** `calendar_list_calendar_list`, `calendar_insert_calendar_list`, `calendar_delete_calendar_list`

**ACL (6):** `calendar_list_acl`, `calendar_get_acl`, `calendar_insert_acl`, `calendar_update_acl`, `calendar_patch_acl`, `calendar_delete_acl`

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Event access

**Multi-Tenant:** Credentials stored at `secret/data/{tenantId}/google`

**Port:** 3131 (HTTP OAuth server)

**Event Format:** RFC 3339 timestamps (e.g., `2025-12-31T17:00:00Z`)

**Quick Add:** Natural language like "Lunch tomorrow at 12pm" or "Team meeting Friday 2-3pm"

---

## Known Limitations

### API Limitations
1. **Recurring events:** Complex recurrence rules may have edge cases
2. **Attendee limits:** Max 200 attendees per event
3. **Push notifications:** Require public HTTPS endpoint
4. **Free/busy:** Limited to calendars user has access to
5. **Time zones:** Must handle time zone conversions correctly

### Best Practices
- ✅ Use RFC 3339 format for all timestamps
- ✅ Set appropriate time zones
- ✅ Use `quick_add_event` for simple events
- ✅ Check free/busy before scheduling
- ✅ Handle recurring event exceptions properly
- ❌ Don't create duplicate events
- ❌ Don't exceed attendee limits

---

## Architecture Notes

**Stack:** Google Calendar API v3 → Shared OAuth → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3131) for OAuth

**Event Types:**
- **Single events:** One-time occurrences
- **Recurring events:** Repeat with rules (RRULE)
- **All-day events:** No specific time

**ACL Roles:**
- `freeBusyReader` - See only free/busy
- `reader` - Read events
- `writer` - Create/modify events
- `owner` - Full control

**Reference:** Based on [taylorwilsdon/google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp)

---

## Error Handling

**Event Not Found:**
```json
{
  "error": "NotFoundError",
  "message": "Event not found",
  "statusCode": 404
}
```

**Permission Denied:**
```json
{
  "error": "PermissionError",
  "message": "Insufficient permission to access calendar",
  "statusCode": 403
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **Calendar-level ACLs** for sharing
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Calendar API:** https://developers.google.com/calendar
- **Source:** `/integrations/productivity/calendar-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

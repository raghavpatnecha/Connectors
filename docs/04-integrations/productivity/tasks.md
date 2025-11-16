# Google Tasks Integration

**Status:** ✅ Complete | **Category:** Productivity | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Tasks Unified MCP Server provides comprehensive task management with 16 tools for task lists and tasks. Full support for subtasks, due dates, completion tracking, and multi-tenant OAuth.

### Key Features
- ✅ **16 Tasks Tools** - Complete task lifecycle management
- ✅ **Task Lists** - Multiple lists for organization
- ✅ **Subtasks** - Parent-child task relationships
- ✅ **Due Dates** - Schedule and track deadlines
- ✅ **Completion Tracking** - Mark complete/incomplete
- ✅ **Task Movement** - Reorder and reorganize tasks

### Use Cases
- Personal task management automation
- Project task tracking
- To-do list synchronization
- Deadline reminders and alerts
- Task delegation workflows
- GTD (Getting Things Done) systems
- Habit tracking and checklists

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google account with Tasks access

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services
- Enable Google Tasks API
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:3137/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3137/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
HTTP_PORT=3137
```

**3. Run:**
```bash
cd integrations/productivity/tasks-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3137/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (16)

**Task Lists (6):** `tasks_list_task_lists`, `tasks_get_task_list`, `tasks_create_task_list`, `tasks_update_task_list`, `tasks_patch_task_list`, `tasks_delete_task_list`

**Tasks (10):** `tasks_list_tasks`, `tasks_get_task`, `tasks_create_task`, `tasks_update_task`, `tasks_patch_task`, `tasks_delete_task`, `tasks_move_task`, `tasks_clear_completed`, `tasks_complete_task`, `tasks_uncomplete_task`

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/tasks` - Full Tasks access

**Multi-Tenant:** Credentials stored at `secret/data/{tenantId}/google`

**Port:** 3137 (HTTP OAuth server)

**Task Status:** `needsAction` (incomplete) or `completed`

**Timestamp Format:** RFC 3339 (e.g., `2025-12-31T17:00:00Z`)

---

## Known Limitations

### API Limitations
1. **Task depth:** Max 2 levels (task → subtask, no deeper nesting)
2. **Notes size:** Task notes limited to ~8KB
3. **Due dates:** Date only, no specific time of day
4. **Attachments:** Not supported
5. **Reminders:** Not directly accessible via API

### Best Practices
- ✅ Use RFC 3339 format for due dates
- ✅ Set parent task when creating subtasks
- ✅ Use `patch` for partial updates
- ✅ Use `complete_task` shortcut for marking done
- ✅ Clear completed tasks periodically
- ❌ Don't nest subtasks beyond one level
- ❌ Don't store large amounts of data in notes

---

## Architecture Notes

**Stack:** Google Tasks API v1 → Shared OAuth → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3137) for OAuth

**Task Hierarchy:**
- Task Lists (top level containers)
- Tasks (main items)
- Subtasks (child items with parent reference)

**Task Position:** Tasks have position strings for ordering within a list

**Move Operations:**
- Move task to different list
- Change parent (make/remove subtask)
- Reorder within list (change position)

---

## Error Handling

**Task Not Found:**
```json
{
  "error": "NotFoundError",
  "message": "Task not found",
  "statusCode": 404
}
```

**Invalid Parent:**
```json
{
  "error": "InvalidArgumentError",
  "message": "Parent task not found or invalid",
  "statusCode": 400
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **User-level isolation** of task data
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Tasks API:** https://developers.google.com/tasks
- **Source:** `/integrations/productivity/tasks-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

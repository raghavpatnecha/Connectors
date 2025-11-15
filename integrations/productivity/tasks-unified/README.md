# Google Tasks MCP Server

Unified MCP server for Google Tasks API with OAuth 2.0 multi-tenant authentication.

## Features

- **16 Tools** for comprehensive task and task list management
- **Task List Operations**: List, create, update, patch, delete
- **Task Operations**: List, create, update, patch, delete, move, complete, uncomplete, clear completed
- **Subtask Support**: Parent-child task relationships with positioning
- **Multi-Tenant OAuth 2.0**: Secure credential storage via HashiCorp Vault
- **Auto-Refresh**: Automatic token refresh before expiry
- **Dual Server**: stdio (MCP protocol) + HTTP (OAuth callbacks)

## Tools

### Task Lists (6 tools)

1. `tasks_list_task_lists` - List all task lists
2. `tasks_get_task_list` - Get task list details
3. `tasks_create_task_list` - Create new task list
4. `tasks_update_task_list` - Update task list
5. `tasks_patch_task_list` - Partially update task list
6. `tasks_delete_task_list` - Delete task list (and all tasks)

### Tasks (10 tools)

7. `tasks_list_tasks` - List tasks with filters (due dates, completion, etc.)
8. `tasks_get_task` - Get task details
9. `tasks_create_task` - Create new task (with subtask support)
10. `tasks_update_task` - Update task
11. `tasks_patch_task` - Partially update task
12. `tasks_delete_task` - Delete task
13. `tasks_move_task` - Move task (position, parent, or list)
14. `tasks_clear_completed` - Clear all completed tasks
15. `tasks_complete_task` - Mark task as completed (shortcut)
16. `tasks_uncomplete_task` - Mark task as not completed (shortcut)

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# HashiCorp Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=your_vault_token

# Server Configuration
HTTP_PORT=3137
LOG_LEVEL=info
NODE_ENV=production
```

### OAuth Setup

1. Create Google Cloud project at https://console.cloud.google.com
2. Enable Google Tasks API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized redirect URI: `http://localhost:3137/oauth/callback`
5. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## Usage

### Start Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### OAuth Authorization Flow

1. **Get Authorization URL**:
```bash
curl http://localhost:3137/oauth/authorize?tenantId=tenant-123
```

2. **User visits URL** and authorizes Google Tasks access

3. **Callback handled** automatically, credentials stored in Vault

### Using Tools via MCP

```typescript
// Example: List task lists
{
  "tool": "tasks_list_task_lists",
  "arguments": {
    "tenantId": "tenant-123",
    "maxResults": 100
  }
}

// Example: Create task with due date
{
  "tool": "tasks_create_task",
  "arguments": {
    "tenantId": "tenant-123",
    "taskListId": "MTIzNDU2Nzg5MDEyMzQ1Njc4OTA",
    "title": "Review Q4 Report",
    "notes": "Focus on revenue and growth metrics",
    "due": "2024-12-31T17:00:00Z"
  }
}

// Example: Create subtask
{
  "tool": "tasks_create_task",
  "arguments": {
    "tenantId": "tenant-123",
    "taskListId": "MTIzNDU2Nzg5MDEyMzQ1Njc4OTA",
    "title": "Analyze revenue trends",
    "parent": "parent-task-id",
    "previous": "previous-sibling-task-id"
  }
}

// Example: Complete task
{
  "tool": "tasks_complete_task",
  "arguments": {
    "tenantId": "tenant-123",
    "taskListId": "MTIzNDU2Nzg5MDEyMzQ1Njc4OTA",
    "taskId": "task-id-to-complete"
  }
}

// Example: Move task to different list
{
  "tool": "tasks_move_task",
  "arguments": {
    "tenantId": "tenant-123",
    "taskListId": "source-list-id",
    "taskId": "task-id",
    "destinationTaskList": "destination-list-id"
  }
}
```

## API Reference

### Task List Object

```typescript
{
  id: string;           // Task list ID
  title: string;        // Task list title
  updated: string;      // RFC 3339 timestamp
  selfLink: string;     // API resource link
}
```

### Task Object

```typescript
{
  id: string;           // Task ID
  title: string;        // Task title
  status: 'needsAction' | 'completed';
  due: string;          // RFC 3339 timestamp
  completed: string;    // RFC 3339 timestamp
  notes: string;        // Task description
  parent: string;       // Parent task ID (for subtasks)
  position: string;     // Position in list
  updated: string;      // Last modified timestamp
  selfLink: string;     // API resource link
  webViewLink: string;  // Web UI link
}
```

## Architecture

### Dual Server Design

- **stdio Transport**: MCP protocol communication
- **HTTP Server**: OAuth callbacks and health checks

### Multi-Tenant OAuth

- Credentials stored per-tenant in Vault: `secret/data/{tenantId}/google`
- Auto-refresh 5 minutes before token expiry
- Shared OAuth client for all Google services

### Rate Limiting

- **5 requests/second** per tenant
- **500 requests/minute** per tenant
- Token bucket algorithm with burst support

## Development

### Project Structure

```
tasks-unified/
├── src/
│   ├── index.ts              # Main entry (dual server)
│   ├── tools/
│   │   ├── tasklists.ts      # 6 task list tools
│   │   ├── tasks.ts          # 10 task tools
│   │   └── index.ts          # Tool exports
│   ├── clients/
│   │   └── tasks-client.ts   # Tasks API wrapper
│   └── utils/
│       ├── tool-registry-helper.ts
│       ├── logger.ts
│       └── error-handler.ts
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

## Docker

### Build Image

```bash
docker build -t connectors/tasks-unified:latest .
```

### Run Container

```bash
docker run -d \
  -p 3137:3000 \
  -e GOOGLE_CLIENT_ID=your_client_id \
  -e GOOGLE_CLIENT_SECRET=your_client_secret \
  -e VAULT_ADDR=http://vault:8200 \
  -e VAULT_TOKEN=dev-token \
  --name tasks-mcp \
  connectors/tasks-unified:latest
```

## Troubleshooting

### OAuth Errors

- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check redirect URI matches: `http://localhost:3137/oauth/callback`
- Ensure Google Tasks API is enabled in Cloud Console

### Vault Connection

- Verify `VAULT_ADDR` is accessible
- Check `VAULT_TOKEN` has read/write permissions to `secret/data/*`

### Rate Limiting

- Monitor HTTP 429 responses
- Implement exponential backoff in client
- Consider upgrading Google Workspace quota

## License

MIT

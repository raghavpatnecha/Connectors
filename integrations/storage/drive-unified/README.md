# Google Drive MCP Server - Unified Implementation

Comprehensive Google Drive MCP server with **41 tools** covering all major Drive API capabilities.

## 📊 Tool Inventory (41 tools)

### Files (18 tools)
1. `search_drive_files` - Search files with query syntax
2. `get_drive_file_content` - Read file content (Office formats supported)
3. `create_drive_file` - Create files from content or URLs
4. `list_drive_items` - List folder contents
5. `update_drive_file` - Update file metadata, move, star, etc.
6. `copy_file` - Duplicate files
7. `delete_file` - Move to trash (recoverable)
8. `permanently_delete_file` - Permanent deletion
9. `export_file` - Export to different formats (PDF, DOCX, etc.)
10. `generate_ids` - Pre-generate file IDs
11. `watch_file` - Subscribe to file changes
12. `stop_channel` - Unsubscribe from changes
13. `empty_trash` - Clear all trashed items
14. `get_file_revisions` - List file revisions
15. `update_revision` - Update revision metadata
16. `delete_revision` - Delete specific revision
17. `get_drive_file_permissions` - Get detailed permissions
18. `check_drive_file_public_access` - Check public sharing status

### Folders (4 tools)
19. `create_folder` - Create new folders
20. `move_file` - Move files/folders
21. `add_parent` - Add file to folder (multi-parent)
22. `remove_parent` - Remove from folder

### Permissions (5 tools)
23. `list_permissions` - List all permissions
24. `get_permission` - Get permission details
25. `create_permission` - Share with user/group/domain/anyone
26. `update_permission` - Modify permissions
27. `delete_permission` - Revoke access

### Comments (9 tools)
28. `list_comments` - List all comments
29. `get_comment` - Get comment details
30. `create_comment` - Add comment
31. `update_comment` - Edit comment
32. `delete_comment` - Remove comment
33. `list_replies` - List comment replies
34. `create_reply` - Reply to comment
35. `update_reply` - Edit reply
36. `delete_reply` - Delete reply

### Shared Drives (5 tools)
37. `list_drives` - List shared drives (Team Drives)
38. `get_drive` - Get drive details
39. `create_drive` - Create shared drive
40. `update_drive` - Update drive settings
41. `delete_drive` - Delete shared drive

## 🚀 Quick Start

### Installation

```bash
npm install
npm run build
```

### Configuration

Set environment variables:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GOOGLE_REDIRECT_URI="http://localhost:3000/oauth/callback"
export PORT=3132
```

### Running

```bash
npm start
```

### Docker

```bash
docker build -t drive-mcp .
docker run -p 3132:3132 \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  drive-mcp
```

## 🔐 Authentication

This server uses OAuth2 multi-tenant authentication. Each tool requires a `tenantId` parameter:

```json
{
  "tenantId": "user@example.com",
  "query": "name contains 'report'"
}
```

### OAuth Scopes Required

- `https://www.googleapis.com/auth/drive` - Full Drive access
- `https://www.googleapis.com/auth/drive.file` - Files created by app
- `https://www.googleapis.com/auth/drive.readonly` - Read-only access

## 📚 Usage Examples

### Search Files

```json
{
  "name": "search_drive_files",
  "arguments": {
    "tenantId": "user@example.com",
    "query": "name contains 'report' and mimeType='application/pdf'",
    "pageSize": 20
  }
}
```

### Create Folder

```json
{
  "name": "create_folder",
  "arguments": {
    "tenantId": "user@example.com",
    "folderName": "Project Files",
    "parentId": "root"
  }
}
```

### Share File

```json
{
  "name": "create_permission",
  "arguments": {
    "tenantId": "user@example.com",
    "fileId": "1abc...",
    "type": "user",
    "role": "reader",
    "emailAddress": "colleague@example.com"
  }
}
```

### Add Comment

```json
{
  "name": "create_comment",
  "arguments": {
    "tenantId": "user@example.com",
    "fileId": "1abc...",
    "content": "Great work on this document!"
  }
}
```

## 🏗️ Architecture

```
drive-unified/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── files.ts          # 18 file tools
│   │   ├── folders.ts        # 4 folder tools
│   │   ├── permissions.ts    # 5 permission tools
│   │   ├── comments.ts       # 9 comment tools
│   │   ├── shared-drives.ts  # 5 shared drive tools
│   │   └── index.ts          # Tool registry
│   ├── clients/
│   │   └── drive-client.ts   # OAuth2 client factory
│   └── utils/
│       ├── helpers.ts        # Helper functions
│       └── tool-registry-helper.ts
├── package.json
├── tsconfig.json
└── Dockerfile
```

## 🔧 Development

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Testing

```bash
npm test
```

## 📦 Dependencies

- `@modelcontextprotocol/sdk` - MCP SDK
- `googleapis` - Google Drive API v3
- `google-auth-library` - OAuth2 authentication
- `adm-zip` - Office file text extraction

## 🌐 Integration

### With Gateway

Configure in gateway's MCP registry:

```json
{
  "drive-unified": {
    "url": "http://drive-mcp:3132",
    "category": "storage",
    "tools": 41,
    "oauth": {
      "scopes": ["https://www.googleapis.com/auth/drive"]
    }
  }
}
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: drive-mcp
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: drive-mcp
        image: drive-mcp:latest
        ports:
        - containerPort: 3132
        env:
        - name: GOOGLE_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: google-oauth
              key: client-id
```

## 📝 Reference Implementation

Based on:
- **taylorwilsdon/google_workspace_mcp** - Python Drive implementation (7 tools)
- **Google Drive API v3** - Complete API documentation
- Extended to 41 tools for comprehensive coverage

## 🎯 Features

✅ **Multi-tenant** - OAuth per user/organization
✅ **Shared Drives** - Full Team Drive support
✅ **Comments** - Complete threading support
✅ **Permissions** - Granular access control
✅ **Revisions** - Version history management
✅ **Office Files** - Text extraction from .docx, .xlsx, .pptx
✅ **Type-safe** - Full TypeScript implementation
✅ **Production-ready** - Docker, health checks, error handling

## 📄 License

MIT

## 🤝 Contributing

See main repository contributing guidelines.

---

**Part of Connectors Platform** - 500+ integrations with intelligent tool selection

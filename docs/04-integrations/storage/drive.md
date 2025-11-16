# Google Drive Integration

**Status:** ✅ Complete | **Category:** Storage | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Drive Unified MCP Server provides comprehensive cloud storage management with 41 tools covering files, folders, permissions, comments, and shared drives. Enterprise-grade implementation with multi-tenant OAuth support.

### Key Features
- ✅ **41 Drive Tools** - Complete file and folder management
- ✅ **File Operations** - Search, read, create, update, delete, export
- ✅ **Folder Management** - Create, move, organize hierarchies
- ✅ **Permissions** - Granular sharing and access control
- ✅ **Comments** - File collaboration with threads
- ✅ **Shared Drives** - Team Drive support (formerly Team Drives)
- ✅ **Revisions** - Version history management

### Use Cases
- Cloud file synchronization
- Automated backup and archiving
- Document sharing and collaboration
- File organization and cleanup
- Access control management
- Team Drive administration
- Content migration workflows

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google account with Drive access

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services
- Enable Google Drive API
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:3132/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3132/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
PORT=3132
```

**3. Run:**
```bash
cd integrations/storage/drive-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3132/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (41)

**Files (18):** `search_drive_files`, `get_drive_file_content`, `create_drive_file`, `list_drive_items`, `update_drive_file`, `copy_file`, `delete_file`, `permanently_delete_file`, `export_file`, `generate_ids`, `watch_file`, `stop_channel`, `empty_trash`, `get_file_revisions`, `update_revision`, `delete_revision`, `get_drive_file_permissions`, `check_drive_file_public_access`

**Folders (4):** `create_folder`, `move_file`, `add_parent`, `remove_parent`

**Permissions (5):** `list_permissions`, `get_permission`, `create_permission`, `update_permission`, `delete_permission`

**Comments (9):** `list_comments`, `get_comment`, `create_comment`, `update_comment`, `delete_comment`, `list_replies`, `create_reply`, `update_reply`, `delete_reply`

**Shared Drives (5):** `list_drives`, `get_drive`, `create_drive`, `update_drive`, `delete_drive`

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/drive` - Full Drive access

**Multi-Tenant:** Credentials stored at `secret/data/{tenantId}/google`

**Port:** 3132 (HTTP OAuth server)

**Query Syntax:** Use Drive API query language (e.g., `name contains 'report' and mimeType='application/pdf'`)

**Export Formats:** PDF, DOCX, XLSX, PPTX, TXT, HTML, CSV, ODT, ODS, etc.

---

## Known Limitations

### API Limitations
1. **File size:** Downloads limited by memory (stream large files)
2. **Query complexity:** Very complex queries may timeout
3. **Shared Drive permissions:** Some restrictions on external sharing
4. **Revisions:** Not all file types support revisions
5. **Watch channels:** Limited number per project, require HTTPS endpoint

### Best Practices
- ✅ Use specific queries instead of listing all files
- ✅ Handle pagination for large result sets
- ✅ Use `fields` parameter to reduce response size
- ✅ Move to trash before permanent deletion
- ✅ Check permissions before sharing externally
- ❌ Don't poll for changes (use watch channels instead)
- ❌ Don't download very large files without streaming

---

## Architecture Notes

**Stack:** Google Drive API v3 → Shared OAuth → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3132) for OAuth

**File Organization:**
- Files can have multiple parents (folders)
- Trash is recoverable, permanent delete is not
- Starred files marked for quick access
- Shared Drives have different permission model

**MIME Types:**
- Google Workspace: `application/vnd.google-apps.*`
- Office formats: `application/vnd.openxmlformats-officedocument.*`
- Common: `application/pdf`, `image/png`, etc.

**Permission Roles:**
- `reader` - View only
- `commenter` - View and comment
- `writer` - Edit
- `owner` - Full control
- `organizer` - Shared Drive admin

**Reference:** Based on [taylorwilsdon/google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp)

---

## Error Handling

**File Not Found:**
```json
{
  "error": "NotFoundError",
  "message": "File not found or access denied",
  "statusCode": 404
}
```

**Storage Quota Exceeded:**
```json
{
  "error": "StorageQuotaError",
  "message": "User storage quota exceeded",
  "statusCode": 403
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **File-level permissions** for sharing
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls
- ✅ **Virus scanning** by Google (automatic)

---

## Support

- **Drive API:** https://developers.google.com/drive
- **Source:** `/integrations/storage/drive-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

# Google Chat Integration

**Status:** ✅ Complete | **Category:** Communication | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Chat Unified MCP Server provides comprehensive workspace messaging with 23 tools for spaces, messages, members, attachments, and reactions. Enterprise-grade implementation with multi-tenant OAuth support.

### Key Features
- ✅ **23 Chat Tools** - Complete Chat API coverage
- ✅ **Space Management** - Create and manage chat rooms
- ✅ **Rich Messaging** - Send messages with attachments and reactions
- ✅ **Member Management** - Add/remove users and groups
- ✅ **OAuth 2.0 Authentication** - Automatic token management
- ✅ **Multi-Tenant Support** - Isolated credentials per organization

### Use Cases
- Automated team notifications and announcements
- Create project-specific chat spaces
- Send rich formatted messages with cards
- Manage team membership programmatically
- Search across chat history
- Build custom chat bots

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google Workspace account with Chat enabled

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services → Credentials
- Enable Google Chat API
- Create OAuth 2.0 Client ID (Web application)
- Authorized redirect URI: `http://localhost:3138/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3138/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
PORT=3138
```

**3. Run:**
```bash
cd integrations/communication/chat-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3138/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (23)

**Spaces (6):** `list_spaces`, `get_space`, `create_space`, `update_space`, `delete_space`, `find_direct_message`

**Messages (5):** `list_messages`, `get_message`, `create_message`, `update_message`, `delete_message`

**Members (4):** `list_memberships`, `get_membership`, `create_membership`, `delete_membership`

**Attachments (2):** `get_attachment`, `upload_attachment`

**Reactions (3):** `list_reactions`, `create_reaction`, `delete_reaction`

**Advanced (3):** `search_messages`, `set_space_topic`, `batch_add_members`

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/chat.messages` - Send/read messages
- `https://www.googleapis.com/auth/chat.messages.create` - Create messages
- `https://www.googleapis.com/auth/chat.spaces` - Manage spaces
- `https://www.googleapis.com/auth/chat.spaces.readonly` - Read spaces

**Multi-Tenant:** Credentials stored in Vault at `secret/data/{tenantId}/google`

**Port:** 3138 (HTTP OAuth server)

---

## Known Limitations

### API Limitations
1. **Space types:** Only ROOM and DM spaces (no GROUP_CHAT)
2. **Message size:** Max 4KB text per message
3. **Attachments:** Max 200MB per file
4. **Rate limits:** Standard Google Workspace quotas apply
5. **Rich formatting:** Limited to simple markdown and cards

### Best Practices
- ✅ Use `find_direct_message` before creating DMs
- ✅ Set appropriate space visibility (SPACE_TYPE)
- ✅ Handle message threading correctly
- ✅ Use batch operations for multiple members
- ❌ Don't spam spaces with rapid messages
- ❌ Don't create duplicate DM spaces

---

## Architecture Notes

**Stack:** Google Chat API v1 → Shared OAuth Manager → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3138) for OAuth callbacks

**Space Types:**
- `ROOM` - Named spaces with multiple members
- `DM` - Direct message between 2 users
- `GROUP_DM` - Group direct message (not fully supported)

**Message Format:** Supports text, cards (formatted content), and attachments

---

## Error Handling

### Common Errors

**Space Not Found:**
```json
{
  "error": "NotFoundError",
  "message": "Space spaces/xxx not found",
  "statusCode": 404
}
```

**Permission Denied:**
```json
{
  "error": "PermissionError",
  "message": "User lacks permission to access space",
  "statusCode": 403
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic token refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **Space-level permissions** enforced by Google
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Google Chat API:** https://developers.google.com/chat
- **Source:** `/integrations/communication/chat-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

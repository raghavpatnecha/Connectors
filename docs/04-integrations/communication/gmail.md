# Gmail Integration

**Status:** ✅ Complete | **Category:** Communication | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Gmail Unified MCP Server provides comprehensive email management with 66 tools covering all major Gmail API capabilities. Built with multi-tenant OAuth 2.0 and HashiCorp Vault integration for secure credential storage.

### Key Features
- ✅ **66 Gmail Tools** - Complete email management functionality
- ✅ **OAuth 2.0 Authentication** - Automatic token management via Vault
- ✅ **Multi-Tenant Support** - Isolated credentials per tenant
- ✅ **Dual Server Architecture** - stdio (MCP) + HTTP (OAuth callbacks)
- ✅ **Production Ready** - Winston logging, error handling, rate limiting

### Use Cases
- Automated email management and filtering
- Inbox organization with labels and filters
- Draft creation and template management
- Email delegation and access control
- Push notifications for mailbox changes
- S/MIME encryption configuration

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google Cloud Project with Gmail API enabled

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services → Credentials
- Create OAuth 2.0 Client ID (Web application)
- Authorized redirect URI: `http://localhost:3130/oauth/callback`
- Copy Client ID and Secret

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3130/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
PORT=3130
```

**3. Run:**
```bash
cd integrations/communication/gmail-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3130/oauth/authorize?tenantId=my-tenant"
# Open returned authUrl in browser
```

---

## Available Tools (66)

**User Management (3):** `get_profile`, `watch_mailbox`, `stop_mail_watch`

**Messages (11):** `list_messages`, `get_message`, `send_message`, `delete_message`, `trash_message`, `untrash_message`, `modify_message`, `batch_modify_messages`, `batch_delete_messages`, `get_attachment`, `import_message`

**Labels (6):** `list_labels`, `get_label`, `create_label`, `update_label`, `patch_label`, `delete_label`

**Threads (6):** `list_threads`, `get_thread`, `modify_thread`, `trash_thread`, `untrash_thread`, `delete_thread`

**Drafts (6):** `list_drafts`, `get_draft`, `create_draft`, `update_draft`, `send_draft`, `delete_draft`

**Settings (34):** Auto-forwarding (2), IMAP (2), Language (2), POP (2), Vacation (2), Delegates (4), Filters (4), Forwarding Addresses (4), Send-as Aliases (7), S/MIME (5)

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/gmail.modify` - Read/write mail
- `https://www.googleapis.com/auth/gmail.compose` - Create drafts
- `https://www.googleapis.com/auth/gmail.send` - Send email
- `https://www.googleapis.com/auth/gmail.labels` - Manage labels
- `https://www.googleapis.com/auth/gmail.settings.basic` - Basic settings

**Multi-Tenant:** Each tenant has isolated credentials stored in Vault at `secret/data/{tenantId}/google`

**Health Check:** `GET /health` returns server status

---

## Known Limitations

### API Limitations
1. **Rate limits:** 250 quota units/user/second (varies by operation)
2. **Batch operations:** Max 1,000 messages per batch
3. **Attachment size:** Max 25MB per message (35MB with encoding)
4. **S/MIME:** Requires verified send-as alias
5. **Push notifications:** Requires topic configuration

### Best Practices
- ✅ Use batch operations for bulk message updates
- ✅ Monitor quota usage in Google Cloud Console
- ✅ Cache frequently used labels
- ✅ Use partial responses to reduce data transfer
- ❌ Don't exceed rate limits
- ❌ Don't use for mass mailing (use Google Groups instead)

---

## Architecture Notes

**Stack:** Google APIs Client → Shared OAuth Manager → Vault (credential storage) → Gmail API v1

**Dual Server Design:**
- stdio transport for MCP protocol communication
- HTTP server (port 3130) for OAuth callbacks

**Token Management:** Automatic refresh 5 minutes before expiry via shared OAuth manager

**Reference:** Based on [shinzo-labs/gmail-mcp](https://github.com/shinzolabs/gmail-mcp) with enhancements for multi-tenancy and Vault integration

---

## Error Handling

### Rate Limiting
```json
{
  "error": "RateLimitError",
  "message": "Gmail API quota exceeded",
  "statusCode": 429
}
```

### OAuth Errors
```json
{
  "error": "OAuthError",
  "message": "Authentication failed for tenant X",
  "statusCode": 401
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic token refresh
- ✅ **Per-tenant encryption** via Vault Transit engine
- ✅ **Secure token storage** in HashiCorp Vault
- ✅ **Audit logging** for all credential access
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Gmail API Documentation:** https://developers.google.com/gmail/api
- **Source:** `/integrations/communication/gmail-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

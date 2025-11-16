# Google Docs Integration

**Status:** ✅ Complete | **Category:** Documents | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Docs Unified MCP Server provides comprehensive document creation and editing with 32 tools. Full support for text manipulation, formatting, tables, images, and collaboration features.

### Key Features
- ✅ **32 Docs Tools** - Complete document management
- ✅ **Rich Formatting** - Text styles, fonts, colors, alignment
- ✅ **Tables & Lists** - Insert and manipulate complex structures
- ✅ **Images & Media** - Add images from URLs or Drive
- ✅ **Headers & Footers** - Document sections support
- ✅ **Find & Replace** - Advanced text operations

### Use Cases
- Automated report generation
- Template-based document creation
- Collaborative editing workflows
- Content migration from other formats
- Documentation automation
- Dynamic document updates

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google account with Docs access

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services
- Enable Google Docs API and Drive API
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:3133/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3133/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
HTTP_PORT=3133
```

**3. Run:**
```bash
cd integrations/documents/docs-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3133/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (32)

**Document Management (10):** Create document, get document info, search documents, copy document, delete document, export to PDF/DOCX/RTF, batch update, get document metadata, list document versions, share document

**Content Manipulation (12):** Insert text, delete text, replace text, insert table, insert image, insert page break, insert list, delete content range, format text (bold/italic/underline/color/size/font), find and replace, text-to-columns, merge cells

**Features (10):** Add header, add footer, update header, update footer, create named range, delete named range, add bookmark, delete bookmark, insert table of contents, update table of contents

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/documents` - Full Docs access
- `https://www.googleapis.com/auth/drive` - For Drive operations

**Multi-Tenant:** Credentials stored at `secret/data/{tenantId}/google`

**Port:** 3133 (HTTP OAuth server)

**Supported Export Formats:** PDF, DOCX, RTF, TXT, HTML, EPUB, ODT

---

## Known Limitations

### API Limitations
1. **Batch operations:** Max 500 requests per batchUpdate call
2. **Document size:** Very large docs (>100MB) may timeout
3. **Image sources:** URLs must be publicly accessible or from Drive
4. **Real-time collaboration:** API doesn't support live cursors
5. **Some features:** Page numbers, equation editor not fully supported

### Best Practices
- ✅ Use batch updates for multiple changes
- ✅ Work with document indexes for precise positioning
- ✅ Test formatting before applying to large sections
- ✅ Use named ranges for dynamic content areas
- ❌ Don't make too many small sequential updates
- ❌ Don't embed very large images (>10MB)

---

## Architecture Notes

**Stack:** Google Docs API v1 + Drive API v3 → Shared OAuth → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3133) for OAuth

**Document Structure:**
- Documents contain structural elements (paragraphs, tables, lists)
- Content is indexed by position
- Formatting applied via ranges

**Batch Updates:** Multiple operations can be combined in a single API call for efficiency

---

## Error Handling

**Invalid Index:**
```json
{
  "error": "InvalidArgumentError",
  "message": "Index out of bounds",
  "statusCode": 400
}
```

**Permission Denied:**
```json
{
  "error": "PermissionError",
  "message": "User lacks edit permission",
  "statusCode": 403
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **Document-level permissions** via Drive
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Docs API:** https://developers.google.com/docs/api
- **Source:** `/integrations/documents/docs-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

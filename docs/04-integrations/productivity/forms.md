# Google Forms Integration

**Status:** ✅ Complete | **Category:** Productivity | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Forms Unified MCP Server provides comprehensive form management with 15 tools for creating surveys, collecting responses, and managing form watches. Multi-tenant OAuth with HashiCorp Vault integration.

### Key Features
- ✅ **15 Forms Tools** - Complete form lifecycle management
- ✅ **Form Creation** - Programmatic survey and quiz building
- ✅ **Question Types** - Multiple choice, text, linear scale, grid, etc.
- ✅ **Response Collection** - Read and analyze form responses
- ✅ **Watch Notifications** - Real-time response notifications
- ✅ **Batch Updates** - Efficient form structure changes

### Use Cases
- Automated survey creation
- Quiz and assessment generation
- Customer feedback collection
- Data collection workflows
- Form template management
- Response analysis and reporting
- Event registration forms

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google account with Forms access

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services
- Enable Google Forms API
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:3136/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3136/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
HTTP_PORT=3136
```

**3. Run:**
```bash
cd integrations/productivity/forms-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3136/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (15)

**Form Management (9):** `forms_create_form`, `forms_get_form`, `forms_batch_update`, `forms_update_info`, `forms_update_settings`, `forms_create_item`, `forms_update_item`, `forms_delete_item`, `forms_move_item`

**Response Management (2):** `forms_list_responses`, `forms_get_response`

**Watch Management (4):** `forms_create_watch`, `forms_delete_watch`, `forms_list_watches`, `forms_renew_watch`

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/forms.body` - Full form management
- `https://www.googleapis.com/auth/forms.body.readonly` - Read-only form access
- `https://www.googleapis.com/auth/forms.responses.readonly` - Read form responses

**Multi-Tenant:** Credentials stored at `secret/data/{tenantId}/google`

**Port:** 3136 (HTTP OAuth server)

**Question Types:** Multiple choice, checkboxes, dropdown, short answer, paragraph, linear scale, multiple choice grid, checkbox grid, date, time

**Quiz Features:** Point values, answer feedback, auto-grading

---

## Known Limitations

### API Limitations
1. **Question types:** Some advanced types not fully supported via API
2. **Media uploads:** Images must be from Drive or public URLs
3. **Form design:** Limited customization of themes/colors
4. **Response editing:** Cannot edit submitted responses via API
5. **Logic branching:** Section navigation rules limited

### Best Practices
- ✅ Use batch updates for multiple form changes
- ✅ Set quiz settings before adding questions
- ✅ Validate question configuration before creating
- ✅ Use watches for real-time response handling
- ❌ Don't create too many form items in single request
- ❌ Don't exceed watch limits (max per form)

---

## Architecture Notes

**Stack:** Google Forms API v1 → Shared OAuth → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3136) for OAuth

**Form Structure:**
- Forms contain info (title, description) and settings
- Items are questions or page breaks
- Responses contain answers to questions

**Watch Notifications:**
- Create watch for form response events
- Requires HTTPS endpoint for callbacks
- Watches expire and need renewal

---

## Error Handling

**Invalid Form:**
```json
{
  "error": "NotFoundError",
  "message": "Form not found or access denied",
  "statusCode": 404
}
```

**Invalid Question Type:**
```json
{
  "error": "InvalidArgumentError",
  "message": "Unsupported question type",
  "statusCode": 400
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **Form-level permissions** via Drive sharing
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Forms API:** https://developers.google.com/forms/api
- **Source:** `/integrations/productivity/forms-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

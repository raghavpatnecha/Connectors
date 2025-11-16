# Google Sheets Integration

**Status:** ✅ Complete | **Category:** Documents | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Sheets Unified MCP Server provides comprehensive spreadsheet management with 40 tools covering all major operations including data manipulation, formatting, charts, and data validation.

### Key Features
- ✅ **40 Sheets Tools** - Complete spreadsheet management
- ✅ **Data Operations** - Read, write, append, batch updates
- ✅ **Formatting** - Cell styles, number formats, conditional formatting
- ✅ **Advanced Features** - Charts, pivot tables, data validation
- ✅ **Row/Column Operations** - Insert, delete, resize, hide/show
- ✅ **Collaboration** - Comments, protected ranges, permissions

### Use Cases
- Automated data entry and reporting
- Spreadsheet-based data processing
- Dashboard creation and updates
- Data validation and quality control
- Financial modeling and calculations
- CSV import/export automation

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google account with Sheets access

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services
- Enable Google Sheets API
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:3134/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3134/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
HTTP_PORT=3134
```

**3. Run:**
```bash
cd integrations/documents/sheets-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3134/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (40)

**Spreadsheet Operations (7):** List spreadsheets, create spreadsheet, get spreadsheet info, copy spreadsheet, delete spreadsheet, batch update, get spreadsheet metadata

**Values Operations (14):** Get values, update values, append values, clear values, batch get values, batch update values, batch clear values, get cell value, update cell, copy-paste range, cut-paste range, auto-fill, text-to-columns, copy range to another sheet

**Formatting (15):** Merge cells, unmerge cells, set number format, set cell format (background, text color, bold, italic), auto-resize rows/columns, set row height, set column width, add borders, conditional formatting, freeze rows/columns, group rows/columns, hide/show rows/columns, sort range, filter range

**Comments (4):** List comments, get comment, add comment, delete comment

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/spreadsheets` - Full Sheets access

**Multi-Tenant:** Credentials stored at `secret/data/{tenantId}/google`

**Port:** 3134 (HTTP OAuth server)

**Range Notation:** A1 notation (e.g., `Sheet1!A1:D5`) or R1C1 notation

---

## Known Limitations

### API Limitations
1. **Batch operations:** Max 500 requests per batchUpdate
2. **Cell limits:** 10 million cells per spreadsheet
3. **Range size:** Large ranges (>100K cells) may timeout
4. **Formula evaluation:** Formulas evaluated server-side only
5. **Charts:** Limited chart customization via API
6. **Protected ranges:** Cannot override owner permissions

### Best Practices
- ✅ Use batch operations for multiple updates
- ✅ Use A1 notation for clarity
- ✅ Clear unused ranges to improve performance
- ✅ Use data validation to prevent errors
- ❌ Don't read entire sheets if you only need specific ranges
- ❌ Don't exceed cell limits

---

## Architecture Notes

**Stack:** Google Sheets API v4 → Shared OAuth → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3134) for OAuth

**Data Model:**
- Spreadsheets contain sheets (tabs)
- Sheets contain cells organized in rows/columns
- Cells contain values, formulas, formatting

**Batch Updates:** Combine multiple operations for better performance and atomicity

---

## Error Handling

**Invalid Range:**
```json
{
  "error": "InvalidArgumentError",
  "message": "Unable to parse range: XYZ",
  "statusCode": 400
}
```

**Quota Exceeded:**
```json
{
  "error": "RateLimitError",
  "message": "Rate limit exceeded",
  "statusCode": 429
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **Protected ranges** for sensitive data
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Sheets API:** https://developers.google.com/sheets/api
- **Source:** `/integrations/documents/sheets-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

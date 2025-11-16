# Google Slides Integration

**Status:** ✅ Complete | **Category:** Documents | **OAuth:** Required | **Architecture:** Google APIs

---

## Overview

Google Slides Unified MCP Server provides comprehensive presentation creation and editing with 25 tools. Full support for slides, shapes, text, images, tables, and visual styling.

### Key Features
- ✅ **25 Slides Tools** - Complete presentation management
- ✅ **Slide Operations** - Create, delete, duplicate, reorder
- ✅ **Rich Elements** - Shapes, text boxes, images, tables, videos
- ✅ **Text Formatting** - Bold, italic, colors, sizes, fonts
- ✅ **Visual Styling** - Shape properties, backgrounds, outlines
- ✅ **Export Options** - PDF export for presentations

### Use Cases
- Automated presentation generation
- Template-based slide decks
- Data visualization in slides
- Report slides from data sources
- Presentation content updates
- Slide deck duplication and customization

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google account with Slides access

**1. Create Google OAuth App:**
- Go to Google Cloud Console → APIs & Services
- Enable Google Slides API and Drive API
- Create OAuth 2.0 Client ID
- Redirect URI: `http://localhost:3135/oauth/callback`

**2. Configure Environment:**
```bash
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3135/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
HTTP_PORT=3135
```

**3. Run:**
```bash
cd integrations/documents/slides-unified
npm install && npm run build
npm start
```

**4. Authenticate:**
```bash
curl "http://localhost:3135/oauth/authorize?tenantId=my-tenant"
```

---

## Available Tools (25)

**Presentation Tools (7):** `slides_create_presentation`, `slides_get_presentation`, `slides_batch_update`, `slides_search_presentations`, `slides_copy_presentation`, `slides_delete_presentation`, `slides_export_to_pdf`

**Slide/Page Tools (5):** `slides_create_slide`, `slides_delete_slide`, `slides_duplicate_slide`, `slides_get_page`, `slides_reorder_slides`

**Element Tools (11):** `slides_create_shape`, `slides_insert_text`, `slides_delete_text`, `slides_create_image`, `slides_create_table`, `slides_create_line`, `slides_create_video`, `slides_update_text_style`, `slides_delete_element`, `slides_replace_text`, `slides_update_shape_properties`

**Thumbnail Tools (2):** `slides_get_page_thumbnail`, `slides_get_all_thumbnails`

---

## Configuration Details

**OAuth Scopes:**
- `https://www.googleapis.com/auth/presentations` - Full Slides access
- `https://www.googleapis.com/auth/drive` - For Drive operations

**Multi-Tenant:** Credentials stored at `secret/data/{tenantId}/google`

**Port:** 3135 (HTTP OAuth server)

**Shape Types:** TEXT_BOX, RECTANGLE, ROUND_RECTANGLE, ELLIPSE, CLOUD, CUSTOM, etc.

**Supported Media:** Images (URL/Drive), YouTube videos, Drive videos

---

## Known Limitations

### API Limitations
1. **Batch operations:** Max 500 requests per batchUpdate
2. **Image sources:** Must be publicly accessible URLs or Drive files
3. **Video sources:** YouTube or Google Drive only
4. **Layout templates:** Limited programmatic access
5. **Animations:** Not supported via API
6. **Master slides:** Read-only access

### Best Practices
- ✅ Use batch updates for multiple changes
- ✅ Specify sizes in EMUs (English Metric Units: 914,400 EMU = 1 inch)
- ✅ Use placeholders for consistent layouts
- ✅ Get page thumbnails for previews
- ❌ Don't embed very large images (>10MB)
- ❌ Don't rely on animations for critical content

---

## Architecture Notes

**Stack:** Google Slides API v1 + Drive API v3 → Shared OAuth → Vault

**Dual Server Design:**
- stdio transport for MCP protocol
- HTTP server (port 3135) for OAuth

**Coordinate System:**
- Positions and sizes measured in EMUs
- Origin (0,0) at top-left corner
- 914,400 EMUs = 1 inch = 2.54 cm

**Element Hierarchy:**
- Presentations contain pages (slides)
- Pages contain page elements (shapes, images, tables, etc.)
- Elements can be grouped and transformed

---

## Error Handling

**Invalid Presentation:**
```json
{
  "error": "NotFoundError",
  "message": "Presentation not found",
  "statusCode": 404
}
```

**Invalid Element:**
```json
{
  "error": "InvalidArgumentError",
  "message": "Element ID not found on page",
  "statusCode": 400
}
```

---

## Security

- ✅ **OAuth 2.0** with automatic refresh
- ✅ **Per-tenant encryption** via Vault
- ✅ **Presentation-level permissions** via Drive
- ✅ **Audit logging** for all operations
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Slides API:** https://developers.google.com/slides/api
- **Source:** `/integrations/documents/slides-unified/`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`

---

**License:** MIT

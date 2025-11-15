# Google Slides MCP Server

Unified Model Context Protocol (MCP) server for Google Slides API with OAuth 2.0 authentication.

## Features

- **25 Tools** for comprehensive presentation creation and editing
- **Presentation Management**: Create, get, search, copy, delete, export presentations
- **Slide Operations**: Create, delete, duplicate, reorder slides
- **Element Creation**: Shapes, text boxes, images, tables, lines, videos
- **Text Manipulation**: Insert, delete, replace, format text
- **Visual Styling**: Update shape properties, text styles
- **Thumbnail Generation**: Get thumbnails for slides
- **Multi-tenant OAuth**: Secure per-tenant authentication via shared Google auth
- **Dual Server**: stdio (MCP) + HTTP (OAuth callbacks)

## Tools Implemented (25 Total)

### Presentation Tools (7)
1. `slides_create_presentation` - Create a new presentation
2. `slides_get_presentation` - Get presentation details
3. `slides_batch_update` - Execute batch updates
4. `slides_search_presentations` - Search presentations by name
5. `slides_copy_presentation` - Copy a presentation
6. `slides_delete_presentation` - Delete a presentation
7. `slides_export_to_pdf` - Export presentation to PDF

### Slide/Page Tools (5)
8. `slides_create_slide` - Create a new slide
9. `slides_delete_slide` - Delete a slide
10. `slides_duplicate_slide` - Duplicate a slide
11. `slides_get_page` - Get slide details
12. `slides_reorder_slides` - Reorder slides

### Element Tools (11)
13. `slides_create_shape` - Create shapes (text box, rectangle, etc.)
14. `slides_insert_text` - Insert text into shapes
15. `slides_delete_text` - Delete text from shapes
16. `slides_create_image` - Add images from URLs
17. `slides_create_table` - Create tables
18. `slides_create_line` - Create lines/connectors
19. `slides_create_video` - Embed YouTube/Drive videos
20. `slides_update_text_style` - Format text (bold, italic, color, size)
21. `slides_delete_element` - Delete any element
22. `slides_replace_text` - Find and replace text
23. `slides_update_shape_properties` - Update shape colors and outline

### Thumbnail Tools (2)
24. `slides_get_page_thumbnail` - Get thumbnail for a slide
25. `slides_get_all_thumbnails` - Get thumbnails for all slides

## Installation

```bash
npm install
npm run build
```

## Configuration

### Environment Variables

```bash
# OAuth Configuration (from shared Google auth)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3135/oauth/callback

# Server Configuration
HTTP_PORT=3135
LOG_LEVEL=info
```

### OAuth Scopes Required

- `https://www.googleapis.com/auth/presentations` - Full Slides access
- `https://www.googleapis.com/auth/drive` - For Drive operations (copy, delete, export, search)

## Usage

### Start Server

```bash
# Development
npm run dev

# Production
npm start
```

### OAuth Authorization Flow

1. **Get Authorization URL**:
   ```bash
   curl http://localhost:3135/oauth/authorize?tenantId=YOUR_TENANT_ID
   ```

2. **User visits the URL and authorizes**

3. **Callback handles token exchange automatically**

4. **Start using tools with the tenantId**

### Example Tool Usage

```json
{
  "name": "slides_create_presentation",
  "arguments": {
    "tenantId": "tenant-123",
    "title": "My Presentation"
  }
}
```

```json
{
  "name": "slides_create_slide",
  "arguments": {
    "tenantId": "tenant-123",
    "presentationId": "1abc...",
    "insertionIndex": 0
  }
}
```

```json
{
  "name": "slides_create_shape",
  "arguments": {
    "tenantId": "tenant-123",
    "presentationId": "1abc...",
    "pageObjectId": "slide_id",
    "shapeType": "TEXT_BOX",
    "width": 3000000,
    "height": 1000000,
    "translateX": 100000,
    "translateY": 100000
  }
}
```

## Architecture

```
slides-unified/
├── src/
│   ├── index.ts              # Main MCP server & HTTP server
│   ├── tools/
│   │   ├── presentations.ts  # Presentation management (7 tools)
│   │   ├── pages.ts         # Slide operations (5 tools)
│   │   ├── elements.ts      # Element management (11 tools)
│   │   ├── thumbnails.ts    # Thumbnail generation (2 tools)
│   │   └── index.ts         # Tool exports
│   └── utils/
│       ├── logger.ts        # Winston logger
│       ├── error-handler.ts # Error handling
│       └── tool-registry-helper.ts # MCP tool registry
├── package.json
├── tsconfig.json
└── Dockerfile
```

## API Endpoints

- `GET /` - Service info and tool list
- `GET /health` - Health check
- `GET /oauth/authorize?tenantId=<id>` - Get OAuth URL
- `GET /oauth/callback` - OAuth callback handler

## Docker

```bash
# Build
docker build -t slides-unified .

# Run
docker run -p 3135:3135 \
  -e GOOGLE_CLIENT_ID=your_id \
  -e GOOGLE_CLIENT_SECRET=your_secret \
  slides-unified
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol
- `googleapis` - Google Slides API
- `express` - HTTP server for OAuth
- `winston` - Logging
- `zod` - Schema validation

## Integration with Gateway

This MCP server integrates with the Connectors Platform gateway for:
- Token optimization (95% reduction via semantic routing)
- GraphRAG tool relationships
- Multi-tenant credential management via HashiCorp Vault
- Rate limiting and caching

## Error Handling

All tools use consistent error handling:
- Google API errors are mapped and logged
- Validation errors use Zod schemas
- Errors return structured JSON with error details

## Logging

Structured logging with Winston:
- All tool executions logged with tenantId, presentationId
- Performance metrics tracked
- Error stack traces captured

## Testing

```bash
# Type checking
npm run typecheck

# Build
npm run build
```

## License

MIT

## Related Services

- **docs-unified**: Google Docs MCP Server
- **sheets-unified**: Google Sheets MCP Server
- **tasks-unified**: Google Tasks MCP Server
- **shared/google-auth**: Shared OAuth manager

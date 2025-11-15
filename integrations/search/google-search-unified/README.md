# Google Custom Search MCP Server

Unified MCP server for Google Custom Search API providing web search capabilities with OAuth 2.0 authentication.

## Features

- **6 Tools** for comprehensive search functionality:
  - 3 Search execution tools (web, image, news)
  - 3 CSE management tools (list, get, update)
- **Multi-tenant OAuth** via HashiCorp Vault
- **Advanced filtering** with date restrictions, file types, and safe search
- **Image search** with size, type, and color filters
- **News search** with date-based sorting
- **Pagination support** for large result sets

## Tools

### Search Execution Tools

1. **search_execute_search** - Execute web search with advanced filters
   - Query string, result count, pagination
   - Site restrictions, safe search, date filters
   - File type and language filters

2. **search_search_images** - Image-specific search
   - Image size filters (icon, small, medium, large, etc.)
   - Image type filters (clipart, face, photo, etc.)
   - Color type and dominant color filters

3. **search_search_news** - News-specific search
   - Date-restricted news searches
   - Sort by date
   - Article metadata extraction

### CSE Management Tools

4. **search_list_cse** - List available custom search engines
5. **search_get_cse** - Get detailed CSE information
6. **search_update_cse** - Update CSE configuration (limited by API)

## Configuration

### Environment Variables

```bash
# Required
GOOGLE_PSE_API_KEY=your_api_key_here
GOOGLE_PSE_ENGINE_ID=your_search_engine_id_here

# Optional
HTTP_PORT=3139
LOG_LEVEL=info
NODE_ENV=production
```

### OAuth Setup

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Set up redirect URI: `http://localhost:3139/oauth/callback`
3. Configure the following scopes:
   - `https://www.googleapis.com/auth/cse`

## Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start
```

## Development

```bash
# Development mode with auto-reload
npm run dev

# Watch mode
npm run watch

# Type checking
npm run typecheck
```

## Usage

### Web Search Example

```json
{
  "tool": "search_execute_search",
  "arguments": {
    "tenantId": "tenant-123",
    "q": "TypeScript best practices",
    "num": 10,
    "safe": "off",
    "dateRestrict": "m1"
  }
}
```

### Image Search Example

```json
{
  "tool": "search_search_images",
  "arguments": {
    "tenantId": "tenant-123",
    "q": "mountain landscape",
    "num": 5,
    "imgSize": "large",
    "imgType": "photo",
    "imgColorType": "color"
  }
}
```

### News Search Example

```json
{
  "tool": "search_search_news",
  "arguments": {
    "tenantId": "tenant-123",
    "q": "artificial intelligence",
    "num": 10,
    "dateRestrict": "w1",
    "sortBy": "date"
  }
}
```

## API Reference

### Google Custom Search API

- **Version**: v1
- **Documentation**: https://developers.google.com/custom-search/v1/overview
- **Rate Limits**: 100 queries per day (free tier), up to 10,000 queries per day (paid)

### Custom Search Engine Setup

1. Visit: https://programmablesearchengine.google.com/
2. Create a new search engine
3. Configure search sites (or search the entire web)
4. Copy the Search Engine ID (cx parameter)
5. Enable Custom Search API in Google Cloud Console
6. Create API key

## Architecture

```
google-search-unified/
├── src/
│   ├── index.ts              # Main MCP server entry point
│   ├── clients/
│   │   └── search-client.ts  # Custom Search API client
│   ├── tools/
│   │   ├── index.ts          # Tool exports
│   │   ├── search.ts         # Search execution tools (3)
│   │   └── cse.ts            # CSE management tools (3)
│   └── utils/
│       ├── logger.ts         # Winston logger
│       ├── error-handler.ts  # Error mapping
│       └── tool-registry-helper.ts  # MCP tool registry
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## OAuth Flow

1. Client requests authorization: `GET /oauth/authorize?tenantId=xxx`
2. User completes OAuth flow with Google
3. Callback received: `GET /oauth/callback?code=xxx&state=tenantId`
4. Credentials stored in Vault (encrypted per-tenant)
5. Tools use authenticated client for API calls

## Error Handling

- **RateLimitError**: Search API quota exceeded
- **QuotaExceededError**: Daily quota limit reached
- **InvalidParameterError**: Invalid search parameters
- **SearchError**: General search API errors

## Logging

Structured JSON logging with Winston:
- Request/response logging
- Error tracking with stack traces
- Performance metrics
- OAuth events

## Security

- API keys stored in environment variables (never in code)
- OAuth tokens encrypted in HashiCorp Vault
- Per-tenant credential isolation
- Input validation with Zod schemas

## Monitoring

Health check endpoint:
```bash
curl http://localhost:3139/health
```

Response:
```json
{
  "status": "healthy",
  "service": "google-search-unified",
  "version": "1.0.0",
  "tools": 6,
  "uptime": 3600
}
```

## License

MIT

## Support

For issues and questions:
- GitHub Issues: [connector-platform/issues]
- Documentation: [docs/search-mcp.md]

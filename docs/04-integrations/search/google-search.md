# Google Search Integration

**Status:** ✅ Complete | **Category:** Search | **Auth:** API Key | **Architecture:** Custom Search API

---

## Overview

Google Custom Search Unified MCP Server provides production-ready web, image, and news search capabilities with API key authentication and multi-tenant support.

### Key Features
✅ **6 Complete Tools** - Web, image, news search + CSE management
✅ **API Key Authentication** - Simple setup with Google Custom Search API
✅ **Multi-Tenant** - Per-tenant API key storage in Vault
✅ **Advanced Filtering** - Date, file type, safe search, language
✅ **Image Search** - Size, type, color filters
✅ **News Search** - Date-based sorting and filtering
✅ **Pagination** - Full pagination support for large result sets

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Google Cloud Console account

**1. Get Google Custom Search API Key:**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable **Custom Search API**
- Create API key (APIs & Services → Credentials → Create Credentials → API Key)
- Create Custom Search Engine at [CSE Control Panel](https://programmablesearchengine.google.com/)
- Copy the **Search Engine ID** (cx parameter)

**2. Configure Environment:**
```bash
GOOGLE_PSE_API_KEY=your_api_key_here
GOOGLE_PSE_ENGINE_ID=your_search_engine_id_here
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token
PORT=3139
```

**3. Run:**
```bash
docker compose up -d vault
docker compose build mcp-google-search
docker compose --profile search up -d
```

**4. Set API Key (Per Tenant):**
```bash
curl -X POST http://localhost:3139/api/v1/credentials/set \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "apiKey": "YOUR_GOOGLE_API_KEY",
    "engineId": "YOUR_SEARCH_ENGINE_ID"
  }'
```

**5. Test:**
```bash
curl -X POST http://localhost:3139/tools/search_execute_search \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "q": "OpenAI GPT-4",
    "num": 10
  }'
```

---

## Available Tools (6)

**Search Execution (3):**
- `search_execute_search` - Web search with advanced filters (query, count, pagination, safe search, date filters, file types, language)
- `search_search_images` - Image-specific search with size, type, and color filters
- `search_search_news` - News search with date restrictions and sorting

**CSE Management (3):**
- `search_list_cse` - List all available custom search engines for tenant
- `search_get_cse` - Get detailed information about a specific CSE
- `search_update_cse` - Update CSE configuration (limited by API permissions)

---

## Tool Examples

### Web Search
```bash
curl -X POST http://localhost:3139/tools/search_execute_search \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "q": "TypeScript best practices",
    "num": 10,
    "safe": "off",
    "dateRestrict": "m1",
    "fileType": "pdf",
    "lr": "lang_en"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "title": "TypeScript Best Practices 2024",
        "link": "https://example.com/typescript-guide",
        "snippet": "Comprehensive guide to TypeScript best practices...",
        "displayLink": "example.com"
      }
    ],
    "searchInformation": {
      "totalResults": "1250000",
      "searchTime": 0.45
    }
  }
}
```

### Image Search
```bash
curl -X POST http://localhost:3139/tools/search_search_images \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "q": "mountain landscape",
    "imgSize": "large",
    "imgType": "photo",
    "imgColorType": "color",
    "num": 10
  }'
```

### News Search
```bash
curl -X POST http://localhost:3139/tools/search_search_news \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "q": "artificial intelligence",
    "dateRestrict": "d7",
    "sort": "date",
    "num": 20
  }'
```

---

## Configuration Details

**API Key Management:**
- **Set:** `POST /api/v1/credentials/set` with `tenantId`, `apiKey`, and `engineId`
- **Revoke:** `DELETE /api/v1/credentials/revoke?tenant_id=X`
- **Storage:** Encrypted in Vault with per-tenant keys at `secret/data/tenants/{tenantId}/google-search`

**Multi-Tenant:** Each tenant configures their own API key and search engine
```bash
# Tenant 1
curl -X POST http://localhost:3139/api/v1/credentials/set \
  -d '{"tenantId":"company-a","apiKey":"KEY_A","engineId":"CX_A"}'

# Tenant 2
curl -X POST http://localhost:3139/api/v1/credentials/set \
  -d '{"tenantId":"company-b","apiKey":"KEY_B","engineId":"CX_B"}'
```

**Health Check:** `GET /health` returns server status and API connectivity

---

## Advanced Filtering

### Date Restrictions
```bash
# Last 24 hours: d1
# Last week: w1
# Last month: m1
# Last 6 months: m6
# Last year: y1

"dateRestrict": "m1"  # Last month
```

### File Types
```bash
# Supported: pdf, doc, xls, ppt, txt, xml, html, swf
"fileType": "pdf"
```

### Image Filters
```bash
# Size: icon, small, medium, large, xlarge, xxlarge, huge
"imgSize": "large"

# Type: clipart, face, lineart, stock, photo, animated
"imgType": "photo"

# Color: mono, gray, color, trans
"imgColorType": "color"

# Dominant color: red, orange, yellow, green, teal, blue, purple, pink, white, gray, black, brown
"imgDominantColor": "blue"
```

### Safe Search
```bash
# Levels: active, off
"safe": "active"  # Filter adult content
```

### Language Restrictions
```bash
# Format: lang_{code}
"lr": "lang_en"  # English results only
```

---

## Known Limitations

### API Limitations
1. **Quota:** 100 queries per day (free tier), 10,000+ with billing
2. **Rate limits:** 10 queries per second
3. **Result limit:** Max 100 results per search (10 pages × 10 results)
4. **CSE limit:** 10 custom search engines per account (free tier)

### Best Practices
- ✅ Use pagination cursors (`start` parameter) for result sets
- ✅ Cache frequently searched queries
- ✅ Monitor quota usage with CSE dashboard
- ✅ Use `dateRestrict` to reduce result set size
- ❌ Don't exceed rate limits (10 QPS)
- ❌ Don't rely on totalResults being accurate (estimate only)

---

## Error Handling

### Quota Exceeded
```json
{
  "error": "QUOTA_EXCEEDED",
  "message": "API quota exceeded. Upgrade plan or wait for daily reset.",
  "code": "QUOTA_ERROR",
  "details": {
    "resetTime": "2025-11-18T00:00:00Z"
  }
}
```

### Invalid API Key
```json
{
  "error": "AUTHENTICATION_ERROR",
  "message": "Invalid API key provided",
  "code": "AUTH_ERROR"
}
```

### No Results
```json
{
  "success": true,
  "data": {
    "items": [],
    "searchInformation": {
      "totalResults": "0",
      "searchTime": 0.12
    }
  }
}
```

---

## Architecture Notes

**Stack:** Google Custom Search API → Gateway (API key proxy) → Vault (key storage)

**Auth Flow:** API Key (permanent) → Vault encryption → Key injection per request

**Rate Limiting:** 10 queries per second (enforced by Google)

**Advantages:**
- **Simple setup:** Just API key and engine ID (no OAuth)
- **No token expiry:** Keys don't expire (no refresh needed)
- **Fast:** Direct API calls, minimal overhead

---

## Security

- ✅ **API key encryption** via Vault Transit engine
- ✅ **Per-tenant encryption keys**
- ✅ **Secure key storage** in HashiCorp Vault
- ✅ **Key caching** with 1-hour TTL
- ✅ **Rate limiting** per tenant
- ✅ **TLS/HTTPS** for all API calls
- ✅ **No key logging** (Winston sanitization)

---

## Troubleshooting

### Common Issues

**1. "No API key found for tenant"**
- Set credentials: `POST /api/v1/credentials/set` with tenantId, apiKey, engineId

**2. "API quota exceeded"**
- Check quota: Visit [Google Cloud Console](https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas)
- Upgrade plan or wait for daily reset (midnight PT)

**3. "Invalid search engine ID"**
- Verify engine ID at [CSE Control Panel](https://programmablesearchengine.google.com/)
- Ensure engine is active and configured correctly

**4. "Search returned no results"**
- Try broader query terms
- Remove restrictive filters (dateRestrict, fileType)
- Check if CSE has "Search the entire web" enabled

**5. "Rate limit exceeded"**
- Implement client-side throttling (max 10 QPS)
- Add delays between requests

---

## Comparison: Google Search vs Other Search APIs

| Feature | Google Search | Bing Search | DuckDuckGo |
|---------|--------------|-------------|------------|
| **Free tier quota** | 100/day | 1,000/month | No official API |
| **Max results** | 100 | 50 | N/A |
| **Image search** | Yes | Yes | N/A |
| **News search** | Yes | Yes | N/A |
| **Custom filters** | Extensive | Moderate | N/A |
| **Setup complexity** | Medium | Low | N/A |

---

## Development

### Local Setup

```bash
cd integrations/search/google-search-unified

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Coverage report
npm run test:coverage

# Linting
npm run lint
```

---

## Support

- **Technical Docs:** `integrations/search/google-search-unified/README.md`
- **Google CSE API:** https://developers.google.com/custom-search/v1/overview
- **CSE Control Panel:** https://programmablesearchengine.google.com/
- **Issues:** GitHub Issues

---

**License:** MIT

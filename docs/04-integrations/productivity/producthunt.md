# Product Hunt Integration

**Status:** ✅ Complete | **Category:** Productivity | **Auth:** API Token | **Architecture:** GraphQL Client

---

## Overview

Product Hunt Unified MCP Server provides production-ready Product Hunt integration with API token authentication, multi-tenant support, and comprehensive tools for product discovery and tracking.

### Key Differences from OAuth Integrations
- **Simpler Setup:** API token instead of OAuth flow (one step vs three)
- **No Token Refresh:** Tokens don't expire (no auto-refresh needed)
- **Faster Configuration:** Single POST request to configure
- **Same Security:** Vault encryption with per-tenant isolation

### Key Features
✅ **API Token Authentication** - Simple, no OAuth complexity
✅ **3 Core Tools** - Posts, search, server status
✅ **Production Ready** - Rate limiting, error handling, logging
✅ **Multi-Tenant** - HashiCorp Vault credential storage
✅ **GraphQL Client** - Product Hunt API v2 integration

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- Product Hunt account

**1. Get Product Hunt API Token:**
- Go to https://www.producthunt.com/v2/oauth/applications
- Create new application
  - **Name:** Your app name
  - **Redirect URI:** `https://localhost:8424/callback` (required but not used)
- Copy the **Developer Token**

**2. Configure Environment:**
```bash
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token
PORT=3000
```

**3. Run:**
```bash
docker compose up -d vault
docker compose build mcp-producthunt
docker compose --profile producthunt up -d
```

**4. Set API Token:**
```bash
curl -X POST http://localhost:3140/token/set \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "apiToken": "YOUR_PRODUCT_HUNT_DEVELOPER_TOKEN"
  }'
```

**5. Test:**
```bash
curl -X POST http://localhost:3140/tools/producthunt_check_status \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"my-tenant"}'
```

---

## Available Tools (3)

**Posts (2):**
- `producthunt_get_post_details` - Get detailed post information by ID or slug
- `producthunt_get_posts` - Search/filter posts with topic, featured, date range

**Server (1):**
- `producthunt_check_status` - Check server status, API connectivity, rate limits

**Planned (8):** Comments, Collections, Topics, Users

---

## Configuration Details

**Token Management:**
- **Set:** `POST /token/set` with `tenantId` and `apiToken`
- **Revoke:** `DELETE /token/revoke?tenant_id=X`
- **Storage:** Encrypted in Vault with per-tenant keys

**Tool Invocation:** All tools require `tenantId` parameter
```json
{
  "tenantId": "my-tenant",
  "slug": "claude-desktop"
}
```

**Health Check:** `GET /health` returns server status

**Multi-Tenant:** Each tenant configures their own API token
```bash
# Tenant 1
curl -X POST http://localhost:3140/token/set \
  -d '{"tenantId":"company-a","apiToken":"TOKEN_A"}'

# Tenant 2
curl -X POST http://localhost:3140/token/set \
  -d '{"tenantId":"company-b","apiToken":"TOKEN_B"}'
```

---

## Known Limitations

### API Limitations
1. **Rate limits:** 6,250 complexity points per hour (GraphQL)
2. **Read-only:** Write operations (voting, commenting) not available in v2 API
3. **Historical data:** Limited to recent posts (Product Hunt API restriction)
4. **Pagination:** Max 20 items per request

### Best Practices
- ✅ Monitor rate limits with `producthunt_check_status`
- ✅ Use pagination cursors for large result sets
- ✅ Filter by topic to reduce complexity usage
- ✅ Cache frequently accessed data
- ❌ Don't exceed rate limits
- ❌ Don't request more than needed (use count parameter)

---

## Architecture Notes

**Stack:** GraphQL Client → Gateway (Token proxy) → Vault (token storage)

**Auth Flow:** API Token (permanent) → Vault encryption → Token caching (1h TTL)

**Advantages:**
- **Simpler than OAuth:** No authorization URL, no callback, no refresh
- **Faster setup:** One API call vs multi-step OAuth flow
- **No expiry:** Tokens are permanent (no auto-refresh logic needed)

---

## Error Handling

### Rate Limiting

```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Reset in 900 seconds.",
  "code": "RATE_LIMIT_ERROR",
  "details": {
    "retryAfter": 900,
    "resetAt": "2025-11-16T10:00:00Z"
  }
}
```

### Token Errors

```json
{
  "error": "TOKEN_ERROR",
  "message": "No Product Hunt API token found for tenant: my-tenant",
  "code": "TOKEN_ERROR"
}
```

### GraphQL Errors

```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found: post",
  "code": "NOT_FOUND"
}
```

---

## Development

### Local Setup

```bash
cd integrations/productivity/producthunt-unified

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Coverage report
npm run test:coverage

# Linting
npm run lint
```

---

## Comparison: API Token vs OAuth

| Feature | Product Hunt (Token) | GitHub (OAuth) |
|---------|---------------------|----------------|
| **Setup Steps** | 1 (set token) | 3 (create app, authorize, callback) |
| **User Flow** | POST request | Browser authorization |
| **Token Expiry** | Never | Yes (auto-refresh) |
| **Refresh Logic** | Not needed | Required |
| **Code Complexity** | Low | Medium |
| **Setup Time** | 30 seconds | 5 minutes |
| **Security** | Vault encrypted | Vault encrypted |

---

## Security

- ✅ **API token encryption** via Vault Transit engine
- ✅ **Per-tenant encryption keys**
- ✅ **Secure token storage** in HashiCorp Vault
- ✅ **Token caching** with 1-hour TTL
- ✅ **Rate limiting** per tenant
- ✅ **TLS/HTTPS** for all API calls
- ✅ **No token logging** (Winston sanitization)

---

## Troubleshooting

### Common Issues

**1. "No Product Hunt API token found"**
- Set token: `POST /token/set` with tenantId and apiToken

**2. "Rate limit exceeded"**
- Check reset time: `producthunt_check_status`
- Wait for reset or reduce request frequency

**3. "Vault connection failed"**
- Verify Vault is running: `docker compose ps vault`
- Check `VAULT_ADDR` and `VAULT_TOKEN` environment variables

**4. "Authentication failed"**
- Verify token at https://www.producthunt.com/v2/oauth/applications
- Regenerate token if needed
- Update with new token: `POST /token/set`

**5. "Invalid date format"**
- Use ISO 8601: `2024-11-15T00:00:00Z`
- Not: `11/15/2024`

---

## Support

- **Technical Docs:** `integrations/productivity/producthunt-unified/README.md`
- **Code Review:** `.claude/docs/integration-reports/producthunt/implementation-review.md`
- **Product Hunt API:** https://www.producthunt.com/v2/docs
- **Issues:** GitHub Issues

---

**License:** MIT

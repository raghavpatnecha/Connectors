# Reddit Integration

**Status:** ✅ Complete | **Category:** Communication | **OAuth:** Required | **Architecture:** Official API (Snoowrap)

---

## Overview

Reddit Unified MCP Server provides comprehensive Reddit access through 25 tools covering browsing, searching, posting, commenting, and user analysis. Built with multi-tenant OAuth, HashiCorp Vault security, and intelligent rate limiting.

### Key Features
- ✅ **25 Tools** across 8 categories
- ✅ **100% Coverage** of 5 source Reddit MCP repositories (31 tools verified)
- ✅ **Multi-Tenant OAuth** with per-tenant credential encryption
- ✅ **Smart Rate Limiting** (60 req/min, 600 req/10min compliance)
- ✅ **Intelligent Caching** (LRU with TTL, 50MB capacity)
- ✅ **Auto Token Refresh** (5 min before expiry)

---

## Setup Instructions

### Prerequisites
- Node.js >= 18.0.0
- Reddit account
- HashiCorp Vault (for multi-tenant)

### 1. Create Reddit App

1. Go to https://www.reddit.com/prefs/apps
2. Click "create app" or "create another app"
3. Select **"web app"** type
4. Set redirect URI: `http://localhost:3001/oauth/callback`
5. Copy `client_id` and `client_secret`

### 2. Configure Environment

```bash
# Reddit OAuth 2.0
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_REDIRECT_URI=http://localhost:3001/oauth/callback
REDDIT_USER_AGENT=RedditUnifiedMCP/1.0.0

# HashiCorp Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-token
VAULT_NAMESPACE=reddit-mcp

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
REQUEST_DELAY_MS=1000
```

### 3. Install & Build

```bash
cd integrations/communication/reddit-unified
npm install
npm run build
npm start
```

Server starts on http://localhost:3001

---

## Available Tools (25)

**Browse & Discovery (8):** `browse_frontpage`, `browse_subreddit`, `browse_subreddit_new`, `browse_subreddit_top`, `browse_subreddit_rising`, `browse_subreddit_controversial`, `get_trending_subreddits`, `browse_popular`

**Search (2):** `search_posts`, `search_subreddits`

**Posts (4):** `get_post`, `get_post_by_url`, `get_post_by_id`, `get_user_posts`

**Comments (2):** `get_post_comments`, `get_user_comments`

**Subreddits (2):** `get_subreddit_info`, `get_subreddit_stats`

**Users (3):** `get_user_info`, `get_user_trophies`, `get_user_karma`

**Utilities (1):** `reddit_explain`

**Authenticated (5):** `who_am_i`, `create_post`, `create_post_optimized`, `post_comment`, `reply_to_post`

---

## Configuration Details

### OAuth Flow

```bash
# 1. Get authorization URL
curl "http://localhost:3001/oauth/authorize?tenant_id=my-tenant"

# 2. Open URL in browser and authenticate

# 3. Reddit redirects to callback with code

# 4. Server exchanges code for tokens and stores in Vault

# 5. Tools automatically use cached credentials
```

### Multi-Tenant Architecture

Each tenant has:
- **Isolated OAuth credentials** (encrypted in Vault)
- **Separate rate limit quotas** (60/min per tenant)
- **Independent caches** (5 min TTL per tenant)
- **Automatic token refresh** (55 min mark)

### Rate Limiting

Reddit API limits:
- **60 requests/minute** (enforced by token bucket)
- **600 requests/10 minutes** (tracked and throttled)
- **Automatic backoff** on 429 errors

The server enforces these limits per tenant with smart queuing.

---

## Known Limitations

### API Limitations
1. **Rate limits:** 60 req/min per OAuth app
2. **Requires OAuth:** Most endpoints need authentication
3. **No real-time notifications:** Polling required
4. **Limited search:** Reddit's search API has restrictions

### Best Practices
- ✅ Use caching for read-heavy operations
- ✅ Batch requests where possible
- ✅ Monitor rate limit headers
- ✅ Handle 429 errors gracefully
- ❌ Don't scrape - use official API only
- ❌ Don't spam - respect Reddit's rules

---

## Architecture Notes

**Stack:** Snoowrap SDK + OAuth 2.0 + Vault + Redis caching + Rate limiter

**Source Coverage:** 100% of 5 Reddit MCP repositories (31 tools) → 25 unified tools

---

## Performance

| Metric | Target |
|--------|--------|
| Token Refresh | < 100ms |
| Cache Hit Rate | > 70% (read-only tools) |
| Rate Limit Compliance | 100% (no 429 errors) |
| OAuth Flow | < 2 seconds |
| Tool Execution (cached) | < 500ms |
| Tool Execution (uncached) | < 2s |

---

## Security

- ✅ **OAuth 2.0** with Reddit (authorization code flow)
- ✅ **Per-tenant encryption** (HashiCorp Vault transit engine)
- ✅ **Session encryption** (AES-256-GCM)
- ✅ **No credential logging** (Winston sanitization)
- ✅ **State validation** (CSRF protection)
- ✅ **Auto token rotation** (5 min buffer before expiry)

---

## Troubleshooting

### OAuth Issues
```bash
# Check OAuth status
curl http://localhost:3001/health

# Revoke and re-authorize
curl -X DELETE "http://localhost:3001/oauth/revoke?tenant_id=my-tenant"
curl "http://localhost:3001/oauth/authorize?tenant_id=my-tenant"
```

### Rate Limiting
- Server enforces 60 req/min automatically
- Check logs for rate limit warnings
- Increase `REQUEST_DELAY_MS` if hitting limits

### Vault Connection
```bash
# Check Vault health
vault status

# Verify namespace
export VAULT_NAMESPACE=reddit-mcp
vault kv list secret/
```

---

## Support

- **Documentation:** See `/docs/reddit-unified-plan/` for architecture details
- **Issues:** Report via GitHub Issues
- **Reddit API:** https://www.reddit.com/dev/api

---

**Built with the Model Context Protocol (MCP) SDK 0.5.0**

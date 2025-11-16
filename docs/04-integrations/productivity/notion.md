# Notion Integration

**Status:** ✅ Complete | **Category:** Productivity | **OAuth:** Required | **Architecture:** Official SDK (@notionhq/client)

---

## Overview

Notion integration provides AI agents with powerful access to Notion workspaces through 19 comprehensive tools. Uses the official `@notionhq/client` SDK and follows standard MCP protocol with OAuth 2.0 authentication.

### Key Features
- ✅ **19 Notion tools** (pages, databases, blocks, search, users)
- ✅ **OAuth 2.0 authentication** with automatic token management
- ✅ **Semantic routing** for intelligent tool discovery
- ✅ **Token optimization** (74% reduction for Notion alone)
- ✅ **GraphRAG relationships** for smart tool suggestions
- ✅ **Enterprise-grade security** with HashiCorp Vault

### Use Cases
- Create and update Notion pages programmatically
- Query databases and manage database entries
- Search across workspace content
- Automate documentation workflows
- Sync data between Notion and other tools
- Build AI agents that read/write Notion content

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- Notion workspace (admin access)
- HashiCorp Vault (running)
- Docker & Docker Compose

**1. Create Notion Integration:**
- Go to https://www.notion.so/my-integrations → New integration
- Type: Public | Capabilities: Enable all (Read, Update, Insert)
- Redirect URI: `http://localhost:3000/oauth/callback/notion`
- Copy OAuth client ID and secret

**2. Configure Vault:**
```bash
docker compose up -d vault
export VAULT_ADDR='http://localhost:8200' VAULT_TOKEN='dev-token'
vault kv put secret/oauth/notion client_id="X" client_secret="Y" redirect_uri="http://localhost:3000/oauth/callback/notion"
```

**3. Install & Start:**
```bash
npm install -g @modelcontextprotocol/server-notion
docker compose up -d
cd gateway && npm run generate-embeddings -- --integration notion && npm run dev
```

---

## Available Tools (19)

**Pages (5):** `notion.createPage`, `notion.retrievePage`, `notion.updatePage`, `notion.appendBlocks`, `notion.retrievePagePropertyItem`

**Databases (4):** `notion.queryDatabase`, `notion.createDatabase`, `notion.retrieveDatabase`, `notion.updateDatabase`

**Blocks (5):** `notion.retrieveBlock`, `notion.retrieveBlockChildren`, `notion.appendBlocks`, `notion.updateBlock`, `notion.deleteBlock`

**Search & Users (4):** `notion.search`, `notion.listUsers`, `notion.retrieveUser`, `notion.retrieveBotUser`

**Comments (2):** `notion.listComments`, `notion.createComment`

---

## Configuration Details

### OAuth Flow

Notion uses **OAuth 2.0 Authorization Code** flow:

1. **User Authorization:** Redirect user to Notion
2. **Code Exchange:** Exchange authorization code for access token
3. **Token Storage:** Store token in Vault (encrypted per-tenant)
4. **Token Usage:** Gateway injects token for all Notion API calls

**Note:** Notion access tokens **do not expire** (unlike most OAuth providers). However, they can be revoked by the user.

**Authentication:** `GET /oauth/authorize/notion?tenant_id=X` → Browser auth → Auto-stored in Vault → Use tools with `tenantId`

**Multi-Tenant:** Each tenant has isolated workspace credentials in Vault (e.g., `secret/tenants/eng-team/notion`, `secret/tenants/marketing/notion`)

---

## Known Limitations

### API Limitations
1. **Page sharing required:** Integration can only access pages explicitly shared with it
2. **Rate limits:** 3 requests/second per integration, burst up to 30 requests/10 seconds
3. **No column_list:** Column layouts not supported via API
4. **No synced blocks:** Synced content not available in API
5. **Limited block types:** Some advanced blocks not supported

### Best Practices
- ✅ Share pages with integration before accessing
- ✅ Use correct page/block ID format (UUID)
- ✅ Handle rate limits with exponential backoff
- ✅ Cache frequently accessed data
- ❌ Don't exceed 3 req/sec rate limit
- ❌ Don't use unsupported block types

### Rate Limiting
- **3 requests per second** per integration
- **Burst:** Up to 30 requests in 10 seconds
- Gateway implements automatic exponential backoff

---

## Architecture Notes

**Stack:** @notionhq/client SDK → Gateway (semantic routing + OAuth) → Vault → Notion API

**Block Types:** paragraph, headings (1-3), lists (bulleted/numbered/to_do), toggle, code, quote, callout, divider, TOC, media (image/video/file/pdf/bookmark), equation, embed. Not supported: synced_block, template, column_list.

---

## Performance

| Metric | Target |
|--------|--------|
| Tool selection | <1ms (semantic routing) |
| OAuth token fetch | <10ms (Vault cached) |
| API call | 100-500ms (Notion API latency) |
| **Total end-to-end** | **<600ms** |

### Token Savings
- **Traditional:** 155 tokens/tool × 19 = 2,945 tokens
- **Connectors:** 8 relevant tools × 95 tokens = 760 tokens
- **Reduction: 74% for Notion alone**

---

## Troubleshooting

**OAuth Fails:** Verify credentials in Vault (`vault kv get secret/oauth/notion`), check redirect URI matches Notion Portal exactly, ensure integration is "Public"

**Page Not Found:** Share page/database with integration in Notion (Share button → Search integration name → Invite)

**Tools Not Discovered:** Regenerate embeddings (`npm run generate-embeddings -- --integration notion --force`), restart gateway

**Rate Limiting:** Gateway handles automatically (3 req/sec, exponential backoff). Configure in `.env` if needed.

---

## Security

- ✅ **OAuth 2.0** with Notion
- ✅ **Per-tenant encryption** via Vault Transit engine
- ✅ **Tokens encrypted at rest** in HashiCorp Vault
- ✅ **Automatic token refresh** (Notion tokens don't expire but can be rotated)
- ✅ **Audit logging** for all credential access
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Notion API Documentation:** https://developers.notion.com/
- **OAuth Setup:** See `/docs/integrations/NOTION_SETUP.md`
- **Platform Docs:** `/docs/USING_CONNECTORS_PLATFORM.md`
- **Issues:** GitHub Issues

---

**Built with Model Context Protocol (MCP)**

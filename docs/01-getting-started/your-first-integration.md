# Your First Integration: Notion

Complete Notion integration setup with OAuth. **Time: ~30 minutes**

---

## Prerequisites

- ✅ [Installation](installation.md) and [Quick Start](quick-start.md) complete
- ✅ Notion account ([notion.so](https://notion.so))

---

## Step 1: Create Notion Integration

1. Go to: https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. **Settings:**
   - **Name**: `Connectors Platform Dev`
   - **Type**: Internal
   - **Capabilities**: Read, Update, Insert
4. Click **"Submit"**
5. Click **"Configure OAuth"**
6. **Redirect URI**: `http://localhost:3000/api/v1/oauth/callback/notion`
7. **Save changes**

**Copy:** Client ID and Client Secret

---

## Step 2: Configure OAuth

### Store in Vault

```bash
docker compose exec vault vault kv put secret/notion/oauth \
  client_id="<your-client-id>" \
  client_secret="<your-client-secret>" \
  redirect_uri="http://localhost:3000/api/v1/oauth/callback/notion"
```

### Create Tenant

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{"tenantId": "my-team", "name": "My Team", "integrations": ["notion"]}'
```

---

## Step 3: Complete OAuth Flow

### Get Authorization URL

```bash
curl http://localhost:3000/api/v1/oauth/authorize/notion?tenantId=my-team
```

### Authorize

1. Copy `authUrl` from response
2. Open in browser
3. Select workspace
4. Click **"Allow access"**

### Verify

```bash
curl http://localhost:3000/api/v1/tenants/my-team/integrations/notion
```

**Response:** `{"success": true, "status": "active", "hasCredentials": true}`

---

## Step 4: Test Tool Selection

```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{"query": "create a Notion page", "context": {"tenantId": "my-team"}}'
```

**Response:** Returns `notion.createPage` tool

---

## Step 5: Invoke Tool

### Get Database ID

1. Open Notion database
2. URL: `https://www.notion.so/username/abc123def456?v=...`
3. Database ID: `abc123def456`

### Create Page

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolId": "notion.createPage",
    "integration": "notion",
    "tenantId": "my-team",
    "parameters": {
      "parent": {"database_id": "abc123def456"},
      "properties": {
        "Name": {"title": [{"text": {"content": "My First Page"}}]},
        "Status": {"select": {"name": "In Progress"}}
      },
      "children": [
        {"object": "block", "type": "heading_1", "heading_1": {"rich_text": [{"text": {"content": "Welcome!"}}]}},
        {"object": "block", "type": "to_do", "to_do": {"rich_text": [{"text": {"content": "Test"}}], "checked": true}}
      ]
    }
  }'
```

**Response:** Returns page URL - open it to see your created page!

---

## What Happened?

```
Request → OAuth Proxy → Vault (credentials) → Auto-refresh → Inject auth → MCP Server → Notion API
```

**Benefits:** No token management, auto-refresh, per-tenant isolation, encrypted storage

---

## More Examples

### Query Database

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{
    "toolId": "notion.queryDatabase",
    "tenantId": "my-team",
    "parameters": {
      "database_id": "abc123def456",
      "filter": {"property": "Status", "select": {"equals": "Done"}}
    }
  }'
```

### Update Page

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId": "notion.updatePage", "tenantId": "my-team", "parameters": {"page_id": "xyz", "properties": {...}}}'
```

---

## Multi-Tenant

### Create Second Tenant

```bash
curl -X POST http://localhost:3000/api/v1/tenants \
  -d '{"tenantId": "acme", "name": "ACME", "integrations": ["notion"]}'

# Get OAuth URL and authorize
curl http://localhost:3000/api/v1/oauth/authorize/notion?tenantId=acme
```

Each tenant has isolated credentials, separate tokens, independent refresh, encrypted storage.

---

## Troubleshooting

**OAuth failed:** Check redirect URI matches exactly

**Token expired:** `curl http://localhost:3000/api/v1/oauth/authorize/notion?tenantId=my-team` (re-authorize)

**Tool not found:** `cd gateway && npm run generate-embeddings`

**Permission denied:** In Notion, share database with your integration (Settings → Add connections)

---

## Next Steps

🎉 **Success!** You've setup multi-tenant OAuth with auto-injection.

### Add More Integrations

- [GitHub Setup](../integrations/GITHUB_SETUP.md)
- [LinkedIn Setup](../integrations/LINKEDIN_SETUP.md)

### Advanced Features

- [Multi-Tenant Setup](../MULTI_TENANT_SETUP.md) - Production deployment
- [Usage Guide](../USING_CONNECTORS_PLATFORM.md) - All features
- [API Reference](../../README.md#-api-reference) - Complete docs

### Build AI Agent

```python
from langchain.tools import Tool
from connectors_client import ConnectorsClient

client = ConnectorsClient(base_url='http://localhost:3000', tenant_id='my-team')
tool = Tool(name="Connectors", func=lambda q: client.select_tools(q), description="368 tools across 15 MCP servers")
```

---

**Key Takeaways:** No token management • Multi-tenant isolation • Semantic discovery • Enterprise security

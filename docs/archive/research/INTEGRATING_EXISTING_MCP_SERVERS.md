# Integrating Existing MCP Servers into Connectors Platform

**Date:** 2025-11-11
**Audience:** Developers wanting to integrate existing MCP servers
**Difficulty:** Easy (5-15 minutes per server)

---

## Overview

The Connectors Platform makes it **extremely easy** to integrate existing MCP servers - whether they're from the community, official MCP registry, or custom-built. You don't need to regenerate anything or modify your existing servers.

**Integration Methods:**
1. **Registry-Based** - Register metadata, plug and play (5 mins)
2. **Docker-Based** - Add to docker-compose (10 mins)
3. **Direct Connection** - Point gateway to running server (2 mins)

---

## Why It's Easy

The platform is designed around **standard MCP protocol** compliance:

✅ **No Code Changes Required** - Existing MCP servers work as-is
✅ **Standard Protocol** - Uses official @modelcontextprotocol/sdk
✅ **Flexible Discovery** - Manual or automatic tool discovery
✅ **OAuth Optional** - Platform handles auth, or server can do it
✅ **Category-Based Organization** - Simple categorization system

---

## Method 1: Registry-Based Integration (Recommended) ⭐

### Step 1: Create Tool Registry Entry

Create a JSON file describing your existing MCP server's tools:

```json
// gateway/data/registry/existing-servers/slack-mcp.json
{
  "integration": "slack",
  "category": "communication",
  "version": "1.0.0",
  "source": "community",
  "serverUrl": "http://localhost:3100",
  "auth": {
    "type": "oauth2",
    "vaultPath": "secret/tenants/{tenant_id}/slack"
  },
  "tools": [
    {
      "id": "slack.sendMessage",
      "name": "sendMessage",
      "description": "Send a message to a Slack channel",
      "category": "communication",
      "integration": "slack",
      "parameters": {
        "type": "object",
        "properties": {
          "channel": { "type": "string", "description": "Channel ID" },
          "text": { "type": "string", "description": "Message text" }
        },
        "required": ["channel", "text"]
      },
      "tokenCost": 150,
      "requiredScopes": ["chat:write"]
    },
    {
      "id": "slack.listChannels",
      "name": "listChannels",
      "description": "List all channels in workspace",
      "category": "communication",
      "integration": "slack",
      "parameters": {
        "type": "object",
        "properties": {
          "limit": { "type": "number", "description": "Max channels" }
        }
      },
      "tokenCost": 120,
      "requiredScopes": ["channels:read"]
    }
  ]
}
```

### Step 2: Generate Embeddings

Run the embedding generator to make tools discoverable:

```bash
cd gateway
npm run generate-embeddings -- --registry-file data/registry/existing-servers/slack-mcp.json
```

This creates FAISS embeddings for semantic search.

### Step 3: Add to Gateway Configuration

Update gateway environment:

```bash
# .env
MCP_SERVERS=github,slack,jira  # Add your server
SLACK_SERVER_URL=http://localhost:3100
```

### Step 4: Start the Server

```bash
# Terminal 1: Your existing Slack MCP server
cd ~/my-slack-mcp-server
npm start  # Runs on port 3100

# Terminal 2: Gateway
cd gateway
npm run dev
```

**That's it!** ✅ The gateway will now:
- Discover your Slack tools via semantic search
- Route queries to your existing server
- Handle OAuth token injection (if configured)
- Track usage in GraphRAG

---

## Method 2: Docker Compose Integration

Perfect for containerized existing servers.

### Step 1: Add Service to docker-compose.yml

```yaml
# docker-compose.yml
services:
  # ... existing services (gateway, vault, neo4j, redis)

  # Your existing MCP server
  mcp-slack-community:
    image: mcp/slack-server:latest  # Your existing Docker image
    container_name: connectors-mcp-slack
    environment:
      - NODE_ENV=development
      - PORT=3100
      - GATEWAY_URL=http://gateway:3000
    depends_on:
      gateway:
        condition: service_healthy
    networks:
      - connectors-network
```

### Step 2: Register Tools (same as Method 1)

Create registry entry in `gateway/data/registry/existing-servers/slack-mcp.json`

### Step 3: Start Everything

```bash
docker compose up -d
```

Gateway automatically discovers and routes to your server.

---

## Method 3: Direct Connection (Fastest)

For quick testing or development.

### Option A: Tool Discovery API

If your existing MCP server implements the standard `tools/list` endpoint:

```bash
# Gateway auto-discovers tools
curl http://localhost:3000/api/register-server \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "serverUrl": "http://localhost:3100",
    "integration": "slack",
    "category": "communication",
    "autoDiscover": true
  }'
```

The gateway will:
1. Call `http://localhost:3100/tools/list`
2. Parse tool definitions
3. Generate embeddings
4. Add to semantic search index

### Option B: Manual Tool List

If auto-discovery isn't available:

```bash
curl http://localhost:3000/api/register-tools \
  -X POST \
  -H "Content-Type: application/json" \
  -d @my-slack-tools.json
```

Where `my-slack-tools.json` contains the tool definitions.

---

## Real-World Examples

### Example 1: Community MCP Server (Filesystem)

**Scenario:** Integrate the official MCP Filesystem server

```bash
# 1. Install community server
npm install -g @modelcontextprotocol/server-filesystem

# 2. Start it
mcp-server-filesystem --port 3200 --root ~/workspace

# 3. Register with gateway
cat > gateway/data/registry/existing-servers/filesystem.json <<EOF
{
  "integration": "filesystem",
  "category": "data",
  "serverUrl": "http://localhost:3200",
  "tools": [
    {
      "id": "filesystem.readFile",
      "name": "readFile",
      "description": "Read contents of a file from the filesystem",
      "category": "data",
      "integration": "filesystem",
      "parameters": {
        "type": "object",
        "properties": {
          "path": { "type": "string", "description": "File path" }
        }
      },
      "tokenCost": 100
    },
    {
      "id": "filesystem.writeFile",
      "name": "writeFile",
      "description": "Write contents to a file",
      "category": "data",
      "integration": "filesystem",
      "parameters": {
        "type": "object",
        "properties": {
          "path": { "type": "string" },
          "content": { "type": "string" }
        }
      },
      "tokenCost": 120
    }
  ]
}
EOF

# 4. Generate embeddings
cd gateway && npm run generate-embeddings -- --registry-file data/registry/existing-servers/filesystem.json

# 5. Done!
```

### Example 2: Custom Internal MCP Server

**Scenario:** Your company has an internal API wrapped in MCP

```javascript
// Your existing internal server (unchanged)
// internal-api-mcp/server.js
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({
  name: 'company-internal-api',
  version: '1.0.0'
});

server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'getEmployeeInfo',
      description: 'Get employee information by ID',
      inputSchema: {
        type: 'object',
        properties: {
          employeeId: { type: 'string' }
        }
      }
    }
  ]
}));

server.listen(3300);
```

**Integration:**

```bash
# Just register it!
curl http://localhost:3000/api/register-server \
  -X POST \
  -d '{
    "serverUrl": "http://localhost:3300",
    "integration": "company-internal",
    "category": "data",
    "autoDiscover": true
  }'
```

Gateway handles everything else automatically.

### Example 3: Third-Party SaaS MCP Server

**Scenario:** Using a commercial MCP server (e.g., Stripe MCP)

```yaml
# docker-compose.yml
services:
  mcp-stripe:
    image: stripe/mcp-server:latest
    environment:
      - STRIPE_API_KEY=${STRIPE_API_KEY}
    networks:
      - connectors-network
```

```bash
# Register tools
npm run register-external-server -- \
  --url http://mcp-stripe:3000 \
  --integration stripe \
  --category finance
```

---

## Features That Work Automatically

Once you've integrated an existing MCP server, it **immediately benefits** from:

### 1. Semantic Routing ✅
```typescript
// AI query: "charge customer $50"
// Gateway automatically finds: stripe.createCharge
// No manual routing needed!
```

### 2. OAuth Injection ✅
```bash
# Configure once in Vault
vault kv put secret/tenants/acme-corp/stripe \
  access_token="sk_live_xxx" \
  refresh_token="rt_xxx"

# Gateway automatically injects for all Stripe calls
```

### 3. GraphRAG Relationships ✅
```typescript
// Gateway learns: stripe.createCharge → often used with → stripe.createCustomer
// Auto-suggests related tools
```

### 4. Token Optimization ✅
```
Traditional: Load ALL tools (250K tokens)
Connectors: Load only relevant tools (1-3K tokens)
Your server gets same queries, massively reduced context!
```

### 5. Rate Limiting ✅
```typescript
// Gateway handles rate limiting per integration
// Your server doesn't need to worry about it
```

### 6. Monitoring ✅
```bash
# Automatic metrics for your server:
- Tool usage counts
- Latency tracking
- Error rates
- Token costs
```

---

## Advanced Integration Options

### Custom Category

```json
{
  "integration": "my-custom-server",
  "category": "custom-category",  // Create your own!
  "tools": [...]
}
```

Gateway creates a new category embedding automatically.

### Multiple Instances

Run multiple instances of the same server:

```yaml
services:
  slack-us:
    image: slack-mcp
    environment:
      - REGION=us

  slack-eu:
    image: slack-mcp
    environment:
      - REGION=eu
```

```json
{
  "integration": "slack-us",
  "serverUrl": "http://slack-us:3000"
},
{
  "integration": "slack-eu",
  "serverUrl": "http://slack-eu:3000"
}
```

Gateway routes based on tenant region.

### Tool Aliases

Alias existing tools for better discoverability:

```json
{
  "id": "slack.sendMessage",
  "name": "sendMessage",
  "description": "Send a message to a Slack channel",
  "aliases": [
    "postMessage",
    "sendSlackMessage",
    "messageChannel"
  ]
}
```

Improves semantic search accuracy.

### Tool Relationships

Manually define relationships for better suggestions:

```json
{
  "integration": "stripe",
  "tools": [...],
  "relationships": [
    {
      "sourceToolId": "stripe.createCharge",
      "targetToolId": "stripe.createCustomer",
      "type": "DEPENDS_ON",
      "weight": 0.9
    }
  ]
}
```

---

## Migration from Existing Setup

### From Standalone MCP Servers

**Before:**
```javascript
// Agent connects directly
const client = new MCPClient('http://localhost:3100');
const result = await client.callTool('sendMessage', params);
```

**After (via Gateway):**
```javascript
// Agent talks to gateway (same MCP protocol!)
const client = new MCPClient('http://localhost:3000');
const result = await client.callTool('sendMessage', params);
// Gateway routes to slack server automatically
```

**Benefits:**
- Semantic tool discovery
- Automatic OAuth
- Token optimization
- GraphRAG suggestions

### From Anthropic MCP Desktop

If you're using Claude Desktop with local MCP servers:

```json
// claude_desktop_config.json (before)
{
  "mcpServers": {
    "slack": {
      "command": "node",
      "args": ["/path/to/slack-server.js"]
    }
  }
}
```

```json
// With Connectors Gateway (after)
{
  "mcpServers": {
    "connectors-gateway": {
      "command": "node",
      "args": ["/path/to/connectors/gateway/dist/server.js"]
    }
  }
}
```

Gateway provides all your registered servers through one connection!

---

## Comparison: Generated vs Existing Servers

| Feature | Auto-Generated | Existing (Integrated) |
|---------|---------------|----------------------|
| **Setup Time** | 2 minutes (openapi-mcp-gen) | 5-15 minutes (registry + config) |
| **OAuth** | ✅ Auto-configured | ⚠️ Manual or use gateway |
| **Rate Limiting** | ✅ Auto-configured | ⚠️ Manual or use gateway |
| **Type Safety** | ✅ Full TypeScript | Depends on original |
| **Customization** | ⚠️ Template-based | ✅ Full control |
| **Maintenance** | ✅ Regenerate on API changes | ⚠️ Update manually |
| **Semantic Search** | ✅ Auto-embeddings | ✅ Manual embeddings |
| **GraphRAG** | ✅ Auto-learned | ✅ Auto-learned |
| **Token Optimization** | ✅ Yes | ✅ Yes |

**Both work great!** Choose based on your needs:
- **Generate:** New integrations, OpenAPI available, want automation
- **Integrate:** Existing servers, custom logic, community servers

---

## Best Practices

### 1. Tool Descriptions
Write **detailed, semantic descriptions**:

❌ Bad:
```json
"description": "Send message"
```

✅ Good:
```json
"description": "Send a text message to a Slack channel or direct message to a user"
```

Better semantic search accuracy!

### 2. Token Cost Estimation
Estimate accurately for optimization:

```json
{
  "tokenCost": 150  // Approx. characters / 4
}
```

Gateway uses this for budget allocation.

### 3. Categories
Use standard categories when possible:

```
code, communication, project_management, cloud, data,
crm, finance, ai, security, analytics
```

Or create custom ones!

### 4. OAuth Scopes
Document required scopes:

```json
{
  "requiredScopes": ["chat:write", "channels:read"]
}
```

Gateway validates tenant has correct permissions.

### 5. Examples
Add usage examples:

```json
{
  "examples": [
    {
      "description": "Send a message to #general",
      "input": {
        "channel": "C1234567",
        "text": "Hello world!"
      }
    }
  ]
}
```

Improves AI agent understanding.

---

## Troubleshooting

### Server Not Discovered

**Problem:** Gateway can't find your server's tools

**Solution:**
```bash
# Check server is running
curl http://localhost:3100/tools/list

# Verify registry file
cat gateway/data/registry/existing-servers/your-server.json

# Regenerate embeddings
npm run generate-embeddings -- --force
```

### OAuth Not Working

**Problem:** Auth tokens not being injected

**Solution:**
```bash
# Verify Vault has credentials
vault kv get secret/tenants/your-tenant/your-integration

# Check gateway environment
echo $VAULT_ADDR
echo $VAULT_TOKEN

# Test OAuth proxy
curl -X POST http://localhost:3000/api/test-auth \
  -d '{"integration": "slack", "tenantId": "test"}'
```

### Wrong Tools Selected

**Problem:** Semantic router picks wrong tools

**Solution:**
```json
// Improve tool descriptions
{
  "description": "Send a direct message to a specific Slack user by user ID or email",
  "tags": ["dm", "direct", "private", "user"],
  "aliases": ["sendDM", "messageUser"]
}
```

Regenerate embeddings after changes.

---

## Summary

**Integrating existing MCP servers is designed to be trivial:**

1. ✅ **5-15 minutes** to integrate any existing server
2. ✅ **No code changes** to existing servers required
3. ✅ **Standard MCP protocol** - full compatibility
4. ✅ **Automatic benefits**: semantic search, OAuth, GraphRAG, token optimization
5. ✅ **Flexible methods**: registry, Docker, direct connection

**Bottom line:** If it speaks MCP protocol, it works with Connectors Platform! 🚀

---

## Next Steps

1. **Try It:** Integrate a simple existing MCP server (filesystem, sqlite)
2. **Test:** Query gateway and verify routing works
3. **Monitor:** Check usage metrics in Neo4j and logs
4. **Scale:** Add more servers as needed

**Need Help?**
- Docs: `/docs/GATEWAY_SETUP_SUMMARY.md`
- Examples: `/examples/` (coming soon)
- Issues: GitHub Issues

---

**Last Updated:** 2025-11-11
**Version:** 1.0.0

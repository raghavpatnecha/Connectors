# Integrating Existing MCP Servers

**Add community or pre-built MCP servers in 5-15 minutes**

---

## Overview

Integrate any MCP-compliant server with zero code changes. Works with community servers, internal servers, or commercial MCP products.

**Time:** 5-15 minutes | **Effort:** No coding required

---

## Integration Methods

### Method 1: Registry-Based ⭐ (Recommended)
Register metadata, generate embeddings, done.

### Method 2: Docker Compose
Add to docker-compose.yml for containerized deployment.

### Method 3: Direct Connection
Quick API call for testing.

---

## Method 1: Registry-Based

**Time:** 10 minutes

### Step 1: Create Registry Entry

```bash
cd gateway/data/registry/existing-servers
```

Create `slack-mcp.json`:

```json
{
  "integration": "slack",
  "category": "communication",
  "version": "1.0.0",
  "serverUrl": "http://localhost:3100",
  "auth": {
    "type": "oauth2",
    "vaultPath": "secret/tenants/{tenant_id}/slack"
  },
  "tools": [
    {
      "id": "slack.sendMessage",
      "name": "sendMessage",
      "description": "Send a message to a Slack channel or DM to a user",
      "category": "communication",
      "integration": "slack",
      "parameters": {
        "type": "object",
        "properties": {
          "channel": { "type": "string", "description": "Channel ID or user ID" },
          "text": { "type": "string", "description": "Message text (Slack markdown)" }
        },
        "required": ["channel", "text"]
      },
      "tokenCost": 150,
      "requiredScopes": ["chat:write"]
    }
  ]
}
```

**Key Fields:**
- `integration` - Unique name
- `serverUrl` - MCP server location
- `auth.vaultPath` - Vault credential path (use `{tenant_id}` placeholder)
- `tools` - Array of tool definitions
- `tokenCost` - Token estimate (chars / 4)
- `requiredScopes` - OAuth scopes needed

### Step 2: Generate Embeddings

```bash
cd gateway
npm run generate-embeddings -- --registry-file data/registry/existing-servers/slack-mcp.json

# Output:
# ✅ Loaded 2 tools from slack-mcp.json
# ✅ Generated embeddings
# ✅ Updated FAISS index
```

### Step 3: Update Gateway Config

```bash
# .env
echo "SLACK_SERVER_URL=http://localhost:3100" >> .env
echo "MCP_SERVERS=github,slack" >> .env  # Add slack to list
```

### Step 4: Start Servers

```bash
# Terminal 1: Your Slack MCP server
cd ~/slack-mcp-server
npm start  # Port 3100

# Terminal 2: Gateway
cd gateway
npm run dev
```

### Step 5: Verify

```bash
curl -X POST http://localhost:3000/api/select-tools \
  -d '{"query": "send message to #general", "categories": ["communication"]}'

# Should return: slack.sendMessage ✅
```

---

## Method 2: Docker Compose

**Time:** 10 minutes

### Add to docker-compose.yml

```yaml
services:
  # ... existing (gateway, vault, neo4j, redis)

  mcp-slack:
    image: mcp/slack-server:latest
    container_name: connectors-slack
    environment:
      - PORT=3100
    networks:
      - connectors-network

networks:
  connectors-network:
    driver: bridge
```

### Create Registry

Same as Method 1, but use Docker service name:

```json
{
  "serverUrl": "http://mcp-slack:3100",
  ...
}
```

### Start

```bash
docker compose up -d
```

---

## Method 3: Direct Connection

**Time:** 5 minutes

### Auto-Discovery

```bash
curl -X POST http://localhost:3000/api/register-server \
  -d '{
    "serverUrl": "http://localhost:3100",
    "integration": "slack",
    "category": "communication",
    "autoDiscover": true
  }'

# Gateway calls http://localhost:3100/tools/list
# Parses tools, generates embeddings automatically
```

### Manual Registration

```bash
curl -X POST http://localhost:3000/api/register-tools \
  -d @slack-tools.json
```

---

## Real-World Examples

### Example 1: Filesystem Server

```bash
# Install official server
npm install -g @modelcontextprotocol/server-filesystem

# Start
mcp-server-filesystem --port 3200 --root ~/workspace &

# Register
cat > gateway/data/registry/existing-servers/filesystem.json <<EOF
{
  "integration": "filesystem",
  "category": "data",
  "serverUrl": "http://localhost:3200",
  "tools": [
    {
      "id": "filesystem.readFile",
      "name": "readFile",
      "description": "Read file contents from filesystem",
      "parameters": {
        "type": "object",
        "properties": {
          "path": { "type": "string" }
        }
      },
      "tokenCost": 100
    }
  ]
}
EOF

# Generate embeddings
cd gateway
npm run generate-embeddings -- --registry-file data/registry/existing-servers/filesystem.json

# Test
curl -X POST http://localhost:3000/api/select-tools \
  -d '{"query": "read a file", "categories": ["data"]}'
# Returns: filesystem.readFile ✅
```

### Example 2: Internal Company Server

```javascript
// Your existing server (unchanged)
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({ name: 'company-api', version: '1.0.0' });
server.setRequestHandler('tools/list', async () => ({
  tools: [{ name: 'getEmployeeInfo', description: '...', inputSchema: {...} }]
}));
server.listen(3300);
```

**Integration:**
```bash
curl -X POST http://localhost:3000/api/register-server \
  -d '{"serverUrl": "http://localhost:3300", "integration": "company-api", "category": "data", "autoDiscover": true}'
```

### Example 3: Commercial MCP (Stripe)

```yaml
# docker-compose.yml
services:
  mcp-stripe:
    image: stripe/mcp-server:latest
    environment:
      - STRIPE_API_KEY=${STRIPE_API_KEY}
```

```bash
npm run register-external-server -- \
  --url http://mcp-stripe:3000 \
  --integration stripe \
  --category finance
```

---

## Automatic Platform Benefits

Once integrated, your server gets:

✅ **Semantic Routing** - Natural language tool discovery
✅ **Token Optimization** - 95% reduction (1-3K vs 250K)
✅ **GraphRAG** - Tool relationship learning
✅ **OAuth Injection** - Gateway handles auth
✅ **Rate Limiting** - Per-tenant throttling
✅ **Monitoring** - Usage metrics in Neo4j
✅ **Caching** - Intelligent response caching

---

## Advanced Options

### Custom Categories

```json
{ "category": "my-custom-category" }
```

Gateway creates category embedding automatically.

### Multiple Instances

```yaml
services:
  slack-us: { image: slack-mcp, environment: { REGION: us } }
  slack-eu: { image: slack-mcp, environment: { REGION: eu } }
```

```json
[
  { "integration": "slack-us", "serverUrl": "http://slack-us:3000" },
  { "integration": "slack-eu", "serverUrl": "http://slack-eu:3000" }
]
```

### Tool Aliases

```json
{
  "name": "sendMessage",
  "aliases": ["postMessage", "messageChannel"]
}
```

### Manual Relationships

```json
{
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

## Troubleshooting

### Server Not Discovered

```bash
# Check server running
curl http://localhost:3100/tools/list

# Verify registry
cat gateway/data/registry/existing-servers/your-server.json

# Regenerate embeddings
npm run generate-embeddings -- --force
```

### OAuth Not Working

```bash
# Verify Vault
vault kv get secret/tenants/your-tenant/your-integration

# Check gateway env
echo $VAULT_ADDR
echo $VAULT_TOKEN

# Test auth
curl -X POST http://localhost:3000/api/test-auth \
  -d '{"integration": "slack", "tenantId": "test"}'
```

### Wrong Tools Selected

Improve descriptions:

```json
{
  "description": "Send a direct message to a specific Slack user by user ID or email",
  "tags": ["dm", "direct", "private"],
  "aliases": ["sendDM", "messageUser"]
}
```

Regenerate embeddings after edits.

---

## Best Practices

### 1. Detailed Descriptions

❌ `"Send message"`
✅ `"Send a text message to a Slack channel or DM to a user"`

### 2. Accurate Token Costs

```json
{ "tokenCost": 150 }  // Approx. chars / 4
```

### 3. Standard Categories

`code, communication, project_management, cloud, data, crm, finance, ai, security, analytics`

### 4. Document Scopes

```json
{ "requiredScopes": ["chat:write", "channels:read"] }
```

### 5. Usage Examples

```json
{
  "examples": [{
    "description": "Send to #general",
    "input": { "channel": "C1234", "text": "Hello!" }
  }]
}
```

---

## Comparison

| Feature | Auto-Generated | Existing (Integrated) |
|---------|---------------|----------------------|
| **Setup** | 2 mins | 5-15 mins |
| **OAuth** | ✅ Auto | ⚠️ Manual or gateway |
| **Customization** | ⚠️ Template | ✅ Full control |
| **Maintenance** | ✅ Regenerate | ⚠️ Manual updates |
| **Semantic Search** | ✅ Auto | ✅ Manual embeddings |

Both work great! Choose based on needs.

---

## Summary

Integrating existing MCP servers is trivial:

1. ✅ 5-15 minutes per server
2. ✅ Zero code changes required
3. ✅ Standard MCP protocol
4. ✅ Automatic platform benefits
5. ✅ Flexible integration methods

**If it speaks MCP, it works!** 🚀

---

## Next Steps

1. Choose method (registry recommended)
2. Create registry entry
3. Generate embeddings
4. Test routing
5. Deploy

---

## Support

- **Examples:** `/integrations/`
- **Gateway Setup:** `/docs/GATEWAY_SETUP_SUMMARY.md`
- **Platform Guidelines:** `/CLAUDE.md`
- **Community MCPs:** https://github.com/modelcontextprotocol

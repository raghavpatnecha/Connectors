# Adding New Integrations

**Quick decision guide for adding integrations to the Connectors Platform**

---

## Decision Tree

```
Have OpenAPI spec? → YES → Use OpenAPI Generator (2 mins) ⭐
                   → NO  → Community MCP exists? → YES → Integrate Existing (5-15 mins) ⭐
                                                 → NO  → Build Custom (1-2 days)
```

---

## Quick Comparison

| Method | Time | Complexity | Use When | OAuth | Tests |
|--------|------|------------|----------|-------|-------|
| **OpenAPI Generator** | 2 mins | Easy | OpenAPI spec available | ✅ Auto | ✅ Auto |
| **Existing MCP** | 5-15 mins | Easy | Community server exists | ⚠️ Manual | ⚠️ Varies |
| **Custom MCP** | 1-2 days | Complex | Custom requirements | ⚠️ Manual | ⚠️ Manual |

---

## Method 1: OpenAPI Generator ⭐

**Best for:** REST APIs with OpenAPI specs

**Quick Start:**
```bash
# Download spec
curl -o api.yaml https://api.example.com/openapi.yaml

# Generate MCP server
cd generator
python -m generator generate api.yaml --category communication

# Configure & run
cd ../integrations/communication/api-generated
cp .env.example .env
npm install && npm run build && npm start
```

**Pros:** Fastest (2 mins), fully automated, OAuth auto-configured, TypeScript type-safe
**Cons:** Requires OpenAPI spec, template-based, REST only

**→ Details:** [from-openapi.md](./from-openapi.md)

---

## Method 2: Integrate Existing MCP

**Best for:** Community or pre-built MCP servers

**Quick Start:**
```bash
# Install community server
npm install -g @modelcontextprotocol/server-slack

# Start server
mcp-server-slack --port 3100 &

# Register with gateway
curl -X POST http://localhost:3000/api/register-server \
  -d '{"serverUrl": "http://localhost:3100", "integration": "slack", "category": "communication", "autoDiscover": true}'
```

**Pros:** No coding, works with any MCP server, 5-15 mins
**Cons:** OAuth setup manual, dependent on upstream

**→ Details:** [existing-mcp.md](./existing-mcp.md)

---

## Method 3: Build Custom MCP

**Best for:** Complex integrations (browser automation, GraphQL, custom auth)

**When to use:**
- No OpenAPI spec
- Browser automation needed (LinkedIn example)
- Complex auth (SAML, JWT, custom)
- Non-REST protocols (WebSocket, GraphQL, gRPC)

**Project Structure:**
```
your-integration/
├── src/
│   ├── index.ts              # MCP server
│   ├── auth/
│   │   ├── oauth-manager.ts
│   │   └── vault-client.ts
│   ├── clients/
│   │   └── api-client.ts
│   └── tools/
│       └── *-tools.ts
├── tests/
└── package.json
```

**→ Details:** [custom-mcp.md](./custom-mcp.md)

---

## Example Scenarios

### Stripe (Has OpenAPI)
```bash
curl -o stripe.yaml https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.yaml
python -m generator generate stripe.yaml --category finance
```
✅ OpenAPI Generator (2 minutes)

### Slack (Community MCP Available)
```bash
npm install -g @modelcontextprotocol/server-slack
npm run register-external -- --url http://localhost:3200 --integration slack
```
✅ Integrate Existing (10 minutes)

### LinkedIn (API Limited, Needs Browser Automation)
See `/integrations/communication/linkedin-unified/` - Custom implementation with Playwright
✅ Custom MCP (1-2 days)

### Reddit (Complex Rate Limiting)
See `/integrations/communication/reddit-unified/` - Custom with token bucket + caching
✅ Custom MCP (1-2 days)

---

## Integration Checklist

### All Methods
- [ ] API credentials/keys
- [ ] HashiCorp Vault running
- [ ] Node.js 18+
- [ ] Gateway running

### OpenAPI Method
- [ ] OpenAPI 3.0+ spec (JSON/YAML)
- [ ] API category (code, communication, data, etc.)
- [ ] OAuth credentials

### Existing MCP Method
- [ ] MCP server URL or Docker image
- [ ] Tool list or auto-discovery
- [ ] OAuth configured

### Custom MCP Method
- [ ] API documentation
- [ ] Auth flow understood
- [ ] TypeScript knowledge
- [ ] 1-2 days available

---

## Platform Benefits

Once integrated (any method), you automatically get:

✅ **Semantic Routing** - Natural language tool discovery
✅ **Token Optimization** - 95% reduction (1-3K vs 250K)
✅ **GraphRAG** - Tool relationship learning
✅ **OAuth Proxy** - Gateway handles auth
✅ **Rate Limiting** - Per-tenant throttling
✅ **Monitoring** - Usage metrics in Neo4j
✅ **Caching** - Intelligent response caching
✅ **Multi-Tenant** - Isolated credentials

---

## Testing Integration

```bash
# Test semantic routing
curl http://localhost:3000/api/select-tools \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "send a message",
    "categories": ["communication"],
    "maxTools": 5
  }'
```

Should return your integration's relevant tools!

---

## Common Questions

**Q: Can I mix methods?**
A: Yes! Generate from OpenAPI, then customize. Or integrate existing, then fork.

**Q: What if API changes?**
A: OpenAPI → Regenerate. Custom → Update manually. Existing → Upstream updates.

**Q: Which is most maintainable?**
A: OpenAPI (auto-regenerate) > Existing (upstream maintains) > Custom (you maintain)

**Q: Max operations per server?**
A: 100 operations. Generator auto-splits if needed.

---

## Next Steps

1. **Choose method** via decision tree
2. **Read detailed guide** (links above)
3. **Set up prerequisites** (Vault, Gateway)
4. **Generate/integrate** server
5. **Test** semantic routing
6. **Deploy** (see `/docs/02-guides/deployment/`)

---

## Support

- **Docs:** `/docs/`
- **Examples:** `/integrations/`
- **OpenAPI Specs:** https://api.apis.guru/v2/list.json (8000+ specs)

---

**Quick Reference:**
- ⚡ **Fastest:** OpenAPI (2 mins)
- 🔌 **Easiest:** Existing (5-15 mins)
- 🎨 **Control:** Custom (1-2 days)

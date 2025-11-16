# Quick Start Guide

Get running in **5 minutes** and make your first semantic tool selection query.

---

## Prerequisites

- ✅ [Installation](installation.md) completed
- ✅ Services running (`docker compose ps`)
- ✅ FAISS embeddings generated

---

## Step 1: Verify Gateway

```bash
curl http://localhost:3000/health
```

**Response:** `{"status":"ok"}`

---

## Step 2: Select Tools Semantically

```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -H "Content-Type: application/json" \
  -d '{"query": "create a GitHub pull request", "context": {"maxTools": 5}}'
```

**Response:**
```json
{
  "success": true,
  "tools": {
    "tier1": [{
      "id": "github.createPullRequest",
      "name": "createPullRequest",
      "description": "Create a pull request in a repository",
      "category": "code",
      "tokenCost": 150
    }]
  },
  "metadata": {"tokenUsage": 285, "latency_ms": 1}
}
```

**Result:** 285 tokens vs 77,698 (99.6% reduction)

---

## Step 3: Try Different Queries

### Notion

```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "create a Notion page"}'
```

### LinkedIn

```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "send LinkedIn message"}'
```

### Multi-Category

```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query":"create GitHub issue","context":{"allowedCategories":["code"]}}'
```

---

## Step 4: List Tools

```bash
curl http://localhost:3000/api/v1/tools/list                      # All
curl "http://localhost:3000/api/v1/tools/list?category=code"      # By category
curl "http://localhost:3000/api/v1/tools/list?integration=github" # By integration
```

---

## Step 5: List Categories

```bash
curl http://localhost:3000/api/v1/categories
```

**Response:** `{"categories": ["code", "communication", "productivity", ...]}`

---

## Use in Code

### Python

```python
import requests

response = requests.post('http://localhost:3000/api/v1/tools/select', json={
    'query': 'create a GitHub pull request',
    'context': {'maxTools': 5}
})

tools = response.json()['tools']['tier1']
print(f"Selected {len(tools)} tools using {response.json()['metadata']['tokenUsage']} tokens")
```

### JavaScript

```javascript
const response = await axios.post('http://localhost:3000/api/v1/tools/select', {
  query: 'create a GitHub pull request',
  context: { maxTools: 5 }
});

console.log(`Token usage: ${response.data.metadata.tokenUsage}`);
```

---

## Progressive Loading

**Tier 1:** Top 3 tools, full schema (~150 tokens each)
**Tier 2:** Next 5 tools, basic params (~100 tokens each)
**Tier 3:** Remaining, minimal (~30 tokens each)

**Traditional:** 85 tools × 155 = 13,175 tokens
**Connectors:** 3×150 + 2×100 = 650 tokens (95% reduction)

---

## Common Use Cases

```bash
# GitHub
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "create a GitHub pull request"}'

# Notion
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "create a Notion page"}'

# LinkedIn
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "get LinkedIn profile"}'
```

---

## Troubleshooting

**No tools returned:** `cd gateway && npm run generate-embeddings && docker compose restart gateway`

**High latency:** `docker compose restart`

**Connection refused:** `docker compose logs gateway && docker compose restart gateway`

---

## API Endpoints

```bash
curl http://localhost:3000/health                                 # Health
curl http://localhost:3000/ready                                  # Readiness
curl -X POST http://localhost:3000/api/v1/tools/select -d '{...}' # Select tools
curl http://localhost:3000/api/v1/tools/list                      # List tools
curl http://localhost:3000/api/v1/categories                      # Categories
```

---

## Next Steps

🎉 **Success!** You've seen 95%+ token reduction in action.

**Continue:**

[Your First Integration →](your-first-integration.md) - Setup Notion with OAuth

[Usage Guide →](../USING_CONNECTORS_PLATFORM.md) - All features

[API Reference →](../../README.md#-api-reference) - Complete docs

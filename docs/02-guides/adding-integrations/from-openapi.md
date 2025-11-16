# Adding Integrations from OpenAPI

**Generate MCP servers from OpenAPI specs in 2 minutes**

---

## Overview

Auto-generate production-ready MCP servers from OpenAPI 3.0+ specifications with:
- ✅ TypeScript type-safe code
- ✅ OAuth pre-configured
- ✅ Rate limits from spec
- ✅ Integration tests
- ✅ Tool descriptions from API docs

**Time:** ~2 minutes per integration

---

## Prerequisites

- Python 3.9+
- Node.js 18+
- OpenAPI 3.0+ spec (JSON/YAML)
- HashiCorp Vault running
- API credentials

---

## Quick Start

### 1. Find OpenAPI Spec

**APIs.guru (8000+ specs):**
```bash
curl https://api.apis.guru/v2/list.json | jq 'keys'
curl https://api.apis.guru/v2/specs/github.com/1.1.4/openapi.yaml -o github.yaml
```

**From provider docs** (GitHub, Stripe, Twilio, Google)

**From Postman:**
```bash
npm install -g postman-to-openapi
p2o collection.json -f openapi.yaml
```

### 2. Validate Spec

```bash
cd generator
python -m generator validate path/to/spec.yaml
# ✅ Valid OpenAPI 3.0.2
# ✅ OAuth found: oauth2
# ✅ 47 operations
```

### 3. Generate

```bash
python -m generator generate github.yaml --category code

# Options:
# --output DIR        Custom output directory
# --force-split       Split even if <100 ops
# --include-tests     Generate tests (default: true)
# --dry-run          Preview only
```

### 4. Configure

```bash
cd ../integrations/code/github-generated
cp .env.example .env
```

Edit `.env`:
```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_REDIRECT_URI=http://localhost:3001/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token
```

### 5. Build & Run

```bash
npm install
npm run build
npm test
npm start  # Runs on http://localhost:3001
```

### 6. Register with Gateway

```bash
cd ../../../gateway
npm run generate-embeddings -- --integration github-generated --category code
echo "GITHUB_GENERATED_SERVER_URL=http://localhost:3001" >> .env
npm run dev
```

### 7. Test

```bash
curl -X POST http://localhost:3000/api/select-tools \
  -d '{"query": "create pull request", "categories": ["code"]}'
# Returns: github-generated.createPullRequest ✅
```

---

## Generated Structure

```
github-generated/
├── src/
│   ├── index.ts              # MCP server
│   ├── tools/
│   │   ├── repos-tools.ts
│   │   ├── issues-tools.ts
│   │   └── pulls-tools.ts
│   ├── auth/
│   │   ├── oauth-manager.ts
│   │   └── vault-client.ts
│   ├── clients/
│   │   └── api-client.ts
│   └── types/
│       └── generated.ts      # From OpenAPI schemas
├── tests/
│   └── integration.test.ts
├── package.json
└── README.md
```

---

## What Gets Auto-Generated

### 1. Tool Definitions

OpenAPI operation → MCP tool:

```yaml
# OpenAPI:
paths:
  /repos/{owner}/{repo}/pulls:
    post:
      operationId: pulls/create
      summary: Create a pull request
```

```typescript
// Generated:
{
  name: "createPullRequest",
  description: "Create a pull request",
  parameters: { /* from OpenAPI schema */ }
}
```

### 2. OAuth Config

```yaml
# OpenAPI:
components:
  securitySchemes:
    oauth2:
      flows:
        authorizationCode:
          authorizationUrl: https://github.com/login/oauth/authorize
          tokenUrl: https://github.com/login/oauth/access_token
```

```typescript
// Generated:
export const OAUTH_CONFIG = {
  authorizationUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  flowType: 'authorizationCode'
};
```

### 3. Rate Limits

```yaml
# OpenAPI extension:
x-rate-limit:
  limit: 5000
  window: 3600
```

```typescript
// Generated rate limiter
const rateLimiter = new RateLimiter({ requestsPerHour: 5000 });
```

### 4. TypeScript Types

```yaml
# OpenAPI schema:
Repository:
  type: object
  properties:
    id: { type: integer }
    name: { type: string }
```

```typescript
// Generated:
export interface Repository {
  id: number;
  name: string;
}
```

### 5. Integration Tests

```typescript
describe('GitHub MCP', () => {
  it('should create PR', async () => {
    const result = await mcpServer.callTool('createPullRequest', {
      owner: 'test', repo: 'repo', title: 'Test', head: 'feature', base: 'main'
    });
    expect(result.success).toBe(true);
  });
});
```

---

## Large APIs (>100 Operations)

Auto-splits into multiple servers:

```bash
python -m generator generate google-drive.yaml --category data
# ✅ Generated 2 servers:
#    - google-drive-files (75 ops)
#    - google-drive-permissions (75 ops)
```

**Splitting strategy:**
1. By OpenAPI tags (preferred)
2. By path prefix
3. Alphabetically

---

## Customization

### Option 1: Post-Generation Edits

```bash
python -m generator generate api.yaml --category data
cd ../integrations/data/api-generated/src
# Edit generated files, add custom logic
```

### Option 2: Template Customization

```bash
cd generator/templates
# Edit: mcp-server.ts.jinja2, tool-definition.ts.jinja2
python -m generator generate api.yaml --templates ./custom-templates
```

### Option 3: Generation Hooks

```python
# generator/hooks/post_generation.py
def post_generation_hook(context):
    # Add custom files, modify generated code
    pass
```

---

## Validation

```bash
npm run validate
# ✅ TypeScript compiles
# ✅ All tools have descriptions
# ✅ OAuth complete
# ✅ Rate limits implemented
# ✅ No hardcoded secrets
# ✅ Tests pass
```

---

## Common Issues

### OAuth URLs Missing
```typescript
// Add manually to src/auth/oauth-manager.ts
export const OAUTH_CONFIG = {
  authorizationUrl: 'https://api.example.com/oauth/authorize',
  tokenUrl: 'https://api.example.com/oauth/token'
};
```

### Rate Limits Not Specified
```bash
# Update .env
RATE_LIMIT_PER_SECOND=10
RATE_LIMIT_PER_HOUR=10000
```

### Complex Auth (Unsupported)
```bash
# Generate without auth, add manually
python -m generator generate api.yaml --no-auth
# Then implement in src/auth/
```

---

## Complete Example: Twilio

```bash
# 1. Get spec
curl -o twilio.yaml https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/yaml/twilio_api_v2010.yaml

# 2. Validate
cd generator
python -m generator validate twilio.yaml
# ✅ Valid, 45 operations

# 3. Generate
python -m generator generate twilio.yaml --category communication

# 4. Configure
cd ../integrations/communication/twilio
cp .env.example .env
# Edit: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN

# 5. Build & test
npm install && npm run build && npm test

# 6. Start
npm start

# 7. Register
cd ../../../gateway
npm run generate-embeddings -- --integration twilio --category communication
echo "TWILIO_SERVER_URL=http://localhost:3001" >> .env

# 8. Test
curl -X POST http://localhost:3000/api/select-tools \
  -d '{"query": "send SMS", "categories": ["communication"]}'
# Returns: twilio.sendMessage ✅
```

---

## Best Practices

### 1. Use Latest OpenAPI
```bash
# Prefer 3.1 > 3.0 > 2.0
# Convert Swagger 2.0:
npm install -g swagger2openapi
swagger2openapi swagger.json -o openapi.yaml
```

### 2. Always Validate First
```bash
python -m generator validate spec.yaml
```

### 3. Review Generated Scopes
```typescript
// src/auth/oauth-manager.ts
export const REQUIRED_SCOPES = [
  'repo',      // ✅ Keep
  'admin:org'  // ❌ Remove if too broad
];
```

### 4. Test OAuth Flow
```bash
npm run test:oauth
```

### 5. Monitor Tokens
```bash
npm run analyze-tokens -- --integration your-integration
```

---

## Next Steps

1. Generate first server (Quick Start above)
2. Test OAuth with credentials
3. Register with gateway
4. Deploy (see `/docs/02-guides/deployment/`)
5. Monitor via Neo4j

---

**Time Saved:** 2 mins (OpenAPI) vs 1-2 days (manual) = **99.7% faster!**

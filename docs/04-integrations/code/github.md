# GitHub Integration

**Status:** ✅ Complete | **Category:** Code | **OAuth:** Required | **Architecture:** Official SDK (@octokit/rest)

---

## Overview

GitHub Unified MCP Server provides production-ready GitHub integration with OAuth 2.0, multi-tenant support, and 29 comprehensive tools. This unified server replaces 44 fragmented servers with a single, efficient implementation.

### Efficiency Benefits
- **Before:** 44 containers, 2.2GB memory, complex deployment
- **After:** 1 container, 200MB memory, simple deployment
- **Pattern:** Matches LinkedIn/Reddit unified architecture

### Key Features
✅ **OAuth 2.0 Authentication** - No manual token management
✅ **29 GitHub Tools** - Repositories, Issues, PRs, Actions
✅ **Production Ready** - Rate limiting, error handling, logging
✅ **Multi-Tenant** - HashiCorp Vault credential storage
✅ **Official SDK** - `@octokit/rest` for reliability

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- HashiCorp Vault (running)
- GitHub account

**1. Create GitHub OAuth App:**
- Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
- Homepage URL: `http://localhost:3110`
- Callback URL: `http://localhost:3110/oauth/callback`
- Copy Client ID and Secret

**2. Configure Environment:**
```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_REDIRECT_URI=http://localhost:3110/oauth/callback
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token
```

**3. Run:**
```bash
docker compose up -d vault
docker compose build mcp-github
docker compose --profile github up -d
```

**4. Authenticate:**
```bash
curl "http://localhost:3110/oauth/authorize?tenant_id=my-tenant"
# Open returned URL in browser
```

---

## Available Tools (29)

**Repository (7):** `github_get_repository`, `github_list_repositories`, `github_create_repository`, `github_get_contents`, `github_create_or_update_file`, `github_list_branches`, `github_list_commits`

**Issues (6):** `github_list_issues`, `github_get_issue`, `github_create_issue`, `github_update_issue`, `github_list_issue_comments`, `github_create_issue_comment`

**Pull Requests (8):** `github_list_pull_requests`, `github_get_pull_request`, `github_create_pull_request`, `github_update_pull_request`, `github_merge_pull_request`, `github_list_pr_files`, `github_request_pr_reviewers`, `github_list_pr_reviews`

**Actions (8):** `github_list_workflows`, `github_get_workflow`, `github_list_workflow_runs`, `github_get_workflow_run`, `github_trigger_workflow`, `github_cancel_workflow_run`, `github_rerun_workflow`, `github_list_workflow_run_jobs`

---

## Configuration Details

**OAuth:** `GET /oauth/authorize?tenant_id=X` → User authorizes → Credentials stored in Vault

**Tool Invocation:** All tools require `tenantId` parameter (e.g., `{"owner":"octocat","repo":"hello","tenantId":"my-tenant"}`)

**Health Check:** `GET /health` returns status

---

## Known Limitations

### API Limitations
1. **Rate limits:** 5,000 req/hour for authenticated users
2. **GraphQL not supported:** Only REST API v3
3. **Large files:** Limited to 100MB via REST API
4. **Archive downloads:** Not implemented yet

### Best Practices
- ✅ Use official `@octokit/rest` SDK
- ✅ Handle rate limit errors (429)
- ✅ Monitor rate limit headers
- ✅ Cache frequent queries
- ❌ Don't exceed rate limits
- ❌ Don't use for large file operations

---

## Architecture Notes

**Stack:** @octokit/rest SDK → Gateway (OAuth proxy) → Vault (credential storage)

**Efficiency:** 1 container (200MB) replaces 44 containers (2.2GB) - 91% memory reduction

---

## Error Handling

### Rate Limiting

```json
{
  "error": "RateLimitError",
  "message": "GitHub API rate limit exceeded. Resets at 2025-11-13T11:00:00Z",
  "code": "RATE_LIMIT_ERROR",
  "statusCode": 429,
  "details": {
    "resetAt": "2025-11-13T11:00:00Z",
    "limit": 5000,
    "remaining": 0
  }
}
```

### OAuth Errors

```json
{
  "error": "OAuthError",
  "message": "GitHub authentication failed. Token may be expired or invalid.",
  "code": "OAUTH_ERROR",
  "statusCode": 401
}
```

---

## Development

### Local Setup

```bash
cd integrations/code/github-unified

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

## Migration from Fragmented

If migrating from the 44-server architecture:

1. **Update docker-compose.yml** - Already done ✅
2. **Update gateway integration** - Already done ✅
3. **Re-authenticate tenants** - OAuth tokens work automatically
4. **Update tool names** - Use new unified tool names (e.g., `github_create_repository`)

---

## Security

- ✅ **OAuth 2.0** with automatic token refresh
- ✅ **Per-tenant encryption** via Vault Transit engine
- ✅ **Secure token storage** in HashiCorp Vault
- ✅ **Rate limiting** per tenant
- ✅ **Audit logging** for compliance
- ✅ **TLS/HTTPS** for all API calls

---

## Support

- **Documentation:** `/docs/LIMITATIONS.md`
- **Issues:** GitHub Issues
- **Pattern Reference:** See LinkedIn/Reddit unified servers
- **GitHub API:** https://docs.github.com/rest

---

**License:** MIT

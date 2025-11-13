# GitHub Unified MCP Server

**Production-ready GitHub integration** with OAuth 2.0, multi-tenant support, and 29 comprehensive tools.

## Architecture Benefits

This unified server **replaces 44 fragmented servers** with a single, efficient implementation:

- **Before**: 44 containers, 2.2GB memory, complex deployment
- **After**: 1 container, 200MB memory, simple deployment
- **Pattern**: Matches LinkedIn/Reddit unified architecture

## Features

✅ **OAuth 2.0 Authentication**
- No manual token management
- Automatic token refresh
- Multi-tenant credential storage via HashiCorp Vault

✅ **29 GitHub Tools**
- **Repositories** (7 tools): CRUD, contents, branches, commits
- **Issues** (6 tools): List, create, update, comment
- **Pull Requests** (8 tools): List, create, merge, review
- **Actions** (8 tools): Workflows, runs, jobs, triggers

✅ **Production Ready**
- Official `@octokit/rest` SDK
- Rate limiting (60 req/min)
- Comprehensive error handling
- Structured logging
- Health check endpoints

## Quick Start

### 1. Environment Variables

```bash
# Required
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=http://localhost:3110/oauth/callback

# Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token

# Optional
LOG_LEVEL=info
PORT=3000
```

### 2. Run with Docker Compose

```bash
# Start infrastructure
docker compose up -d vault

# Build and start GitHub unified server
docker compose build mcp-github
docker compose --profile github up -d
```

### 3. Authenticate

```bash
# Get OAuth URL for tenant
curl "http://localhost:3110/oauth/authorize?tenant_id=my-tenant"

# Open authUrl in browser to authenticate

# Use tools with tenantId
curl -X POST http://localhost:3110/tools/github_list_repositories \
  -H "Content-Type: application/json" \
  -d '{"username":"octocat","tenantId":"my-tenant"}'
```

## Available Tools

### Repository Tools (7)

| Tool | Description |
|------|-------------|
| `github_get_repository` | Get repository information |
| `github_list_repositories` | List user/org repositories |
| `github_create_repository` | Create new repository |
| `github_get_contents` | Get file/directory contents |
| `github_create_or_update_file` | Create or update files |
| `github_list_branches` | List repository branches |
| `github_list_commits` | List repository commits |

### Issues Tools (6)

| Tool | Description |
|------|-------------|
| `github_list_issues` | List repository issues |
| `github_get_issue` | Get issue by number |
| `github_create_issue` | Create new issue |
| `github_update_issue` | Update existing issue |
| `github_list_issue_comments` | List issue comments |
| `github_create_issue_comment` | Add comment to issue |

### Pull Request Tools (8)

| Tool | Description |
|------|-------------|
| `github_list_pull_requests` | List repository PRs |
| `github_get_pull_request` | Get PR by number |
| `github_create_pull_request` | Create new PR |
| `github_update_pull_request` | Update existing PR |
| `github_merge_pull_request` | Merge a PR |
| `github_list_pr_files` | List files changed in PR |
| `github_request_pr_reviewers` | Request PR reviewers |
| `github_list_pr_reviews` | List PR reviews |

### Actions Tools (8)

| Tool | Description |
|------|-------------|
| `github_list_workflows` | List repository workflows |
| `github_get_workflow` | Get workflow by ID |
| `github_list_workflow_runs` | List workflow runs |
| `github_get_workflow_run` | Get workflow run details |
| `github_trigger_workflow` | Trigger workflow dispatch |
| `github_cancel_workflow_run` | Cancel running workflow |
| `github_rerun_workflow` | Re-run workflow |
| `github_list_workflow_run_jobs` | List workflow run jobs |

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

## API Reference

### Health Check

```bash
GET /health

Response:
{
  "status": "healthy",
  "service": "github-unified-mcp",
  "timestamp": "2025-11-13T10:30:00Z",
  "uptime": 123.45
}
```

### OAuth Flow

1. **Get Authorization URL**
```bash
GET /oauth/authorize?tenant_id=YOUR_TENANT

Response:
{
  "authUrl": "https://github.com/login/oauth/authorize?...",
  "instructions": "Open this URL..."
}
```

2. **User authorizes in browser**
3. **GitHub redirects to /oauth/callback**
4. **Credentials stored in Vault**

### Tool Invocation

All tools require `tenantId` parameter for OAuth:

```json
{
  "owner": "octocat",
  "repo": "hello-world",
  "tenantId": "my-tenant"
}
```

## Architecture

```
┌─────────────────────────────────────┐
│   AI Agent (Claude, etc.)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Gateway (OAuth Proxy)             │
│   - Token management                │
│   - Rate limiting                   │
│   - Semantic routing                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   GitHub Unified MCP Server         │
│   - 29 tools organized by domain    │
│   - @octokit/rest official SDK      │
│   - Multi-tenant OAuth              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   HashiCorp Vault                   │
│   - Per-tenant credential storage   │
│   - Encrypted at rest               │
│   - Automatic refresh               │
└─────────────────────────────────────┘
```

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

## Comparison: Fragmented vs Unified

| Metric | Fragmented (44 servers) | Unified (1 server) |
|--------|-------------------------|-------------------|
| **Containers** | 44 | 1 |
| **Memory** | ~2.2 GB | ~200 MB |
| **Deployment** | Complex | Simple |
| **Maintenance** | High | Low |
| **SDK** | Auto-generated | Official @octokit/rest |
| **Architecture** | Inconsistent | Matches LinkedIn/Reddit |

## Migration from Fragmented

If you're migrating from the 44-server architecture:

1. **Update docker-compose.yml** - Already done ✅
2. **Update gateway integration** - Already done ✅
3. **Re-authenticate tenants** - OAuth tokens will work automatically
4. **Update tool names** - Use new unified tool names (e.g., `github_create_repository`)

## Contributing

Follow the unified pattern established by LinkedIn and Reddit integrations:

- **Directory structure**: `src/{auth,clients,tools,utils}`
- **Tool organization**: Group by domain (repos, issues, PRs, actions)
- **OAuth pattern**: Vault-based multi-tenant credentials
- **Error handling**: Consistent error types and mapping
- **Logging**: Structured logging with Winston

## License

MIT

## Support

- **Documentation**: `/docs/LIMITATIONS.md`
- **Issues**: GitHub Issues
- **Integration Guide**: See LinkedIn/Reddit unified servers for reference pattern

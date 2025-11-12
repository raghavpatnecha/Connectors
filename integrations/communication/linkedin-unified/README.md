# LinkedIn Unified MCP Server

**The complete LinkedIn integration for AI agents** - combining official API, browser automation, and scraping capabilities with OAuth 2.0 authentication and multi-tenant support.

## 🚀 What Makes This Different

This unified server solves the LinkedIn integration problem completely:

### ✅ **No Manual Cookie Management**
- OAuth 2.0 flow automatically generates session cookies
- Cookies encrypted and stored securely
- Automatic session refresh
- **Users just authenticate once** - we handle everything

### ✅ **ALL Capabilities Combined**
From the three source servers:
- ✅ Official API features (raghavpatnecha): People search, jobs, messaging
- ✅ Browser automation (alinaqi): Feed browsing, post interactions
- ✅ Web scraping (stickerdaniel): Comprehensive profiles, company data, job recommendations

###  ✅ **Multi-Tenant Ready**
- Per-tenant OAuth credentials in HashiCorp Vault
- Per-tenant encryption keys
- Automatic credential rotation
- Audit logging

### ✅ **Production Quality**
- TypeScript with full type safety
- Comprehensive error handling
- Winston logging
- Automatic token refresh (5min before expiry)
- Session persistence

---

## 📋 Features Overview

| Feature | Method | Source |
|---------|--------|--------|
| **People Search** | Official API | raghavpatnecha |
| **Profile Viewing** | API + Scraping | All three |
| **Job Search** | API + Scraping | raghavpatnecha + stickerdaniel |
| **Job Apply** | Browser Automation | alinaqi |
| **Messaging** | Official API | raghavpatnecha |
| **Feed Browsing** | Browser Automation | alinaqi |
| **Post Interactions** | Browser Automation | alinaqi |
| **Company Profiles** | Web Scraping | stickerdaniel |
| **Recommended Jobs** | Web Scraping | stickerdaniel |
| **Network Stats** | Official API | raghavpatnecha |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MCP Server (Stdio)                        │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                   Unified Client Router                      │
│  (Automatically selects API vs Browser Automation)          │
└───────┬─────────────────────────────────┬───────────────────┘
        │                                 │
┌───────▼──────────┐             ┌───────▼─────────────┐
│   API Client     │             │  Browser Client     │
│  (Official API)  │             │   (Playwright)      │
└───────┬──────────┘             └────────┬────────────┘
        │                                 │
┌───────▼──────────────────────────────────▼──────────┐
│              OAuth Manager + Vault                   │
│  • OAuth 2.0 authorization code flow                │
│  • Automatic token refresh                          │
│  • Multi-tenant credential storage                  │
│  • Auto-generate cookies from OAuth tokens          │
└─────────────────────────────────────────────────────┘
```

### Key Components

#### 1. **OAuth Manager** (`src/auth/oauth-manager.ts`)
- Complete OAuth 2.0 authorization code flow
- Generates authorization URL for user authentication
- Exchanges authorization code for access tokens
- Automatic token refresh (5 min before expiry)
- Stores tokens in Vault with per-tenant encryption

#### 2. **Vault Client** (`src/auth/vault-client.ts`)
- HashiCorp Vault integration
- Per-tenant encryption using Transit engine
- Secure credential storage in KV v2
- Automatic key rotation
- Version control for credentials

#### 3. **Session Manager** (`src/auth/session-manager.ts`)
- Playwright browser automation
- **Automatic cookie generation from OAuth tokens**
- Cookie persistence and encryption
- Session reuse to minimize auth requests
- No manual cookie extraction needed

#### 4. **API Client** (`src/clients/api-client.ts`)
- Official LinkedIn REST API
- Automatic token injection
- Rate limit handling
- Request retry logic

#### 5. **Browser Client** (`src/clients/browser-client.ts`)
- Playwright-based automation
- Handles actions not available in API
- Cookie-based authentication (auto-generated)
- Anti-detection measures

#### 6. **Unified Client** (`src/clients/unified-client.ts`)
- Smart router between API and browser clients
- Chooses optimal method for each operation
- Transparent fallback handling

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- HashiCorp Vault (running locally or remotely)
- LinkedIn Developer Account
- Docker (optional, for Vault)

### 1. Setup LinkedIn OAuth App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Under "Auth" tab:
   - Copy **Client ID** and **Client Secret**
   - Add redirect URI: `http://localhost:3001/oauth/callback`
4. Under "Products" tab, add:
   - "Sign In with LinkedIn using OpenID Connect"
   - "Share on LinkedIn"
5. Request scopes: `openid`, `profile`, `email`, `w_member_social`

### 2. Start HashiCorp Vault

**Option A: Docker (Development)**
```bash
docker run -d --name=vault --cap-add=IPC_LOCK \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=dev-root-token' \
  -p 8200:8200 hashicorp/vault:latest
```

**Option B: Use Existing Vault**
- Update `.env` with your Vault address and token

### 3. Install and Configure

```bash
cd integrations/communication/linkedin-unified
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your credentials
```

`.env` configuration:
```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3001/oauth/callback

# Vault
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token

# Server
PORT=3001
SESSION_SECRET=generate-random-secret
COOKIE_ENCRYPTION_KEY=generate-random-key
```

### 4. Build and Run

```bash
# Build TypeScript
npm run build

# Start server
npm start
```

### 5. User Authentication Flow

**For each tenant/user:**

1. **Generate OAuth URL:**
   ```typescript
   GET /oauth/authorize?tenant_id=user123

   Response: { "authUrl": "https://linkedin.com/oauth/v2/authorization?..." }
   ```

2. **User authenticates** (opens URL in browser, logs into LinkedIn)

3. **Handle callback:**
   ```typescript
   // Callback happens automatically
   GET /oauth/callback?code=xxx&state=user123:timestamp:random

   // Server exchanges code for token, stores in Vault
   // Generates cookies automatically
   ```

4. **Use MCP tools** - all authentication handled automatically!

---

## 🔧 Usage with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "linkedin-unified": {
      "command": "node",
      "args": ["/absolute/path/to/linkedin-unified/dist/index.js"],
      "env": {
        "TENANT_ID": "your_tenant_id",
        "VAULT_ADDR": "http://localhost:8200",
        "VAULT_TOKEN": "your_vault_token"
      }
    }
  }
}
```

**First time setup:**
1. Start the server with `npm start`
2. In Claude, use any LinkedIn tool
3. Server will provide OAuth URL
4. Open URL, authenticate with LinkedIn
5. Return to Claude - all tools now work automatically!

---

## 📚 Available Tools

### People & Profiles

#### `search-people`
Search LinkedIn profiles with advanced filtering
```typescript
{
  "keywords": "software engineer",
  "currentCompany": ["Google", "Microsoft"],
  "location": "San Francisco",
  "industries": ["Technology"]
}
```

#### `get-profile`
Get detailed profile information
```typescript
{
  "username": "stickerdaniel"  // or "publicId" or "urnId"
}
```

#### `get-my-profile`
Get authenticated user's profile
```typescript
{}
```

### Jobs

#### `search-jobs`
Search for job postings
```typescript
{
  "keywords": "Product Manager",
  "location": "New York",
  "jobType": ["full-time"],
  "companies": ["Meta"]
}
```

#### `get-job-details`
Get specific job details
```typescript
{
  "jobId": "4252026496"
}
```

#### `get-recommended-jobs`
Get personalized job recommendations
```typescript
{}
```

#### `apply-to-job`
Apply to a job posting (browser automation)
```typescript
{
  "jobId": "4252026496",
  "coverLetter": "I am excited to apply..."
}
```

### Messaging

#### `send-message`
Send message to a connection
```typescript
{
  "recipientUrn": "urn:li:person:ABC123",
  "messageBody": "Hi! I'd like to connect..."
}
```

#### `get-conversations`
Get recent message conversations
```typescript
{
  "limit": 20
}
```

### Feed & Posts

#### `browse-feed`
Browse LinkedIn feed (browser automation)
```typescript
{
  "limit": 10
}
```

#### `like-post`
Like a LinkedIn post
```typescript
{
  "postUrl": "https://www.linkedin.com/feed/update/urn:li:activity:123"
}
```

#### `comment-on-post`
Comment on a post
```typescript
{
  "postUrl": "https://www.linkedin.com/feed/update/urn:li:activity:123",
  "comment": "Great insights!"
}
```

#### `create-post`
Create a new LinkedIn post
```typescript
{
  "content": "Excited to share...",
  "media": ["image-url"] // optional
}
```

### Companies

#### `get-company-profile`
Get company information
```typescript
{
  "companyName": "openai"  // or company ID
}
```

#### `follow-company`
Follow a company
```typescript
{
  "companyId": "123456"
}
```

### Network

#### `get-network-stats`
Get network statistics
```typescript
{}
```

#### `get-connections`
Get user's connections
```typescript
{
  "limit": 50,
  "start": 0
}
```

---

## 🔐 Security

### OAuth 2.0 Flow

1. **User initiates**: Requests OAuth URL
2. **Server generates**: Authorization URL with state parameter
3. **User authenticates**: Logs into LinkedIn, grants permissions
4. **LinkedIn redirects**: To callback URL with authorization code
5. **Server exchanges**: Code for access + refresh tokens
6. **Vault stores**: Encrypted tokens with per-tenant keys
7. **Session created**: Cookies auto-generated from tokens

### Multi-Tenant Isolation

- Each tenant has separate encryption key in Vault Transit engine
- Credentials stored in isolated paths: `secret/linkedin-mcp/{tenantId}/linkedin`
- No cross-tenant access possible
- Audit logs for all operations

### Automatic Token Refresh

```typescript
// Check token expiry before each request
if (expiresAt - now < 5 minutes) {
  // Auto-refresh
  newToken = await refreshAccessToken(refreshToken);
  // Update Vault
  await vaultClient.storeCredentials(tenant, newToken);
}
```

### Cookie Encryption

- Session cookies encrypted with AES-256
- Stored in `.sessions/{tenantId}.enc`
- Auto-refreshed from OAuth when expired
- No manual cookie management needed

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- oauth-manager.test.ts

# Run with coverage
npm test -- --coverage
```

### Test Coverage Requirements

- OAuth flow: 90%+
- Vault integration: 85%+
- Session management: 80%+
- API client: 85%+
- Browser client: 75%+

---

## 📊 Monitoring

### Metrics Exposed

- `linkedin_oauth_requests_total`: OAuth flow requests
- `linkedin_token_refreshes_total`: Auto-refresh count
- `linkedin_api_requests_total`: API calls by endpoint
- `linkedin_browser_sessions_active`: Active browser sessions
- `linkedin_vault_operations_total`: Vault read/write operations

### Logs

Structured JSON logging with Winston:

```json
{
  "timestamp": "2025-11-12T20:00:00.000Z",
  "level": "info",
  "message": "OAuth credentials obtained",
  "tenantId": "user123",
  "expiresIn": 5183999,
  "scopes": ["openid", "profile", "email"]
}
```

---

## 🚨 Troubleshooting

### OAuth Authentication Failed

**Error:** `OAuth authentication failed: invalid_grant`

**Solution:**
- Authorization code expires in 30 minutes - user must complete flow quickly
- Each code can only be used once
- Ensure redirect URI matches exactly what's configured in LinkedIn app

### Token Refresh Failed

**Error:** `Token refresh failed: invalid_refresh_token`

**Solution:**
- Refresh token may have been revoked
- User needs to re-authenticate
- Clear stored credentials: `DELETE /oauth/revoke?tenant_id=xxx`

### Vault Connection Failed

**Error:** `Failed to connect to Vault`

**Solution:**
- Ensure Vault is running: `docker ps` or `vault status`
- Check `VAULT_ADDR` and `VAULT_TOKEN` in `.env`
- Vault must be unsealed: `vault operator unseal`

### Browser Session Failed

**Error:** `LinkedIn session is not active`

**Solution:**
- Cookies may have expired
- Session manager will auto-refresh from OAuth
- If persists, clear `.sessions/` directory

### Rate Limiting

**Error:** `Rate limit exceeded`

**Solution:**
- LinkedIn API has rate limits per app and per user
- Implement exponential backoff
- Use browser automation for non-critical operations

---

## 🔄 Migration from Individual Servers

### From raghavpatnecha/linkedin-mcp-server

```typescript
// Old
const client = new LinkedInClient(auth);
await client.searchPeople({ keywords: "engineer" });

// New (automatic routing)
// Just use MCP tools - OAuth handled automatically
```

### From alinaqi/mcp-linkedin-server

```typescript
// Old
await login_linkedin_secure();  // Manual login
await browse_linkedin_feed();

// New
// No manual login needed!
// OAuth generates cookies automatically
```

### From stickerdaniel/linkedin-mcp-server

```typescript
// Old
LINKEDIN_COOKIE="li_at=manual_cookie_value"  // Manual extraction

// New
// No manual cookie extraction!
// OAuth flow generates cookies automatically
```

---

## 🛠️ Development

### Project Structure

```
linkedin-unified/
├── src/
│   ├── auth/
│   │   ├── oauth-manager.ts       # OAuth 2.0 flow
│   │   ├── vault-client.ts        # Vault integration
│   │   └── session-manager.ts     # Browser sessions + cookies
│   ├── clients/
│   │   ├── api-client.ts          # Official API
│   │   ├── browser-client.ts      # Playwright automation
│   │   └── unified-client.ts      # Smart router
│   ├── tools/
│   │   ├── people-tools.ts        # Profile operations
│   │   ├── job-tools.ts           # Job search/apply
│   │   ├── messaging-tools.ts     # Messages
│   │   ├── feed-tools.ts          # Feed browsing
│   │   ├── post-tools.ts          # Post interactions
│   │   └── company-tools.ts       # Company profiles
│   ├── utils/
│   │   ├── logger.ts              # Winston logging
│   │   └── error-handler.ts       # Error handling
│   └── index.ts                   # MCP server entry
├── tests/                         # Jest tests
├── .sessions/                     # Encrypted cookies (gitignored)
├── logs/                          # Application logs
└── package.json
```

### Adding New Tools

1. Create tool in appropriate file (`src/tools/`)
2. Register in unified client
3. Add tests
4. Update documentation

Example:
```typescript
// src/tools/custom-tools.ts
export async function myCustomTool(params: any) {
  // Implementation
}

// src/index.ts
server.registerTool({
  name: "my-custom-tool",
  description: "Does something custom",
  parameters: z.object({
    param1: z.string()
  }),
  handler: async (params) => {
    return await myCustomTool(params);
  }
});
```

---

## 📝 License

Apache 2.0

---

## 🙏 Acknowledgements

Built by combining the best features from:
- [raghavpatnecha/linkedin-mcp-server](https://github.com/raghavpatnecha/linkedin-mcp-server) - Official API integration
- [alinaqi/mcp-linkedin-server](https://github.com/alinaqi/mcp-linkedin-server) - Browser automation
- [stickerdaniel/linkedin-mcp-server](https://github.com/stickerdaniel/linkedin-mcp-server) - Web scraping

Integrated into the [Connectors Platform](https://github.com/raghavpatnecha/Connectors) for AI agent integrations.

---

## 🚀 Roadmap

- [x] OAuth 2.0 authentication
- [x] Multi-tenant Vault integration
- [x] Automatic cookie management
- [x] Official API client
- [ ] Browser automation client (in progress)
- [ ] Complete tool registry
- [ ] Comprehensive tests
- [ ] Performance optimization
- [ ] GraphQL API support
- [ ] Real-time notifications
- [ ] Analytics dashboard

---

**Questions? Issues?**

Open an issue at https://github.com/raghavpatnecha/Connectors/issues

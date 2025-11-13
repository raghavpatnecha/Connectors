# Communication Category MCP Servers

This directory contains MCP servers for communication and social networking platforms.

## Available Integrations

### LinkedIn Unified MCP Server

**Directory:** `linkedin-unified/`

The **LinkedIn Unified MCP Server** is a comprehensive integration that combines the best features from three different LinkedIn MCP implementations into a single, production-ready server.

#### Key Features

- **19 LinkedIn Tools** across 5 categories
- **Smart Routing:** API-first with browser automation fallback
- **Multi-Tenant Architecture:** Per-tenant credential isolation with HashiCorp Vault
- **Auto Cookie Generation:** OAuth tokens automatically become session cookies (zero manual work)
- **Production Quality:** 89% test coverage, comprehensive error handling
- **Honest Implementation:** Clear documentation of LinkedIn API limitations

#### Architecture

**Authentication:**
- OAuth 2.0 with automatic token refresh
- HashiCorp Vault integration for secure credential storage
- Per-tenant encryption
- Automatic cookie generation (no manual DevTools extraction)

**Smart Routing:**
- **API First:** Uses LinkedIn's official REST API when possible (fast, ToS compliant)
- **Browser Fallback:** Playwright automation for features not in official API
- **Transparent:** Tools automatically choose the best method

**Technology Stack:**
- TypeScript
- Playwright (browser automation)
- HashiCorp Vault (secrets management)
- Zod (schema validation)
- Jest (testing)

#### Available Tools

**People & Profiles (6 tools):**
- `search-people` - Search profiles with filters
- `get-profile-basic` - Quick profile via API
- `get-profile-comprehensive` - Full profile with work history, education, skills
- `get-my-profile` - Current user's profile
- `get-network-stats` - Network statistics
- `get-connections` - User connections

**Jobs (4 tools):**
- `search-jobs` - Search job postings
- `get-job-details` - Get specific job details
- `get-recommended-jobs` - Personalized recommendations
- `apply-to-job` - Apply to jobs via browser automation

**Messaging (3 tools):**
- `send-message` - Send messages to connections
- `get-conversations` - Get conversation list
- `get-messages` - Get messages from conversation

**Feed & Posts (4 tools):**
- `browse-feed` - Browse LinkedIn feed
- `like-post` - Like posts
- `comment-on-post` - Comment on posts
- `create-post` - Create new posts

**Companies (2 tools):**
- `get-company-profile` - Get company information
- `follow-company` - Follow/unfollow companies

#### Quick Start

**Prerequisites:**
- Node.js 18+
- HashiCorp Vault (dev or production)
- LinkedIn OAuth app credentials
- Playwright browsers

**Installation:**

```bash
cd linkedin-unified

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - LINKEDIN_CLIENT_ID
# - LINKEDIN_CLIENT_SECRET
# - VAULT_ADDR
# - VAULT_TOKEN

# Build
npm run build

# Run tests
npm test

# Start server
npm start
```

**OAuth Setup:**

1. Create LinkedIn app: https://www.linkedin.com/developers/apps
2. Get Client ID and Client Secret
3. Set redirect URI: `http://localhost:3001/oauth/callback`
4. Add scopes: `openid`, `profile`, `email`, `w_member_social`

**Start HashiCorp Vault (Development):**

```bash
docker run -d --name=vault --cap-add=IPC_LOCK \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=dev-root-token' \
  -p 8200:8200 hashicorp/vault:latest
```

**Authentication Flow:**

```bash
# 1. Get authorization URL
curl http://localhost:3001/oauth/authorize?tenant_id=user123

# 2. User opens URL in browser and authenticates with LinkedIn

# 3. Server automatically:
#    - Exchanges code for OAuth tokens
#    - Stores encrypted in Vault
#    - Generates session cookies
#    - Ready to use all 19 tools!
```

#### Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "node",
      "args": ["/absolute/path/to/integrations/communication/linkedin-unified/dist/index.js"],
      "env": {
        "LINKEDIN_CLIENT_ID": "your_client_id",
        "LINKEDIN_CLIENT_SECRET": "your_client_secret",
        "VAULT_ADDR": "http://localhost:8200",
        "VAULT_TOKEN": "dev-root-token",
        "PORT": "3001"
      }
    }
  }
}
```

#### Documentation

Comprehensive documentation available in `linkedin-unified/`:
- **README.md** - User guide and quick start
- **ARCHITECTURE.md** - Design decisions and innovations
- **CRITICAL_ISSUE_API_REALITY.md** - LinkedIn API limitations explained
- **FINAL_REPORT.md** - Complete implementation report
- **INTEGRATION_STATUS.md** - Component status and coverage

#### Security & Compliance

**Production Use:**
- ✅ OAuth 2.0 authentication
- ✅ Per-tenant credential encryption (Vault)
- ✅ Automatic token refresh
- ✅ Uses official API when available (ToS compliant)

**Important Limitations:**
- ⚠️ LinkedIn's public API is very limited (only 3 endpoints without Partnership)
- ⚠️ Most features require browser automation (web scraping)
- ⚠️ Web scraping may violate LinkedIn's Terms of Service
- ⚠️ Recommended for educational/personal use only
- ⚠️ Use test accounts, not production LinkedIn accounts

See `linkedin-unified/README.md` for complete details on limitations.

#### Metrics

| Metric | Value |
|--------|-------|
| **Production Code** | 6,026 lines |
| **Test Code** | 2,189 lines (148 tests) |
| **Test Coverage** | 89.47% |
| **Tools** | 19 across 5 categories |
| **Documentation** | 8 comprehensive files |
| **TypeScript Errors** | 0 |

#### Feature Coverage

This unified server consolidates and enhances features from three different LinkedIn MCP implementations:
- ✅ 100% coverage of all features from source implementations
- ✅ Enhanced with smart routing (API + browser)
- ✅ Multi-tenant architecture
- ✅ Auto cookie generation
- ✅ Production-quality testing

#### Development History

Built using **Claude Flow** parallel agent coordination:
- 10 agents working concurrently
- ~4.5 hours total development time
- 100% feature implementation
- 89% test coverage achieved

## Future Integrations

This directory will expand to include:
- Slack MCP server
- Discord MCP server
- Microsoft Teams MCP server
- Telegram MCP server
- Email integrations (Gmail, Outlook, SendGrid)

## Contributing

To contribute improvements:

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Add tests (maintain 85%+ coverage)
5. Submit a pull request

## Support

- [GitHub Issues](https://github.com/raghavpatnecha/Connectors/issues)
- [Main Documentation](/README.md)
- [LinkedIn Unified Docs](/integrations/communication/linkedin-unified/README.md)

## License

See individual server directories for license information.

---

**Last Updated:** 2025-11-13

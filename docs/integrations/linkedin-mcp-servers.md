# LinkedIn MCP Server Integrations

## Overview

This document describes the three LinkedIn MCP servers integrated into the Connectors platform. Each server offers different capabilities and approaches to LinkedIn integration.

---

## Available LinkedIn MCP Servers

### 1. LinkedIn API Server (raghavpatnecha)

**Location:** `/integrations/communication/linkedin-api`
**Repository:** https://github.com/raghavpatnecha/linkedin-mcp-server
**Type:** Official API Integration
**Language:** TypeScript

#### Features
- ✅ **People Search** - Advanced filtering by keywords, company, industry, and location
- ✅ **Profile Retrieval** - Detailed information access using public or URN identifiers
- ✅ **Job Market Intelligence** - Employment trend analysis
- ✅ **Messaging** - Direct communication capabilities
- ✅ **OAuth 2.0 Authentication** - Secure token management with auto-refresh

#### Technology Stack
- TypeScript
- Model Context Protocol SDK (@modelcontextprotocol/sdk)
- LinkedIn Official API
- OAuth 2.0
- Axios HTTP client
- Zod validation

#### Installation

```bash
cd integrations/communication/linkedin-api
npm install
npm run build
```

#### Configuration

Create `.env` file:
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

#### Usage with Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "linkedin-api": {
      "command": "node",
      "args": ["/absolute/path/to/integrations/communication/linkedin-api/dist/index.js"]
    }
  }
}
```

#### Pros
- ✅ Uses official LinkedIn API (most reliable)
- ✅ OAuth 2.0 authentication (enterprise-grade security)
- ✅ TypeScript (type-safe, matches project stack)
- ✅ Well-documented API operations
- ✅ Aligns with Connectors platform architecture

#### Cons
- ⚠️ Requires LinkedIn Developer credentials
- ⚠️ API rate limits apply
- ⚠️ Limited to official API capabilities

#### Best For
- Production environments
- Enterprise integrations
- Compliance-sensitive use cases
- Long-term reliability

---

### 2. LinkedIn Automation Server (alinaqi)

**Location:** `/integrations/communication/linkedin-automation`
**Repository:** https://github.com/alinaqi/mcp-linkedin-server
**Type:** Browser Automation
**Language:** Python

#### Features
- ✅ **Authentication** - Secure login using environment credentials
- ✅ **Profile Operations** - Viewing profiles, searching by keywords
- ✅ **Feed Browsing** - Access LinkedIn feed content
- ✅ **Post Interactions** - Liking, commenting, reading engagement metrics
- ✅ **Session Management** - Encrypted cookie storage and automatic recovery
- ✅ **Rate Limiting** - Protection against excessive requests (max 5 login attempts/hour)

#### Technology Stack
- Python 3.8+
- FastMCP framework
- Playwright browser automation
- Encrypted session storage

#### Installation

```bash
cd integrations/communication/linkedin-automation
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
```

#### Configuration

Create `.env` file:
```env
LINKEDIN_USERNAME=your_email@example.com
LINKEDIN_PASSWORD=your_password
COOKIE_ENCRYPTION_KEY=auto-generated-if-omitted
```

#### Usage with Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "linkedin-automation": {
      "command": "python",
      "args": ["/absolute/path/to/integrations/communication/linkedin-automation/server.py"]
    }
  }
}
```

#### Pros
- ✅ No API credentials required
- ✅ Access to features not in official API
- ✅ Can interact with LinkedIn UI directly
- ✅ Session persistence

#### Cons
- ⚠️ Browser automation (slower than API)
- ⚠️ May violate LinkedIn Terms of Service
- ⚠️ Educational purposes only
- ⚠️ Python-based (different from project stack)
- ⚠️ More fragile (UI changes break functionality)

#### Best For
- Development/testing environments
- Personal automation
- Features not available in official API
- Educational purposes

---

### 3. LinkedIn Scraper Server (stickerdaniel)

**Location:** `/integrations/communication/linkedin-stickerdaniel`
**Repository:** https://github.com/stickerdaniel/linkedin-mcp-server
**Type:** Docker-based Scraping
**Language:** Python

#### Features
- ✅ **Profile Scraping** - Extract work history, education, skills, and connections
- ✅ **Company Analysis** - Retrieve comprehensive company information
- ✅ **Job Details** - Access specific job posting information
- ✅ **Job Search** - Query positions with filters (keywords, location)
- ✅ **Recommended Jobs** - Get personalized job recommendations
- ✅ **Session Management** - Properly close browser sessions and clean resources

#### Technology Stack
- Python
- Docker (recommended deployment)
- Chrome/ChromeDriver
- Session cookie authentication
- Multiple transport modes (stdio, HTTP)

#### Installation

**Docker (Recommended):**
```bash
cd integrations/communication/linkedin-stickerdaniel
docker build -t linkedin-mcp-server .
docker run -e LINKEDIN_COOKIE="your_li_at_cookie" linkedin-mcp-server
```

**uvx Quick Install:**
```bash
uvx --from git+https://github.com/stickerdaniel/linkedin-mcp-server linkedin-mcp-server
```

**Local Development:**
```bash
cd integrations/communication/linkedin-stickerdaniel
pip install -e .
linkedin-mcp-server --get-cookie  # Extract cookie from browser
```

#### Configuration

Set environment variable:
```env
LINKEDIN_COOKIE=your_li_at_cookie_value
```

To get your `li_at` cookie:
1. Log into LinkedIn in browser
2. Open DevTools (F12)
3. Go to Application/Storage → Cookies
4. Copy the value of `li_at` cookie

#### Usage with Claude Desktop

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "linkedin-scraper": {
      "command": "docker",
      "args": ["run", "-e", "LINKEDIN_COOKIE=your_cookie", "linkedin-mcp-server"]
    }
  }
}
```

#### Pros
- ✅ Docker-based (portable, isolated)
- ✅ Simple cookie authentication
- ✅ Comprehensive job search features
- ✅ Multiple deployment options
- ✅ Session management

#### Cons
- ⚠️ Scraping approach (may violate LinkedIn ToS)
- ⚠️ Requires manual cookie extraction
- ⚠️ Cookie expires periodically
- ⚠️ Anti-scraping detection risk

#### Best For
- Job search automation
- Company research
- Profile data extraction
- Docker-based deployments

---

## Comparison Matrix

| Feature | API (raghavpatnecha) | Automation (alinaqi) | Scraper (stickerdaniel) |
|---------|---------------------|----------------------|-------------------------|
| **Authentication** | OAuth 2.0 | Username/Password | Session Cookie |
| **Language** | TypeScript | Python | Python |
| **API Type** | Official API | Browser Automation | Web Scraping |
| **LinkedIn ToS** | ✅ Compliant | ⚠️ Educational Only | ⚠️ May Violate |
| **Rate Limiting** | API Limits | Built-in (5/hr) | Anti-scraping Detection |
| **Deployment** | Node.js | Python/Playwright | Docker Preferred |
| **Reliability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Setup Complexity** | Medium | Medium | Low |
| **People Search** | ✅ | ✅ | ❌ |
| **Profile Viewing** | ✅ | ✅ | ✅ |
| **Job Search** | ✅ | ❌ | ✅ |
| **Messaging** | ✅ | ❌ | ❌ |
| **Post Interactions** | ❌ | ✅ | ❌ |
| **Company Info** | ✅ | ❌ | ✅ |

---

## Recommended Usage

### For Production Environments
**Use:** `linkedin-api` (raghavpatnecha)
- Official API
- OAuth 2.0 security
- Enterprise-grade reliability
- Compliant with LinkedIn ToS

### For Development/Testing
**Use:** `linkedin-automation` (alinaqi) or `linkedin-scraper` (stickerdaniel)
- Quick setup
- No API credentials needed
- Access to additional features
- Educational purposes only

### For Job Search Automation
**Use:** `linkedin-scraper` (stickerdaniel)
- Comprehensive job search features
- Docker-based deployment
- Simple cookie authentication

---

## Integration with Connectors Gateway

All three LinkedIn MCP servers can be integrated with the Connectors gateway for:

1. **Semantic Tool Selection** - Gateway automatically selects appropriate LinkedIn tools based on query
2. **OAuth Management** - Gateway handles OAuth token refresh for `linkedin-api`
3. **Rate Limiting** - Gateway enforces consistent rate limits across all servers
4. **Monitoring** - Gateway logs usage metrics and performance data

### Gateway Configuration

Add to `gateway/config/integrations.json`:

```json
{
  "linkedin": {
    "category": "communication",
    "servers": [
      {
        "id": "linkedin-api",
        "type": "official-api",
        "path": "integrations/communication/linkedin-api",
        "oauth": true,
        "priority": 1
      },
      {
        "id": "linkedin-automation",
        "type": "browser-automation",
        "path": "integrations/communication/linkedin-automation",
        "oauth": false,
        "priority": 2
      },
      {
        "id": "linkedin-scraper",
        "type": "web-scraping",
        "path": "integrations/communication/linkedin-stickerdaniel",
        "oauth": false,
        "priority": 3
      }
    ]
  }
}
```

---

## Security Considerations

### API Server (raghavpatnecha)
- ✅ Store OAuth credentials in HashiCorp Vault
- ✅ Use per-tenant encryption keys
- ✅ Enable automatic token refresh
- ✅ Audit log all credential access

### Automation Server (alinaqi)
- ⚠️ Encrypt `.env` file containing credentials
- ⚠️ Use strong `COOKIE_ENCRYPTION_KEY`
- ⚠️ Limit to development environments
- ⚠️ Never commit credentials to git

### Scraper Server (stickerdaniel)
- ⚠️ Rotate session cookies regularly
- ⚠️ Use environment variables, not hardcoded cookies
- ⚠️ Monitor for anti-scraping detection
- ⚠️ Implement backoff strategies

---

## Legal & Compliance

### Terms of Service
- **Official API**: ✅ Compliant with LinkedIn Developer Agreement
- **Browser Automation**: ⚠️ May violate LinkedIn User Agreement Section 8.2
- **Web Scraping**: ⚠️ May violate LinkedIn User Agreement Section 8.2

### Recommended Approach
1. **Production**: Use official API only (`linkedin-api`)
2. **Development**: Clearly mark as educational/testing
3. **Commercial**: Obtain proper LinkedIn licenses
4. **Data Usage**: Respect user privacy and GDPR requirements

---

## Troubleshooting

### linkedin-api
**Issue:** OAuth token expired
**Solution:** Gateway auto-refreshes tokens. Check Vault connectivity.

**Issue:** API rate limit exceeded
**Solution:** Implement exponential backoff, use caching

### linkedin-automation
**Issue:** Login fails
**Solution:** Check credentials, verify rate limit (5 attempts/hour)

**Issue:** Playwright browser not found
**Solution:** Run `playwright install chromium`

### linkedin-scraper
**Issue:** Cookie expired
**Solution:** Re-extract `li_at` cookie from browser

**Issue:** Anti-scraping detection
**Solution:** Reduce request frequency, rotate user agents

---

## Contributing

To add or improve LinkedIn integrations:

1. Fork the respective repository
2. Make improvements
3. Submit PR to upstream repository
4. Update submodule reference in Connectors:
   ```bash
   cd integrations/communication/linkedin-{server}
   git pull origin main
   cd ../../..
   git add integrations/communication/linkedin-{server}
   git commit -m "chore: update LinkedIn {server} submodule"
   ```

---

## Support & Resources

### Documentation
- [LinkedIn API Docs](https://docs.microsoft.com/en-us/linkedin/)
- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [Connectors Platform Guide](../../README.md)

### Community
- GitHub Issues for each server
- Connectors Platform Discussions

### Related Integrations
- Slack MCP Server
- Discord MCP Server
- Teams MCP Server

---

**Last Updated:** 2025-11-12
**Maintainer:** Connectors Platform Team

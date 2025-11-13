# Communication Category MCP Servers

This directory contains MCP servers for communication and social networking platforms.

## Available Integrations

### LinkedIn MCP Servers (3 implementations)

We provide three different LinkedIn MCP server implementations, each with different capabilities and use cases:

#### 1. LinkedIn API Server (Official API)
- **Directory:** `linkedin-api/`
- **Repository:** https://github.com/raghavpatnecha/linkedin-mcp-server
- **Type:** Official LinkedIn API integration
- **Language:** TypeScript
- **Authentication:** OAuth 2.0
- **Best For:** Production environments, enterprise use
- **Features:**
  - People search with advanced filtering
  - Profile retrieval
  - Job market intelligence
  - Direct messaging
  - Secure OAuth 2.0 authentication

#### 2. LinkedIn Automation Server (Browser Automation)
- **Directory:** `linkedin-automation/`
- **Repository:** https://github.com/alinaqi/mcp-linkedin-server
- **Type:** Browser automation using Playwright
- **Language:** Python
- **Authentication:** Username/Password
- **Best For:** Development/testing, features not in official API
- **Features:**
  - Profile viewing and searching
  - Feed browsing
  - Post interactions (like, comment)
  - Session management with encrypted storage
  - Rate limiting protection

#### 3. LinkedIn Scraper Server (Docker-based)
- **Directory:** `linkedin-stickerdaniel/`
- **Repository:** https://github.com/stickerdaniel/linkedin-mcp-server
- **Type:** Web scraping with Docker support
- **Language:** Python
- **Authentication:** Session cookie
- **Best For:** Job search automation, company research
- **Features:**
  - Profile scraping (work history, education, skills)
  - Company analysis
  - Job search with filters
  - Personalized job recommendations
  - Docker deployment

## Quick Start

### Prerequisites

For TypeScript servers (linkedin-api):
- Node.js 16+
- npm or yarn

For Python servers (linkedin-automation, linkedin-stickerdaniel):
- Python 3.8+
- pip
- Docker (recommended for linkedin-stickerdaniel)

### Installation

```bash
# Clone submodules if not already done
git submodule update --init --recursive

# For linkedin-api (TypeScript)
cd linkedin-api
npm install
npm run build

# For linkedin-automation (Python)
cd linkedin-automation
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium

# For linkedin-stickerdaniel (Docker)
cd linkedin-stickerdaniel
docker build -t linkedin-mcp-server .
```

## Configuration

Each server requires different authentication methods:

### linkedin-api (OAuth 2.0)
Create `.env` file:
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
```

Get credentials from: https://www.linkedin.com/developers/apps

### linkedin-automation (Username/Password)
Create `.env` file:
```env
LINKEDIN_USERNAME=your_email@example.com
LINKEDIN_PASSWORD=your_password
COOKIE_ENCRYPTION_KEY=auto-generated-if-omitted
```

### linkedin-stickerdaniel (Session Cookie)
Extract `li_at` cookie from browser and set:
```env
LINKEDIN_COOKIE=your_li_at_cookie_value
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "linkedin-api": {
      "command": "node",
      "args": ["/absolute/path/to/integrations/communication/linkedin-api/dist/index.js"],
      "env": {
        "LINKEDIN_CLIENT_ID": "your_client_id",
        "LINKEDIN_CLIENT_SECRET": "your_client_secret"
      }
    },
    "linkedin-automation": {
      "command": "python",
      "args": ["/absolute/path/to/integrations/communication/linkedin-automation/server.py"],
      "env": {
        "LINKEDIN_USERNAME": "your_email@example.com",
        "LINKEDIN_PASSWORD": "your_password"
      }
    },
    "linkedin-scraper": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "LINKEDIN_COOKIE=your_cookie", "linkedin-mcp-server"]
    }
  }
}
```

## Comparison

| Feature | linkedin-api | linkedin-automation | linkedin-stickerdaniel |
|---------|-------------|--------------------|-----------------------|
| **Language** | TypeScript | Python | Python |
| **Auth Method** | OAuth 2.0 | Username/Password | Session Cookie |
| **LinkedIn ToS** | ✅ Compliant | ⚠️ Educational | ⚠️ May Violate |
| **Production Ready** | ✅ Yes | ⚠️ Dev Only | ⚠️ Dev Only |
| **Setup Difficulty** | Medium | Medium | Easy |
| **People Search** | ✅ | ✅ | ❌ |
| **Job Search** | ✅ | ❌ | ✅ |
| **Messaging** | ✅ | ❌ | ❌ |
| **Post Interactions** | ❌ | ✅ | ❌ |

## Documentation

For detailed documentation, see:
- [LinkedIn MCP Servers Guide](/docs/integrations/linkedin-mcp-servers.md)
- [Connectors Platform Documentation](/README.md)

## Security & Compliance

### Production Use
- ✅ **Use:** `linkedin-api` (official API, OAuth 2.0)
- ✅ Store credentials in HashiCorp Vault
- ✅ Enable automatic token refresh
- ✅ Compliant with LinkedIn Developer Agreement

### Development/Testing
- ⚠️ **Use:** `linkedin-automation` or `linkedin-stickerdaniel`
- ⚠️ Clearly mark as educational/testing
- ⚠️ May violate LinkedIn User Agreement
- ⚠️ Never use in production

## Troubleshooting

### Common Issues

**OAuth token expired (linkedin-api)**
- Check Vault connectivity
- Verify token refresh is enabled

**Playwright not found (linkedin-automation)**
- Run: `playwright install chromium`

**Cookie expired (linkedin-stickerdaniel)**
- Re-extract `li_at` cookie from browser

**Rate limiting**
- Implement exponential backoff
- Use caching where appropriate

## Contributing

To contribute improvements:

1. Fork the respective upstream repository
2. Make your changes
3. Submit PR to upstream
4. Update submodule reference here

## Support

- [GitHub Issues](https://github.com/raghavpatnecha/Connectors/issues)
- [Detailed Documentation](/docs/integrations/linkedin-mcp-servers.md)

## License

Each server has its own license:
- linkedin-api: Check upstream repository
- linkedin-automation: MIT License
- linkedin-stickerdaniel: Check upstream repository

---

**Last Updated:** 2025-11-12

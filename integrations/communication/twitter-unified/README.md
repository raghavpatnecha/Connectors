# Twitter Unified MCP Server

**Comprehensive Twitter/X integration combining 45+ tools from 4 community implementations with OAuth 1.0a, session cookies, and SocialData analytics.**

[![Tools: 45](https://img.shields.io/badge/Tools-45-brightgreen.svg)](#-available-tools)
[![Auth: OAuth 1.0a](https://img.shields.io/badge/Auth-OAuth%201.0a-blue.svg)](#-authentication)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 🚀 Features

- **45 Comprehensive Tools** - Combined from 4 implementations ([adhikasp/mcp-twikit](https://github.com/adhikasp/mcp-twikit), [EnesCinr/twitter-mcp](https://github.com/EnesCinr/twitter-mcp), [ryanmac/agent-twitter-client-mcp](https://github.com/ryanmac/agent-twitter-client-mcp), [crazyrabbitLTC/mcp-twitter-server](https://github.com/crazyrabbitLTC/mcp-twitter-server))
- **OAuth 1.0a Authentication** - Official Twitter API with Vault encryption
- **Session Cookie Fallback** - Alternative auth when OAuth unavailable
- **SocialData API Integration** - Enhanced analytics and historical data
- **Multi-Tenant Isolation** - Per-tenant credential encryption
- **Rate Limiting** - Respects Twitter API limits (Free/Basic/Pro tiers)
- **Type-Safe** - Full TypeScript implementation
- **MCP Protocol Compliant** - Works with Claude Desktop and all MCP clients

---

## 📦 Installation

### Prerequisites

- Node.js 18+
- HashiCorp Vault (for credential storage)
- Twitter Developer Account ([Sign up](https://developer.twitter.com/))
- Optional: SocialData API key ([Get key](https://socialdata.tools))

### Setup

```bash
# Clone repository
cd /home/user/Connectors/integrations/communication/twitter-unified

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Build
npm run build

# Start server
npm start
```

---

## 🔑 Authentication

### Method 1: OAuth 1.0a (Recommended)

1. **Create Twitter App** at [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. **Get Credentials:**
   - Consumer Key (API Key)
   - Consumer Secret (API Secret)
   - Access Token
   - Access Token Secret

3. **Configure `.env`:**
```env
X_API_KEY=your_consumer_api_key
X_API_SECRET=your_consumer_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
```

4. **Store in Vault** (via HTTP endpoint):
```bash
curl -X POST http://localhost:3150/oauth/store \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "accessToken": "your_access_token",
    "accessTokenSecret": "your_access_token_secret",
    "socialDataApiKey": "optional_social_data_key"
  }'
```

### Method 2: Session Cookies (Fallback)

Extract cookies from browser (auth_token, ct0, twid):

```bash
curl -X POST http://localhost:3150/session/store \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "authToken": "your_auth_token",
    "ct0": "your_ct0_token",
    "twid": "your_twid_cookie"
  }'
```

**⚠️ Warning:** Session cookies may violate Twitter ToS. Use for personal/educational purposes only.

### Method 3: SocialData API (Enhanced Analytics)

Add to `.env`:
```env
SOCIALDATA_API_KEY=your_socialdata_api_key
```

Enables advanced analytics tools (sentiment analysis, historical search, influence mapping, etc.)

---

## 🛠️ Available Tools

### Tweet Operations (10 tools)

| Tool | Description |
|------|-------------|
| `post_tweet` | Post new tweet with text/media |
| `get_tweet_by_id` | Retrieve specific tweet with metrics |
| `reply_to_tweet` | Reply to existing tweet |
| `delete_tweet` | Delete your tweet |
| `search_tweets` | Search with filters and sorting |
| `quote_tweet` | Quote tweet with commentary |
| `send_tweet_with_poll` | Create tweet with poll (2-4 options) |
| `get_timeline` | Get your home timeline |
| `get_user_tweets` | Get tweets from specific user |
| `get_full_thread` | Get entire thread (SocialData) |

### Engagement (7 tools)

| Tool | Description |
|------|-------------|
| `like_tweet` | Like a tweet |
| `unlike_tweet` | Unlike a tweet |
| `retweet` | Retweet to followers |
| `undo_retweet` | Remove retweet |
| `get_retweets` | Get users who retweeted |
| `get_liked_tweets` | Get tweets liked by user |
| `track_virality` | Track virality metrics (SocialData) |

### User Operations (10 tools)

| Tool | Description |
|------|-------------|
| `get_user_profile` | Get profile info (bio, followers, etc.) |
| `follow_user` | Follow a user |
| `unfollow_user` | Unfollow a user |
| `get_followers` | Get user's followers list |
| `get_following` | Get users they're following |
| `get_user_timeline` | Get user's tweet timeline |
| `find_mutual_connections` | Find mutual followers (SocialData) |
| `analyze_follower_demographics` | Demographics analysis (SocialData) |
| `bulk_user_profiles` | Get multiple profiles (SocialData) |
| `user_growth_analytics` | Track growth over time (SocialData) |

### Lists (5 tools)

| Tool | Description |
|------|-------------|
| `create_list` | Create new Twitter list |
| `get_user_lists` | Get all user's lists |
| `add_user_to_list` | Add member to list |
| `remove_user_from_list` | Remove member from list |
| `get_list_members` | Get all list members |

### Analytics & Search (13 tools)

| Tool | Description |
|------|-------------|
| `get_hashtag_analytics` | Analytics for hashtag |
| `advanced_tweet_search` | Complex filters (SocialData) |
| `historical_tweet_search` | Historical data (SocialData) |
| `trending_topics_search` | Trending by location (SocialData) |
| `get_hashtag_trends` | Track hashtag trends (SocialData) |
| `analyze_sentiment` | Sentiment analysis (SocialData) |
| `get_thread_metrics` | Thread analytics (SocialData) |
| `get_conversation_tree` | Full conversation (SocialData) |
| `map_influence_network` | Influence mapping (SocialData) |
| `user_influence_metrics` | Influence scores (SocialData) |

---

## 📊 Rate Limits

Twitter API tiers:

| Tier | Cost | Tweets/Month | Reads/Month |
|------|------|--------------|-------------|
| **Free** | $0 | 50/day | 500 |
| **Basic** | $100 | 3,000 | 10,000 |
| **Pro** | $5,000 | 300,000 | 1,000,000 |

Configure in `.env`:
```env
TWITTER_RATE_LIMIT_PER_MINUTE=15
TWITTER_RATE_LIMIT_PER_DAY=50
TWITTER_RATE_LIMIT_PER_MONTH=500
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration
```

**Coverage Target:** 85%+

---

## 🔗 Gateway Integration

Automatically registered in Connectors Platform gateway:

```typescript
// Gateway registers Twitter at startup
{
  id: 'twitter',
  name: 'Twitter / X',
  category: 'communication',
  description: '45 comprehensive tools for Twitter',
  serverUrl: 'http://localhost:3150',
  requiresOAuth: true
}
```

**Test semantic routing:**
```bash
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "post a tweet", "categories": ["communication"]}'
```

---

## 📚 Documentation

- **[Twitter API Docs](https://developer.twitter.com/en/docs)** - Official API documentation
- **[OAuth 1.0a Guide](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)** - Authentication guide
- **[SocialData Docs](https://docs.socialdata.tools)** - Enhanced analytics API
- **[MCP Protocol](https://modelcontextprotocol.io)** - MCP specification

---

## 🙏 Acknowledgments

This unified implementation combines the best tools from:

1. [adhikasp/mcp-twikit](https://github.com/adhikasp/mcp-twikit) - Search and timeline
2. [EnesCinr/twitter-mcp](https://github.com/EnesCinr/twitter-mcp) - OAuth 1.0a implementation
3. [ryanmac/agent-twitter-client-mcp](https://github.com/ryanmac/agent-twitter-client-mcp) - Comprehensive client operations
4. [crazyrabbitLTC/mcp-twitter-server](https://github.com/crazyrabbitLTC/mcp-twitter-server) - SocialData analytics

**Credit** to all authors for pioneering Twitter MCP integration.

---

## ⚖️ Legal & Security

- **OAuth 1.0a** is the official authentication method - recommended for production
- **Session cookies** may violate Twitter ToS - use at your own risk
- All credentials encrypted in HashiCorp Vault with per-tenant keys
- Audit logging enabled for all credential access
- Not affiliated with Twitter/X Corporation

**Use responsibly and within Twitter's Terms of Service.**

---

## 📞 Support

- Check [Troubleshooting](../../docs/troubleshooting.md)
- Review [Twitter API Status](https://api.twitterstat.us/)
- Open issue on GitHub

---

**Built with Connectors Platform** - AI Agent Integration Platform with 99% token reduction through semantic routing

**Date:** November 22, 2025

# Twitter Unified MCP Server

**Comprehensive Twitter/X integration with 63 tools from 4 community implementations, featuring OAuth 1.0a, Grok AI, DMs, moderation, and SocialData analytics.**

[![Tools: 63](https://img.shields.io/badge/Tools-63-brightgreen.svg)](#-available-tools)
[![Auth: OAuth 1.0a](https://img.shields.io/badge/Auth-OAuth%201.0a-blue.svg)](#-authentication)
[![MCP: Prompts + Resources](https://img.shields.io/badge/MCP-Prompts%20%2B%20Resources-purple.svg)](#-mcp-features)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 🚀 Features

- **63 Corrected Tools** - Schemas match actual source code from 4 implementations ([adhikasp/mcp-twikit](https://github.com/adhikasp/mcp-twikit), [EnesCinr/twitter-mcp](https://github.com/EnesCinr/twitter-mcp), [ryanmac/agent-twitter-client-mcp](https://github.com/ryanmac/agent-twitter-client-mcp), [crazyrabbitLTC/mcp-twitter-server](https://github.com/crazyrabbitLTC/mcp-twitter-server))
- **5 MCP Prompts** - Pre-built workflow templates (compose tweet, analytics, content strategy, community management, hashtag research)
- **6 MCP Resources** - Dynamic real-time data (account analytics, mentions, trends, follower insights, content performance, engagement summary)
- **Grok AI Integration** - Real-time Twitter data access via Grok (unique to Twitter platform)
- **Direct Messages** - Send and delete DMs with media support
- **Moderation Tools** - Block, unblock, mute users and manage blocked/muted lists
- **OAuth 1.0a Authentication** - Official Twitter API with Vault encryption
- **Endpoint-Specific Rate Limiting** - 300 tweets/15min, 1000 DMs/15min (per Twitter API specs)
- **SocialData API Integration** - Enhanced analytics bypassing Pro tier ($5k/month) restrictions
- **Multi-Tenant Isolation** - Per-tenant credential encryption
- **Type-Safe** - Full TypeScript implementation with corrected schemas
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

## 🛠️ Available Tools (63 Total)

### 📝 Tweet Operations (16 tools)

| Tool | Description | Source |
|------|-------------|--------|
| `send_tweet` | Post tweet with text, media (images/videos), polls | agent-twitter-client-mcp |
| `get_tweet` | Retrieve specific tweet with full metrics | mcp-twitter-server |
| `delete_tweet` | Delete your own tweet | mcp-twikit |
| `reply_to_tweet` | Reply to existing tweet with media support | agent-twitter-client-mcp |
| `quote_tweet` | Quote tweet with your commentary | agent-twitter-client-mcp |
| `search_tweets` | Search tweets with advanced filters | twitter-mcp |
| `get_timeline` | Get your home timeline feed | mcp-twikit |
| `get_latest_timeline` | Get latest timeline (bypasses algorithm) | mcp-twikit |
| `get_user_tweets` | Get all tweets from specific user | mcp-twikit |
| `create_thread` | Post connected tweet thread | agent-twitter-client-mcp |
| `schedule_tweet` | Schedule tweet for later | agent-twitter-client-mcp |
| `upload_media` | Upload images/videos for tweets | agent-twitter-client-mcp |
| `create_poll` | Create tweet with poll (2-4 options, 1-7 days) | agent-twitter-client-mcp |
| `get_poll_results` | Get poll voting results | agent-twitter-client-mcp |
| `bookmark_tweet` | Save tweet to bookmarks | mcp-twitter-server |
| `unbookmark_tweet` | Remove tweet from bookmarks | mcp-twitter-server |

### 💬 Direct Messages (2 tools)

| Tool | Description | Source |
|------|-------------|--------|
| `send_dm` | Send direct message to user (text + optional media) | mcp-twikit |
| `delete_dm` | Delete a sent direct message | mcp-twikit |

### 🤖 Grok AI Integration (1 tool)

| Tool | Description | Source |
|------|-------------|--------|
| `grok_chat` | Chat with Grok AI (has real-time Twitter data access) | agent-twitter-client-mcp |

### 🛡️ Moderation (6 tools)

| Tool | Description | Source |
|------|-------------|--------|
| `block_user` | Block a user | mcp-twitter-server |
| `unblock_user` | Unblock a user | mcp-twitter-server |
| `mute_user` | Mute a user | mcp-twitter-server |
| `unmute_user` | Unmute a user | mcp-twitter-server |
| `get_blocked_users` | Get list of blocked users | mcp-twitter-server |
| `get_muted_users` | Get list of muted users | mcp-twitter-server |

### 👥 User Operations (7 tools)

| Tool | Description | Source |
|------|-------------|--------|
| `get_user_profile` | Get user profile (bio, followers, verified status) | agent-twitter-client-mcp |
| `get_user_info` | Get user information by username | mcp-twitter-server |
| `get_authenticated_user` | Get your own profile info | mcp-twitter-server |
| `follow_user` | Follow a user | agent-twitter-client-mcp |
| `unfollow_user` | Unfollow a user | agent-twitter-client-mcp |
| `get_followers` | Get user's followers list (max 1000) | agent-twitter-client-mcp |
| `get_following` | Get users they're following (max 1000) | agent-twitter-client-mcp |

### ❤️ Engagement (6 tools)

| Tool | Description | Source |
|------|-------------|--------|
| `like_tweet` | Like a tweet | mcp-twitter-server |
| `unlike_tweet` | Unlike a previously liked tweet | mcp-twitter-server |
| `retweet` | Retweet to your followers | mcp-twitter-server |
| `undo_retweet` | Remove a retweet (unretweet) | mcp-twitter-server |
| `get_retweets` | Get users who retweeted a tweet (max 100) | mcp-twitter-server |
| `get_liked_tweets` | Get tweets liked by a user (max 100) | mcp-twitter-server |

### 📋 List Management (7 tools)

| Tool | Description | Source |
|------|-------------|--------|
| `create_list` | Create new Twitter list (public or private) | mcp-twitter-server |
| `update_list` | Update list name, description, or privacy | mcp-twitter-server |
| `delete_list` | Delete a Twitter list | mcp-twitter-server |
| `get_user_lists` | Get all lists owned by a user | mcp-twitter-server |
| `add_user_to_list` | Add user to a list | mcp-twitter-server |
| `remove_user_from_list` | Remove user from a list | mcp-twitter-server |
| `get_list_members` | Get all members of a list (max 100) | mcp-twitter-server |

### 📊 SocialData Analytics (18 tools)

**Advanced Search (6 tools)**

| Tool | Description |
|------|-------------|
| `sd_advanced_tweet_search` | Complex search with 20+ filters (language, verified, min engagement, etc.) |
| `sd_historical_tweet_search` | Search tweets from any date range (bypasses Twitter's 7-day limit) |
| `sd_trending_topics_search` | Get trending topics by location and category |
| `sd_hashtag_analytics` | Detailed hashtag performance metrics |
| `sd_get_hashtag_trends` | Track hashtag trends over time with volume data |
| `sd_analyze_sentiment` | Sentiment analysis on tweets (positive/negative/neutral) |

**Thread & Conversation Analysis (3 tools)**

| Tool | Description |
|------|-------------|
| `sd_get_full_thread` | Get entire tweet thread with all replies |
| `sd_get_thread_metrics` | Comprehensive thread performance analytics |
| `sd_get_conversation_tree` | Full conversation tree with nested replies |

**Network & Influence Analysis (3 tools)**

| Tool | Description |
|------|-------------|
| `sd_map_influence_network` | Map influence connections between users |
| `sd_user_influence_metrics` | Detailed influence scores and metrics |
| `sd_find_mutual_connections` | Find mutual followers between users |

**Advanced User Analytics (6 tools)**

| Tool | Description |
|------|-------------|
| `sd_analyze_follower_demographics` | Age, location, interests of followers |
| `sd_user_growth_analytics` | Historical follower growth tracking |
| `sd_bulk_user_profiles` | Get multiple user profiles in one call (up to 100) |
| `sd_track_virality` | Track tweet virality metrics over time |
| `sd_competitor_analysis` | Compare performance vs competitors |
| `sd_audience_overlap` | Find audience overlap between accounts |

**⚠️ Note:** SocialData tools require API key from [socialdata.tools](https://socialdata.tools). They bypass standard Twitter API tier restrictions and provide analytics equivalent to Twitter Pro tier ($5,000/month) at a fraction of the cost.

---

## 🎯 MCP Features

### MCP Prompts (5 Workflow Templates)

Pre-built automation templates for common Twitter workflows:

| Prompt | Description | Use Case |
|--------|-------------|----------|
| `compose-tweet` | Interactive tweet composition with media, polls, threading | Create engaging tweets with guidance |
| `analytics-report` | Comprehensive analytics report generator | Account overview, tweet performance, audience insights |
| `content-strategy` | Strategic content planning workflow | 30-day content calendar with goal alignment |
| `community-management` | Customer service and engagement workflow | Respond to mentions, monitor keywords, proactive engagement |
| `hashtag-research` | Hashtag research and analysis | Trending discovery, competitive analysis, performance tracking |

**Usage:**
```typescript
// Call prompt via MCP Protocol
client.getPrompt('compose-tweet', {
  topic: 'AI and automation',
  tone: 'professional',
  includeMedia: 'true',
  threadLength: '3'
});
```

### MCP Resources (6 Dynamic Data Sources)

Real-time data resources accessible without tool calls:

| Resource | URI | Description |
|----------|-----|-------------|
| Account Analytics | `twitter://account-analytics` | Real-time metrics (followers, engagement rate, growth) |
| Recent Mentions | `twitter://recent-mentions` | Latest mentions from past 24h (categorized: replies, mentions, high-value) |
| Trending Topics | `twitter://trending-topics` | Current trending hashtags with engagement data |
| Follower Insights | `twitter://follower-insights` | Demographics, verified followers, top followers (by influence) |
| Content Performance | `twitter://content-performance` | Top performing recent tweets (by engagement, reach, virality) |
| Engagement Summary | `twitter://engagement-summary` | Recent engagement activity summary |

**Usage:**
```typescript
// Access resource via MCP Protocol
client.readResource('twitter://account-analytics');
// Returns: { account: {...}, metrics: {...}, insights: {...}, last_updated: "..." }
```

Resources auto-refresh and provide passive context for AI agents.

---

## 📊 Rate Limits

### Endpoint-Specific Limits (from mcp-twikit)

| Endpoint Type | Limit | Window | Implementation |
|---------------|-------|--------|----------------|
| **Tweets** | 300 requests | 15 minutes | Sliding window with token bucket |
| **DMs** | 1,000 requests | 15 minutes | Sliding window with token bucket |
| **General** | 900 requests | 15 minutes | Sliding window (60/min × 15) |

### Global Twitter API Tiers

| Tier | Cost | Tweets/Month | Reads/Month | Notes |
|------|------|--------------|-------------|-------|
| **Free** | $0 | 50/day | 500 | Basic access |
| **Basic** | $100 | 3,000 | 10,000 | Good for small apps |
| **Pro** | $5,000 | 300,000 | 1,000,000 | Enterprise features |

**⚠️ Bypass Restrictions:** SocialData tools bypass tier restrictions and provide Pro-level analytics at lower cost.

### Configuration

Configure global tier limits in `.env`:
```env
TWITTER_RATE_LIMIT_PER_MINUTE=15
TWITTER_RATE_LIMIT_PER_DAY=50
TWITTER_RATE_LIMIT_PER_MONTH=500
```

Endpoint-specific limits (300 tweets/15min, 1000 DMs/15min) are automatically enforced by `EndpointAwareRateLimiter`.

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
  description: '63 comprehensive tools for Twitter (tweets, DMs, Grok AI, moderation, analytics)',
  serverUrl: 'http://localhost:3150',
  requiresOAuth: true,
  features: {
    tools: 63,
    prompts: 5,
    resources: 6,
    endpointRateLimiting: true
  }
}
```

**Test semantic routing:**
```bash
# Tool selection
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "post a tweet with Grok AI", "categories": ["communication"]}'

# Prompt access
curl -X GET http://localhost:3000/api/v1/prompts/twitter/compose-tweet

# Resource access
curl -X GET http://localhost:3000/api/v1/resources/twitter/account-analytics
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

# Twitter / X Integration

**Status:** ✅ Complete | **Tools:** 45 | **OAuth:** OAuth 1.0a Required

Comprehensive Twitter/X integration combining tools from 4 community implementations with official OAuth 1.0a, session cookie fallback, and SocialData analytics enhancement.

---

## Overview

The Twitter integration provides 45 comprehensive tools for interacting with Twitter/X, combining the best features from multiple community implementations:

- **adhikasp/mcp-twikit** - Search and timeline capabilities
- **EnesCinr/twitter-mcp** - OAuth 1.0a implementation
- **ryanmac/agent-twitter-client-mcp** - Comprehensive client operations
- **crazyrabbitLTC/mcp-twitter-server** - SocialData analytics

**Key Capabilities:**
- Post tweets with media (images, videos)
- Search, reply, quote, and engage with tweets
- User operations (profiles, follow/unfollow, followers)
- List management
- Advanced analytics (sentiment, trends, influence mapping)
- Poll creation
- Thread and conversation analysis

---

## Quick Start

### 1. Create Twitter Developer App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app
3. Navigate to **Keys and Tokens**
4. Generate:
   - API Key (Consumer Key)
   - API Secret (Consumer Secret)
   - Access Token
   - Access Token Secret

### 2. Configure Environment

```bash
cd integrations/communication/twitter-unified
cp .env.example .env
```

Edit `.env`:
```env
X_API_KEY=your_consumer_api_key
X_API_SECRET=your_consumer_api_secret
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=dev-root-token
```

### 3. Store Credentials in Vault

```bash
curl -X POST http://localhost:3150/oauth/store \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "my-tenant",
    "accessToken": "your_access_token",
    "accessTokenSecret": "your_access_token_secret"
  }'
```

### 4. Start Server

```bash
npm install
npm run build
npm start  # Runs on http://localhost:3150
```

### 5. Test Integration

```bash
# Via Gateway
curl -X POST http://localhost:3000/api/v1/tools/select \
  -d '{"query": "post a tweet", "categories": ["communication"]}'
```

---

## Authentication

### Primary: OAuth 1.0a (Recommended)

Official Twitter API authentication using OAuth 1.0a with HMAC-SHA1 signatures.

**Benefits:**
- Official authentication method
- ToS compliant
- Full API access
- Auto-signature generation
- Vault-encrypted storage

### Fallback: Session Cookies

Alternative authentication using browser cookies (auth_token, ct0, twid).

**⚠️ Warning:** Session cookie authentication may violate Twitter's Terms of Service. Use only for:
- Personal/educational purposes
- Testing and development
- When OAuth unavailable

**Not recommended for:**
- Production applications
- Commercial use
- High-volume usage

### Enhanced: SocialData API

Optional API key for 20 additional analytics tools:
- Historical tweet search
- Sentiment analysis
- Influence network mapping
- Follower demographics
- Conversation tree analysis

```env
SOCIALDATA_API_KEY=your_socialdata_api_key
```

---

## Available Tools (45 Total)

### Tweet Operations (10 tools)

| Tool | Description |
|------|-------------|
| `post_tweet` | Post new tweet with text, images, or videos (max 280 chars) |
| `get_tweet_by_id` | Retrieve specific tweet with full details and metrics |
| `reply_to_tweet` | Reply to an existing tweet |
| `delete_tweet` | Delete one of your tweets |
| `search_tweets` | Search Twitter with filters and sorting options |
| `quote_tweet` | Quote tweet with your own commentary |
| `send_tweet_with_poll` | Create tweet with poll (2-4 options, configurable duration) |
| `get_timeline` | Get your personalized home timeline |
| `get_user_tweets` | Get tweets from a specific user |
| `get_full_thread` | Get entire tweet thread (requires SocialData API) |

### Engagement (7 tools)

| Tool | Description |
|------|-------------|
| `like_tweet` | Like a tweet |
| `unlike_tweet` | Unlike a previously liked tweet |
| `retweet` | Retweet to your followers |
| `undo_retweet` | Remove a retweet |
| `get_retweets` | Get users who retweeted a specific tweet |
| `get_liked_tweets` | Get tweets liked by a user |
| `track_virality` | Track tweet virality metrics over time (SocialData) |

### User Operations (10 tools)

| Tool | Description |
|------|-------------|
| `get_user_profile` | Get user profile (bio, followers, location, verified status) |
| `follow_user` | Follow a Twitter user |
| `unfollow_user` | Unfollow a Twitter user |
| `get_followers` | Get list of user's followers (max 1000) |
| `get_following` | Get list of users they're following |
| `get_user_timeline` | Get tweets from specific user's timeline |
| `find_mutual_connections` | Find mutual followers between two users (SocialData) |
| `analyze_follower_demographics` | Analyze follower demographics (SocialData) |
| `bulk_user_profiles` | Get multiple user profiles at once (SocialData) |
| `user_growth_analytics` | Track user growth over time (SocialData) |

### Lists (5 tools)

| Tool | Description |
|------|-------------|
| `create_list` | Create a new Twitter list (public or private) |
| `get_user_lists` | Get all lists owned by a user |
| `add_user_to_list` | Add a user to a Twitter list |
| `remove_user_from_list` | Remove a user from a list |
| `get_list_members` | Get all members of a Twitter list |

### Analytics & Search (13 tools)

| Tool | Description |
|------|-------------|
| `get_hashtag_analytics` | Get analytics for a specific hashtag |
| `advanced_tweet_search` | Search with complex filters (SocialData) |
| `historical_tweet_search` | Search historical tweets by date range (SocialData) |
| `trending_topics_search` | Get trending topics by location (SocialData) |
| `get_hashtag_trends` | Track hashtag trends over time (SocialData) |
| `analyze_sentiment` | Analyze sentiment of tweets matching query (SocialData) |
| `get_thread_metrics` | Get analytics for entire thread (SocialData) |
| `get_conversation_tree` | Get full conversation tree with depth (SocialData) |
| `map_influence_network` | Map user influence network (SocialData) |
| `user_influence_metrics` | Calculate user influence scores (SocialData) |

---

## Rate Limits

Twitter API has strict rate limits based on tier:

| Tier | Cost | Tweets/Month | Reads/Month | Rate Limit |
|------|------|--------------|-------------|------------|
| **Free** | $0 | 1,500/month (50/day) | 500/month | Very limited |
| **Basic** | $100/month | 3,000/month | 10,000/month | Moderate |
| **Pro** | $5,000/month | 300,000/month | 1,000,000/month | High |

**Configure in `.env`:**
```env
TWITTER_RATE_LIMIT_PER_MINUTE=15
TWITTER_RATE_LIMIT_PER_DAY=50
TWITTER_RATE_LIMIT_PER_MONTH=500
```

The integration implements a multi-tier token bucket rate limiter that respects all three time windows.

---

## Usage Examples

### Post a Tweet

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{
    "toolId": "twitter.post_tweet",
    "tenantId": "my-tenant",
    "parameters": {
      "text": "Hello from Connectors Platform! 🚀"
    }
  }'
```

### Search Tweets

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{
    "toolId": "twitter.search_tweets",
    "tenantId": "my-tenant",
    "parameters": {
      "query": "AI agents",
      "maxResults": 10,
      "sortOrder": "recency"
    }
  }'
```

### Get User Profile

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{
    "toolId": "twitter.get_user_profile",
    "tenantId": "my-tenant",
    "parameters": {
      "userId": "elonmusk"
    }
  }'
```

### Analyze Sentiment (SocialData)

```bash
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{
    "toolId": "twitter.analyze_sentiment",
    "tenantId": "my-tenant",
    "parameters": {
      "query": "AI safety",
      "maxTweets": 100
    }
  }'
```

---

## Multi-Tenant Usage

Each tenant has isolated credentials:

```bash
# Tenant 1
curl -X POST http://localhost:3150/oauth/store \
  -d '{"tenantId": "company-a", "accessToken": "...", "accessTokenSecret": "..."}'

# Tenant 2
curl -X POST http://localhost:3150/oauth/store \
  -d '{"tenantId": "company-b", "accessToken": "...", "accessTokenSecret": "..."}'

# Each tenant uses their own credentials
curl -X POST http://localhost:3000/api/v1/tools/invoke \
  -d '{"toolId": "twitter.post_tweet", "tenantId": "company-a", ...}'
```

---

## Architecture

**Components:**
- **OAuth Manager** - OAuth 1.0a signature generation, Vault integration
- **Twitter Client** - Unified client supporting OAuth, cookies, SocialData
- **Rate Limiter** - Token bucket algorithm with multi-tier limits
- **Tool Registry** - 45 tools organized by category
- **MCP Server** - Stdio transport + HTTP endpoints for OAuth

**Security:**
- Vault-encrypted credential storage
- Per-tenant encryption keys (Transit engine)
- Auto-signature generation for OAuth 1.0a
- No credentials in logs or errors

---

## Troubleshooting

### OAuth Authentication Failed

**Check credentials:**
```bash
curl http://localhost:3150/tenant/my-tenant/status
```

**Re-store credentials:**
```bash
curl -X POST http://localhost:3150/oauth/store \
  -d '{"tenantId": "my-tenant", "accessToken": "...", "accessTokenSecret": "..."}'
```

### Rate Limit Exceeded

**Check status:**
```bash
# Response includes availableTokens
curl http://localhost:3150/health
```

**Solutions:**
- Wait for rate limit reset
- Upgrade Twitter API tier
- Reduce request frequency

### Tool Not Found

**Verify integration enabled:**
```bash
curl http://localhost:3000/api/v1/integrations/twitter
```

**Regenerate embeddings:**
```bash
cd gateway
npm run generate-embeddings
```

---

## Performance

**Token Usage:**
- Traditional (all 45 tools): ~5,500 tokens
- Connectors (semantic selection): ~800-1,200 tokens
- **Reduction: ~80%**

**Latency:**
- OAuth signature generation: <10ms
- Vault credential fetch (cached): <50ms
- Rate limit check: <1ms
- Twitter API call: 100-500ms (depends on Twitter)

---

## Security & Legal

**Security Features:**
- OAuth 1.0a with HMAC-SHA1 signatures
- Vault encryption (per-tenant keys)
- Audit logging for all credential access
- No credentials in code or logs

**Legal Notices:**
- OAuth 1.0a is the official authentication method (ToS compliant)
- Session cookies may violate Twitter ToS (use at your own risk)
- SocialData API is a third-party service
- Not affiliated with Twitter/X Corporation

**Use responsibly within Twitter's Terms of Service.**

---

## References

- **[Twitter API Docs](https://developer.twitter.com/en/docs)** - Official documentation
- **[OAuth 1.0a Guide](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)** - Authentication
- **[SocialData Docs](https://docs.socialdata.tools)** - Analytics API
- **[Rate Limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)** - API limits

---

**Built with Connectors Platform** - 99% token reduction through semantic routing

**Last Updated:** 2025-11-22

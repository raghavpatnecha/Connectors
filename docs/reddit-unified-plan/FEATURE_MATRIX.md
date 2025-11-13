# Reddit Unified MCP Server - Complete Feature Matrix

**Analysis Date:** 2025-11-13
**Source Repositories:** 5 Reddit MCP servers
**Target:** Unified multi-tenant Reddit MCP server with OAuth 2.0

---

## 📊 Repository Analysis Summary

### Repository 1: karanb192/reddit-mcp-buddy
**Language:** TypeScript/Node.js
**Authentication:** 3-tier (Anonymous, App-Only, Full Auth)
**Special Features:** Smart caching, rate limit testing, zero setup option

**Tools Provided (5):**
1. `browse_subreddit` - Browse posts with sorting (hot, new, top, rising, controversial)
2. `search_reddit` - Search across Reddit or specific subreddits
3. `get_post_details` - Get post with all comments
4. `user_analysis` - Analyze user profiles (karma, posts, comments)
5. `reddit_explain` - Explain Reddit terminology

---

### Repository 2: KrishnaRandad2023/mcp-reddit
**Language:** Python/PRAW
**Authentication:** OAuth 2.0 (username/password + client credentials)
**Special Features:** Docker support, both read and write operations

**Tools Provided (6):**
1. `fetchPosts` - Fetch hot posts from subreddits (1-100 limit)
2. `getComments` - Retrieve comments from specific posts
3. `searchPosts` - Search for posts within subreddits
4. `postComment` - Post comments on Reddit posts
5. `getSubredditInfo` - Get detailed subreddit information
6. `postToSubreddit` - Create new text or link posts

---

### Repository 3: Arindam200/reddit-mcp
**Language:** Python/PRAW
**Authentication:** Two-tier (Read-only vs Authenticated)
**Special Features:** AI-driven insights, engagement analysis, timing optimization

**Read-Only Tools (7):**
1. `get_user_info` - Get detailed user analysis
2. `get_top_posts` - Get and analyze top posts
3. `get_subreddit_info` - Get detailed subreddit metadata
4. `get_trending_subreddits` - Get trending communities
5. `get_subreddit_stats` - Get comprehensive subreddit analysis
6. `get_submission_by_url` - Fetch posts by URL
7. `get_submission_by_id` - Fetch posts by ID

**Authenticated Tools (3):**
8. `create_post` - Create optimized posts with flair
9. `reply_to_post` - Reply to posts with engagement insights
10. `who_am_i` - Get info about authenticated user

---

### Repository 4: Hawstein/mcp-server-reddit
**Language:** Python/redditwarp
**Authentication:** Public API (read-only, no auth required)
**Special Features:** MCP Inspector debugging, multi-client support

**Tools Provided (8):**
1. `get_frontpage_posts` - Get hot posts from Reddit frontpage
2. `get_subreddit_info` - Fetch subreddit metadata
3. `get_subreddit_hot_posts` - Get trending posts from subreddit
4. `get_subreddit_new_posts` - Get recent posts from subreddit
5. `get_subreddit_top_posts` - Get top posts by time period
6. `get_subreddit_rising_posts` - Get rising posts from subreddit
7. `get_post_content` - Get full post details + comments (1-10 depth)
8. `get_post_comments` - Get comment threads from posts

---

### Repository 5: adhikasp/mcp-reddit
**Language:** Python + redditwarp + FastMCP
**Authentication:** Public API (no auth documented)
**Special Features:** Smithery integration, supports text/link/gallery posts

**Tools Provided (2):**
1. `fetch_reddit_hot_threads` - Get popular/trending posts from subreddit
2. `fetch_reddit_post_content` - Get comprehensive post info + comments

---

## 🎯 Unified Feature Set - All Tools Combined

### **Total Unique Tools:** 25-30 (after deduplication and enhancement)

---

## 📋 Complete Tool Inventory

### **Category 1: Browse & Discovery (8 tools)**

| Tool Name | Source(s) | Description | Auth Required |
|-----------|-----------|-------------|---------------|
| `browse_frontpage` | Repo 4 | Get hot posts from Reddit frontpage | No |
| `browse_subreddit` | Repo 1, 2, 4 | Browse posts from any subreddit (hot, new, top, rising, controversial) | No |
| `browse_subreddit_hot` | Repo 2, 4 | Get trending/hot posts from subreddit | No |
| `browse_subreddit_new` | Repo 4 | Get newest posts from subreddit | No |
| `browse_subreddit_top` | Repo 3, 4 | Get top posts by time period (hour, day, week, month, year, all) | No |
| `browse_subreddit_rising` | Repo 4 | Get rising posts gaining momentum | No |
| `browse_subreddit_controversial` | Repo 1 | Get controversial posts | No |
| `get_trending_subreddits` | Repo 3 | Get trending communities with growth metrics | No |

---

### **Category 2: Search (2 tools)**

| Tool Name | Source(s) | Description | Auth Required |
|-----------|-----------|-------------|---------------|
| `search_reddit` | Repo 1, 2, 3 | Search across Reddit or within subreddits (filter by author, time, flair) | No |
| `search_posts` | Repo 2 | Search for posts within specific subreddits | No |

---

### **Category 3: Posts & Submissions (6 tools)**

| Tool Name | Source(s) | Description | Auth Required |
|-----------|-----------|-------------|---------------|
| `get_post_details` | Repo 1, 4, 5 | Get post with all comments (supports URL, ID, or ID+subreddit) | No |
| `get_post_content` | Repo 4 | Get full post details with configurable comment depth (1-10 levels) | No |
| `get_post_by_url` | Repo 3 | Fetch post using Reddit URL | No |
| `get_post_by_id` | Repo 3 | Fetch post using Reddit ID | No |
| `create_post` | Repo 2, 3 | Create new text or link posts (with optional flair) | **Yes** |
| `create_post_optimized` | Repo 3 | Create post with AI engagement insights and timing optimization | **Yes** |

---

### **Category 4: Comments (4 tools)**

| Tool Name | Source(s) | Description | Auth Required |
|-----------|-----------|-------------|---------------|
| `get_post_comments` | Repo 2, 4 | Get comment threads from posts | No |
| `post_comment` | Repo 2 | Post comment on Reddit post | **Yes** |
| `reply_to_post` | Repo 3 | Reply to post with engagement insights | **Yes** |
| `reply_to_comment` | Repo 3 | Reply to comment with strategic formatting | **Yes** |

---

### **Category 5: Subreddit Information (2 tools)**

| Tool Name | Source(s) | Description | Auth Required |
|-----------|-----------|-------------|---------------|
| `get_subreddit_info` | Repo 2, 4 | Get detailed subreddit metadata and statistics | No |
| `get_subreddit_stats` | Repo 3 | Get comprehensive subreddit analysis | No |

---

### **Category 6: User & Profile (3 tools)**

| Tool Name | Source(s) | Description | Auth Required |
|-----------|-----------|-------------|---------------|
| `get_user_info` | Repo 3 | Get detailed user analysis (karma, posts, comments, active subreddits) | No |
| `analyze_user` | Repo 1 | Analyze Reddit user profile with engagement insights | No |
| `who_am_i` | Repo 3 | Get info about currently authenticated user | **Yes** |

---

### **Category 7: Utilities (1 tool)**

| Tool Name | Source(s) | Description | Auth Required |
|-----------|-----------|-------------|---------------|
| `reddit_explain` | Repo 1 | Explain Reddit terminology (karma, cake day, AMA, ELI5, etc.) | No |

---

## 🔄 Tool Deduplication & Consolidation

### Duplicate Tools to Merge:

**Browse Subreddit Tools:**
- `browse_subreddit`, `fetchPosts`, `get_subreddit_hot_posts`, `fetch_hot_threads` → **Unified: `browse_subreddit`**
  - Parameters: `subreddit`, `sort` (hot, new, top, rising, controversial), `time_filter`, `limit`

**Get Post Details:**
- `get_post_details`, `get_post_content`, `get_submission_by_url`, `get_submission_by_id` → **Unified: `get_post`**
  - Parameters: `post_identifier` (URL, ID, or ID+subreddit), `include_comments`, `comment_depth`, `comment_limit`

**Search Posts:**
- `search_reddit`, `searchPosts` → **Unified: `search_posts`**
  - Parameters: `query`, `subreddit` (optional), `sort`, `time_filter`, `author`, `flair`

**Get Comments:**
- `getComments`, `get_post_comments` → **Unified: `get_comments`**
  - Parameters: `post_id`, `sort`, `limit`, `depth`

**Subreddit Info:**
- `getSubredditInfo`, `get_subreddit_info`, `get_subreddit_stats` → **Unified: `get_subreddit_info`**
  - Parameters: `subreddit`, `include_stats`

**User Info:**
- `user_analysis`, `get_user_info` → **Unified: `get_user_info`**
  - Parameters: `username`, `include_engagement_insights`

---

## ✨ Final Unified Tool Set (25 Tools)

### **Read-Only Tools (20 tools)** - No authentication required

**Browse & Discovery (8):**
1. `browse_frontpage` - Hot posts from Reddit frontpage
2. `browse_subreddit` - Browse subreddit with sorting options (hot, new, top, rising, controversial)
3. `browse_subreddit_new` - Newest posts from subreddit
4. `browse_subreddit_top` - Top posts by time period
5. `browse_subreddit_rising` - Rising posts gaining momentum
6. `browse_subreddit_controversial` - Controversial posts
7. `get_trending_subreddits` - Trending communities with growth metrics
8. `browse_popular` - **NEW** - Browse r/popular

**Search (2):**
9. `search_posts` - Search Reddit or specific subreddits
10. `advanced_search` - **NEW** - Advanced search with filters (author, flair, time, sort)

**Posts & Content (4):**
11. `get_post` - Get post by URL, ID, or ID+subreddit (with comments)
12. `get_post_comments` - Get comment threads from post
13. `get_user_posts` - **NEW** - Get user's post history
14. `get_user_comments` - **NEW** - Get user's comment history

**Subreddit Info (2):**
15. `get_subreddit_info` - Get subreddit metadata and stats
16. `search_subreddits` - **NEW** - Search for subreddits by query

**User & Profile (3):**
17. `get_user_info` - Get user profile analysis
18. `get_user_trophies` - **NEW** - Get user's Reddit trophies
19. `get_user_karma` - **NEW** - Get user's karma breakdown by subreddit

**Utilities (1):**
20. `reddit_explain` - Explain Reddit terminology

---

### **Authenticated Tools (5 tools)** - Require OAuth

**Account (1):**
21. `who_am_i` - Get authenticated user's info

**Posts & Submissions (2):**
22. `create_post` - Create text or link post
23. `create_post_optimized` - Create post with AI engagement insights

**Comments (2):**
24. `post_comment` - Post comment on post
25. `reply_to_post` - Reply to post with engagement insights

---

### **Additional Enhancements (Potential):**

**Voting:**
26. `upvote` - **NEW** - Upvote post or comment
27. `downvote` - **NEW** - Downvote post or comment
28. `remove_vote` - **NEW** - Remove vote from post or comment

**Saving:**
29. `save_post` - **NEW** - Save post to account
30. `unsave_post` - **NEW** - Unsave post from account
31. `get_saved_posts` - **NEW** - Get user's saved posts

**Subscriptions:**
32. `subscribe_subreddit` - **NEW** - Subscribe to subreddit
33. `unsubscribe_subreddit` - **NEW** - Unsubscribe from subreddit
34. `get_subscribed_subreddits` - **NEW** - Get user's subscribed subreddits

**Messaging:**
35. `send_message` - **NEW** - Send private message
36. `get_messages` - **NEW** - Get inbox messages
37. `mark_message_read` - **NEW** - Mark message as read

---

## 📊 Coverage Analysis

### Tools by Repository:

| Repository | Original Tools | Covered in Unified | Coverage % |
|------------|---------------|-------------------|------------|
| **Repo 1** (reddit-mcp-buddy) | 5 | 5/5 | 100% |
| **Repo 2** (mcp-reddit) | 6 | 6/6 | 100% |
| **Repo 3** (reddit-mcp) | 10 | 10/10 | 100% |
| **Repo 4** (mcp-server-reddit) | 8 | 8/8 | 100% |
| **Repo 5** (mcp-reddit) | 2 | 2/2 | 100% |
| **Total Original** | **31 tools** | **31/31** | **100%** |
| **Enhancements** | - | **+12 new tools** | - |
| **Final Total** | - | **38 tools** | - |

---

## 🎯 Target Architecture

### **Core Tools (26 tools):**
- 20 read-only tools (anonymous/app-only auth)
- 6 authenticated tools (user OAuth required)

### **Enhanced Tools (+12 tools):**
- Voting (3 tools)
- Saving (3 tools)
- Subscriptions (3 tools)
- Messaging (3 tools)

### **Total: 37 comprehensive Reddit tools** (25 core + 12 enhanced)

---

## 🔐 Authentication Strategy

### **Multi-Tenant OAuth 2.0 Architecture:**

**Application Type:** Web App (can keep secret)

**OAuth Flow:** Authorization Code Flow with PKCE

**Scopes Required:**
- **Read-only:** `identity`, `read`, `history`, `mysubreddits`
- **Post/Comment:** `submit`, `edit`
- **Vote:** `vote`
- **Save:** `save`
- **Subscribe:** `subscribe`
- **Message:** `privatemessages`
- **Account:** `account`

**Token Management:**
- Access tokens: 1 hour expiry
- Refresh tokens: `duration=permanent` for long-lived access
- Per-tenant credential encryption (HashiCorp Vault)
- Automatic token refresh (5 min before expiry)

**Rate Limits:**
- Anonymous: 10 requests/minute
- App-Only (Client Credentials): 60 requests/minute
- Authenticated (User OAuth): 100 requests/minute

---

## 🏗️ Technology Stack

### **Primary Stack (following LinkedIn pattern):**
- **Language:** TypeScript
- **Reddit API Client:** Snoowrap (TypeScript Reddit API wrapper)
- **OAuth:** Reddit OAuth 2.0 (Authorization Code Flow)
- **Secrets Management:** HashiCorp Vault
- **Validation:** Zod
- **Testing:** Jest (target: 85%+ coverage)
- **Transport:** MCP stdio

### **Alternative Libraries:**
- **PRAW (Python Reddit API Wrapper)** - Used by repos 2 & 3
- **redditwarp (Python)** - Used by repo 4
- **Axios + Manual API calls** - For custom implementation

**Decision:** Use **Snoowrap** (TypeScript) for consistency with LinkedIn implementation

---

## 📝 Notes & Considerations

### **Reddit API Limitations:**
1. **1,000 post ceiling** - Can only retrieve ~1,000 most recent posts per listing
2. **No real-time webhooks** - Polling only
3. **Rate limits** - 100 QPM for OAuth, 60 QPM for app-only
4. **Mature content restriction** - Limited access to NSFW content via API (since July 5, 2023)
5. **No official OpenAPI spec** - Documentation is fragmented

### **Special Considerations:**
1. **Caching** - Implement smart caching (like repo 1) to reduce API calls
2. **Rate Limit Testing** - Include rate limit testing tools
3. **User Agent** - Use unique, descriptive user agent string (required by Reddit)
4. **Error Handling** - Comprehensive error handling for rate limits, auth failures
5. **Read-Only Fallback** - Gracefully degrade to read-only if OAuth fails

---

## ✅ Next Steps

1. Design unified architecture (following LinkedIn pattern)
2. Create Claude Flow implementation plan
3. Implement with parallel agents:
   - OAuth Manager
   - Vault Client
   - API Client (Snoowrap wrapper)
   - Tool Registry (38 tools across 7 categories)
   - Main Server
   - Test Suite
4. Achieve 85%+ test coverage
5. Comprehensive documentation

---

**Status:** Ready for architecture design and implementation planning

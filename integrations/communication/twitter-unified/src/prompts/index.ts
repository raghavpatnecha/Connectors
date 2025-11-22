/**
 * MCP Prompts - Pre-built Workflow Templates
 * Based on mcp-twitter-server implementation
 *
 * Provides 5 automation templates for common Twitter workflows:
 * 1. Compose Tweet - Interactive tweet composition
 * 2. Analytics Report - Comprehensive analytics workflow
 * 3. Content Strategy - Strategic content planning
 * 4. Community Management - Customer service and engagement
 * 5. Hashtag Research - Hashtag research and trend analysis
 */

import { Prompt } from '@modelcontextprotocol/sdk/types.js';

export const TWITTER_PROMPTS: Prompt[] = [
  {
    name: 'compose-tweet',
    description: 'Interactive workflow for composing an engaging tweet with media, polls, and threading',
    arguments: [
      {
        name: 'topic',
        description: 'The topic or subject matter for the tweet',
        required: true
      },
      {
        name: 'tone',
        description: 'Desired tone (professional, casual, humorous, educational)',
        required: false
      },
      {
        name: 'includeMedia',
        description: 'Whether to include media attachments (true/false)',
        required: false
      },
      {
        name: 'threadLength',
        description: 'Number of tweets in thread (1 for single tweet)',
        required: false
      }
    ]
  },

  {
    name: 'analytics-report',
    description: 'Generate a comprehensive analytics report for your Twitter account or specific tweets',
    arguments: [
      {
        name: 'reportType',
        description: 'Type of report: account_overview, tweet_performance, audience_insights, or engagement_analysis',
        required: true
      },
      {
        name: 'timeframe',
        description: 'Time period for analysis (e.g., "last 7 days", "last 30 days", "this month")',
        required: true
      },
      {
        name: 'tweetIds',
        description: 'Comma-separated tweet IDs for tweet_performance reports',
        required: false
      },
      {
        name: 'includeComparisons',
        description: 'Include period-over-period comparisons (true/false)',
        required: false
      }
    ]
  },

  {
    name: 'content-strategy',
    description: 'Develop a strategic content plan based on audience analysis and trending topics',
    arguments: [
      {
        name: 'goals',
        description: 'Content goals (engagement, growth, education, brand_awareness)',
        required: true
      },
      {
        name: 'targetAudience',
        description: 'Description of target audience',
        required: true
      },
      {
        name: 'contentPillars',
        description: 'Main content themes or pillars (comma-separated)',
        required: false
      },
      {
        name: 'postingFrequency',
        description: 'Desired posting frequency (e.g., "3 times per day", "daily", "weekly")',
        required: false
      }
    ]
  },

  {
    name: 'community-management',
    description: 'Workflow for managing customer service, mentions, and community engagement',
    arguments: [
      {
        name: 'mode',
        description: 'Management mode: respond_to_mentions, monitor_keywords, or engagement_outreach',
        required: true
      },
      {
        name: 'keywords',
        description: 'Keywords to monitor (comma-separated, for monitor_keywords mode)',
        required: false
      },
      {
        name: 'responseGuidelines',
        description: 'Guidelines for response tone and handling',
        required: false
      },
      {
        name: 'priorityLevel',
        description: 'Priority level filter (high, medium, low, all)',
        required: false
      }
    ]
  },

  {
    name: 'hashtag-research',
    description: 'Research trending hashtags and analyze hashtag performance for content optimization',
    arguments: [
      {
        name: 'industry',
        description: 'Industry or niche for hashtag research',
        required: true
      },
      {
        name: 'researchType',
        description: 'Research type: trending, competitive_analysis, or performance_tracking',
        required: true
      },
      {
        name: 'competitorAccounts',
        description: 'Competitor Twitter handles (comma-separated, for competitive_analysis)',
        required: false
      },
      {
        name: 'hashtagsToTrack',
        description: 'Specific hashtags to track (comma-separated, for performance_tracking)',
        required: false
      }
    ]
  }
];

/**
 * Get prompt template text for a specific workflow
 */
export function getPromptTemplate(promptName: string, args: Record<string, string>): string {
  switch (promptName) {
    case 'compose-tweet':
      return generateComposeTweetPrompt(args);
    case 'analytics-report':
      return generateAnalyticsReportPrompt(args);
    case 'content-strategy':
      return generateContentStrategyPrompt(args);
    case 'community-management':
      return generateCommunityManagementPrompt(args);
    case 'hashtag-research':
      return generateHashtagResearchPrompt(args);
    default:
      throw new Error(`Unknown prompt: ${promptName}`);
  }
}

function generateComposeTweetPrompt(args: Record<string, string>): string {
  const { topic, tone = 'professional', includeMedia = 'false', threadLength = '1' } = args;

  return `# Compose Engaging Tweet

**Topic:** ${topic}
**Tone:** ${tone}
**Include Media:** ${includeMedia}
**Thread Length:** ${threadLength} tweet(s)

## Workflow Steps:

1. **Content Creation**
   - Draft compelling tweet text (max 280 characters per tweet)
   - Ensure ${tone} tone throughout
   - Include relevant hashtags (2-3 max)
   - Add call-to-action if appropriate

2. **Media Preparation** ${includeMedia === 'true' ? `
   - Prepare high-quality images or videos
   - Ensure proper dimensions (1200x675 for images)
   - Add alt text for accessibility` : '(Skipped - No media requested)'}

3. **Threading** ${parseInt(threadLength) > 1 ? `
   - Create ${threadLength} connected tweets
   - Ensure logical flow between tweets
   - Number tweets if appropriate (1/, 2/, etc.)
   - Add 🧵 emoji to first tweet` : '(Skipped - Single tweet)'}

4. **Optimization**
   - Check for typos and grammar
   - Verify hashtag relevance
   - Preview before posting
   - Consider optimal posting time

5. **Post & Monitor**
   - Use send_tweet tool to post
   - Monitor engagement in first hour
   - Respond to early comments
   - Consider pinning if high-value

## Available Tools:
- send_tweet: Post the tweet
- create_thread: Post multiple connected tweets
- upload_media: Attach images/videos
- schedule_tweet: Schedule for optimal time

Ready to compose your tweet!`;
}

function generateAnalyticsReportPrompt(args: Record<string, string>): string {
  const { reportType, timeframe, tweetIds = '', includeComparisons = 'true' } = args;

  return `# Twitter Analytics Report

**Report Type:** ${reportType}
**Timeframe:** ${timeframe}
${tweetIds ? `**Tweet IDs:** ${tweetIds}` : ''}
**Include Comparisons:** ${includeComparisons}

## Analysis Workflow:

### 1. Data Collection
${reportType === 'account_overview' ? `
- Get authenticated user profile (get_authenticated_user)
- Retrieve recent tweets (get_user_tweets)
- Fetch follower count and growth (get_followers)
- Collect engagement metrics (likes, retweets, replies)` : ''}
${reportType === 'tweet_performance' ? `
- Retrieve specified tweets (${tweetIds})
- Get engagement data for each tweet
- Fetch retweets and quote tweets
- Analyze reply threads` : ''}
${reportType === 'audience_insights' ? `
- Get follower demographics (get_followers with user.fields)
- Analyze follower growth trends
- Identify top engaging followers
- Review follower locations and interests` : ''}
${reportType === 'engagement_analysis' ? `
- Calculate engagement rate (likes + retweets + replies / impressions)
- Identify best performing content types
- Analyze posting time performance
- Review hashtag effectiveness` : ''}

### 2. Metrics Calculation
- **Engagement Rate:** (Total Engagements / Impressions) × 100
- **Growth Rate:** (New Followers / Total Followers) × 100
- **Reply Rate:** (Replies / Total Tweets) × 100
- **Virality Score:** (Retweets + Quotes) / Followers

### 3. Comparative Analysis ${includeComparisons === 'true' ? `
- Compare to previous period
- Calculate percentage changes
- Identify trends (improving/declining)
- Benchmark against averages` : '(Skipped)'}

### 4. Insights & Recommendations
- Highlight top performing tweets
- Identify content gaps
- Recommend optimal posting times
- Suggest content improvements

## Available Tools:
- get_authenticated_user: Get account info
- get_user_tweets: Retrieve recent tweets
- get_tweet: Get specific tweet details
- get_followers: Analyze follower data
- get_liked_tweets: See what resonates
- SocialData tools: Enhanced analytics beyond standard API

Generate comprehensive report with actionable insights.`;
}

function generateContentStrategyPrompt(args: Record<string, string>): string {
  const { goals, targetAudience, contentPillars = '', postingFrequency = 'daily' } = args;

  return `# Twitter Content Strategy Development

**Goals:** ${goals}
**Target Audience:** ${targetAudience}
${contentPillars ? `**Content Pillars:** ${contentPillars}` : ''}
**Posting Frequency:** ${postingFrequency}

## Strategy Development Workflow:

### 1. Audience Research
- Analyze current follower demographics (get_followers)
- Review competitor accounts in same niche
- Identify audience pain points and interests
- Map audience journey and touchpoints

### 2. Content Pillar Definition ${contentPillars ? `
**Your Pillars:** ${contentPillars.split(',').map((p: string, i: number) => `\n${i + 1}. ${p.trim()}`).join('')}

For each pillar:
- Define 3-5 sub-topics
- Identify content formats (threads, images, polls)
- Set engagement goals
- Plan distribution ratio` : `
Recommended pillars based on ${goals}:
1. Educational content (40%)
2. Behind-the-scenes (20%)
3. Industry news & trends (20%)
4. Engagement & community (15%)
5. Promotional (5%)`}

### 3. Competitive Analysis
- Identify 3-5 competitors using search_tweets
- Analyze their top performing content
- Identify content gaps and opportunities
- Review their engagement patterns

### 4. Content Calendar Planning
**Posting Frequency:** ${postingFrequency}

- Map content to pillars (balanced distribution)
- Identify optimal posting times from analytics
- Plan content mix (text, images, videos, polls, threads)
- Schedule seasonal/timely content
- Build evergreen content library

### 5. Engagement Strategy
For goal: ${goals}
- Define engagement tactics (replies, retweets, mentions)
- Plan community building activities
- Set response time targets
- Create engagement templates

### 6. Performance Tracking
- Define KPIs aligned with ${goals}
- Set benchmarks and targets
- Plan weekly/monthly review cadence
- Create reporting dashboard

## Content Format Recommendations:

**For Engagement:**
- Polls and questions (use create_poll)
- Ask for opinions in replies
- Share relatable experiences
- Use conversational threads

**For Growth:**
- Educational threads (5-10 tweets)
- Visual content with strong hooks
- Collaborate with influencers
- Use strategic hashtags

**For Brand Awareness:**
- Consistent posting schedule
- Strong visual branding
- Share company culture
- Industry thought leadership

## Available Tools:
- send_tweet: Post content
- create_thread: Educational content
- create_poll: Engagement content
- search_tweets: Competitive research
- get_trending_topics: Timely content
- schedule_tweet: Calendar planning
- SocialData tools: Advanced audience insights

Develop comprehensive 30-day content strategy with specific posts and themes.`;
}

function generateCommunityManagementPrompt(args: Record<string, string>): string {
  const { mode, keywords = '', responseGuidelines = '', priorityLevel = 'all' } = args;

  return `# Community Management Workflow

**Mode:** ${mode}
${keywords ? `**Keywords:** ${keywords}` : ''}
${responseGuidelines ? `**Response Guidelines:** ${responseGuidelines}` : ''}
**Priority Level:** ${priorityLevel}

## Workflow Steps:

### 1. Monitoring Setup
${mode === 'respond_to_mentions' ? `
**Mentions Monitoring:**
- Get recent mentions (search_tweets with @username)
- Filter by priority level: ${priorityLevel}
- Categorize: questions, feedback, complaints, praise
- Flag urgent issues (complaints, support requests)` : ''}
${mode === 'monitor_keywords' ? `
**Keyword Monitoring:**
- Track keywords: ${keywords}
- Set up searches for each keyword
- Identify brand mentions (with/without @)
- Track sentiment (positive, negative, neutral)
- Flag opportunities for engagement` : ''}
${mode === 'engagement_outreach' ? `
**Proactive Engagement:**
- Search relevant conversations in your niche
- Identify influential voices
- Find opportunities to add value
- Build relationships with key accounts` : ''}

### 2. Response Strategy
${responseGuidelines || `
**Default Guidelines:**
- Respond within 1 hour for high priority
- Within 4 hours for medium priority
- Within 24 hours for low priority
- Always maintain professional, helpful tone
- Personalize responses (avoid templates for complex issues)
- Escalate technical issues appropriately`}

**Response Templates by Type:**

**Questions:**
- Acknowledge question
- Provide helpful answer or resource
- Invite follow-up if needed
- Thank for engaging

**Complaints:**
- Acknowledge concern immediately
- Show empathy
- Provide solution or next steps
- Move to DMs for sensitive issues (send_dm)
- Follow up to confirm resolution

**Praise:**
- Thank genuinely
- Share with team (retweet with comment)
- Build relationship
- Invite continued engagement

**Support Requests:**
- Acknowledge receipt
- Provide immediate help or timeline
- Move complex issues to DMs
- Track to resolution

### 3. Engagement Actions

**For Each Item:**
1. Read full context (get_tweet for thread)
2. Check user profile (get_user_profile)
3. Review history (have we interacted before?)
4. Craft appropriate response
5. Decide action: reply, DM, like, or escalate

**Tools to Use:**
- reply_to_tweet: Public responses
- send_dm: Private support
- like_tweet: Acknowledge without response
- retweet: Amplify positive mentions
- quote_tweet: Add context to shares

### 4. Escalation Criteria

**Immediate Escalation:**
- Legal threats
- Security concerns
- PR crises
- Executive mentions

**Standard Escalation:**
- Technical issues requiring engineering
- Feature requests
- Partnership inquiries
- Complex billing issues

### 5. Reporting & Learning

**Daily Summary:**
- Total mentions/interactions processed
- Response time averages
- Sentiment breakdown
- Escalations and resolutions
- Trending topics in feedback

**Weekly Analysis:**
- Common questions (FAQ opportunities)
- Recurring issues (product improvements)
- Community sentiment trends
- Response effectiveness

## Available Tools:
- search_tweets: Find mentions and keywords
- get_tweet: Get full context
- reply_to_tweet: Respond publicly
- send_dm: Private communication
- like_tweet: Acknowledge
- retweet: Amplify
- quote_tweet: Add context
- get_user_profile: Understand users
- block_user / mute_user: Manage spam/abuse

${mode === 'respond_to_mentions' ?
  'Start by retrieving recent mentions and categorizing by priority.' :
  mode === 'monitor_keywords' ?
  `Start by searching for keywords: ${keywords}` :
  'Start by searching relevant conversations in your industry.'}`;
}

function generateHashtagResearchPrompt(args: Record<string, string>): string {
  const { industry, researchType, competitorAccounts = '', hashtagsToTrack = '' } = args;

  return `# Hashtag Research & Analysis

**Industry:** ${industry}
**Research Type:** ${researchType}
${competitorAccounts ? `**Competitor Accounts:** ${competitorAccounts}` : ''}
${hashtagsToTrack ? `**Hashtags to Track:** ${hashtagsToTrack}` : ''}

## Research Workflow:

### 1. Initial Discovery
${researchType === 'trending' ? `
**Trending Hashtag Analysis:**
- Get current trending topics (get_trending_topics)
- Filter trends relevant to ${industry}
- Analyze tweet volume for each trend
- Assess trend longevity (flash trend vs sustained)
- Check trend geographic distribution

**Trend Evaluation Criteria:**
- Relevance to ${industry} (1-10 scale)
- Current tweet volume
- Engagement rate on trending tweets
- Brand safety considerations
- Opportunity for unique perspective` : ''}

${researchType === 'competitive_analysis' ? `
**Competitor Hashtag Strategy:**
Analyzing: ${competitorAccounts}

For each competitor:
1. Get recent tweets (get_user_tweets)
2. Extract all hashtags used
3. Calculate hashtag frequency
4. Measure engagement by hashtag
5. Identify signature hashtags
6. Note hashtag combinations

**Analysis Points:**
- Most frequently used hashtags
- Best performing hashtags (engagement)
- Branded vs generic hashtags
- Hashtag quantity per tweet
- Hashtag placement (beginning, middle, end)
- Seasonal/campaign hashtags` : ''}

${researchType === 'performance_tracking' ? `
**Hashtag Performance Tracking:**
Tracking: ${hashtagsToTrack}

For each hashtag:
1. Search recent tweets (search_tweets)
2. Analyze engagement metrics
3. Identify top performing posts
4. Review usage frequency over time
5. Track your brand's performance vs others

**Metrics to Track:**
- Average engagement rate
- Total impressions/reach
- Your rank for this hashtag
- Optimal posting times
- Content types that perform best
- Related hashtags often used together` : ''}

### 2. Volume & Competition Analysis

**For Each Identified Hashtag:**
- Search hashtag (search_tweets)
- Count recent tweets (last 24h, 7d, 30d)
- Assess competition level:
  - Low: <100 tweets/day (easier to rank)
  - Medium: 100-1000 tweets/day (balanced)
  - High: >1000 tweets/day (harder to stand out)

### 3. Relevance & Engagement Analysis

**Engagement Metrics:**
- Average likes per hashtag tweet
- Average retweets per hashtag tweet
- Average replies per hashtag tweet
- Engagement rate calculation

**Relevance Check:**
- Review top 20 tweets for hashtag
- Assess content quality
- Check if hashtag meaning is consistent
- Identify any negative associations
- Confirm alignment with ${industry}

### 4. Hashtag Strategy Recommendations

**Primary Hashtags (2-3 per tweet):**
- High relevance, medium competition
- Core to ${industry}
- Consistent usage for brand building

**Secondary Hashtags (1-2 per tweet):**
- Trending or timely
- Niche-specific
- Campaign or content-specific

**Hashtag Usage Guidelines:**
- Optimal number: 2-3 hashtags per tweet
- Placement: End of tweet (better readability)
- Mix: 70% established, 30% trending
- Create branded hashtag for campaigns
- Track performance weekly

### 5. Competitive Positioning

**Hashtag Opportunities:**
- Underutilized hashtags (relevant but low competition)
- Rising trends in ${industry}
- Gaps in competitor strategies
- Seasonal opportunities

### 6. Performance Tracking Plan

**Weekly Review:**
- Track engagement for each hashtag used
- Compare to benchmarks
- Identify top performers
- Retire low-performing hashtags
- Test 2-3 new hashtags

**Monthly Analysis:**
- Hashtag performance trends
- Competitor hashtag evolution
- Industry trend shifts
- Strategy adjustments

## Available Tools:
- search_tweets: Search hashtag usage
- get_trending_topics: Discover trends
- get_user_tweets: Competitor analysis
- SocialData tools: Enhanced trend analysis
- get_tweet: Analyze specific high-performing tweets

${researchType === 'trending' ?
  'Start by getting current trending topics and filtering for ' + industry + ' relevance.' :
  researchType === 'competitive_analysis' ?
  'Start by analyzing tweets from: ' + competitorAccounts :
  'Start by searching and analyzing: ' + hashtagsToTrack}

Deliver comprehensive hashtag strategy with specific recommendations.`;
}

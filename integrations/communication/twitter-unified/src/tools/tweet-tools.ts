/**
 * Tweet Operation Tools - CORRECTED VERSION
 * Schemas match actual source code from reference repositories
 * NO tenantId in schemas (handled by auth context)
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const TWEET_TOOLS: Tool[] = [
  // Based on agent-twitter-client-mcp's send_tweet
  {
    name: 'send_tweet',
    description: 'Send a new tweet to Twitter. Supports text, images, and videos. Max 280 characters.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Tweet text (max 280 characters)',
          maxLength: 280
        },
        replyToTweetId: {
          type: 'string',
          description: 'Optional ID of tweet to reply to'
        },
        media: {
          type: 'array',
          description: 'Media attachments with base64 data and MIME type',
          items: {
            type: 'object',
            properties: {
              data: {
                type: 'string',
                description: 'Base64 encoded media data'
              },
              mediaType: {
                type: 'string',
                description: 'Media MIME type (image/jpeg, image/png, image/gif, video/mp4)'
              }
            },
            required: ['data', 'mediaType']
          }
        }
      },
      required: ['text']
    }
  },

  // Based on mcp-twitter-server's postTweetWithMedia
  {
    name: 'post_tweet_with_media',
    description: 'Post a tweet with media attachment from local file path',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Tweet text (max 280 characters)',
          maxLength: 280
        },
        mediaPath: {
          type: 'string',
          description: 'Local file path to the media to upload'
        },
        mediaType: {
          type: 'string',
          enum: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
          description: 'MIME type of the media file'
        },
        altText: {
          type: 'string',
          description: 'Alternative text for the media (accessibility)'
        }
      },
      required: ['text', 'mediaPath', 'mediaType']
    }
  },

  // Based on agent-twitter-client-mcp's send_tweet_with_poll
  {
    name: 'send_tweet_with_poll',
    description: 'Post a tweet with a poll. Supports 2-4 options with configurable duration.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Tweet text',
          maxLength: 280
        },
        replyToTweetId: {
          type: 'string',
          description: 'Optional ID of tweet to reply to'
        },
        poll: {
          type: 'object',
          properties: {
            options: {
              type: 'array',
              description: 'Poll options (2-4)',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' }
                },
                required: ['label']
              },
              minItems: 2,
              maxItems: 4
            },
            durationMinutes: {
              type: 'number',
              description: 'Poll duration in minutes (default: 1440 = 24 hours)',
              minimum: 5,
              maximum: 10080
            }
          },
          required: ['options']
        }
      },
      required: ['text', 'poll']
    }
  },

  {
    name: 'get_tweet_by_id',
    description: 'Retrieve a specific tweet by its ID with full details including metrics',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'Tweet ID'
        }
      },
      required: ['id']
    }
  },

  // Based on mcp-twitter-server
  {
    name: 'get_tweets_by_ids',
    description: 'Get multiple tweets by their IDs in a single request',
    inputSchema: {
      type: 'object',
      properties: {
        tweetIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tweet IDs to fetch',
          maxItems: 100
        },
        tweetFields: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['created_at', 'author_id', 'conversation_id', 'public_metrics', 'entities', 'context_annotations']
          },
          description: 'Additional tweet fields to include'
        }
      },
      required: ['tweetIds']
    }
  },

  {
    name: 'reply_to_tweet',
    description: 'Reply to an existing tweet',
    inputSchema: {
      type: 'object',
      properties: {
        tweetId: {
          type: 'string',
          description: 'ID of tweet to reply to'
        },
        text: {
          type: 'string',
          description: 'Reply text',
          maxLength: 280
        }
      },
      required: ['tweetId', 'text']
    }
  },

  {
    name: 'delete_tweet',
    description: 'Delete one of your tweets',
    inputSchema: {
      type: 'object',
      properties: {
        tweetId: {
          type: 'string',
          description: 'ID of tweet to delete'
        }
      },
      required: ['tweetId']
    }
  },

  {
    name: 'search_tweets',
    description: 'Search Twitter for tweets matching a query. Note: requires Pro tier ($5,000/month) on Twitter API.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        maxResults: {
          type: 'number',
          description: 'Max results (10-100)',
          minimum: 10,
          maximum: 100
        },
        tweetFields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Fields to include in tweet objects'
        }
      },
      required: ['query']
    }
  },

  // Based on agent-twitter-client-mcp
  {
    name: 'quote_tweet',
    description: 'Quote a tweet with your own commentary',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Your commentary',
          maxLength: 280
        },
        quotedTweetId: {
          type: 'string',
          description: 'ID of tweet to quote'
        },
        media: {
          type: 'array',
          description: 'Optional media attachments',
          items: {
            type: 'object',
            properties: {
              data: { type: 'string' },
              mediaType: { type: 'string' }
            },
            required: ['data', 'mediaType']
          }
        }
      },
      required: ['text', 'quotedTweetId']
    }
  },

  // Based on mcp-twikit
  {
    name: 'get_timeline',
    description: 'Get your home timeline (For You feed)',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of tweets to return (default: 20)',
          minimum: 1,
          maximum: 100
        }
      },
      required: []
    }
  },

  // Based on mcp-twikit
  {
    name: 'get_latest_timeline',
    description: 'Get your home timeline (Following feed)',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of tweets to return (default: 20)',
          minimum: 1,
          maximum: 100
        }
      },
      required: []
    }
  },

  // Based on agent-twitter-client-mcp & mcp-twikit
  {
    name: 'get_user_tweets',
    description: 'Fetch tweets from a specific user',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Twitter username (without @)'
        },
        count: {
          type: 'number',
          description: 'Number of tweets to fetch (1-200)',
          minimum: 1,
          maximum: 200
        },
        tweet_type: {
          type: 'string',
          enum: ['Tweets', 'Replies', 'Media'],
          description: 'Type of tweets to fetch (from mcp-twikit)'
        },
        includeReplies: {
          type: 'boolean',
          description: 'Include replies in results (from agent-twitter-client-mcp)'
        },
        includeRetweets: {
          type: 'boolean',
          description: 'Include retweets in results (from agent-twitter-client-mcp)'
        }
      },
      required: ['username']
    }
  },

  // Based on mcp-twitter-server
  {
    name: 'get_user_timeline',
    description: 'Get tweets from a specific user\'s timeline (by ID)',
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'The username of the user whose timeline to fetch'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of tweets to return (default: 10, max: 100)',
          minimum: 1,
          maximum: 100
        },
        tweetFields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional tweet fields to include'
        }
      },
      required: ['username']
    }
  },

  // SocialData enhanced tools
  {
    name: 'get_full_thread',
    description: 'Reconstruct complete Twitter thread with all tweets and replies (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tweetId: {
          type: 'string',
          description: 'The ID of the tweet to analyze thread for'
        },
        includeMetrics: {
          type: 'boolean',
          description: 'Include engagement metrics for each tweet (default: true)'
        }
      },
      required: ['tweetId']
    }
  },

  {
    name: 'get_conversation_tree',
    description: 'Map complete conversation structure including replies and quotes (requires SocialData API)',
    inputSchema: {
      type: 'object',
      properties: {
        tweetId: {
          type: 'string',
          description: 'The ID of the conversation root tweet'
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum depth of conversation tree (default: 5)',
          minimum: 1,
          maximum: 10
        }
      },
      required: ['tweetId']
    }
  }
];

/**
 * Tweet tool handlers - CORRECTED
 * tenantId now passed as separate parameter (auth context)
 */
export class TweetToolHandlers {
  constructor(private client: TwitterClient) {}

  async sendTweet(args: any, tenantId: string): Promise<any> {
    const { text, replyToTweetId, media } = args;

    const payload: any = { text };

    if (replyToTweetId) {
      payload.reply = { in_reply_to_tweet_id: replyToTweetId };
    }

    if (media && media.length > 0) {
      // TODO: Implement media upload via Twitter API v2 /media/upload endpoint
      // Requires chunked upload for large files
      // For now, throw error with helpful message
      throw new Error(
        'Media upload not yet implemented. To post tweets with media:\n' +
        '1. Use agent-twitter-client-mcp directly, or\n' +
        '2. Upload media separately and pass media_ids\n' +
        'Media upload requires chunked uploading via Twitter API v1.1 /media/upload endpoint.'
      );
    }

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      payload
    );
  }

  async postTweetWithMedia(args: any, tenantId: string): Promise<any> {
    const { text, mediaPath, mediaType, altText } = args;

    // TODO: Implement media upload from file path
    // This requires reading file, chunked upload to Twitter API v1.1
    throw new Error(
      'Media upload from file path not yet implemented. Use send_tweet with base64 media data or agent-twitter-client-mcp directly.'
    );
  }

  async sendTweetWithPoll(args: any, tenantId: string): Promise<any> {
    const { text, replyToTweetId, poll } = args;

    const payload: any = {
      text,
      poll: {
        options: poll.options.map((opt: any) => opt.label),
        duration_minutes: poll.durationMinutes || 1440
      }
    };

    if (replyToTweetId) {
      payload.reply = { in_reply_to_tweet_id: replyToTweetId };
    }

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      payload
    );
  }

  async getTweetById(args: any, tenantId: string): Promise<any> {
    const { id } = args;

    return await this.client.request(
      'GET',
      `/tweets/${id}`,
      tenantId,
      undefined,
      { 'tweet.fields': 'created_at,public_metrics,author_id' }
    );
  }

  async getTweetsByIds(args: any, tenantId: string): Promise<any> {
    const { tweetIds, tweetFields } = args;

    const params: any = {
      ids: tweetIds.join(',')
    };

    if (tweetFields && tweetFields.length > 0) {
      params['tweet.fields'] = tweetFields.join(',');
    }

    return await this.client.request(
      'GET',
      '/tweets',
      tenantId,
      undefined,
      params
    );
  }

  async replyToTweet(args: any, tenantId: string): Promise<any> {
    const { tweetId, text } = args;

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      {
        text,
        reply: { in_reply_to_tweet_id: tweetId }
      }
    );
  }

  async deleteTweet(args: any, tenantId: string): Promise<any> {
    const { tweetId } = args;

    return await this.client.request(
      'DELETE',
      `/tweets/${tweetId}`,
      tenantId
    );
  }

  async searchTweets(args: any, tenantId: string): Promise<any> {
    const { query, maxResults = 10, tweetFields } = args;

    const params: any = {
      query,
      max_results: maxResults
    };

    if (tweetFields && tweetFields.length > 0) {
      params['tweet.fields'] = tweetFields.join(',');
    }

    try {
      return await this.client.request(
        'GET',
        '/tweets/search/recent',
        tenantId,
        undefined,
        params
      );
    } catch (error: any) {
      if (error.status === 403 || error.message?.includes('Pro tier')) {
        return {
          error: 'Pro tier required',
          message: 'This endpoint requires X (Twitter) API Pro tier access ($5,000/month). Visit https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api#v2-access-leve to upgrade your access level.',
          alternativeSolution: 'Use the advancedTweetSearch tool (SocialData API) to bypass this restriction.'
        };
      }
      throw error;
    }
  }

  async quoteTweet(args: any, tenantId: string): Promise<any> {
    const { text, quotedTweetId, media } = args;

    const payload: any = {
      text,
      quote_tweet_id: quotedTweetId
    };

    if (media && media.length > 0) {
      // TODO: Implement media upload via Twitter API v2 /media/upload endpoint
      throw new Error(
        'Media upload not yet implemented. Use agent-twitter-client-mcp for media uploads or upload media separately and pass media_ids.'
      );
    }

    return await this.client.request(
      'POST',
      '/tweets',
      tenantId,
      payload
    );
  }

  async getTimeline(args: any, tenantId: string): Promise<any> {
    const { count = 20 } = args;

    // Get authenticated user ID first
    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'GET',
      `/users/${userId}/timelines/reverse_chronological`,
      tenantId,
      undefined,
      {
        max_results: count,
        'tweet.fields': 'created_at,public_metrics'
      }
    );
  }

  async getLatestTimeline(args: any, tenantId: string): Promise<any> {
    const { count = 20 } = args;

    // This uses a different endpoint for "Following" timeline
    const me = await this.client.request('GET', '/users/me', tenantId);
    const userId = me.data.id;

    return await this.client.request(
      'GET',
      `/users/${userId}/timelines/latest`,
      tenantId,
      undefined,
      {
        max_results: count,
        'tweet.fields': 'created_at,public_metrics'
      }
    );
  }

  async getUserTweets(args: any, tenantId: string): Promise<any> {
    const { username, count = 20, tweet_type, includeReplies, includeRetweets } = args;

    // Look up user by username
    const user = await this.client.request(
      'GET',
      `/users/by/username/${username}`,
      tenantId
    );
    const userId = user.data.id;

    const params: any = {
      max_results: count,
      'tweet.fields': 'created_at,public_metrics'
    };

    // Handle different parameter formats
    if (includeReplies !== undefined) {
      params.exclude = includeReplies ? undefined : 'replies';
    }
    if (includeRetweets !== undefined && !includeRetweets) {
      params.exclude = params.exclude ? `${params.exclude},retweets` : 'retweets';
    }

    return await this.client.request(
      'GET',
      `/users/${userId}/tweets`,
      tenantId,
      undefined,
      params
    );
  }

  async getUserTimeline(args: any, tenantId: string): Promise<any> {
    const { username, maxResults = 10, tweetFields } = args;

    const user = await this.client.request(
      'GET',
      `/users/by/username/${username}`,
      tenantId
    );
    const userId = user.data.id;

    const params: any = {
      max_results: maxResults
    };

    if (tweetFields && tweetFields.length > 0) {
      params['tweet.fields'] = tweetFields.join(',');
    }

    return await this.client.request(
      'GET',
      `/users/${userId}/tweets`,
      tenantId,
      undefined,
      params
    );
  }

  async getFullThread(args: any, tenantId: string): Promise<any> {
    const { tweetId, includeMetrics = true } = args;

    // Use SocialData API
    return await this.client.socialDataRequest(
      'POST',
      '/twitter/thread',
      {
        tweet_id: tweetId,
        include_metrics: includeMetrics
      }
    );
  }

  async getConversationTree(args: any, tenantId: string): Promise<any> {
    const { tweetId, maxDepth = 5 } = args;

    // Use SocialData API
    return await this.client.socialDataRequest(
      'POST',
      '/twitter/conversation-tree',
      {
        tweet_id: tweetId,
        max_depth: maxDepth
      }
    );
  }
}

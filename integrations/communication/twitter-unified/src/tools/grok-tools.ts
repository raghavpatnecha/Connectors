/**
 * Grok AI Integration Tools
 * Based on agent-twitter-client-mcp implementation
 * Requires agent-twitter-client v0.0.19+
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { TwitterClient } from '../clients/twitter-client';

export const GROK_TOOLS: Tool[] = [
  {
    name: 'grok_chat',
    description: 'Chat with Grok AI via Twitter. Grok has access to real-time Twitter data that even the standalone Grok API doesn\'t have. Can analyze trending topics, user sentiment, and Twitter discussions.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to send to Grok'
        },
        conversationId: {
          type: 'string',
          description: 'Optional conversation ID to continue an existing conversation'
        },
        includeWebSearch: {
          type: 'boolean',
          description: 'Whether to include web search results and citations (default: true)'
        }
      },
      required: ['message']
    }
  }
];

/**
 * Grok tool handlers
 */
export class GrokToolHandlers {
  constructor(private client: TwitterClient) {}

  async grokChat(args: any, tenantId: string): Promise<any> {
    const { message, conversationId, includeWebSearch = true } = args;

    // Note: Grok API integration requires Premium subscription and agent-twitter-client library
    // This is a placeholder implementation using Twitter API
    // For full Grok support, use agent-twitter-client-mcp directly

    try {
      const response = await this.client.request(
        'POST',
        '/grok/chat',
        tenantId,
        {
          message,
          conversation_id: conversationId,
          include_web_search: includeWebSearch
        }
      );

      return {
        response: response.data?.text || response.data,
        conversationId: response.data?.conversation_id || conversationId,
        webSearchResults: response.data?.web_search_results || [],
        citations: response.data?.citations || [],
        rateLimitInfo: response.rateLimit
      };
    } catch (error: any) {
      // Handle rate limits
      if (error.message?.includes('Rate Limited') || error.message?.includes('429')) {
        return {
          error: 'Rate limit exceeded',
          message: 'You\'ve reached the Grok message limit. Non-premium accounts: 25 messages per 2 hours. Premium accounts have higher limits.',
          resetTime: error.resetTime
        };
      }

      // Handle authentication issues
      if (error.message?.includes('Premium required') || error.message?.includes('403')) {
        return {
          error: 'Premium subscription required',
          message: 'Grok access requires a Twitter Premium subscription. Visit https://twitter.com/i/premium_sign_up to upgrade.'
        };
      }

      throw error;
    }
  }
}

/**
 * Reddit Unified MCP - Tool Registry Helper
 *
 * Utilities for registering MCP tools with consistent patterns,
 * error handling, and parameter validation.
 *
 * @module utils/tool-registry-helper
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { logger } from './logger';
import { handleToolError } from './error-handler';

export type ToolHandler<TParams = unknown, TResult = unknown> = (
  params: TParams
) => Promise<TResult>;

export interface ToolRegistration<TParams = unknown> {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: ToolHandler<TParams>;
}

/**
 * Register a single tool with the MCP server
 */
export function registerTool<TParams>(
  server: Server,
  registration: ToolRegistration<TParams>
): void {
  logger.info('Registering tool', { name: registration.name });

  // Tool definition
  const toolDef: Tool = {
    name: registration.name,
    description: registration.description,
    inputSchema: registration.inputSchema
  };

  // Store tool definition for ListTools
  if (!server._tools) {
    server._tools = [];
  }
  server._tools.push(toolDef);

  // Store tool handler
  if (!server._toolHandlers) {
    server._toolHandlers = new Map();
  }
  server._toolHandlers.set(registration.name, registration.handler);
}

/**
 * Register multiple tools at once
 */
export function registerTools<TParams>(
  server: Server,
  registrations: ToolRegistration<TParams>[]
): void {
  for (const registration of registrations) {
    registerTool(server, registration);
  }
  logger.info('Registered multiple tools', { count: registrations.length });
}

/**
 * Setup tool handlers for the server
 * Call this after all tools are registered
 */
export function setupToolHandlers(server: Server): void {
  // Handle ListTools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = server._tools || [];
    logger.debug('ListTools called', { count: tools.length });
    return { tools };
  });

  // Handle CallTool request
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info('Tool called', { name, args });

    const handlers = server._toolHandlers as Map<string, ToolHandler>;
    const handler = handlers?.get(name);

    if (!handler) {
      logger.error('Tool not found', { name });
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await handler(args);

      logger.info('Tool execution completed', { name });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } catch (error) {
      handleToolError(error, { tool: name, params: args });
    }
  });

  logger.info('Tool handlers setup complete');
}

/**
 * Helper to create consistent tool schemas
 */
export const ToolSchemas = {
  /**
   * Standard pagination parameters
   */
  pagination: {
    limit: {
      type: 'number',
      description: 'Maximum number of items to return (1-100)',
      minimum: 1,
      maximum: 100,
      default: 25
    },
    after: {
      type: 'string',
      description: 'Pagination cursor for next page'
    },
    before: {
      type: 'string',
      description: 'Pagination cursor for previous page'
    }
  },

  /**
   * Subreddit parameter
   */
  subreddit: {
    type: 'string',
    description: 'Subreddit name (without r/ prefix)',
    pattern: '^[A-Za-z0-9_]+$'
  },

  /**
   * Username parameter
   */
  username: {
    type: 'string',
    description: 'Reddit username (without u/ prefix)',
    pattern: '^[A-Za-z0-9_-]+$'
  },

  /**
   * Post ID parameter
   */
  postId: {
    type: 'string',
    description: 'Reddit post ID (alphanumeric)',
    pattern: '^[a-z0-9]+$'
  },

  /**
   * Time filter parameter
   */
  timeFilter: {
    type: 'string',
    description: 'Time filter for top/controversial posts',
    enum: ['hour', 'day', 'week', 'month', 'year', 'all'],
    default: 'day'
  },

  /**
   * Sort parameter
   */
  sort: {
    type: 'string',
    description: 'Sort order for results',
    enum: ['relevance', 'hot', 'top', 'new', 'comments'],
    default: 'relevance'
  },

  /**
   * Post type parameter
   */
  postType: {
    type: 'string',
    description: 'Type of post to create',
    enum: ['self', 'link', 'image', 'video']
  },

  /**
   * Post title parameter
   */
  title: {
    type: 'string',
    description: 'Post title',
    minLength: 1,
    maxLength: 300
  },

  /**
   * Post text parameter
   */
  text: {
    type: 'string',
    description: 'Post text content (for self posts)'
  },

  /**
   * Post URL parameter
   */
  url: {
    type: 'string',
    description: 'Post URL (for link posts)',
    format: 'uri'
  },

  /**
   * Comment text parameter
   */
  comment: {
    type: 'string',
    description: 'Comment text',
    minLength: 1,
    maxLength: 10000
  },

  /**
   * Thing ID parameter (for comments, votes, etc.)
   */
  thingId: {
    type: 'string',
    description: 'Reddit thing ID (e.g., t3_abc123 for post, t1_xyz789 for comment)',
    pattern: '^t[0-9]_[a-z0-9]+$'
  },

  /**
   * NSFW flag
   */
  nsfw: {
    type: 'boolean',
    description: 'Mark post as NSFW (Not Safe For Work)',
    default: false
  },

  /**
   * Spoiler flag
   */
  spoiler: {
    type: 'boolean',
    description: 'Mark post as spoiler',
    default: false
  },

  /**
   * Tenant ID parameter
   */
  tenantId: {
    type: 'string',
    description: 'Tenant identifier for authentication'
  }
};

/**
 * Zod schema validators for runtime validation
 */
export const ZodSchemas = {
  subreddit: z.string().regex(/^[A-Za-z0-9_]+$/, 'Invalid subreddit name'),
  username: z.string().regex(/^[A-Za-z0-9_-]+$/, 'Invalid username'),
  postId: z.string().regex(/^[a-z0-9]+$/, 'Invalid post ID'),
  thingId: z.string().regex(/^t[0-9]_[a-z0-9]+$/, 'Invalid thing ID'),
  pagination: z.object({
    limit: z.number().min(1).max(100).optional(),
    after: z.string().optional(),
    before: z.string().optional()
  }),
  timeFilter: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).optional(),
  sort: z.enum(['relevance', 'hot', 'top', 'new', 'comments']).optional()
};

/**
 * Format Reddit data for tool responses
 */
export function formatToolResponse<T>(data: T, metadata?: Record<string, unknown>): {
  success: boolean;
  data: T;
  metadata?: Record<string, unknown>;
} {
  return {
    success: true,
    data,
    ...(metadata && { metadata })
  };
}

/**
 * Format error response
 */
export function formatErrorResponse(error: unknown): {
  success: boolean;
  error: string;
  details?: string;
} {
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      details: error.stack
    };
  }

  return {
    success: false,
    error: String(error)
  };
}

/**
 * Validate required authentication
 */
export function requireAuth(tenantId: unknown): asserts tenantId is string {
  if (!tenantId || typeof tenantId !== 'string') {
    throw new Error('Authentication required. Please provide a valid tenant ID.');
  }
}

/**
 * Parse Reddit listing response
 */
export function parseRedditListing<T>(listing: {
  kind: 'Listing';
  data: {
    children: Array<{ data: T }>;
    after: string | null;
    before: string | null;
  };
}): {
  items: T[];
  pagination: {
    after: string | null;
    before: string | null;
    hasMore: boolean;
  };
} {
  return {
    items: listing.data.children.map(child => child.data),
    pagination: {
      after: listing.data.after,
      before: listing.data.before,
      hasMore: !!listing.data.after
    }
  };
}

// Augment Server type to include our custom properties
declare module '@modelcontextprotocol/sdk/server/index.js' {
  interface Server {
    _tools?: Tool[];
    _toolHandlers?: Map<string, ToolHandler>;
  }
}

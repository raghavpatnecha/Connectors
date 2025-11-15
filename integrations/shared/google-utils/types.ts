/**
 * Shared TypeScript types for Google Workspace integrations
 */

/**
 * Common metadata for all Google Workspace resources
 */
export interface GoogleResourceMetadata {
  id: string;
  name?: string;
  createdTime?: string;
  modifiedTime?: string;
  mimeType?: string;
  owners?: Array<{ emailAddress: string; displayName?: string }>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  pageSize?: number;
  pageToken?: string;
  maxResults?: number;
}

/**
 * Pagination response
 */
export interface PaginatedResponse<T> {
  items: T[];
  nextPageToken?: string;
  totalItems?: number;
}

/**
 * Common query filters
 */
export interface QueryFilters {
  createdAfter?: Date;
  createdBefore?: Date;
  modifiedAfter?: Date;
  modifiedBefore?: Date;
  owner?: string;
  searchQuery?: string;
}

/**
 * Tenant context
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
  email?: string;
  scopes?: string[];
}

/**
 * MCP tool result
 */
export interface MCPToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    service: string;
    operation: string;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T = any> {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
}

/**
 * Google API quota info
 */
export interface QuotaInfo {
  service: string;
  limit: number;
  used: number;
  remaining: number;
  resetTime?: Date;
}

/**
 * File sharing settings
 */
export interface SharingSettings {
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'reader' | 'commenter' | 'writer' | 'owner';
  emailAddress?: string;
  domain?: string;
  allowFileDiscovery?: boolean;
}

/**
 * Gmail message metadata
 */
export interface GmailMessageMetadata {
  id: string;
  threadId: string;
  subject?: string;
  from?: string;
  to?: string[];
  cc?: string[];
  date?: string;
  snippet?: string;
  labelIds?: string[];
  hasAttachments?: boolean;
}

/**
 * Calendar event metadata
 */
export interface CalendarEventMetadata {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string; timeZone?: string };
  end?: { dateTime?: string; date?: string; timeZone?: string };
  attendees?: Array<{ email: string; responseStatus?: string }>;
  organizer?: { email: string; displayName?: string };
  location?: string;
  status?: string;
}

/**
 * Drive file metadata
 */
export interface DriveFileMetadata extends GoogleResourceMetadata {
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  starred?: boolean;
  trashed?: boolean;
  shared?: boolean;
  permissions?: Array<{
    id: string;
    type: string;
    role: string;
    emailAddress?: string;
  }>;
  size?: string;
  quotaBytesUsed?: string;
}

/**
 * Spreadsheet metadata
 */
export interface SpreadsheetMetadata extends DriveFileMetadata {
  sheets?: Array<{
    sheetId: number;
    title: string;
    index: number;
    gridProperties?: {
      rowCount: number;
      columnCount: number;
    };
  }>;
  spreadsheetUrl?: string;
}

/**
 * Document metadata
 */
export interface DocumentMetadata extends DriveFileMetadata {
  documentUrl?: string;
  revisionId?: string;
  suggestionsViewMode?: string;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  service: string;
  enabled: boolean;
  rateLimits?: {
    requestsPerSecond: number;
    requestsPerMinute?: number;
    requestsPerDay?: number;
  };
  quotas?: {
    dailyLimit?: number;
    perUserLimit?: number;
  };
  features?: string[];
}

/**
 * OAuth scope requirements
 */
export interface ScopeRequirement {
  service: string;
  operation: string;
  requiredScopes: string[];
  optionalScopes?: string[];
}

/**
 * Webhook/notification configuration
 */
export interface WebhookConfig {
  url: string;
  resourceId: string;
  resourceUri: string;
  token?: string;
  expiration?: number;
  type?: 'web_hook';
  id?: string;
}

/**
 * Activity/audit log entry
 */
export interface ActivityLogEntry {
  timestamp: string;
  tenantId: string;
  service: string;
  operation: string;
  resourceId?: string;
  userId?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastCheck: string;
  details?: Record<string, any>;
}

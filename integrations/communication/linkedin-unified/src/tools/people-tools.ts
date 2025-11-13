/**
 * LinkedIn People & Profile Tools
 *
 * Implements 6 MCP tools for searching and retrieving LinkedIn profile information
 * Uses API-first approach with browser automation fallback via UnifiedClient
 */

import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { UnifiedClient } from '../clients/unified-client';
import { logger } from '../utils/logger';

/**
 * Register all people-related tools with the MCP server
 *
 * @param server - MCP server instance
 * @param getClient - Function to retrieve UnifiedClient for a tenant
 */
export function registerPeopleTools(
  server: Server,
  getClient: (tenantId: string) => UnifiedClient
): void {
  // ============================================================================
  // Tool 1: search-people
  // ============================================================================
  server.tool(
    'search-people',
    'Search LinkedIn profiles with advanced filters. Returns up to 100 results. Supports keywords, location, company, industry filters. Uses API first, falls back to browser if needed.',
    {
      keywords: z.string().optional().describe('Search keywords (name, title, skills)'),
      location: z.string().optional().describe('Location filter (e.g., "San Francisco, CA", "United States")'),
      currentCompany: z.array(z.string()).optional().describe('Filter by current company names'),
      pastCompanies: z.array(z.string()).optional().describe('Filter by past company names'),
      industries: z.array(z.string()).optional().describe('Industry filters (e.g., "Technology", "Finance")'),
      schools: z.array(z.string()).optional().describe('Education institutions'),
      limit: z.number().min(1).max(100).default(20).describe('Maximum results to return (1-100)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('search-people tool called', { tenantId, params });

      try {
        const client = getClient(tenantId);
        const results = await client.searchPeople({
          keywords: params.keywords,
          location: params.location,
          currentCompany: params.currentCompany,
          pastCompany: params.pastCompanies,
          industries: params.industries,
          schools: params.schools,
          count: params.limit || 20
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                results,
                metadata: {
                  count: results.length,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  filters_applied: {
                    keywords: params.keywords || null,
                    location: params.location || null,
                    companies: params.currentCompany?.length || 0,
                    industries: params.industries?.length || 0
                  }
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('search-people tool failed', { error, tenantId, params });
        throw new Error(`Failed to search people: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 2: get-profile-basic
  // ============================================================================
  server.tool(
    'get-profile-basic',
    'Get basic LinkedIn profile information via official API. Fast and efficient for public profile data. Returns name, headline, location, summary.',
    {
      username: z.string().describe('LinkedIn username/publicId (e.g., "williamhgates", "in/williamhgates")'),
      fields: z.array(z.enum([
        'firstName',
        'lastName',
        'headline',
        'location',
        'summary',
        'industryName',
        'publicIdentifier'
      ])).optional().describe('Specific fields to retrieve (default: all)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-profile-basic tool called', { tenantId, username: params.username });

      try {
        const client = getClient(tenantId);
        const profile = await client.getProfileBasic(
          params.username,
          params.fields
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                profile,
                metadata: {
                  username: params.username,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  profile_type: 'basic'
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-profile-basic tool failed', { error, tenantId, username: params.username });
        throw new Error(`Failed to get profile: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 3: get-profile-comprehensive
  // ============================================================================
  server.tool(
    'get-profile-comprehensive',
    'Get comprehensive LinkedIn profile with full work history, education, skills, certifications, and connections. Uses browser scraping for maximum detail. Slower but more complete than basic profile.',
    {
      username: z.string().describe('LinkedIn username/publicId or full profile URL'),
      includeSkills: z.boolean().default(true).describe('Include skills section'),
      includeExperience: z.boolean().default(true).describe('Include work experience'),
      includeEducation: z.boolean().default(true).describe('Include education history'),
      includeCertifications: z.boolean().default(true).describe('Include certifications'),
      includeConnections: z.boolean().default(false).describe('Include connection count and mutual connections')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-profile-comprehensive tool called', { tenantId, username: params.username });

      try {
        const client = getClient(tenantId);
        const profile = await client.getProfileComprehensive(params.username, {
          includeSkills: params.includeSkills,
          includeExperience: params.includeExperience,
          includeEducation: params.includeEducation,
          includeConnections: params.includeConnections
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                profile,
                metadata: {
                  username: params.username,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  profile_type: 'comprehensive',
                  sections_included: {
                    skills: params.includeSkills,
                    experience: params.includeExperience,
                    education: params.includeEducation,
                    certifications: params.includeCertifications,
                    connections: params.includeConnections
                  }
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-profile-comprehensive tool failed', { error, tenantId, username: params.username });
        throw new Error(`Failed to get comprehensive profile: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 4: get-my-profile
  // ============================================================================
  server.tool(
    'get-my-profile',
    'Get the authenticated user\'s own LinkedIn profile. Returns complete profile data for the current user including private information.',
    {
      includePrivateData: z.boolean().default(true).describe('Include private profile data (email, phone)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-my-profile tool called', { tenantId });

      try {
        const client = getClient(tenantId);
        const profile = await client.getMyProfile(params.includePrivateData);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                profile,
                metadata: {
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  profile_type: 'authenticated_user',
                  includes_private_data: params.includePrivateData
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-my-profile tool failed', { error, tenantId });
        throw new Error(`Failed to get user profile: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 5: get-network-stats
  // ============================================================================
  server.tool(
    'get-network-stats',
    'Get network statistics for the authenticated user. Returns connection count, follower count, and network growth metrics.',
    {
      includeGrowthMetrics: z.boolean().default(false).describe('Include historical growth data (requires API with premium access)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-network-stats tool called', { tenantId });

      try {
        const client = getClient(tenantId);
        const stats = await client.getNetworkStats(params.includeGrowthMetrics);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                stats,
                metadata: {
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  includes_growth_metrics: params.includeGrowthMetrics
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-network-stats tool failed', { error, tenantId });
        throw new Error(`Failed to get network stats: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 6: get-connections
  // ============================================================================
  server.tool(
    'get-connections',
    'Get list of LinkedIn connections for the authenticated user. Returns basic profile info for each connection. Paginated results.',
    {
      start: z.number().min(0).default(0).describe('Starting index for pagination'),
      count: z.number().min(1).max(100).default(50).describe('Number of connections to return (1-100)'),
      sortBy: z.enum(['RECENTLY_ADDED', 'FIRST_NAME', 'LAST_NAME']).default('RECENTLY_ADDED').describe('Sort order for connections')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-connections tool called', { tenantId, params });

      try {
        const client = getClient(tenantId);
        const connections = await client.getConnections({
          start: params.start,
          count: params.count,
          sortBy: params.sortBy
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                connections: connections.results,
                pagination: {
                  start: params.start,
                  count: connections.results.length,
                  total: connections.total,
                  hasMore: (params.start + connections.results.length) < connections.total
                },
                metadata: {
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  sort_by: params.sortBy
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-connections tool failed', { error, tenantId, params });
        throw new Error(`Failed to get connections: ${(error as Error).message}`);
      }
    }
  );

  logger.info('Registered 6 people tools');
}

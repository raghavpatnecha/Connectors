/**
 * LinkedIn Company Tools
 *
 * Implements 2 MCP tools for company-related functionality
 * Get company profiles and follow/unfollow companies
 */

import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { UnifiedClient } from '../clients/unified-client';
import { logger } from '../utils/logger';

/**
 * Register all company-related tools with the MCP server
 *
 * @param server - MCP server instance
 * @param getClient - Function to retrieve UnifiedClient for a tenant
 */
export function registerCompanyTools(
  server: Server,
  getClient: (tenantId: string) => UnifiedClient
): void {
  // ============================================================================
  // Tool 1: get-company-profile
  // ============================================================================
  server.tool(
    'get-company-profile',
    'Get detailed LinkedIn company profile information. Returns company overview, employee count, locations, specialties, recent updates, and affiliated companies.',
    {
      companyIdentifier: z.string().describe('Company name, LinkedIn company ID, or company page URL'),
      includeEmployees: z.boolean().default(false).describe('Include sample of employees working at the company'),
      employeeLimit: z.number().min(1).max(50).default(10).describe('Number of employees to include if enabled (1-50)'),
      includeJobPostings: z.boolean().default(false).describe('Include active job postings from the company'),
      jobPostingsLimit: z.number().min(1).max(50).default(10).describe('Number of job postings to include if enabled (1-50)'),
      includeUpdates: z.boolean().default(true).describe('Include recent company posts and updates'),
      updatesLimit: z.number().min(1).max(20).default(5).describe('Number of recent updates to include (1-20)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-company-profile tool called', {
        tenantId,
        companyIdentifier: params.companyIdentifier
      });

      try {
        const client = getClient(tenantId);
        const company = await client.getCompanyProfile({
          companyIdentifier: params.companyIdentifier,
          includeEmployees: params.includeEmployees,
          employeeLimit: params.employeeLimit,
          includeJobPostings: params.includeJobPostings,
          jobPostingsLimit: params.jobPostingsLimit,
          includeUpdates: params.includeUpdates,
          updatesLimit: params.updatesLimit
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                company,
                metadata: {
                  company_identifier: params.companyIdentifier,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  includes: {
                    employees: params.includeEmployees,
                    employee_count: company.employees?.length || 0,
                    job_postings: params.includeJobPostings,
                    job_postings_count: company.jobPostings?.length || 0,
                    updates: params.includeUpdates,
                    updates_count: company.updates?.length || 0
                  },
                  company_stats: {
                    total_employees: company.employeeCount,
                    follower_count: company.followerCount,
                    is_following: company.isFollowing,
                    locations: company.locations?.length || 0
                  }
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-company-profile tool failed', {
          error,
          tenantId,
          companyIdentifier: params.companyIdentifier
        });
        throw new Error(`Failed to get company profile: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 2: follow-company
  // ============================================================================
  server.tool(
    'follow-company',
    'Follow or unfollow a LinkedIn company page. Updates will appear in your feed when following. WARNING: This will perform a real action!',
    {
      companyIdentifier: z.string().describe('Company name, LinkedIn company ID, or company page URL'),
      action: z.enum(['FOLLOW', 'UNFOLLOW']).describe('Whether to follow or unfollow the company'),
      notificationSettings: z.object({
        allUpdates: z.boolean().default(true).describe('Receive notifications for all company updates'),
        jobPostings: z.boolean().default(true).describe('Receive notifications for new job postings'),
        companyNews: z.boolean().default(false).describe('Receive notifications for company news')
      }).optional().describe('Notification preferences when following (only applies to FOLLOW action)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.warn('follow-company tool called - WILL PERFORM REAL ACTION', {
        tenantId,
        companyIdentifier: params.companyIdentifier,
        action: params.action
      });

      try {
        const client = getClient(tenantId);
        const result = await client.followCompany({
          companyIdentifier: params.companyIdentifier,
          action: params.action,
          notificationSettings: params.notificationSettings
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                result,
                metadata: {
                  company_identifier: params.companyIdentifier,
                  action: params.action,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  status: result.status,
                  is_following: result.isFollowing,
                  follower_count: result.newFollowerCount,
                  notification_settings: params.action === 'FOLLOW' ? params.notificationSettings : null
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('follow-company tool failed', {
          error,
          tenantId,
          companyIdentifier: params.companyIdentifier,
          action: params.action
        });
        throw new Error(`Failed to ${params.action.toLowerCase()} company: ${(error as Error).message}`);
      }
    }
  );

  logger.info('Registered 2 company tools');
}

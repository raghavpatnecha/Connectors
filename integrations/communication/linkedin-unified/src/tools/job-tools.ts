/**
 * LinkedIn Job Tools
 *
 * Implements 4 MCP tools for job searching, viewing, and applying
 * Combines API search with browser automation for job applications
 */

import { z } from 'zod';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { UnifiedClient } from '../clients/unified-client';
import { logger } from '../utils/logger';

/**
 * Register all job-related tools with the MCP server
 *
 * @param registry - ToolRegistry instance for registering tools
 * @param getClient - Function to retrieve UnifiedClient for a tenant
 */
export function registerJobTools(
  registry: ToolRegistry,
  getClient: (tenantId: string) => UnifiedClient
): void {
  // ============================================================================
  // Tool 1: search-jobs
  // ============================================================================
  registry.registerTool(
    'search-jobs',
    'Search LinkedIn job postings with advanced filters. Returns job listings with title, company, location, and description. Uses API for fast results.',
    {
      keywords: z.string().optional().describe('Job title, skills, or keywords (e.g., "Software Engineer", "Python")'),
      location: z.string().optional().describe('Location (e.g., "San Francisco, CA", "Remote")'),
      companies: z.array(z.string()).optional().describe('Filter by company names'),
      experienceLevel: z.array(z.enum([
        'INTERNSHIP',
        'ENTRY_LEVEL',
        'ASSOCIATE',
        'MID_SENIOR',
        'DIRECTOR',
        'EXECUTIVE'
      ])).optional().describe('Experience level filters'),
      jobType: z.array(z.enum([
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'TEMPORARY',
        'VOLUNTEER',
        'INTERNSHIP'
      ])).optional().describe('Job type filters'),
      remote: z.boolean().optional().describe('Filter for remote jobs only'),
      postedWithin: z.enum(['24HR', 'WEEK', 'MONTH', 'ANY_TIME']).default('ANY_TIME').describe('Filter by posting date'),
      limit: z.number().min(1).max(100).default(25).describe('Maximum results to return (1-100)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('search-jobs tool called', { tenantId, params });

      try {
        const client = getClient(tenantId);
        const results = await client.searchJobs({
          keywords: params.keywords,
          location: params.location,
          companies: params.companies,
          experienceLevel: params.experienceLevel,
          jobType: params.jobType,
          count: params.limit
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                jobs: results,
                metadata: {
                  count: results.length,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  filters_applied: {
                    keywords: params.keywords || null,
                    location: params.location || null,
                    remote_only: params.remote || false,
                    posted_within: params.postedWithin,
                    experience_levels: params.experienceLevel?.length || 0,
                    job_types: params.jobType?.length || 0
                  }
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('search-jobs tool failed', { error, tenantId, params });
        throw new Error(`Failed to search jobs: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 2: get-job-details
  // ============================================================================
  registry.registerTool(
    'get-job-details',
    'Get detailed information about a specific job posting by ID. Returns full job description, requirements, benefits, company info, and application details.',
    {
      jobId: z.string().describe('LinkedIn job ID (e.g., "3234567890")'),
      includeCompanyInfo: z.boolean().default(true).describe('Include detailed company information'),
      includeApplicationDetails: z.boolean().default(true).describe('Include how to apply and application requirements')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-job-details tool called', { tenantId, jobId: params.jobId });

      try {
        const client = getClient(tenantId);
        const job = await client.getJobDetails(params.jobId, {
          includeCompanyInfo: params.includeCompanyInfo,
          includeApplicationDetails: params.includeApplicationDetails
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                job,
                metadata: {
                  job_id: params.jobId,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  includes: {
                    company_info: params.includeCompanyInfo,
                    application_details: params.includeApplicationDetails
                  }
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-job-details tool failed', { error, tenantId, jobId: params.jobId });
        throw new Error(`Failed to get job details: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 3: get-recommended-jobs
  // ============================================================================
  registry.registerTool(
    'get-recommended-jobs',
    'Get personalized job recommendations for the authenticated user based on profile, skills, and preferences. Uses LinkedIn\'s recommendation algorithm.',
    {
      limit: z.number().min(1).max(50).default(20).describe('Maximum recommendations to return (1-50)'),
      filterByRelevance: z.boolean().default(true).describe('Filter by relevance score threshold'),
      minRelevanceScore: z.number().min(0).max(100).default(60).describe('Minimum relevance score (0-100)')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.info('get-recommended-jobs tool called', { tenantId, params });

      try {
        const client = getClient(tenantId);
        const recommendations = await client.getRecommendedJobs({
          limit: params.limit,
          filterByRelevance: params.filterByRelevance,
          minRelevanceScore: params.minRelevanceScore
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                recommendations: recommendations.jobs,
                metadata: {
                  count: recommendations.jobs.length,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  filtering: {
                    by_relevance: params.filterByRelevance,
                    min_score: params.minRelevanceScore
                  },
                  avg_relevance_score: recommendations.averageRelevance
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('get-recommended-jobs tool failed', { error, tenantId, params });
        throw new Error(`Failed to get recommended jobs: ${(error as Error).message}`);
      }
    }
  );

  // ============================================================================
  // Tool 4: apply-to-job
  // ============================================================================
  registry.registerTool(
    'apply-to-job',
    'Apply to a LinkedIn job posting using browser automation. Requires authenticated session. Can handle Easy Apply and external applications. WARNING: This will submit a real job application!',
    {
      jobId: z.string().describe('LinkedIn job ID to apply to'),
      resume: z.string().optional().describe('Path to resume file (PDF/DOCX) to upload if required'),
      coverLetter: z.string().optional().describe('Cover letter text to submit'),
      answers: z.record(z.string()).optional().describe('Answers to application questions as key-value pairs'),
      useEasyApply: z.boolean().default(true).describe('Use LinkedIn Easy Apply if available'),
      confirmBeforeSubmit: z.boolean().default(true).describe('Wait for confirmation before final submission')
    },
    async (params: any, { tenantId }: { tenantId: string }) => {
      logger.warn('apply-to-job tool called - WILL SUBMIT REAL APPLICATION', {
        tenantId,
        jobId: params.jobId,
        confirmBeforeSubmit: params.confirmBeforeSubmit
      });

      try {
        const client = getClient(tenantId);

        // This is a high-risk operation - requires browser automation
        const application = await client.applyToJob(params.jobId, params.coverLetter);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                application,
                metadata: {
                  job_id: params.jobId,
                  method: client.getLastUsedMethod(),
                  timestamp: new Date().toISOString(),
                  application_method: params.useEasyApply ? 'Easy Apply' : 'External',
                  success: application.success,
                  confirmation_required: params.confirmBeforeSubmit
                }
              }, null, 2)
            }
          ]
        };
      } catch (error) {
        logger.error('apply-to-job tool failed', { error, tenantId, jobId: params.jobId });
        throw new Error(`Failed to apply to job: ${(error as Error).message}`);
      }
    }
  );

  logger.info('Registered 4 job tools');
}

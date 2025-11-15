/**
 * Google Forms MCP - Responses Tools
 * Tools for managing form responses
 */

import { z } from 'zod';
import { forms_v1 } from 'googleapis';
import { ToolRegistry } from '../utils/tool-registry-helper';
import { GoogleClientFactory } from '../../../shared/google-auth/google-client-factory.js';
import { mapGoogleAPIError } from '../../../shared/google-utils/error-mapper';
import { logger } from '../utils/logger';

/**
 * Register all response management tools
 */
export function registerResponseTools(registry: ToolRegistry, clientFactory: GoogleClientFactory): void {
  // List form responses
  registry.registerTool(
    'forms_list_responses',
    'List all responses for a form with pagination support',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      pageSize: z.number().int().min(1).max(5000).optional().describe('Maximum number of responses to return (default: 100)'),
      pageToken: z.string().optional().describe('Token for pagination'),
      filter: z.string().optional().describe('Filter expression for responses')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const params: forms_v1.Params$Resource$Forms$Responses$List = {
          formId: args.formId
        };

        if (args.pageSize) params.pageSize = args.pageSize;
        if (args.pageToken) params.pageToken = args.pageToken;
        if (args.filter) params.filter = args.filter;

        const response = await client.forms.responses.list(params);

        const responses = response.data.responses || [];

        const result = {
          formId: args.formId,
          totalResponses: responses.length,
          responses: responses.map(resp => ({
            responseId: resp.responseId,
            createTime: resp.createTime,
            lastSubmittedTime: resp.lastSubmittedTime,
            respondentEmail: resp.respondentEmail,
            answerCount: Object.keys(resp.answers || {}).length
          })),
          nextPageToken: response.data.nextPageToken
        };

        logger.info('Listed form responses', {
          tenantId: args.tenantId,
          formId: args.formId,
          count: responses.length
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to list form responses', {
          tenantId: args.tenantId,
          formId: args.formId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );

  // Get specific response
  registry.registerTool(
    'forms_get_response',
    'Get detailed information about a specific form response',
    z.object({
      tenantId: z.string().describe('Tenant identifier for multi-tenant auth'),
      formId: z.string().describe('ID of the form'),
      responseId: z.string().describe('ID of the response to retrieve')
    }),
    async (args) => {
      try {
        const client = await clientFactory.getFormsClient(args.tenantId);

        const response = await client.forms.responses.get({
          formId: args.formId,
          responseId: args.responseId
        });

        const resp = response.data;
        const answers = resp.answers || {};

        const answerDetails = Object.entries(answers).map(([questionId, answer]) => {
          const textAnswers = (answer as any).textAnswers?.answers || [];
          return {
            questionId,
            textAnswers: textAnswers.map((a: any) => a.value),
            fileUploadAnswers: (answer as any).fileUploadAnswers,
            grade: (answer as any).grade
          };
        });

        const result = {
          responseId: resp.responseId,
          formId: args.formId,
          createTime: resp.createTime,
          lastSubmittedTime: resp.lastSubmittedTime,
          respondentEmail: resp.respondentEmail,
          totalScore: resp.totalScore,
          answers: answerDetails
        };

        logger.info('Retrieved form response', {
          tenantId: args.tenantId,
          formId: args.formId,
          responseId: args.responseId
        });

        return result;
      } catch (error: any) {
        logger.error('Failed to get form response', {
          tenantId: args.tenantId,
          formId: args.formId,
          responseId: args.responseId,
          error: error.message
        });
        throw mapGoogleAPIError(error, 'forms');
      }
    }
  );
}

/**
 * Workflow Planner Service
 * Connectors Platform - Generates workflow plans and pitfalls for use cases
 */

import { SemanticRouter } from '../routing/semantic-router';
import { logger } from '../logging/logger';
import { ToolSelection } from '../types/routing.types';
import { WorkflowGuidance, ParsedKnownFields } from '../types/workflow.types';
import crypto from 'crypto';

/**
 * WorkflowPlanner generates step-by-step execution plans for AI agents
 *
 * This service:
 * - Analyzes selected tools and use case
 * - Generates validated execution plan
 * - Identifies common pitfalls
 * - Rates difficulty
 */
export class WorkflowPlanner {
  private readonly _semanticRouter: SemanticRouter;

  // Pre-defined workflow templates (will be enhanced with LLM in future)
  private readonly _workflowTemplates: Map<string, WorkflowGuidance>;

  constructor(semanticRouter: SemanticRouter) {
    this._semanticRouter = semanticRouter;
    this._workflowTemplates = new Map();
    this._initializeTemplates();
  }

  /**
   * Generate workflow plan for a use case
   *
   * @param useCase - Use case description
   * @param selectedTools - Tools selected by semantic router
   * @param knownFields - Optional known fields (e.g., "category:productivity")
   * @returns Workflow guidance with plan, pitfalls, difficulty
   */
  async generateWorkflowPlan(
    useCase: string,
    selectedTools: ToolSelection[],
    knownFields?: string
  ): Promise<WorkflowGuidance> {
    const startTime = Date.now();
    logger.debug('Generating workflow plan', { useCase, toolCount: selectedTools.length });

    try {
      // Extract main and related tools
      const mainTools = selectedTools.slice(0, 2);
      const relatedTools = selectedTools.slice(2);

      // Parse known fields
      const parsedFields = this._parseKnownFields(knownFields);

      // Check if we have a template match
      const template = this._findMatchingTemplate(useCase, mainTools);

      if (template) {
        logger.debug('Using template for workflow plan', { useCase });
        return {
          ...template,
          cached_plan_id: this._generatePlanId(useCase)
        };
      }

      // Generate dynamic plan based on tools
      const plan = await this._generateDynamicPlan(useCase, mainTools, relatedTools, parsedFields);

      const duration = Date.now() - startTime;
      logger.info('Workflow plan generated', { useCase, duration });

      return plan;
    } catch (error) {
      logger.error('Failed to generate workflow plan', {
        useCase,
        error: error instanceof Error ? error.message : String(error)
      });

      // Return minimal fallback plan
      return this._getFallbackPlan(selectedTools);
    }
  }

  /**
   * Initialize pre-defined workflow templates
   */
  private _initializeTemplates(): void {
    // YouTube trending videos template
    this._workflowTemplates.set('youtube_trending', {
      guidance: 'CRITICAL: Follow the validated plan below. Extract steps BEFORE execution, adapt to your current context, execute sequentially with current_step parameter, and check pitfalls to avoid errors.',
      validated_plan: [
        'Discover candidates via YOUTUBE_SEARCH_YOU_TUBE using topic/region/time filters; paginate with nextPageToken, cap pages to manage quota, dedupe video IDs, and record the query window in UTC.',
        'Enrich candidates via YOUTUBE_GET_VIDEO_DETAILS_BATCH (chunks ≤50); normalize timestamps to UTC, drop invalid IDs, parallelize within quota, and cache interim results per run.',
        'Rank for trending by velocity (views/time) and recency; break ties with engagement rate and comments; optionally weight by channel baselines via YOUTUBE_GET_CHANNEL_STATISTICS (cache per-channel).',
        'Strengthen recency: enumerate latest uploads via YOUTUBE_LIST_CHANNEL_VIDEOS; if sparse or access-limited, sample YOUTUBE_GET_CHANNEL_ACTIVITIES; merge cohorts and re-rank.',
        'If input includes channel handles, resolve to IDs via YOUTUBE_GET_CHANNEL_ID_BY_HANDLE; then use YOUTUBE_LIST_CHANNEL_VIDEOS and YOUTUBE_GET_VIDEO_DETAILS_BATCH to enrich and include in ranking.',
        'Optionally expand from popular playlists via YOUTUBE_LIST_PLAYLIST_ITEMS; route IDs through YOUTUBE_GET_VIDEO_DETAILS_BATCH and re-rank against the main cohort.',
        'Verify and output: spot-check anomalies via YOUTUBE_VIDEO_DETAILS, retry singles on transient failures, ensure valid IDs, and present results with UTC timestamps, clickable links, and source notes.'
      ],
      pitfalls: [
        'YOUTUBE_SEARCH_YOU_TUBE returns max 50 results/page (≈100 quota units/call); use nextPageToken and cap pages to stay under ~10,000 daily units.',
        'YOUTUBE_GET_VIDEO_DETAILS_BATCH rejects >50 IDs and can return 400 invalidParameter for mixed invalid IDs; chunk ≤50, drop invalids, retry singles via YOUTUBE_VIDEO_DETAILS.',
        'YOUTUBE_GET_CHANNEL_ACTIVITIES is sparse/noisy; on 403 quotaExceeded or 404 notFound, switch to YOUTUBE_LIST_CHANNEL_VIDEOS; throttle <10 calls/sec with exponential backoff.',
        'YOUTUBE_GET_CHANNEL_STATISTICS may lag; cache per run and avoid redundant fetches for the same channel ID to conserve quota.'
      ],
      difficulty: 'medium',
      main_tool_slugs: ['YOUTUBE_SEARCH_YOU_TUBE', 'YOUTUBE_GET_VIDEO_DETAILS_BATCH'],
      related_tool_slugs: [
        'YOUTUBE_VIDEO_DETAILS',
        'YOUTUBE_GET_CHANNEL_STATISTICS',
        'YOUTUBE_GET_CHANNEL_ACTIVITIES',
        'YOUTUBE_LIST_CHANNEL_VIDEOS',
        'YOUTUBE_GET_CHANNEL_ID_BY_HANDLE',
        'YOUTUBE_LIST_PLAYLIST_ITEMS'
      ],
      toolkits: ['youtube']
    });

    // Notion page/database creation template
    this._workflowTemplates.set('notion_create', {
      guidance: 'CRITICAL: Follow the validated plan below. Extract steps BEFORE execution, adapt to your current context, execute sequentially with current_step parameter, and check pitfalls to avoid errors.',
      validated_plan: [
        'Preflight: collect title/content/desired parent; locate/confirm parent via NOTION_SEARCH_NOTION_PAGE. For database parents, validate required properties with NOTION_QUERY_DATABASE; if a new database is explicitly needed and absent, create via NOTION_CREATE_DATABASE. If an existing page is found (e.g., matching title), prefer update/append over duplicate creation.',
        'Create entity: if parent is a page, use NOTION_CREATE_NOTION_PAGE; if parent is a database, use NOTION_INSERT_ROW_DATABASE with required properties (use UTC for date/time fields). Skip creation when updating an existing page.',
        'Add body content: batch blocks via NOTION_ADD_MULTIPLE_PAGE_CONTENT (preserve order, chunk to 100). For complex/nested/unsupported blocks or partial failures, fallback to NOTION_APPEND_BLOCK_CHILDREN.',
        'Post-update: refine title/properties/relations (tags, status, dates) using NOTION_UPDATE_PAGE to align with user intent and database schema.',
        'Verify: fetch contents via NOTION_FETCH_ALL_BLOCK_CONTENTS for a full read; for very long pages use NOTION_FETCH_BLOCK_CONTENTS and iterate next_cursor sequentially. Return a summary and a link.',
        'Recover: on 429 back off honoring Retry-After; on 400 validation_error fix property mapping or shrink batches; if parent missing or 404/permission issues, re-run search, request explicit IDs, or revalidate access.'
      ],
      pitfalls: [
        'NOTION_ADD_MULTIPLE_PAGE_CONTENT max 100 children per call; chunk and preserve order. Mixed unsupported blocks can fail the entire batch.',
        'Global rate limit ~3 requests/second; expect HTTP 429 with Retry-After. Pace writes and pagination accordingly.',
        'NOTION_FETCH_BLOCK_CONTENTS returns up to 100 blocks; iterate next_cursor sequentially. NOTION_FETCH_ALL_BLOCK_CONTENTS can be heavy for long pages.',
        'NOTION_QUERY_DATABASE names/types must match exactly; NOTION_INSERT_ROW_DATABASE returns 400 validation_error if required fields (including \'title\') are missing or mismatched. Ensure exact IDs/names for select/multi-select.'
      ],
      difficulty: 'easy',
      main_tool_slugs: ['NOTION_SEARCH_NOTION_PAGE', 'NOTION_CREATE_NOTION_PAGE', 'NOTION_ADD_MULTIPLE_PAGE_CONTENT', 'NOTION_INSERT_ROW_DATABASE'],
      related_tool_slugs: [
        'NOTION_FETCH_BLOCK_CONTENTS',
        'NOTION_FETCH_ALL_BLOCK_CONTENTS',
        'NOTION_UPDATE_PAGE',
        'NOTION_APPEND_BLOCK_CHILDREN',
        'NOTION_QUERY_DATABASE',
        'NOTION_CREATE_DATABASE'
      ],
      toolkits: ['notion']
    });

    // GitHub PR creation template
    this._workflowTemplates.set('github_pr', {
      guidance: 'CRITICAL: Follow the validated plan below to create a GitHub pull request safely and efficiently.',
      validated_plan: [
        'Verify repository access and branch existence using repository and branch query tools.',
        'Create pull request using GITHUB_CREATE_PULL_REQUEST with required parameters: repo, title, head branch, base branch.',
        'Optionally add reviewers, assignees, and labels using respective GitHub tools.',
        'Verify PR creation and retrieve PR URL for user confirmation.'
      ],
      pitfalls: [
        'Ensure head and base branches exist before creating PR to avoid 404 errors.',
        'Repository must be accessible with current OAuth token scope.',
        'Rate limits apply - GitHub allows 5000 requests/hour for authenticated users.',
        'Draft PRs may have different validation requirements than regular PRs.'
      ],
      difficulty: 'easy',
      main_tool_slugs: ['github.createPullRequest', 'github.listBranches'],
      related_tool_slugs: ['github.addReviewers', 'github.addLabels', 'github.getPullRequest'],
      toolkits: ['github']
    });
  }

  /**
   * Find matching template based on use case and tools
   *
   * MEDIUM FIX: Enhanced template matching with tool validation
   */
  private _findMatchingTemplate(
    useCase: string,
    mainTools: ToolSelection[]
  ): WorkflowGuidance | null {
    const lowerUseCase = useCase.toLowerCase();
    const toolIds = mainTools.map(t => t.toolId.toLowerCase());
    const toolCategories = mainTools.map(t => t.category.toLowerCase());

    // YouTube trending - check both keywords AND tools
    if (
      (lowerUseCase.includes('youtube') || lowerUseCase.includes('video')) &&
      (lowerUseCase.includes('trending') || lowerUseCase.includes('popular') || lowerUseCase.includes('search')) &&
      (toolIds.some(id => id.includes('youtube')) || toolCategories.includes('youtube'))
    ) {
      logger.debug('Matched YouTube trending template', { useCase, tools: toolIds });
      return this._workflowTemplates.get('youtube_trending') || null;
    }

    // Notion creation - check both keywords AND tools
    if (
      (lowerUseCase.includes('notion') || lowerUseCase.includes('page') || lowerUseCase.includes('database')) &&
      (lowerUseCase.includes('create') || lowerUseCase.includes('add')) &&
      (toolIds.some(id => id.includes('notion')) || toolCategories.includes('notion'))
    ) {
      logger.debug('Matched Notion create template', { useCase, tools: toolIds });
      return this._workflowTemplates.get('notion_create') || null;
    }

    // GitHub PR - check both keywords AND tools
    if (
      (lowerUseCase.includes('github') || lowerUseCase.includes('pull request') || lowerUseCase.includes('pr')) &&
      (lowerUseCase.includes('create') || lowerUseCase.includes('open')) &&
      (toolIds.some(id => id.includes('github')) || toolCategories.includes('github'))
    ) {
      logger.debug('Matched GitHub PR template', { useCase, tools: toolIds });
      return this._workflowTemplates.get('github_pr') || null;
    }

    logger.debug('No template match found, using dynamic plan', { useCase, tools: toolIds });
    return null;
  }

  /**
   * Generate dynamic plan based on tools
   */
  private async _generateDynamicPlan(
    useCase: string,
    mainTools: ToolSelection[],
    relatedTools: ToolSelection[],
    parsedFields: ParsedKnownFields
  ): Promise<WorkflowGuidance> {
    // Basic plan generation based on tool names
    const validatedPlan: string[] = [];
    const pitfalls: string[] = [];

    // Extract primary action from use case
    const hasSearch = useCase.toLowerCase().includes('search') || useCase.toLowerCase().includes('find');
    const hasCreate = useCase.toLowerCase().includes('create') || useCase.toLowerCase().includes('add');
    const hasUpdate = useCase.toLowerCase().includes('update') || useCase.toLowerCase().includes('edit');

    if (hasSearch) {
      validatedPlan.push(
        `Search using ${mainTools[0]?.name || 'primary tool'} with appropriate filters and parameters.`,
        'Process and filter results based on relevance and requirements.',
        'Verify results and handle pagination if needed.'
      );
      pitfalls.push(
        'Be aware of rate limits when paginating through large result sets.',
        'Validate search parameters to avoid API errors.'
      );
    } else if (hasCreate) {
      validatedPlan.push(
        `Validate all required parameters before creation.`,
        `Create resource using ${mainTools[0]?.name || 'primary tool'}.`,
        'Verify creation success and retrieve resource identifier.'
      );
      pitfalls.push(
        'Ensure all required fields are provided to avoid validation errors.',
        'Check for existing resources to avoid duplicates.'
      );
    } else if (hasUpdate) {
      validatedPlan.push(
        'Retrieve existing resource to verify it exists.',
        `Update resource using ${mainTools[0]?.name || 'primary tool'} with modified fields.`,
        'Verify update success and check updated values.'
      );
      pitfalls.push(
        'Ensure resource exists before attempting update.',
        'Be cautious with partial updates to avoid data loss.'
      );
    } else {
      validatedPlan.push(
        `Execute workflow using ${mainTools[0]?.name || 'primary tool'}.`,
        'Verify operation success and handle any errors.',
        'Return results to user with appropriate formatting.'
      );
      pitfalls.push(
        'Check API documentation for specific parameter requirements.',
        'Handle rate limits and authentication errors appropriately.'
      );
    }

    // Determine difficulty
    const difficulty = this._calculateDifficulty(mainTools.length, relatedTools.length, useCase);

    return {
      guidance: 'Follow the plan below and check pitfalls to avoid common errors.',
      validated_plan: validatedPlan,
      pitfalls,
      difficulty,
      main_tool_slugs: mainTools.map(t => t.toolId),
      related_tool_slugs: relatedTools.map(t => t.toolId),
      toolkits: [...new Set(mainTools.map(t => t.category))],
      cached_plan_id: this._generatePlanId(useCase)
    };
  }

  /**
   * Calculate workflow difficulty
   */
  private _calculateDifficulty(
    mainToolCount: number,
    relatedToolCount: number,
    useCase: string
  ): 'easy' | 'medium' | 'hard' {
    const totalTools = mainToolCount + relatedToolCount;

    // Check for complexity indicators in use case
    const complexityIndicators = [
      'multiple',
      'batch',
      'complex',
      'advanced',
      'conditional',
      'workflow'
    ];

    const hasComplexity = complexityIndicators.some(indicator =>
      useCase.toLowerCase().includes(indicator)
    );

    if (totalTools <= 2 && !hasComplexity) {
      return 'easy';
    } else if (totalTools <= 5 || hasComplexity) {
      return 'medium';
    } else {
      return 'hard';
    }
  }

  /**
   * Get fallback plan when template matching fails
   */
  private _getFallbackPlan(selectedTools: ToolSelection[]): WorkflowGuidance {
    return {
      guidance: 'Generic workflow guidance - follow best practices for the selected tools.',
      validated_plan: [
        'Review tool documentation and required parameters.',
        'Execute tools in logical sequence based on dependencies.',
        'Verify each step before proceeding to the next.',
        'Handle errors gracefully and provide clear feedback.'
      ],
      pitfalls: [
        'Check authentication and authorization requirements.',
        'Be aware of rate limits and quota restrictions.',
        'Validate all input parameters before API calls.',
        'Handle pagination for large result sets.'
      ],
      difficulty: 'medium',
      main_tool_slugs: selectedTools.slice(0, 2).map(t => t.toolId),
      related_tool_slugs: selectedTools.slice(2).map(t => t.toolId),
      toolkits: [...new Set(selectedTools.map(t => t.category))],
      cached_plan_id: this._generatePlanId('fallback')
    };
  }

  /**
   * Parse known fields string
   */
  private _parseKnownFields(knownFields?: string): ParsedKnownFields {
    if (!knownFields) {
      return {};
    }

    const parsed: ParsedKnownFields = {};
    const pairs = knownFields.split(',').map(s => s.trim());

    for (const pair of pairs) {
      const [key, value] = pair.split(':').map(s => s.trim());
      if (key && value) {
        // Try to parse as number
        const numValue = parseInt(value, 10);
        parsed[key] = isNaN(numValue) ? value : numValue;
      }
    }

    return parsed;
  }

  /**
   * Generate unique plan ID
   */
  private _generatePlanId(useCase: string): string {
    return crypto
      .createHash('md5')
      .update(useCase + Date.now())
      .digest('hex')
      .substring(0, 16);
  }
}

/**
 * Auto-refresh scheduler for OAuth tokens
 * Connectors Platform - Automatic token refresh before expiry
 */

import { EventEmitter } from 'events';
import { createLogger } from 'winston';
import { VaultClient } from './vault-client';
import { OAuthCredentials, RefreshJob, OAuthTokenResponse } from './types';
import { TokenRefreshError } from '../errors/oauth-errors';

const logger = createLogger({
  defaultMeta: { service: 'refresh-scheduler' }
});

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes before expiry
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
const MAX_RETRY_ATTEMPTS = 3;

/**
 * OAuth refresh callback function
 * Implementations should call the OAuth provider's refresh endpoint
 */
export type RefreshCallback = (
  tenantId: string,
  integration: string,
  refreshToken: string
) => Promise<OAuthTokenResponse>;

/**
 * RefreshScheduler automatically refreshes OAuth tokens before expiry
 *
 * Features:
 * - Schedules refresh 5 minutes before token expiry
 * - Automatic retry with exponential backoff
 * - Event emission for monitoring
 * - Graceful error handling
 */
export class RefreshScheduler extends EventEmitter {
  private readonly _vault: VaultClient;
  private readonly _refreshCallback: RefreshCallback;
  private readonly _jobs: Map<string, RefreshJob>;
  private _intervalId: NodeJS.Timeout | null = null;
  private _isRunning: boolean = false;

  constructor(vault: VaultClient, refreshCallback: RefreshCallback) {
    super();
    this._vault = vault;
    this._refreshCallback = refreshCallback;
    this._jobs = new Map();
  }

  /**
   * Start the scheduler
   * Begins periodic checking for tokens that need refresh
   */
  start(): void {
    if (this._isRunning) {
      logger.warn('RefreshScheduler already running');
      return;
    }

    this._isRunning = true;
    this._intervalId = setInterval(() => {
      this._processJobs().catch(error => {
        logger.error('Error processing refresh jobs', {
          error: error instanceof Error ? error.message : String(error)
        });
      });
    }, CHECK_INTERVAL_MS);

    logger.info('RefreshScheduler started', {
      checkInterval: CHECK_INTERVAL_MS,
      refreshBuffer: REFRESH_BUFFER_MS
    });

    // Emit started event
    this.emit('started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this._isRunning) {
      return;
    }

    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    this._isRunning = false;
    logger.info('RefreshScheduler stopped');

    // Emit stopped event
    this.emit('stopped');
  }

  /**
   * Schedule a refresh for OAuth credentials
   * Typically called when credentials are first stored
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @param expiresAt - Token expiration time
   */
  scheduleRefresh(tenantId: string, integration: string, expiresAt: Date): void {
    const refreshTime = new Date(expiresAt.getTime() - REFRESH_BUFFER_MS);
    const jobId = this._buildJobId(tenantId, integration);

    // Don't schedule if token already expired or expires very soon
    if (refreshTime.getTime() <= Date.now()) {
      logger.warn('Token expiry too soon, triggering immediate refresh', {
        tenantId,
        integration,
        expiresAt
      });
      this._executeRefresh(tenantId, integration, 0).catch(error => {
        logger.error('Immediate refresh failed', {
          tenantId,
          integration,
          error: error instanceof Error ? error.message : String(error)
        });
      });
      return;
    }

    const job: RefreshJob = {
      id: jobId,
      tenantId,
      integration,
      runAt: refreshTime,
      retryCount: 0,
      status: 'pending'
    };

    this._jobs.set(jobId, job);

    logger.info('Scheduled OAuth token refresh', {
      tenantId,
      integration,
      runAt: refreshTime,
      expiresAt
    });

    // Emit scheduled event
    this.emit('refresh-scheduled', { tenantId, integration, runAt: refreshTime });
  }

  /**
   * Cancel a scheduled refresh
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   */
  cancelRefresh(tenantId: string, integration: string): void {
    const jobId = this._buildJobId(tenantId, integration);

    if (this._jobs.delete(jobId)) {
      logger.info('Cancelled refresh job', { tenantId, integration });
      this.emit('refresh-cancelled', { tenantId, integration });
    }
  }

  /**
   * Get status of all refresh jobs
   *
   * @returns Array of all jobs
   */
  getJobs(): RefreshJob[] {
    return Array.from(this._jobs.values());
  }

  /**
   * Get status of a specific job
   *
   * @param tenantId - Tenant identifier
   * @param integration - Integration name
   * @returns Job status or null if not found
   */
  getJob(tenantId: string, integration: string): RefreshJob | null {
    const jobId = this._buildJobId(tenantId, integration);
    return this._jobs.get(jobId) || null;
  }

  /**
   * Process all pending jobs
   * Checks which jobs need to run and executes them
   */
  private async _processJobs(): Promise<void> {
    const now = Date.now();
    const jobsToRun: RefreshJob[] = [];

    // Find jobs that need to run
    for (const job of this._jobs.values()) {
      if (job.status === 'pending' && job.runAt.getTime() <= now) {
        jobsToRun.push(job);
      }
    }

    if (jobsToRun.length === 0) {
      return;
    }

    logger.debug('Processing refresh jobs', { count: jobsToRun.length });

    // Execute jobs concurrently
    await Promise.all(
      jobsToRun.map(job =>
        this._executeRefresh(job.tenantId, job.integration, job.retryCount)
      )
    );
  }

  /**
   * Execute a refresh for a specific credential
   */
  private async _executeRefresh(
    tenantId: string,
    integration: string,
    retryCount: number
  ): Promise<void> {
    const jobId = this._buildJobId(tenantId, integration);
    const job = this._jobs.get(jobId);

    if (job) {
      job.status = 'running';
    }

    try {
      // Get current credentials
      const currentCreds = await this._vault.getCredentials(tenantId, integration);

      logger.info('Refreshing OAuth token', {
        tenantId,
        integration,
        retryCount,
        expiresAt: currentCreds.expiresAt
      });

      // Call refresh callback
      const tokenResponse = await this._refreshCallback(
        tenantId,
        integration,
        currentCreds.refreshToken
      );

      // Calculate new expiration
      const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

      // Create new credentials
      const newCreds: OAuthCredentials = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || currentCreds.refreshToken,
        expiresAt,
        scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : currentCreds.scopes,
        tokenType: tokenResponse.token_type,
        integration
      };

      // Store refreshed credentials
      await this._vault.storeCredentials(tenantId, integration, newCreds);

      // Schedule next refresh
      this.scheduleRefresh(tenantId, integration, expiresAt);

      // Update job status
      if (job) {
        job.status = 'completed';
        this._jobs.delete(jobId);
      }

      logger.info('OAuth token refreshed successfully', {
        tenantId,
        integration,
        newExpiresAt: expiresAt
      });

      // Emit success event
      this.emit('refresh-success', { tenantId, integration, expiresAt });
    } catch (error) {
      logger.error('OAuth token refresh failed', {
        tenantId,
        integration,
        retryCount,
        error: error instanceof Error ? error.message : String(error)
      });

      // Retry logic
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        const nextRunAt = new Date(Date.now() + delay);

        if (job) {
          job.retryCount = retryCount + 1;
          job.runAt = nextRunAt;
          job.status = 'pending';
        }

        logger.info('Scheduling refresh retry', {
          tenantId,
          integration,
          retryCount: retryCount + 1,
          nextRunAt
        });

        // Emit retry event
        this.emit('refresh-retry', {
          tenantId,
          integration,
          retryCount: retryCount + 1,
          nextRunAt
        });
      } else {
        // Max retries exceeded
        if (job) {
          job.status = 'failed';
          this._jobs.delete(jobId);
        }

        logger.error('OAuth token refresh failed after max retries', {
          tenantId,
          integration,
          maxRetries: MAX_RETRY_ATTEMPTS
        });

        // Emit failure event
        this.emit('refresh-failed', {
          tenantId,
          integration,
          error: error instanceof Error ? error.message : String(error)
        });

        throw new TokenRefreshError(
          `Failed to refresh OAuth token after ${MAX_RETRY_ATTEMPTS} attempts`,
          integration,
          tenantId,
          false,
          error instanceof Error ? error : undefined
        );
      }
    }
  }

  /**
   * Build unique job ID
   */
  private _buildJobId(tenantId: string, integration: string): string {
    return `${tenantId}:${integration}`;
  }
}

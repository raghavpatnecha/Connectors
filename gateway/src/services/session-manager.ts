/**
 * Session Manager Service
 * Connectors Platform - Manages workflow session IDs and tracking
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logging/logger';
import { SessionConfig } from '../types/workflow.types';

/**
 * SessionManager handles workflow session tracking
 *
 * This service:
 * - Generates unique session IDs
 * - Validates existing session IDs
 * - Provides session instructions for workflow correlation
 */
export class SessionManager {
  /**
   * Handle session configuration and return session info
   *
   * @param config - Session configuration
   * @returns Session information with ID and instructions
   */
  async handleSession(config: SessionConfig): Promise<{
    id: string;
    generated?: boolean;
    instructions?: string;
  }> {
    try {
      // If explicit ID provided, validate and use it
      if (config.id) {
        // MEDIUM FIX: Validate session ID format before use
        if (!this.validateSessionId(config.id)) {
          logger.error('Invalid session ID format', { sessionId: config.id });
          throw new Error(
            `Invalid session ID format. Expected UUID v4, got: ${config.id.substring(0, 20)}...`
          );
        }

        logger.debug('Using existing session ID', { sessionId: config.id });

        return {
          id: config.id,
          generated: false,
          instructions: `Use session_id "${config.id}" in subsequent tool invocations for workflow correlation`
        };
      }

      // If generate_id requested, create new UUID
      if (config.generate_id) {
        const sessionId = this._generateSessionId();

        logger.debug('Generated new session ID', { sessionId });

        return {
          id: sessionId,
          generated: true,
          instructions: `REQUIRED: Pass session_id "${sessionId}" in ALL subsequent tool calls for this workflow. This ensures consistent workflow execution and proper correlation between tool calls.`
        };
      }

      // No session requested
      logger.warn('Session config provided but no ID or generate_id flag');

      return {
        id: this._generateSessionId(),
        generated: true,
        instructions: 'Session ID auto-generated'
      };
    } catch (error) {
      logger.error('Failed to handle session', {
        config,
        error: error instanceof Error ? error.message : String(error)
      });

      // Fallback: generate new session
      const fallbackId = this._generateSessionId();
      return {
        id: fallbackId,
        generated: true,
        instructions: 'Session ID generated (fallback)'
      };
    }
  }

  /**
   * Generate a new session ID
   */
  private _generateSessionId(): string {
    return uuidv4();
  }

  /**
   * Validate session ID format
   */
  validateSessionId(sessionId: string): boolean {
    // UUID v4 format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(sessionId);
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test session generation
      const testId = this._generateSessionId();
      return this.validateSessionId(testId);
    } catch (error) {
      logger.error('Session manager health check failed', { error });
      return false;
    }
  }
}

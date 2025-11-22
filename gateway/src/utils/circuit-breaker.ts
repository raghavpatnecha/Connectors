/**
 * Circuit Breaker pattern implementation
 * Prevents cascading failures by failing fast when a service is unhealthy
 *
 * States:
 * - CLOSED: Normal operation, all requests go through
 * - OPEN: Service is failing, requests fail immediately
 * - HALF_OPEN: Testing if service has recovered
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  /**
   * Number of consecutive failures before opening the circuit
   * Default: 5
   */
  failureThreshold?: number;

  /**
   * Number of successful requests needed to close the circuit from HALF_OPEN
   * Default: 2
   */
  successThreshold?: number;

  /**
   * Time in milliseconds to wait before attempting recovery (HALF_OPEN)
   * Default: 60000 (1 minute)
   */
  resetTimeout?: number;

  /**
   * Time window in milliseconds for counting failures
   * Default: 10000 (10 seconds)
   */
  windowDuration?: number;

  /**
   * Custom error handler
   */
  onOpen?: () => void;
  onClose?: () => void;
  onHalfOpen?: () => void;
}

export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly state: CircuitState,
    public readonly failures: number
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * CircuitBreaker protects services from cascading failures
 *
 * Usage:
 * ```typescript
 * const breaker = new CircuitBreaker({ failureThreshold: 5 });
 *
 * try {
 *   const result = await breaker.execute(() => callExternalService());
 * } catch (error) {
 *   if (error instanceof CircuitBreakerError) {
 *     // Circuit is open, fail fast
 *   }
 * }
 * ```
 */
export class CircuitBreaker {
  private _state: CircuitState = CircuitState.CLOSED;
  private _failureCount: number = 0;
  private _successCount: number = 0;
  private _lastFailureTime: number = 0;
  private _nextAttemptTime: number = 0;

  private readonly _failureThreshold: number;
  private readonly _successThreshold: number;
  private readonly _resetTimeout: number;
  private readonly _windowDuration: number;
  private readonly _onOpen?: () => void;
  private readonly _onClose?: () => void;
  private readonly _onHalfOpen?: () => void;

  constructor(options: CircuitBreakerOptions = {}) {
    this._failureThreshold = options.failureThreshold || 5;
    this._successThreshold = options.successThreshold || 2;
    this._resetTimeout = options.resetTimeout || 60000; // 1 minute
    this._windowDuration = options.windowDuration || 10000; // 10 seconds
    this._onOpen = options.onOpen;
    this._onClose = options.onClose;
    this._onHalfOpen = options.onHalfOpen;
  }

  /**
   * Execute a function with circuit breaker protection
   *
   * @param fn - Async function to execute
   * @returns Result of the function
   * @throws CircuitBreakerError if circuit is open
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit should transition states
    this._checkState();

    // If circuit is OPEN, fail fast
    if (this._state === CircuitState.OPEN) {
      throw new CircuitBreakerError(
        'Circuit breaker is OPEN - service is unavailable',
        this._state,
        this._failureCount
      );
    }

    try {
      const result = await fn();

      // Success - record it
      this._onSuccess();

      return result;
    } catch (error) {
      // Failure - record it
      this._onFailure();

      // Re-throw the original error
      throw error;
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitState {
    this._checkState();
    return this._state;
  }

  /**
   * Get current failure count
   */
  getFailureCount(): number {
    return this._failureCount;
  }

  /**
   * Get current success count (only relevant in HALF_OPEN state)
   */
  getSuccessCount(): number {
    return this._successCount;
  }

  /**
   * Manually reset the circuit breaker
   * WARNING: Only use for testing or manual recovery
   */
  reset(): void {
    this._state = CircuitState.CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._lastFailureTime = 0;
    this._nextAttemptTime = 0;
  }

  /**
   * Check if state should transition based on time and conditions
   */
  private _checkState(): void {
    const now = Date.now();

    // Check if we should reset failure count due to time window
    if (this._state === CircuitState.CLOSED && this._lastFailureTime > 0) {
      if (now - this._lastFailureTime > this._windowDuration) {
        // Window expired, reset failure count
        this._failureCount = 0;
        this._lastFailureTime = 0;
      }
    }

    // Check if we should transition from OPEN to HALF_OPEN
    if (this._state === CircuitState.OPEN && now >= this._nextAttemptTime) {
      this._transitionToHalfOpen();
    }
  }

  /**
   * Record a successful execution
   */
  private _onSuccess(): void {
    if (this._state === CircuitState.HALF_OPEN) {
      this._successCount++;

      // Check if we have enough successes to close the circuit
      if (this._successCount >= this._successThreshold) {
        this._transitionToClosed();
      }
    } else if (this._state === CircuitState.CLOSED) {
      // Reset failure count on success
      this._failureCount = 0;
      this._lastFailureTime = 0;
    }
  }

  /**
   * Record a failed execution
   */
  private _onFailure(): void {
    const now = Date.now();
    this._lastFailureTime = now;

    if (this._state === CircuitState.HALF_OPEN) {
      // Failure in HALF_OPEN immediately reopens the circuit
      this._transitionToOpen();
    } else if (this._state === CircuitState.CLOSED) {
      this._failureCount++;

      // Check if we've exceeded the failure threshold
      if (this._failureCount >= this._failureThreshold) {
        this._transitionToOpen();
      }
    }
  }

  /**
   * Transition to OPEN state
   */
  private _transitionToOpen(): void {
    this._state = CircuitState.OPEN;
    this._nextAttemptTime = Date.now() + this._resetTimeout;
    this._successCount = 0;

    if (this._onOpen) {
      this._onOpen();
    }
  }

  /**
   * Transition to HALF_OPEN state
   */
  private _transitionToHalfOpen(): void {
    this._state = CircuitState.HALF_OPEN;
    this._successCount = 0;
    this._failureCount = 0;

    if (this._onHalfOpen) {
      this._onHalfOpen();
    }
  }

  /**
   * Transition to CLOSED state
   */
  private _transitionToClosed(): void {
    this._state = CircuitState.CLOSED;
    this._failureCount = 0;
    this._successCount = 0;
    this._lastFailureTime = 0;
    this._nextAttemptTime = 0;

    if (this._onClose) {
      this._onClose();
    }
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): {
    state: CircuitState;
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
  } {
    return {
      state: this._state,
      failureCount: this._failureCount,
      successCount: this._successCount,
      lastFailureTime: this._lastFailureTime,
      nextAttemptTime: this._nextAttemptTime
    };
  }
}

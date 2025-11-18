/**
 * Port Allocator for STDIO HTTP Servers
 *
 * Manages port allocation for dynamically deployed MCP servers.
 * Tracks used ports and allocates available ones from a range.
 */

import { logger } from '../logging/logger';
import { PortAllocationError } from '../errors/stdio-errors';

const DEFAULT_PORT_RANGE_START = 10000;
const DEFAULT_PORT_RANGE_END = 20000;

/**
 * Port allocator singleton
 */
export class PortAllocator {
  private static _instance: PortAllocator | null = null;
  private readonly _usedPorts = new Set<number>();
  private readonly _portRangeStart: number;
  private readonly _portRangeEnd: number;
  private _nextPort: number;

  private constructor(
    portRangeStart: number = DEFAULT_PORT_RANGE_START,
    portRangeEnd: number = DEFAULT_PORT_RANGE_END
  ) {
    this._portRangeStart = portRangeStart;
    this._portRangeEnd = portRangeEnd;
    this._nextPort = portRangeStart;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): PortAllocator {
    if (!PortAllocator._instance) {
      PortAllocator._instance = new PortAllocator();
    }
    return PortAllocator._instance;
  }

  /**
   * Allocate an available port
   */
  allocate(): number {
    // Try to find an available port
    let attempts = 0;
    const maxAttempts = this._portRangeEnd - this._portRangeStart;

    while (attempts < maxAttempts) {
      const port = this._nextPort;

      // Increment for next allocation
      this._nextPort++;
      if (this._nextPort > this._portRangeEnd) {
        this._nextPort = this._portRangeStart;
      }

      // Check if port is available
      if (!this._usedPorts.has(port)) {
        this._usedPorts.add(port);
        logger.debug('Port allocated', { port });
        return port;
      }

      attempts++;
    }

    throw new PortAllocationError('No available ports in range');
  }

  /**
   * Release a port
   */
  release(port: number): void {
    if (this._usedPorts.has(port)) {
      this._usedPorts.delete(port);
      logger.debug('Port released', { port });
    }
  }

  /**
   * Check if port is allocated
   */
  isAllocated(port: number): boolean {
    return this._usedPorts.has(port);
  }

  /**
   * Get number of allocated ports
   */
  getAllocatedCount(): number {
    return this._usedPorts.size;
  }

  /**
   * Reset allocator (for testing)
   */
  reset(): void {
    this._usedPorts.clear();
    this._nextPort = this._portRangeStart;
    logger.debug('Port allocator reset');
  }
}

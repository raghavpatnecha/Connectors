/**
 * Simple async mutex implementation for concurrency control
 * Prevents race conditions in concurrent operations
 */

export class Mutex {
  private _queue: Array<() => void> = [];
  private _locked: boolean = false;

  /**
   * Acquire the lock
   * Waits if the lock is already held
   */
  async acquire(): Promise<() => void> {
    const unlock = () => {
      this._locked = false;
      const next = this._queue.shift();
      if (next) {
        this._locked = true;
        next();
      }
    };

    return new Promise<() => void>((resolve) => {
      if (!this._locked) {
        this._locked = true;
        resolve(unlock);
      } else {
        this._queue.push(() => resolve(unlock));
      }
    });
  }

  /**
   * Run a function with the lock held
   * Automatically releases the lock when done
   *
   * @param fn - Async function to execute with lock
   * @returns Result of the function
   */
  async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const unlock = await this.acquire();
    try {
      return await fn();
    } finally {
      unlock();
    }
  }

  /**
   * Check if the mutex is currently locked
   */
  isLocked(): boolean {
    return this._locked;
  }

  /**
   * Get the number of waiters in the queue
   */
  getQueueLength(): number {
    return this._queue.length;
  }
}

/**
 * MutexMap manages multiple mutexes by key
 * Useful for per-resource locking (e.g., per tenant:integration)
 */
export class MutexMap<K = string> {
  private _mutexes: Map<K, Mutex> = new Map();

  /**
   * Get or create a mutex for a given key
   *
   * @param key - Key to identify the mutex
   * @returns Mutex instance
   */
  private _getMutex(key: K): Mutex {
    let mutex = this._mutexes.get(key);
    if (!mutex) {
      mutex = new Mutex();
      this._mutexes.set(key, mutex);
    }
    return mutex;
  }

  /**
   * Run a function exclusively for a given key
   * Other operations with the same key will wait
   *
   * @param key - Key to lock on
   * @param fn - Async function to execute
   * @returns Result of the function
   */
  async runExclusive<T>(key: K, fn: () => Promise<T>): Promise<T> {
    const mutex = this._getMutex(key);
    return mutex.runExclusive(fn);
  }

  /**
   * Check if a key is currently locked
   *
   * @param key - Key to check
   * @returns True if locked
   */
  isLocked(key: K): boolean {
    const mutex = this._mutexes.get(key);
    return mutex ? mutex.isLocked() : false;
  }

  /**
   * Clean up unused mutexes
   * Removes mutexes that are not locked and have no waiters
   */
  cleanup(): void {
    for (const [key, mutex] of this._mutexes.entries()) {
      if (!mutex.isLocked() && mutex.getQueueLength() === 0) {
        this._mutexes.delete(key);
      }
    }
  }

  /**
   * Get the number of active mutexes
   */
  size(): number {
    return this._mutexes.size;
  }

  /**
   * Clear all mutexes
   * WARNING: Only use when no operations are in progress
   */
  clear(): void {
    this._mutexes.clear();
  }
}

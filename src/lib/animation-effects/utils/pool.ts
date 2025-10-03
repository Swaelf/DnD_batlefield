/**
 * Object pooling utilities for performance optimization
 *
 * Provides object pools to reduce garbage collection overhead
 * by reusing objects instead of creating new ones
 */

// ============================================================================
// Generic Object Pool
// ============================================================================

/**
 * Factory function for creating pooled objects
 */
export type PoolFactory<T> = () => T;

/**
 * Reset function for recycling pooled objects
 */
export type PoolReset<T> = (obj: T) => void;

/**
 * Generic object pool implementation
 */
export class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private factory: PoolFactory<T>;
  private reset: PoolReset<T>;
  private maxSize: number;

  /**
   * Create a new object pool
   *
   * @param factory - Function to create new objects
   * @param reset - Function to reset objects for reuse
   * @param initialSize - Initial pool size (default: 10)
   * @param maxSize - Maximum pool size (default: 100)
   */
  constructor(
    factory: PoolFactory<T>,
    reset: PoolReset<T>,
    initialSize = 10,
    maxSize = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;

    // Pre-allocate initial objects
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  /**
   * Acquire an object from the pool
   *
   * @returns Object from pool (creates new if pool is empty)
   */
  acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }

    this.inUse.add(obj);
    return obj;
  }

  /**
   * Release an object back to the pool
   *
   * @param obj - Object to release
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not acquired from pool');
      return;
    }

    this.inUse.delete(obj);
    this.reset(obj);

    // Only add back to pool if under max size
    if (this.available.length < this.maxSize) {
      this.available.push(obj);
    }
  }

  /**
   * Release multiple objects at once
   *
   * @param objects - Objects to release
   */
  releaseAll(objects: T[]): void {
    objects.forEach(obj => this.release(obj));
  }

  /**
   * Get pool statistics
   *
   * @returns Pool statistics
   */
  getStats(): { available: number; inUse: number; total: number } {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.available = [];
    this.inUse.clear();
  }
}

// ============================================================================
// Specialized Pools
// ============================================================================

/**
 * Pool for Point objects
 */
export interface PooledPoint {
  x: number;
  y: number;
}

export const pointPool = new ObjectPool<PooledPoint>(
  () => ({ x: 0, y: 0 }),
  point => {
    point.x = 0;
    point.y = 0;
  },
  50,
  200
);

/**
 * Pool for array objects
 */
export function createArrayPool<T>(initialSize = 10, maxSize = 100): ObjectPool<T[]> {
  return new ObjectPool<T[]>(
    () => [],
    arr => {
      arr.length = 0;
    },
    initialSize,
    maxSize
  );
}

/**
 * Pool manager for managing multiple pools
 */
export class PoolManager {
  private pools = new Map<string, ObjectPool<unknown>>();

  /**
   * Register a new pool
   *
   * @param name - Pool identifier
   * @param pool - Object pool instance
   */
  register<T>(name: string, pool: ObjectPool<T>): void {
    this.pools.set(name, pool as ObjectPool<unknown>);
  }

  /**
   * Get a registered pool
   *
   * @param name - Pool identifier
   * @returns Object pool instance
   */
  get<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name) as ObjectPool<T> | undefined;
  }

  /**
   * Get statistics for all pools
   *
   * @returns Map of pool names to statistics
   */
  getAllStats(): Map<string, { available: number; inUse: number; total: number }> {
    const stats = new Map<string, { available: number; inUse: number; total: number }>();
    this.pools.forEach((pool, name) => {
      stats.set(name, pool.getStats());
    });
    return stats;
  }

  /**
   * Clear all pools
   */
  clearAll(): void {
    this.pools.forEach(pool => pool.clear());
  }
}

/**
 * Global pool manager instance
 */
export const globalPoolManager = new PoolManager();

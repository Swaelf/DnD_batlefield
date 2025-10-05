/**
 * Linear motion path generator
 *
 * Provides straight-line movement from point A to point B with various utility functions
 * for distance calculation and direction determination.
 */

import { Point } from '@/types';
import { distance as calculateDistance, angleBetween, toRadians } from '../utils/math';

/**
 * Motion path generator function type
 * Takes progress (0-1) and returns current position
 */
export type MotionPathGenerator = (progress: number) => Point;

/**
 * Configuration for linear motion
 */
export interface LinearMotionConfig {
  /** Speed in pixels per second (overrides duration if provided) */
  speed?: number;
}

/**
 * Create a linear motion path generator
 *
 * Generates straight-line movement from start to end point using linear interpolation.
 * This is the simplest and most performant motion path.
 *
 * @param from - Starting position
 * @param to - Ending position
 * @param config - Optional configuration
 * @returns Function that takes progress (0-1) and returns current position
 *
 * @example
 * const move = createLinearMotion({ x: 0, y: 0 }, { x: 100, y: 100 });
 * const position = move(0.5); // { x: 50, y: 50 }
 */
export function createLinearMotion(
  from: Point,
  to: Point,
  _config?: LinearMotionConfig
): MotionPathGenerator {
  // Pre-calculate values for performance
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  return (progress: number): Point => {
    // Clamp progress to [0, 1]
    const t = Math.max(0, Math.min(1, progress));

    return {
      x: from.x + dx * t,
      y: from.y + dy * t,
    };
  };
}

/**
 * Calculate distance between two points
 *
 * Useful for determining animation duration based on distance and speed.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @returns Distance in pixels
 *
 * @example
 * const dist = getLinearDistance({ x: 0, y: 0 }, { x: 3, y: 4 });
 * console.log(dist); // 5
 */
export function getLinearDistance(from: Point, to: Point): number {
  return calculateDistance(from, to);
}

/**
 * Calculate direction angle between two points
 *
 * Returns the angle in radians from the starting point to the ending point.
 * Useful for orienting objects along their movement path.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @returns Angle in radians (0 to 2π)
 *
 * @example
 * const angle = getLinearDirection({ x: 0, y: 0 }, { x: 1, y: 0 });
 * console.log(angle); // 0 (pointing right)
 */
export function getLinearDirection(from: Point, to: Point): number {
  const degrees = angleBetween(from, to);
  return toRadians(degrees);
}

/**
 * Legacy function for backward compatibility
 *
 * @deprecated Use createLinearMotion instead
 */
export function generateLinearPath(start: Point, end: Point, progress: number): Point {
  const generator = createLinearMotion(start, end);
  return generator(progress);
}

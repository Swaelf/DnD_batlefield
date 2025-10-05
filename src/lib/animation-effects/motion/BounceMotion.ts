/**
 * Bounce motion path generator
 *
 * Provides physics-based bouncing movement with gravity simulation.
 * Useful for projectiles, dropping objects, and bouncing ball effects.
 */

import { Point } from '@/types';
import { lerp } from '../utils/math';

/**
 * Motion path generator function type
 */
export type MotionPathGenerator = (progress: number) => Point;

/**
 * Configuration for bounce motion
 */
export interface BounceMotionConfig {
  /** Gravity strength (pixels per second squared) */
  gravity?: number;
  /** Bounce decay factor (0-1, lower = faster decay) */
  decay?: number;
}

/**
 * Create a bouncing motion path
 *
 * Simulates physics-based bouncing with gravity and energy decay.
 * Each bounce is progressively smaller based on the decay factor.
 *
 * @param from - Starting point
 * @param to - Ending point (ground level)
 * @param bounceHeight - Initial bounce height in pixels
 * @param bounces - Number of bounces (default: 3)
 * @returns Function that generates bounce path points
 *
 * @example
 * // Ball drops and bounces 3 times
 * const bounce = createBounce(
 *   { x: 0, y: 0 },
 *   { x: 100, y: 200 },
 *   80, // 80px initial height
 *   3   // 3 bounces
 * );
 */
export function createBounce(
  from: Point,
  to: Point,
  bounceHeight: number,
  bounces: number = 3
): MotionPathGenerator {
  // Pre-calculate bounce segments
  const segments = Math.max(1, Math.floor(bounces));
  const segmentProgress = 1 / (segments + 1);

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));

    // Linear horizontal movement
    const x = lerp(from.x, to.x, t);

    // Calculate which bounce segment we're in
    const currentSegment = Math.floor(t / segmentProgress);
    const segmentT = (t % segmentProgress) / segmentProgress;

    // Calculate bounce height for this segment
    const currentHeight = calculateBounceHeight(bounceHeight, currentSegment);

    // Parabolic trajectory within segment (0 at start, peak at 0.5, 0 at end)
    const parabola = 4 * segmentT * (1 - segmentT); // Peaks at 1 when t=0.5
    const y = lerp(from.y, to.y, t) - currentHeight * parabola;

    return { x, y };
  };
}

/**
 * Calculate bounce height for a specific bounce index
 *
 * Uses exponential decay to reduce bounce height over time.
 *
 * @param initialHeight - Starting bounce height
 * @param bounceIndex - Index of current bounce (0-based)
 * @param decay - Decay factor (0-1, default: 0.6)
 * @returns Height for this bounce
 *
 * @example
 * const h0 = calculateBounceHeight(100, 0); // 100
 * const h1 = calculateBounceHeight(100, 1); // 60
 * const h2 = calculateBounceHeight(100, 2); // 36
 */
export function calculateBounceHeight(
  initialHeight: number,
  bounceIndex: number,
  decay: number = 0.6
): number {
  const clampedDecay = Math.max(0, Math.min(1, decay));
  return initialHeight * Math.pow(clampedDecay, bounceIndex);
}

/**
 * Create a simple gravity drop motion path
 *
 * Object falls from start to end with accelerating velocity.
 * No bouncing, just a parabolic fall.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @param config - Optional gravity configuration
 * @returns Function that generates drop path points
 *
 * @example
 * // Object drops from top to bottom with acceleration
 * const drop = createGravityDrop({ x: 50, y: 0 }, { x: 50, y: 200 });
 */
export function createGravityDrop(
  from: Point,
  to: Point,
  _config?: BounceMotionConfig
): MotionPathGenerator {
  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));

    // Quadratic easing for acceleration effect
    const acceleration = t * t;

    return {
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, acceleration),
    };
  };
}

/**
 * Create a projectile arc with gravity
 *
 * Simulates a thrown projectile with initial velocity and gravity.
 * Different from simple arc - this uses physics-based calculation.
 *
 * @param from - Starting point
 * @param to - Landing point
 * @param initialVelocityY - Initial vertical velocity (negative = upward)
 * @param gravity - Gravity constant (default: 9.8)
 * @returns Function that generates projectile path points
 *
 * @example
 * // Lob projectile in high arc
 * const projectile = createProjectileArc(
 *   { x: 0, y: 100 },
 *   { x: 200, y: 100 },
 *   -100 // Strong upward velocity
 * );
 */
export function createProjectileArc(
  from: Point,
  to: Point,
  initialVelocityY: number,
  gravity: number = 9.8
): MotionPathGenerator {
  const horizontalDistance = to.x - from.x;
  const verticalDistance = to.y - from.y;

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));

    // Linear horizontal movement
    const x = from.x + horizontalDistance * t;

    // Physics-based vertical movement
    // y = y0 + v0*t + 0.5*g*t^2
    const normalizedTime = t;
    const y =
      from.y +
      initialVelocityY * normalizedTime +
      0.5 * gravity * normalizedTime * normalizedTime +
      verticalDistance * t;

    return { x, y };
  };
}

/**
 * Legacy function for backward compatibility
 *
 * @deprecated Use createBounce instead
 */
export function generateBouncePath(
  start: Point,
  end: Point,
  bounces: number,
  height: number,
  _damping: number,
  progress: number
): Point {
  const generator = createBounce(start, end, height * 100, bounces);
  return generator(progress);
}

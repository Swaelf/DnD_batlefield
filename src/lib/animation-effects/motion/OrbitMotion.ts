/**
 * Orbit motion path generator
 *
 * Provides circular and elliptical orbital movement patterns.
 * Useful for spell effects, orbital strikes, and circular movement.
 */

import { Point } from '@/types';
import { toRadians, lerp } from '../utils/math';

/**
 * Motion path generator function type
 */
export type MotionPathGenerator = (progress: number) => Point;

/**
 * Configuration for orbit motion
 */
export interface OrbitMotionConfig {
  /** Whether to move clockwise (default: false = counter-clockwise) */
  clockwise?: boolean;
}

/**
 * Create a circular orbit motion path
 *
 * Generates circular movement around a center point. Perfect for orbital
 * strikes, circling effects, and rotating objects.
 *
 * @param center - Center point of orbit
 * @param radius - Orbit radius in pixels
 * @param startAngle - Starting angle in degrees (0 = right, 90 = down)
 * @param endAngle - Ending angle in degrees
 * @returns Function that generates orbit path points
 *
 * @example
 * // Full circle orbit starting from right
 * const orbit = createOrbit({ x: 100, y: 100 }, 50, 0, 360);
 * const position = orbit(0.25); // Quarter way around (top)
 *
 * @example
 * // Half circle from top to bottom
 * const arc = createOrbit({ x: 100, y: 100 }, 50, 270, 90);
 */
export function createOrbit(
  center: Point,
  radius: number,
  startAngle: number = 0,
  endAngle: number = 360
): MotionPathGenerator {
  // Convert to radians and normalize angles
  const startRad = toRadians(startAngle);
  const endRad = toRadians(endAngle);

  // Calculate angle delta (handle wraparound)
  let angleDelta = endRad - startRad;
  if (endAngle < startAngle) {
    angleDelta += 2 * Math.PI;
  }

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));
    const currentAngle = startRad + angleDelta * t;

    return {
      x: center.x + radius * Math.cos(currentAngle),
      y: center.y + radius * Math.sin(currentAngle),
    };
  };
}

/**
 * Create an elliptical orbit motion path
 *
 * Similar to circular orbit but with independent X and Y radii.
 * Useful for creating oval or stretched circular patterns.
 *
 * @param center - Center point of orbit
 * @param radiusX - Horizontal radius in pixels
 * @param radiusY - Vertical radius in pixels
 * @param startAngle - Starting angle in degrees (default: 0)
 * @param endAngle - Ending angle in degrees (default: 360)
 * @returns Function that generates elliptical orbit path points
 *
 * @example
 * // Horizontal ellipse (wider than tall)
 * const orbit = createEllipticalOrbit({ x: 100, y: 100 }, 80, 40);
 *
 * @example
 * // Vertical ellipse (taller than wide)
 * const orbit = createEllipticalOrbit({ x: 100, y: 100 }, 40, 80);
 */
export function createEllipticalOrbit(
  center: Point,
  radiusX: number,
  radiusY: number,
  startAngle: number = 0,
  endAngle: number = 360
): MotionPathGenerator {
  const startRad = toRadians(startAngle);
  const endRad = toRadians(endAngle);

  let angleDelta = endRad - startRad;
  if (endAngle < startAngle) {
    angleDelta += 2 * Math.PI;
  }

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));
    const currentAngle = startRad + angleDelta * t;

    return {
      x: center.x + radiusX * Math.cos(currentAngle),
      y: center.y + radiusY * Math.sin(currentAngle),
    };
  };
}

/**
 * Create a spiral motion path
 *
 * Combines orbital movement with increasing/decreasing radius.
 * Useful for vortex effects, spiraling projectiles, and gathering/dispersing effects.
 *
 * @param center - Center point of spiral
 * @param startRadius - Initial radius in pixels
 * @param endRadius - Final radius in pixels
 * @param rotations - Number of full rotations (can be fractional)
 * @param clockwise - Direction of rotation (default: false)
 * @returns Function that generates spiral path points
 *
 * @example
 * // Expanding spiral outward
 * const spiral = createSpiral({ x: 100, y: 100 }, 10, 50, 3);
 *
 * @example
 * // Contracting spiral inward
 * const vortex = createSpiral({ x: 100, y: 100 }, 50, 10, 2, true);
 */
export function createSpiral(
  center: Point,
  startRadius: number,
  endRadius: number,
  rotations: number,
  clockwise: boolean = false
): MotionPathGenerator {
  const totalAngle = rotations * 2 * Math.PI;
  const angleMultiplier = clockwise ? -1 : 1;

  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));
    const currentAngle = totalAngle * t * angleMultiplier;
    const currentRadius = lerp(startRadius, endRadius, t);

    return {
      x: center.x + currentRadius * Math.cos(currentAngle),
      y: center.y + currentRadius * Math.sin(currentAngle),
    };
  };
}

/**
 * Calculate point on circle at specific angle
 *
 * Utility function for calculating positions on circular paths.
 *
 * @param center - Center of circle
 * @param radius - Circle radius
 * @param angleDegrees - Angle in degrees
 * @returns Point on circle at specified angle
 *
 * @example
 * const topPoint = getPointOnCircle({ x: 100, y: 100 }, 50, 270);
 */
export function getPointOnCircle(center: Point, radius: number, angleDegrees: number): Point {
  const angleRad = toRadians(angleDegrees);
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y + radius * Math.sin(angleRad),
  };
}

/**
 * Legacy function for backward compatibility
 *
 * @deprecated Use createOrbit instead
 */
export function generateOrbitPath(
  center: Point,
  radius: number,
  startAngle: number,
  endAngle: number,
  progress: number
): Point {
  const generator = createOrbit(center, radius, startAngle, endAngle);
  return generator(progress);
}

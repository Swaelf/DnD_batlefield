/**
 * Curved motion path generator
 *
 * Provides arc and bezier curve movement patterns for smooth, natural-looking trajectories.
 * Supports quadratic and cubic bezier curves, as well as simple arc paths.
 */

import { Point } from '@/types';
import { quadraticBezier, cubicBezier, lerpPoint } from '../utils/math';

/**
 * Motion path generator function type
 */
export type MotionPathGenerator = (progress: number) => Point;

/**
 * Configuration for curved motion
 */
export interface CurvedMotionConfig {
  /** Tension of the curve (0-1, affects control point placement) */
  tension?: number;
}

/**
 * Arc direction for simple arc paths
 */
export type ArcDirection = 'up' | 'down';

/**
 * Create a quadratic bezier curve motion path
 *
 * Quadratic bezier uses one control point to create a smooth curve.
 * This is simpler and more performant than cubic bezier.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @param control - Control point that shapes the curve
 * @returns Function that generates curved path points
 *
 * @example
 * const curve = createQuadraticCurve(
 *   { x: 0, y: 0 },
 *   { x: 100, y: 0 },
 *   { x: 50, y: -50 } // Control point creates upward arc
 * );
 * const position = curve(0.5); // Midpoint of curve
 */
export function createQuadraticCurve(
  from: Point,
  to: Point,
  control: Point
): MotionPathGenerator {
  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));
    return quadraticBezier(from, control, to, t);
  };
}

/**
 * Create a cubic bezier curve motion path
 *
 * Cubic bezier uses two control points for more complex curves.
 * Provides greater control over curve shape at the cost of performance.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @param control1 - First control point (affects start of curve)
 * @param control2 - Second control point (affects end of curve)
 * @returns Function that generates curved path points
 *
 * @example
 * const curve = createCubicCurve(
 *   { x: 0, y: 0 },
 *   { x: 100, y: 0 },
 *   { x: 25, y: -50 },
 *   { x: 75, y: -50 }
 * );
 */
export function createCubicCurve(
  from: Point,
  to: Point,
  control1: Point,
  control2: Point
): MotionPathGenerator {
  return (progress: number): Point => {
    const t = Math.max(0, Math.min(1, progress));
    return cubicBezier(from, control1, control2, to, t);
  };
}

/**
 * Create a simple arc motion path
 *
 * Creates a parabolic arc using a single height parameter.
 * This is the most common curved motion pattern for projectiles and jumps.
 *
 * @param from - Starting point
 * @param to - Ending point
 * @param height - Arc height in pixels (positive = arc above, negative = arc below)
 * @param direction - Direction of arc ('up' or 'down')
 * @returns Function that generates arc path points
 *
 * @example
 * // Create upward arc with 50px height
 * const arc = createArc({ x: 0, y: 0 }, { x: 100, y: 0 }, 50, 'up');
 * const peak = arc(0.5); // Highest point of arc
 */
export function createArc(
  from: Point,
  to: Point,
  height: number,
  direction: ArcDirection = 'up'
): MotionPathGenerator {
  // Calculate control point for arc
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  const arcHeight = direction === 'up' ? -Math.abs(height) : Math.abs(height);
  const controlPoint: Point = {
    x: midX,
    y: midY + arcHeight,
  };

  // Use quadratic bezier with calculated control point
  return createQuadraticCurve(from, to, controlPoint);
}

/**
 * Calculate automatic control point for smooth curve through three points
 *
 * Useful for creating smooth paths through waypoints.
 *
 * @param prev - Previous point
 * @param current - Current point
 * @param next - Next point
 * @param tension - Curve tension (0 = straight, 1 = very curved)
 * @returns Control point for smooth curve
 */
export function calculateControlPoint(
  prev: Point,
  current: Point,
  next: Point,
  tension: number = 0.5
): Point {
  const t = Math.max(0, Math.min(1, tension));

  // Calculate direction vectors
  const dx = next.x - prev.x;
  const dy = next.y - prev.y;

  // Control point offset from current point
  return {
    x: current.x + dx * t * 0.25,
    y: current.y + dy * t * 0.25,
  };
}

/**
 * Legacy function for backward compatibility
 *
 * @deprecated Use createQuadraticCurve or createCubicCurve instead
 */
export function generateCurvedPath(
  start: Point,
  end: Point,
  controlPoints: Point[],
  progress: number
): Point {
  if (controlPoints.length === 0) {
    return lerpPoint(start, end, progress);
  }

  if (controlPoints.length === 1) {
    const generator = createQuadraticCurve(start, end, controlPoints[0]);
    return generator(progress);
  }

  const generator = createCubicCurve(start, end, controlPoints[0], controlPoints[1]);
  return generator(progress);
}

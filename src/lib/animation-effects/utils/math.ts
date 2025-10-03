/**
 * Mathematical utilities for animation calculations
 *
 * Provides utility functions for:
 * - Interpolation
 * - Vector mathematics
 * - Distance calculations
 * - Angle calculations
 */

import { Point } from '@/types';

// ============================================================================
// Interpolation Functions
// ============================================================================

/**
 * Linear interpolation between two values
 *
 * @param start - Starting value
 * @param end - Ending value
 * @param progress - Progress (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

/**
 * Linear interpolation between two points
 *
 * @param start - Starting point
 * @param end - Ending point
 * @param progress - Progress (0-1)
 * @returns Interpolated point
 */
export function lerpPoint(start: Point, end: Point, progress: number): Point {
  return {
    x: lerp(start.x, end.x, progress),
    y: lerp(start.y, end.y, progress),
  };
}

/**
 * Cubic bezier interpolation
 *
 * @param p0 - Start point
 * @param p1 - First control point
 * @param p2 - Second control point
 * @param p3 - End point
 * @param t - Progress (0-1)
 * @returns Interpolated point
 */
export function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
  };
}

/**
 * Quadratic bezier interpolation
 *
 * @param p0 - Start point
 * @param p1 - Control point
 * @param p2 - End point
 * @param t - Progress (0-1)
 * @returns Interpolated point
 */
export function quadraticBezier(p0: Point, p1: Point, p2: Point, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x: mt2 * p0.x + 2 * mt * t * p1.x + t2 * p2.x,
    y: mt2 * p0.y + 2 * mt * t * p1.y + t2 * p2.y,
  };
}

// ============================================================================
// Vector Mathematics
// ============================================================================

/**
 * Calculate distance between two points
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance in pixels
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points in degrees
 *
 * @param from - Starting point
 * @param to - Ending point
 * @returns Angle in degrees (0-360)
 */
export function angleBetween(from: Point, to: Point): number {
  const radians = Math.atan2(to.y - from.y, to.x - from.x);
  const degrees = radians * (180 / Math.PI);
  return degrees < 0 ? degrees + 360 : degrees;
}

/**
 * Normalize a vector to unit length
 *
 * @param vector - Vector to normalize
 * @returns Normalized vector
 */
export function normalize(vector: Point): Point {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length === 0) return { x: 0, y: 0 };
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

/**
 * Calculate dot product of two vectors
 *
 * @param v1 - First vector
 * @param v2 - Second vector
 * @returns Dot product
 */
export function dotProduct(v1: Point, v2: Point): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Calculate cross product of two vectors (z component)
 *
 * @param v1 - First vector
 * @param v2 - Second vector
 * @returns Cross product z component
 */
export function crossProduct(v1: Point, v2: Point): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Rotate a point around an origin
 *
 * @param point - Point to rotate
 * @param origin - Origin point
 * @param degrees - Rotation in degrees
 * @returns Rotated point
 */
export function rotatePoint(point: Point, origin: Point, degrees: number): Point {
  const radians = degrees * (Math.PI / 180);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const dx = point.x - origin.x;
  const dy = point.y - origin.y;

  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos,
  };
}

/**
 * Scale a point relative to an origin
 *
 * @param point - Point to scale
 * @param origin - Origin point
 * @param scale - Scale factor
 * @returns Scaled point
 */
export function scalePoint(point: Point, origin: Point, scale: number): Point {
  return {
    x: origin.x + (point.x - origin.x) * scale,
    y: origin.y + (point.y - origin.y) * scale,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clamp a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another
 *
 * @param value - Value to map
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Calculate shortest angular distance between two angles
 *
 * @param from - Starting angle in degrees
 * @param to - Ending angle in degrees
 * @returns Shortest angular distance (-180 to 180)
 */
export function shortestAngle(from: number, to: number): number {
  const diff = ((to - from + 180) % 360) - 180;
  return diff < -180 ? diff + 360 : diff;
}

/**
 * Interpolate between two angles (takes shortest path)
 *
 * @param from - Starting angle in degrees
 * @param to - Ending angle in degrees
 * @param progress - Progress (0-1)
 * @returns Interpolated angle
 */
export function lerpAngle(from: number, to: number, progress: number): number {
  const diff = shortestAngle(from, to);
  return from + diff * progress;
}

/**
 * Convert degrees to radians
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 *
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

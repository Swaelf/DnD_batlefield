/**
 * Easing function utilities
 *
 * Provides utility functions for creating and manipulating easing functions
 */

import { EasingFunction } from '../types';

// ============================================================================
// Easing Function Utilities
// ============================================================================

/**
 * Creates a custom bezier easing function
 *
 * @param x1 - First control point x coordinate (0-1)
 * @param y1 - First control point y coordinate
 * @param x2 - Second control point x coordinate (0-1)
 * @param y2 - Second control point y coordinate
 * @returns Easing function
 */
export function createBezierEasing(
  _x1: number,
  y1: number,
  _x2: number,
  y2: number
): EasingFunction {
  // Simple cubic bezier approximation
  return (t: number): number => {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;

    return 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3;
  };
}

/**
 * Creates an easing function with elastic bounce
 *
 * @param amplitude - Bounce amplitude (default: 1)
 * @param period - Bounce period (default: 0.3)
 * @returns Easing function
 */
export function createElasticEasing(amplitude = 1, period = 0.3): EasingFunction {
  return (t: number): number => {
    if (t === 0 || t === 1) return t;

    const s = (period / 4) * Math.asin(1 / amplitude);
    return amplitude * Math.pow(2, -10 * t) * Math.sin(((t - s) * (2 * Math.PI)) / period) + 1;
  };
}

/**
 * Creates a stepped easing function
 *
 * @param steps - Number of steps
 * @returns Easing function
 */
export function createSteppedEasing(steps: number): EasingFunction {
  return (t: number): number => {
    return Math.floor(t * steps) / steps;
  };
}

/**
 * Reverses an easing function (mirrors it)
 *
 * @param easing - Easing function to reverse
 * @returns Reversed easing function
 */
export function reverseEasing(easing: EasingFunction): EasingFunction {
  return (t: number): number => {
    return 1 - easing(1 - t);
  };
}

/**
 * Mirrors an easing function (applies easing, then reverse)
 *
 * @param easing - Easing function to mirror
 * @returns Mirrored easing function
 */
export function mirrorEasing(easing: EasingFunction): EasingFunction {
  return (t: number): number => {
    if (t < 0.5) {
      return easing(t * 2) / 2;
    } else {
      return 1 - easing((1 - t) * 2) / 2;
    }
  };
}

/**
 * Chains two easing functions together
 *
 * @param easing1 - First easing function
 * @param easing2 - Second easing function
 * @param splitPoint - Where to split (0-1, default: 0.5)
 * @returns Chained easing function
 */
export function chainEasing(
  easing1: EasingFunction,
  easing2: EasingFunction,
  splitPoint = 0.5
): EasingFunction {
  return (t: number): number => {
    if (t < splitPoint) {
      return easing1(t / splitPoint) * splitPoint;
    } else {
      return easing2((t - splitPoint) / (1 - splitPoint)) * (1 - splitPoint) + splitPoint;
    }
  };
}

/**
 * Scales an easing function's output
 *
 * @param easing - Easing function to scale
 * @param scale - Scale factor
 * @returns Scaled easing function
 */
export function scaleEasing(easing: EasingFunction, scale: number): EasingFunction {
  return (t: number): number => {
    return easing(t) * scale;
  };
}

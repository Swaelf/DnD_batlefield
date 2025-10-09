/**
 * Easing Functions
 *
 * Mathematical easing functions for smooth animations.
 * All functions take a progress value (0-1) and return an eased value (0-1).
 *
 * References:
 * - https://easings.net/
 * - https://github.com/ai/easings.net
 */

import type { EasingType } from '../types'

/**
 * Linear easing - no acceleration
 */
export const linear = (t: number): number => {
  return t
}

/**
 * Ease In - accelerating from zero velocity
 */
export const easeIn = (t: number): number => {
  return t * t
}

/**
 * Ease Out - decelerating to zero velocity
 */
export const easeOut = (t: number): number => {
  return t * (2 - t)
}

/**
 * Ease In-Out - acceleration until halfway, then deceleration
 */
export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/**
 * Ease In Cubic - stronger acceleration
 */
export const easeInCubic = (t: number): number => {
  return t * t * t
}

/**
 * Ease Out Cubic - stronger deceleration
 */
export const easeOutCubic = (t: number): number => {
  return (--t) * t * t + 1
}

/**
 * Ease In-Out Cubic - stronger acceleration and deceleration
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

/**
 * Ease In Elastic - elastic snap effect at the beginning
 */
export const easeInElastic = (t: number): number => {
  if (t === 0) return 0
  if (t === 1) return 1

  const c4 = (2 * Math.PI) / 3
  return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4)
}

/**
 * Ease Out Elastic - elastic bounce effect at the end
 */
export const easeOutElastic = (t: number): number => {
  if (t === 0) return 0
  if (t === 1) return 1

  const c4 = (2 * Math.PI) / 3
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

/**
 * Ease In Bounce - bounce effect at the beginning (inverse of easeOutBounce)
 */
export const easeInBounce = (t: number): number => {
  return 1 - easeOutBounce(1 - t)
}

/**
 * Ease Out Bounce - bounce effect at the end
 */
export const easeOutBounce = (t: number): number => {
  const n1 = 7.5625
  const d1 = 2.75

  if (t < 1 / d1) {
    return n1 * t * t
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375
  }
}

/**
 * Ease In-Out Bounce - bounce effect at both ends
 */
export const easeInOutBounce = (t: number): number => {
  return t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2
}

/**
 * Get easing function by name
 */
export const getEasingFunction = (type: EasingType): ((t: number) => number) => {
  switch (type) {
    case 'linear':
      return linear
    case 'easeIn':
      return easeIn
    case 'easeOut':
      return easeOut
    case 'easeInOut':
      return easeInOut
    case 'easeInCubic':
      return easeInCubic
    case 'easeOutCubic':
      return easeOutCubic
    case 'easeInOutCubic':
      return easeInOutCubic
    case 'easeInElastic':
      return easeInElastic
    case 'easeOutElastic':
      return easeOutElastic
    case 'easeInBounce':
      return easeInBounce
    case 'easeOutBounce':
      return easeOutBounce
    default:
      return linear
  }
}

/**
 * Apply easing to a progress value
 */
export const applyEasing = (progress: number, easingType: EasingType = 'linear'): number => {
  // Clamp progress to 0-1 range
  const clampedProgress = Math.max(0, Math.min(1, progress))

  const easingFn = getEasingFunction(easingType)
  return easingFn(clampedProgress)
}

/**
 * Interpolate between two values with easing
 */
export const interpolate = (
  start: number,
  end: number,
  progress: number,
  easingType: EasingType = 'linear'
): number => {
  const easedProgress = applyEasing(progress, easingType)
  return start + (end - start) * easedProgress
}

/**
 * Interpolate between two points with easing
 */
export const interpolatePoint = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  progress: number,
  easingType: EasingType = 'linear'
): { x: number; y: number } => {
  return {
    x: interpolate(start.x, end.x, progress, easingType),
    y: interpolate(start.y, end.y, progress, easingType)
  }
}

/**
 * Create a custom easing function from control points (cubic bezier)
 */
export const createCubicBezierEasing = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): ((t: number) => number) => {
  // Simplified cubic bezier calculation
  // For production, use a more accurate implementation
  return (t: number): number => {
    const t2 = t * t
    const t3 = t2 * t
    const mt = 1 - t
    const mt2 = mt * mt
    const mt3 = mt2 * mt

    return 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t3
  }
}

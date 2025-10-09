/**
 * Motion Path Generators
 *
 * Functions that generate motion paths for animations.
 * Each generator returns a function that takes progress (0-1) and returns position.
 */

import type { Point, MotionPath, MotionType } from '../types'
import { applyEasing } from './easing'

/**
 * Motion path generator function type
 * Takes progress (0-1) and returns current position
 */
export type MotionPathGenerator = (progress: number) => Point

/**
 * Create a linear motion path (straight line)
 */
export const createLinearMotion = (start: Point, end: Point): MotionPathGenerator => {
  return (progress: number): Point => {
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress
    }
  }
}

/**
 * Create a curved motion path (quadratic bezier)
 */
export const createCurvedMotion = (
  start: Point,
  end: Point,
  curveHeight: number = 100,
  curveDirection?: 'up' | 'down' | 'left' | 'right'
): MotionPathGenerator => {
  // Calculate control point based on curve direction
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  let controlPoint: Point

  if (curveDirection === 'up') {
    controlPoint = { x: midX, y: midY - curveHeight }
  } else if (curveDirection === 'down') {
    controlPoint = { x: midX, y: midY + curveHeight }
  } else if (curveDirection === 'left') {
    controlPoint = { x: midX - curveHeight, y: midY }
  } else if (curveDirection === 'right') {
    controlPoint = { x: midX + curveHeight, y: midY }
  } else {
    // Default: perpendicular to line direction
    const dx = end.x - start.x
    const dy = end.y - start.y
    const perpX = -dy
    const perpY = dx
    const length = Math.sqrt(perpX * perpX + perpY * perpY)
    controlPoint = {
      x: midX + (perpX / length) * curveHeight,
      y: midY + (perpY / length) * curveHeight
    }
  }

  return (progress: number): Point => {
    // Quadratic bezier formula: B(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
    const t = progress
    const mt = 1 - t
    const mt2 = mt * mt
    const t2 = t * t

    return {
      x: mt2 * start.x + 2 * mt * t * controlPoint.x + t2 * end.x,
      y: mt2 * start.y + 2 * mt * t * controlPoint.y + t2 * end.y
    }
  }
}

/**
 * Create an arc motion path (parabolic)
 */
export const createArcMotion = (
  start: Point,
  end: Point,
  arcHeight: number = 100
): MotionPathGenerator => {
  const dx = end.x - start.x
  const dy = end.y - start.y

  return (progress: number): Point => {
    // Parabolic arc: height peaks at middle
    const arcProgress = Math.sin(progress * Math.PI) * arcHeight

    return {
      x: start.x + dx * progress,
      y: start.y + dy * progress - arcProgress
    }
  }
}

/**
 * Create a spiral motion path
 */
export const createSpiralMotion = (
  start: Point,
  end: Point,
  radius: number = 50,
  rotations: number = 2
): MotionPathGenerator => {
  const dx = end.x - start.x
  const dy = end.y - start.y

  return (progress: number): Point => {
    const angle = progress * rotations * 2 * Math.PI
    const spiralRadius = radius * (1 - progress) // Radius decreases over time

    const offsetX = Math.cos(angle) * spiralRadius
    const offsetY = Math.sin(angle) * spiralRadius

    return {
      x: start.x + dx * progress + offsetX,
      y: start.y + dy * progress + offsetY
    }
  }
}

/**
 * Create a wave motion path (sine wave)
 */
export const createWaveMotion = (
  start: Point,
  end: Point,
  frequency: number = 2,
  amplitude: number = 30
): MotionPathGenerator => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)

  // Calculate perpendicular direction for wave
  const perpX = -dy / length
  const perpY = dx / length

  return (progress: number): Point => {
    const waveOffset = Math.sin(progress * frequency * 2 * Math.PI) * amplitude

    return {
      x: start.x + dx * progress + perpX * waveOffset,
      y: start.y + dy * progress + perpY * waveOffset
    }
  }
}

/**
 * Create an orbit motion path (circular)
 */
export const createOrbitMotion = (
  center: Point,
  radius: number,
  startAngle: number = 0,
  rotations: number = 1
): MotionPathGenerator => {
  return (progress: number): Point => {
    const angle = startAngle + progress * rotations * 2 * Math.PI

    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    }
  }
}

/**
 * Create a zigzag motion path
 */
export const createZigzagMotion = (
  start: Point,
  end: Point,
  frequency: number = 3,
  amplitude: number = 30
): MotionPathGenerator => {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)

  // Calculate perpendicular direction
  const perpX = -dy / length
  const perpY = dx / length

  return (progress: number): Point => {
    // Zigzag using triangle wave (linear segments)
    const zigzagProgress = (progress * frequency) % 1
    const zigzagOffset = (zigzagProgress < 0.5 ? zigzagProgress : 1 - zigzagProgress) * 2 - 0.5
    const offset = zigzagOffset * amplitude

    return {
      x: start.x + dx * progress + perpX * offset,
      y: start.y + dy * progress + perpY * offset
    }
  }
}

/**
 * Create a homing motion path (follows moving target)
 * This requires the target position to be updated externally
 */
export const createHomingMotion = (
  start: Point,
  getTargetPosition: () => Point,
  speed: number = 500
): MotionPathGenerator => {
  let currentPosition = { ...start }

  return (progress: number): Point => {
    const target = getTargetPosition()
    const dx = target.x - currentPosition.x
    const dy = target.y - currentPosition.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 0) {
      // Move towards target
      const stepDistance = Math.min(speed * (1 / 60), distance) // Assume 60fps
      currentPosition.x += (dx / distance) * stepDistance
      currentPosition.y += (dy / distance) * stepDistance
    }

    return { ...currentPosition }
  }
}

/**
 * Create a custom bezier motion path (cubic bezier with two control points)
 */
export const createBezierMotion = (
  start: Point,
  control1: Point,
  control2: Point,
  end: Point
): MotionPathGenerator => {
  return (progress: number): Point => {
    // Cubic bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
    const t = progress
    const mt = 1 - t
    const mt2 = mt * mt
    const mt3 = mt2 * mt
    const t2 = t * t
    const t3 = t2 * t

    return {
      x: mt3 * start.x + 3 * mt2 * t * control1.x + 3 * mt * t2 * control2.x + t3 * end.x,
      y: mt3 * start.y + 3 * mt2 * t * control1.y + 3 * mt * t2 * control2.y + t3 * end.y
    }
  }
}

/**
 * Create a motion path generator from a MotionPath configuration
 */
export const createMotionFromConfig = (config: MotionPath): MotionPathGenerator => {
  const { type, startPosition, endPosition } = config

  let generator: MotionPathGenerator

  switch (type) {
    case 'linear':
      generator = createLinearMotion(startPosition, endPosition)
      break

    case 'curved':
      generator = createCurvedMotion(
        startPosition,
        endPosition,
        config.curveHeight,
        config.curveDirection
      )
      break

    case 'arc':
      generator = createArcMotion(startPosition, endPosition, config.curveHeight)
      break

    case 'spiral':
      generator = createSpiralMotion(
        startPosition,
        endPosition,
        config.radius,
        config.rotations
      )
      break

    case 'wave':
      generator = createWaveMotion(
        startPosition,
        endPosition,
        config.frequency,
        config.amplitude
      )
      break

    case 'orbit':
      generator = createOrbitMotion(startPosition, config.radius || 100, 0, config.rotations)
      break

    case 'zigzag':
      generator = createZigzagMotion(
        startPosition,
        endPosition,
        config.frequency,
        config.amplitude
      )
      break

    default:
      // Default to linear
      generator = createLinearMotion(startPosition, endPosition)
  }

  // Apply easing if specified
  if (config.easing && config.easing !== 'linear') {
    const originalGenerator = generator
    const easingType = config.easing

    generator = (progress: number): Point => {
      const easedProgress = applyEasing(progress, easingType)
      return originalGenerator(easedProgress)
    }
  }

  return generator
}

/**
 * Calculate the distance between two points
 */
export const calculateDistance = (p1: Point, p2: Point): number => {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculate the angle between two points (in radians)
 */
export const calculateAngle = (from: Point, to: Point): number => {
  return Math.atan2(to.y - from.y, to.x - from.x)
}

/**
 * Calculate velocity vector based on speed and direction
 */
export const calculateVelocity = (from: Point, to: Point, speed: number): Point => {
  const distance = calculateDistance(from, to)
  if (distance === 0) return { x: 0, y: 0 }

  const dx = to.x - from.x
  const dy = to.y - from.y

  return {
    x: (dx / distance) * speed,
    y: (dy / distance) * speed
  }
}

/**
 * Normalize a vector to unit length
 */
export const normalizeVector = (vector: Point): Point => {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  if (length === 0) return { x: 0, y: 0 }

  return {
    x: vector.x / length,
    y: vector.y / length
  }
}

/**
 * Rotate a point around an origin
 */
export const rotatePoint = (point: Point, origin: Point, angle: number): Point => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point.x - origin.x
  const dy = point.y - origin.y

  return {
    x: origin.x + dx * cos - dy * sin,
    y: origin.y + dx * sin + dy * cos
  }
}

/**
 * Abstract Cone Animation
 *
 * Specialized base class for cone-shaped spell effects.
 * Extends AbstractAreaEffect with cone-specific defaults and helpers.
 *
 * D&D 5e Cone Spells:
 * - Burning Hands (15-foot cone of fire)
 * - Cone of Cold (60-foot cone of freezing wind)
 * - Poison Spray (10-foot cone of poisonous gas)
 * - Breath Weapon (15/30/60-foot cone based on type)
 *
 * Features:
 * - Automatic cone shape
 * - Direction calculation from origin to target
 * - D&D 5e cone angle defaults (typically 60 degrees)
 * - Particle spray effects
 * - Color gradients (origin to tip)
 */

import { AbstractAreaEffect, type AreaEffectConfig } from './AbstractAreaEffect'
import type { Point } from '../types'

export type ConeConfig = Omit<Partial<AreaEffectConfig>, 'shape'> & {
  name: string
  position: Point // Origin point of cone
  // Cone-specific required fields
  size: number // Cone length (range in pixels)
  direction?: number // Direction in radians (auto-calculated from target if not provided)
  targetPosition?: Point // Target point to aim cone at (alternative to direction)
  // Cone-specific optional fields
  angle?: number // Cone spread angle in degrees (default 60)
}

export abstract class AbstractCone extends AbstractAreaEffect {
  constructor(config: ConeConfig) {
    const {
      position,
      size,
      direction,
      targetPosition,
      angle = 60, // D&D 5e standard cone angle
      ...rest
    } = config

    // Calculate direction from target position if provided
    let coneDirection = direction
    if (!coneDirection && targetPosition) {
      const dx = targetPosition.x - position.x
      const dy = targetPosition.y - position.y
      coneDirection = Math.atan2(dy, dx)
    }

    // Default to pointing right (0 radians) if no direction specified
    if (coneDirection === undefined) {
      coneDirection = 0
    }

    // Create area effect config with cone shape
    const areaConfig: AreaEffectConfig = {
      ...rest,
      position,
      shape: 'cone',
      size,
      coneAngle: angle,
      coneDirection,
      // Cone-friendly defaults
      pulsing: rest.pulsing ?? false,
      pulseSpeed: rest.pulseSpeed ?? 2, // Faster pulse for cone effects
      rotating: rest.rotating ?? false,
      duration: rest.duration ?? 600, // Shorter default for instant cone effects
      opacity: rest.opacity ?? 0.7 // Semi-transparent for visibility
    }

    super(areaConfig)
  }

  /**
   * Get cone tip position (end of cone)
   */
  public getTipPosition(): Point {
    const animation = this.getAnimation()
    const direction = animation.coneDirection || 0
    const { x, y } = animation.position
    const length = animation.size

    return {
      x: x + Math.cos(direction) * length,
      y: y + Math.sin(direction) * length
    }
  }

  /**
   * Get cone edge points (left and right edges at tip)
   */
  public getEdgePoints(): { left: Point; right: Point } {
    const animation = this.getAnimation()
    const direction = animation.coneDirection || 0
    const angle = animation.coneAngle || 60
    const { x, y } = animation.position
    const length = animation.size

    // Convert cone angle to radians
    const angleRad = (angle / 2) * (Math.PI / 180)

    // Calculate left and right edge directions
    const leftAngle = direction - angleRad
    const rightAngle = direction + angleRad

    return {
      left: {
        x: x + Math.cos(leftAngle) * length,
        y: y + Math.sin(leftAngle) * length
      },
      right: {
        x: x + Math.cos(rightAngle) * length,
        y: y + Math.sin(rightAngle) * length
      }
    }
  }

  /**
   * Check if a point is inside the cone
   */
  public containsPoint(point: Point): boolean {
    const animation = this.getAnimation()
    const origin = animation.position
    const direction = animation.coneDirection || 0
    const angle = animation.coneAngle || 60
    const length = animation.size

    // Vector from origin to point
    const dx = point.x - origin.x
    const dy = point.y - origin.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Check if within cone length
    if (distance > length) {
      return false
    }

    // Check if within cone angle
    const pointAngle = Math.atan2(dy, dx)
    const angleDiff = Math.abs(pointAngle - direction)
    const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff)
    const halfAngleRad = (angle / 2) * (Math.PI / 180)

    return normalizedDiff <= halfAngleRad
  }

  /**
   * Get D&D 5e cone area in square feet
   * Assumes 5px = 1 foot scaling
   */
  public getD5eArea(): number {
    const animation = this.getAnimation()
    const lengthFeet = animation.size / 5 // Convert pixels to feet
    const angle = animation.coneAngle || 60
    const angleRad = angle * (Math.PI / 180)

    // Approximate cone area: (1/2) * length^2 * angle_in_radians
    return Math.round((0.5 * lengthFeet * lengthFeet * angleRad))
  }

  /**
   * Rotate cone to face a new direction
   */
  public rotateTo(targetPosition: Point): void {
    const origin = this.animation.position
    const dx = targetPosition.x - origin.x
    const dy = targetPosition.y - origin.y
    const newDirection = Math.atan2(dy, dx)
    this.animation.coneDirection = newDirection
  }
}

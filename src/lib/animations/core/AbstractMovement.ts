/**
 * AbstractMovement - Base class for movement animations
 *
 * Supports D&D movement types:
 * - Walk - Normal walking speed (30 feet)
 * - Dash - Double speed using action
 * - Charge - Aggressive forward movement
 * - Stealth - Slow, cautious movement
 * - Climb - Vertical surface climbing
 * - Swim - Movement through water
 * - Fly - Aerial movement
 * - Teleport - Instant transportation
 * - Withdraw - Defensive retreat
 * - Disengage - Move without opportunity attacks
 *
 * Features:
 * - Linear position interpolation
 * - Speed-based timing
 * - Easing functions
 * - Visual effects (trails, particles)
 * - D&D movement mechanics
 */

import type { Point } from '../types'

export type MovementType =
  | 'walk'
  | 'dash'
  | 'charge'
  | 'stealth'
  | 'climb'
  | 'swim'
  | 'fly'
  | 'teleport'
  | 'withdraw'
  | 'disengage'

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'

export type MovementConfig = {
  name: string
  fromPosition: Point // Start position
  toPosition: Point // End position
  movementType: MovementType
  color: string
  duration: number // Base duration in milliseconds

  // Visual configuration
  showTrail?: boolean // Show movement trail
  trailOpacity?: number // Trail opacity (0-1)
  showParticles?: boolean // Show particles during movement
  easing?: EasingType // Movement easing

  // D&D mechanics
  speed?: number // Movement speed in feet per round
  requiresCheck?: boolean // Requires skill check
  skill?: string // Required skill (Athletics, Acrobatics, Stealth)
  dc?: number // Difficulty class

  // Metadata
  metadata?: {
    provokesOpportunityAttacks?: boolean
    costsAction?: boolean
    costsBonusAction?: boolean
    doubleSpeed?: boolean
    halfSpeed?: boolean
    [key: string]: unknown
  }
}

/**
 * AbstractMovement - Base class for movement animations
 *
 * This is a data-only class that defines movement parameters.
 * Rendering is handled by existing token animation system.
 */
export class AbstractMovement {
  public readonly name: string
  public readonly fromPosition: Point
  public readonly toPosition: Point
  public readonly movementType: MovementType
  public readonly color: string
  public readonly duration: number
  public readonly showTrail: boolean
  public readonly trailOpacity: number
  public readonly showParticles: boolean
  public readonly easing: EasingType
  public readonly speed: number
  public readonly requiresCheck: boolean
  public readonly skill: string
  public readonly dc: number
  public readonly metadata: Record<string, unknown>

  constructor(config: MovementConfig) {
    const {
      name,
      fromPosition,
      toPosition,
      movementType,
      color,
      duration,
      showTrail = false,
      trailOpacity = 0.3,
      showParticles = false,
      easing = 'linear',
      speed = 30, // Default 30 feet per round
      requiresCheck = false,
      skill = 'Athletics',
      dc = 10,
      metadata = {}
    } = config

    this.name = name
    this.fromPosition = fromPosition
    this.toPosition = toPosition
    this.movementType = movementType
    this.color = color
    this.duration = duration
    this.showTrail = showTrail
    this.trailOpacity = trailOpacity
    this.showParticles = showParticles
    this.easing = easing
    this.speed = speed
    this.requiresCheck = requiresCheck
    this.skill = skill
    this.dc = dc
    this.metadata = {
      ...metadata,
      category: 'movement',
      movementType
    }
  }

  /**
   * Calculate movement distance in pixels
   */
  getDistance(): number {
    const dx = this.toPosition.x - this.fromPosition.x
    const dy = this.toPosition.y - this.fromPosition.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Calculate movement distance in D&D feet
   * Assumes 50 pixels = 5 feet (1 square)
   */
  getDistanceInFeet(): number {
    const PIXELS_PER_SQUARE = 50
    const FEET_PER_SQUARE = 5
    const distanceInPixels = this.getDistance()
    return (distanceInPixels / PIXELS_PER_SQUARE) * FEET_PER_SQUARE
  }

  /**
   * Calculate movement angle in radians
   */
  getAngle(): number {
    const dx = this.toPosition.x - this.fromPosition.x
    const dy = this.toPosition.y - this.fromPosition.y
    return Math.atan2(dy, dx)
  }

  /**
   * Get movement direction vector (normalized)
   */
  getDirection(): { x: number; y: number } {
    const distance = this.getDistance()
    if (distance === 0) {
      return { x: 0, y: 0 }
    }
    const dx = this.toPosition.x - this.fromPosition.x
    const dy = this.toPosition.y - this.fromPosition.y
    return {
      x: dx / distance,
      y: dy / distance
    }
  }

  /**
   * Calculate position at specific progress (0 to 1)
   */
  getPositionAtProgress(progress: number): Point {
    const clampedProgress = Math.max(0, Math.min(1, progress))
    const easedProgress = this.applyEasing(clampedProgress)

    return {
      x: this.fromPosition.x + (this.toPosition.x - this.fromPosition.x) * easedProgress,
      y: this.fromPosition.y + (this.toPosition.y - this.fromPosition.y) * easedProgress
    }
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number): number {
    switch (this.easing) {
      case 'ease-in':
        return progress * progress
      case 'ease-out':
        return progress * (2 - progress)
      case 'ease-in-out':
        return progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress
      case 'linear':
      default:
        return progress
    }
  }

  /**
   * Get movement data for token animation system
   */
  toMovementData() {
    return {
      fromPosition: this.fromPosition,
      toPosition: this.toPosition,
      duration: this.duration,
      type: 'move' as const,
      category: this.movementType,
      color: this.color,
      easing: this.easing,
      showTrail: this.showTrail,
      trailOpacity: this.trailOpacity,
      showParticles: this.showParticles,
      speed: this.speed,
      requiresCheck: this.requiresCheck,
      skill: this.skill,
      dc: this.dc,
      metadata: this.metadata
    }
  }
}

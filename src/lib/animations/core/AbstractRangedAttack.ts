/**
 * AbstractRangedAttack - Base class for ranged attack animations
 *
 * Supports ranged weapon attacks with projectile motion:
 * - Arrows, bolts, darts
 * - Thrown weapons (daggers, axes, javelins)
 * - Sling stones
 *
 * Features:
 * - Linear projectile motion with trails
 * - D&D 5e range limiting (normal/long range)
 * - Impact flash effects
 * - Weapon-specific visuals
 */

import type { Point } from '../types'

export type RangedWeaponType = 'arrow' | 'bolt' | 'thrown' | 'sling' | 'dart'

export type RangedAttackConfig = {
  name: string
  position: Point // Source position (attacker)
  target: Point // Target position
  weaponType?: RangedWeaponType
  color: string
  duration: number
  range?: number // Maximum range in D&D feet

  // Visual configuration
  size?: number // Projectile size in pixels
  trailCount?: number // Number of trail circles
  spin?: boolean // Rotate projectile (for thrown weapons)

  // Metadata
  metadata?: {
    weaponName?: string
    damageType?: string
    damageDice?: string
    isCritical?: boolean
    actualDamage?: number
    normalRange?: number // Normal range in feet
    longRange?: number // Long range in feet (disadvantage)
    [key: string]: unknown
  }
}

/**
 * AbstractRangedAttack - Base class for ranged attack animations
 *
 * This is a data-only class that defines ranged attack parameters.
 * Rendering is handled by AttackRenderer component.
 */
export class AbstractRangedAttack {
  public readonly name: string
  public readonly position: Point
  public readonly target: Point
  public readonly weaponType: RangedWeaponType
  public readonly color: string
  public readonly duration: number
  public readonly range: number
  public readonly size: number
  public readonly trailCount: number
  public readonly spin: boolean
  public readonly metadata: Record<string, unknown>

  constructor(config: RangedAttackConfig) {
    const {
      name,
      position,
      target,
      weaponType = 'arrow',
      color,
      duration,
      range = 150, // Default longbow range (150 feet)
      size = 8,
      trailCount = 8,
      spin = false,
      metadata = {}
    } = config

    this.name = name
    this.position = position
    this.target = target
    this.weaponType = weaponType
    this.color = color
    this.duration = duration
    this.range = range
    this.size = size
    this.trailCount = trailCount
    this.spin = spin
    this.metadata = {
      ...metadata,
      category: 'attack',
      attackCategory: 'ranged',
      weaponType
    }
  }

  /**
   * Calculate attack angle in radians
   */
  getAngle(): number {
    const dx = this.target.x - this.position.x
    const dy = this.target.y - this.position.y
    return Math.atan2(dy, dx)
  }

  /**
   * Calculate attack distance in pixels
   */
  getDistance(): number {
    const dx = this.target.x - this.position.x
    const dy = this.target.y - this.position.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Get limited target position based on weapon range
   */
  getLimitedTarget(): Point {
    const PIXELS_PER_SQUARE = 50
    const FEET_PER_SQUARE = 5
    const maxRangeInPixels = (this.range / FEET_PER_SQUARE) * PIXELS_PER_SQUARE

    const distance = this.getDistance()

    if (distance <= maxRangeInPixels) {
      return this.target
    }

    // Limit to maximum range
    const angle = this.getAngle()
    return {
      x: this.position.x + Math.cos(angle) * maxRangeInPixels,
      y: this.position.y + Math.sin(angle) * maxRangeInPixels
    }
  }

  /**
   * Get attack data for renderer
   */
  toAttackData() {
    return {
      fromPosition: this.position,
      toPosition: this.getLimitedTarget(),
      attackType: 'ranged' as const,
      color: this.color,
      duration: this.duration,
      range: this.range,
      size: this.size,
      spin: this.spin,
      isCritical: this.metadata.isCritical as boolean | undefined,
      actualDamage: this.metadata.actualDamage as number | undefined
    }
  }
}

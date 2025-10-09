/**
 * AbstractMeleeAttack - Base class for melee attack animations
 *
 * Supports three D&D melee attack types:
 * 1. Slash - Sweeping cone attack (longsword, axe)
 * 2. Thrust - Linear piercing attack (rapier, spear)
 * 3. Swing - Bludgeoning impact (hammer, mace)
 *
 * Features:
 * - Range-based attack sizing
 * - Motion blur trails
 * - Impact effects (shockwaves, bursts)
 * - D&D 5e weapon mechanics
 */

import type { Point } from '../types'

export type MeleeAttackType = 'slash' | 'thrust' | 'swing'

export type MeleeAttackConfig = {
  name: string
  position: Point // Source position (attacker)
  target: Point // Target position
  attackType: MeleeAttackType
  color: string
  duration: number
  range?: number // Attack range in D&D feet (default: 5)

  // Visual configuration
  size?: number // Base size in pixels
  trailCount?: number // Number of motion blur trails
  impactEffect?: boolean // Show impact effects

  // Metadata
  metadata?: {
    weaponName?: string
    damageType?: string
    damageDice?: string
    isCritical?: boolean
    actualDamage?: number
    [key: string]: unknown
  }
}

/**
 * AbstractMeleeAttack - Base class for melee attack animations
 *
 * This is a data-only class that defines melee attack parameters.
 * Rendering is handled by AttackRenderer component.
 */
export class AbstractMeleeAttack {
  public readonly name: string
  public readonly position: Point
  public readonly target: Point
  public readonly attackType: MeleeAttackType
  public readonly color: string
  public readonly duration: number
  public readonly range: number
  public readonly size: number
  public readonly trailCount: number
  public readonly impactEffect: boolean
  public readonly metadata: Record<string, unknown>

  constructor(config: MeleeAttackConfig) {
    const {
      name,
      position,
      target,
      attackType,
      color,
      duration,
      range = 5, // Default 5 feet (1 square)
      size = 35,
      trailCount = 5,
      impactEffect = false,
      metadata = {}
    } = config

    this.name = name
    this.position = position
    this.target = target
    this.attackType = attackType
    this.color = color
    this.duration = duration
    this.range = range
    this.size = size
    this.trailCount = trailCount
    this.impactEffect = impactEffect
    this.metadata = {
      ...metadata,
      category: 'attack',
      attackCategory: 'melee'
    }
  }

  /**
   * Calculate attack angle in degrees
   */
  getAngle(): number {
    const dx = this.target.x - this.position.x
    const dy = this.target.y - this.position.y
    return Math.atan2(dy, dx) * 180 / Math.PI
  }

  /**
   * Calculate attack distance
   */
  getDistance(): number {
    const dx = this.target.x - this.position.x
    const dy = this.target.y - this.position.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * Get attack data for renderer
   */
  toAttackData() {
    return {
      fromPosition: this.position,
      toPosition: this.target,
      attackType: 'melee' as const,
      animation: this.attackType === 'slash' ? 'melee_slash' :
                 this.attackType === 'thrust' ? 'melee_thrust' : 'melee_swing',
      color: this.color,
      duration: this.duration,
      range: this.range,
      size: this.size,
      isCritical: this.metadata.isCritical as boolean | undefined,
      actualDamage: this.metadata.actualDamage as number | undefined
    }
  }
}

/**
 * Abstract Status Effect Base Class
 *
 * Data-only class defining status effect parameters with D&D 5e mechanics.
 * All rendering is handled by existing StatusEffectOverlay component.
 *
 * D&D 5e Status Effects:
 * - Stunned: Cannot move or take actions, automatically fail Str/Dex saves
 * - Poisoned: Disadvantage on attack rolls and ability checks
 * - Prone: Disadvantage on attack rolls, attacks against have advantage
 * - Entangled: Speed reduced to 0, restrained
 * - Dying: Making death saving throws, unconscious
 * - Flaming: Taking fire damage each turn
 * - Chilled: Speed reduced, vulnerability to cold damage
 * - Dazed: Can't take reactions, reduced movement
 * - Blessed: +1d4 to attack rolls and saving throws
 * - Regenerating: Regaining HP each turn
 * - Sleeping: Unconscious, automatically fail Str/Dex saves
 * - Frightened: Disadvantage on ability checks and attack rolls
 */

import type { Point } from '../types'

export type StatusEffectType =
  | 'stunned'
  | 'poisoned'
  | 'prone'
  | 'entangled'
  | 'dying'
  | 'flaming'
  | 'chilled'
  | 'dazed'
  | 'blessed'
  | 'regenerating'
  | 'sleeping'
  | 'frightened'

export type AnimationType =
  | 'pulse'
  | 'spin'
  | 'flicker'
  | 'wave'
  | 'particles'
  | 'ring'
  | 'overlay'
  | 'shimmer'
  | 'bubbles'

export type StatusEffectConfig = {
  name: string
  effectType: StatusEffectType
  position: Point
  color: string
  secondaryColor?: string
  animationType: AnimationType
  duration: number // Milliseconds for animation cycle
  intensity: number // 0-1 scale
  layer: number
  opacity: number
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay'
  metadata?: Record<string, unknown>
}

export class AbstractStatusEffect {
  public readonly name: string
  public readonly effectType: StatusEffectType
  public readonly position: Point
  public readonly color: string
  public readonly secondaryColor: string
  public readonly animationType: AnimationType
  public readonly duration: number
  public readonly intensity: number
  public readonly layer: number
  public readonly opacity: number
  public readonly blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
  public readonly metadata: Record<string, unknown>

  constructor(config: StatusEffectConfig) {
    this.name = config.name
    this.effectType = config.effectType
    this.position = config.position
    this.color = config.color
    this.secondaryColor = config.secondaryColor || config.color
    this.animationType = config.animationType
    this.duration = config.duration
    this.intensity = config.intensity
    this.layer = config.layer
    this.opacity = config.opacity
    this.blendMode = config.blendMode || 'normal'
    this.metadata = config.metadata || {}
  }

  /**
   * Get duration in D&D rounds (6 seconds per round)
   */
  getDurationInRounds(): number {
    return Math.ceil(this.duration / 6000)
  }

  /**
   * Check if effect is a debuff (negative effect)
   */
  isDebuff(): boolean {
    const debuffs: StatusEffectType[] = [
      'stunned',
      'poisoned',
      'prone',
      'entangled',
      'dying',
      'flaming',
      'chilled',
      'dazed',
      'sleeping',
      'frightened'
    ]
    return debuffs.includes(this.effectType)
  }

  /**
   * Check if effect is a buff (positive effect)
   */
  isBuff(): boolean {
    const buffs: StatusEffectType[] = ['blessed', 'regenerating']
    return buffs.includes(this.effectType)
  }

  /**
   * Check if effect prevents actions
   */
  preventsActions(): boolean {
    const disabling: StatusEffectType[] = ['stunned', 'dying', 'sleeping']
    return disabling.includes(this.effectType)
  }

  /**
   * Check if effect reduces movement
   */
  reducesMovement(): boolean {
    const movementReducing: StatusEffectType[] = [
      'prone',
      'entangled',
      'chilled',
      'dazed'
    ]
    return movementReducing.includes(this.effectType)
  }

  /**
   * Get animation speed multiplier based on intensity
   */
  getAnimationSpeed(): number {
    return 1 + this.intensity * 0.5
  }

  /**
   * Convert to data format for StatusEffectOverlay component
   */
  toStatusEffectData() {
    return {
      type: this.effectType,
      position: this.position,
      color: this.color,
      secondaryColor: this.secondaryColor,
      animationType: this.animationType,
      duration: this.duration,
      intensity: this.intensity,
      layer: this.layer,
      opacity: this.opacity,
      blendMode: this.blendMode,
      metadata: this.metadata
    }
  }
}

/**
 * Animation Factory
 *
 * Factory pattern for creating animations using registered templates.
 * Provides simplified API for instantiating animations with validation.
 *
 * Features:
 * - Type-safe animation creation
 * - Configuration validation
 * - Error handling with fallbacks
 * - Batch creation utilities
 * - Quick spell casting helpers
 */

import type { Point } from '../types'
import { AnimationRegistry, type RegisteredAnimationName } from './AnimationRegistry'
import { Fireball } from '../spells/projectile/Fireball'
import { MagicMissile } from '../spells/projectile/MagicMissile'
import { Thunderwave } from '../spells/burst/Thunderwave'
import { Darkness } from '../spells/area/Darkness'
import { RayOfFrost } from '../spells/ray/RayOfFrost'
import type { AbstractProjectile } from '../core/AbstractProjectile'
import type { AbstractBurst } from '../core/AbstractBurst'
import type { AbstractAreaEffect } from '../core/AbstractAreaEffect'
import type { AbstractRay } from '../core/AbstractRay'

/**
 * Base animation instance types
 */
export type AnimationInstance =
  | AbstractProjectile
  | AbstractBurst
  | AbstractAreaEffect
  | AbstractRay

/**
 * Factory configuration with type safety
 */
export type FactoryConfig = {
  name: RegisteredAnimationName
  config: unknown
  onError?: (error: Error) => void
}

/**
 * Batch creation configuration
 */
export type BatchConfig = {
  animations: FactoryConfig[]
  parallel?: boolean
  stagger?: number
}

/**
 * Animation Factory class
 */
class AnimationFactoryClass {
  /**
   * Create an animation from a registered template
   */
  create<T = AnimationInstance>(
    name: RegisteredAnimationName,
    config: unknown
  ): T | null {
    const template = AnimationRegistry.getTemplate(name)

    if (!template) {
      console.error(`Animation template "${name}" not found in registry`)
      return null
    }

    try {
      const animation = template.factory(config) as T
      return animation
    } catch (error) {
      console.error(`Failed to create animation "${name}":`, error)
      return null
    }
  }

  /**
   * Create an animation with error callback
   */
  createSafe<T = AnimationInstance>(factoryConfig: FactoryConfig): T | null {
    const { name, config, onError } = factoryConfig

    try {
      return this.create<T>(name, config)
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error)
      }
      return null
    }
  }

  /**
   * Create multiple animations
   */
  createBatch(configs: FactoryConfig[]): AnimationInstance[] {
    return configs
      .map(config => this.createSafe(config))
      .filter((animation): animation is AnimationInstance => animation !== null)
  }

  /**
   * Create animations with staggered timing
   */
  createStaggered(
    configs: FactoryConfig[],
    staggerDelay: number = 100
  ): Array<{ animation: AnimationInstance; delay: number }> {
    return configs
      .map((config, index) => ({
        animation: this.createSafe(config),
        delay: index * staggerDelay
      }))
      .filter(
        (item): item is { animation: AnimationInstance; delay: number } =>
          item.animation !== null
      )
  }

  /**
   * Quick spell creation helpers
   */
  spell = {
    /**
     * Create Fireball projectile
     */
    fireball: (from: Point, to: Point, config?: Partial<typeof Fireball>) =>
      new Fireball({ fromPosition: from, toPosition: to, ...config }),

    /**
     * Create Magic Missile projectile
     */
    magicMissile: (from: Point, to: Point, config?: Partial<typeof MagicMissile>) =>
      new MagicMissile({ fromPosition: from, toPosition: to, ...config }),

    /**
     * Create Magic Missile volley (multiple targets)
     */
    magicMissileVolley: (
      from: Point,
      targets: Point[],
      spellLevel: number = 1,
      stagger: number = 150
    ) => MagicMissile.castVolley(from, targets, spellLevel, stagger),

    /**
     * Create Thunderwave burst
     */
    thunderwave: (position: Point, config?: Partial<typeof Thunderwave>) =>
      new Thunderwave({ position, ...config }),

    /**
     * Create Darkness area effect
     */
    darkness: (position: Point, config?: Partial<typeof Darkness>) =>
      new Darkness({ position, ...config }),

    /**
     * Create Ray of Frost beam
     */
    rayOfFrost: (from: Point, to: Point, config?: Partial<typeof RayOfFrost>) =>
      new RayOfFrost({ fromPosition: from, toPosition: to, ...config })
  }

  /**
   * Validate animation configuration
   */
  validate(name: RegisteredAnimationName, config: unknown): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    const template = AnimationRegistry.getTemplate(name)
    if (!template) {
      errors.push(`Template "${name}" not found`)
      return { valid: false, errors }
    }

    // Basic validation based on category
    const configObj = config as Record<string, unknown>

    if (template.category === 'projectile') {
      if (!configObj.fromPosition) errors.push('fromPosition is required')
      if (!configObj.toPosition) errors.push('toPosition is required')
    }

    if (template.category === 'ray') {
      if (!configObj.fromPosition) errors.push('fromPosition is required')
      if (!configObj.toPosition) errors.push('toPosition is required')
    }

    if (template.category === 'burst' || template.category === 'area') {
      if (!configObj.position) errors.push('position is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Get recommended configuration for a spell
   */
  getRecommendedConfig(name: RegisteredAnimationName): Record<string, unknown> | null {
    const template = AnimationRegistry.getTemplate(name)
    if (!template) return null

    return { ...template.defaults }
  }

  /**
   * Clone an animation with modified configuration
   */
  clone<T extends AnimationInstance>(
    animation: T,
    overrides?: Partial<unknown>
  ): T | null {
    try {
      const animationData = animation.getAnimation()
      const name = animationData.name as RegisteredAnimationName

      const config = {
        ...animationData,
        ...overrides
      }

      return this.create<T>(name, config)
    } catch (error) {
      console.error('Failed to clone animation:', error)
      return null
    }
  }
}

/**
 * Singleton instance of the animation factory
 */
export const AnimationFactory = new AnimationFactoryClass()

/**
 * Convenience exports for direct spell creation
 */
export const createSpell = AnimationFactory.spell

/**
 * Quick spell casting API
 */
export const cast = {
  fireball: (from: Point, to: Point) => AnimationFactory.spell.fireball(from, to),
  magicMissile: (from: Point, to: Point) => AnimationFactory.spell.magicMissile(from, to),
  thunderwave: (position: Point) => AnimationFactory.spell.thunderwave(position),
  darkness: (position: Point) => AnimationFactory.spell.darkness(position),
  rayOfFrost: (from: Point, to: Point) => AnimationFactory.spell.rayOfFrost(from, to)
} as const

/**
 * Animation Registry
 *
 * Central registry for all animation types with template-based instantiation.
 * Provides a unified API for creating and managing animations across the application.
 *
 * Features:
 * - Template registration for custom animations
 * - Quick access to all spell animations
 * - Type-safe animation creation
 * - Animation metadata and documentation
 * - Validation and error handling
 */

import type { Animation, AnimationCategory, Point } from '../types'
import { Fireball, type FireballConfig } from '../spells/projectile/Fireball'
import { MagicMissile, type MagicMissileConfig } from '../spells/projectile/MagicMissile'
import { Thunderwave, type ThunderwaveConfig } from '../spells/burst/Thunderwave'
import { Darkness, type DarknessConfig } from '../spells/area/Darkness'
import { RayOfFrost, type RayOfFrostConfig } from '../spells/ray/RayOfFrost'

/**
 * Animation template definition
 */
export type AnimationTemplate = {
  name: string
  category: AnimationCategory
  description?: string
  defaults: Partial<Animation>
  factory: (config: unknown) => unknown
}

/**
 * Registry of all available animations
 */
class AnimationRegistryClass {
  private templates: Map<string, AnimationTemplate> = new Map()

  constructor() {
    this.registerBuiltInAnimations()
  }

  /**
   * Register built-in spell animations
   */
  private registerBuiltInAnimations(): void {
    // Projectile spells
    this.register('Fireball', {
      name: 'Fireball',
      category: 'projectile',
      description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
      defaults: {
        category: 'projectile',
        name: 'Fireball',
        duration: 1000,
        speed: 500,
        color: '#FF6B35',
        size: 20
      },
      factory: (config: FireballConfig) => new Fireball(config)
    })

    this.register('Magic Missile', {
      name: 'Magic Missile',
      category: 'projectile',
      description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range.',
      defaults: {
        category: 'projectile',
        name: 'Magic Missile',
        duration: 800,
        speed: 400,
        color: '#9370DB',
        size: 12
      },
      factory: (config: MagicMissileConfig) => new MagicMissile(config)
    })

    // Burst spells
    this.register('Thunderwave', {
      name: 'Thunderwave',
      category: 'burst',
      description: 'A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw.',
      defaults: {
        category: 'burst',
        name: 'Thunderwave',
        duration: 600,
        color: '#4169E1',
        size: 150
      },
      factory: (config: ThunderwaveConfig) => new Thunderwave(config)
    })

    // Area spells
    this.register('Darkness', {
      name: 'Darkness',
      category: 'area',
      description: 'Magical darkness spreads from a point you choose within range to fill a 15-foot-radius sphere for the duration.',
      defaults: {
        category: 'area',
        name: 'Darkness',
        duration: 600000, // 10 minutes
        color: '#000000',
        size: 150
      },
      factory: (config: DarknessConfig) => new Darkness(config)
    })

    // Ray spells
    this.register('Ray of Frost', {
      name: 'Ray of Frost',
      category: 'ray',
      description: 'A frigid beam of blue-white light streaks toward a creature within range.',
      defaults: {
        category: 'ray',
        name: 'Ray of Frost',
        duration: 500,
        color: '#87CEEB',
        width: 8
      },
      factory: (config: RayOfFrostConfig) => new RayOfFrost(config)
    })
  }

  /**
   * Register a custom animation template
   */
  register(name: string, template: AnimationTemplate): void {
    if (this.templates.has(name)) {
      console.warn(`Animation template "${name}" is already registered. Overwriting.`)
    }
    this.templates.set(name, template)
  }

  /**
   * Unregister an animation template
   */
  unregister(name: string): boolean {
    return this.templates.delete(name)
  }

  /**
   * Get an animation template by name
   */
  getTemplate(name: string): AnimationTemplate | undefined {
    return this.templates.get(name)
  }

  /**
   * Get all registered template names
   */
  getTemplateNames(): string[] {
    return Array.from(this.templates.keys())
  }

  /**
   * Get all templates by category
   */
  getTemplatesByCategory(category: AnimationCategory): AnimationTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.category === category
    )
  }

  /**
   * Check if a template exists
   */
  hasTemplate(name: string): boolean {
    return this.templates.has(name)
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): AnimationTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Clear all registered templates (useful for testing)
   */
  clear(): void {
    this.templates.clear()
  }

  /**
   * Reset to built-in animations only
   */
  reset(): void {
    this.clear()
    this.registerBuiltInAnimations()
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    total: number
    byCategory: Record<AnimationCategory, number>
  } {
    const templates = this.getAllTemplates()
    const byCategory = {} as Record<AnimationCategory, number>

    templates.forEach(template => {
      byCategory[template.category] = (byCategory[template.category] || 0) + 1
    })

    return {
      total: templates.length,
      byCategory
    }
  }

  /**
   * Search templates by name or description
   */
  search(query: string): AnimationTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllTemplates().filter(template => {
      const nameMatch = template.name.toLowerCase().includes(lowerQuery)
      const descMatch = template.description?.toLowerCase().includes(lowerQuery) || false
      return nameMatch || descMatch
    })
  }

  /**
   * Validate a template configuration
   */
  validateTemplate(template: AnimationTemplate): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!template.name || template.name.trim() === '') {
      errors.push('Template name is required')
    }

    if (!template.category) {
      errors.push('Template category is required')
    }

    if (!template.factory || typeof template.factory !== 'function') {
      errors.push('Template factory must be a function')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Singleton instance of the animation registry
 */
export const AnimationRegistry = new AnimationRegistryClass()

/**
 * Helper types for registry usage
 */
export type RegisteredAnimationName =
  | 'Fireball'
  | 'Magic Missile'
  | 'Thunderwave'
  | 'Darkness'
  | 'Ray of Frost'
  | string // Allow custom names

/**
 * Quick access functions for common spells
 */
export const SpellTemplates = {
  // Projectiles
  fireball: (from: Point, to: Point) => new Fireball({ fromPosition: from, toPosition: to }),
  magicMissile: (from: Point, to: Point) => new MagicMissile({ fromPosition: from, toPosition: to }),

  // Bursts
  thunderwave: (position: Point) => new Thunderwave({ position }),

  // Area effects
  darkness: (position: Point) => new Darkness({ position }),

  // Rays
  rayOfFrost: (from: Point, to: Point) => new RayOfFrost({ fromPosition: from, toPosition: to })
} as const

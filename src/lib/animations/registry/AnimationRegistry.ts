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
import { GuidingBolt, type GuidingBoltConfig } from '../spells/projectile/GuidingBolt'
import { Thunderwave, type ThunderwaveConfig } from '../spells/burst/Thunderwave'
import { Darkness, type DarknessConfig } from '../spells/area/Darkness'
import { Web, type WebConfig } from '../spells/area/Web'
import { StoneRain, type StoneRainConfig } from '../spells/area/StoneRain'
import { RayOfFrost, type RayOfFrostConfig } from '../spells/ray/RayOfFrost'
import { EldritchBlast, type EldritchBlastConfig } from '../spells/ray/EldritchBlast'
import { BurningHands, type BurningHandsConfig } from '../spells/cone/BurningHands'
import { PoisonSpray, type PoisonSprayConfig } from '../spells/cone/PoisonSpray'
import { ConeOfCold, type ConeOfColdConfig } from '../spells/cone/ConeOfCold'
import { BreathWeapon, type BreathWeaponConfig } from '../spells/cone/BreathWeapon'
import { CureWounds, type CureWoundsConfig } from '../spells/healing/CureWounds'
import { Heal, type HealConfig } from '../spells/healing/Heal'
import { Bless, type BlessConfig } from '../spells/buff/Bless'
import { LightningBolt, type LightningBoltConfig } from '../spells/line/LightningBolt'
import { ShockingGrasp, type ShockingGraspConfig } from '../spells/touch/ShockingGrasp'
import { SacredFlame, type SacredFlameConfig } from '../spells/pillar/SacredFlame'
import { LongswordAttack, type LongswordConfig } from '../spells/attacks/LongswordAttack'
import { RapierAttack, type RapierConfig } from '../spells/attacks/RapierAttack'
import { WarhammerAttack, type WarhammerConfig } from '../spells/attacks/WarhammerAttack'
import { LongbowAttack, type LongbowConfig } from '../spells/attacks/LongbowAttack'
import { ThrownDaggerAttack, type ThrownDaggerConfig } from '../spells/attacks/ThrownDaggerAttack'
import { SlingAttack, type SlingConfig } from '../spells/attacks/SlingAttack'
import { WalkMovement, type WalkConfig } from '../spells/movement/WalkMovement'
import { DashMovement, type DashConfig } from '../spells/movement/DashMovement'
import { TeleportMovement, type TeleportConfig } from '../spells/movement/TeleportMovement'
import { StunnedEffect, type StunnedConfig } from '../spells/status/StunnedEffect'
import { PoisonedEffect, type PoisonedConfig } from '../spells/status/PoisonedEffect'
import { ProneEffect, type ProneConfig } from '../spells/status/ProneEffect'
import { EntangledEffect, type EntangledConfig } from '../spells/status/EntangledEffect'
import { DyingEffect, type DyingConfig } from '../spells/status/DyingEffect'
import { FlamingEffect, type FlamingConfig } from '../spells/status/FlamingEffect'
import { ChilledEffect, type ChilledConfig } from '../spells/status/ChilledEffect'
import { DazedEffect, type DazedConfig } from '../spells/status/DazedEffect'
import { BlessedEffect, type BlessedConfig } from '../spells/status/BlessedEffect'
import { RegeneratingEffect, type RegeneratingConfig } from '../spells/status/RegeneratingEffect'
import { SleepingEffect, type SleepingConfig } from '../spells/status/SleepingEffect'
import { FrightenedEffect, type FrightenedConfig } from '../spells/status/FrightenedEffect'

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

    this.register('Guiding Bolt', {
      name: 'Guiding Bolt',
      category: 'projectile',
      description: 'A flash of light streaks toward a creature of your choice within range. The next attack roll against this target has advantage.',
      defaults: {
        category: 'projectile',
        name: 'Guiding Bolt',
        duration: 800,
        speed: 450,
        color: '#F0E68C',
        size: 16
      },
      factory: (config: GuidingBoltConfig) => new GuidingBolt(config)
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

    this.register('Web', {
      name: 'Web',
      category: 'area',
      description: 'You conjure a mass of thick, sticky webbing at a point of your choice within range. The webs are difficult terrain and lightly obscure their area.',
      defaults: {
        category: 'area',
        name: 'Web',
        duration: 3600000, // 1 hour
        color: '#F5F5DC',
        size: 100
      },
      factory: (config: WebConfig) => new Web(config)
    })

    this.register('Stone Rain', {
      name: 'Stone Rain',
      category: 'area',
      description: 'A barrage of stones rains down in a large area, striking multiple locations with small impacts.',
      defaults: {
        category: 'area',
        name: 'Stone Rain',
        duration: 2000,
        color: '#8B7355',
        size: 100
      },
      factory: (config: StoneRainConfig) => new StoneRain(config)
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

    this.register('Eldritch Blast', {
      name: 'Eldritch Blast',
      category: 'ray',
      description: 'A beam of crackling energy streaks toward a creature within range. At higher levels, you can fire multiple beams.',
      defaults: {
        category: 'ray',
        name: 'Eldritch Blast',
        duration: 400,
        color: '#8B00FF',
        width: 10
      },
      factory: (config: EldritchBlastConfig) => new EldritchBlast(config)
    })

    // Cone spells
    this.register('Burning Hands', {
      name: 'Burning Hands',
      category: 'area',
      description: 'A thin sheet of flames shoots forth from your outstretched fingertips. Each creature in a 15-foot cone must make a saving throw.',
      defaults: {
        category: 'area',
        name: 'Burning Hands',
        duration: 600,
        color: '#FF6B35',
        size: 75
      },
      factory: (config: BurningHandsConfig) => new BurningHands(config)
    })

    this.register('Poison Spray', {
      name: 'Poison Spray',
      category: 'area',
      description: 'You extend your hand toward a creature you can see within range and project a puff of noxious gas from your palm.',
      defaults: {
        category: 'area',
        name: 'Poison Spray',
        duration: 800,
        color: '#9ACD32',
        size: 50
      },
      factory: (config: PoisonSprayConfig) => new PoisonSpray(config)
    })

    this.register('Cone of Cold', {
      name: 'Cone of Cold',
      category: 'area',
      description: 'A blast of cold air erupts from your hands. Each creature in a 60-foot cone must make a saving throw.',
      defaults: {
        category: 'area',
        name: 'Cone of Cold',
        duration: 800,
        color: '#87CEEB',
        size: 300
      },
      factory: (config: ConeOfColdConfig) => new ConeOfCold(config)
    })

    this.register('Breath Weapon', {
      name: 'Breath Weapon',
      category: 'area',
      description: 'You exhale destructive energy in a cone. The energy type and range depends on your draconic ancestry.',
      defaults: {
        category: 'area',
        name: 'Breath Weapon',
        duration: 700,
        color: '#FF6B35',
        size: 75
      },
      factory: (config: BreathWeaponConfig) => new BreathWeapon(config)
    })

    // Healing spells
    this.register('Cure Wounds', {
      name: 'Cure Wounds',
      category: 'burst',
      description: 'A creature you touch regains a number of hit points. This spell has no effect on undead or constructs.',
      defaults: {
        category: 'burst',
        name: 'Cure Wounds',
        duration: 800,
        color: '#FFD700',
        size: 40
      },
      factory: (config: CureWoundsConfig) => new CureWounds(config)
    })

    this.register('Heal', {
      name: 'Heal',
      category: 'burst',
      description: 'Choose a creature that you can see within range. A surge of positive energy washes through the creature, causing it to regain 70 hit points.',
      defaults: {
        category: 'burst',
        name: 'Heal',
        duration: 1000,
        color: '#FFFFFF',
        size: 60
      },
      factory: (config: HealConfig) => new Heal(config)
    })

    // Buff spells
    this.register('Bless', {
      name: 'Bless',
      category: 'burst',
      description: 'You bless up to three creatures within range. Whenever a target makes an attack roll or saving throw, it can roll a d4 and add the number rolled.',
      defaults: {
        category: 'burst',
        name: 'Bless',
        duration: 600,
        color: '#FFFFE0',
        size: 30
      },
      factory: (config: BlessConfig) => new Bless(config)
    })

    // Line spells
    this.register('Lightning Bolt', {
      name: 'Lightning Bolt',
      category: 'ray',
      description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide blasts out from you in a direction you choose.',
      defaults: {
        category: 'ray',
        name: 'Lightning Bolt',
        duration: 300,
        color: '#00BFFF',
        width: 25
      },
      factory: (config: LightningBoltConfig) => new LightningBolt(config)
    })

    // Touch spells
    this.register('Shocking Grasp', {
      name: 'Shocking Grasp',
      category: 'burst',
      description: 'Lightning springs from your hand to deliver a shock to a creature you try to touch.',
      defaults: {
        category: 'burst',
        name: 'Shocking Grasp',
        duration: 400,
        color: '#00BFFF',
        size: 25
      },
      factory: (config: ShockingGraspConfig) => new ShockingGrasp(config)
    })

    // Pillar spells
    this.register('Sacred Flame', {
      name: 'Sacred Flame',
      category: 'burst',
      description: 'Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage.',
      defaults: {
        category: 'burst',
        name: 'Sacred Flame',
        duration: 800,
        color: '#FFD700',
        size: 25
      },
      factory: (config: SacredFlameConfig) => new SacredFlame(config)
    })

    // Melee attacks
    this.register('Longsword', {
      name: 'Longsword',
      category: 'attack' as AnimationCategory,
      description: 'A powerful sweeping slash with a longsword. Versatile weapon (1d8 one-handed, 1d10 two-handed).',
      defaults: {
        category: 'attack' as AnimationCategory,
        name: 'Longsword',
        duration: 600,
        color: '#C0C0C0',
        size: 40
      },
      factory: (config: LongswordConfig) => new LongswordAttack(config)
    })

    this.register('Rapier', {
      name: 'Rapier',
      category: 'attack' as AnimationCategory,
      description: 'A precise thrusting attack with a rapier. Finesse weapon (1d8 piercing).',
      defaults: {
        category: 'attack' as AnimationCategory,
        name: 'Rapier',
        duration: 500,
        color: '#B0B0B0',
        size: 35
      },
      factory: (config: RapierConfig) => new RapierAttack(config)
    })

    this.register('Warhammer', {
      name: 'Warhammer',
      category: 'attack' as AnimationCategory,
      description: 'A bone-crushing swing with a warhammer. Versatile weapon (1d8 one-handed, 1d10 two-handed).',
      defaults: {
        category: 'attack' as AnimationCategory,
        name: 'Warhammer',
        duration: 700,
        color: '#8B7355',
        size: 35
      },
      factory: (config: WarhammerConfig) => new WarhammerAttack(config)
    })

    // Ranged attacks
    this.register('Longbow', {
      name: 'Longbow',
      category: 'attack' as AnimationCategory,
      description: 'An arrow fired from a longbow. Ammunition, heavy, two-handed (1d8 piercing, range 150/600).',
      defaults: {
        category: 'attack' as AnimationCategory,
        name: 'Longbow',
        duration: 800,
        color: '#8B4513',
        size: 8
      },
      factory: (config: LongbowConfig) => new LongbowAttack(config)
    })

    this.register('Thrown Dagger', {
      name: 'Thrown Dagger',
      category: 'attack' as AnimationCategory,
      description: 'A dagger thrown at the target. Finesse, light, thrown (1d4 piercing, range 20/60).',
      defaults: {
        category: 'attack' as AnimationCategory,
        name: 'Thrown Dagger',
        duration: 500,
        color: '#C0C0C0',
        size: 12
      },
      factory: (config: ThrownDaggerConfig) => new ThrownDaggerAttack(config)
    })

    this.register('Sling', {
      name: 'Sling',
      category: 'attack' as AnimationCategory,
      description: 'A stone hurled from a sling. Ammunition (1d4 bludgeoning, range 30/120).',
      defaults: {
        category: 'attack' as AnimationCategory,
        name: 'Sling',
        duration: 600,
        color: '#696969',
        size: 10
      },
      factory: (config: SlingConfig) => new SlingAttack(config)
    })

    // Movement types
    this.register('Walk', {
      name: 'Walk',
      category: 'movement' as AnimationCategory,
      description: 'Standard walking movement at 30 feet per round.',
      defaults: {
        category: 'movement' as AnimationCategory,
        name: 'Walk',
        duration: 1000,
        color: '#4A90E2',
        size: 0
      },
      factory: (config: WalkConfig) => new WalkMovement(config)
    })

    this.register('Dash', {
      name: 'Dash',
      category: 'movement' as AnimationCategory,
      description: 'Use action to gain extra movement at double speed.',
      defaults: {
        category: 'movement' as AnimationCategory,
        name: 'Dash',
        duration: 600,
        color: '#FFD700',
        size: 0
      },
      factory: (config: DashConfig) => new DashMovement(config)
    })

    this.register('Teleport', {
      name: 'Teleport',
      category: 'movement' as AnimationCategory,
      description: 'Magical instant transportation without provoking opportunity attacks.',
      defaults: {
        category: 'movement' as AnimationCategory,
        name: 'Teleport',
        duration: 400,
        color: '#9370DB',
        size: 40
      },
      factory: (config: TeleportConfig) => new TeleportMovement(config)
    })

    // Status effects
    this.register('Stunned', {
      name: 'Stunned',
      category: 'status' as AnimationCategory,
      description: 'Cannot move or take actions, automatically fail Str/Dex saves.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Stunned',
        duration: 2000,
        color: '#FFD700',
        size: 40
      },
      factory: (config: StunnedConfig) => new StunnedEffect(config)
    })

    this.register('Poisoned', {
      name: 'Poisoned',
      category: 'status' as AnimationCategory,
      description: 'Disadvantage on attack rolls and ability checks.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Poisoned',
        duration: 3000,
        color: '#00FF00',
        size: 40
      },
      factory: (config: PoisonedConfig) => new PoisonedEffect(config)
    })

    this.register('Prone', {
      name: 'Prone',
      category: 'status' as AnimationCategory,
      description: 'Disadvantage on attack rolls, attacks against have advantage.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Prone',
        duration: 2500,
        color: '#808080',
        size: 40
      },
      factory: (config: ProneConfig) => new ProneEffect(config)
    })

    this.register('Entangled', {
      name: 'Entangled',
      category: 'status' as AnimationCategory,
      description: 'Speed reduced to 0, restrained.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Entangled',
        duration: 2000,
        color: '#228B22',
        size: 40
      },
      factory: (config: EntangledConfig) => new EntangledEffect(config)
    })

    this.register('Dying', {
      name: 'Dying',
      category: 'status' as AnimationCategory,
      description: 'Making death saving throws, unconscious.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Dying',
        duration: 1500,
        color: '#8B0000',
        size: 40
      },
      factory: (config: DyingConfig) => new DyingEffect(config)
    })

    this.register('Flaming', {
      name: 'Flaming',
      category: 'status' as AnimationCategory,
      description: 'Taking fire damage each turn.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Flaming',
        duration: 1000,
        color: '#FF4500',
        size: 40
      },
      factory: (config: FlamingConfig) => new FlamingEffect(config)
    })

    this.register('Chilled', {
      name: 'Chilled',
      category: 'status' as AnimationCategory,
      description: 'Speed reduced, vulnerability to cold damage.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Chilled',
        duration: 2500,
        color: '#00FFFF',
        size: 40
      },
      factory: (config: ChilledConfig) => new ChilledEffect(config)
    })

    this.register('Dazed', {
      name: 'Dazed',
      category: 'status' as AnimationCategory,
      description: "Can't take reactions, reduced movement.",
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Dazed',
        duration: 2000,
        color: '#FFFF00',
        size: 40
      },
      factory: (config: DazedConfig) => new DazedEffect(config)
    })

    this.register('Blessed', {
      name: 'Blessed',
      category: 'status' as AnimationCategory,
      description: '+1d4 to attack rolls and saving throws.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Blessed',
        duration: 3000,
        color: '#FFD700',
        size: 40
      },
      factory: (config: BlessedConfig) => new BlessedEffect(config)
    })

    this.register('Regenerating', {
      name: 'Regenerating',
      category: 'status' as AnimationCategory,
      description: 'Regaining HP each turn.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Regenerating',
        duration: 2000,
        color: '#00FF00',
        size: 40
      },
      factory: (config: RegeneratingConfig) => new RegeneratingEffect(config)
    })

    this.register('Sleeping', {
      name: 'Sleeping',
      category: 'status' as AnimationCategory,
      description: 'Unconscious, melee attacks are critical hits.',
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Sleeping',
        duration: 3000,
        color: '#9370DB',
        size: 40
      },
      factory: (config: SleepingConfig) => new SleepingEffect(config)
    })

    this.register('Frightened', {
      name: 'Frightened',
      category: 'status' as AnimationCategory,
      description: "Disadvantage on checks and attacks while source in sight.",
      defaults: {
        category: 'status' as AnimationCategory,
        name: 'Frightened',
        duration: 1500,
        color: '#4B0082',
        size: 40
      },
      factory: (config: FrightenedConfig) => new FrightenedEffect(config)
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
  // Spells
  | 'Fireball'
  | 'Magic Missile'
  | 'Guiding Bolt'
  | 'Thunderwave'
  | 'Darkness'
  | 'Web'
  | 'Stone Rain'
  | 'Ray of Frost'
  | 'Eldritch Blast'
  | 'Burning Hands'
  | 'Poison Spray'
  | 'Cone of Cold'
  | 'Breath Weapon'
  | 'Cure Wounds'
  | 'Heal'
  | 'Bless'
  | 'Lightning Bolt'
  | 'Shocking Grasp'
  | 'Sacred Flame'
  // Attacks
  | 'Longsword'
  | 'Rapier'
  | 'Warhammer'
  | 'Longbow'
  | 'Thrown Dagger'
  | 'Sling'
  // Movements
  | 'Walk'
  | 'Dash'
  | 'Teleport'
  // Status effects
  | 'Stunned'
  | 'Poisoned'
  | 'Prone'
  | 'Entangled'
  | 'Dying'
  | 'Flaming'
  | 'Chilled'
  | 'Dazed'
  | 'Blessed'
  | 'Regenerating'
  | 'Sleeping'
  | 'Frightened'
  | string // Allow custom names

/**
 * Quick access functions for common spells
 */
export const SpellTemplates = {
  // Projectiles
  fireball: (from: Point, to: Point) => new Fireball({ fromPosition: from, toPosition: to }),
  magicMissile: (from: Point, to: Point) => new MagicMissile({ fromPosition: from, toPosition: to }),
  guidingBolt: (from: Point, to: Point) => new GuidingBolt({ fromPosition: from, toPosition: to }),

  // Bursts
  thunderwave: (position: Point) => new Thunderwave({ position }),

  // Area effects
  darkness: (position: Point) => new Darkness({ position }),
  web: (position: Point) => new Web({ position }),
  stoneRain: (position: Point) => new StoneRain({ position }),

  // Rays
  rayOfFrost: (from: Point, to: Point) => new RayOfFrost({ fromPosition: from, toPosition: to }),
  eldritchBlast: (from: Point, to: Point) => new EldritchBlast({ fromPosition: from, toPosition: to }),

  // Cones
  burningHands: (position: Point, target: Point) => new BurningHands({ position, targetPosition: target }),
  poisonSpray: (position: Point, target: Point) => new PoisonSpray({ position, targetPosition: target }),
  coneOfCold: (position: Point, target: Point) => new ConeOfCold({ position, targetPosition: target }),
  breathWeapon: (position: Point, target: Point) => new BreathWeapon({ position, targetPosition: target }),

  // Healing
  cureWounds: (position: Point) => new CureWounds({ position }),
  heal: (position: Point) => new Heal({ position }),

  // Buff
  bless: (position: Point) => new Bless({ position }),

  // Line
  lightningBolt: (from: Point, to: Point) => new LightningBolt({ fromPosition: from, toPosition: to }),

  // Touch
  shockingGrasp: (position: Point) => new ShockingGrasp({ position }),

  // Pillar
  sacredFlame: (position: Point) => new SacredFlame({ position }),

  // Melee attacks
  longsword: (position: Point, target: Point) => new LongswordAttack({ position, target }),
  rapier: (position: Point, target: Point) => new RapierAttack({ position, target }),
  warhammer: (position: Point, target: Point) => new WarhammerAttack({ position, target }),

  // Ranged attacks
  longbow: (position: Point, target: Point) => new LongbowAttack({ position, target }),
  thrownDagger: (position: Point, target: Point) => new ThrownDaggerAttack({ position, target }),
  sling: (position: Point, target: Point) => new SlingAttack({ position, target }),

  // Movements
  walk: (from: Point, to: Point) => new WalkMovement({ fromPosition: from, toPosition: to }),
  dash: (from: Point, to: Point) => new DashMovement({ fromPosition: from, toPosition: to }),
  teleport: (from: Point, to: Point) => new TeleportMovement({ fromPosition: from, toPosition: to }),

  // Status effects
  stunned: (position: Point) => new StunnedEffect({ position }),
  poisoned: (position: Point) => new PoisonedEffect({ position }),
  prone: (position: Point) => new ProneEffect({ position }),
  entangled: (position: Point) => new EntangledEffect({ position }),
  dying: (position: Point) => new DyingEffect({ position }),
  flaming: (position: Point) => new FlamingEffect({ position }),
  chilled: (position: Point) => new ChilledEffect({ position }),
  dazed: (position: Point) => new DazedEffect({ position }),
  blessed: (position: Point) => new BlessedEffect({ position }),
  regenerating: (position: Point) => new RegeneratingEffect({ position }),
  sleeping: (position: Point) => new SleepingEffect({ position }),
  frightened: (position: Point) => new FrightenedEffect({ position })
} as const

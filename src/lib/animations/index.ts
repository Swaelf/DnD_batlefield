/**
 * Universal Animation Library
 *
 * A comprehensive animation system for D&D MapMaker supporting:
 * - Spells (projectiles, bursts, areas, rays)
 * - Combat animations (attacks, movements)
 * - Environmental effects (weather, lighting, ambient)
 * - Status effects (poison, burning, frozen)
 *
 * Architecture:
 * - types.ts: All type definitions
 * - core/: Base abstract classes
 * - spells/: Specific spell implementations
 * - combat/: Attack and movement animations
 * - environmental/: Weather and ambient effects
 * - registry/: Animation registry and factory
 * - utils/: Shared utilities (motion, easing, particles)
 * - api/: Public API for integration
 */

// Export all types
export * from './types'

// Utilities
export * from './utils/motion'
export * from './utils/easing'
export * from './utils/typeGuards'

// Core abstractions
export { AbstractProjectile } from './core/AbstractProjectile'
export type { ProjectileConfig } from './core/AbstractProjectile'
export { AbstractBurst } from './core/AbstractBurst'
export type { BurstConfig } from './core/AbstractBurst'
export { AbstractAreaEffect } from './core/AbstractAreaEffect'
export type { AreaEffectConfig } from './core/AbstractAreaEffect'
export { AbstractRay } from './core/AbstractRay'
export type { RayConfig } from './core/AbstractRay'
export { AbstractCone } from './core/AbstractCone'
export type { ConeConfig } from './core/AbstractCone'

// Attack abstractions
export { AbstractMeleeAttack } from './core/AbstractMeleeAttack'
export type { MeleeAttackConfig, MeleeAttackType } from './core/AbstractMeleeAttack'
export { AbstractRangedAttack } from './core/AbstractRangedAttack'
export type { RangedAttackConfig, RangedWeaponType } from './core/AbstractRangedAttack'

// Movement abstractions
export { AbstractMovement } from './core/AbstractMovement'
export type { MovementConfig, MovementType, EasingType } from './core/AbstractMovement'

// Status effect abstractions
export { AbstractStatusEffect } from './core/AbstractStatusEffect'
export type { StatusEffectConfig, StatusEffectType, AnimationType } from './core/AbstractStatusEffect'

// Spell implementations - Projectiles
export { Fireball } from './spells/projectile/Fireball'
export type { FireballConfig } from './spells/projectile/Fireball'
export { MagicMissile } from './spells/projectile/MagicMissile'
export type { MagicMissileConfig } from './spells/projectile/MagicMissile'
export { GuidingBolt } from './spells/projectile/GuidingBolt'
export type { GuidingBoltConfig } from './spells/projectile/GuidingBolt'

// Spell implementations - Burst
export { Thunderwave } from './spells/burst/Thunderwave'
export type { ThunderwaveConfig } from './spells/burst/Thunderwave'

// Spell implementations - Area
export { Darkness } from './spells/area/Darkness'
export type { DarknessConfig } from './spells/area/Darkness'
export { Web } from './spells/area/Web'
export type { WebConfig } from './spells/area/Web'
export { StoneRain } from './spells/area/StoneRain'
export type { StoneRainConfig } from './spells/area/StoneRain'

// Spell implementations - Ray
export { RayOfFrost } from './spells/ray/RayOfFrost'
export type { RayOfFrostConfig } from './spells/ray/RayOfFrost'
export { EldritchBlast } from './spells/ray/EldritchBlast'
export type { EldritchBlastConfig } from './spells/ray/EldritchBlast'

// Spell implementations - Cone
export { BurningHands } from './spells/cone/BurningHands'
export type { BurningHandsConfig } from './spells/cone/BurningHands'
export { PoisonSpray } from './spells/cone/PoisonSpray'
export type { PoisonSprayConfig } from './spells/cone/PoisonSpray'
export { ConeOfCold } from './spells/cone/ConeOfCold'
export type { ConeOfColdConfig } from './spells/cone/ConeOfCold'
export { BreathWeapon } from './spells/cone/BreathWeapon'
export type { BreathWeaponConfig, BreathType } from './spells/cone/BreathWeapon'

// Spell implementations - Healing
export { CureWounds } from './spells/healing/CureWounds'
export type { CureWoundsConfig } from './spells/healing/CureWounds'
export { Heal } from './spells/healing/Heal'
export type { HealConfig } from './spells/healing/Heal'

// Spell implementations - Buff
export { Bless } from './spells/buff/Bless'
export type { BlessConfig } from './spells/buff/Bless'

// Spell implementations - Line
export { LightningBolt } from './spells/line/LightningBolt'
export type { LightningBoltConfig } from './spells/line/LightningBolt'

// Spell implementations - Touch
export { ShockingGrasp } from './spells/touch/ShockingGrasp'
export type { ShockingGraspConfig } from './spells/touch/ShockingGrasp'

// Spell implementations - Pillar
export { SacredFlame } from './spells/pillar/SacredFlame'
export type { SacredFlameConfig } from './spells/pillar/SacredFlame'

// Attack implementations - Melee
export { LongswordAttack } from './spells/attacks/LongswordAttack'
export type { LongswordConfig } from './spells/attacks/LongswordAttack'
export { RapierAttack } from './spells/attacks/RapierAttack'
export type { RapierConfig } from './spells/attacks/RapierAttack'
export { WarhammerAttack } from './spells/attacks/WarhammerAttack'
export type { WarhammerConfig } from './spells/attacks/WarhammerAttack'

// Attack implementations - Ranged
export { LongbowAttack } from './spells/attacks/LongbowAttack'
export type { LongbowConfig } from './spells/attacks/LongbowAttack'
export { ThrownDaggerAttack } from './spells/attacks/ThrownDaggerAttack'
export type { ThrownDaggerConfig } from './spells/attacks/ThrownDaggerAttack'
export { SlingAttack } from './spells/attacks/SlingAttack'
export type { SlingConfig } from './spells/attacks/SlingAttack'

// Movement implementations
export { WalkMovement } from './spells/movement/WalkMovement'
export type { WalkConfig } from './spells/movement/WalkMovement'
export { DashMovement } from './spells/movement/DashMovement'
export type { DashConfig } from './spells/movement/DashMovement'
export { TeleportMovement } from './spells/movement/TeleportMovement'
export type { TeleportConfig } from './spells/movement/TeleportMovement'
export { ChargeMovement } from './spells/movement/ChargeMovement'
export type { ChargeConfig } from './spells/movement/ChargeMovement'
export { SneakMovement } from './spells/movement/SneakMovement'
export type { SneakConfig } from './spells/movement/SneakMovement'
export { ClimbMovement } from './spells/movement/ClimbMovement'
export type { ClimbConfig } from './spells/movement/ClimbMovement'
export { SwimMovement } from './spells/movement/SwimMovement'
export type { SwimConfig } from './spells/movement/SwimMovement'
export { FlyMovement } from './spells/movement/FlyMovement'
export type { FlyConfig } from './spells/movement/FlyMovement'
export { WithdrawMovement } from './spells/movement/WithdrawMovement'
export type { WithdrawConfig } from './spells/movement/WithdrawMovement'
export { DisengageMovement } from './spells/movement/DisengageMovement'
export type { DisengageConfig } from './spells/movement/DisengageMovement'

// Status effect implementations
export { StunnedEffect } from './spells/status/StunnedEffect'
export type { StunnedConfig } from './spells/status/StunnedEffect'
export { PoisonedEffect } from './spells/status/PoisonedEffect'
export type { PoisonedConfig } from './spells/status/PoisonedEffect'
export { ProneEffect } from './spells/status/ProneEffect'
export type { ProneConfig } from './spells/status/ProneEffect'
export { EntangledEffect } from './spells/status/EntangledEffect'
export type { EntangledConfig } from './spells/status/EntangledEffect'
export { DyingEffect } from './spells/status/DyingEffect'
export type { DyingConfig } from './spells/status/DyingEffect'
export { FlamingEffect } from './spells/status/FlamingEffect'
export type { FlamingConfig } from './spells/status/FlamingEffect'
export { ChilledEffect } from './spells/status/ChilledEffect'
export type { ChilledConfig } from './spells/status/ChilledEffect'
export { DazedEffect } from './spells/status/DazedEffect'
export type { DazedConfig } from './spells/status/DazedEffect'
export { BlessedEffect } from './spells/status/BlessedEffect'
export type { BlessedConfig } from './spells/status/BlessedEffect'
export { RegeneratingEffect } from './spells/status/RegeneratingEffect'
export type { RegeneratingConfig } from './spells/status/RegeneratingEffect'
export { SleepingEffect } from './spells/status/SleepingEffect'
export type { SleepingConfig } from './spells/status/SleepingEffect'
export { FrightenedEffect } from './spells/status/FrightenedEffect'
export type { FrightenedConfig } from './spells/status/FrightenedEffect'

// Registry and factory
export { AnimationRegistry, SpellTemplates } from './registry/AnimationRegistry'
export type { AnimationTemplate, RegisteredAnimationName } from './registry/AnimationRegistry'
export { AnimationFactory, createSpell, cast } from './registry/AnimationFactory'
export type { AnimationInstance, FactoryConfig, BatchConfig } from './registry/AnimationFactory'

// Public API
export { animationCaster, castSpell } from './api/AnimationCaster'
export type { CastOptions, CastResult } from './api/AnimationCaster'
export { timelineIntegration } from './api/TimelineIntegration'
export type { TimelineAnimationEvent, PersistentEffect } from './api/TimelineIntegration'

// Adapters
export {
  animationToUnifiedAction,
  getAnimationsByCategory,
  getAnimationsByType,
  getAnimationInfo,
  searchAnimations
} from './adapters/toUnifiedAction'

/**
 * Library Version
 */
export const VERSION = '0.4.0'

/**
 * Library Status
 */
export const STATUS = 'In Development - Phase 4: Timeline Integration & Public API'

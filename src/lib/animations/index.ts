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

// Spell implementations - Projectiles
export { Fireball } from './spells/projectile/Fireball'
export type { FireballConfig } from './spells/projectile/Fireball'
export { MagicMissile } from './spells/projectile/MagicMissile'
export type { MagicMissileConfig } from './spells/projectile/MagicMissile'

// Spell implementations - Burst
export { Thunderwave } from './spells/burst/Thunderwave'
export type { ThunderwaveConfig } from './spells/burst/Thunderwave'

// Spell implementations - Area
export { Darkness } from './spells/area/Darkness'
export type { DarknessConfig } from './spells/area/Darkness'

// Spell implementations - Ray
export { RayOfFrost } from './spells/ray/RayOfFrost'
export type { RayOfFrostConfig } from './spells/ray/RayOfFrost'

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

/**
 * Library Version
 */
export const VERSION = '0.4.0'

/**
 * Library Status
 */
export const STATUS = 'In Development - Phase 4: Timeline Integration & Public API'

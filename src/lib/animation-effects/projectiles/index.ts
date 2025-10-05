/**
 * Projectile system
 * Barrel export file for projectile components and utilities
 */

// ============================================================================
// Component Exports
// ============================================================================

export { AbstractProjectile } from './AbstractProjectile';
export type { AbstractProjectileProps } from './AbstractProjectile';

// ============================================================================
// Mutation System Exports
// ============================================================================

export {
  evaluateMutationTrigger,
  applyMutation,
  processMutations,
  interpolate,
  interpolateColor,
} from './ProjectileMutator';

// ============================================================================
// Preset Exports
// ============================================================================

export {
  ArrowProjectile,
  CrossbowBoltProjectile,
  MagicMissileProjectile,
  EldritchBlastProjectile,
  FireballProjectile,
  AcidSplashProjectile,
  ScorchingRayProjectile,
  ChromaticOrbProjectile,
  GuidingBoltProjectile,
  ThrowingDaggerProjectile,
  ThrowingAxeProjectile,
} from './presets';

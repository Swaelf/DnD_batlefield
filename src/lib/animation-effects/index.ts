/**
 * Animation Effects Library
 *
 * A comprehensive animation system for D&D battle map effects
 * Built on atomic primitives with compositional architecture
 *
 * @module animation-effects
 */

// ============================================================================
// Types
// ============================================================================

export type {
  // Primitive types
  EasingFunction,
  BasePrimitiveConfig,
  AnimationProgress,
  AnimationLifecycle,
  MovePrimitiveConfig,
  RotatePrimitiveConfig,
  ScalePrimitiveConfig,
  ColorPrimitiveConfig,
  TrailPrimitiveConfig,
  GlowPrimitiveConfig,
  PulsePrimitiveConfig,
  FlashPrimitiveConfig,
  ParticlesPrimitiveConfig,
  MotionPrimitiveConfig,
  EffectPrimitiveConfig,
  PrimitiveConfig,
  PrimitiveType,
  AnimationPrimitive,
  // Composer types
  CompositionType,
  BaseCompositionConfig,
  SequentialCompositionConfig,
  ParallelCompositionConfig,
  ConditionEvaluator,
  ConditionalBranch,
  ConditionalCompositionConfig,
  CompositionConfig,
  CompositionContext,
  CompositionLifecycle,
  AnimationComposition,
  CompositionBuilder,
  // Configuration types
  AnimationSystemConfig,
  PerformanceConfig,
  FactoryConfig,
  RegistryConfig,
  MotionPathConfig,
  MotionPathParams,
  LinearPathParams,
  CurvedPathParams,
  ArcPathParams,
  WavePathParams,
  OrbitPathParams,
  BouncePathParams,
  ProjectileConfig,
  ProjectileAppearance,
  CollisionConfig,
  // Projectile types (new abstract system)
  ShapeType,
  EffectType as ProjectileEffectType,
  MutationTrigger,
  ProjectileMutation,
  AbstractProjectileConfig,
  ProjectileState,
} from './types';

// ============================================================================
// Constants
// ============================================================================

export {
  // Frame rate
  TARGET_FPS,
  FRAME_DURATION,
  MAX_DELTA_TIME,
  // Durations
  DURATIONS,
  DEFAULT_PROJECTILE_DURATION,
  DEFAULT_SPELL_DURATION,
  DEFAULT_ENVIRONMENTAL_DURATION,
  // Easing
  EASING,
  DEFAULT_EASING,
  // Colors
  SPELL_COLORS,
  TRAIL_COLORS,
  GLOW_COLORS,
  // Visual effects
  DEFAULT_TRAIL,
  DEFAULT_GLOW,
  DEFAULT_PARTICLES,
  DEFAULT_PULSE,
  // Performance
  MAX_CONCURRENT_ANIMATIONS,
  POOL_SIZES,
  PERFORMANCE_THRESHOLDS,
  // Projectiles
  PROJECTILE_SPEEDS,
  DEFAULT_COLLISION_RADIUS,
  // Motion paths
  DEFAULT_ARC_HEIGHT,
  DEFAULT_WAVE,
  DEFAULT_BOUNCE,
} from './constants';

// ============================================================================
// Primitives
// ============================================================================

export {
  // Motion primitives
  Move,
  Rotate,
  Scale,
  Color,
  Fade,
  createFadeIn,
  createFadeOut,
  createFadeTo,
  // Effect primitives
  Trail,
  Glow,
  Pulse,
  Flash,
  Particles,
} from './primitives';

// ============================================================================
// Motion Path Generators
// ============================================================================

export {
  generateLinearPath,
  generateCurvedPath,
  generateOrbitPath,
  generateBouncePath,
  generateWavePath,
} from './motion';

// ============================================================================
// Composers
// ============================================================================

export { SequentialComposer, ParallelComposer, ConditionalComposer } from './composers';

export type {
  SequentialComposerProps,
  ParallelComposerProps,
  ConditionalComposerProps,
} from './composers';

// ============================================================================
// Projectiles
// ============================================================================

export {
  // Component
  AbstractProjectile,
  // Mutation system
  evaluateMutationTrigger,
  applyMutation,
  processMutations,
  interpolate,
  interpolateColor,
  // Presets
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
} from './projectiles';

export type { AbstractProjectileProps } from './projectiles';

// ============================================================================
// Registry & Factory
// ============================================================================

export {
  // Registry
  EffectRegistry,
  getAllAnimations,
  getSpellAnimations,
  getAttackAnimations,
  getMovementAnimations,
  searchAnimations,
  getRegisteredTemplateCount,
  logRegistryStats,
  // Factory (Task 12)
  EffectFactory,
} from './registry';

export type {
  AnimationTemplate,
  AnimationCategory,
  SearchCriteria,
  AnimationParams,
  ValidationResult,
} from './registry';

// ============================================================================
// Hooks
// ============================================================================

export { useAnimationLifecycle, useProgressTracker, useRAFController } from './hooks';

// ============================================================================
// Utilities
// ============================================================================

export {
  // Easing utilities
  createBezierEasing,
  createElasticEasing,
  createSteppedEasing,
  reverseEasing,
  mirrorEasing,
  chainEasing,
  scaleEasing,
  // Math utilities
  lerp,
  lerpPoint,
  cubicBezier,
  quadraticBezier,
  distance,
  angleBetween,
  normalize,
  dotProduct,
  crossProduct,
  rotatePoint,
  scalePoint,
  clamp,
  mapRange,
  shortestAngle,
  lerpAngle,
  toRadians,
  toDegrees,
  // Pool utilities
  ObjectPool,
  PoolManager,
  pointPool,
  createArrayPool,
  globalPoolManager,
} from './utils';

export type { PoolFactory, PoolReset, PooledPoint } from './utils';

// ============================================================================
// Default Configurations
// ============================================================================

export {
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_PERFORMANCE_CONFIG,
  DEFAULT_FACTORY_CONFIG,
  DEFAULT_REGISTRY_CONFIG,
} from './types';

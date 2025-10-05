/**
 * Animation effects library type definitions
 * Barrel export file for all type modules
 */

// Primitive types
export type {
  EasingFunction,
  BasePrimitiveConfig,
  AnimationProgress,
  AnimationLifecycle,
  MovePrimitiveConfig,
  RotatePrimitiveConfig,
  ScalePrimitiveConfig,
  ColorPrimitiveConfig,
  FadePrimitiveConfig,
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
} from './primitives';

// Composer types
export type {
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
} from './composers';

// Configuration types
export type {
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
} from './config';

// Default configurations
export {
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_PERFORMANCE_CONFIG,
  DEFAULT_FACTORY_CONFIG,
  DEFAULT_REGISTRY_CONFIG,
} from './config';

// Projectile types
export type {
  ShapeType,
  EffectType,
  MutationTrigger,
  ProjectileMutation,
  AbstractProjectileConfig,
  ProjectileState,
} from './projectiles';

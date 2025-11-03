/**
 * Motion path generators
 * Barrel export file for all motion path generation functions
 */

// ============================================================================
// Type Exports
// ============================================================================

export type { MotionPathGenerator } from './LinearMotion';
export type { LinearMotionConfig } from './LinearMotion';
export type { CurvedMotionConfig, ArcDirection } from './CurvedMotion';
export type { OrbitMotionConfig } from './OrbitMotion';
export type { BounceMotionConfig } from './BounceMotion';
export type { WaveConfig, WaveType } from './WaveMotion';
export type { MagicMissileCurveConfig } from './MagicMissileCurve';

// ============================================================================
// Linear Motion
// ============================================================================

export {
  createLinearMotion,
  getLinearDistance,
  getLinearDirection,
  generateLinearPath, // Legacy
} from './LinearMotion';

// ============================================================================
// Curved Motion
// ============================================================================

export {
  createQuadraticCurve,
  createCubicCurve,
  createArc,
  calculateControlPoint,
  generateCurvedPath, // Legacy
} from './CurvedMotion';

// ============================================================================
// Orbit Motion
// ============================================================================

export {
  createOrbit,
  createEllipticalOrbit,
  createSpiral,
  getPointOnCircle,
  generateOrbitPath, // Legacy
} from './OrbitMotion';

// ============================================================================
// Bounce Motion
// ============================================================================

export {
  createBounce,
  calculateBounceHeight,
  createGravityDrop,
  createProjectileArc,
  generateBouncePath, // Legacy
} from './BounceMotion';

// ============================================================================
// Wave Motion
// ============================================================================

export {
  createSineWave,
  createWave,
  createDampedWave,
  generateWavePath, // Legacy
} from './WaveMotion';

// ============================================================================
// Magic Missile Curve
// ============================================================================

export {
  createMagicMissileCurve,
  seedFromSpellId,
} from './MagicMissileCurve';

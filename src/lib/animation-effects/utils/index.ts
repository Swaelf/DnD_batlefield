/**
 * Animation effects library utilities
 * Barrel export file for all utility modules
 */

// Easing utilities
export {
  createBezierEasing,
  createElasticEasing,
  createSteppedEasing,
  reverseEasing,
  mirrorEasing,
  chainEasing,
  scaleEasing,
} from './easing';

// Math utilities
export {
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
} from './math';

// Pool utilities
export {
  ObjectPool,
  PoolManager,
  pointPool,
  createArrayPool,
  globalPoolManager,
} from './pool';

export type { PoolFactory, PoolReset, PooledPoint } from './pool';

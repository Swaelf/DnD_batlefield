/**
 * Default constants for the animation effects library
 *
 * This file contains default values for:
 * - Animation durations
 * - Easing functions
 * - Colors and visual properties
 * - Frame rate and performance constants
 */

import { EasingFunction } from '../types';

// ============================================================================
// Frame Rate Constants
// ============================================================================

/**
 * Target frames per second for animations
 */
export const TARGET_FPS = 60;

/**
 * Frame duration in milliseconds (16.67ms at 60fps)
 */
export const FRAME_DURATION = 1000 / TARGET_FPS;

/**
 * Maximum delta time to prevent time jumps (100ms)
 */
export const MAX_DELTA_TIME = 100;

// ============================================================================
// Duration Constants
// ============================================================================

/**
 * Default animation durations in milliseconds
 */
export const DURATIONS = {
  /** Very fast animation (100ms) */
  INSTANT: 100,
  /** Fast animation (300ms) */
  FAST: 300,
  /** Normal animation speed (500ms) */
  NORMAL: 500,
  /** Slow animation (800ms) */
  SLOW: 800,
  /** Very slow animation (1200ms) */
  VERY_SLOW: 1200,
} as const;

/**
 * Default duration for projectile animations (milliseconds)
 */
export const DEFAULT_PROJECTILE_DURATION = DURATIONS.NORMAL;

/**
 * Default duration for spell effects (milliseconds)
 */
export const DEFAULT_SPELL_DURATION = DURATIONS.SLOW;

/**
 * Default duration for environmental effects (milliseconds)
 */
export const DEFAULT_ENVIRONMENTAL_DURATION = DURATIONS.VERY_SLOW;

// ============================================================================
// Easing Functions
// ============================================================================

/**
 * Standard easing functions
 * All functions take t (0-1) and return eased value (0-1)
 */
export const EASING: Record<string, EasingFunction> = {
  /** No easing - constant speed */
  linear: (t: number): number => t,

  /** Ease in - slow start, fast end */
  easeIn: (t: number): number => t * t,

  /** Ease out - fast start, slow end */
  easeOut: (t: number): number => t * (2 - t),

  /** Ease in-out - slow start and end, fast middle */
  easeInOut: (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  /** Cubic ease in - very slow start */
  easeInCubic: (t: number): number => t * t * t,

  /** Cubic ease out - very slow end */
  easeOutCubic: (t: number): number => --t * t * t + 1,

  /** Cubic ease in-out - very slow start and end */
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  /** Elastic ease out - bouncy end */
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  /** Bounce ease out - ball bounce effect */
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
} as const;

/**
 * Default easing function
 */
export const DEFAULT_EASING = EASING.easeInOut;

// ============================================================================
// Color Constants
// ============================================================================

/**
 * Default colors for spell effects
 */
export const SPELL_COLORS = {
  FIRE: '#ff4500',
  ICE: '#4169e1',
  LIGHTNING: '#ffd700',
  POISON: '#32cd32',
  NECROTIC: '#800080',
  RADIANT: '#ffd700',
  FORCE: '#ff00ff',
  PSYCHIC: '#ff1493',
  ACID: '#7fff00',
  THUNDER: '#1e90ff',
} as const;

/**
 * Default colors for projectile trails
 */
export const TRAIL_COLORS = {
  DEFAULT: '#ffffff',
  FIRE: '#ff6347',
  ICE: '#87ceeb',
  LIGHTNING: '#ffff00',
  POISON: '#9acd32',
  MAGIC: '#dda0dd',
} as const;

/**
 * Default glow colors
 */
export const GLOW_COLORS = {
  DEFAULT: '#ffffff',
  FIRE: '#ff4500',
  ICE: '#4169e1',
  MAGIC: '#9370db',
  DIVINE: '#ffd700',
} as const;

// ============================================================================
// Visual Effect Constants
// ============================================================================

/**
 * Default trail configuration
 */
export const DEFAULT_TRAIL = {
  /** Number of trail segments */
  segments: 10,
  /** Trail fade rate (0-1 per frame) */
  fadeRate: 0.05,
  /** Trail width in pixels */
  width: 3,
} as const;

/**
 * Default glow configuration
 */
export const DEFAULT_GLOW = {
  /** Glow radius in pixels */
  radius: 10,
  /** Glow intensity (0-1) */
  intensity: 0.8,
} as const;

/**
 * Default particle configuration
 */
export const DEFAULT_PARTICLES = {
  /** Particles per second */
  emissionRate: 20,
  /** Particle lifetime in milliseconds */
  lifetime: 1000,
  /** Particle size range [min, max] */
  sizeRange: [2, 5] as [number, number],
} as const;

/**
 * Default pulse configuration
 */
export const DEFAULT_PULSE = {
  /** Scale range [min, max] */
  scaleRange: [0.8, 1.2] as [number, number],
  /** Opacity range [min, max] */
  opacityRange: [0.6, 1.0] as [number, number],
  /** Pulses per second */
  frequency: 2,
} as const;

// ============================================================================
// Performance Constants
// ============================================================================

/**
 * Maximum number of concurrent animations
 */
export const MAX_CONCURRENT_ANIMATIONS = 20;

/**
 * Object pool sizes for frequently created objects
 */
export const POOL_SIZES = {
  /** Pool size for animation primitives */
  PRIMITIVES: 50,
  /** Pool size for particle objects */
  PARTICLES: 200,
  /** Pool size for trail segments */
  TRAIL_SEGMENTS: 100,
} as const;

/**
 * Performance monitoring thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  /** FPS threshold for degradation warning */
  LOW_FPS: 30,
  /** FPS threshold for critical degradation */
  CRITICAL_FPS: 15,
  /** Memory usage threshold in MB */
  HIGH_MEMORY: 100,
} as const;

// ============================================================================
// Projectile Constants
// ============================================================================

/**
 * Default projectile speeds (pixels per second)
 */
export const PROJECTILE_SPEEDS = {
  /** Very slow projectile (200 px/s) */
  VERY_SLOW: 200,
  /** Slow projectile (400 px/s) */
  SLOW: 400,
  /** Normal projectile (600 px/s) */
  NORMAL: 600,
  /** Fast projectile (800 px/s) */
  FAST: 800,
  /** Very fast projectile (1200 px/s) */
  VERY_FAST: 1200,
} as const;

/**
 * Default projectile collision radius in pixels
 */
export const DEFAULT_COLLISION_RADIUS = 10;

// ============================================================================
// Motion Path Constants
// ============================================================================

/**
 * Default arc height as percentage of distance
 */
export const DEFAULT_ARC_HEIGHT = 0.3;

/**
 * Default wave parameters
 */
export const DEFAULT_WAVE = {
  /** Wave amplitude in pixels */
  amplitude: 50,
  /** Waves per 1000 pixels */
  frequency: 0.01,
  /** Wave phase offset */
  phase: 0,
} as const;

/**
 * Default bounce parameters
 */
export const DEFAULT_BOUNCE = {
  /** Number of bounces */
  bounces: 3,
  /** Bounce height as fraction of distance */
  height: 0.5,
  /** Bounce damping factor */
  damping: 0.7,
} as const;

/**
 * Core primitive type definitions for the animation effects library
 *
 * These types define the fundamental building blocks for all animations:
 * - Base primitive interfaces
 * - Motion primitive types
 * - Effect primitive types
 * - Common configuration types
 */

import { Point } from '@/types';

// ============================================================================
// Base Primitive Types
// ============================================================================

/**
 * Easing function type for smooth interpolation
 */
export type EasingFunction = (t: number) => number;

/**
 * Base configuration shared by all animation primitives
 */
export interface BasePrimitiveConfig {
  /** Duration of the animation in milliseconds */
  duration: number;
  /** Delay before animation starts in milliseconds */
  delay?: number;
  /** Easing function for interpolation */
  easing?: EasingFunction;
  /** Whether the animation should loop */
  loop?: boolean;
  /** Number of times to repeat (undefined = infinite when loop is true) */
  repeat?: number;
}

/**
 * Animation progress state
 */
export interface AnimationProgress {
  /** Current time in milliseconds */
  currentTime: number;
  /** Total duration in milliseconds */
  totalDuration: number;
  /** Progress value between 0 and 1 */
  progress: number;
  /** Eased progress value between 0 and 1 */
  easedProgress: number;
  /** Whether the animation is complete */
  isComplete: boolean;
}

/**
 * Lifecycle callbacks for animation primitives
 */
export interface AnimationLifecycle {
  /** Called when animation starts */
  onStart?: () => void;
  /** Called on each frame with progress */
  onUpdate?: (progress: AnimationProgress) => void;
  /** Called when animation completes */
  onComplete?: () => void;
  /** Called when animation is cancelled */
  onCancel?: () => void;
}

// ============================================================================
// Motion Primitive Types
// ============================================================================

/**
 * Move primitive - translates object from start to end position
 */
export interface MovePrimitiveConfig extends BasePrimitiveConfig {
  type: 'move';
  /** Starting position */
  from: Point;
  /** Ending position */
  to: Point;
  /** Motion path generator (linear, curved, etc.) */
  pathType?: 'linear' | 'curved' | 'arc' | 'wave';
}

/**
 * Rotate primitive - rotates object around a point
 */
export interface RotatePrimitiveConfig extends BasePrimitiveConfig {
  type: 'rotate';
  /** Starting rotation in degrees */
  fromRotation: number;
  /** Ending rotation in degrees */
  toRotation: number;
  /** Point to rotate around (defaults to object center) */
  pivot?: Point;
}

/**
 * Scale primitive - changes object size
 */
export interface ScalePrimitiveConfig extends BasePrimitiveConfig {
  type: 'scale';
  /** Starting scale (1.0 = normal) */
  fromScale: number;
  /** Ending scale (1.0 = normal) */
  toScale: number;
  /** Scale anchor point (defaults to center) */
  anchor?: Point;
}

/**
 * Color primitive - transitions object color
 */
export interface ColorPrimitiveConfig extends BasePrimitiveConfig {
  type: 'color';
  /** Starting color (hex or rgba) */
  fromColor: string;
  /** Ending color (hex or rgba) */
  toColor: string;
  /** Opacity transition (0-1) */
  opacity?: { from: number; to: number };
}

/**
 * Fade primitive - opacity animation
 */
export interface FadePrimitiveConfig extends BasePrimitiveConfig {
  type: 'fade';
  /** Starting opacity (0-1) */
  fromOpacity: number;
  /** Ending opacity (0-1) */
  toOpacity: number;
}

// ============================================================================
// Effect Primitive Types
// ============================================================================

/**
 * Trail primitive - creates motion trail effect
 */
export interface TrailPrimitiveConfig extends BasePrimitiveConfig {
  type: 'trail';
  /** Number of trail segments */
  segments: number;
  /** Trail color */
  color: string;
  /** Trail opacity fade rate */
  fadeRate: number;
  /** Trail width */
  width: number;
}

/**
 * Glow primitive - adds glow/aura effect
 */
export interface GlowPrimitiveConfig extends BasePrimitiveConfig {
  type: 'glow';
  /** Glow color */
  color: string;
  /** Glow radius in pixels */
  radius: number;
  /** Glow intensity (0-1) */
  intensity: number;
  /** Pulse effect configuration */
  pulse?: {
    enabled: boolean;
    speed: number;
    range: [number, number];
  };
}

/**
 * Pulse primitive - pulsing scale/opacity effect
 */
export interface PulsePrimitiveConfig extends BasePrimitiveConfig {
  type: 'pulse';
  /** Scale range [min, max] */
  scaleRange: [number, number];
  /** Opacity range [min, max] */
  opacityRange?: [number, number];
  /** Pulse frequency (pulses per second) */
  frequency: number;
}

/**
 * Flash primitive - quick flash effect
 */
export interface FlashPrimitiveConfig extends BasePrimitiveConfig {
  type: 'flash';
  /** Flash color */
  color: string;
  /** Flash intensity (0-1) */
  intensity: number;
  /** Number of flashes */
  count: number;
}

/**
 * Particles primitive - particle emission effect
 */
export interface ParticlesPrimitiveConfig extends BasePrimitiveConfig {
  type: 'particles';
  /** Particle emission rate (particles per second) */
  emissionRate: number;
  /** Particle lifetime in milliseconds */
  particleLifetime: number;
  /** Particle color(s) */
  colors: string[];
  /** Particle size range [min, max] */
  sizeRange: [number, number];
  /** Particle velocity range */
  velocityRange: { min: Point; max: Point };
  /** Gravity effect on particles */
  gravity?: Point;
}

// ============================================================================
// Union Types
// ============================================================================

/**
 * Union of all motion primitive configurations
 */
export type MotionPrimitiveConfig =
  | MovePrimitiveConfig
  | RotatePrimitiveConfig
  | ScalePrimitiveConfig
  | ColorPrimitiveConfig
  | FadePrimitiveConfig;

/**
 * Union of all effect primitive configurations
 */
export type EffectPrimitiveConfig =
  | TrailPrimitiveConfig
  | GlowPrimitiveConfig
  | PulsePrimitiveConfig
  | FlashPrimitiveConfig
  | ParticlesPrimitiveConfig;

/**
 * Union of all primitive configurations
 */
export type PrimitiveConfig = MotionPrimitiveConfig | EffectPrimitiveConfig;

/**
 * Primitive type discriminator
 */
export type PrimitiveType = PrimitiveConfig['type'];

// ============================================================================
// Runtime Primitive Interface
// ============================================================================

/**
 * Runtime interface for animation primitives
 */
export interface AnimationPrimitive<T extends PrimitiveConfig = PrimitiveConfig> {
  /** Unique identifier for this primitive instance */
  id: string;
  /** Primitive configuration */
  config: T;
  /** Lifecycle callbacks */
  lifecycle: AnimationLifecycle;
  /** Current animation progress */
  progress: AnimationProgress;
  /** Start the animation */
  start: () => void;
  /** Stop the animation */
  stop: () => void;
  /** Pause the animation */
  pause: () => void;
  /** Resume the animation */
  resume: () => void;
  /** Update the animation (called each frame) */
  update: (deltaTime: number) => void;
  /** Clean up resources */
  cleanup: () => void;
}

/**
 * Projectile type definitions for the animation effects library
 *
 * These types define the abstract projectile system with support for:
 * - Generic shape representation
 * - Motion path integration
 * - Effect attachment
 * - Runtime mutations (transformations during flight)
 */

import { Point } from '@/types';
import { MotionPathGenerator } from '../motion/LinearMotion';

// ============================================================================
// Shape Types
// ============================================================================

/**
 * Supported projectile shapes
 */
export type ShapeType = 'circle' | 'triangle' | 'rectangle' | 'star' | 'custom';

/**
 * Supported effect types that can attach to projectiles
 */
export type EffectType = 'trail' | 'glow' | 'pulse' | 'flash' | 'particles';

// ============================================================================
// Mutation System
// ============================================================================

/**
 * Mutation trigger conditions
 */
export type MutationTrigger =
  | { type: 'progress'; value: number } // At X% progress (0-1)
  | { type: 'distance'; value: number } // At X pixels from start
  | { type: 'time'; value: number } // At X milliseconds elapsed
  | { type: 'position'; value: Point; threshold?: number }; // At specific position (within threshold)

/**
 * Projectile mutation configuration
 * Defines how a projectile transforms during flight
 */
export interface ProjectileMutation {
  /** When to trigger this mutation */
  trigger: MutationTrigger;
  /** New shape (undefined = keep current) */
  shape?: ShapeType;
  /** New color (undefined = keep current) */
  color?: string;
  /** New size (undefined = keep current) */
  size?: number;
  /** New effects (undefined = keep current, empty array = remove all) */
  effects?: EffectType[];
  /** Duration of mutation transition in milliseconds */
  transitionDuration?: number;
}

// ============================================================================
// Projectile Configuration
// ============================================================================

/**
 * Abstract projectile configuration
 * Main configuration for creating projectiles with mutations
 */
export interface AbstractProjectileConfig {
  /** Starting position */
  from: Point;
  /** Target position */
  to: Point;
  /** Projectile shape */
  shape: ShapeType;
  /** Projectile color (hex or rgba) */
  color: string;
  /** Projectile size in pixels (default: 10) */
  size?: number;
  /** Motion path generator (uses linear if not provided) */
  motion?: MotionPathGenerator;
  /** Active effects on the projectile */
  effects?: EffectType[];
  /** Mutations to apply during flight */
  mutations?: ProjectileMutation[];
  /** Total animation duration in milliseconds (default: 1000) */
  duration?: number;
  /** Delay before starting in milliseconds (default: 0) */
  delay?: number;
  /** Progress callback for tracking position */
  onProgress?: (progress: number, position: Point) => void;
  /** Mutation callback when mutation triggers */
  onMutate?: (mutation: ProjectileMutation) => void;
  /** Completion callback */
  onComplete?: () => void;
}

/**
 * Runtime projectile state
 * Internal state tracked during animation
 */
export interface ProjectileState {
  /** Current position */
  position: Point;
  /** Current progress (0-1) */
  progress: number;
  /** Elapsed time in milliseconds */
  elapsedTime: number;
  /** Total distance traveled */
  distanceTraveled: number;
  /** Current shape */
  currentShape: ShapeType;
  /** Current color */
  currentColor: string;
  /** Current size */
  currentSize: number;
  /** Current active effects */
  currentEffects: EffectType[];
  /** Mutations that have already been applied */
  appliedMutations: Set<number>;
}

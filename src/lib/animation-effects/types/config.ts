/**
 * Configuration type definitions for the animation effects library
 *
 * These types define configuration options for:
 * - Global animation settings
 * - Performance configuration
 * - Factory settings
 * - Registry options
 */

import { Point } from '@/types';
import { EasingFunction } from './primitives';

// ============================================================================
// Global Configuration
// ============================================================================

/**
 * Global animation system configuration
 */
export interface AnimationSystemConfig {
  /** Target frame rate (default: 60fps) */
  targetFPS: number;
  /** Maximum number of concurrent animations */
  maxConcurrentAnimations: number;
  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Enable debug mode with visual aids */
  debugMode: boolean;
  /** Default easing function for all animations */
  defaultEasing: EasingFunction;
  /** Global time scale (1.0 = normal, 0.5 = half speed, etc.) */
  timeScale: number;
}

/**
 * Default animation system configuration
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationSystemConfig = {
  targetFPS: 60,
  maxConcurrentAnimations: 20,
  enablePerformanceMonitoring: false,
  debugMode: false,
  defaultEasing: (t: number) => t, // Linear
  timeScale: 1.0,
};

// ============================================================================
// Performance Configuration
// ============================================================================

/**
 * Performance optimization settings
 */
export interface PerformanceConfig {
  /** Enable object pooling for frequently created objects */
  enableObjectPooling: boolean;
  /** Pool size for each object type */
  poolSize: number;
  /** Enable automatic cleanup of completed animations */
  autoCleanup: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
  /** Maximum memory usage in MB (soft limit) */
  maxMemoryUsage: number;
  /** Enable automatic degradation on performance issues */
  enableAutoDegradation: boolean;
  /** FPS threshold to trigger degradation */
  degradationThreshold: number;
}

/**
 * Default performance configuration
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  enableObjectPooling: true,
  poolSize: 50,
  autoCleanup: true,
  cleanupInterval: 5000,
  maxMemoryUsage: 100,
  enableAutoDegradation: true,
  degradationThreshold: 30,
};

// ============================================================================
// Factory Configuration
// ============================================================================

/**
 * Effect factory configuration
 */
export interface FactoryConfig {
  /** Enable caching of created effects */
  enableCaching: boolean;
  /** Maximum cache size */
  maxCacheSize: number;
  /** Enable validation of effect configurations */
  enableValidation: boolean;
  /** Throw errors on invalid configurations */
  strictMode: boolean;
}

/**
 * Default factory configuration
 */
export const DEFAULT_FACTORY_CONFIG: FactoryConfig = {
  enableCaching: false, // Disabled by default to avoid stale state
  maxCacheSize: 100,
  enableValidation: true,
  strictMode: true,
};

// ============================================================================
// Registry Configuration
// ============================================================================

/**
 * Effect registry configuration
 */
export interface RegistryConfig {
  /** Enable automatic registration of built-in effects */
  autoRegisterBuiltins: boolean;
  /** Allow overriding registered effects */
  allowOverride: boolean;
  /** Enable registry events */
  enableEvents: boolean;
}

/**
 * Default registry configuration
 */
export const DEFAULT_REGISTRY_CONFIG: RegistryConfig = {
  autoRegisterBuiltins: true,
  allowOverride: false,
  enableEvents: true,
};

// ============================================================================
// Motion Path Configuration
// ============================================================================

/**
 * Motion path generation configuration
 */
export interface MotionPathConfig {
  /** Type of motion path */
  type: 'linear' | 'curved' | 'arc' | 'wave' | 'orbit' | 'bounce';
  /** Start point */
  start: Point;
  /** End point */
  end: Point;
  /** Path-specific parameters */
  params?: MotionPathParams;
}

/**
 * Path-specific parameter configurations
 */
export type MotionPathParams =
  | LinearPathParams
  | CurvedPathParams
  | ArcPathParams
  | WavePathParams
  | OrbitPathParams
  | BouncePathParams;

export interface LinearPathParams {
  type: 'linear';
}

export interface CurvedPathParams {
  type: 'curved';
  /** Control points for bezier curve */
  controlPoints: Point[];
}

export interface ArcPathParams {
  type: 'arc';
  /** Arc height (positive = above line, negative = below) */
  height: number;
}

export interface WavePathParams {
  type: 'wave';
  /** Wave amplitude */
  amplitude: number;
  /** Wave frequency (waves per unit distance) */
  frequency: number;
  /** Wave phase offset (0-1) */
  phase: number;
}

export interface OrbitPathParams {
  type: 'orbit';
  /** Center point of orbit */
  center: Point;
  /** Orbit radius */
  radius: number;
  /** Starting angle in degrees */
  startAngle: number;
  /** Ending angle in degrees */
  endAngle: number;
  /** Orbit direction (clockwise or counter-clockwise) */
  clockwise: boolean;
}

export interface BouncePathParams {
  type: 'bounce';
  /** Number of bounces */
  bounces: number;
  /** Bounce height as fraction of total distance */
  height: number;
  /** Bounce damping factor (0-1) */
  damping: number;
}

// ============================================================================
// Projectile Configuration
// ============================================================================

/**
 * Abstract projectile configuration
 */
export interface ProjectileConfig {
  /** Initial position */
  position: Point;
  /** Target position */
  target: Point;
  /** Projectile speed (pixels per second) */
  speed: number;
  /** Motion path type */
  motionType: MotionPathConfig['type'];
  /** Motion path parameters */
  motionParams?: MotionPathParams;
  /** Visual appearance mutations */
  appearance?: ProjectileAppearance;
  /** Collision detection settings */
  collision?: CollisionConfig;
}

/**
 * Projectile visual appearance configuration
 */
export interface ProjectileAppearance {
  /** Base color */
  color?: string;
  /** Size in pixels */
  size?: number;
  /** Trail effect */
  trail?: {
    enabled: boolean;
    length: number;
    color?: string;
    fadeRate: number;
  };
  /** Glow effect */
  glow?: {
    enabled: boolean;
    radius: number;
    color?: string;
    intensity: number;
  };
  /** Rotation behavior */
  rotation?: {
    enabled: boolean;
    speed: number; // Degrees per second
  };
}

/**
 * Collision detection configuration
 */
export interface CollisionConfig {
  /** Enable collision detection */
  enabled: boolean;
  /** Collision radius in pixels */
  radius: number;
  /** Collision layers to check */
  layers?: string[];
  /** Callback on collision */
  onCollision?: (target: unknown) => void;
}

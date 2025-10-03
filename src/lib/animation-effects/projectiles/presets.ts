/**
 * Projectile presets
 *
 * Pre-configured projectile settings for common D&D projectile types.
 * These presets can be used directly or customized for specific needs.
 */

import { Point } from '@/types';
import type { AbstractProjectileConfig } from '../types/projectiles';
import { createLinearMotion, createArc } from '../motion';

// ============================================================================
// Basic Projectiles
// ============================================================================

/**
 * Arrow projectile preset
 * Simple linear flight with trail effect
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Arrow projectile configuration
 */
export function ArrowProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'triangle',
    color: '#8B4513',
    size: 10,
    motion: createLinearMotion(from, to),
    effects: ['trail'],
    duration: 800,
  };
}

/**
 * Crossbow bolt projectile preset
 * Faster than arrow with shorter trail
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Crossbow bolt configuration
 */
export function CrossbowBoltProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'rectangle',
    color: '#5C4033',
    size: 8,
    motion: createLinearMotion(from, to),
    effects: ['trail'],
    duration: 600,
  };
}

// ============================================================================
// Magic Projectiles
// ============================================================================

/**
 * Magic missile projectile preset
 * Glowing star with curved path and glow effect
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Magic missile configuration
 */
export function MagicMissileProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'star',
    color: '#4169E1',
    size: 8,
    motion: createArc(from, to, 20), // Slight arc for visual interest
    effects: ['trail', 'glow', 'pulse'],
    duration: 1000,
  };
}

/**
 * Eldritch blast projectile preset
 * Dark energy with crackling effects
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Eldritch blast configuration
 */
export function EldritchBlastProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'circle',
    color: '#8B008B',
    size: 12,
    motion: createLinearMotion(from, to),
    effects: ['trail', 'glow', 'flash'],
    duration: 900,
  };
}

// ============================================================================
// Explosive Projectiles
// ============================================================================

/**
 * Fireball projectile preset
 * Grows and accelerates with impact explosion
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Fireball configuration with mutation
 */
export function FireballProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'circle',
    color: '#FF4500',
    size: 15,
    motion: createArc(from, to, 30),
    effects: ['trail', 'glow', 'pulse'],
    mutations: [
      {
        trigger: { type: 'progress', value: 0.95 },
        shape: 'star',
        size: 40,
        color: '#FF6347',
        effects: ['flash', 'glow'],
        transitionDuration: 100,
      },
    ],
    duration: 1200,
  };
}

/**
 * Acid splash projectile preset
 * Green orb that splatters on impact
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Acid splash configuration
 */
export function AcidSplashProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'circle',
    color: '#32CD32',
    size: 12,
    motion: createArc(from, to, 25),
    effects: ['trail', 'glow'],
    mutations: [
      {
        trigger: { type: 'progress', value: 0.9 },
        size: 25,
        color: '#228B22',
        effects: ['flash'],
        transitionDuration: 150,
      },
    ],
    duration: 1000,
  };
}

// ============================================================================
// Advanced Projectiles
// ============================================================================

/**
 * Scorching ray projectile preset
 * Beam of fire with intense glow
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Scorching ray configuration
 */
export function ScorchingRayProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'rectangle',
    color: '#FF4500',
    size: 6,
    motion: createLinearMotion(from, to),
    effects: ['trail', 'glow', 'pulse'],
    duration: 700,
  };
}

/**
 * Chromatic orb projectile preset
 * Color-shifting orb with complex mutations
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Chromatic orb configuration
 */
export function ChromaticOrbProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'circle',
    color: '#FF0000',
    size: 14,
    motion: createLinearMotion(from, to),
    effects: ['trail', 'glow', 'pulse'],
    mutations: [
      {
        trigger: { type: 'progress', value: 0.33 },
        color: '#00FF00',
        transitionDuration: 200,
      },
      {
        trigger: { type: 'progress', value: 0.66 },
        color: '#0000FF',
        transitionDuration: 200,
      },
    ],
    duration: 1100,
  };
}

/**
 * Guiding bolt projectile preset
 * Holy radiant projectile with trailing light
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Guiding bolt configuration
 */
export function GuidingBoltProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'star',
    color: '#FFD700',
    size: 10,
    motion: createLinearMotion(from, to),
    effects: ['trail', 'glow', 'pulse', 'flash'],
    duration: 950,
  };
}

// ============================================================================
// Thrown Weapons
// ============================================================================

/**
 * Throwing dagger projectile preset
 * Spinning dagger with minimal effects
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Dagger configuration
 */
export function ThrowingDaggerProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'triangle',
    color: '#C0C0C0',
    size: 9,
    motion: createArc(from, to, 15),
    effects: ['trail'],
    duration: 750,
  };
}

/**
 * Throwing axe projectile preset
 * Heavier projectile with arc
 *
 * @param from - Starting position
 * @param to - Target position
 * @returns Axe configuration
 */
export function ThrowingAxeProjectile(from: Point, to: Point): AbstractProjectileConfig {
  return {
    from,
    to,
    shape: 'rectangle',
    color: '#8B4513',
    size: 12,
    motion: createArc(from, to, 35),
    effects: ['trail'],
    duration: 900,
  };
}

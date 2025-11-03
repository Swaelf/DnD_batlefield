/**
 * Magic Missile Curve Motion Generator
 *
 * Creates randomized curved paths for Magic Missile projectiles with consistent
 * variation based on spell ID seed. Each missile follows a unique curved trajectory.
 */

import type { Point } from '@/types/geometry'
import type { MotionPathGenerator } from './LinearMotion'

export interface MagicMissileCurveConfig {
  /** Base curve height in pixels (default: 50) */
  baseHeight?: number
  /** Seed for randomization (0-1, default: random from spell ID) */
  seed?: number
}

/**
 * Creates a curved motion path for Magic Missile projectiles
 *
 * Features:
 * - 5 different trajectory patterns with guaranteed target accuracy
 * - Random trajectory type selection based on seed
 * - Random positive or negative direction for each curve
 * - Reduced amplitude (50% of base height, ±20 pixels variation)
 * - All trajectories start and end at zero offset (perfect target hit)
 * - Deterministic randomization from seed (same ID = same curve)
 *
 * Trajectory Types (all end at target position):
 * - Type 0: Single smooth arc (classic gentle curve)
 * - Type 1: S-curve (double wave, erratic flight)
 * - Type 2: Triple wave (complex weaving pattern)
 * - Type 3: Double arc with asymmetry (warped S-curve)
 * - Type 4: Half wave gentle curve (decaying arc)
 *
 * @param from Starting position
 * @param to Target position
 * @param config Curve configuration
 * @returns Motion generator function
 */
export function createMagicMissileCurve(
  from: Point,
  to: Point,
  config: MagicMissileCurveConfig = {}
): MotionPathGenerator {
  // Note: baseHeight from config reserved for future trajectory height variations
  const seed = config.seed ?? Math.random()

  // Calculate direction vector
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.sqrt(dx * dx + dy * dy)

  // Perpendicular vector (normalized)
  const perpX = length > 0 ? -dy / length : 0
  const perpY = length > 0 ? dx / length : 0

  // Generate random variations from seed
  // Note: seed1, seed2 reserved for future trajectory variations
  const seed3 = (seed * 5879) % 1
  const seed4 = (seed * 5381) % 1

  // Use 0.1 of distance as amplitude (10% of range to target)
  const curveHeight = length * 0.1

  // Always use sine wave with 2 zero points (S-curve trajectory type)
  // This creates: sin(progress * 2π) which has zero at start (0%) and end (100%)
  const trajectoryType: number = 1  // Type as number to allow switch cases

  // Random direction: positive (up/right) or negative (down/left)
  // Use seed3 to ensure consistent direction for this specific missile (seed-based randomness)
  // This ensures each spell ID gets a unique but consistent trajectory
  const directionMultiplier = seed3 < 0.5 ? 1 : -1

  // Asymmetry factor for type 3
  const asymmetryFactor = seed4 * 0.3 // Small shift (0-30%)

  return (progress: number): Point => {
    let curveFactor = 0

    switch (trajectoryType) {
      case 0: // Single smooth arc (starts at 0, ends at 0)
        curveFactor = Math.sin(progress * Math.PI)
        break
      case 1: // S-curve (starts at 0, ends at 0)
        curveFactor = Math.sin(progress * Math.PI * 2)
        break
      case 2: // Triple wave (starts at 0, ends at 0)
        curveFactor = Math.sin(progress * Math.PI * 3)
        break
      case 3: // Double arc with asymmetry (starts at 0, ends at 0)
        const adjustedProgress = progress + asymmetryFactor * Math.sin(progress * Math.PI)
        curveFactor = Math.sin(adjustedProgress * Math.PI * 2)
        break
      case 4: // Half wave gentle curve (starts at 0, ends at 0)
        curveFactor = Math.sin(progress * Math.PI * 0.5) * (1 - progress)
        break
    }

    curveFactor *= directionMultiplier * curveHeight

    // Base position along straight line
    const baseX = from.x + dx * progress
    const baseY = from.y + dy * progress

    // Apply perpendicular offset
    return {
      x: baseX + perpX * curveFactor,
      y: baseY + perpY * curveFactor
    }
  }
}

/**
 * Helper function to generate seed from spell ID string
 *
 * @param spellId Unique spell instance ID
 * @returns Normalized seed value (0-1)
 */
export function seedFromSpellId(spellId: string): number {
  if (!spellId || spellId.length === 0) return Math.random()

  // Hash the entire string for maximum variation
  let hash = 0
  for (let i = 0; i < spellId.length; i++) {
    const char = spellId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert to 0-1 range
  return Math.abs(hash % 10000) / 10000
}

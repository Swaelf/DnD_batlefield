/**
 * Projectile mutation system
 *
 * Handles runtime transformations of projectiles during flight.
 * Supports progress-based, distance-based, time-based, and position-based triggers.
 */

import { Point } from '@/types';
import { distance } from '../utils/math';
import type {
  ProjectileMutation,
  MutationTrigger,
  ProjectileState,
} from '../types/projectiles';

// ============================================================================
// Trigger Evaluation
// ============================================================================

/**
 * Check if a mutation trigger condition is met
 *
 * @param trigger - Mutation trigger configuration
 * @param state - Current projectile state
 * @param startPosition - Starting position of projectile
 * @returns True if trigger condition is satisfied
 */
export function evaluateMutationTrigger(
  trigger: MutationTrigger,
  state: ProjectileState,
  startPosition: Point
): boolean {
  switch (trigger.type) {
    case 'progress':
      return state.progress >= trigger.value;

    case 'distance': {
      const distanceFromStart = distance(startPosition, state.position);
      return distanceFromStart >= trigger.value;
    }

    case 'time':
      return state.elapsedTime >= trigger.value;

    case 'position': {
      const distanceToTarget = distance(state.position, trigger.value);
      const threshold = trigger.threshold ?? 5; // Default 5px threshold
      return distanceToTarget <= threshold;
    }

    default:
      // Exhaustive check
      const _exhaustive: never = trigger;
      return _exhaustive;
  }
}

// ============================================================================
// State Mutation
// ============================================================================

/**
 * Apply a mutation to the current projectile state
 *
 * @param state - Current projectile state (mutated in place)
 * @param mutation - Mutation to apply
 */
export function applyMutation(
  state: ProjectileState,
  mutation: ProjectileMutation
): void {
  // Update shape if specified
  if (mutation.shape !== undefined) {
    state.currentShape = mutation.shape;
  }

  // Update color if specified
  if (mutation.color !== undefined) {
    state.currentColor = mutation.color;
  }

  // Update size if specified
  if (mutation.size !== undefined) {
    state.currentSize = mutation.size;
  }

  // Update effects if specified
  if (mutation.effects !== undefined) {
    state.currentEffects = [...mutation.effects];
  }
}

// ============================================================================
// Mutation Processing
// ============================================================================

/**
 * Process all pending mutations and apply those that should trigger
 *
 * @param state - Current projectile state
 * @param mutations - All configured mutations
 * @param startPosition - Starting position of projectile
 * @param onMutate - Optional callback when mutation triggers
 * @returns Array of indices of newly applied mutations
 */
export function processMutations(
  state: ProjectileState,
  mutations: ProjectileMutation[],
  startPosition: Point,
  onMutate?: (mutation: ProjectileMutation) => void
): number[] {
  const newlyApplied: number[] = [];

  mutations.forEach((mutation, index) => {
    // Skip if already applied
    if (state.appliedMutations.has(index)) {
      return;
    }

    // Check if trigger condition is met
    if (evaluateMutationTrigger(mutation.trigger, state, startPosition)) {
      // Apply mutation
      applyMutation(state, mutation);

      // Mark as applied
      state.appliedMutations.add(index);
      newlyApplied.push(index);

      // Notify callback
      onMutate?.(mutation);
    }
  });

  return newlyApplied;
}

// ============================================================================
// Interpolation for Smooth Transitions
// ============================================================================

/**
 * Interpolate between two values with easing
 *
 * @param from - Starting value
 * @param to - Ending value
 * @param progress - Progress (0-1)
 * @returns Interpolated value
 */
export function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

/**
 * Interpolate between two colors (hex format)
 *
 * @param from - Starting color (hex)
 * @param to - Ending color (hex)
 * @param progress - Progress (0-1)
 * @returns Interpolated color (hex)
 */
export function interpolateColor(from: string, to: string, progress: number): string {
  // Parse hex colors
  const fromR = parseInt(from.slice(1, 3), 16);
  const fromG = parseInt(from.slice(3, 5), 16);
  const fromB = parseInt(from.slice(5, 7), 16);

  const toR = parseInt(to.slice(1, 3), 16);
  const toG = parseInt(to.slice(3, 5), 16);
  const toB = parseInt(to.slice(5, 7), 16);

  // Interpolate RGB channels
  const r = Math.round(interpolate(fromR, toR, progress));
  const g = Math.round(interpolate(fromG, toG, progress));
  const b = Math.round(interpolate(fromB, toB, progress));

  // Convert back to hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

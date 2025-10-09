/**
 * Type Guard Functions
 *
 * Type guards for discriminating between different animation types.
 * Used for type-safe handling of Animation union types.
 */

import type {
  Animation,
  ProjectileAnimation,
  BurstAnimation,
  AreaAnimation,
  RayAnimation,
  MovementAnimation,
  EnvironmentalAnimation,
  StatusAnimation
} from '../types'

/**
 * Check if animation is a projectile
 */
export const isProjectile = (animation: Animation): animation is ProjectileAnimation => {
  return animation.category === 'projectile'
}

/**
 * Check if animation is a burst
 */
export const isBurst = (animation: Animation): animation is BurstAnimation => {
  return animation.category === 'burst'
}

/**
 * Check if animation is an area effect
 */
export const isArea = (animation: Animation): animation is AreaAnimation => {
  return animation.category === 'area'
}

/**
 * Check if animation is a ray
 */
export const isRay = (animation: Animation): animation is RayAnimation => {
  return animation.category === 'ray'
}

/**
 * Check if animation is a movement
 */
export const isMovement = (animation: Animation): animation is MovementAnimation => {
  return animation.category === 'movement'
}

/**
 * Check if animation is environmental
 */
export const isEnvironmental = (animation: Animation): animation is EnvironmentalAnimation => {
  return animation.category === 'environmental'
}

/**
 * Check if animation is a status effect
 */
export const isStatus = (animation: Animation): animation is StatusAnimation => {
  return animation.category === 'status'
}

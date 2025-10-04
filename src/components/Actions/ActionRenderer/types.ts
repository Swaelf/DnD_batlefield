import type { AttackEventData } from '@/types'

// Attack type classification
export type AttackType = 'ranged' | 'melee'

// Melee attack animation variants
export type MeleeAnimation = 'melee_slash' | 'melee_thrust' | 'melee_swing'

// Union of all attack animations
export type AttackAnimation = 'ranged' | MeleeAnimation

// Base attack component props
export interface BaseAttackProps {
  attack: AttackEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

// Attack variant configuration
export interface AttackVariantConfig {
  name: string
  damageType: string
  visualStyle: 'projectile' | 'slash' | 'thrust' | 'impact'
  trailEffect: boolean
  impactEffect: boolean
  colorHint: string
}

// Type guard for melee animation
export function isMeleeAnimation(animation: string): animation is MeleeAnimation {
  return ['melee_slash', 'melee_thrust', 'melee_swing'].includes(animation)
}

// Get attack type from event data
export function getAttackType(attack: AttackEventData): AttackType {
  // Normalize attack types to 'melee' or 'ranged'
  if (attack.attackType === 'ranged' || attack.attackType === 'spell') {
    return 'ranged'
  }
  // 'melee', 'natural', and 'unarmed' are all melee attacks
  return 'melee'
}

// Get animation variant from event data
export function getAttackAnimation(attack: AttackEventData): AttackAnimation {
  if (attack.attackType === 'ranged') {
    return 'ranged'
  }
  return (attack.animation || 'melee_slash') as MeleeAnimation
}

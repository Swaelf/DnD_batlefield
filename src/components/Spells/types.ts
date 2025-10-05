import type { SpellEventData } from '@/types/timeline'

// Spell category types
export type SpellCategory =
  | 'projectile'
  | 'projectile-burst'
  | 'burst'
  | 'area'
  | 'ray'
  | 'cone'

// Spell variant types per category
export type ProjectileVariant = 'standard' | 'magic-missile' | 'fireball'
export type ProjectileBurstVariant = 'standard' | 'fireball'
export type BurstVariant = 'standard'
export type AreaVariant = 'standard' | 'darkness'
export type RayVariant = 'standard'
export type ConeVariant = 'standard'

// Union of all spell variants
export type SpellVariant =
  | ProjectileVariant
  | ProjectileBurstVariant
  | BurstVariant
  | AreaVariant
  | RayVariant
  | ConeVariant

// Variant configuration interface
export interface SpellVariantConfig {
  name: string
  trailStyle: 'standard' | 'fire' | 'magical'
  projectileShape: 'circle' | 'star'
  coreColor: string
  glowIntensity: number
  particleEffect: boolean
}

// Base spell component props
export interface BaseSpellProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

// Trail position tracking
export interface TrailPosition {
  x: number
  y: number
  progress: number
}

// Type guard for spell category
export function isSpellCategory(category: string): category is SpellCategory {
  return ['projectile', 'projectile-burst', 'burst', 'area', 'ray', 'cone'].includes(category)
}

// Get variant from spell data
export function getSpellVariant(spell: SpellEventData): SpellVariant {
  const spellName = spell.spellName?.toLowerCase() || ''

  switch (spell.category) {
    case 'projectile':
      if (spellName.includes('magic missile')) return 'magic-missile'
      if (spellName.includes('fireball')) return 'fireball'
      return 'standard'

    case 'projectile-burst':
      if (spellName.includes('fireball')) return 'fireball'
      return 'standard'

    case 'area':
      if (spellName.includes('darkness')) return 'darkness'
      return 'standard'

    default:
      return 'standard'
  }
}

/**
 * AbstractProjectile - Spell projectile animations using animation-effects library
 *
 * Migrated from custom implementation to use the unified animation-effects library.
 * This provides better performance, object pooling, and consistent behavior.
 */

import { type FC, memo, useMemo } from 'react'
import type { BaseSpellProps } from '../types'
import { AbstractProjectile as LibraryProjectile } from '@/lib/animation-effects'
import type { AbstractProjectileConfig } from '@/lib/animation-effects'

export const AbstractProjectile: FC<BaseSpellProps> = memo(({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  // Convert SpellEventData to AbstractProjectileConfig
  const config = useMemo((): AbstractProjectileConfig => {
    const duration = spell.duration || 1000
    const size = spell.size || 20
    const color = spell.color || '#9370db'

    // Determine projectile shape based on spell name/type
    let shape: 'circle' | 'triangle' | 'star' | 'rectangle' = 'circle'
    let effects: Array<'trail' | 'glow' | 'pulse' | 'flash' | 'particles'> = ['trail', 'pulse']

    const spellName = spell.spellName?.toLowerCase() || ''

    // Magic Missile - star shape with glow
    if (spellName.includes('magic missile')) {
      shape = 'star'
      effects = ['trail', 'glow', 'pulse']
    }
    // Eldritch Blast - circle with glow and flash
    else if (spellName.includes('eldritch blast')) {
      shape = 'circle'
      effects = ['trail', 'glow', 'flash']
    }
    // Guiding Bolt - star with radiant glow
    else if (spellName.includes('guiding bolt')) {
      shape = 'star'
      effects = ['trail', 'glow', 'flash']
    }
    // Chromatic Orb - circle with particles
    else if (spellName.includes('chromatic orb')) {
      shape = 'circle'
      effects = ['trail', 'particles', 'glow']
    }
    // Fiery projectiles
    else if (spellName.includes('fire') || spellName.includes('flame')) {
      shape = 'circle'
      effects = ['trail', 'particles', 'glow']
    }
    // Acid spells
    else if (spellName.includes('acid')) {
      shape = 'circle'
      effects = ['trail', 'glow']
    }
    // Ray spells - use triangle for beam-like appearance
    else if (spellName.includes('ray')) {
      shape = 'triangle'
      effects = ['trail', 'glow', 'pulse']
    }

    return {
      from: spell.fromPosition,
      to: spell.toPosition,
      shape,
      color,
      size,
      effects,
      duration,
      onComplete: onAnimationComplete,
    }
  }, [spell, onAnimationComplete])

  if (!isAnimating) {
    return null
  }

  return <LibraryProjectile config={config} />
})

AbstractProjectile.displayName = 'AbstractProjectile'

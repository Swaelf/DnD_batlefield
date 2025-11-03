import { type FC, memo } from 'react'
import { Group } from 'react-konva'
import type { SpellEventData } from '@/types/timeline'
import { AbstractBurst, AbstractArea, AbstractRay } from './primitives'
import { UnifiedProjectile } from './UnifiedProjectile'
import { SimpleSpellComponent } from './SimpleSpellComponent'

interface SpellRendererProps {
  spell: SpellEventData
  isAnimating: boolean
  onAnimationComplete?: () => void
}

/**
 * SpellRenderer - O(1) spell category detection and rendering
 *
 * Uses direct category property access for instant spell type detection.
 * Delegates rendering to specialized abstract spell components.
 *
 * Performance: O(1) detection vs O(n) color/name matching
 * Architecture: Abstract component pattern with React.memo optimization
 */
export const SpellRenderer: FC<SpellRendererProps> = memo(({
  spell,
  isAnimating,
  onAnimationComplete
}) => {
  if (!isAnimating) {
    return null
  }

  const commonProps = {
    spell,
    isAnimating,
    onAnimationComplete
  }

  // O(1) category-based rendering
  switch (spell.category) {
    case 'projectile':
    case 'projectile-burst':
      // Use UnifiedProjectile for all projectiles (with or without burst)
      // Handles motion generators, trails, and multi-phase animations
      return (
        <Group listening={false}>
          <UnifiedProjectile {...commonProps} />
        </Group>
      )

    case 'burst':
      return (
        <Group listening={false}>
          <AbstractBurst {...commonProps} />
        </Group>
      )

    case 'area':
      return (
        <Group listening={false}>
          <AbstractArea {...commonProps} />
        </Group>
      )

    case 'ray':
      return (
        <Group listening={false}>
          <AbstractRay {...commonProps} />
        </Group>
      )

    // Fall back to SimpleSpellComponent for complex spells
    case 'cone':
    default:
      return <SimpleSpellComponent {...commonProps} />
  }
}, (prevProps, nextProps) => {
  return (
    prevProps.spell.id === nextProps.spell.id &&
    prevProps.isAnimating === nextProps.isAnimating
  )
})

SpellRenderer.displayName = 'SpellRenderer'

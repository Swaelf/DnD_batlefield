import type { VariantConfig, NatureVariant } from '../types'

export const natureVariants: Record<NatureVariant, VariantConfig> = {
  tree: {
    color: '#10B981',
    stroke: '#059669',
    opacity: 0.8,
    pattern: 'textured',
    shadowIntensity: 0.6
  },
  bush: {
    color: '#059669',
    stroke: '#047857',
    opacity: 0.7,
    pattern: 'textured',
    shadowIntensity: 0.5
  },
  rock: {
    color: '#78716C',
    stroke: '#57534E',
    opacity: 1,
    pattern: 'textured',
    shadowIntensity: 0.7
  },
  water: {
    color: '#3B82F6',
    stroke: '#2563EB',
    opacity: 0.6,
    pattern: 'textured',
    shadowIntensity: 0.4
  }
} as const

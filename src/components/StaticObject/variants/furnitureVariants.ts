import type { VariantConfig, FurnitureVariant } from '../types'

export const furnitureVariants: Record<FurnitureVariant, VariantConfig> = {
  table: {
    color: '#92400E',
    stroke: '#78350F',
    opacity: 1,
    pattern: 'grain',
    shadowIntensity: 0.6
  },
  chair: {
    color: '#78350F',
    stroke: '#451A03',
    opacity: 1,
    pattern: 'solid',
    shadowIntensity: 0.5
  },
  chest: {
    color: '#92400E',
    stroke: '#78350F',
    opacity: 1,
    pattern: 'textured',
    shadowIntensity: 0.7
  },
  barrel: {
    color: '#92400E',
    stroke: '#78350F',
    opacity: 1,
    pattern: 'textured',
    shadowIntensity: 0.6
  },
  bookshelf: {
    color: '#92400E',
    stroke: '#78350F',
    opacity: 1,
    pattern: 'grain',
    shadowIntensity: 0.6
  }
} as const

import type { VariantConfig, DungeonVariant } from '../types'

export const dungeonVariants: Record<DungeonVariant, VariantConfig> = {
  trap: {
    color: '#EF4444',
    stroke: '#DC2626',
    opacity: 0.5,
    pattern: 'textured',
    shadowIntensity: 0.6
  },
  altar: {
    color: '#6B7280',
    stroke: '#4B5563',
    opacity: 1,
    pattern: 'solid',
    shadowIntensity: 0.7
  },
  brazier: {
    color: '#EA580C',
    stroke: '#C2410C',
    opacity: 1,
    pattern: 'solid',
    shadowIntensity: 0.8
  },
  statue: {
    color: '#9CA3AF',
    stroke: '#6B7280',
    opacity: 1,
    pattern: 'solid',
    shadowIntensity: 0.7
  }
} as const

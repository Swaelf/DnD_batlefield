import type { VariantConfig, WallVariant } from '../types'

export const wallVariants: Record<WallVariant, VariantConfig> = {
  stone: {
    color: '#6B7280',
    stroke: '#4B5563',
    opacity: 1,
    pattern: 'brick',
    shadowIntensity: 0.6
  },
  wooden: {
    color: '#8B4513',
    stroke: '#654321',
    opacity: 1,
    pattern: 'grain',
    shadowIntensity: 0.5
  },
  brick: {
    color: '#8B4513',
    stroke: '#654321',
    opacity: 1,
    pattern: 'brick',
    shadowIntensity: 0.6
  },
  metal: {
    color: '#9CA3AF',
    stroke: '#6B7280',
    opacity: 1,
    pattern: 'metallic',
    shadowIntensity: 0.7
  }
} as const

import type { VariantConfig, StructureVariant } from '../types'

export const structureVariants: Record<StructureVariant, VariantConfig> = {
  door: {
    color: '#8B4513',
    stroke: '#654321',
    opacity: 1,
    pattern: 'grain',
    shadowIntensity: 0.6
  },
  pillar: {
    color: '#9CA3AF',
    stroke: '#6B7280',
    opacity: 1,
    pattern: 'solid',
    shadowIntensity: 0.7
  },
  stairs: {
    color: '#6B7280',
    stroke: '#4B5563',
    opacity: 1,
    pattern: 'solid',
    shadowIntensity: 0.6
  },
  'spiral-stairs': {
    color: '#5A5A5A',
    stroke: '#404040',
    opacity: 1,
    pattern: 'solid',
    shadowIntensity: 0.6
  }
} as const

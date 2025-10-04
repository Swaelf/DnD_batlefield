import type { SpellVariantConfig, AreaVariant } from '../types'

// Area spell variant configurations
export const areaVariants: Record<AreaVariant, SpellVariantConfig> = {
  standard: {
    name: 'Standard Area',
    trailStyle: 'standard',
    projectileShape: 'circle',
    coreColor: '#FFFFFF',
    glowIntensity: 1.0,
    particleEffect: false
  },

  darkness: {
    name: 'Darkness',
    trailStyle: 'standard',
    projectileShape: 'circle',
    coreColor: '#000000',
    glowIntensity: 0.7,
    particleEffect: false
  }
}

// Get configuration for area variant
export function getAreaConfig(variant: AreaVariant): SpellVariantConfig {
  return areaVariants[variant] || areaVariants.standard
}

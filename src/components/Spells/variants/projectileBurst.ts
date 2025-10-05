import type { SpellVariantConfig, ProjectileBurstVariant } from '../types'

// Projectile-Burst spell variant configurations
export const projectileBurstVariants: Record<ProjectileBurstVariant, SpellVariantConfig> = {
  standard: {
    name: 'Standard Projectile-Burst',
    trailStyle: 'standard',
    projectileShape: 'circle',
    coreColor: '#FFFFFF',
    glowIntensity: 1.0,
    particleEffect: false
  },

  fireball: {
    name: 'Fireball Burst',
    trailStyle: 'fire',
    projectileShape: 'circle',
    coreColor: '#FFD700',
    glowIntensity: 1.5,
    particleEffect: true
  }
}

// Get configuration for projectile-burst variant
export function getProjectileBurstConfig(variant: ProjectileBurstVariant): SpellVariantConfig {
  return projectileBurstVariants[variant] || projectileBurstVariants.standard
}

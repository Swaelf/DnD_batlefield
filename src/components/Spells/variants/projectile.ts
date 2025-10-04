import type { SpellVariantConfig, ProjectileVariant } from '../types'

// Projectile spell variant configurations
export const projectileVariants: Record<ProjectileVariant, SpellVariantConfig> = {
  standard: {
    name: 'Standard Projectile',
    trailStyle: 'standard',
    projectileShape: 'circle',
    coreColor: '#FFFFFF',
    glowIntensity: 1.0,
    particleEffect: false
  },

  'magic-missile': {
    name: 'Magic Missile',
    trailStyle: 'magical',
    projectileShape: 'star',
    coreColor: '#FFFFFF',
    glowIntensity: 1.2,
    particleEffect: false
  },

  fireball: {
    name: 'Fireball',
    trailStyle: 'fire',
    projectileShape: 'circle',
    coreColor: '#FFD700',
    glowIntensity: 1.5,
    particleEffect: true
  }
}

// Get configuration for projectile variant
export function getProjectileConfig(variant: ProjectileVariant): SpellVariantConfig {
  return projectileVariants[variant] || projectileVariants.standard
}

import type { AttackVariantConfig, MeleeAnimation } from '../types'

// Melee attack variant configurations
export const meleeVariants: Record<MeleeAnimation, AttackVariantConfig> = {
  melee_slash: {
    name: 'Slashing',
    damageType: 'slashing',
    visualStyle: 'slash',
    trailEffect: true,
    impactEffect: false,
    colorHint: '#C0C0C0' // Silver
  },

  melee_thrust: {
    name: 'Piercing',
    damageType: 'piercing',
    visualStyle: 'thrust',
    trailEffect: true,
    impactEffect: false,
    colorHint: '#B0B0B0' // Light gray
  },

  melee_swing: {
    name: 'Bludgeoning',
    damageType: 'bludgeoning',
    visualStyle: 'impact',
    trailEffect: false,
    impactEffect: true,
    colorHint: '#8B7355' // Brown
  }
}

// Get configuration for melee variant
export function getMeleeConfig(variant: MeleeAnimation): AttackVariantConfig {
  return meleeVariants[variant] || meleeVariants.melee_slash
}

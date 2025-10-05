// Barrel exports for all spell variant configurations

export { projectileVariants, getProjectileConfig } from './projectile'
export { projectileBurstVariants, getProjectileBurstConfig } from './projectileBurst'
export { areaVariants, getAreaConfig } from './area'

// Re-export variant types
export type {
  ProjectileVariant,
  ProjectileBurstVariant,
  BurstVariant,
  AreaVariant,
  RayVariant,
  ConeVariant,
  SpellVariantConfig
} from '../types'

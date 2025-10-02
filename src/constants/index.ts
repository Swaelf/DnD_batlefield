/**
 * Constants Barrel Export
 * Central export point for all application constants
 */

export * from './animation'
export * from './canvas'
export * from './colors'
export * from './environmental'
export * from './grid'
export * from './interactions'
export * from './sequences'
export * from './templates'

// Export with aliases to avoid naming conflicts - exclude DAMAGE_TYPES from wildcard exports
export {
  ATTACK_TYPES,
  ATTACK_RANGES,
  WEAPON_PROPERTIES,
  ATTACK_ANIMATIONS,
  WEAPON_PRESETS,
  ATTACK_VISUALS,
  DAMAGE_TYPE_COLORS,
  CRITICAL_HIT,
  // DAMAGE_TYPES exported with alias below
} from './attacks'
export { DAMAGE_TYPES as ATTACK_DAMAGE_TYPES } from './attacks'

// Spell constants removed - spells are now defined in /src/data/unifiedActions/spellTemplates.ts
// This provides a unified action system for spells, attacks, and interactions
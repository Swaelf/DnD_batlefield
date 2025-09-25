/**
 * Spells Module Types - Barrel Export
 *
 * Single entry point for all spell types following the established pattern
 * from Timeline and Actions modules.
 */

// Export all spell types
export * from './spells'

// Export type utilities and guards
export {
  isSpellId,
  isUnifiedSpell,
  isSpellTemplate,
  createSpellId,
  createSpellTemplateId,
  createSpellCategoryId,
  createSpellSchoolId
} from './spells'

// Export constants
export {
  SPELL_SCHOOLS,
  SPELL_CATEGORIES
} from './spells'
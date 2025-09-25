/**
 * Properties Module Types - Barrel Export
 *
 * Single entry point for all property types following the established pattern
 * from Timeline, Actions, and Spells modules.
 */

// Export all property types
export * from './properties'

// Export type utilities and guards
export {
  isPropertyField,
  isDNDToken,
  createPropertyId,
  createPropertyGroupId,
  createValidationRuleId,
  createPropertyFieldId
} from './properties'

// Export constants
export {
  DND_CONDITIONS,
  DND_CREATURE_SIZES
} from './properties'
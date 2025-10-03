/**
 * Registry and factory
 * Barrel export file for registry and factory modules
 */

// Effect Registry
export { EffectRegistry } from './EffectRegistry';
export type {
  AnimationTemplate,
  AnimationCategory,
  SearchCriteria,
} from './EffectRegistry';
export {
  getAllAnimations,
  getSpellAnimations,
  getAttackAnimations,
  getMovementAnimations,
  searchAnimations,
} from './EffectRegistry';

// Pre-populated templates
export { getRegisteredTemplateCount, logRegistryStats } from './templates';

// Effect Factory (Task 12)
export { EffectFactory } from './EffectFactory';
export type { AnimationParams, ValidationResult } from './EffectFactory';

/**
 * Tokens Module - Main Export
 *
 * Complete Tokens module following atomic design architecture
 * established in Timeline (Phase 3), Actions (Phase 4), Spells (Phase 5),
 * and Properties (Phase 6) modules.
 *
 * Phase 7: Token System Migration
 * - Advanced D&D 5e token management with comprehensive size and condition system
 * - Atomic design components for maximum reusability and performance
 * - Real-time animation coordination with movement, teleport, and effect animations
 * - Template-based token creation with built-in D&D creature library
 * - Multi-token selection and batch operations with alignment and distribution
 * - Complete validation system with D&D 5e rule compliance
 */

// Export types - be selective to avoid conflicts
export type {
  Token,
  TokenId,
  TokenSize,
  TokenShape,
  TokenCategory,
  TokenTemplate,
  TokenAnimation,
  TokenMovement,
  TokenSelection,
  TokenUpdate,
  TokenBounds,
  TokenSizeMap,
  ConditionType,
  ConditionVisual,
  ConditionEffect,
  TokenConditionState
} from './types'

// Export type utilities
export {
  createTokenId,
  createTemplateId
} from './types'

// Export constants
export * from './constants'

// Export services
export * from './services'

// Export store - avoid conflicting exports
export { useTokenStore } from './store'
export * from './store/selectors'

// Export hooks
export * from './hooks'

// Export components
export * from './components'

// Main components for easy import - renamed to avoid conflict with Token type
export { Token as TokenComponent } from './components/organisms/Token'
export { TokenLibrary } from './components/organisms/TokenLibrary'
export { TokenProperties } from './components/organisms/TokenProperties'
export { TokenAnimator } from './components/organisms/TokenAnimator'
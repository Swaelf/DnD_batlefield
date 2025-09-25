/**
 * Spells Module - Main Export
 *
 * Complete Spells module following atomic design architecture
 * established in Timeline (Phase 3) and Actions (Phase 4) modules.
 */

// Export all types
export * from './types'

// Export services
export * from './services'

// Export store
export * from './store'

// Export hooks
export * from './hooks'

// Export components
export * from './components'

// Main component for easy import
export { SpellSelector } from './components/organisms/SpellSelector'
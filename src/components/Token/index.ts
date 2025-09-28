/**
 * Token Component - Legacy API Adapter
 *
 * Phase 8 Migration Adapter: Provides complete backward compatibility
 * with existing Token usage while seamlessly integrating the new
 * atomic Token module architecture.
 *
 * This adapter ensures zero breaking changes during migration.
 */

// Re-export the new atomic Token component with legacy-compatible interface
export { Token } from './LegacyTokenAdapter'
export { TokenLibrary } from './LegacyTokenLibraryAdapter'

// Legacy exports for existing imports
export { Token as default } from './LegacyTokenAdapter'
export type { TokenProps } from './LegacyTokenAdapter'
export type { LegacyTokenLibraryProps } from './LegacyTokenLibraryAdapter'

// Also export the originals for direct access if needed
export { Token as LegacyToken } from './Token'
export { default as LegacyTokenLibrary } from './TokenLibrary'

// Export types for compatibility
export type { Token as TokenType } from '@/types/token'
export type { TokenTemplate } from '@/types/token'
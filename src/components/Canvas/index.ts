/**
 * Canvas Component - Legacy API Adapter
 *
 * Phase 9B Migration Adapter: Provides complete backward compatibility
 * with existing Canvas usage while seamlessly integrating the new
 * atomic Canvas architecture.
 *
 * This adapter ensures zero breaking changes during migration.
 */

// Re-export the new atomic Canvas component with legacy-compatible interface
export { MapCanvas } from './LegacyMapCanvasAdapter'

// Legacy exports for existing imports
export { MapCanvas as default } from './LegacyMapCanvasAdapter'
export type { LegacyMapCanvasProps } from './LegacyMapCanvasAdapter'

// Also export the original for direct access if needed
export { MapCanvas as LegacyMapCanvas } from './MapCanvas'

// Export atomic Canvas for new usage
export { MapCanvas as AtomicMapCanvas } from '@/modules/canvas'

// Export types for compatibility
export type { MapCanvasProps as AtomicMapCanvasProps } from '@/modules/canvas'
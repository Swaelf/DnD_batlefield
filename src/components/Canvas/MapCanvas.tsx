/**
 * MapCanvas - Legacy Interface Wrapper
 *
 * This file maintains the existing import path for App.tsx while using
 * the new LegacyMapCanvasAdapter internally for seamless Phase 9B migration.
 */

// Re-export the legacy adapter as the default MapCanvas
export { MapCanvas as default } from './LegacyMapCanvasAdapter'

// Export types for compatibility
export type { LegacyMapCanvasProps as MapCanvasProps } from './LegacyMapCanvasAdapter'
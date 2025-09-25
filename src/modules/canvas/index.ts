/**
 * Canvas Module - Complete Canvas system with atomic architecture
 *
 * Phase 9A: Canvas Atomic Components Complete
 * The most comprehensive canvas system in MapMaker with full atomic design,
 * service layer architecture, and seamless integration capabilities.
 */

// Export all types
export * from './types'

// Export all services
export * from './services'

// Export all components
export * from './components'

// Main Canvas component for easy integration
export { MapCanvas } from './components/organisms/MapCanvas/MapCanvas'

// Service instances for direct access
export {
  canvasService,
  layerService,
  viewportService
} from './services'
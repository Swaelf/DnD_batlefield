/**
 * Canvas Module - Complete Canvas system with atomic architecture
 *
 * Phase 9A: Canvas Atomic Components Complete
 * The most comprehensive canvas system in MapMaker with full atomic design,
 * service layer architecture, and seamless integration capabilities.
 */

// Export canvas types (avoiding service type conflicts)
export * from './types/canvas'
export * from './types/layer'
export * from './types/interaction'
// Export specific viewport types to avoid conflicts
export type {
  ViewportConfig,
  ViewportState,
  ViewportTransform,
  ViewportBounds,
  CoordinateSpace
} from './types/viewport'
// Export specific grid types to avoid conflicts with services
export type {
  GridState,
  GridType,
  GridLine
} from './types/grid'

// Export tool types explicitly to avoid conflicts
export type {
  ToolType as CanvasToolType,
  ToolConfig as CanvasToolConfig,
  ToolSettings as CanvasToolSettings,
  ToolCursor,
  ToolState,
  ToolHandler
} from './types/tool'

// Export services (will use service-defined types for GridConfig, etc.)
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
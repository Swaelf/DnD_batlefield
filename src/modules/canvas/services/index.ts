/**
 * Canvas Module Services - Service layer for atomic Canvas architecture
 *
 * Phase 9: Canvas System Services
 * Following established patterns from Timeline, Actions, Spells, Properties, and Tokens modules
 *
 * This module provides comprehensive services for:
 * - Canvas creation, management, and rendering
 * - Layer composition and organization
 * - Viewport transformation and camera controls
 * - Performance optimization and monitoring
 */

// Import services explicitly
import { CanvasService } from './CanvasService'
import { LayerService, LayerManager } from './LayerService'
import { ViewportService, ViewportManager } from './ViewportService'

// Export all services
export { CanvasService, LayerService, LayerManager, ViewportService, ViewportManager }

// Re-export service instances for convenience (lazy initialization to avoid circular imports)
export const canvasService = {
  get instance() { return CanvasService.getInstance(); },
  createCanvas: (...args: any[]) => CanvasService.getInstance().createCanvas(...args),
  destroyCanvas: (...args: any[]) => CanvasService.getInstance().destroyCanvas(...args),
  getCanvas: (...args: any[]) => CanvasService.getInstance().getCanvas(...args),
  getAllCanvases: (...args: any[]) => CanvasService.getInstance().getAllCanvases(...args),
  render: (...args: any[]) => CanvasService.getInstance().render(...args),
  screenToWorld: (...args: any[]) => CanvasService.getInstance().screenToWorld(...args),
}

export const layerService = {
  get instance() { return LayerService.getInstance(); },
  createLayerManager: (...args: any[]) => LayerService.getInstance().createLayerManager(...args),
  destroyLayerManager: (...args: any[]) => LayerService.getInstance().destroyLayerManager(...args),
  getLayerManager: (...args: any[]) => LayerService.getInstance().getLayerManager(...args),
}

export const viewportService = {
  get instance() { return ViewportService.getInstance(); },
  createViewportManager: (...args: any[]) => ViewportService.getInstance().createViewportManager(...args),
  destroyViewportManager: (...args: any[]) => ViewportService.getInstance().destroyViewportManager(...args),
  getViewportManager: (...args: any[]) => ViewportService.getInstance().getViewportManager(...args),
}
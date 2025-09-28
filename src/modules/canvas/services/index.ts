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
import { CoordinateService } from './CoordinateService'
import { RenderingService } from './RenderingService'

// Export all services
export { CanvasService, LayerService, LayerManager, ViewportService, ViewportManager, CoordinateService, RenderingService }

// Export types from canvas module
export type {
  CanvasId,
  CanvasConfig,
  CanvasState,
  ViewportState,
  CoordinateSpace,
  CanvasPointerEvent,
  CanvasWheelEvent,
  CanvasLayer
} from '../types/canvas'

// Canvas-specific types for services
export type GridConfig = {
  readonly enabled: boolean
  readonly visible: boolean
  readonly size: number
  readonly type: 'square' | 'hex'
  readonly color: string
  readonly opacity: number
  readonly strokeWidth: number
  readonly subGrid?: {
    readonly enabled: boolean
    readonly visible: boolean
    readonly subdivisions: number
    readonly color: string
    readonly opacity: number
    readonly strokeWidth: number
  }
}

export type ToolType =
  | 'select'
  | 'move'
  | 'draw'
  | 'erase'
  | 'zoom'
  | 'pan'
  | 'text'
  | 'shape'

export type ToolSettings = {
  readonly strokeWidth: number
  readonly strokeColor: string
  readonly fillColor: string
  readonly opacity: number
  readonly size: number
  readonly precision: number
  readonly snapToGrid: boolean
  readonly showPreview: boolean
}

export type ToolConfig = {
  readonly id: string
  readonly name: string
  readonly type: ToolType
  readonly cursor: {
    readonly type: string
    readonly size: number
    readonly hotspot: { readonly x: number; readonly y: number }
    readonly color: string
  }
  readonly settings: Partial<ToolSettings>
  readonly keyboardShortcuts: readonly string[]
  readonly enabled: boolean
}

// Service instances (direct access to avoid complex typing)
export const canvasService = CanvasService.getInstance()
export const layerService = LayerService.getInstance()
export const viewportService = ViewportService.getInstance()
export const coordinateService = new CoordinateService()
export const renderingService = new RenderingService()
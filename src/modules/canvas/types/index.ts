/**
 * Canvas Module Types - Complete type definitions for atomic Canvas architecture
 *
 * Phase 9: Canvas System Atomic Architecture
 * Following established patterns from Timeline, Actions, Spells, Properties, and Tokens modules
 *
 * This module provides comprehensive types for:
 * - Canvas and rendering state management
 * - Layer composition and management
 * - Tool integration and interaction handling
 * - Grid and viewport management
 * - Performance optimization types
 */

// Export canvas types with specific re-exports to avoid conflicts
export type {
  CanvasId,
  LayerId,
  StageId,
  CanvasConfig,
  CanvasSettings,
  CanvasState,
  CanvasViewport,
  CanvasCursor,
  CanvasPerformance,
  CanvasCursorType,
  CanvasRenderQuality,
  CanvasExportFormat,
  CanvasPointerEvent,
  CanvasWheelEvent,
  CanvasLayer,
  CanvasEventData,
  CanvasEventTarget,
  CanvasEventModifiers
} from './canvas'

// Export viewport types with proper naming
export type {
  ViewportConfig,
  ViewportState,
  ViewportTransform,
  ViewportMatrix,
  CoordinateConversion,
  ViewportBounds,
  CameraState,
  CameraAnimation,
  CameraKeyframe,
  ViewportEventData,
  ViewportDelta,
  PanGestureData,
  ZoomGestureData,
  UpdateViewportData,
  ViewportFitOptions,
  CoordinateSpace,
  ViewportEventType,
  ViewportEventSource,
  CameraEasing,
  ViewportConstraint
} from './viewport'

// Export other module types
export * from './layer'
export * from './interaction'
export * from './grid'
export * from './tool'
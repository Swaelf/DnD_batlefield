/**
 * Grid Types - Canvas grid system and snapping types
 *
 * Types for grid rendering, snapping behavior, and coordinate
 * alignment in the atomic Canvas system.
 */

import type { Point, Rectangle } from '@/types/geometry'

/**
 * Grid Configuration
 * Configuration for grid display and behavior
 */
export interface GridConfig {
  readonly size: number
  readonly type: GridType
  readonly visible: boolean
  readonly color: string
  readonly opacity: number
  readonly strokeWidth: number
  readonly subGrid: SubGridConfig | null
  readonly snap: GridSnapConfig
}

/**
 * Sub-Grid Configuration
 * Configuration for sub-grid divisions
 */
export interface SubGridConfig {
  readonly divisions: number
  readonly color: string
  readonly opacity: number
  readonly strokeWidth: number
  readonly visible: boolean
}

/**
 * Grid Snap Configuration
 * Configuration for grid snapping behavior
 */
export interface GridSnapConfig {
  readonly enabled: boolean
  readonly threshold: number
  readonly snapToIntersections: boolean
  readonly snapToMidpoints: boolean
  readonly snapToEdges: boolean
  readonly visualFeedback: boolean
  readonly feedbackColor: string
}

/**
 * Grid State
 * Current state of the grid system
 */
export interface GridState {
  readonly bounds: Rectangle
  readonly visibleBounds: Rectangle
  readonly cellSize: Point
  readonly origin: Point
  readonly lines: GridLineSet
  readonly intersections: readonly Point[]
  readonly lastUpdate: number
}

/**
 * Grid Line Set
 * Set of grid lines for rendering
 */
export interface GridLineSet {
  readonly horizontal: readonly GridLine[]
  readonly vertical: readonly GridLine[]
  readonly subHorizontal: readonly GridLine[]
  readonly subVertical: readonly GridLine[]
}

/**
 * Grid Line
 * Individual grid line data
 */
export interface GridLine {
  readonly position: number
  readonly start: Point
  readonly end: Point
  readonly isMajor: boolean
  readonly isVisible: boolean
}

/**
 * Grid Snap Result
 * Result of a grid snapping operation
 */
export interface GridSnapResult {
  readonly originalPosition: Point
  readonly snappedPosition: Point
  readonly snapType: GridSnapType
  readonly snapTarget: GridSnapTarget
  readonly distance: number
  readonly wasSnapped: boolean
}

/**
 * Grid Snap Target
 * Target information for grid snapping
 */
export interface GridSnapTarget {
  readonly type: GridSnapTargetType
  readonly position: Point
  readonly normal: Point | null
  readonly gridCell: GridCell
}

/**
 * Grid Cell
 * Information about a grid cell
 */
export interface GridCell {
  readonly x: number
  readonly y: number
  readonly bounds: Rectangle
  readonly center: Point
  readonly corners: readonly Point[]
  readonly midpoints: readonly Point[]
}

/**
 * Grid Measurement
 * Measurement information using grid units
 */
export interface GridMeasurement {
  readonly distance: number
  readonly gridUnits: number
  readonly cells: GridCellSpan
  readonly angle: number
  readonly worldDistance: number
}

/**
 * Grid Cell Span
 * Span information across grid cells
 */
export interface GridCellSpan {
  readonly start: GridCell
  readonly end: GridCell
  readonly width: number
  readonly height: number
  readonly area: number
  readonly cells: readonly GridCell[]
}

/**
 * Grid Overlay Data
 * Data for rendering grid overlays and highlights
 */
export interface GridOverlay {
  readonly type: GridOverlayType
  readonly cells: readonly GridCell[]
  readonly color: string
  readonly opacity: number
  readonly pattern: GridPatternType
  readonly animated: boolean
}

// Grid Type Definitions

export type GridType =
  | 'square'
  | 'hex'
  | 'triangle'
  | 'diamond'
  | 'dot'
  | 'custom'

export type GridSnapType =
  | 'none'
  | 'intersection'
  | 'midpoint'
  | 'edge'
  | 'center'

export type GridSnapTargetType =
  | 'intersection'
  | 'midpoint'
  | 'edge'
  | 'corner'
  | 'center'

export type GridOverlayType =
  | 'highlight'
  | 'selection'
  | 'preview'
  | 'measurement'
  | 'area'

export type GridPatternType =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'crosshatch'
  | 'diagonal'

/**
 * Grid Creation Data
 * Data for creating a new grid system
 */
export interface CreateGridData {
  readonly size: number
  readonly type: GridType
  readonly visible?: boolean
  readonly color?: string
  readonly opacity?: number
  readonly strokeWidth?: number
  readonly snapEnabled?: boolean
  readonly snapThreshold?: number
}

/**
 * Grid Update Data
 * Data for updating grid properties
 */
export interface UpdateGridData {
  readonly size?: number
  readonly type?: GridType
  readonly visible?: boolean
  readonly color?: string
  readonly opacity?: number
  readonly strokeWidth?: number
  readonly snap?: Partial<GridSnapConfig>
}

/**
 * Type guards for grid types
 */
export function isGridConfig(obj: any): obj is GridConfig {
  return obj &&
         typeof obj.size === 'number' &&
         typeof obj.type === 'string' &&
         typeof obj.visible === 'boolean'
}

export function isGridSnapResult(obj: any): obj is GridSnapResult {
  return obj &&
         typeof obj.originalPosition === 'object' &&
         typeof obj.snappedPosition === 'object' &&
         typeof obj.wasSnapped === 'boolean'
}

/**
 * Grid utility functions
 */
export function snapPointToGrid(
  point: Point,
  gridSize: number,
  snapThreshold: number = 10
): GridSnapResult {
  const gridX = Math.round(point.x / gridSize) * gridSize
  const gridY = Math.round(point.y / gridSize) * gridSize
  const snappedPosition = { x: gridX, y: gridY }

  const distance = Math.sqrt(
    Math.pow(point.x - gridX, 2) + Math.pow(point.y - gridY, 2)
  )

  const wasSnapped = distance <= snapThreshold

  return {
    originalPosition: point,
    snappedPosition: wasSnapped ? snappedPosition : point,
    snapType: wasSnapped ? 'intersection' : 'none',
    snapTarget: {
      type: 'intersection',
      position: snappedPosition,
      normal: null,
      gridCell: {
        x: Math.floor(gridX / gridSize),
        y: Math.floor(gridY / gridSize),
        bounds: {
          x: gridX,
          y: gridY,
          width: gridSize,
          height: gridSize
        },
        center: { x: gridX + gridSize / 2, y: gridY + gridSize / 2 },
        corners: [
          { x: gridX, y: gridY },
          { x: gridX + gridSize, y: gridY },
          { x: gridX + gridSize, y: gridY + gridSize },
          { x: gridX, y: gridY + gridSize }
        ],
        midpoints: [
          { x: gridX + gridSize / 2, y: gridY },
          { x: gridX + gridSize, y: gridY + gridSize / 2 },
          { x: gridX + gridSize / 2, y: gridY + gridSize },
          { x: gridX, y: gridY + gridSize / 2 }
        ]
      }
    },
    distance,
    wasSnapped
  }
}
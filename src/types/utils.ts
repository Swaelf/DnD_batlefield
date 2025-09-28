import type Konva from 'konva'
import type { Position } from '@/types/map'
import type { BattleMap } from '@/types/map'

// Grid Utility Types
export type GridUtilParams = {
  position: Position
  gridSize: number
  snap: boolean
}

export type SnapToGridResult = Position

// Canvas Utility Types
export type CanvasUtilParams = {
  stage: Konva.Stage
  layer: Konva.Layer
  container: HTMLElement
}

export type CanvasExportOptions = {
  format: 'png' | 'jpg' | 'svg'
  quality?: number
  scale?: number
  pixelRatio?: number
}

// Export Utility Types
export type ExportFormat = 'json' | 'png' | 'jpg' | 'svg'

export type ExportOptions = {
  format: ExportFormat
  filename?: string
  includeGrid?: boolean
  includeTokens?: boolean
  includeSpells?: boolean
  quality?: number
  scale?: number
}

export type ImportResult = {
  success: boolean
  data?: BattleMap
  error?: string
}

export type ExportResult = {
  success: boolean
  filename?: string
  error?: string
}

// File Utility Types
export type FileUtilOptions = {
  accept?: string
  multiple?: boolean
  directory?: boolean
}

export type FileReadResult = {
  success: boolean
  content?: string | ArrayBuffer
  filename?: string
  error?: string
}

// Import centralized geometric types
import type { Rectangle, Circle, Line, Vector2D } from './geometry'

// Math Utility Types (using centralized geometry)
export type { Vector2D, Rectangle, Circle, Line }

export type BoundingBox = Rectangle

// Color Utility Types
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv'

export type RGBColor = {
  r: number
  g: number
  b: number
  a?: number
}

export type HSLColor = {
  h: number
  s: number
  l: number
  a?: number
}

export type ColorConversionResult = {
  hex: string
  rgb: RGBColor
  hsl: HSLColor
}

// Validation Types
export type ValidationRule<T> = {
  field: keyof T
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: unknown) => boolean
  message: string
}

export type ValidationResult = {
  isValid: boolean
  errors: string[]
}

// Storage Types
export type StorageKey = string
export type StorageValue = unknown

export type StorageOptions = {
  encrypt?: boolean
  compress?: boolean
  ttl?: number // Time to live in milliseconds
}

export type StorageResult<T> = {
  success: boolean
  data?: T
  error?: string
}
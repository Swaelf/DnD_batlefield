import type { RefObject } from 'react'
import type Konva from 'konva'
import type { BattleMap } from '@/types/map'

// Export format types
export type ExportFormatId = 'png' | 'jpg' | 'webp' | 'svg' | 'pdf' | 'print' | 'json'

// Export options interface
export interface ExportOptions {
  // Image options
  resolution: number // DPI
  format: 'png' | 'jpg' | 'webp' | 'svg'
  quality: number // 0-100 for JPG
  transparency: boolean
  scale: number // Export scale multiplier

  // Layout options
  includeGrid: boolean
  includeLayers: string[]
  cropToContent: boolean
  addMargins: number // pixels

  // Print options
  paperSize: 'letter' | 'a4' | 'a3' | 'tabloid' | 'custom'
  orientation: 'portrait' | 'landscape'
  customSize: { width: number; height: number }
  printScale: 'fit' | 'actual' | 'custom'
  customPrintScale: number

  // PDF options
  multiPage: boolean
  pageOverlap: number
  includeMetadata: boolean

  // Data options
  embedImages: boolean
  includeHistory: boolean
  compressData: boolean
}

// Progress callback type
export type ProgressCallback = (stage: string, progress: number) => void

// Export context with all necessary dependencies
export interface ExportContext {
  stageRef: RefObject<Konva.Stage>
  currentMap: BattleMap
  options: ExportOptions
  onProgress?: ProgressCallback
}

// Base exporter interface using Strategy Pattern
export interface IExporter {
  /**
   * Export to blob
   * @param context Export context with stage, map, and options
   * @returns Promise resolving to exported Blob
   */
  export(context: ExportContext): Promise<Blob>

  /**
   * Get supported option keys for this exporter
   */
  getSupportedOptions(): string[]

  /**
   * Validate options before export
   * @throws Error if options are invalid
   */
  validateOptions(options: ExportOptions): void
}

// Export format metadata
export interface ExportFormat {
  id: ExportFormatId
  name: string
  extension: string
  description: string
  supportsOptions: string[]
}

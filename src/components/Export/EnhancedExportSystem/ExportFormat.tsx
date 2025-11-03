import type { ReactNode } from 'react'

export interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
  icon: ReactNode
  supportsOptions: string[]
}

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

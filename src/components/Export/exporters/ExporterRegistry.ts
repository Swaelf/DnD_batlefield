import { ImageExporter } from './ImageExporter'
import { SVGExporter } from './SVGExporter'
import { PDFExporter } from './PDFExporter'
import { JSONExporter } from './JSONExporter'
import type { IExporter, ExportFormatId } from './types'

/**
 * ExporterRegistry - Factory for creating format-specific exporters
 * Implements Strategy Pattern for format selection
 */
export class ExporterRegistry {
  private exporters: Map<ExportFormatId, IExporter>

  constructor() {
    this.exporters = new Map()
    this.registerDefaultExporters()
  }

  /**
   * Register default exporters for all supported formats
   */
  private registerDefaultExporters(): void {
    const imageExporter = new ImageExporter()
    const pdfExporter = new PDFExporter()
    const svgExporter = new SVGExporter()
    const jsonExporter = new JSONExporter()

    // Register image formats (all use ImageExporter)
    this.exporters.set('png', imageExporter)
    this.exporters.set('jpg', imageExporter)
    this.exporters.set('webp', imageExporter)

    // Register document formats
    this.exporters.set('pdf', pdfExporter)
    this.exporters.set('print', pdfExporter) // print uses PDF exporter

    // Register vector format
    this.exporters.set('svg', svgExporter)

    // Register data format
    this.exporters.set('json', jsonExporter)
  }

  /**
   * Get exporter for specified format
   * O(1) lookup via Map
   */
  getExporter(formatId: ExportFormatId): IExporter {
    const exporter = this.exporters.get(formatId)

    if (!exporter) {
      throw new Error(`No exporter registered for format: ${formatId}`)
    }

    return exporter
  }

  /**
   * Register custom exporter for format
   * Allows extensibility for new formats
   */
  registerExporter(formatId: ExportFormatId, exporter: IExporter): void {
    this.exporters.set(formatId, exporter)
  }

  /**
   * Check if format is supported
   */
  isFormatSupported(formatId: ExportFormatId): boolean {
    return this.exporters.has(formatId)
  }

  /**
   * Get all supported format IDs
   */
  getSupportedFormats(): ExportFormatId[] {
    return Array.from(this.exporters.keys())
  }
}

// Singleton instance for global use
export const exporterRegistry = new ExporterRegistry()

import { ImageExporter } from './ImageExporter'
import type { IExporter, ExportContext, ExportOptions } from './types'

/**
 * PDFExporter - Handles PDF document export
 * Strategy pattern implementation for PDF generation
 * Uses ImageExporter internally for raster-based PDF
 */
export class PDFExporter implements IExporter {
  private imageExporter: ImageExporter

  constructor() {
    this.imageExporter = new ImageExporter()
  }

  getSupportedOptions(): string[] {
    return ['resolution', 'paperSize', 'orientation', 'multiPage', 'metadata']
  }

  validateOptions(options: ExportOptions): void {
    if (options.multiPage && options.pageOverlap < 0) {
      throw new Error('Page overlap must be >= 0')
    }
  }

  async export(context: ExportContext): Promise<Blob> {
    const { options, onProgress } = context

    onProgress?.('Generating PDF', 30)

    // For PDF export, first convert to high-quality PNG
    const tempOptions: ExportOptions = { ...options, format: 'png' }
    const tempContext = { ...context, options: tempOptions }

    // Export as PNG first
    const imageBlob = await this.imageExporter.export(tempContext)

    onProgress?.('Creating PDF document', 70)

    // TODO: In production, use a PDF library like jsPDF to embed the image
    // For now, return the image blob (placeholder implementation)
    // A full implementation would:
    // 1. Create PDF document with jsPDF
    // 2. Add metadata
    // 3. Handle multi-page layouts
    // 4. Embed the image at correct resolution

    return imageBlob
  }
}

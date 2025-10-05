import type { IExporter, ExportContext, ExportOptions } from './types'

/**
 * JSONExporter - Handles MapMaker native JSON export
 * Strategy pattern implementation for data export
 */
export class JSONExporter implements IExporter {
  getSupportedOptions(): string[] {
    return ['embedImages', 'includeHistory', 'compressData', 'metadata']
  }

  validateOptions(_options: ExportOptions): void {
    // JSON export has minimal validation requirements
  }

  async export(context: ExportContext): Promise<Blob> {
    const { currentMap, options, onProgress } = context

    onProgress?.('Preparing map data', 20)

    // Create export data structure
    const exportData: {
      version: string
      format: string
      timestamp: string
      map: unknown
      metadata?: Record<string, unknown>
    } = {
      version: '1.0.0',
      format: 'mapmaker-json',
      timestamp: new Date().toISOString(),
      map: currentMap
    }

    onProgress?.('Processing objects', 50)

    // Add metadata if requested
    if (options.includeMetadata) {
      exportData.metadata = {
        exportedAt: new Date().toISOString(),
        exportOptions: {
          embedImages: options.embedImages,
          includeHistory: options.includeHistory,
          compressData: options.compressData
        }
      }
    }

    onProgress?.('Serializing data', 70)

    // Serialize to JSON
    let jsonString: string
    if (options.compressData) {
      // Compact JSON
      jsonString = JSON.stringify(exportData)
    } else {
      // Pretty-printed JSON
      jsonString = JSON.stringify(exportData, null, 2)
    }

    onProgress?.('Creating JSON blob', 90)

    // Convert to blob
    const blob = new Blob([jsonString], { type: 'application/json' })

    return blob
  }
}

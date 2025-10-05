import type { IExporter, ExportContext, ExportOptions } from './types'

/**
 * ImageExporter - Handles PNG, JPG, and WebP export
 * Strategy pattern implementation for raster image formats
 */
export class ImageExporter implements IExporter {
  getSupportedOptions(): string[] {
    return ['resolution', 'scale', 'transparency', 'quality', 'layers', 'grid', 'cropToContent', 'addMargins']
  }

  validateOptions(options: ExportOptions): void {
    if (options.resolution <= 0) {
      throw new Error('Resolution must be greater than 0')
    }
    if (options.scale <= 0) {
      throw new Error('Scale must be greater than 0')
    }
    if (options.quality < 0 || options.quality > 100) {
      throw new Error('Quality must be between 0 and 100')
    }
  }

  async export(context: ExportContext): Promise<Blob> {
    const { stageRef, options, onProgress } = context

    if (!stageRef.current) {
      throw new Error('No stage available for export')
    }

    const stage = stageRef.current

    // Calculate pixel ratio for high-resolution export
    const pixelRatio = options.resolution / 96 * options.scale

    onProgress?.('Preparing canvas', 20)

    // Create export configuration
    const exportConfig: {
      pixelRatio: number
      mimeType: string
      quality: number
      x?: number
      y?: number
      width?: number
      height?: number
    } = {
      pixelRatio,
      mimeType: `image/${options.format}`,
      quality: options.format === 'jpg' ? options.quality / 100 : 1
    }

    // Handle cropping to content
    if (options.cropToContent) {
      const contentBounds = stage.getClientRect({ skipTransform: true })
      exportConfig.x = contentBounds.x - options.addMargins
      exportConfig.y = contentBounds.y - options.addMargins
      exportConfig.width = contentBounds.width + options.addMargins * 2
      exportConfig.height = contentBounds.height + options.addMargins * 2
    }

    onProgress?.('Rendering image', 60)

    // Generate image data
    const dataURL = stage.toDataURL(exportConfig)

    onProgress?.('Converting to blob', 80)

    // Convert to blob
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      if (!ctx) {
        reject(new Error('Failed to get canvas context'))
        return
      }

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, exportConfig.mimeType, exportConfig.quality)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = dataURL
    })
  }
}

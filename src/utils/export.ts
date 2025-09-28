import { saveAs } from 'file-saver'
import type { BattleMap } from '@/types/map'
import type Konva from 'konva'

/**
 * Export map as JSON file
 */
export const exportMapAsJSON = (map: BattleMap, filename?: string) => {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    map: map
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8'
  })

  const name = filename || `${map.name.replace(/\s+/g, '_')}_${Date.now()}.json`
  saveAs(blob, name)
}

/**
 * Import map from JSON file
 */
export const importMapFromJSON = (file: File): Promise<BattleMap> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        // Validate the data structure
        if (!data.map || !data.map.id || !data.map.name) {
          throw new Error('Invalid map file format')
        }

        // Check version compatibility
        if (data.version && data.version.split('.')[0] !== '1') {
          console.warn('Map file version may not be fully compatible')
        }

        resolve(data.map)
      } catch (error) {
        reject(new Error(`Failed to parse map file: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

/**
 * Export map as PNG image
 */
export const exportMapAsPNG = async (
  stage: Konva.Stage,
  filename?: string,
  options?: {
    pixelRatio?: number
    mimeType?: string
    quality?: number
    backgroundColor?: string
  }
) => {
  if (!stage) {
    throw new Error('Stage is required for PNG export')
  }

  // Default options
  const exportOptions = {
    pixelRatio: options?.pixelRatio || 2, // Higher quality
    mimeType: options?.mimeType || 'image/png',
    quality: options?.quality || 1,
    ...options
  }

  // Get data URL from stage
  const dataURL = stage.toDataURL(exportOptions)

  // Convert to blob
  const response = await fetch(dataURL)
  const blob = await response.blob()

  // Generate filename
  const name = filename || `map_export_${Date.now()}.png`

  // Save file
  saveAs(blob, name)
}

/**
 * Export visible area as PNG
 */
export const exportVisibleAreaAsPNG = async (
  stage: Konva.Stage,
  filename?: string
) => {
  if (!stage) {
    throw new Error('Stage is required for PNG export')
  }

  // Get current viewport
  const scale = stage.scaleX()
  const position = stage.position()

  // Calculate visible area
  const visibleRect = {
    x: -position.x / scale,
    y: -position.y / scale,
    width: stage.width() / scale,
    height: stage.height() / scale
  }

  // Export with bounds
  const dataURL = stage.toDataURL({
    x: visibleRect.x,
    y: visibleRect.y,
    width: visibleRect.width,
    height: visibleRect.height,
    pixelRatio: 2
  })

  // Convert and save
  const response = await fetch(dataURL)
  const blob = await response.blob()
  const name = filename || `map_view_${Date.now()}.png`
  saveAs(blob, name)
}

/**
 * Create a download link for map data
 */
export const createMapDownloadLink = (map: BattleMap): string => {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    map: map
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8'
  })

  return URL.createObjectURL(blob)
}

/**
 * Export multiple maps as a campaign file
 */
export const exportCampaign = (maps: BattleMap[], campaignName: string) => {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    campaign: {
      name: campaignName,
      mapCount: maps.length,
      maps: maps
    }
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8'
  })

  const filename = `${campaignName.replace(/\s+/g, '_')}_campaign_${Date.now()}.json`
  saveAs(blob, filename)
}

/**
 * Import campaign file
 */
export const importCampaign = (file: File): Promise<{ name: string; maps: BattleMap[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        if (!data.campaign || !data.campaign.maps) {
          throw new Error('Invalid campaign file format')
        }

        resolve({
          name: data.campaign.name,
          maps: data.campaign.maps
        })
      } catch (error) {
        reject(new Error(`Failed to parse campaign file: ${error}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}
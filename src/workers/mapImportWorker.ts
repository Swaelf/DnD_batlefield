/**
 * Web Worker for Map Import Processing
 * Handles heavy computations for map format conversion and object processing
 */

import type { BattleMap, MapObject } from '@/types'

// Types for worker communication
export interface ImportWorkerMessage {
  type: 'PROCESS_MAP' | 'CONVERT_OBJECTS' | 'SCALE_MAP'
  payload: any
  id: string
}

export interface ImportWorkerResponse {
  type: 'PROGRESS' | 'COMPLETE' | 'ERROR'
  payload: any
  id: string
}

// Import processing functions
const processRoll20Map = (data: any): BattleMap => {
  const objects: MapObject[] = []

  // Process Roll20 objects
  if (data.objects) {
    data.objects.forEach((obj: any, index: number) => {
      const mapObject: MapObject = {
        id: obj.id || `roll20_${index}`,
        type: obj.type === 'image' ? 'shape' : obj.type,
        position: { x: obj.left || 0, y: obj.top || 0 },
        rotation: obj.angle || 0,
        layer: obj.layer || 0,
        width: obj.width || 50,
        height: obj.height || 50
      }

      // Convert Roll20 specific properties
      if (obj.type === 'path') {
        mapObject.type = 'shape'
      }

      objects.push(mapObject)
    })
  }

  return {
    id: `imported_${Date.now()}`,
    name: data.name || 'Imported Map',
    width: data.width || 1920,
    height: data.height || 1080,
    grid: {
      size: data.grid?.size || 50,
      type: data.grid?.type || 'square',
      visible: true,
      snap: true,
      color: '#ffffff'
    },
    objects
  }
}

const processFoundryMap = (data: any): BattleMap => {
  const objects: MapObject[] = []

  // Process Foundry VTT objects
  if (data.tiles) {
    data.tiles.forEach((tile: any, index: number) => {
      objects.push({
        id: tile._id || `foundry_tile_${index}`,
        type: 'shape',
        position: { x: tile.x || 0, y: tile.y || 0 },
        rotation: tile.rotation || 0,
        layer: tile.z || 0,
        width: tile.width || 50,
        height: tile.height || 50
      })
    })
  }

  if (data.tokens) {
    data.tokens.forEach((token: any, index: number) => {
      objects.push({
        id: token._id || `foundry_token_${index}`,
        type: 'token',
        position: { x: token.x || 0, y: token.y || 0 },
        rotation: token.rotation || 0,
        layer: token.elevation || 0,
        width: token.width || 50,
        height: token.height || 50
      })
    })
  }

  return {
    id: `imported_${Date.now()}`,
    name: data.name || 'Imported Foundry Map',
    width: data.width || 1920,
    height: data.height || 1080,
    grid: {
      size: data.grid || 50,
      type: 'square',
      visible: true,
      snap: true,
      color: '#ffffff'
    },
    objects
  }
}

const scaleMapToFit = (map: BattleMap, targetWidth: number, targetHeight: number): BattleMap => {
  const scaleX = targetWidth / map.width
  const scaleY = targetHeight / map.height
  const scale = Math.min(scaleX, scaleY)

  const scaledObjects = map.objects.map(obj => ({
    ...obj,
    position: {
      x: obj.position.x * scale,
      y: obj.position.y * scale
    },
    width: (obj.width || 50) * scale,
    height: (obj.height || 50) * scale
  }))

  return {
    ...map,
    width: targetWidth,
    height: targetHeight,
    grid: {
      ...map.grid,
      size: map.grid.size * scale
    },
    objects: scaledObjects
  }
}

const convertObjectsFormat = (objects: any[], sourceFormat: string): MapObject[] => {
  return objects.map((obj, index) => {
    switch (sourceFormat) {
      case 'roll20':
        return {
          id: obj.id || `conv_${index}`,
          type: obj.type === 'image' ? 'shape' : obj.type,
          position: { x: obj.left || 0, y: obj.top || 0 },
          rotation: obj.angle || 0,
          layer: obj.layer || 0,
          width: obj.width || 50,
          height: obj.height || 50
        }
      case 'foundry':
        return {
          id: obj._id || `conv_${index}`,
          type: obj.type || 'shape',
          position: { x: obj.x || 0, y: obj.y || 0 },
          rotation: obj.rotation || 0,
          layer: obj.z || obj.elevation || 0,
          width: obj.width || 50,
          height: obj.height || 50
        }
      default:
        return {
          id: obj.id || `conv_${index}`,
          type: obj.type || 'shape',
          position: { x: obj.x || 0, y: obj.y || 0 },
          rotation: obj.rotation || 0,
          layer: obj.layer || 0,
          width: obj.width || 50,
          height: obj.height || 50
        }
    }
  })
}

// Worker message handler
self.onmessage = (event: MessageEvent<ImportWorkerMessage>) => {
  const { type, payload, id } = event.data

  try {
    let result: any

    switch (type) {
      case 'PROCESS_MAP':
        const { data, format } = payload

        // Send progress update
        self.postMessage({
          type: 'PROGRESS',
          payload: { stage: 'parsing', progress: 25, message: 'Parsing map data...' },
          id
        } as ImportWorkerResponse)

        switch (format) {
          case 'roll20':
            result = processRoll20Map(data)
            break
          case 'foundry':
            result = processFoundryMap(data)
            break
          default:
            throw new Error(`Unsupported format: ${format}`)
        }

        // Send progress update
        self.postMessage({
          type: 'PROGRESS',
          payload: { stage: 'processing', progress: 75, message: 'Processing objects...' },
          id
        } as ImportWorkerResponse)

        break

      case 'CONVERT_OBJECTS':
        const { objects, sourceFormat } = payload
        result = convertObjectsFormat(objects, sourceFormat)
        break

      case 'SCALE_MAP':
        const { map, targetWidth, targetHeight } = payload
        result = scaleMapToFit(map, targetWidth, targetHeight)
        break

      default:
        throw new Error(`Unknown message type: ${type}`)
    }

    // Send completion
    self.postMessage({
      type: 'COMPLETE',
      payload: result,
      id
    } as ImportWorkerResponse)

  } catch (error) {
    // Send error
    self.postMessage({
      type: 'ERROR',
      payload: { message: error instanceof Error ? error.message : 'Unknown error' },
      id
    } as ImportWorkerResponse)
  }
}

// Export types for TypeScript
export type {}
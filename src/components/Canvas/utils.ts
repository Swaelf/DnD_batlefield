/**
 * Canvas Utility Functions
 * Extracted from MapCanvas.tsx
 */

import type { Point } from '@/types/geometry'
import type { Token, TokenSize } from '@/types/token'
import type { MapObject, Shape } from '@/types/map'
import type { ObjectBounds } from './types'

/**
 * Get pixel size for a D&D token size
 */
export function getTokenPixelSize(size: TokenSize, gridSize: number): number {
  switch (size) {
    case 'tiny':
      return gridSize * 0.5
    case 'small':
    case 'medium':
      return gridSize
    case 'large':
      return gridSize * 2
    case 'huge':
      return gridSize * 3
    case 'gargantuan':
      return gridSize * 4
    default:
      return gridSize
  }
}

/**
 * Calculate bounds for a map object
 */
export function getObjectBounds(obj: MapObject, gridSize: number): ObjectBounds | null {
  switch (obj.type) {
    case 'token': {
      const token = obj as Token
      const tokenSize = getTokenPixelSize(token.size || 'medium', gridSize)
      return {
        x: token.position.x - tokenSize / 2,
        y: token.position.y - tokenSize / 2,
        width: tokenSize,
        height: tokenSize
      }
    }

    case 'shape': {
      const shape = obj as Shape
      switch (shape.shapeType) {
        case 'rectangle':
          return {
            x: shape.position.x,
            y: shape.position.y,
            width: shape.width || 0,
            height: shape.height || 0
          }

        case 'circle': {
          const radius = shape.radius || 0
          return {
            x: shape.position.x - radius,
            y: shape.position.y - radius,
            width: radius * 2,
            height: radius * 2
          }
        }

        case 'line':
        case 'polygon': {
          if (!shape.points || shape.points.length < 2) {
            return null
          }
          const xs = shape.points.filter((_, i) => i % 2 === 0)
          const ys = shape.points.filter((_, i) => i % 2 === 1)
          const minX = Math.min(...xs)
          const maxX = Math.max(...xs)
          const minY = Math.min(...ys)
          const maxY = Math.max(...ys)
          return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          }
        }

        default:
          return null
      }
    }

    default:
      return null
  }
}

/**
 * Check if an object intersects with a rectangle
 */
export function objectIntersectsRect(
  obj: MapObject,
  rect: ObjectBounds,
  gridSize: number
): boolean {
  const objBounds = getObjectBounds(obj, gridSize)
  if (!objBounds) return false

  return !(
    objBounds.x > rect.x + rect.width ||
    objBounds.x + objBounds.width < rect.x ||
    objBounds.y > rect.y + rect.height ||
    objBounds.y + objBounds.height < rect.y
  )
}

/**
 * Find token at a specific position
 */
export function findTokenAtPosition(
  position: Point,
  tokens: Token[],
  gridSize: number
): Token | null {
  for (const token of tokens) {
    const tokenSize = getTokenPixelSize(token.size || 'medium', gridSize)
    const halfSize = tokenSize / 2

    const withinX = position.x >= token.position.x - halfSize &&
                    position.x <= token.position.x + halfSize
    const withinY = position.y >= token.position.y - halfSize &&
                    position.y <= token.position.y + halfSize

    if (withinX && withinY) {
      return token
    }
  }

  return null
}

/**
 * Check if a tool is a drawing tool
 */
export function isDrawingTool(tool: string): boolean {
  return ['rectangle', 'circle', 'polygon', 'line'].includes(tool)
}

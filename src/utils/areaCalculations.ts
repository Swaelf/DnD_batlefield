import type { Point } from '@/types/geometry'
import type { Token } from '@/types'
import type {
  AreaShape,
  CircularArea,
  SquareArea,
  ConeArea,
  LineArea
} from '@/types/unifiedAction'

/**
 * Calculate if a point is within a given area
 */
export const isPointInArea = (point: Point, area: AreaShape): boolean => {
  switch (area.type) {
    case 'circle':
      return isPointInCircle(point, area as CircularArea)
    case 'square':
      return isPointInSquare(point, area as SquareArea)
    case 'cone':
      return isPointInCone(point, area as ConeArea)
    case 'line':
      return isPointNearLine(point, area as LineArea)
    default:
      return false
  }
}

/**
 * Check if point is within a circular area
 */
export const isPointInCircle = (point: Point, circle: CircularArea): boolean => {
  const dx = point.x - circle.center.x
  const dy = point.y - circle.center.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance <= circle.radius
}

/**
 * Check if point is within a square area
 */
export const isPointInSquare = (point: Point, square: SquareArea): boolean => {
  const halfSize = square.size / 2
  return Math.abs(point.x - square.center.x) <= halfSize &&
         Math.abs(point.y - square.center.y) <= halfSize
}

/**
 * Check if point is within a cone area
 */
export const isPointInCone = (point: Point, cone: ConeArea): boolean => {
  const dx = point.x - cone.origin.x
  const dy = point.y - cone.origin.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Check if within range
  if (distance > cone.range) return false

  // Check if within angle
  const angleToPoint = Math.atan2(dy, dx) * 180 / Math.PI
  const normalizedAngle = normalizeAngle(angleToPoint)
  const normalizedDirection = normalizeAngle(cone.direction)

  // Calculate angular difference
  let angleDiff = Math.abs(normalizedAngle - normalizedDirection)
  if (angleDiff > 180) angleDiff = 360 - angleDiff

  return angleDiff <= cone.angle / 2
}

/**
 * Check if point is near a line (within width distance)
 */
export const isPointNearLine = (point: Point, line: LineArea): boolean => {
  const { start, end, width } = line

  // Calculate distance from point to line segment
  const A = point.x - start.x
  const B = point.y - start.y
  const C = end.x - start.x
  const D = end.y - start.y

  const dot = A * C + B * D
  const lenSq = C * C + D * D

  if (lenSq === 0) {
    // Start and end are the same point
    const dist = Math.sqrt(A * A + B * B)
    return dist <= width / 2
  }

  let param = dot / lenSq

  // Clamp to line segment
  param = Math.max(0, Math.min(1, param))

  const xx = start.x + param * C
  const yy = start.y + param * D

  const dx = point.x - xx
  const dy = point.y - yy
  const distance = Math.sqrt(dx * dx + dy * dy)

  return distance <= width / 2
}

/**
 * Get all tokens within an area
 */
export const getTokensInArea = (
  tokens: Token[],
  area: AreaShape,
  excludeSource?: string
): Token[] => {
  return tokens.filter(token => {
    // Exclude source token if specified
    if (excludeSource && token.id === excludeSource) {
      return false
    }

    return isPointInArea(token.position, area)
  })
}

/**
 * Calculate the bounds of an area for rendering
 */
export const getAreaBounds = (area: AreaShape): { min: Point; max: Point } => {
  switch (area.type) {
    case 'circle': {
      const circle = area as CircularArea
      return {
        min: {
          x: circle.center.x - circle.radius,
          y: circle.center.y - circle.radius
        },
        max: {
          x: circle.center.x + circle.radius,
          y: circle.center.y + circle.radius
        }
      }
    }

    case 'square': {
      const square = area as SquareArea
      const halfSize = square.size / 2
      return {
        min: {
          x: square.center.x - halfSize,
          y: square.center.y - halfSize
        },
        max: {
          x: square.center.x + halfSize,
          y: square.center.y + halfSize
        }
      }
    }

    case 'cone': {
      const cone = area as ConeArea
      // Rough bounds for cone (full circle with range radius)
      return {
        min: {
          x: cone.origin.x - cone.range,
          y: cone.origin.y - cone.range
        },
        max: {
          x: cone.origin.x + cone.range,
          y: cone.origin.y + cone.range
        }
      }
    }

    case 'line': {
      const line = area as LineArea
      const halfWidth = line.width / 2
      return {
        min: {
          x: Math.min(line.start.x, line.end.x) - halfWidth,
          y: Math.min(line.start.y, line.end.y) - halfWidth
        },
        max: {
          x: Math.max(line.start.x, line.end.x) + halfWidth,
          y: Math.max(line.start.y, line.end.y) + halfWidth
        }
      }
    }

    default:
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }
  }
}

/**
 * Calculate area overlap between two shapes
 */
export const doAreasOverlap = (area1: AreaShape, area2: AreaShape): boolean => {
  const bounds1 = getAreaBounds(area1)
  const bounds2 = getAreaBounds(area2)

  // Quick bounding box check
  if (bounds1.max.x < bounds2.min.x || bounds1.min.x > bounds2.max.x) return false
  if (bounds1.max.y < bounds2.min.y || bounds1.min.y > bounds2.max.y) return false

  // For more precise checking, we'd need shape-specific overlap tests
  // For now, bounding box overlap is sufficient
  return true
}

/**
 * Calculate the center point of an area
 */
export const getAreaCenter = (area: AreaShape): Point => {
  switch (area.type) {
    case 'circle':
      return (area as CircularArea).center
    case 'square':
      return (area as SquareArea).center
    case 'cone':
      return (area as ConeArea).origin
    case 'line': {
      const line = area as LineArea
      return {
        x: (line.start.x + line.end.x) / 2,
        y: (line.start.y + line.end.y) / 2
      }
    }
    default:
      return { x: 0, y: 0 }
  }
}

/**
 * Calculate the area coverage in square units (for damage calculations)
 */
export const getAreaSize = (area: AreaShape): number => {
  switch (area.type) {
    case 'circle': {
      const circle = area as CircularArea
      return Math.PI * circle.radius * circle.radius
    }
    case 'square': {
      const square = area as SquareArea
      return square.size * square.size
    }
    case 'cone': {
      const cone = area as ConeArea
      // Area of cone sector
      const angleRad = (cone.angle * Math.PI) / 180
      return 0.5 * angleRad * cone.range * cone.range
    }
    case 'line': {
      const line = area as LineArea
      const dx = line.end.x - line.start.x
      const dy = line.end.y - line.start.y
      const length = Math.sqrt(dx * dx + dy * dy)
      return length * line.width
    }
    default:
      return 0
  }
}

/**
 * Generate points along the perimeter of an area (for visual effects)
 */
export const getAreaPerimeterPoints = (area: AreaShape, numPoints: number): Point[] => {
  const points: Point[] = []

  switch (area.type) {
    case 'circle': {
      const circle = area as CircularArea
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        points.push({
          x: circle.center.x + Math.cos(angle) * circle.radius,
          y: circle.center.y + Math.sin(angle) * circle.radius
        })
      }
      break
    }

    case 'square': {
      const square = area as SquareArea
      const halfSize = square.size / 2
      const pointsPerSide = Math.ceil(numPoints / 4)

      // Top edge
      for (let i = 0; i < pointsPerSide; i++) {
        const t = i / pointsPerSide
        points.push({
          x: square.center.x - halfSize + t * square.size,
          y: square.center.y - halfSize
        })
      }

      // Right edge
      for (let i = 0; i < pointsPerSide; i++) {
        const t = i / pointsPerSide
        points.push({
          x: square.center.x + halfSize,
          y: square.center.y - halfSize + t * square.size
        })
      }

      // Bottom edge
      for (let i = 0; i < pointsPerSide; i++) {
        const t = i / pointsPerSide
        points.push({
          x: square.center.x + halfSize - t * square.size,
          y: square.center.y + halfSize
        })
      }

      // Left edge
      for (let i = 0; i < pointsPerSide; i++) {
        const t = i / pointsPerSide
        points.push({
          x: square.center.x - halfSize,
          y: square.center.y + halfSize - t * square.size
        })
      }
      break
    }

    case 'cone': {
      const cone = area as ConeArea
      const startAngle = (cone.direction - cone.angle / 2) * Math.PI / 180
      const endAngle = (cone.direction + cone.angle / 2) * Math.PI / 180

      // Arc points
      for (let i = 0; i < numPoints; i++) {
        const t = i / (numPoints - 1)
        const angle = startAngle + t * (endAngle - startAngle)
        points.push({
          x: cone.origin.x + Math.cos(angle) * cone.range,
          y: cone.origin.y + Math.sin(angle) * cone.range
        })
      }

      // Add origin point
      points.push(cone.origin)
      break
    }

    case 'line': {
      const line = area as LineArea
      const dx = line.end.x - line.start.x
      const dy = line.end.y - line.start.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const perpX = -dy / length * line.width / 2
      const perpY = dx / length * line.width / 2

      // One side
      for (let i = 0; i < numPoints / 2; i++) {
        const t = i / (numPoints / 2 - 1)
        points.push({
          x: line.start.x + t * dx + perpX,
          y: line.start.y + t * dy + perpY
        })
      }

      // Other side
      for (let i = 0; i < numPoints / 2; i++) {
        const t = 1 - i / (numPoints / 2 - 1)
        points.push({
          x: line.start.x + t * dx - perpX,
          y: line.start.y + t * dy - perpY
        })
      }
      break
    }
  }

  return points
}

// Helper function to normalize angle to 0-360 range
const normalizeAngle = (angle: number): number => {
  while (angle < 0) angle += 360
  while (angle >= 360) angle -= 360
  return angle
}
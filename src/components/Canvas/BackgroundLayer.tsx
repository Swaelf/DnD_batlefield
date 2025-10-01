/**
 * BackgroundLayer - Grid rendering component
 * Extracted from MapCanvas.tsx for better organization
 */

import { memo, type RefObject } from 'react'
import { Layer, Line } from 'react-konva'
import type Konva from 'konva'
import type { GridSettings } from '@/types'

export interface BackgroundLayerProps {
  readonly gridSettings: GridSettings | undefined
  readonly stageRef: RefObject<Konva.Stage | null>
  readonly width: number
  readonly height: number
}

export const BackgroundLayer = memo(function BackgroundLayer({
  gridSettings,
  stageRef,
  width,
  height
}: BackgroundLayerProps) {
  if (!gridSettings?.visible) return null

  const gridSize = gridSettings.size || 50
  const stage = stageRef.current

  // Get stage transform to calculate visible area
  const scale = stage?.scaleX() || 1
  const pos = stage?.position() || { x: 0, y: 0 }

  // Calculate the visible area in canvas coordinates
  const visibleLeft = -pos.x / scale
  const visibleTop = -pos.y / scale
  const visibleRight = visibleLeft + width / scale
  const visibleBottom = visibleTop + height / scale

  // Add padding to render grid beyond visible area
  const padding = gridSize * 5
  const startX = Math.floor((visibleLeft - padding) / gridSize) * gridSize
  const endX = Math.ceil((visibleRight + padding) / gridSize) * gridSize
  const startY = Math.floor((visibleTop - padding) / gridSize) * gridSize
  const endY = Math.ceil((visibleBottom + padding) / gridSize) * gridSize

  const lines = []

  // Vertical lines
  for (let x = startX; x <= endX; x += gridSize) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, startY, x, endY]}
        stroke={gridSettings.color || '#374151'}
        strokeWidth={1 / scale}
        opacity={0.6}
        listening={false}
      />
    )
  }

  // Horizontal lines
  for (let y = startY; y <= endY; y += gridSize) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[startX, y, endX, y]}
        stroke={gridSettings.color || '#374151'}
        strokeWidth={1 / scale}
        opacity={0.6}
        listening={false}
      />
    )
  }

  return (
    <Layer name="background" listening={false}>
      {lines}
    </Layer>
  )
})

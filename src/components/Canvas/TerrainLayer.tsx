/**
 * TerrainLayer - Background Drawing Layer
 *
 * Renders terrain drawings on Layer 1 (between field color and grid).
 * Non-interactive layer with listening={false} for optimal performance.
 */

import { memo, type FC } from 'react'
import { Layer, Line, Rect, Circle } from 'react-konva'
import type { BattleMap } from '@/types'

export type TerrainLayerProps = {
  terrain: BattleMap['terrain']
  width: number
  height: number
}

export const TerrainLayer: FC<TerrainLayerProps> = memo(({
  terrain
  // width and height reserved for future fill bucket implementation
}) => {
  // No terrain data - render empty layer
  if (!terrain || !terrain.drawings || terrain.drawings.length === 0) {
    return (
      <Layer name="terrain" listening={false}>
        {/* Empty terrain layer - no drawings */}
      </Layer>
    )
  }

  return (
    <Layer name="terrain" listening={false}>
      {/* Render terrain drawings */}
      {terrain.drawings.map((drawing) => {
        switch (drawing.type) {
          case 'brush':
            // Brush stroke - render as Konva.Line
            return (
              <Line
                key={drawing.id}
                points={drawing.points || []}
                stroke={drawing.color}
                strokeWidth={drawing.strokeWidth || 5}
                opacity={drawing.opacity || 1}
                lineCap="round"
                lineJoin="round"
                tension={0.5}
                listening={false}
              />
            )

          case 'fill':
            // Fill bucket - not implemented yet in Phase 3
            // Will be added in Phase 4
            return null

          case 'erase':
            // Erase stroke - render with destination-out to erase terrain
            return (
              <Line
                key={drawing.id}
                points={drawing.points || []}
                stroke="white"
                strokeWidth={drawing.strokeWidth || 5}
                opacity={1}
                lineCap="round"
                lineJoin="round"
                tension={0.5}
                listening={false}
                globalCompositeOperation="destination-out"
              />
            )

          case 'rectangle':
            return (
              <Rect
                key={drawing.id}
                x={drawing.position?.x || 0}
                y={drawing.position?.y || 0}
                width={drawing.width || 0}
                height={drawing.height || 0}
                fill={drawing.color}
                opacity={drawing.opacity || 1}
                listening={false}
              />
            )

          case 'circle':
            return (
              <Circle
                key={drawing.id}
                x={drawing.position?.x || 0}
                y={drawing.position?.y || 0}
                radius={drawing.radius || 0}
                fill={drawing.color}
                opacity={drawing.opacity || 1}
                listening={false}
              />
            )

          case 'line':
          case 'polygon':
            return (
              <Line
                key={drawing.id}
                points={drawing.points || []}
                stroke={drawing.color}
                strokeWidth={drawing.strokeWidth || 3}
                opacity={drawing.opacity || 1}
                lineCap="round"
                lineJoin="round"
                listening={false}
              />
            )

          default:
            return null
        }
      })}
    </Layer>
  )
}, (prevProps, nextProps) => {
  // Only re-render if terrain version changes
  return prevProps.terrain?.version === nextProps.terrain?.version
})

TerrainLayer.displayName = 'TerrainLayer'

import { useMemo, memo, type FC } from 'react'
import { Line, Group } from 'react-konva'

type GridLayerProps = {
  width: number
  height: number
  gridSize: number
  gridColor: string
  visible: boolean
  scale: number
  stagePosition: { x: number; y: number }
  viewportWidth: number
  viewportHeight: number
}

const GridLayer: FC<GridLayerProps> = ({
  width,
  height,
  gridSize,
  gridColor,
  visible,
  scale,
  stagePosition,
  viewportWidth,
  viewportHeight,
}) => {
  const lines = useMemo(() => {
    if (!visible) return { vertical: [], horizontal: [] }

    const lines = {
      vertical: [] as number[][],
      horizontal: [] as number[][],
    }

    // Calculate visible area with padding
    const padding = gridSize * 2
    const visibleLeft = (-stagePosition.x - padding) / scale
    const visibleTop = (-stagePosition.y - padding) / scale
    const visibleRight = (-stagePosition.x + viewportWidth + padding) / scale
    const visibleBottom = (-stagePosition.y + viewportHeight + padding) / scale

    // Clamp to map boundaries
    const startX = Math.max(0, Math.floor(visibleLeft / gridSize) * gridSize)
    const endX = Math.min(width, Math.ceil(visibleRight / gridSize) * gridSize)
    const startY = Math.max(0, Math.floor(visibleTop / gridSize) * gridSize)
    const endY = Math.min(height, Math.ceil(visibleBottom / gridSize) * gridSize)

    // Generate vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      lines.vertical.push([x, startY, x, endY])
    }

    // Generate horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      lines.horizontal.push([startY, y, endX, y])
    }

    return lines
  }, [width, height, gridSize, visible, scale, stagePosition, viewportWidth, viewportHeight])

  if (!visible) return null

  // Adjust opacity based on zoom level
  const opacity = Math.min(1, Math.max(0.1, scale * 0.5))

  // Adjust stroke width based on zoom level
  const strokeWidth = Math.max(0.5, 1 / scale)

  return (
    <Group>
      {/* Render vertical lines */}
      {lines.vertical.map((points, i) => (
        <Line
          key={`v-${i}-${points[0]}`}
          points={points}
          stroke={gridColor}
          strokeWidth={strokeWidth}
          opacity={opacity * 0.3}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}

      {/* Render horizontal lines */}
      {lines.horizontal.map((points, i) => (
        <Line
          key={`h-${i}-${points[1]}`}
          points={points}
          stroke={gridColor}
          strokeWidth={strokeWidth}
          opacity={opacity * 0.3}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}

      {/* Major grid lines every 5 squares */}
      {lines.vertical
        .filter((_, i) => i % 5 === 0)
        .map((points, i) => (
          <Line
            key={`v-major-${i}-${points[0]}`}
            points={points}
            stroke={gridColor}
            strokeWidth={strokeWidth * 1.5}
            opacity={opacity * 0.5}
            listening={false}
            perfectDrawEnabled={false}
          />
        ))}

      {lines.horizontal
        .filter((_, i) => i % 5 === 0)
        .map((points, i) => (
          <Line
            key={`h-major-${i}-${points[1]}`}
            points={points}
            stroke={gridColor}
            strokeWidth={strokeWidth * 1.5}
            opacity={opacity * 0.5}
            listening={false}
            perfectDrawEnabled={false}
          />
        ))}
    </Group>
  )
}

// Custom comparison to prevent re-renders during smooth panning/zooming
const arePropsEqual = (prevProps: GridLayerProps, nextProps: GridLayerProps): boolean => {
  // Always re-render if visibility changes
  if (prevProps.visible !== nextProps.visible) return false

  // Don't re-render if grid is not visible
  if (!nextProps.visible) return true

  // Check if grid structure would actually change
  const significantChange =
    prevProps.width !== nextProps.width ||
    prevProps.height !== nextProps.height ||
    prevProps.gridSize !== nextProps.gridSize ||
    prevProps.gridColor !== nextProps.gridColor ||
    prevProps.viewportWidth !== nextProps.viewportWidth ||
    prevProps.viewportHeight !== nextProps.viewportHeight

  if (significantChange) return false

  // For scale and position, only re-render if change is significant
  // This prevents re-renders during smooth animations
  const scaleDiff = Math.abs(prevProps.scale - nextProps.scale)
  const positionDiff =
    Math.abs(prevProps.stagePosition.x - nextProps.stagePosition.x) +
    Math.abs(prevProps.stagePosition.y - nextProps.stagePosition.y)

  // Only re-render if scale changed by more than 5% or position by more than gridSize
  return scaleDiff < prevProps.scale * 0.05 && positionDiff < prevProps.gridSize
}

export default memo(GridLayer, arePropsEqual)
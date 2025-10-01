import { useState, useCallback, useEffect, type FC } from 'react'
import { Group, Line, Circle } from 'react-konva'
import type Konva from 'konva'
import type { Point } from '@/types/geometry'
import { snapToGrid } from '@/utils/grid'
import useToolStore from '@store/toolStore'

interface AdvancedPolygonToolProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  onPolygonComplete: (points: Point[]) => void
  onCancel?: () => void
}

interface PolygonState {
  points: Point[]
  isDrawing: boolean
  previewPoint: Point | null
  hoveredVertex: number | null
  isDragging: boolean
  dragVertexIndex: number | null
}

export const AdvancedPolygonTool: FC<AdvancedPolygonToolProps> = ({
  isActive,
  gridSize,
  gridSnap,
  onPolygonComplete,
  onCancel
}) => {
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)
  const opacity = useToolStore(state => state.opacity)

  const [polygonState, setPolygonState] = useState<PolygonState>({
    points: [],
    isDrawing: false,
    previewPoint: null,
    hoveredVertex: null,
    isDragging: false,
    dragVertexIndex: null
  })

  // const _stageRef = useRef<Konva.Stage | null>(null) // unused

  // Reset state when tool becomes inactive
  useEffect(() => {
    if (!isActive) {
      setPolygonState({
        points: [],
        isDrawing: false,
        previewPoint: null,
        hoveredVertex: null,
        isDragging: false,
        dragVertexIndex: null
      })
    }
  }, [isActive])

  // Handle mouse move for preview line and vertex hovering
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    let point = transform.point(pointer)

    // Snap to grid if enabled
    if (gridSnap) {
      point = snapToGrid(point, gridSize)
    }

    if (polygonState.isDragging && polygonState.dragVertexIndex !== null) {
      // Update dragged vertex position
      const newPoints = [...polygonState.points]
      newPoints[polygonState.dragVertexIndex] = point
      setPolygonState(prev => ({
        ...prev,
        points: newPoints
      }))
    } else {
      // Update preview point for next vertex
      setPolygonState(prev => ({
        ...prev,
        previewPoint: point
      }))
    }
  }, [isActive, gridSnap, gridSize, polygonState.isDragging, polygonState.dragVertexIndex, polygonState.points])

  // Handle click to add vertex or complete polygon
  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    let point = transform.point(pointer)

    // Snap to grid if enabled
    if (gridSnap) {
      point = snapToGrid(point, gridSize)
    }

    // Check if clicking on existing vertex (for dragging)
    const vertexRadius = 6
    for (let i = 0; i < polygonState.points.length; i++) {
      const vertex = polygonState.points[i]
      const distance = Math.sqrt((point.x - vertex.x) ** 2 + (point.y - vertex.y) ** 2)
      if (distance <= vertexRadius) {
        // Clicked on existing vertex - don't add new point
        return
      }
    }

    // Check if double-clicking to complete polygon
    if (e.evt.detail === 2) {
      if (polygonState.points.length >= 3) {
        onPolygonComplete(polygonState.points)
      }
      return
    }

    // Add new vertex
    if (!polygonState.isDrawing) {
      // Start new polygon
      setPolygonState(prev => ({
        ...prev,
        points: [point],
        isDrawing: true,
        previewPoint: point
      }))
    } else {
      // Add vertex to current polygon
      const newPoints = [...polygonState.points, point]

      // Check if clicking near the first point to close polygon
      if (newPoints.length >= 3) {
        const firstPoint = newPoints[0]
        const distance = Math.sqrt((point.x - firstPoint.x) ** 2 + (point.y - firstPoint.y) ** 2)
        const closeThreshold = gridSnap ? gridSize / 2 : 20

        if (distance <= closeThreshold) {
          // Close the polygon
          onPolygonComplete(newPoints.slice(0, -1)) // Remove duplicate point
          return
        }
      }

      setPolygonState(prev => ({
        ...prev,
        points: newPoints
      }))
    }
  }, [isActive, gridSnap, gridSize, polygonState.points, polygonState.isDrawing, onPolygonComplete])

  // Handle vertex dragging
  const handleVertexDragStart = useCallback((vertexIndex: number) => {
    setPolygonState(prev => ({
      ...prev,
      isDragging: true,
      dragVertexIndex: vertexIndex
    }))
  }, [])

  const handleVertexDragEnd = useCallback(() => {
    setPolygonState(prev => ({
      ...prev,
      isDragging: false,
      dragVertexIndex: null
    }))
  }, [])

  // Handle vertex hover
  const handleVertexMouseEnter = useCallback((vertexIndex: number) => {
    setPolygonState(prev => ({
      ...prev,
      hoveredVertex: vertexIndex
    }))
  }, [])

  const handleVertexMouseLeave = useCallback(() => {
    setPolygonState(prev => ({
      ...prev,
      hoveredVertex: null
    }))
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onCancel?.()
          break
        case 'Enter':
          e.preventDefault()
          if (polygonState.points.length >= 3) {
            onPolygonComplete(polygonState.points)
          }
          break
        case 'Backspace':
        case 'Delete':
          e.preventDefault()
          // Remove last point
          if (polygonState.points.length > 0) {
            setPolygonState(prev => ({
              ...prev,
              points: prev.points.slice(0, -1),
              isDrawing: prev.points.length > 1
            }))
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, polygonState.points, onPolygonComplete, onCancel])

  if (!isActive || !polygonState.isDrawing) {
    return null
  }

  // Convert points to flat array for Konva
  const flatPoints = polygonState.points.reduce<number[]>((acc, point) => {
    acc.push(point.x, point.y)
    return acc
  }, [])

  // Add preview line to cursor
  if (polygonState.previewPoint && polygonState.points.length > 0) {
    const lastPoint = polygonState.points[polygonState.points.length - 1]
    flatPoints.push(lastPoint.x, lastPoint.y, polygonState.previewPoint.x, polygonState.previewPoint.y)
  }

  return (
    <Group
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Polygon preview line */}
      {polygonState.points.length > 0 && (
        <Line
          points={flatPoints}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          opacity={opacity * 0.8}
          dash={[5, 5]}
          listening={false}
        />
      )}

      {/* Completed polygon area */}
      {polygonState.points.length >= 3 && (
        <Line
          points={polygonState.points.reduce<number[]>((acc, point) => {
            acc.push(point.x, point.y)
            return acc
          }, [])}
          fill={fillColor}
          opacity={opacity * 0.3}
          closed={true}
          listening={false}
        />
      )}

      {/* Vertex handles */}
      {polygonState.points.map((point, index) => (
        <Circle
          key={index}
          x={point.x}
          y={point.y}
          radius={polygonState.hoveredVertex === index ? 8 : 6}
          fill={polygonState.hoveredVertex === index ? '#3B82F6' : '#FFFFFF'}
          stroke={strokeColor}
          strokeWidth={2}
          draggable
          onDragStart={() => handleVertexDragStart(index)}
          onDragEnd={handleVertexDragEnd}
          onMouseEnter={() => handleVertexMouseEnter(index)}
          onMouseLeave={handleVertexMouseLeave}
        />
      ))}

      {/* First vertex indicator (for closing polygon) */}
      {polygonState.points.length >= 3 && (
        <Circle
          x={polygonState.points[0].x}
          y={polygonState.points[0].y}
          radius={10}
          stroke="#10B981"
          strokeWidth={2}
          dash={[3, 3]}
          listening={false}
        />
      )}
    </Group>
  )
}
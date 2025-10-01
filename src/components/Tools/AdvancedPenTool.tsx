import { useCallback, useRef, useState, type FC } from 'react'
import { Group, Line, Circle } from 'react-konva'
import type Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import type { Point, Shape } from '@/types'

interface BezierPoint {
  point: Point
  controlPoint1?: Point
  controlPoint2?: Point
  type: 'anchor' | 'control'
}

interface AdvancedPenToolProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  onPathComplete?: (path: BezierPoint[]) => void
  onCancel?: () => void
}

export const AdvancedPenTool: FC<AdvancedPenToolProps> = ({
  isActive,
  gridSize,
  gridSnap,
  onPathComplete,
  onCancel
}) => {
  const [currentPath, setCurrentPath] = useState<BezierPoint[]>([])
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [previewPoint, setPreviewPoint] = useState<Point | null>(null)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [draggedPoint, setDraggedPoint] = useState<{
    pointIndex: number
    controlType: 'anchor' | 'control1' | 'control2'
  } | null>(null)

  const groupRef = useRef<Konva.Group>(null)

  const { addObject } = useMapStore()
  const { fillColor, strokeColor, strokeWidth } = useToolStore()

  // Snap point to grid if enabled
  const snapPoint = useCallback((point: Point): Point => {
    if (!gridSnap) return point

    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    }
  }, [gridSnap, gridSize])

  // Convert Bezier points to SVG path string
  const pathToSVG = useCallback((points: BezierPoint[]): string => {
    if (points.length === 0) return ''

    let pathString = `M ${points[0].point.x} ${points[0].point.y}`

    for (let i = 1; i < points.length; i++) {
      const current = points[i]
      const previous = points[i - 1]

      if (current.controlPoint1 || previous.controlPoint2) {
        // Cubic Bezier curve
        const cp1 = previous.controlPoint2 || previous.point
        const cp2 = current.controlPoint1 || current.point

        pathString += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${current.point.x} ${current.point.y}`
      } else {
        // Straight line
        pathString += ` L ${current.point.x} ${current.point.y}`
      }
    }

    return pathString
  }, [])

  // Convert Bezier curve to line points for Konva
  const bezierToPoints = useCallback((points: BezierPoint[]): number[] => {
    if (points.length < 2) return []

    const linePoints: number[] = []
    const resolution = 10 // Points per curve segment

    // Add first point
    linePoints.push(points[0].point.x, points[0].point.y)

    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1]
      const end = points[i]

      if (start.controlPoint2 || end.controlPoint1) {
        // Bezier curve - sample points along the curve
        const cp1 = start.controlPoint2 || start.point
        const cp2 = end.controlPoint1 || end.point

        for (let t = 1; t <= resolution; t++) {
          const u = t / resolution
          const point = cubicBezierPoint(start.point, cp1, cp2, end.point, u)
          linePoints.push(point.x, point.y)
        }
      } else {
        // Straight line
        linePoints.push(end.point.x, end.point.y)
      }
    }

    return linePoints
  }, [])

  // Calculate point on cubic Bezier curve
  const cubicBezierPoint = useCallback((
    p0: Point, p1: Point, p2: Point, p3: Point, t: number
  ): Point => {
    const u = 1 - t
    const tt = t * t
    const uu = u * u
    const uuu = uu * u
    const ttt = tt * t

    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    }
  }, [])

  // Generate automatic control points for smooth curves
  const generateControlPoints = useCallback((points: BezierPoint[]): BezierPoint[] => {
    if (points.length < 2) return points

    const result: BezierPoint[] = [...points]

    for (let i = 0; i < result.length; i++) {
      const current = result[i]
      const prev = i > 0 ? result[i - 1] : null
      const next = i < result.length - 1 ? result[i + 1] : null

      if (prev && next) {
        // Calculate control points for smooth curve through three points
        const distance = Math.sqrt(
          Math.pow(next.point.x - prev.point.x, 2) +
          Math.pow(next.point.y - prev.point.y, 2)
        )
        const tension = 0.3 // Control point tension
        const angle = Math.atan2(next.point.y - prev.point.y, next.point.x - prev.point.x)

        const controlDistance = distance * tension * 0.5

        current.controlPoint1 = {
          x: current.point.x - Math.cos(angle) * controlDistance,
          y: current.point.y - Math.sin(angle) * controlDistance
        }
        current.controlPoint2 = {
          x: current.point.x + Math.cos(angle) * controlDistance,
          y: current.point.y + Math.sin(angle) * controlDistance
        }
      }
    }

    return result
  }, [])

  // Handle mouse down - start drawing or select point
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    e.cancelBubble = true

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = snapPoint(transform.point(pointer))

    if (mode === 'create') {
      // Add new anchor point
      const newPoint: BezierPoint = {
        point: pos,
        type: 'anchor'
      }

      setCurrentPath(prev => {
        const updated = [...prev, newPoint]
        // Auto-generate smooth control points for curves
        return generateControlPoints(updated)
      })
      setIsDrawing(true)
    } else if (mode === 'edit') {
      // Select point for editing
      const clickedIndex = findNearestPoint(pos)
      setSelectedPoint(clickedIndex)
    }
  }, [isActive, mode, snapPoint, generateControlPoints])

  // Find nearest point to clicked position
  const findNearestPoint = useCallback((clickPos: Point): number | null => {
    if (currentPath.length === 0) return null

    const threshold = 10
    let nearestIndex = -1
    let minDistance = Infinity

    currentPath.forEach((bezierPoint, index) => {
      const distance = Math.sqrt(
        Math.pow(clickPos.x - bezierPoint.point.x, 2) +
        Math.pow(clickPos.y - bezierPoint.point.y, 2)
      )

      if (distance < threshold && distance < minDistance) {
        minDistance = distance
        nearestIndex = index
      }
    })

    return nearestIndex >= 0 ? nearestIndex : null
  }, [currentPath])

  // Handle mouse move - update preview or drag control points
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = snapPoint(transform.point(pointer))

    if (draggedPoint && mode === 'edit') {
      // Drag control points or anchors
      setCurrentPath(prev => {
        const updated = [...prev]
        const point = updated[draggedPoint.pointIndex]

        if (draggedPoint.controlType === 'anchor') {
          point.point = pos
        } else if (draggedPoint.controlType === 'control1') {
          point.controlPoint1 = pos
        } else if (draggedPoint.controlType === 'control2') {
          point.controlPoint2 = pos
        }

        return updated
      })
    } else if (mode === 'create' && !isDrawing) {
      setPreviewPoint(pos)
    }
  }, [isActive, mode, isDrawing, draggedPoint, snapPoint])

  // Handle mouse up - stop dragging
  const handleMouseUp = useCallback(() => {
    if (draggedPoint) {
      setDraggedPoint(null)
    }
    setIsDrawing(false)
  }, [draggedPoint])

  // Handle double click - complete path or add control point
  const handleDoubleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || mode !== 'create') return

    e.cancelBubble = true

    if (currentPath.length >= 2) {
      // Complete the path and create shape object
      // const pathData = pathToSVG(currentPath) // unused for now
      const linePoints = bezierToPoints(currentPath)

      const shapeObject: Shape = {
        id: crypto.randomUUID(),
        type: 'shape',
        shapeType: 'line', // Use 'line' for path-based shapes
        position: { x: 0, y: 0 }, // Path coordinates are absolute
        points: linePoints,
        fill: fillColor,
        fillColor,
        stroke: strokeColor,
        strokeColor,
        strokeWidth,
        opacity: 1,
        layer: 30, // Default to objects layer
        rotation: 0,
        visible: true,
        locked: false
      }

      addObject(shapeObject)
      onPathComplete?.(currentPath)

      // Reset for next path
      setCurrentPath([])
      setIsDrawing(false)
      setPreviewPoint(null)
    }
  }, [isActive, mode, currentPath, pathToSVG, bezierToPoints, fillColor, strokeColor, strokeWidth, addObject, onPathComplete])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case 'Escape':
          if (currentPath.length > 0) {
            setCurrentPath([])
            setIsDrawing(false)
            setPreviewPoint(null)
          } else {
            onCancel?.()
          }
          break
        case 'Enter':
          if (currentPath.length >= 2) {
            handleDoubleClick({} as any)
          }
          break
        case 'e':
          setMode(mode === 'create' ? 'edit' : 'create')
          break
        case 'Delete':
        case 'Backspace':
          if (selectedPoint !== null && mode === 'edit') {
            setCurrentPath(prev => prev.filter((_, index) => index !== selectedPoint))
            setSelectedPoint(null)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, currentPath, selectedPoint, mode, onCancel, handleDoubleClick])

  if (!isActive) return null

  const pathPoints = bezierToPoints(currentPath)

  return (
    <Group
      ref={groupRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDblClick={handleDoubleClick}
    >
      {/* Current path */}
      {pathPoints.length > 0 && (
        <Line
          points={pathPoints}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill={fillColor}
          tension={0.1}
          listening={false}
        />
      )}

      {/* Preview line to next point */}
      {previewPoint && currentPath.length > 0 && mode === 'create' && (
        <Line
          points={[
            currentPath[currentPath.length - 1].point.x,
            currentPath[currentPath.length - 1].point.y,
            previewPoint.x,
            previewPoint.y
          ]}
          stroke={strokeColor}
          strokeWidth={1}
          dash={[4, 4]}
          opacity={0.6}
          listening={false}
        />
      )}

      {/* Anchor points */}
      {currentPath.map((bezierPoint, index) => (
        <Group key={index}>
          {/* Anchor point */}
          <Circle
            x={bezierPoint.point.x}
            y={bezierPoint.point.y}
            radius={6}
            fill={selectedPoint === index ? '#FF6B6B' : '#C9AD6A'}
            stroke="#1a1a1a"
            strokeWidth={2}
            onClick={() => setSelectedPoint(index)}
            onMouseDown={(e) => {
              if (mode === 'edit') {
                e.cancelBubble = true
                setDraggedPoint({
                  pointIndex: index,
                  controlType: 'anchor'
                })
              }
            }}
            draggable={mode === 'edit'}
          />

          {/* Control points */}
          {bezierPoint.controlPoint1 && (
            <>
              <Line
                points={[
                  bezierPoint.point.x, bezierPoint.point.y,
                  bezierPoint.controlPoint1.x, bezierPoint.controlPoint1.y
                ]}
                stroke="#60A5FA"
                strokeWidth={1}
                dash={[2, 2]}
                listening={false}
              />
              <Circle
                x={bezierPoint.controlPoint1.x}
                y={bezierPoint.controlPoint1.y}
                radius={4}
                fill="#60A5FA"
                stroke="#1a1a1a"
                strokeWidth={1}
                onMouseDown={(e) => {
                  if (mode === 'edit') {
                    e.cancelBubble = true
                    setDraggedPoint({
                      pointIndex: index,
                      controlType: 'control1'
                    })
                  }
                }}
                draggable={mode === 'edit'}
              />
            </>
          )}

          {bezierPoint.controlPoint2 && (
            <>
              <Line
                points={[
                  bezierPoint.point.x, bezierPoint.point.y,
                  bezierPoint.controlPoint2.x, bezierPoint.controlPoint2.y
                ]}
                stroke="#60A5FA"
                strokeWidth={1}
                dash={[2, 2]}
                listening={false}
              />
              <Circle
                x={bezierPoint.controlPoint2.x}
                y={bezierPoint.controlPoint2.y}
                radius={4}
                fill="#60A5FA"
                stroke="#1a1a1a"
                strokeWidth={1}
                onMouseDown={(e) => {
                  if (mode === 'edit') {
                    e.cancelBubble = true
                    setDraggedPoint({
                      pointIndex: index,
                      controlType: 'control2'
                    })
                  }
                }}
                draggable={mode === 'edit'}
              />
            </>
          )}
        </Group>
      ))}

      {/* Mode indicator */}
      <Group x={20} y={20}>
        <Circle
          radius={15}
          fill="rgba(0, 0, 0, 0.8)"
          stroke="#C9AD6A"
          strokeWidth={1}
        />
        <Circle
          radius={8}
          fill={mode === 'create' ? '#00FF88' : '#FFD700'}
        />
      </Group>
    </Group>
  )
}


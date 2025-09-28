import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Group, Line, Circle, Arrow } from 'react-konva'
import type Konva from 'konva'
import type { Point } from '@/types/geometry'
import { snapToGrid } from '@/utils/grid'

interface AdvancedLineToolProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  onLineComplete?: (line: {
    points: number[]
    hasArrowHead: boolean
    isMultiSegment: boolean
  }) => void
  onCancel?: () => void
}

export const AdvancedLineTool: React.FC<AdvancedLineToolProps> = ({
  isActive,
  gridSize,
  gridSnap,
  onLineComplete,
  onCancel
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [hasArrowHead, setHasArrowHead] = useState(false)

  // Handle keyboard modifiers for drawing modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      } else if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true)
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleComplete()
      } else if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'a' || e.key === 'A') {
        setHasArrowHead(prev => !prev)
      } else if (e.key === 'Backspace' && points.length > 0) {
        // Remove last point
        setPoints(prev => prev.slice(0, -1))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      } else if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isActive, points.length])

  const handleCancel = useCallback(() => {
    setIsDrawing(false)
    setPoints([])
    setCurrentPoint(null)
    setHasArrowHead(false)
    onCancel?.()
  }, [onCancel])

  const handleComplete = useCallback(() => {
    if (points.length < 2) {
      handleCancel()
      return
    }

    const flatPoints: number[] = []
    points.forEach(point => {
      flatPoints.push(point.x, point.y)
    })

    onLineComplete?.({
      points: flatPoints,
      hasArrowHead,
      isMultiSegment: points.length > 2
    })

    // Reset state
    setIsDrawing(false)
    setPoints([])
    setCurrentPoint(null)
    setHasArrowHead(false)
  }, [points, hasArrowHead, onLineComplete, handleCancel])

  const constrainPoint = useCallback((point: Point, previousPoint: Point | null): Point => {
    if (!isShiftPressed || !previousPoint) {
      return gridSnap ? snapToGrid(point, gridSize, true) : point
    }

    // Constrain to 45-degree angles
    const deltaX = point.x - previousPoint.x
    const deltaY = point.y - previousPoint.y
    const angle = Math.atan2(deltaY, deltaX)
    const constrainedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    const constrainedPoint = {
      x: previousPoint.x + Math.cos(constrainedAngle) * distance,
      y: previousPoint.y + Math.sin(constrainedAngle) * distance
    }

    return gridSnap ? snapToGrid(constrainedPoint, gridSize, true) : constrainedPoint
  }, [isShiftPressed, gridSnap, gridSize])

  const handleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    const lastPoint = points.length > 0 ? points[points.length - 1] : null
    const constrainedPos = constrainPoint(pos, lastPoint)

    if (!isDrawing) {
      // Start drawing
      setIsDrawing(true)
      setPoints([constrainedPos])
    } else if (isCtrlPressed) {
      // Finish line on Ctrl+Click
      setPoints(prev => [...prev, constrainedPos])
      handleComplete()
    } else {
      // Add point to continue line
      setPoints(prev => [...prev, constrainedPos])
    }
  }, [isActive, points, isDrawing, isCtrlPressed, constrainPoint, handleComplete])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    const lastPoint = points.length > 0 ? points[points.length - 1] : null
    const constrainedPos = constrainPoint(pos, lastPoint)

    setCurrentPoint(constrainedPos)
  }, [isActive, points, constrainPoint])

  const handleDoubleClick = useCallback(() => {
    if (isDrawing) {
      handleComplete()
    }
  }, [isDrawing, handleComplete])

  if (!isActive) {
    return null
  }

  // Create points array for rendering
  const renderPoints: number[] = []
  points.forEach(point => {
    renderPoints.push(point.x, point.y)
  })

  // Add current point for preview
  if (currentPoint && isDrawing) {
    renderPoints.push(currentPoint.x, currentPoint.y)
  }

  return (
    <Group
      ref={groupRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onDblClick={handleDoubleClick}
    >
      {/* Main line/polyline */}
      {renderPoints.length >= 4 && (
        <>
          {hasArrowHead ? (
            <Arrow
              points={renderPoints}
              stroke="#C9AD6A"
              strokeWidth={2}
              fill="#C9AD6A"
              pointerLength={10}
              pointerWidth={8}
              opacity={0.8}
              listening={false}
            />
          ) : (
            <Line
              points={renderPoints}
              stroke="#C9AD6A"
              strokeWidth={2}
              lineCap="round"
              lineJoin="round"
              opacity={0.8}
              listening={false}
            />
          )}
        </>
      )}

      {/* Preview line (from last point to cursor) */}
      {isDrawing && currentPoint && points.length > 0 && (
        <Line
          points={[
            points[points.length - 1].x,
            points[points.length - 1].y,
            currentPoint.x,
            currentPoint.y
          ]}
          stroke="#C9AD6A"
          strokeWidth={1}
          dash={[4, 4]}
          opacity={0.6}
          listening={false}
        />
      )}

      {/* Point indicators */}
      {points.map((point, index) => (
        <Circle
          key={index}
          x={point.x}
          y={point.y}
          radius={index === 0 ? 4 : 3}
          fill={index === 0 ? "#00FF00" : "#C9AD6A"}
          opacity={0.8}
          listening={false}
        />
      ))}

      {/* Current point indicator */}
      {currentPoint && isDrawing && (
        <Circle
          x={currentPoint.x}
          y={currentPoint.y}
          radius={2}
          fill="#FF0000"
          opacity={0.6}
          listening={false}
        />
      )}

      {/* Angle constraint indicator */}
      {isShiftPressed && isDrawing && currentPoint && points.length > 0 && (
        <Group x={points[points.length - 1].x} y={points[points.length - 1].y}>
          <Circle
            radius={20}
            stroke="#C9AD6A"
            strokeWidth={1}
            dash={[2, 2]}
            opacity={0.4}
            listening={false}
          />
        </Group>
      )}

      {/* Instructions */}
      {isDrawing && (
        <Group x={10} y={10}>
          <Circle
            radius={80}
            fill="rgba(0, 0, 0, 0.8)"
            cornerRadius={8}
          />
        </Group>
      )}
    </Group>
  )
}

export default AdvancedLineTool
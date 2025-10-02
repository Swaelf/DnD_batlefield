import { useRef, useEffect, useState, useCallback, type FC } from 'react'
import { Group, Rect, Circle } from 'react-konva'
import type Konva from 'konva'
import type { Point } from '@/types/geometry'
import { snapToGrid } from '@/utils/grid'

interface AdvancedRectangleToolProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  onRectangleComplete?: (rectangle: {
    x: number
    y: number
    width: number
    height: number
    cornerRadius: number
  }) => void
  onCancel?: () => void
}

export const AdvancedRectangleTool: FC<AdvancedRectangleToolProps> = ({
  isActive,
  gridSize,
  gridSnap,
  onRectangleComplete,
  onCancel
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isAltPressed, setIsAltPressed] = useState(false)

  // Handle keyboard modifiers for drawing modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      } else if (e.key === 'Alt') {
        setIsAltPressed(true)
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === 'Shift') {
        setIsShiftPressed(false)
      } else if (e.key === 'Alt') {
        setIsAltPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isActive])

  const handleCancel = useCallback(() => {
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setCornerRadius(0)
    onCancel?.()
  }, [onCancel])

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || e.target !== e.target.getStage()) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    const snappedPos = gridSnap ? snapToGrid(pos, gridSize, true) : pos

    setStartPoint(snappedPos)
    setCurrentPoint(snappedPos)
    setIsDrawing(true)
  }, [isActive, gridSnap, gridSize])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !isDrawing || !startPoint) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    let pos = transform.point(pointer)

    if (gridSnap) {
      pos = snapToGrid(pos, gridSize, true)
    }

    // Handle proportional scaling with Shift key
    if (isShiftPressed) {
      const deltaX = pos.x - startPoint.x
      const deltaY = pos.y - startPoint.y
      const size = Math.max(Math.abs(deltaX), Math.abs(deltaY))

      pos = {
        x: startPoint.x + (deltaX >= 0 ? size : -size),
        y: startPoint.y + (deltaY >= 0 ? size : -size)
      }
    }

    setCurrentPoint(pos)
  }, [isActive, isDrawing, startPoint, gridSnap, gridSize, isShiftPressed])

  const handleMouseUp = useCallback(() => {
    if (!isActive || !isDrawing || !startPoint || !currentPoint) return

    let x = Math.min(startPoint.x, currentPoint.x)
    let y = Math.min(startPoint.y, currentPoint.y)
    const width = Math.abs(currentPoint.x - startPoint.x)
    const height = Math.abs(currentPoint.y - startPoint.y)

    // Handle center-point drawing with Alt key
    if (isAltPressed) {
      x = startPoint.x - width / 2
      y = startPoint.y - height / 2
    }

    // Minimum size check
    if (width < 5 || height < 5) {
      handleCancel()
      return
    }

    onRectangleComplete?.({
      x,
      y,
      width,
      height,
      cornerRadius
    })

    // Reset state
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setCornerRadius(0)
  }, [isActive, isDrawing, startPoint, currentPoint, isAltPressed, cornerRadius, onRectangleComplete, handleCancel])

  const handleCornerRadiusChange = useCallback((delta: number) => {
    if (!isDrawing) return

    const maxRadius = startPoint && currentPoint
      ? Math.min(Math.abs(currentPoint.x - startPoint.x), Math.abs(currentPoint.y - startPoint.y)) / 2
      : 0

    setCornerRadius(prev => Math.max(0, Math.min(maxRadius, prev + delta)))
  }, [isDrawing, startPoint, currentPoint])

  // Handle wheel event for corner radius adjustment while drawing
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!isActive || !isDrawing) return

      e.preventDefault()
      const delta = e.deltaY > 0 ? -2 : 2
      handleCornerRadiusChange(delta)
    }

    if (isDrawing) {
      window.addEventListener('wheel', handleWheel, { passive: false })
    }

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isActive, isDrawing, handleCornerRadiusChange])

  if (!isActive || !isDrawing || !startPoint || !currentPoint) {
    return null
  }

  let x = Math.min(startPoint.x, currentPoint.x)
  let y = Math.min(startPoint.y, currentPoint.y)
  const width = Math.abs(currentPoint.x - startPoint.x)
  const height = Math.abs(currentPoint.y - startPoint.y)

  // Handle center-point drawing preview
  if (isAltPressed) {
    x = startPoint.x - width / 2
    y = startPoint.y - height / 2
  }

  return (
    <Group
      ref={groupRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Preview rectangle */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        cornerRadius={cornerRadius}
        fill="transparent"
        stroke="#C9AD6A"
        strokeWidth={2}
        dash={[8, 4]}
        opacity={0.8}
        listening={false}
      />

      {/* Corner radius indicators */}
      {cornerRadius > 0 && (
        <>
          <Circle
            x={x + cornerRadius}
            y={y + cornerRadius}
            radius={2}
            fill="#C9AD6A"
            listening={false}
          />
          <Circle
            x={x + width - cornerRadius}
            y={y + cornerRadius}
            radius={2}
            fill="#C9AD6A"
            listening={false}
          />
          <Circle
            x={x + width - cornerRadius}
            y={y + height - cornerRadius}
            radius={2}
            fill="#C9AD6A"
            listening={false}
          />
          <Circle
            x={x + cornerRadius}
            y={y + height - cornerRadius}
            radius={2}
            fill="#C9AD6A"
            listening={false}
          />
        </>
      )}

      {/* Drawing mode indicators */}
      {(isShiftPressed || isAltPressed) && (
        <Group x={x + width + 10} y={y}>
          {isShiftPressed && (
            <Rect
              width={60}
              height={20}
              fill="rgba(0, 0, 0, 0.7)"
              cornerRadius={4}
            />
          )}
          {isAltPressed && (
            <Rect
              y={isShiftPressed ? 25 : 0}
              width={60}
              height={20}
              fill="rgba(0, 0, 0, 0.7)"
              cornerRadius={4}
            />
          )}
        </Group>
      )}
    </Group>
  )
}


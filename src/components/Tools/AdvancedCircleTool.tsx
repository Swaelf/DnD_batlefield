import { useRef, useEffect, useState, useCallback, type FC } from 'react'
import { Group, Ellipse, Circle } from 'react-konva'
import type Konva from 'konva'
import type { Point } from '@/types/geometry'
import { snapToGrid } from '@/utils/grid'

interface AdvancedCircleToolProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  onCircleComplete?: (circle: {
    x: number
    y: number
    radiusX: number
    radiusY: number
    isEllipse: boolean
  }) => void
  onCancel?: () => void
}

export const AdvancedCircleTool: FC<AdvancedCircleToolProps> = ({
  isActive,
  gridSize,
  gridSnap,
  onCircleComplete,
  onCancel
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isAltPressed, setIsAltPressed] = useState(false)
  const [_isCtrlPressed, setIsCtrlPressed] = useState(false)

  // Handle keyboard modifiers for drawing modes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      } else if (e.key === 'Alt') {
        setIsAltPressed(true)
      } else if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true)
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
  }, [isActive])

  const handleCancel = useCallback(() => {
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
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

    const snappedPos = gridSnap ? snapToGrid(pos, gridSize) : pos

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
      pos = snapToGrid(pos, gridSize)
    }

    setCurrentPoint(pos)
  }, [isActive, isDrawing, startPoint, gridSnap, gridSize])

  const handleMouseUp = useCallback(() => {
    if (!isActive || !isDrawing || !startPoint || !currentPoint) return

    const deltaX = Math.abs(currentPoint.x - startPoint.x)
    const deltaY = Math.abs(currentPoint.y - startPoint.y)

    let radiusX: number
    let radiusY: number
    let centerX: number
    let centerY: number
    let isEllipse: boolean

    if (isShiftPressed) {
      // Perfect circle mode - use maximum radius
      const maxRadius = Math.max(deltaX, deltaY) / 2
      radiusX = maxRadius
      radiusY = maxRadius
      isEllipse = false

      if (isAltPressed) {
        // Center-point drawing
        centerX = startPoint.x
        centerY = startPoint.y
      } else {
        // Corner-to-corner drawing
        centerX = (startPoint.x + currentPoint.x) / 2
        centerY = (startPoint.y + currentPoint.y) / 2
      }
    } else {
      // Ellipse mode - independent radii
      radiusX = deltaX / 2
      radiusY = deltaY / 2
      isEllipse = radiusX !== radiusY

      if (isAltPressed) {
        // Center-point drawing
        centerX = startPoint.x
        centerY = startPoint.y
      } else {
        // Corner-to-corner drawing
        centerX = (startPoint.x + currentPoint.x) / 2
        centerY = (startPoint.y + currentPoint.y) / 2
      }
    }

    // Minimum size check
    if (radiusX < 5 || radiusY < 5) {
      handleCancel()
      return
    }

    onCircleComplete?.({
      x: centerX,
      y: centerY,
      radiusX,
      radiusY,
      isEllipse
    })

    // Reset state
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }, [isActive, isDrawing, startPoint, currentPoint, isShiftPressed, isAltPressed, onCircleComplete, handleCancel])

  if (!isActive || !isDrawing || !startPoint || !currentPoint) {
    return null
  }

  const deltaX = Math.abs(currentPoint.x - startPoint.x)
  const deltaY = Math.abs(currentPoint.y - startPoint.y)

  let radiusX: number
  let radiusY: number
  let centerX: number
  let centerY: number

  if (isShiftPressed) {
    // Perfect circle mode
    const maxRadius = Math.max(deltaX, deltaY) / 2
    radiusX = maxRadius
    radiusY = maxRadius

    if (isAltPressed) {
      centerX = startPoint.x
      centerY = startPoint.y
    } else {
      centerX = (startPoint.x + currentPoint.x) / 2
      centerY = (startPoint.y + currentPoint.y) / 2
    }
  } else {
    // Ellipse mode
    radiusX = deltaX / 2
    radiusY = deltaY / 2

    if (isAltPressed) {
      centerX = startPoint.x
      centerY = startPoint.y
    } else {
      centerX = (startPoint.x + currentPoint.x) / 2
      centerY = (startPoint.y + currentPoint.y) / 2
    }
  }

  return (
    <Group
      ref={groupRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Preview ellipse/circle */}
      <Ellipse
        x={centerX}
        y={centerY}
        radiusX={radiusX}
        radiusY={radiusY}
        fill="transparent"
        stroke="#C9AD6A"
        strokeWidth={2}
        dash={[8, 4]}
        opacity={0.8}
        listening={false}
      />

      {/* Center point indicator */}
      <Circle
        x={centerX}
        y={centerY}
        radius={3}
        fill="#C9AD6A"
        opacity={0.6}
        listening={false}
      />

      {/* Radius indicators */}
      <Circle
        x={centerX + radiusX}
        y={centerY}
        radius={2}
        fill="#C9AD6A"
        listening={false}
      />
      <Circle
        x={centerX}
        y={centerY + radiusY}
        radius={2}
        fill="#C9AD6A"
        listening={false}
      />

      {/* Drawing mode indicators */}
      {(isShiftPressed || isAltPressed) && (
        <Group x={centerX + radiusX + 10} y={centerY - 10}>
          {isShiftPressed && (
            <Group>
              <Circle
                radius={10}
                fill="rgba(0, 0, 0, 0.7)"
              />
              <Circle
                radius={6}
                fill="transparent"
                stroke="#C9AD6A"
                strokeWidth={1}
              />
            </Group>
          )}
          {isAltPressed && (
            <Group y={isShiftPressed ? 25 : 0}>
              <Circle
                radius={8}
                fill="rgba(0, 0, 0, 0.7)"
              />
              <Circle
                radius={2}
                fill="#C9AD6A"
              />
            </Group>
          )}
        </Group>
      )}

      {/* Size display */}
      <Group x={centerX} y={centerY - radiusY - 25}>
        <Circle
          radius={15}
          fill="rgba(0, 0, 0, 0.8)"
        />
      </Group>
    </Group>
  )
}


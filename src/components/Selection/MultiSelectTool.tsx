import { type FC, useCallback, useRef, useState, useEffect } from 'react'
import { Group, Rect, Line } from 'react-konva'
import type Konva from 'konva'
import useMapStore from '@store/mapStore'
import type { Point } from '@/types'
import type { SelectionMode } from './AdvancedSelectionManager'

interface MultiSelectToolProps {
  isActive: boolean
  selectionMode: SelectionMode
  onSelectionComplete?: (selectedIds: string[]) => void
}

export const MultiSelectTool: FC<MultiSelectToolProps> = ({
  isActive,
  selectionMode,
  onSelectionComplete
}) => {
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [lassoPoints, setLassoPoints] = useState<Point[]>([])

  const groupRef = useRef<Konva.Group>(null)
  const stageRef = useRef<Konva.Stage | null>(null)

  const { currentMap, selectMultiple } = useMapStore()

  // Get stage reference from parent
  useEffect(() => {
    if (groupRef.current) {
      stageRef.current = groupRef.current.getStage()
    }
  }, [])

  // Handle mouse down - start selection
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    setIsSelecting(true)
    setStartPoint(pos)
    setCurrentPoint(pos)

    if (selectionMode === 'lasso') {
      setLassoPoints([pos])
    }
  }, [isActive, selectionMode])

  // Handle mouse move - update selection area
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !isSelecting) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    setCurrentPoint(pos)

    if (selectionMode === 'lasso') {
      setLassoPoints(prev => [...prev, pos])
    }
  }, [isActive, isSelecting, selectionMode])

  // Handle mouse up - complete selection
  const handleMouseUp = useCallback(() => {
    if (!isActive || !isSelecting) return

    let selectedIds: string[] = []

    if (currentMap && startPoint && currentPoint) {
      switch (selectionMode) {
        case 'rectangle':
          selectedIds = getObjectsInRectangle(startPoint, currentPoint)
          break
        case 'lasso':
          if (lassoPoints.length > 2) {
            selectedIds = getObjectsInLasso(lassoPoints)
          }
          break
        case 'magic':
          selectedIds = getObjectsUsingMagicWand(startPoint)
          break
      }
    }

    // Apply selection
    if (selectedIds.length > 0) {
      selectMultiple(selectedIds)
      onSelectionComplete?.(selectedIds)
    }

    // Reset state
    setIsSelecting(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setLassoPoints([])
  }, [isActive, isSelecting, currentMap, startPoint, currentPoint, lassoPoints, selectionMode, selectMultiple, onSelectionComplete])

  // Get objects within rectangle selection
  const getObjectsInRectangle = useCallback((start: Point, end: Point): string[] => {
    if (!currentMap) return []

    const left = Math.min(start.x, end.x)
    const top = Math.min(start.y, end.y)
    const right = Math.max(start.x, end.x)
    const bottom = Math.max(start.y, end.y)

    return currentMap.objects
      .filter(obj => {
        const objLeft = obj.position.x
        const objTop = obj.position.y
        const objRight = obj.position.x + (obj.width || 50)
        const objBottom = obj.position.y + (obj.height || 50)

        // Check if object intersects with selection rectangle
        return !(objRight < left || objLeft > right || objBottom < top || objTop > bottom)
      })
      .map(obj => obj.id)
  }, [currentMap])

  // Get objects within lasso selection
  const getObjectsInLasso = useCallback((lasso: Point[]): string[] => {
    if (!currentMap || lasso.length < 3) return []

    return currentMap.objects
      .filter(obj => {
        const objCenter = {
          x: obj.position.x + (obj.width || 50) / 2,
          y: obj.position.y + (obj.height || 50) / 2
        }
        return isPointInPolygon(objCenter, lasso)
      })
      .map(obj => obj.id)
  }, [currentMap])

  // Get objects using magic wand (similar objects)
  const getObjectsUsingMagicWand = useCallback((point: Point): string[] => {
    if (!currentMap) return []

    // Find the clicked object
    const clickedObject = currentMap.objects.find(obj => {
      const objLeft = obj.position.x
      const objTop = obj.position.y
      const objRight = obj.position.x + (obj.width || 50)
      const objBottom = obj.position.y + (obj.height || 50)

      return point.x >= objLeft && point.x <= objRight &&
             point.y >= objTop && point.y <= objBottom
    })

    if (!clickedObject) return []

    // Select all objects of the same type
    return currentMap.objects
      .filter(obj => obj.type === clickedObject.type)
      .map(obj => obj.id)
  }, [currentMap])

  // Point in polygon test for lasso selection
  const isPointInPolygon = useCallback((point: Point, polygon: Point[]): boolean => {
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (((polygon[i].y > point.y) !== (polygon[j].y > point.y)) &&
          (point.x < (polygon[j].x - polygon[i].x) * (point.y - polygon[i].y) / (polygon[j].y - polygon[i].y) + polygon[i].x)) {
        inside = !inside
      }
    }
    return inside
  }, [])

  // Register global mouse events
  useEffect(() => {
    if (!isActive) return

    const handleGlobalMouseMove = (_e: MouseEvent) => {
      if (stageRef.current) {
        handleMouseMove({
          target: stageRef.current,
          currentTarget: stageRef.current
        } as Konva.KonvaEventObject<MouseEvent>)
      }
    }

    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }

    if (isSelecting) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isActive, isSelecting, handleMouseMove, handleMouseUp])

  if (!isActive || !isSelecting || !startPoint || !currentPoint) {
    return null
  }

  // Render selection visualization
  const renderSelection = () => {
    switch (selectionMode) {
      case 'rectangle':
        return (
          <Rect
            x={Math.min(startPoint.x, currentPoint.x)}
            y={Math.min(startPoint.y, currentPoint.y)}
            width={Math.abs(currentPoint.x - startPoint.x)}
            height={Math.abs(currentPoint.y - startPoint.y)}
            stroke="#C9AD6A"
            strokeWidth={2}
            dash={[5, 5]}
            fill="rgba(201, 173, 106, 0.1)"
          />
        )

      case 'lasso':
        if (lassoPoints.length < 2) return null

        const points = lassoPoints.reduce((acc, point) => {
          acc.push(point.x, point.y)
          return acc
        }, [] as number[])

        return (
          <Line
            points={points}
            stroke="#C9AD6A"
            strokeWidth={2}
            tension={0.3}
            closed={false}
            fill="rgba(201, 173, 106, 0.1)"
          />
        )

      case 'magic':
        // Magic wand shows a small circle at click point
        return (
          <Group>
            <Rect
              x={startPoint.x - 10}
              y={startPoint.y - 10}
              width={20}
              height={20}
              stroke="#C9AD6A"
              strokeWidth={2}
              fill="rgba(201, 173, 106, 0.2)"
            />
          </Group>
        )

      default:
        return null
    }
  }

  return (
    <Group
      ref={groupRef}
      onMouseDown={handleMouseDown}
      listening={isActive}
    >
      {renderSelection()}
    </Group>
  )
}

export default MultiSelectTool
/**
 * Advanced Selection Tool Component
 * Konva-based selection tool with multiple selection modes
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Group, Rect, Line, Circle } from 'react-konva'
import type Konva from 'konva'
import type { Point } from '@/types/geometry'
import type { MapObject, Shape } from '@/types/map'
import useMapStore from '@/store/mapStore'
import { snapToGrid } from '@/utils/grid'

export type SelectionMode = 'rectangle' | 'lasso' | 'magic-wand' | 'by-type' | 'by-layer'

export interface AdvancedSelectionToolProps {
  isActive: boolean
  gridSize: number
  gridSnap: boolean
  selectionMode: SelectionMode
  onSelectionChange?: (selectedIds: string[]) => void
  onCancel?: () => void
}

export const AdvancedSelectionTool: React.FC<AdvancedSelectionToolProps> = ({
  isActive,
  gridSize,
  gridSnap,
  selectionMode,
  onSelectionChange,
  onCancel
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [lassoPoints, setLassoPoints] = useState<Point[]>([])
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  const currentMap = useMapStore(state => state.currentMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const selectMultipleObjects = useMapStore(state => state.selectMultiple)

  // Handle keyboard modifiers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      } else if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true)
      } else if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        selectAll()
      } else if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        invertSelection()
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
  }, [isActive])

  const handleCancel = useCallback(() => {
    setIsSelecting(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setLassoPoints([])
    onCancel?.()
  }, [onCancel])

  // Select all objects
  const selectAll = useCallback(() => {
    if (!currentMap) return

    const allIds = currentMap.objects.map(obj => obj.id)
    selectMultipleObjects(allIds)
    onSelectionChange?.(allIds)
  }, [currentMap, selectMultipleObjects, onSelectionChange])

  // Invert current selection
  const invertSelection = useCallback(() => {
    if (!currentMap) return

    const allIds = currentMap.objects.map(obj => obj.id)
    const unselectedIds = allIds.filter(id => !selectedObjects.includes(id))
    selectMultipleObjects(unselectedIds)
    onSelectionChange?.(unselectedIds)
  }, [currentMap, selectedObjects, selectMultipleObjects, onSelectionChange])

  // Check if point is inside polygon (for lasso selection)
  const isPointInPolygon = useCallback((point: Point, polygon: Point[]): boolean => {
    if (polygon.length < 3) return false

    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y
      const xj = polygon[j].x, yj = polygon[j].y

      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    return inside
  }, [])

  // Get object center point for selection testing
  const getObjectCenter = useCallback((obj: MapObject): Point => {
    switch (obj.type) {
      case 'token':
        return obj.position
      case 'shape':
        const shapeObj = obj as Shape
        if (shapeObj.shapeType === 'rectangle') {
          return {
            x: shapeObj.position.x + (shapeObj.width || 0) / 2,
            y: shapeObj.position.y + (shapeObj.height || 0) / 2
          }
        } else if (shapeObj.shapeType === 'circle') {
          return shapeObj.position
        } else if (shapeObj.shapeType === 'line' && shapeObj.points) {
          const avgX = shapeObj.points.reduce((sum, _, i) => i % 2 === 0 ? sum + shapeObj.points![i] : sum, 0) / (shapeObj.points.length / 2)
          const avgY = shapeObj.points.reduce((sum, _, i) => i % 2 === 1 ? sum + shapeObj.points![i] : sum, 0) / (shapeObj.points.length / 2)
          return { x: avgX, y: avgY }
        }
        return shapeObj.position
      case 'text':
        return obj.position
      default:
        return obj.position
    }
  }, [])

  // Rectangle selection logic
  const getObjectsInRectangle = useCallback((rect: { x: number, y: number, width: number, height: number }): string[] => {
    if (!currentMap) return []

    return currentMap.objects
      .filter(obj => {
        const center = getObjectCenter(obj)
        return center.x >= rect.x &&
               center.x <= rect.x + rect.width &&
               center.y >= rect.y &&
               center.y <= rect.y + rect.height
      })
      .map(obj => obj.id)
  }, [currentMap, getObjectCenter])

  // Lasso selection logic
  const getObjectsInLasso = useCallback((lasso: Point[]): string[] => {
    if (!currentMap || lasso.length < 3) return []

    return currentMap.objects
      .filter(obj => {
        const center = getObjectCenter(obj)
        return isPointInPolygon(center, lasso)
      })
      .map(obj => obj.id)
  }, [currentMap, getObjectCenter, isPointInPolygon])

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
    setIsSelecting(true)

    if (selectionMode === 'lasso') {
      setLassoPoints([snappedPos])
    }
  }, [isActive, gridSnap, gridSize, selectionMode])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !isSelecting) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)
    const snappedPos = gridSnap ? snapToGrid(pos, gridSize) : pos

    setCurrentPoint(snappedPos)

    if (selectionMode === 'lasso') {
      setLassoPoints(prev => [...prev, snappedPos])
    }
  }, [isActive, isSelecting, gridSnap, gridSize, selectionMode])

  const handleMouseUp = useCallback(() => {
    if (!isActive || !isSelecting || !startPoint || !currentPoint) return

    let selectedIds: string[] = []

    switch (selectionMode) {
      case 'rectangle':
        const rect = {
          x: Math.min(startPoint.x, currentPoint.x),
          y: Math.min(startPoint.y, currentPoint.y),
          width: Math.abs(currentPoint.x - startPoint.x),
          height: Math.abs(currentPoint.y - startPoint.y)
        }
        selectedIds = getObjectsInRectangle(rect)
        break

      case 'lasso':
        if (lassoPoints.length > 2) {
          selectedIds = getObjectsInLasso(lassoPoints)
        }
        break
    }

    // Handle modifier keys for selection mode
    if (isShiftPressed) {
      // Add to selection
      const newSelection = [...new Set([...selectedObjects, ...selectedIds])]
      selectMultipleObjects(newSelection)
      onSelectionChange?.(newSelection)
    } else if (isCtrlPressed) {
      // Toggle selection
      const newSelection = selectedObjects.filter(id => !selectedIds.includes(id))
        .concat(selectedIds.filter(id => !selectedObjects.includes(id)))
      selectMultipleObjects(newSelection)
      onSelectionChange?.(newSelection)
    } else {
      // Replace selection
      selectMultipleObjects(selectedIds)
      onSelectionChange?.(selectedIds)
    }

    // Reset state
    setIsSelecting(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setLassoPoints([])
  }, [isActive, isSelecting, startPoint, currentPoint, selectionMode, lassoPoints, isShiftPressed, isCtrlPressed, selectedObjects, getObjectsInRectangle, getObjectsInLasso, selectMultipleObjects, onSelectionChange])

  if (!isActive || !isSelecting || !startPoint || !currentPoint) {
    return (
      <Group
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    )
  }

  return (
    <Group
      ref={groupRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Rectangle selection */}
      {selectionMode === 'rectangle' && (
        <Rect
          x={Math.min(startPoint.x, currentPoint.x)}
          y={Math.min(startPoint.y, currentPoint.y)}
          width={Math.abs(currentPoint.x - startPoint.x)}
          height={Math.abs(currentPoint.y - startPoint.y)}
          fill="rgba(201, 173, 106, 0.1)"
          stroke="var(--colors-dndGold)"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}

      {/* Lasso selection */}
      {selectionMode === 'lasso' && lassoPoints.length > 1 && (
        <Line
          points={lassoPoints.flatMap(p => [p.x, p.y])}
          stroke="var(--colors-dndGold)"
          strokeWidth={2}
          lineCap="round"
          lineJoin="round"
          closed={false}
          listening={false}
        />
      )}

      {/* Selection mode indicator */}
      <Group x={startPoint.x + 20} y={startPoint.y - 30}>
        <Circle
          radius={15}
          fill="rgba(0, 0, 0, 0.8)"
        />
        <Circle
          radius={10}
          fill="transparent"
          stroke="var(--colors-dndGold)"
          strokeWidth={1}
          dash={selectionMode === 'lasso' ? [2, 2] : undefined}
        />
      </Group>
    </Group>
  )
}

export default AdvancedSelectionTool
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Group, Rect, Circle, Line, Arc } from 'react-konva'
import type Konva from 'konva'
import type { Point } from '@/types/geometry'
import type { MapObject } from '@/types/map'

// Extended type for objects with points (polygons, paths, etc.)
type ShapeWithPoints = MapObject & {
  points?: number[]
}
import useMapStore from '@store/mapStore'
// import { snapToGrid } from '@/utils/grid' // TODO: Use when implementing grid snapping

type TransformMode = 'move' | 'resize' | 'rotate' | 'skew'
type HandleType = 'tl' | 'tr' | 'bl' | 'br' | 'tm' | 'bm' | 'ml' | 'mr' | 'rotate'

interface TransformControlsProps {
  isActive: boolean
  selectedIds: string[]
  gridSize: number
  gridSnap: boolean
  onTransformStart?: () => void
  onTransformEnd?: () => void
  onCancel?: () => void
}

export const TransformControls: React.FC<TransformControlsProps> = ({
  isActive,
  selectedIds,
  gridSize,
  gridSnap,
  onTransformStart,
  onTransformEnd,
  onCancel
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const [transformMode, setTransformMode] = useState<TransformMode>('move')
  const [isTransforming, setIsTransforming] = useState(false)
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  const currentMap = useMapStore(state => state.currentMap)
  const batchUpdatePosition = useMapStore(state => state.batchUpdatePosition)

  // Calculate bounding box of selected objects
  const getBoundingBox = useCallback((): { x: number, y: number, width: number, height: number, center: Point } | null => {
    if (!currentMap || selectedIds.length === 0) return null

    const objects = currentMap.objects.filter(obj => selectedIds.includes(obj.id))
    if (objects.length === 0) return null

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    objects.forEach(obj => {
      let objBounds = { x: obj.position.x, y: obj.position.y, width: 0, height: 0 }

      switch (obj.type) {
        case 'token':
          const tokenSize = (obj as any).size || 'medium'
          const sizeMap = { tiny: 25, small: 50, medium: 50, large: 100, huge: 150, gargantuan: 200 }
          const size = sizeMap[tokenSize as keyof typeof sizeMap] || 50
          objBounds = {
            x: obj.position.x - size/2,
            y: obj.position.y - size/2,
            width: size,
            height: size
          }
          break

        case 'shape':
          if (obj.shapeType === 'rectangle') {
            objBounds = {
              x: obj.position.x,
              y: obj.position.y,
              width: (obj as any).width || 0,
              height: (obj as any).height || 0
            }
          } else if (obj.shapeType === 'circle') {
            const radius = (obj as any).radius || 25
            objBounds = {
              x: obj.position.x - radius,
              y: obj.position.y - radius,
              width: radius * 2,
              height: radius * 2
            }
          } else {
            const shapeObj = obj as ShapeWithPoints
            if (shapeObj.points) {
              const points = shapeObj.points
              const xs = points.filter((_, i) => i % 2 === 0)
              const ys = points.filter((_, i) => i % 2 === 1)
              objBounds = {
                x: Math.min(...xs),
                y: Math.min(...ys),
                width: Math.max(...xs) - Math.min(...xs),
                height: Math.max(...ys) - Math.min(...ys)
              }
            }
          }
          break

        case 'text':
          const fontSize = (obj as any).fontSize || 16
          const textLength = ((obj as any).text || '').length
          objBounds = {
            x: obj.position.x,
            y: obj.position.y,
            width: textLength * fontSize * 0.6,
            height: fontSize * 1.2
          }
          break
      }

      minX = Math.min(minX, objBounds.x)
      minY = Math.min(minY, objBounds.y)
      maxX = Math.max(maxX, objBounds.x + objBounds.width)
      maxY = Math.max(maxY, objBounds.y + objBounds.height)
    })

    const width = maxX - minX
    const height = maxY - minY
    const center = { x: minX + width / 2, y: minY + height / 2 }

    return { x: minX, y: minY, width, height, center }
  }, [currentMap, selectedIds])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return

      if (e.key === 'Shift') {
        setIsShiftPressed(true)
      } else if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true)
      } else if (e.key === 'Escape') {
        handleCancel()
      } else if (e.key === 'm' || e.key === 'M') {
        setTransformMode('move')
      } else if (e.key === 'r' && !e.ctrlKey && !e.metaKey) {
        setTransformMode('resize')
      } else if (e.key === 't' && !e.ctrlKey && !e.metaKey) {
        setTransformMode('rotate')
      } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        setTransformMode('skew')
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
    setIsTransforming(false)
    setActiveHandle(null)
    setStartPoint(null)
    onCancel?.()
  }, [onCancel])

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>, handle?: HandleType) => {
    if (!isActive) return

    e.cancelBubble = true

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    setStartPoint(pos)
    setIsTransforming(true)
    setActiveHandle(handle || null)
    onTransformStart?.()
  }, [isActive, onTransformStart])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isActive || !isTransforming || !startPoint) return

    const stage = e.target.getStage()
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    const deltaX = pos.x - startPoint.x
    const deltaY = pos.y - startPoint.y

    // Handle different transform operations based on active handle
    switch (activeHandle) {
      case 'rotate':
        // Rotation logic would go here
        console.log('Rotating by', Math.atan2(deltaY, deltaX))
        break

      case 'tl':
      case 'tr':
      case 'bl':
      case 'br':
      case 'tm':
      case 'bm':
      case 'ml':
      case 'mr':
        // Resize logic would go here
        console.log('Resizing from handle', activeHandle, 'delta:', deltaX, deltaY)
        break

      default:
        // Move operation
        if (selectedIds.length > 0) {
          const snappedDelta = gridSnap ? {
            x: Math.round(deltaX / gridSize) * gridSize,
            y: Math.round(deltaY / gridSize) * gridSize
          } : { x: deltaX, y: deltaY }

          // Only update if there's actual movement
          if (snappedDelta.x !== 0 || snappedDelta.y !== 0) {
            batchUpdatePosition(selectedIds, snappedDelta)
            setStartPoint(pos)
          }
        }
        break
    }
  }, [isActive, isTransforming, startPoint, activeHandle, selectedIds, gridSnap, gridSize, batchUpdatePosition])

  const handleMouseUp = useCallback(() => {
    if (!isActive) return

    setIsTransforming(false)
    setActiveHandle(null)
    setStartPoint(null)
    onTransformEnd?.()
  }, [isActive, onTransformEnd])

  if (!isActive || selectedIds.length === 0) {
    return null
  }

  const boundingBox = getBoundingBox()
  if (!boundingBox) {
    return null
  }

  const { x, y, width, height, center } = boundingBox
  const handleSize = 8
  const rotateHandleDistance = 30

  return (
    <Group
      ref={groupRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Bounding box outline */}
      <Rect
        x={x - 2}
        y={y - 2}
        width={width + 4}
        height={height + 4}
        fill="transparent"
        stroke="#C9AD6A"
        strokeWidth={1}
        dash={[4, 4]}
        listening={false}
      />

      {/* Transform mode indicator - hidden for now */}
      {false && (
        <Group x={center.x} y={y - 40}>
          <Circle
            radius={15}
            fill="rgba(0, 0, 0, 0.8)"
            stroke="#C9AD6A"
            strokeWidth={1}
          />
          <Circle
            radius={8}
            fill={transformMode === 'move' ? '#00FF00' :
                  transformMode === 'resize' ? '#FFD700' :
                  transformMode === 'rotate' ? '#FF6B6B' : '#9B59B6'}
          />
        </Group>
      )}

      {/* Resize handles */}
      {(transformMode === 'resize' || transformMode === 'move') && (
        <>
          {/* Corner handles */}
          <Circle
            x={x}
            y={y}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'tl')}
          />
          <Circle
            x={x + width}
            y={y}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'tr')}
          />
          <Circle
            x={x}
            y={y + height}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'bl')}
          />
          <Circle
            x={x + width}
            y={y + height}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'br')}
          />

          {/* Edge handles */}
          <Circle
            x={x + width / 2}
            y={y}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'tm')}
          />
          <Circle
            x={x + width / 2}
            y={y + height}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'bm')}
          />
          <Circle
            x={x}
            y={y + height / 2}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'ml')}
          />
          <Circle
            x={x + width}
            y={y + height / 2}
            radius={handleSize}
            fill="#C9AD6A"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'mr')}
          />
        </>
      )}

      {/* Rotation handle */}
      {(transformMode === 'rotate' || transformMode === 'move') && (
        <>
          <Line
            points={[center.x, y, center.x, y - rotateHandleDistance]}
            stroke="#C9AD6A"
            strokeWidth={1}
            dash={[2, 2]}
            listening={false}
          />
          <Circle
            x={center.x}
            y={y - rotateHandleDistance}
            radius={handleSize}
            fill="#FF6B6B"
            stroke="#1a1a1a"
            strokeWidth={2}
            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
          />
          <Arc
            x={center.x}
            y={y - rotateHandleDistance}
            innerRadius={handleSize - 3}
            outerRadius={handleSize - 1}
            angle={270}
            rotation={45}
            fill="#FFFFFF"
            listening={false}
          />
        </>
      )}

      {/* Selection info - hidden for now */}
      {false && (
        <Group x={x + width + 10} y={y}>
          <Rect
            width={120}
            height={60}
            fill="rgba(0, 0, 0, 0.8)"
            cornerRadius={4}
            stroke="#C9AD6A"
            strokeWidth={1}
          />
        </Group>
      )}

      {/* Keyboard shortcuts hint - hidden for now */}
      {false && (isShiftPressed || isCtrlPressed) && (
        <Group x={center.x - 60} y={y + height + 20}>
          <Rect
            width={120}
            height={30}
            fill="rgba(0, 0, 0, 0.9)"
            cornerRadius={4}
            stroke="#C9AD6A"
            strokeWidth={1}
          />
        </Group>
      )}
    </Group>
  )
}

export default TransformControls
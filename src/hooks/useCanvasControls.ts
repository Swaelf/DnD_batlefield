import type { RefObject } from 'react';
import { useState, useCallback } from 'react'
import type Konva from 'konva'

type CanvasControls = {
  scale: number
  position: { x: number; y: number }
  isDragging: boolean
  handleWheel: (e: Konva.KonvaEventObject<WheelEvent>) => void
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseUp: () => void
  resetView: () => void
  zoomIn: () => void
  zoomOut: () => void
  centerView: () => void
}

const MIN_ZOOM = 0.1
const MAX_ZOOM = 3
const ZOOM_STEP = 1.1

export const useCanvasControls = (
  stageRef: RefObject<Konva.Stage | null>,
  viewportWidth: number,
  viewportHeight: number,
  mapWidth: number,
  mapHeight: number
): CanvasControls => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()

    const stage = stageRef.current
    if (!stage) return

    const oldScale = scale
    const pointer = stage.getPointerPosition()

    if (!pointer) return

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    // Calculate new scale
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = direction > 0 ? oldScale * ZOOM_STEP : oldScale / ZOOM_STEP

    // Limit zoom
    const limitedScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale))

    setScale(limitedScale)

    // Calculate new position to zoom to pointer
    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    }

    setPosition(newPos)
  }, [stageRef, scale, position])

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Middle mouse button or shift + left click for panning
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.shiftKey)) {
      e.evt.preventDefault()
      setIsDragging(true)

      const stage = stageRef.current
      if (stage) {
        const pointer = stage.getPointerPosition()
        if (pointer) {
          setDragStart({ x: pointer.x - position.x, y: pointer.y - position.y })
        }
        stage.container().style.cursor = 'grabbing'
      }
    }
  }, [stageRef, position])

  const handleMouseMove = useCallback((_e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDragging) return

    const stage = stageRef.current
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const newPos = {
      x: pointer.x - dragStart.x,
      y: pointer.y - dragStart.y,
    }

    setPosition(newPos)
  }, [stageRef, isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      const stage = stageRef.current
      if (stage) {
        stage.container().style.cursor = 'default'
      }
    }
  }, [stageRef, isDragging])

  const resetView = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const zoomIn = useCallback(() => {
    const newScale = Math.min(MAX_ZOOM, scale * ZOOM_STEP)
    const center = { x: viewportWidth / 2, y: viewportHeight / 2 }

    const mousePointTo = {
      x: (center.x - position.x) / scale,
      y: (center.y - position.y) / scale,
    }

    setScale(newScale)

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    }

    setPosition(newPos)
  }, [scale, position, viewportWidth, viewportHeight])

  const zoomOut = useCallback(() => {
    const newScale = Math.max(MIN_ZOOM, scale / ZOOM_STEP)
    const center = { x: viewportWidth / 2, y: viewportHeight / 2 }

    const mousePointTo = {
      x: (center.x - position.x) / scale,
      y: (center.y - position.y) / scale,
    }

    setScale(newScale)

    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    }

    setPosition(newPos)
  }, [scale, position, viewportWidth, viewportHeight])

  const centerView = useCallback(() => {
    const scaleX = viewportWidth / mapWidth
    const scaleY = viewportHeight / mapHeight
    const newScale = Math.min(scaleX, scaleY) * 0.9 // 90% to have some padding

    const centerX = (viewportWidth - mapWidth * newScale) / 2
    const centerY = (viewportHeight - mapHeight * newScale) / 2

    setScale(newScale)
    setPosition({ x: centerX, y: centerY })
  }, [viewportWidth, viewportHeight, mapWidth, mapHeight])

  return {
    scale,
    position,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    zoomIn,
    zoomOut,
    centerView,
  }
}
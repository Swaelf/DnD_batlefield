/**
 * Canvas Events Hook - Handles mouse, keyboard, and touch interactions
 * Provides a clean API for canvas event handling with proper coordinate transformation
 */

import { useCallback, useRef, useEffect } from 'react'
import type Konva from 'konva'
import type { Point } from '@/foundation/types'
import type { CanvasPointerEvent, CanvasWheelEvent, ViewportState } from '../types'
import { coordinateService } from '../services'
import { useEventEmitter } from '@/core/events'
import { EVENT_TYPES, createCanvasEvent } from '@/core/events'

export type CanvasEventHandlers = {
  onPointerDown?: (event: CanvasPointerEvent) => void
  onPointerMove?: (event: CanvasPointerEvent) => void
  onPointerUp?: (event: CanvasPointerEvent) => void
  onClick?: (event: CanvasPointerEvent) => void
  onDoubleClick?: (event: CanvasPointerEvent) => void
  onWheel?: (event: CanvasWheelEvent) => void
}

export type UseCanvasEventsOptions = {
  viewport: ViewportState
  handlers?: CanvasEventHandlers
}

export const useCanvasEvents = ({ viewport, handlers }: UseCanvasEventsOptions) => {
  const stageRef = useRef<Konva.Stage | null>(null)
  const { emitEvent } = useEventEmitter()

  // Convert Konva event to our canvas event format
  const convertKonvaEvent = useCallback((e: Konva.KonvaEventObject<MouseEvent | PointerEvent>): CanvasPointerEvent => {
    const stage = stageRef.current
    if (!stage) {
      throw new Error('Stage not available')
    }

    const pointerPos = stage.getPointerPosition() || { x: 0, y: 0 }
    const canvasPos = coordinateService.screenToCanvas(pointerPos, viewport)

    const button = e.evt.button === 0 ? 'left' : e.evt.button === 1 ? 'middle' : 'right'

    return {
      position: pointerPos,
      canvasPosition: canvasPos,
      button,
      modifiers: {
        shift: e.evt.shiftKey,
        ctrl: e.evt.ctrlKey || e.evt.metaKey,
        alt: e.evt.altKey
      }
    }
  }, [viewport])

  // Convert wheel event
  const convertWheelEvent = useCallback((e: Konva.KonvaEventObject<WheelEvent>): CanvasWheelEvent => {
    const stage = stageRef.current
    if (!stage) {
      throw new Error('Stage not available')
    }

    const pointerPos = stage.getPointerPosition() || { x: 0, y: 0 }

    return {
      position: pointerPos,
      delta: e.evt.deltaY,
      modifiers: {
        shift: e.evt.shiftKey,
        ctrl: e.evt.ctrlKey || e.evt.metaKey,
        alt: e.evt.altKey
      }
    }
  }, [])

  // Set up stage event handlers
  const setupStageEvents = useCallback((stage: Konva.Stage) => {
    stageRef.current = stage

    // Mouse/pointer events
    stage.on('pointerdown', (e) => {
      try {
        const canvasEvent = convertKonvaEvent(e)
        handlers?.onPointerDown?.(canvasEvent)
      } catch (error) {
        console.warn('Error handling pointer down:', error)
      }
    })

    stage.on('pointermove', (e) => {
      try {
        const canvasEvent = convertKonvaEvent(e)
        handlers?.onPointerMove?.(canvasEvent)
      } catch (error) {
        console.warn('Error handling pointer move:', error)
      }
    })

    stage.on('pointerup', (e) => {
      try {
        const canvasEvent = convertKonvaEvent(e)
        handlers?.onPointerUp?.(canvasEvent)
      } catch (error) {
        console.warn('Error handling pointer up:', error)
      }
    })

    stage.on('click', (e) => {
      try {
        const canvasEvent = convertKonvaEvent(e)
        handlers?.onClick?.(canvasEvent)

        // Emit domain event
        emitEvent(createCanvasEvent('CANVAS_CLICKED', {
          position: canvasEvent.position,
          canvasPosition: canvasEvent.canvasPosition,
          button: canvasEvent.button === 'left' ? 0 : canvasEvent.button === 'right' ? 2 : 1
        }))
      } catch (error) {
        console.warn('Error handling click:', error)
      }
    })

    stage.on('dblclick', (e) => {
      try {
        const canvasEvent = convertKonvaEvent(e)
        handlers?.onDoubleClick?.(canvasEvent)
      } catch (error) {
        console.warn('Error handling double click:', error)
      }
    })

    // Wheel events for zooming
    stage.on('wheel', (e) => {
      e.evt.preventDefault()

      try {
        const wheelEvent = convertWheelEvent(e)
        handlers?.onWheel?.(wheelEvent)

        // Default zoom behavior if no handler provided
        if (!handlers?.onWheel) {
          const scaleBy = 1.05
          const oldScale = stage.scaleX()
          const newScale = wheelEvent.delta > 0 ? oldScale * scaleBy : oldScale / scaleBy
          const clampedScale = Math.max(0.1, Math.min(5, newScale))

          stage.scale({ x: clampedScale, y: clampedScale })

          const mousePointTo = {
            x: (wheelEvent.position.x - stage.x()) / oldScale,
            y: (wheelEvent.position.y - stage.y()) / oldScale
          }

          const newPos = {
            x: wheelEvent.position.x - mousePointTo.x * clampedScale,
            y: wheelEvent.position.y - mousePointTo.y * clampedScale
          }

          stage.position(newPos)
          stage.batchDraw()

          // Emit domain event
          emitEvent(createCanvasEvent('CANVAS_ZOOMED', {
            scale: clampedScale,
            center: wheelEvent.position
          }))
        }
      } catch (error) {
        console.warn('Error handling wheel:', error)
      }
    })

    // Context menu prevention
    stage.on('contextmenu', (e) => {
      e.evt.preventDefault()
    })

  }, [convertKonvaEvent, convertWheelEvent, handlers, emitEvent])

  // Cleanup stage events
  const cleanupStageEvents = useCallback((stage: Konva.Stage) => {
    stage.off('pointerdown')
    stage.off('pointermove')
    stage.off('pointerup')
    stage.off('click')
    stage.off('dblclick')
    stage.off('wheel')
    stage.off('contextmenu')
    stageRef.current = null
  }, [])

  // Get current pointer position
  const getPointerPosition = useCallback((): Point | null => {
    const stage = stageRef.current
    return stage?.getPointerPosition() || null
  }, [])

  // Get canvas position from screen position
  const getCanvasPosition = useCallback((screenPosition: Point): Point | null => {
    if (!stageRef.current) {
      return null
    }
    return coordinateService.screenToCanvas(screenPosition, viewport)
  }, [viewport])

  return {
    setupStageEvents,
    cleanupStageEvents,
    getPointerPosition,
    getCanvasPosition,
    stageRef
  }
}
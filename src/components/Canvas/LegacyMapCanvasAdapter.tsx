/**
 * Legacy MapCanvas Adapter - Phase 9B Migration Component
 *
 * Provides seamless integration between legacy MapCanvas API and new atomic architecture.
 * Maintains 100% compatibility with existing MapCanvas usage while leveraging atomic benefits.
 *
 * Migration Strategy:
 * 1. Accept legacy MapCanvasProps interface
 * 2. Transform legacy props to atomic MapCanvas props
 * 3. Use atomic MapCanvas component internally
 * 4. Provide all legacy functionality with enhanced performance
 */

import React, { useCallback, useMemo, useState, useRef } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import Konva from 'konva'
// import { MapCanvas as AtomicMapCanvas } from '@/modules/canvas'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import { ObjectsLayer } from './ObjectsLayer'
import { useContextMenu } from '@hooks/useContextMenu'
import DrawingLayer from '../Tools/DrawingLayer'
import { AdvancedDrawingLayer } from '../Tools/AdvancedDrawingLayer'
import { EnhancedDrawingToolsManager } from '../Tools/EnhancedDrawingToolsManager'
import AdvancedSelectionManager from '../Selection/SelectionManager'
import { snapToGrid } from '@/utils/grid'
import type { Point } from '@/types/geometry'
// import type { ToolType, GridConfig } from '@/modules/canvas/types'

// Helper function to check if an object intersects with a rectangle
const objectIntersectsRect = (obj: any, rect: { x: number; y: number; width: number; height: number }): boolean => {
  // Get object bounds
  let objBounds: { x: number; y: number; width: number; height: number }

  switch (obj.type) {
    case 'token':
      const tokenSize = getTokenPixelSize(obj.size || 'medium', 50) // Assume 50px grid
      objBounds = {
        x: obj.position.x - tokenSize / 2,
        y: obj.position.y - tokenSize / 2,
        width: tokenSize,
        height: tokenSize
      }
      break
    case 'shape':
      switch (obj.shapeType) {
        case 'rectangle':
          objBounds = {
            x: obj.position.x,
            y: obj.position.y,
            width: obj.width || 0,
            height: obj.height || 0
          }
          break
        case 'circle':
          const radius = obj.radius || 0
          objBounds = {
            x: obj.position.x - radius,
            y: obj.position.y - radius,
            width: radius * 2,
            height: radius * 2
          }
          break
        case 'line':
        case 'polygon':
          // For lines and polygons, use bounding box
          if (obj.points && obj.points.length >= 2) {
            const xs = obj.points.filter((_: any, i: number) => i % 2 === 0)
            const ys = obj.points.filter((_: any, i: number) => i % 2 === 1)
            const minX = Math.min(...xs)
            const maxX = Math.max(...xs)
            const minY = Math.min(...ys)
            const maxY = Math.max(...ys)
            objBounds = {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY
            }
          } else {
            return false
          }
          break
        default:
          return false
      }
      break
    default:
      return false
  }

  // Check rectangle intersection
  return !(
    objBounds.x > rect.x + rect.width ||
    objBounds.x + objBounds.width < rect.x ||
    objBounds.y > rect.y + rect.height ||
    objBounds.y + objBounds.height < rect.y
  )
}

// Helper function to get token pixel size based on D&D size
const getTokenPixelSize = (size: string, gridSize: number): number => {
  switch (size) {
    case 'tiny': return gridSize * 0.5
    case 'small':
    case 'medium': return gridSize
    case 'large': return gridSize * 2
    case 'huge': return gridSize * 3
    case 'gargantuan': return gridSize * 4
    default: return gridSize
  }
}

// Legacy MapCanvasProps interface for backward compatibility
export interface LegacyMapCanvasProps {
  readonly width: number
  readonly height: number
  readonly stageRef?: React.MutableRefObject<Konva.Stage | null>
  readonly onMouseMove?: (position: { x: number; y: number }) => void
  readonly onZoomChange?: (zoom: number) => void
}

/**
 * Legacy MapCanvas Adapter Component
 *
 * Wraps the new atomic MapCanvas with legacy-compatible interface.
 * Provides seamless migration with zero breaking changes.
 */
export const MapCanvas: React.FC<LegacyMapCanvasProps> = React.memo(({
  width,
  height,
  stageRef,
  onMouseMove,
  onZoomChange
}) => {
  // Legacy store integration
  const currentMap = useMapStore(state => state.currentMap)
  const objects = useMapStore(state => state.currentMap?.objects) || []
  const currentTool = useToolStore(state => state.currentTool)
  const gridSettings = useMapStore(state => state.currentMap?.grid)

  // Event creation store integration for token picking
  const isPicking = useEventCreationStore(state => state.isPicking)
  const setSelectedToken = useEventCreationStore(state => state.setSelectedToken)
  const setPosition = useEventCreationStore(state => state.setPosition)
  const completePositionPicking = useEventCreationStore(state => state.completePositionPicking)

  // Selection rectangle state for drag-to-select
  const [selectionRect, setSelectionRect] = useState<{
    x: number
    y: number
    width: number
    height: number
    visible: boolean
  } | null>(null)
  const isSelectingRef = useRef(false)
  const selectionStartRef = useRef<Point | null>(null)
  const isDrawingRef = useRef(false)
  const drawingStartRef = useRef<Point | null>(null)
  const { handleContextMenu } = useContextMenu()

  // Handle canvas click for legacy object selection and tool actions
  const handleCanvasClick = useCallback((position: Point) => {
    const toolState = useToolStore.getState()
    const mapState = useMapStore.getState()

    // Handle event creation store position picking
    if (isPicking === 'from') {
      setPosition('from', position)
      completePositionPicking()
      return
    }
    if (isPicking === 'to') {
      setPosition('to', position)
      completePositionPicking()
      return
    }

    // Handle measurement tool
    if (currentTool === 'measure') {
      toolState.addMeasurementPoint(position)
      return
    }

    // Handle token placement
    if (currentTool === 'token' && toolState.tokenTemplate) {
      const tokenObject = {
        id: crypto.randomUUID(),
        type: 'token' as const,
        position: snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false),
        rotation: 0,
        layer: 5, // Default token layer
        ...toolState.tokenTemplate,
        locked: false,
        visible: true
      }
      mapState.addObject(tokenObject)
      return
    }

    // Handle static object placement
    if (currentTool === 'staticObject' && toolState.staticObjectTemplate) {
      const snappedPos = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      // Calculate position - for rectangles and polygons, offset to center at cursor
      let objectPosition = snappedPos
      if (toolState.staticObjectTemplate.shape === 'rectangle') {
        // Offset position so rectangle is centered at cursor (since Konva uses top-left for rectangles)
        objectPosition = {
          x: snappedPos.x - (toolState.staticObjectTemplate.width / 2),
          y: snappedPos.y - (toolState.staticObjectTemplate.height / 2)
        }
      } else if (toolState.staticObjectTemplate.shape === 'polygon' && toolState.staticObjectTemplate.points) {
        // For polygons, offset based on the bounding box
        objectPosition = {
          x: snappedPos.x - (toolState.staticObjectTemplate.width / 2),
          y: snappedPos.y - (toolState.staticObjectTemplate.height / 2)
        }
      }
      // Circles already use center position in Konva, so no offset needed

      const staticObject = {
        id: crypto.randomUUID(),
        type: 'shape' as const,
        shapeType: toolState.staticObjectTemplate.shape,
        position: objectPosition,
        rotation: 0,
        layer: 3,
        width: toolState.staticObjectTemplate.width,
        height: toolState.staticObjectTemplate.height,
        points: toolState.staticObjectTemplate.points || [],
        fill: toolState.staticObjectTemplate.fillColor,
        fillColor: toolState.staticObjectTemplate.fillColor,
        stroke: toolState.staticObjectTemplate.strokeColor,
        strokeColor: toolState.staticObjectTemplate.strokeColor,
        strokeWidth: toolState.staticObjectTemplate.strokeWidth,
        opacity: 1,
        visible: true,
        locked: false,
        metadata: toolState.staticObjectTemplate.metadata || { isStatic: true }
      }
      mapState.addObject(staticObject)
      return
    }

    // Handle text tool
    if (currentTool === 'text') {
      const textObject = {
        id: crypto.randomUUID(),
        type: 'text' as const,
        position: snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false),
        rotation: 0,
        layer: 6,
        text: 'Double-click to edit',
        fontSize: 16,
        fontFamily: 'Arial',
        color: '#FFFFFF',
        fill: '#FFFFFF',
        opacity: 1,
        visible: true,
        locked: false
      }
      mapState.addObject(textObject)
      return
    }

    // Legacy behavior: deselect all objects when clicking empty canvas (only for select tool)
    if (currentTool === 'select') {
      mapState.selectObject('')
    }
  }, [currentTool, gridSettings, isPicking, setPosition, completePositionPicking])

  // Handle stage click events
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()

    // For token and staticObject tools, handle clicks anywhere on the stage
    if (currentTool === 'token' || currentTool === 'staticObject') {
      if (stage) {
        const pointer = stage.getPointerPosition()
        if (pointer) {
          const transform = stage.getAbsoluteTransform().copy().invert()
          const pos = transform.point(pointer)
          handleCanvasClick(pos)
        }
      }
      return
    }

    // For other tools, only handle clicks on empty canvas
    if (e.target === stage) {
      const pointer = stage.getPointerPosition()
      if (pointer) {
        const transform = stage.getAbsoluteTransform().copy().invert()
        const pos = transform.point(pointer)
        handleCanvasClick(pos)
      }
    }
  }, [handleCanvasClick, currentTool])

  // Handle stage right-click events
  const handleStageRightClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target

    // Clear measurement points if measure tool is active
    if (currentTool === 'measure') {
      e.evt.preventDefault()
      e.evt.stopPropagation()
      const toolState = useToolStore.getState()
      toolState.clearMeasurementPoints()
      return
    }

    if (target === e.target.getStage()) {
      // Right-clicked on empty canvas
      e.evt.preventDefault()
      e.evt.stopPropagation()

      handleContextMenu(
        {
          clientX: e.evt.clientX,
          clientY: e.evt.clientY,
          preventDefault: () => e.evt.preventDefault(),
          stopPropagation: () => e.evt.stopPropagation()
        } as React.MouseEvent,
        'canvas'
      )
    }
  }, [handleContextMenu, currentTool])

  // Grid rendering function
  const renderGrid = () => {
    if (!gridSettings?.visible) return null

    const gridSize = gridSettings.size || 50
    const cols = Math.ceil(width / gridSize) + 1
    const rows = Math.ceil(height / gridSize) + 1
    const lines = []

    // Vertical lines
    for (let i = 0; i <= cols; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, height]}
          stroke={gridSettings.color || '#374151'}
          strokeWidth={1}
          opacity={0.6}
        />
      )
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          points={[0, i * gridSize, width, i * gridSize]}
          stroke={gridSettings.color || '#374151'}
          strokeWidth={1}
          opacity={0.6}
        />
      )
    }

    return lines
  }

  // Handle legacy mouse move callback
  const handleAtomicMouseMove = useCallback((position: Point) => {
    if (onMouseMove) {
      onMouseMove(position)
    }
  }, [onMouseMove])

  // Handle legacy zoom change callback
  const handleAtomicZoomChange = useCallback((zoom: number) => {
    if (onZoomChange) {
      onZoomChange(zoom)
    }
  }, [onZoomChange])

  // Handle object click for legacy object selection
  const handleObjectClick = useCallback((objectId: string, e?: Konva.KonvaEventObject<MouseEvent>) => {
    const mapState = useMapStore.getState()
    const { selectObject, selectMultiple, selectedObjects } = mapState

    // Handle event creation store token picking
    if (isPicking === 'token') {
      // Find the clicked object and check if it's a token
      const clickedObject = currentMap?.objects.find(obj => obj.id === objectId)
      if (clickedObject && clickedObject.type === 'token') {
        setSelectedToken(objectId)
        return // Exit early when picking token
      }
    }

    // Check for modifier keys
    const isCtrlPressed = e?.evt?.ctrlKey || e?.evt?.metaKey || false // Support both Ctrl and Cmd
    const isShiftPressed = e?.evt?.shiftKey || false

    if (isCtrlPressed) {
      // Ctrl+Click: Add/remove from selection
      const currentSelection = [...selectedObjects]
      const isAlreadySelected = currentSelection.includes(objectId)

      if (isAlreadySelected) {
        // Remove from selection
        const newSelection = currentSelection.filter(id => id !== objectId)
        if (newSelection.length === 0) {
          selectObject('') // Clear selection if empty
        } else {
          selectMultiple(newSelection)
        }
      } else {
        // Add to selection
        selectMultiple([...currentSelection, objectId])
      }
    } else if (isShiftPressed) {
      // Shift+Click: Range selection (for future implementation)
      // For now, just add to selection like Ctrl
      const currentSelection = [...selectedObjects]
      if (!currentSelection.includes(objectId)) {
        selectMultiple([...currentSelection, objectId])
      }
    } else {
      // Normal click: select single object
      selectObject(objectId)
    }
  }, [isPicking, currentMap, setSelectedToken])

  // Handle mouse down for selection rectangle and drawing tools
  const handleMouseDown = useCallback((position: Point) => {
    if (currentTool === 'select') {
      // Start selection rectangle
      isSelectingRef.current = true
      selectionStartRef.current = position
      setSelectionRect({
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        visible: true
      })
    } else if (['rectangle', 'circle', 'line'].includes(currentTool)) {
      // Start drawing shape
      isDrawingRef.current = true
      drawingStartRef.current = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      // Update drawing state in tool store
      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: true,
        startPoint: drawingStartRef.current,
        currentPoint: drawingStartRef.current,
        points: []
      })
    }
  }, [currentTool, gridSettings])

  // Handle mouse move for selection rectangle and drawing
  const handleMouseMoveWithSelection = useCallback((position: Point) => {
    // Call original mouse move handler
    handleAtomicMouseMove(position)

    // Update selection rectangle if selecting
    if (isSelectingRef.current && selectionStartRef.current && currentTool === 'select') {
      const startPos = selectionStartRef.current
      setSelectionRect({
        x: Math.min(startPos.x, position.x),
        y: Math.min(startPos.y, position.y),
        width: Math.abs(position.x - startPos.x),
        height: Math.abs(position.y - startPos.y),
        visible: true
      })
    }

    // Update drawing preview if drawing
    if (isDrawingRef.current && drawingStartRef.current && ['rectangle', 'circle', 'line'].includes(currentTool)) {
      const currentPoint = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      // Update drawing state in tool store for preview
      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: true,
        startPoint: drawingStartRef.current,
        currentPoint: currentPoint,
        points: []
      })
    }

    // Update measurement overlay for measure tool
    if (currentTool === 'measure') {
      const currentPoint = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      // Update drawing state to show current mouse position
      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: currentPoint,
        points: []
      })
    }

    // Update current point for token and object preview
    if ((currentTool === 'token' || currentTool === 'staticObject') && !isDrawingRef.current) {
      const currentPoint = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: currentPoint,
        points: []
      })
    }
  }, [handleAtomicMouseMove, currentTool, gridSettings])

  // Handle mouse up for selection rectangle and drawing completion
  const handleMouseUp = useCallback(() => {
    if (isSelectingRef.current && selectionRect && currentTool === 'select') {
      // Find objects that intersect with selection rectangle
      const selectedObjectIds: string[] = []
      if (currentMap?.objects) {
        for (const obj of currentMap.objects) {
          if (objectIntersectsRect(obj, selectionRect)) {
            selectedObjectIds.push(obj.id)
          }
        }
      }

      // Select the found objects
      const mapState = useMapStore.getState()
      const { selectMultiple } = mapState
      if (selectedObjectIds.length > 0) {
        selectMultiple(selectedObjectIds)
      } else {
        // If no objects found, clear selection
        const { selectObject } = mapState
        selectObject('')
      }

      // Reset selection state
      isSelectingRef.current = false
      selectionStartRef.current = null
      setSelectionRect(null)
    }

    // Handle drawing completion
    if (isDrawingRef.current && drawingStartRef.current && ['rectangle', 'circle', 'line'].includes(currentTool)) {
      const toolState = useToolStore.getState()
      const mapState = useMapStore.getState()
      const drawingState = toolState.drawingState

      if (drawingState.startPoint && drawingState.currentPoint) {
        const startPoint = drawingState.startPoint
        const endPoint = drawingState.currentPoint

        // Only create shape if there's meaningful size
        const minSize = 5
        const width = Math.abs(endPoint.x - startPoint.x)
        const height = Math.abs(endPoint.y - startPoint.y)
        const distance = Math.sqrt(width * width + height * height)

        if (distance >= minSize) {
          let shapeObject: any = {
            id: crypto.randomUUID(),
            type: 'shape' as const,
            position: {
              x: Math.min(startPoint.x, endPoint.x),
              y: Math.min(startPoint.y, endPoint.y)
            },
            rotation: 0,
            layer: 4,
            fill: toolState.fillColor,
            fillColor: toolState.fillColor,
            stroke: toolState.strokeColor,
            strokeColor: toolState.strokeColor,
            strokeWidth: toolState.strokeWidth,
            opacity: toolState.opacity,
            visible: true,
            locked: false
          }

          // Add tool-specific properties
          switch (currentTool) {
            case 'rectangle':
              shapeObject = {
                ...shapeObject,
                shapeType: 'rectangle',
                width: width,
                height: height
              }
              break
            case 'circle':
              const radius = distance / 2
              shapeObject = {
                ...shapeObject,
                shapeType: 'circle',
                position: {
                  x: (startPoint.x + endPoint.x) / 2,
                  y: (startPoint.y + endPoint.y) / 2
                },
                radius: radius
              }
              break
            case 'line':
              shapeObject = {
                ...shapeObject,
                shapeType: 'line',
                position: startPoint,
                points: [0, 0, endPoint.x - startPoint.x, endPoint.y - startPoint.y]
              }
              break
          }

          mapState.addObject(shapeObject)
        }
      }

      // Reset drawing state
      isDrawingRef.current = false
      drawingStartRef.current = null
      toolState.resetDrawingState()
    }
  }, [selectionRect, currentTool, currentMap])

  // Simple Stage implementation
  return (
    <Stage
      width={width}
      height={height}
      ref={stageRef}
      onClick={handleStageClick}
      onContextMenu={handleStageRightClick}
      onMouseDown={(e) => {
        const stage = e.target.getStage()
        if (stage) {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            const transform = stage.getAbsoluteTransform().copy().invert()
            const pos = transform.point(pointer)
            handleMouseDown(pos)
          }
        }
      }}
      onMouseUp={() => handleMouseUp()}
      onMouseMove={(e) => {
        const stage = e.target.getStage()
        if (stage) {
          const pointer = stage.getPointerPosition()
          if (pointer) {
            const transform = stage.getAbsoluteTransform().copy().invert()
            const pos = transform.point(pointer)
            handleMouseMoveWithSelection(pos)
          }
        }
      }}
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Grid Layer */}
      <Layer>
        {renderGrid()}
      </Layer>

      {/* Objects Layer */}
      <Layer>
        <ObjectsLayer
          onObjectClick={handleObjectClick}
        />
      </Layer>

      {/* Advanced Selection System - Phase 18 */}
      <Layer>
        <AdvancedSelectionManager
          isActive={true}
          gridSize={gridSettings?.size || 50}
        />
      </Layer>

      {/* Enhanced Drawing Tools Manager - Phase 17 */}
      <Layer>
        <EnhancedDrawingToolsManager
          stageRef={stageRef}
          gridSize={gridSettings?.size || 50}
        />
      </Layer>

      {/* Advanced Drawing Layer for enhanced tools */}
      <AdvancedDrawingLayer
        stageRef={stageRef}
        gridSize={gridSettings?.size || 50}
      />

      {/* Legacy Drawing Layer for basic tools */}
      <DrawingLayer
        stageRef={stageRef}
        gridSize={gridSettings?.size || 50}
      />
    </Stage>
  )
})

MapCanvas.displayName = 'LegacyMapCanvasAdapter'
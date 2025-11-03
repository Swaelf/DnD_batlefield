/**
 * MapCanvas - Consolidated Canvas Component
 *
 * Consolidates all LegacyMapCanvasAdapter functionality using optimized 3-layer architecture.
 * Implements Layer 1 (Grid), Layer 2 (Objects + Effects), Layer 3 (Selection + Drawing + Preview).
 */

import { useCallback, useState, useRef, useEffect, memo, type FC, type MouseEvent as ReactMouseEvent } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Stage, Layer, Group, Rect } from 'react-konva'
import type Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import { ObjectsLayer } from './ObjectsLayer'
import { StaticObjectsLayer } from './StaticObjectsLayer'
import { StaticEffectsLayer } from './StaticEffectsLayer'
import { BackgroundLayer } from './BackgroundLayer'
import { TerrainLayer } from './TerrainLayer'
import { InteractiveLayer } from './InteractiveLayer'
import { useContextMenu } from '@hooks/useContextMenu'
import { snapToGrid } from '@/utils/grid'
import { registerStage } from '@/utils/stageRegistry'
import { findTokenAtPosition, objectIntersectsRect } from './utils'
import type { Point } from '@/types/geometry'
import type { Token } from '@/types/token'
import type { MapCanvasProps } from './types'
import { TerrainDrawing } from '@/types'

export const MapCanvas: FC<MapCanvasProps> = memo(({
  width,
  height,
  stageRef,
  onMouseMove,
  onTransformChange,
  externalTransformVersion,
  gridVisible: _gridVisible,  // Reserved for future use
  isViewerMode: _isViewerMode,  // Reserved for future use
}) => {
  const currentMap = useMapStore(state => state.currentMap)
  const currentTool = useToolStore(state => state.currentTool)
  const gridSettings = useMapStore(state => state.currentMap?.grid)

  // Event creation store integration
  const isPicking = useEventCreationStore(state => state.isPicking)
  const isCreatingEvent = useEventCreationStore(state => state.isCreatingEvent)
  const setSelectedToken = useEventCreationStore(state => state.setSelectedToken)
  const setPosition = useEventCreationStore(state => state.setPosition)
  const completePositionPicking = useEventCreationStore(state => state.completePositionPicking)

  // Selection rectangle state
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

  // Terrain brush state
  const isDrawingTerrainRef = useRef(false)
  const terrainPointsRef = useRef<number[]>([])

  // Preview position state
  const [previewPosition, setPreviewPosition] = useState<Point | null>(null)
  const staticEffectTemplate = useToolStore(state => state.staticEffectTemplate)

  // Force grid re-render on stage transform
  const [stageTransform, forceUpdate] = useState(0)

  // Listen for external transform changes (from zoom buttons, navigation pad)
  useEffect(() => {
    if (externalTransformVersion !== undefined) {
      // External control changed the transform, update our local state
      forceUpdate(n => n + 1)
    }
  }, [externalTransformVersion])

  // Register stage for global access (environment token positioning)
  const handleStageRef = useCallback((node: any) => {
    if (stageRef) {
      stageRef.current = node
    }
    if (node) {
      registerStage(node)
    } else {
      registerStage(null)
    }
  }, [stageRef])

  // Drawing state from tool store
  const drawingState = useToolStore(state => state.drawingState)
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)
  const opacity = useToolStore(state => state.opacity)
  const terrainColor = useToolStore(state => state.terrainColor)
  const terrainOpacity = useToolStore(state => state.terrainOpacity)
  const terrainBrushSize = useToolStore(state => state.terrainBrushSize)
  const tokenTemplate = useToolStore(state => state.tokenTemplate)
  const measurementPoints = useToolStore(state => state.measurementPoints)
  const staticObjectTemplate = useToolStore(state => state.staticObjectTemplate)

  // Handle canvas click
  const handleCanvasClick = useCallback((position: Point) => {
    const toolState = useToolStore.getState()
    const mapState = useMapStore.getState()

    if (isPicking === 'token' || isPicking === 'targetToken') {
      return
    }

    if (isPicking === 'from') {
      const tokens = (mapState.currentMap?.objects || []).filter(obj => obj.type === 'token') as Token[]
      const tokenAtPosition = findTokenAtPosition(position, tokens, gridSettings?.size || 50)
      // Apply grid snapping if not clicking on a token
      const snappedPosition = tokenAtPosition
        ? tokenAtPosition.position
        : snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      setPosition('from', snappedPosition)
      completePositionPicking()
      return
    }
    if (isPicking === 'to') {
      const tokens = (mapState.currentMap?.objects || []).filter(obj => obj.type === 'token') as Token[]
      const tokenAtPosition = findTokenAtPosition(position, tokens, gridSettings?.size || 50)
      // Apply grid snapping if not clicking on a token
      const snappedPosition = tokenAtPosition
        ? tokenAtPosition.position
        : snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      setPosition('to', snappedPosition)
      completePositionPicking()
      return
    }

    if (currentTool === 'measure') {
      toolState.addMeasurementPoint(position)
      return
    }

    if (currentTool === 'token') {
      if (!toolState.tokenTemplate) {
        console.warn('Token tool active but no token template selected')
        return
      }

      const tokenObject = {
        id: uuidv4(),
        type: 'token' as const,
        position: snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false),
        rotation: 0,
        layer: 5,
        ...toolState.tokenTemplate,
        locked: false,
        visible: true
      }

      mapState.addObject(tokenObject)
      return
    }

    if (currentTool === 'staticObject' && toolState.staticObjectTemplate) {
      const snappedPos = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      const template = toolState.staticObjectTemplate

      // Ensure sizeProperties exists with defaults
      const sizeProps = template.sizeProperties || {}
      const width = sizeProps.width || 100
      const height = sizeProps.height || 60
      const radius = sizeProps.radius || 50

      let objectPosition = snappedPos
      if (template.type === 'rectangle' || template.type === 'polygon') {
        objectPosition = {
          x: snappedPos.x - width / 2,
          y: snappedPos.y - height / 2
        }
      }

      const staticObject = {
        id: uuidv4(),
        type: 'shape' as const,
        shapeType: template.type,
        position: objectPosition,
        rotation: template.rotation || 0,
        layer: 3,
        radius: template.type === 'circle' ? radius : undefined,
        width: template.type === 'rectangle' || template.type === 'polygon' ? width : undefined,
        height: template.type === 'rectangle' || template.type === 'polygon' ? height : undefined,
        fill: template.defaultColor,
        fillColor: template.defaultColor,
        stroke: template.defaultColor,
        strokeColor: template.defaultColor,
        strokeWidth: 2,
        opacity: template.defaultOpacity,
        visible: true,
        locked: false,
        metadata: { isStatic: true, templateId: template.id, templateName: template.name },
        abstractType: template.abstractType,
        variant: template.variant
      }
      mapState.addObject(staticObject)
      return
    }

    if (currentTool === 'staticEffect' && toolState.staticEffectTemplate) {
      const snappedPos = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      const template = toolState.staticEffectTemplate
      const sizeProps = template.sizeProperties || {}

      const staticEffectObject: any = {
        id: uuidv4(),
        type: 'shape' as const,
        position: snappedPos,
        rotation: template.rotation || 0,
        layer: 10,
        fillColor: template.defaultColor,
        fill: template.defaultColor,
        strokeColor: template.defaultColor,
        stroke: template.defaultColor,
        strokeWidth: 2,
        opacity: template.defaultOpacity,
        name: template.name,
        visible: true,
        locked: false,
        metadata: { isStaticEffect: true, effectType: template.type }
      }

      switch (template.type) {
        case 'circle':
          staticEffectObject.shapeType = 'circle'
          staticEffectObject.radius = sizeProps.radius || 50
          break
        case 'rectangle': {
          staticEffectObject.shapeType = 'rectangle'
          const width = sizeProps.width || 100
          const height = sizeProps.height || 60
          staticEffectObject.width = width
          staticEffectObject.height = height
          staticEffectObject.position = {
            x: snappedPos.x - (width / 2),
            y: snappedPos.y - (height / 2)
          }
          break
        }
        case 'cone': {
          staticEffectObject.shapeType = 'polygon'
          const length = sizeProps.length || 80
          const angle = (sizeProps.angle || 60) * Math.PI / 180
          const halfAngle = angle / 2
          staticEffectObject.points = [
            0, 0,
            length, -length * Math.tan(halfAngle),
            length, length * Math.tan(halfAngle)
          ]
          break
        }
        case 'line': {
          staticEffectObject.shapeType = 'line'
          const lineLength = sizeProps.length || 100
          staticEffectObject.points = [0, 0, lineLength, 0]
          staticEffectObject.strokeWidth = sizeProps.width || 10
          break
        }
      }

      mapState.addObject(staticEffectObject)
      return
    }

    if (currentTool === 'text') {
      const textObject = {
        id: uuidv4(),
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

    if (currentTool === 'select') {
      mapState.selectObject('')
    }
  }, [currentTool, gridSettings, isPicking, setPosition, completePositionPicking])

  // Handle stage click events
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const getValidPosition = () => {
      const pointer = stage.getPointerPosition()
      if (!pointer) return null

      const transform = stage.getAbsoluteTransform().copy().invert()
      const pos = transform.point(pointer)

      // Validate position to prevent NaN errors
      if (!pos || isNaN(pos.x) || isNaN(pos.y) || !isFinite(pos.x) || !isFinite(pos.y)) {
        console.warn('Invalid pointer position detected:', pos)
        return null
      }

      return pos
    }

    // Handle position picking modes
    if (isPicking === 'from' || isPicking === 'to') {
      const pos = getValidPosition()
      if (pos) handleCanvasClick(pos)
      return
    }

    // Block clicks when picking tokens
    if (isPicking === 'token' || isPicking === 'targetToken') {
      return
    }

    // For placement tools (token, staticObject, staticEffect), allow clicks anywhere
    // This ensures tokens can be placed even when clicking on existing objects
    if (currentTool === 'token' || currentTool === 'staticObject' || currentTool === 'staticEffect') {
      const pos = getValidPosition()
      if (pos) {
        handleCanvasClick(pos)
      }
      return
    }

    // For other tools, only handle clicks on empty canvas (stage itself)
    if (e.target === stage) {
      const pos = getValidPosition()
      if (pos) handleCanvasClick(pos)
    }
  }, [handleCanvasClick, currentTool, isPicking])

  // Handle stage right-click
  const handleStageRightClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target

    if (currentTool === 'measure') {
      e.evt.preventDefault()
      e.evt.stopPropagation()
      const toolState = useToolStore.getState()
      toolState.clearMeasurementPoints()
      return
    }

    if (target === e.target.getStage()) {
      e.evt.preventDefault()
      e.evt.stopPropagation()

      handleContextMenu(
        {
          clientX: e.evt.clientX,
          clientY: e.evt.clientY,
          preventDefault: () => e.evt.preventDefault(),
          stopPropagation: () => e.evt.stopPropagation()
        } as ReactMouseEvent,
        'canvas'
      )
    }
  }, [handleContextMenu, currentTool])

  // Grid rendering

  // Handle object click
  const handleObjectClick = useCallback((objectId: string, e?: Konva.KonvaEventObject<MouseEvent>) => {
    const mapState = useMapStore.getState()
    const { selectObject, selectMultiple, selectedObjects } = mapState

    if (isPicking === 'token') {
      const clickedObject = currentMap?.objects.find(obj => obj.id === objectId)
      if (clickedObject && clickedObject.type === 'token') {
        setSelectedToken(objectId)
        return
      }
    }

    if (isPicking === 'targetToken') {
      const clickedObject = currentMap?.objects.find(obj => obj.id === objectId)
      if (clickedObject && clickedObject.type === 'token') {
        setSelectedToken(objectId)
        return
      }
    }

    if (isPicking === 'from' || isPicking === 'to') {
      const clickedObject = currentMap?.objects.find(obj => obj.id === objectId)
      if (clickedObject && clickedObject.type === 'token') {
        setPosition(isPicking, clickedObject.position)
        completePositionPicking()
        return
      }
    }

    const isCtrlPressed = e?.evt?.ctrlKey || e?.evt?.metaKey || false
    const isShiftPressed = e?.evt?.shiftKey || false

    if (isCtrlPressed) {
      const currentSelection = [...selectedObjects]
      const isAlreadySelected = currentSelection.includes(objectId)

      if (isAlreadySelected) {
        const newSelection = currentSelection.filter(id => id !== objectId)
        if (newSelection.length === 0) {
          selectObject('')
        } else {
          selectMultiple(newSelection)
        }
      } else {
        selectMultiple([...currentSelection, objectId])
      }
    } else if (isShiftPressed) {
      const currentSelection = [...selectedObjects]
      if (!currentSelection.includes(objectId)) {
        selectMultiple([...currentSelection, objectId])
      }
    } else {
      selectObject(objectId)
    }
  }, [isPicking, currentMap, setSelectedToken])

  // Handle mouse down
  const handleMouseDown = useCallback((position: Point) => {
    if (currentTool === 'select') {
      isSelectingRef.current = true
      selectionStartRef.current = position
      setSelectionRect({
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        visible: true
      })
    } else if (currentTool === 'terrainBrush' || currentTool === 'terrainEraser') {
      // Start terrain brush/eraser stroke
      isDrawingTerrainRef.current = true
      terrainPointsRef.current = [position.x, position.y]
    } else if (['rectangle', 'circle', 'line', 'polygon'].includes(currentTool)) {
      // Start background shape drawing
      isDrawingRef.current = true
      drawingStartRef.current = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: true,
        startPoint: drawingStartRef.current,
        currentPoint: drawingStartRef.current,
        points: currentTool === 'polygon' ? [drawingStartRef.current] : []
      })
    }
  }, [currentTool, gridSettings, staticEffectTemplate])

  // Handle mouse move
  const handleMouseMoveWithSelection = useCallback((position: Point) => {
    if (onMouseMove) {
      onMouseMove(position)
    }

    if (currentTool === 'staticEffect' && staticEffectTemplate) {
      const snappedPos = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      setPreviewPosition(snappedPos)
    } else {
      setPreviewPosition(null)
    }

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

    // Background shape drawing: update drawing state
    if (isDrawingRef.current && drawingStartRef.current && ['rectangle', 'circle', 'line', 'polygon'].includes(currentTool)) {
      const currentPoint = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      const toolState = useToolStore.getState()
      const currentState = toolState.drawingState

      if (currentTool === 'polygon') {
        // For polygon, accumulate points on click
        toolState.setDrawingState({
          isDrawing: true,
          startPoint: drawingStartRef.current,
          currentPoint: currentPoint,
          points: currentState.points
        })
      } else {
        // For other shapes, update current point
        toolState.setDrawingState({
          isDrawing: true,
          startPoint: drawingStartRef.current,
          currentPoint: currentPoint,
          points: []
        })
      }
    }

    if (currentTool === 'measure') {
      const currentPoint = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: currentPoint,
        points: []
      })
    }

    // Terrain brush/eraser: collect points during drag
    if (isDrawingTerrainRef.current && (currentTool === 'terrainBrush' || currentTool === 'terrainEraser')) {
      terrainPointsRef.current.push(position.x, position.y)

      // Convert flat array to Point[] for preview rendering
      const previewPoints: Point[] = []
      for (let i = 0; i < terrainPointsRef.current.length; i += 2) {
        previewPoints.push({
          x: terrainPointsRef.current[i],
          y: terrainPointsRef.current[i + 1]
        })
      }

      // Update drawing state to show the path preview
      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: true,
        startPoint: null,
        currentPoint: position,
        points: previewPoints // Pass points for preview rendering
      })
    }

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

    // Update brush/eraser preview position
    if ((currentTool === 'terrainBrush' || currentTool === 'terrainEraser') && !isDrawingTerrainRef.current) {
      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: position,
        points: []
      })
    }
  }, [onMouseMove, currentTool, gridSettings])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isSelectingRef.current && selectionRect && currentTool === 'select') {
      const selectedObjectIds: string[] = []
      if (currentMap?.objects) {
        for (const obj of currentMap.objects) {
          if (objectIntersectsRect(obj, selectionRect, gridSettings?.size || 50)) {
            selectedObjectIds.push(obj.id)
          }
        }
      }

      const mapState = useMapStore.getState()
      const { selectMultiple } = mapState
      if (selectedObjectIds.length > 0) {
        selectMultiple(selectedObjectIds)
      } else {
        const { selectObject } = mapState
        selectObject('')
      }

      isSelectingRef.current = false
      selectionStartRef.current = null
      setSelectionRect(null)
    }

    // Terrain brush/eraser: create TerrainDrawing on mouse up
    if (isDrawingTerrainRef.current && (currentTool === 'terrainBrush' || currentTool === 'terrainEraser')) {
      const toolState = useToolStore.getState()
      const mapState = useMapStore.getState()

      // Only create drawing if we have enough points (at least 2 points = 4 values)
      if (terrainPointsRef.current.length >= 4) {
        const drawingType: 'erase' | 'brush' = currentTool === 'terrainEraser' ? 'erase' : 'brush'
        const terrainDrawing = {
          id: uuidv4(),
          type: drawingType,
          points: [...terrainPointsRef.current],
          color: toolState.terrainColor,
          strokeWidth: toolState.terrainBrushSize,
          opacity: toolState.terrainOpacity,
          timestamp: Date.now()
        }

        mapState.addTerrainDrawing(terrainDrawing as unknown as TerrainDrawing)
      }

      // Reset terrain drawing state
      isDrawingTerrainRef.current = false
      terrainPointsRef.current = []

      // Clear drawing state to hide preview
      toolState.resetDrawingState()
    }

    // Background shape drawing: create TerrainDrawing on mouse up
    if (isDrawingRef.current && drawingStartRef.current && ['rectangle', 'circle', 'line', 'polygon'].includes(currentTool)) {
      const toolState = useToolStore.getState()
      const mapState = useMapStore.getState()
      const drawingState = toolState.drawingState

      if (drawingState.startPoint && drawingState.currentPoint) {
        const startPoint = drawingState.startPoint
        const endPoint = drawingState.currentPoint

        const minSize = 5
        const width = Math.abs(endPoint.x - startPoint.x)
        const height = Math.abs(endPoint.y - startPoint.y)
        const distance = Math.sqrt(width * width + height * height)

        if (distance >= minSize || currentTool === 'polygon') {
          const terrainDrawing: TerrainDrawing = {
            id: uuidv4(),
            type: currentTool,
            color: toolState.terrainColor,
            strokeWidth: 3,
            opacity: toolState.terrainOpacity,
            timestamp: Date.now(),
            position: { x: 0, y: 0 },
            width: 0,
            height: 0,
            radius: 0,
            points: [0, 0, 0, 0]
          }

          switch (currentTool) {
            case 'rectangle':
              terrainDrawing.position = {
                x: Math.min(startPoint.x, endPoint.x),
                y: Math.min(startPoint.y, endPoint.y)
              }
              terrainDrawing.width = width
              terrainDrawing.height = height
              break
            case 'circle': {
              const radius = distance / 2
              terrainDrawing.position = {
                x: (startPoint.x + endPoint.x) / 2,
                y: (startPoint.y + endPoint.y) / 2
              }
              terrainDrawing.radius = radius
              break
            }
            case 'line':
              terrainDrawing.points = [
                startPoint.x,
                startPoint.y,
                endPoint.x,
                endPoint.y
              ]
              break
            case 'polygon':
              // For polygon, we would need click-to-add-point functionality
              // For now, treat it like a line
              terrainDrawing.points = [
                startPoint.x,
                startPoint.y,
                endPoint.x,
                endPoint.y
              ]
              break
          }

          mapState.addTerrainDrawing(terrainDrawing)
        }
      }

      isDrawingRef.current = false
      drawingStartRef.current = null
      toolState.resetDrawingState()
    }
  }, [selectionRect, currentTool, currentMap])

  // Determine cursor style based on mode
  const cursorStyle = isPicking ? 'crosshair' : 'default'

  return (
    <>
      <div style={{ cursor: cursorStyle, backgroundColor: '#1a1a1a', width, height }}>
        <Stage
          width={width}
          height={height}
          ref={handleStageRef}
          draggable={currentTool === 'pan'}
          onClick={handleStageClick}
          onContextMenu={handleStageRightClick}
          onDragEnd={() => {
            forceUpdate(n => n + 1)
            onTransformChange?.()
          }}
          onWheel={() => {
            forceUpdate(n => n + 1)
            onTransformChange?.()
          }}
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
        >
          {/* Layer 0: Field Color (Static background color) */}
          <Layer name="field" listening={false}>
            <Rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill={currentMap?.terrain?.fieldColor || '#1A1A1A'}
            />
          </Layer>

          {/* Layer 1: Terrain (Background drawings) */}
          <TerrainLayer
            terrain={currentMap?.terrain}
            width={width}
            height={height}
          />

          {/* Layer 2: Grid */}
          <BackgroundLayer
            gridSettings={gridSettings}
            stageRef={stageRef || { current: null }}
            width={width}
            height={height}
            updateTrigger={stageTransform}
          />

          {/* Layer 2.5: Static Objects (walls, trees, furniture) - 🚀 PERFORMANCE OPTIMIZATION */}
          {/* Separate layer prevents re-rendering when dynamic objects change */}
          {/* Expected gain: 22-50% FPS improvement with many static objects */}
          <StaticObjectsLayer />

          {/* Layer 2.6: Static Effects (persistent auras, zones, areas) - 🚀 PERFORMANCE OPTIMIZATION */}
          {/* Separate layer for static spell effects that don't animate */}
          {/* Expected gain: 20-40% FPS improvement when static effects are present */}
          <StaticEffectsLayer />

          {/* Layer 3: Content (Dynamic Objects: tokens, spells, animations) */}
          <Layer name="content">
            <Group name="objects">
              <ObjectsLayer
                onObjectClick={handleObjectClick}
              />
            </Group>
          </Layer>

          {/* Layer 4: Interactive (Selection + Drawing + Preview) */}
          <InteractiveLayer
            currentTool={currentTool}
            gridSettings={gridSettings}
            isCreatingEvent={isCreatingEvent}
            isSelecting={isSelectingRef.current}
            selectionRect={selectionRect}
            drawingState={drawingState}
            tokenTemplate={tokenTemplate}
            staticObjectTemplate={staticObjectTemplate}
            staticEffectTemplate={staticEffectTemplate}
            previewPosition={previewPosition}
            measurementPoints={measurementPoints}
            fillColor={fillColor}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            opacity={opacity}
            terrainColor={terrainColor}
            terrainOpacity={terrainOpacity}
            terrainBrushSize={terrainBrushSize}
          />
        </Stage>
      </div>

    </>
  )
})

MapCanvas.displayName = 'MapCanvas'

export default MapCanvas
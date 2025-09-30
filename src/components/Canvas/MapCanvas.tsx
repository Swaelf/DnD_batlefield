/**
 * MapCanvas - Consolidated Canvas Component
 *
 * Consolidates all LegacyMapCanvasAdapter functionality using optimized 3-layer architecture.
 * Implements Layer 1 (Grid), Layer 2 (Objects + Effects), Layer 3 (Selection + Drawing + Preview).
 */

import React, { useCallback, useState, useRef } from 'react'
import { Stage, Layer, Line, Group, Rect, Circle } from 'react-konva'
import type Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import { ObjectsLayer } from './ObjectsLayer'
import TokenHPTooltip from '../Token/TokenHPTooltip'
import { useContextMenu } from '@hooks/useContextMenu'
import AdvancedSelectionManager from '../Selection/SelectionManager'
import { StaticEffectPreview } from '../StaticEffect/StaticEffectPreview'
import { Token } from '../Token/Token'
import { MeasurementOverlay } from '../Tools/MeasurementOverlay'
import { snapToGrid } from '@/utils/grid'
import { registerStage } from '@/utils/stageRegistry'
import type { Point } from '@/types/geometry'
import type { Token as TokenType } from '@/types/token'

// Helper function to check if an object intersects with a rectangle
const objectIntersectsRect = (obj: any, rect: { x: number; y: number; width: number; height: number }): boolean => {
  let objBounds: { x: number; y: number; width: number; height: number }

  switch (obj.type) {
    case 'token': {
      const tokenSize = getTokenPixelSize(obj.size || 'medium', 50)
      objBounds = {
        x: obj.position.x - tokenSize / 2,
        y: obj.position.y - tokenSize / 2,
        width: tokenSize,
        height: tokenSize
      }
      break
    }
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
        case 'circle': {
          const radius = obj.radius || 0
          objBounds = {
            x: obj.position.x - radius,
            y: obj.position.y - radius,
            width: radius * 2,
            height: radius * 2
          }
          break
        }
        case 'line':
        case 'polygon':
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

// Helper function to find token at a specific position
const findTokenAtPosition = (position: Point, tokens: any[], gridSize: number): any | null => {
  for (const token of tokens) {
    if (token.type !== 'token') continue

    const tokenSize = getTokenPixelSize(token.size || 'medium', gridSize)
    const halfSize = tokenSize / 2

    const isWithinToken = (
      position.x >= token.position.x - halfSize &&
      position.x <= token.position.x + halfSize &&
      position.y >= token.position.y - halfSize &&
      position.y <= token.position.y + halfSize
    )

    if (isWithinToken) {
      return token
    }
  }
  return null
}

// Helper to check if tool is a drawing tool
const isDrawingTool = (tool: string): boolean => {
  return ['rectangle', 'circle', 'polygon', 'line', 'text', 'pen'].includes(tool)
}

export interface MapCanvasProps {
  readonly width: number
  readonly height: number
  readonly stageRef?: React.MutableRefObject<Konva.Stage | null>
  readonly onMouseMove?: (position: { x: number; y: number }) => void
  readonly onZoomChange?: (zoom: number) => void
}

export const MapCanvas: React.FC<MapCanvasProps> = React.memo(({
  width,
  height,
  stageRef,
  onMouseMove,
}) => {
  const currentMap = useMapStore(state => state.currentMap)
  const currentTool = useToolStore(state => state.currentTool)
  const gridSettings = useMapStore(state => state.currentMap?.grid)
  const updateObject = useMapStore(state => state.updateObject)

  // HP Tooltip state
  const [hpTooltip, setHpTooltip] = useState<{
    tokenId: string | null
    position: { x: number; y: number }
  }>({ tokenId: null, position: { x: 0, y: 0 } })

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

  // Preview position state
  const [previewPosition, setPreviewPosition] = useState<Point | null>(null)
  const staticEffectTemplate = useToolStore(state => state.staticEffectTemplate)

  // Force grid re-render on stage transform
  const [, forceUpdate] = useState(0)

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
      const tokenAtPosition = findTokenAtPosition(position, mapState.currentMap?.objects || [], gridSettings?.size || 50)
      // Apply grid snapping if not clicking on a token
      const snappedPosition = tokenAtPosition
        ? tokenAtPosition.position
        : snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      setPosition('from', snappedPosition)
      completePositionPicking()
      return
    }
    if (isPicking === 'to') {
      const tokenAtPosition = findTokenAtPosition(position, mapState.currentMap?.objects || [], gridSettings?.size || 50)
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
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
        locked: false
      }
      mapState.addObject(staticObject)
      return
    }

    if (currentTool === 'staticEffect' && toolState.staticEffectTemplate) {
      const snappedPos = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)
      const template = toolState.staticEffectTemplate
      const sizeProps = template.sizeProperties || {}

      const staticEffectObject: any = {
        id: crypto.randomUUID(),
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
        } as React.MouseEvent,
        'canvas'
      )
    }
  }, [handleContextMenu, currentTool])

  // Grid rendering
  const renderGrid = () => {
    if (!gridSettings?.visible) return null

    const gridSize = gridSettings.size || 50
    const stage = stageRef?.current

    // Get stage transform to calculate visible area
    const scale = stage?.scaleX() || 1
    const pos = stage?.position() || { x: 0, y: 0 }

    // Calculate the visible area in canvas coordinates
    const visibleLeft = -pos.x / scale
    const visibleTop = -pos.y / scale
    const visibleRight = visibleLeft + width / scale
    const visibleBottom = visibleTop + height / scale

    // Add padding to render grid beyond visible area
    const padding = gridSize * 5
    const startX = Math.floor((visibleLeft - padding) / gridSize) * gridSize
    const endX = Math.ceil((visibleRight + padding) / gridSize) * gridSize
    const startY = Math.floor((visibleTop - padding) / gridSize) * gridSize
    const endY = Math.ceil((visibleBottom + padding) / gridSize) * gridSize

    const lines = []

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, startY, x, endY]}
          stroke={gridSettings.color || '#374151'}
          strokeWidth={1 / scale}
          opacity={0.6}
          listening={false}
        />
      )
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[startX, y, endX, y]}
          stroke={gridSettings.color || '#374151'}
          strokeWidth={1 / scale}
          opacity={0.6}
          listening={false}
        />
      )
    }

    return lines
  }

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
    } else if (['rectangle', 'circle', 'line'].includes(currentTool)) {
      isDrawingRef.current = true
      drawingStartRef.current = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: true,
        startPoint: drawingStartRef.current,
        currentPoint: drawingStartRef.current,
        points: []
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

    if (isDrawingRef.current && drawingStartRef.current && ['rectangle', 'circle', 'line'].includes(currentTool)) {
      const currentPoint = snapToGrid(position, gridSettings?.size || 50, gridSettings?.snap || false)

      const toolState = useToolStore.getState()
      toolState.setDrawingState({
        isDrawing: true,
        startPoint: drawingStartRef.current,
        currentPoint: currentPoint,
        points: []
      })
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
  }, [onMouseMove, currentTool, gridSettings])

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isSelectingRef.current && selectionRect && currentTool === 'select') {
      const selectedObjectIds: string[] = []
      if (currentMap?.objects) {
        for (const obj of currentMap.objects) {
          if (objectIntersectsRect(obj, selectionRect)) {
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

    if (isDrawingRef.current && drawingStartRef.current && ['rectangle', 'circle', 'line'].includes(currentTool)) {
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

          switch (currentTool) {
            case 'rectangle':
              shapeObject = {
                ...shapeObject,
                shapeType: 'rectangle',
                width: width,
                height: height
              }
              break
            case 'circle': {
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
            }
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

      isDrawingRef.current = false
      drawingStartRef.current = null
      toolState.resetDrawingState()
    }
  }, [selectionRect, currentTool, currentMap])

  const selectedToken = hpTooltip.tokenId
    ? currentMap?.objects.find(o => o.id === hpTooltip.tokenId && o.type === 'token') as TokenType | undefined
    : undefined

  // Determine cursor style based on mode
  const cursorStyle = isPicking ? 'crosshair' : 'default'

  return (
    <>
      <div style={{ cursor: cursorStyle, backgroundColor: '#1a1a1a', width, height }}>
        <Stage
          width={width}
          height={height}
          ref={handleStageRef}
          onClick={handleStageClick}
          onContextMenu={handleStageRightClick}
          onDragEnd={() => forceUpdate(n => n + 1)}
          onWheel={() => forceUpdate(n => n + 1)}
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
        {/* Layer 1: Background (Static) */}
        <Layer name="background" listening={false}>
          <Group name="grid">
            {renderGrid()}
          </Group>
        </Layer>

        {/* Layer 2: Content (Objects + Effects) */}
        <Layer name="content">
          <Group name="objects">
            <ObjectsLayer
              onObjectClick={handleObjectClick}
              onTokenSelect={(tokenId, position) => {
                setHpTooltip({ tokenId, position })
              }}
              onTokenDeselect={() => {
                setHpTooltip({ tokenId: null, position: { x: 0, y: 0 } })
              }}
            />
          </Group>
        </Layer>

        {/* Layer 3: Interactive (Selection + Drawing + Preview) */}
        <Layer name="interactive">
          <Group name="selection" visible={currentTool === 'select' || isSelectingRef.current}>
            <AdvancedSelectionManager
              isActive={true}
              gridSize={gridSettings?.size || 50}
            />
          </Group>

          <Group name="drawing" visible={!isCreatingEvent && (isDrawingTool(currentTool) || currentTool === 'measure' || currentTool === 'token' || currentTool === 'staticObject')}>
            {/* Token preview - wrapped in non-listening Group to prevent click interception */}
            {/* Hide previews during event creation to avoid confusion */}
            {currentTool === 'token' && tokenTemplate && drawingState.currentPoint && !drawingState.isDrawing && !isCreatingEvent && (() => {
              const snappedPreviewPos = snapToGrid(drawingState.currentPoint, gridSettings?.size || 50, gridSettings?.snap || false)
              return (
                <Group listening={false}>
                  <Token
                    token={{
                      id: 'preview-token',
                      type: 'token',
                      position: snappedPreviewPos,
                      rotation: 0,
                      layer: 999,
                      locked: false,
                      ...tokenTemplate,
                      opacity: 0.6
                    }}
                    gridSize={gridSettings?.size || 50}
                    isSelected={false}
                    isDraggable={false}
                  />
                </Group>
              )
            })()}

            {/* Static object preview - use snapped position to match actual placement */}
            {currentTool === 'staticObject' && staticObjectTemplate && drawingState.currentPoint && !drawingState.isDrawing && !isCreatingEvent && (() => {
              const snappedPreviewPos = snapToGrid(drawingState.currentPoint, gridSettings?.size || 50, gridSettings?.snap || false)
              const sizeProps = staticObjectTemplate.sizeProperties || {}
              const width = sizeProps.width || 100
              const height = sizeProps.height || 60
              const radius = sizeProps.radius || 50

              return (
                <Group
                  x={snappedPreviewPos.x}
                  y={snappedPreviewPos.y}
                  rotation={staticObjectTemplate.rotation || 0}
                  opacity={staticObjectTemplate.defaultOpacity * 0.6}
                  listening={false}
                >
                  {staticObjectTemplate.type === 'rectangle' && (
                    <Rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      fill={staticObjectTemplate.defaultColor}
                      stroke={staticObjectTemplate.defaultColor}
                      strokeWidth={2}
                      shadowColor="black"
                      shadowBlur={6}
                      shadowOpacity={0.4}
                      shadowOffset={{ x: 3, y: 4 }}
                      listening={false}
                    />
                  )}
                  {staticObjectTemplate.type === 'circle' && (
                    <Circle
                      x={0}
                      y={0}
                      radius={radius}
                      fill={staticObjectTemplate.defaultColor}
                      stroke={staticObjectTemplate.defaultColor}
                      strokeWidth={2}
                      shadowColor="black"
                      shadowBlur={6}
                      shadowOpacity={0.4}
                      shadowOffset={{ x: 3, y: 4 }}
                      listening={false}
                    />
                  )}
                  {staticObjectTemplate.type === 'polygon' && (
                    <Rect
                      x={-width / 2}
                      y={-height / 2}
                      width={width}
                      height={height}
                      fill={staticObjectTemplate.defaultColor}
                      stroke={staticObjectTemplate.defaultColor}
                      strokeWidth={2}
                      lineCap="square"
                      lineJoin="miter"
                      shadowColor="black"
                      shadowBlur={6}
                      shadowOpacity={0.4}
                      shadowOffset={{ x: 3, y: 4 }}
                      listening={false}
                    />
                  )}
                </Group>
              )
            })()}

            {/* Drawing tool preview (rectangle, circle, line) */}
            {drawingState.isDrawing && drawingState.startPoint && drawingState.currentPoint && (
              <>
                {currentTool === 'rectangle' && (
                  <Rect
                    x={Math.min(drawingState.startPoint.x, drawingState.currentPoint.x)}
                    y={Math.min(drawingState.startPoint.y, drawingState.currentPoint.y)}
                    width={Math.abs(drawingState.currentPoint.x - drawingState.startPoint.x)}
                    height={Math.abs(drawingState.currentPoint.y - drawingState.startPoint.y)}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity * 0.7}
                    listening={false}
                  />
                )}
                {currentTool === 'circle' && (
                  <Circle
                    x={drawingState.startPoint.x}
                    y={drawingState.startPoint.y}
                    radius={Math.sqrt(
                      Math.pow(drawingState.currentPoint.x - drawingState.startPoint.x, 2) +
                      Math.pow(drawingState.currentPoint.y - drawingState.startPoint.y, 2)
                    )}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity * 0.7}
                    listening={false}
                  />
                )}
                {currentTool === 'line' && (
                  <Line
                    points={[
                      drawingState.startPoint.x,
                      drawingState.startPoint.y,
                      drawingState.currentPoint.x,
                      drawingState.currentPoint.y
                    ]}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    opacity={opacity * 0.7}
                    listening={false}
                  />
                )}
              </>
            )}

            {/* Selection rectangle preview */}
            {currentTool === 'select' && selectionRect && selectionRect.visible && (
              <Rect
                x={selectionRect.x}
                y={selectionRect.y}
                width={selectionRect.width}
                height={selectionRect.height}
                stroke="#3B82F6"
                strokeWidth={1}
                dash={[5, 5]}
                fill="rgba(59, 130, 246, 0.1)"
                listening={false}
              />
            )}

            {/* Measurement overlay */}
            {currentTool === 'measure' && (
              <MeasurementOverlay
                points={measurementPoints}
                currentPoint={drawingState.currentPoint || undefined}
                gridSize={gridSettings?.size || 50}
                showSegmentDistances={true}
                showTotalDistance={true}
              />
            )}
          </Group>

          <Group name="preview" visible={!!previewPosition && !!staticEffectTemplate && !isCreatingEvent}>
            {previewPosition && staticEffectTemplate && !isCreatingEvent && (
              <StaticEffectPreview
                template={staticEffectTemplate}
                position={previewPosition}
                visible={true}
              />
            )}
          </Group>
        </Layer>
        </Stage>
      </div>

      {selectedToken && hpTooltip.tokenId && (
        <TokenHPTooltip
          token={selectedToken}
          position={hpTooltip.position}
          onUpdate={(updates) => {
            updateObject(hpTooltip.tokenId!, updates)
          }}
          onClose={() => {
            setHpTooltip({ tokenId: null, position: { x: 0, y: 0 } })
          }}
        />
      )}
    </>
  )
})

MapCanvas.displayName = 'MapCanvas'

export default MapCanvas
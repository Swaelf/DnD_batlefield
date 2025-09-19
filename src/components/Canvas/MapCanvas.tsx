import React, { useEffect, useRef, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import { useCanvasControls } from '@hooks/useCanvasControls'
import { useTokenAnimation } from '@hooks/useTokenAnimation'
import { snapToGrid } from '@utils/grid'
import { Shape } from '@/types/map'
import GridLayer from './GridLayer'
import ObjectsLayer from './ObjectsLayer'
import DrawingLayer from '../Tools/DrawingLayer'
import MeasureTool from '../Tools/MeasureTool'
import PathPreview from './PathPreview'
import { GridControls } from './GridControls'

interface MapCanvasProps {
  width: number
  height: number
  stageRef?: React.MutableRefObject<Konva.Stage | null>
  onMouseMove?: (position: { x: number; y: number }) => void
  onZoomChange?: (zoom: number) => void
}

const MapCanvas: React.FC<MapCanvasProps> = ({ width, height, stageRef: externalStageRef, onMouseMove, onZoomChange }) => {
  const internalStageRef = useRef<Konva.Stage>(null)
  const stageRef = externalStageRef || internalStageRef
  const { currentMap, addObject, selectObject, updateObjectPosition } = useMapStore()
  const { currentTool, drawingState, setDrawingState, fillColor, strokeColor, strokeWidth, opacity, tokenTemplate, staticObjectTemplate, spellEffectTemplate } = useToolStore()
  const { isPicking, setPosition, completePositionPicking } = useEventCreationStore()
  // Initialize animation hook - this runs automatically on round changes
  useTokenAnimation(stageRef as React.MutableRefObject<Konva.Stage>)

  // This effect is not needed as the animation hook already listens to round changes
  // Remove to avoid duplicate execution

  const {
    scale: stageScale,
    position: stagePosition,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    zoomIn,
    zoomOut,
    centerView,
  } = useCanvasControls(
    stageRef,
    width,
    height,
    currentMap?.width || 1920,
    currentMap?.height || 1080
  )

  // Report zoom changes
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(stageScale)
    }
  }, [stageScale, onZoomChange])

  // Handle drawing interactions
  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Get position relative to the stage
    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    // Snap to grid if enabled
    const snappedPos = snapToGrid(pos, currentMap?.grid.size || 50, currentMap?.grid.snap || false)

    // Handle position picking for event creation
    if (isPicking === 'from' || isPicking === 'to') {
      setPosition(isPicking, snappedPos)
      completePositionPicking()
      return
    }
    // Token picking is handled by ObjectsLayer on click

    // Let pan tool handle its own events
    if (currentTool === 'pan' || e.evt.shiftKey || e.evt.button === 1) {
      handleMouseDown(e)
      // Set grabbing cursor
      const container = stageRef.current?.container()
      if (container) {
        container.style.cursor = 'grabbing'
      }
      return
    }

    // Handle different tools
    switch (currentTool) {
      case 'select':
        // Selection will be handled by clicking on objects
        break
      case 'rectangle':
      case 'circle':
      case 'measure':
        setDrawingState({
          isDrawing: true,
          startPoint: snappedPos,
          currentPoint: snappedPos
        })
        break
      case 'eraser':
        // Eraser will delete objects on click
        // This will be handled by the objects layer
        break
      case 'token':
        // Don't create new tokens if we're picking a token for event creation
        if (isPicking === 'token') {
          return
        }
        // Place token immediately using template if available
        if (tokenTemplate) {
          const token = {
            id: crypto.randomUUID(),
            type: 'token' as const,
            position: snappedPos,
            rotation: 0,
            layer: 1,
            size: tokenTemplate.size || 'medium',
            name: tokenTemplate.name || 'Token',
            color: tokenTemplate.color || fillColor,
            shape: tokenTemplate.shape || 'circle',
            showLabel: tokenTemplate.showLabel || true,
            labelPosition: tokenTemplate.labelPosition || 'bottom',
            opacity: tokenTemplate.opacity || 1,
            borderColor: tokenTemplate.borderColor || '#000000',
            borderWidth: tokenTemplate.borderWidth || 2,
            locked: false
          }
          addObject(token)
        } else {
          // Fallback if no template
          const token = {
            id: crypto.randomUUID(),
            type: 'token' as const,
            position: snappedPos,
            rotation: 0,
            layer: 1,
            size: 'medium' as const,
            name: 'Token',
            color: fillColor,
            shape: 'circle' as const,
            showLabel: true,
            labelPosition: 'bottom' as const,
            opacity: 1,
            borderColor: '#000000',
            borderWidth: 2,
            locked: false
          }
          addObject(token)
        }
        break
      case 'staticObject':
        // Place static object using template
        if (staticObjectTemplate) {
          const newObject: Shape = {
            id: crypto.randomUUID(),
            type: 'shape' as const,
            shapeType: staticObjectTemplate.shape,
            position: snappedPos,
            width: staticObjectTemplate.shape === 'rectangle' ? staticObjectTemplate.width : undefined,
            height: staticObjectTemplate.shape === 'rectangle' ? staticObjectTemplate.height : undefined,
            radius: staticObjectTemplate.shape === 'circle' ? staticObjectTemplate.width / 2 : undefined,
            points: staticObjectTemplate.points,
            rotation: 0,
            layer: 1,
            fillColor: staticObjectTemplate.fillColor,
            fill: staticObjectTemplate.fillColor,
            strokeColor: staticObjectTemplate.strokeColor,
            stroke: staticObjectTemplate.strokeColor,
            strokeWidth: staticObjectTemplate.strokeWidth,
            opacity: 1,
            name: staticObjectTemplate.name,
            locked: false
          } as Shape
          addObject(newObject)
        }
        break
      case 'spellEffect':
        // Place spell effect using template
        if (spellEffectTemplate) {
          let newObject: Partial<Shape> = {
            id: crypto.randomUUID(),
            type: 'shape' as const,
            position: snappedPos,
            rotation: 0,
            layer: 10, // Spell effects on top
            fillColor: spellEffectTemplate.color,
            fill: spellEffectTemplate.color,
            strokeColor: spellEffectTemplate.color,
            stroke: spellEffectTemplate.color,
            strokeWidth: 2,
            opacity: spellEffectTemplate.opacity,
            name: spellEffectTemplate.name,
            locked: false
          }

          // Configure based on shape
          switch (spellEffectTemplate.shape) {
            case 'sphere':
              newObject.shapeType = 'circle'
              newObject.radius = spellEffectTemplate.size.radius
              break
            case 'cone':
              // Cone will be rendered as a triangle/polygon
              const length = spellEffectTemplate.size.length || 75
              const angle = (spellEffectTemplate.size.angle || 60) * Math.PI / 180
              const halfAngle = angle / 2
              newObject.shapeType = 'polygon'
              newObject.points = [
                0, 0,
                length * Math.cos(-halfAngle), length * Math.sin(-halfAngle),
                length * Math.cos(halfAngle), length * Math.sin(halfAngle)
              ]
              break
            case 'cube':
              newObject.shapeType = 'rectangle'
              newObject.width = spellEffectTemplate.size.width
              newObject.height = spellEffectTemplate.size.height
              break
            case 'line':
              newObject.shapeType = 'rectangle'
              newObject.width = spellEffectTemplate.size.length
              newObject.height = spellEffectTemplate.size.width
              break
            case 'wall':
              newObject.shapeType = 'rectangle'
              newObject.width = spellEffectTemplate.size.length
              newObject.height = spellEffectTemplate.size.width
              break
          }

          addObject(newObject as Shape)
        }
        break
    }
  }, [currentTool, currentMap, handleMouseDown, setDrawingState, fillColor, addObject, tokenTemplate, staticObjectTemplate, spellEffectTemplate, isPicking, setPosition, completePositionPicking])

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Get mouse position and report it
    const stage = stageRef.current
    if (stage && onMouseMove) {
      const pointer = stage.getPointerPosition()
      if (pointer) {
        const transform = stage.getAbsoluteTransform().copy().invert()
        const pos = transform.point(pointer)
        onMouseMove(pos)
      }
    }

    // Handle pan dragging
    if (currentTool === 'pan' || e.evt.shiftKey || drawingState.isDrawing === false) {
      handleMouseMove(e)
      return
    }

    if (!drawingState.isDrawing || !drawingState.startPoint) return

    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)
    const snappedPos = snapToGrid(pos, currentMap?.grid.size || 50, currentMap?.grid.snap || false)

    setDrawingState({ currentPoint: snappedPos })
  }, [currentTool, drawingState, currentMap, handleMouseMove, setDrawingState])

  const handleStageMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    handleMouseUp()

    // Reset cursor after pan
    if (currentTool === 'pan' || e.evt.shiftKey) {
      const container = stageRef.current?.container()
      if (container) {
        container.style.cursor = currentTool === 'pan' ? 'grab' : 'default'
      }
    }

    if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.currentPoint) {
      return
    }

    const { startPoint, currentPoint } = drawingState

    // Handle measure tool separately (don't create an object)
    if (currentTool === 'measure') {
      // Just reset the drawing state for measure tool
      setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: null
      })
      return
    }

    // Create the shape object
    let newObject: Shape | null = null

    switch (currentTool) {
      case 'rectangle':
        newObject = {
          id: crypto.randomUUID(),
          type: 'shape',
          shapeType: 'rectangle',
          position: {
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y)
          },
          width: Math.abs(currentPoint.x - startPoint.x),
          height: Math.abs(currentPoint.y - startPoint.y),
          rotation: 0,
          layer: 1,
          fill: fillColor,
          fillColor,
          stroke: strokeColor,
          strokeColor,
          strokeWidth,
          opacity
        }
        break
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) +
          Math.pow(currentPoint.y - startPoint.y, 2)
        )
        newObject = {
          id: crypto.randomUUID(),
          type: 'shape',
          shapeType: 'circle',
          position: startPoint,
          radius,
          rotation: 0,
          layer: 1,
          fill: fillColor,
          fillColor,
          stroke: strokeColor,
          strokeColor,
          strokeWidth,
          opacity
        }
        break
    }

    if (newObject) {
      addObject(newObject)
    }

    // Reset drawing state
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null
    })
  }, [currentTool, drawingState, fillColor, strokeColor, strokeWidth, opacity, handleMouseUp, addObject, setDrawingState])

  // Add keyboard shortcut for reset
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '0' && e.ctrlKey) {
        e.preventDefault()
        resetView()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resetView])

  // Prevent context menu on right click
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const container = stage.container()
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    container.addEventListener('contextmenu', preventContextMenu)
    return () => container.removeEventListener('contextmenu', preventContextMenu)
  }, [])

  // Update cursor based on current tool or position picking
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const container = stage.container()

    // Override cursor when picking positions or tokens
    if (isPicking === 'from' || isPicking === 'to') {
      container.style.cursor = 'crosshair'
      return
    } else if (isPicking === 'token') {
      container.style.cursor = 'pointer'
      return
    }

    switch (currentTool) {
      case 'pan':
        container.style.cursor = 'grab'
        break
      case 'eraser':
        container.style.cursor = 'crosshair'
        break
      case 'measure':
        container.style.cursor = 'crosshair'
        break
      case 'rectangle':
      case 'circle':
        container.style.cursor = 'crosshair'
        break
      case 'token':
        container.style.cursor = 'copy'
        break
      case 'staticObject':
        container.style.cursor = 'copy'
        break
      case 'spellEffect':
        container.style.cursor = 'copy'
        break
      case 'text':
        container.style.cursor = 'text'
        break
      case 'select':
      default:
        container.style.cursor = 'default'
        break
    }
  }, [currentTool, isPicking])

  if (!currentMap) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No map loaded. Create a new map to get started.</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-dnd-gray-900">
      {/* Grid Controls */}
      <GridControls />

      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 bg-dnd-black/80 rounded-lg p-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span>Zoom: {Math.round(stageScale * 100)}%</span>
          <button
            onClick={zoomOut}
            className="px-2 py-1 bg-dnd-gray-800 hover:bg-dnd-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={zoomIn}
            className="px-2 py-1 bg-dnd-gray-800 hover:bg-dnd-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={resetView}
            className="px-2 py-1 bg-dnd-gray-800 hover:bg-dnd-gray-700 rounded transition-colors"
            title="Reset View (Ctrl+0)"
          >
            Reset
          </button>
          <button
            onClick={centerView}
            className="px-2 py-1 bg-dnd-gray-800 hover:bg-dnd-gray-700 rounded transition-colors"
            title="Fit to Screen"
          >
            Fit
          </button>
        </div>
      </div>

      {/* Instructions - Move higher to not conflict with Timeline */}
      <div className="absolute bottom-24 left-4 z-10 bg-dnd-black/80 rounded-lg p-2 backdrop-blur-sm">
        <div className="text-xs text-gray-400">
          <p>🖱️ Middle-click + drag to pan | Shift + drag to pan</p>
          <p>📏 Scroll to zoom | Ctrl+0 to reset view</p>
        </div>
      </div>

      {/* Konva Stage */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePosition.x}
        y={stagePosition.y}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}
      >
        {/* Grid Layer */}
        <Layer>
          <GridLayer
            width={currentMap.width}
            height={currentMap.height}
            gridSize={currentMap.grid.size}
            gridColor={currentMap.grid.color}
            visible={currentMap.grid.visible}
            scale={stageScale}
            stagePosition={stagePosition}
            viewportWidth={width}
            viewportHeight={height}
          />
        </Layer>

        {/* Objects Layer */}
        <Layer>
          <ObjectsLayer
            onObjectClick={(id) => selectObject(id)}
            onObjectDragEnd={(id, pos) => updateObjectPosition(id, pos)}
          />
        </Layer>

        {/* Drawing Preview Layer */}
        <DrawingLayer stageRef={stageRef as React.RefObject<Konva.Stage>} gridSize={currentMap.grid.size} />

        {/* UI Layer */}
        <Layer>
          {/* Measurement tool overlay */}
          <MeasureTool gridSize={currentMap.grid.size} />
          {/* Path preview for event creation and animations */}
          <PathPreview gridSize={currentMap.grid.size} />
        </Layer>
      </Stage>
    </div>
  )
}

export default MapCanvas
/**
 * MapCanvas Organism - Complete canvas rendering system
 *
 * The main canvas component that orchestrates all canvas functionality including
 * layers, viewport management, grid system, and tool integration using the
 * atomic canvas architecture with comprehensive service integration.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'
import { Box } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { GridSystem, ViewportControls, CanvasToolbar, PerformanceMonitor } from '../../molecules'
import { ViewportCursor } from '../../atoms'
import {
  canvasService,
  layerService,
  viewportService,
  type CanvasId,
  type CanvasConfig,
  type CanvasState,
  type ViewportState,
  type GridConfig,
  type ToolType,
  type CoordinateSpace
} from '../../../services'
import type { Point, Rectangle } from '@/types/geometry'
import type { MapObject } from '@/types/map'

export interface MapCanvasProps {
  readonly width: number
  readonly height: number
  readonly backgroundColor?: string
  readonly gridConfig?: GridConfig
  readonly showGrid?: boolean
  readonly showPerformance?: boolean
  readonly showViewportControls?: boolean
  readonly showToolbar?: boolean
  readonly activeTool?: ToolType
  readonly objects?: readonly MapObject[]
  readonly onMouseMove?: (position: Point) => void
  readonly onZoomChange?: (zoom: number) => void
  readonly onToolChange?: (tool: ToolType) => void
  readonly onObjectClick?: (objectId: string) => void
  readonly onCanvasClick?: (position: Point) => void
  readonly stageRef?: React.MutableRefObject<Konva.Stage | null>
}

const CanvasContainer = styled(Box, {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: '$gray900'
})

const CanvasStage = styled(Stage, {
  cursor: 'default'
})

const UIOverlay = styled(Box, {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 10
})

const ControlsPanel = styled(Box, {
  position: 'absolute',
  top: '$4',
  right: '$4',
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
  pointerEvents: 'auto'
})

const ToolbarPanel = styled(Box, {
  position: 'absolute',
  top: '$4',
  left: '50%',
  transform: 'translateX(-50%)',
  pointerEvents: 'auto'
})

const PerformancePanel = styled(Box, {
  position: 'absolute',
  bottom: '$4',
  right: '$4',
  pointerEvents: 'auto'
})

const defaultGridConfig: GridConfig = {
  size: 50,
  type: 'square',
  visible: true,
  color: '#374151',
  opacity: 0.6,
  strokeWidth: 1,
  subGrid: {
    divisions: 5,
    color: '#1F2937',
    opacity: 0.4,
    strokeWidth: 0.5,
    visible: true
  },
  snap: {
    enabled: true,
    threshold: 10,
    snapToIntersections: true,
    snapToMidpoints: false,
    snapToEdges: false,
    visualFeedback: true,
    feedbackColor: '#F59E0B'
  }
}

const defaultTools = [
  { id: 'select', name: 'Select', type: 'select' as ToolType, cursor: { type: 'default' as const, size: 16, hotspot: { x: 0, y: 0 }, color: '#ffffff' }, settings: {}, keyboardShortcuts: ['v'], enabled: true },
  { id: 'draw', name: 'Draw', type: 'draw' as ToolType, cursor: { type: 'draw' as const, size: 16, hotspot: { x: 8, y: 8 }, color: '#ffffff' }, settings: {}, keyboardShortcuts: ['d'], enabled: true },
  { id: 'pan', name: 'Pan', type: 'pan' as ToolType, cursor: { type: 'move' as const, size: 16, hotspot: { x: 8, y: 8 }, color: '#ffffff' }, settings: {}, keyboardShortcuts: ['h'], enabled: true },
  { id: 'zoom', name: 'Zoom', type: 'zoom' as ToolType, cursor: { type: 'zoom-in' as const, size: 16, hotspot: { x: 8, y: 8 }, color: '#ffffff' }, settings: {}, keyboardShortcuts: ['z'], enabled: true }
]

export const MapCanvas: React.FC<MapCanvasProps> = React.memo(({
  width,
  height,
  backgroundColor = '#1a1a1a',
  gridConfig = defaultGridConfig,
  showGrid = true,
  showPerformance = false,
  showViewportControls = true,
  showToolbar = true,
  activeTool = 'select',
  objects = [],
  onMouseMove,
  onZoomChange,
  onToolChange,
  onObjectClick,
  onCanvasClick,
  stageRef
}) => {
  // Local refs and state
  const containerRef = useRef<HTMLDivElement>(null)
  const internalStageRef = useRef<Konva.Stage | null>(null)
  const canvasIdRef = useRef<CanvasId | null>(null)

  const [canvasState, setCanvasState] = useState<CanvasState | null>(null)
  const [viewportState, setViewportState] = useState<ViewportState | null>(null)
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 })
  const [coordinateSpace, setCoordinateSpace] = useState<CoordinateSpace>('world')
  const [currentTool, setCurrentTool] = useState<ToolType>(activeTool)

  // Initialize canvas services
  useEffect(() => {
    if (!containerRef.current) return

    // Create canvas instance
    const canvas = canvasService.createCanvas({
      width,
      height,
      backgroundColor,
      container: containerRef.current,
      enableHighDPI: true
    })

    canvasIdRef.current = canvas.id
    internalStageRef.current = canvas.stage

    // Set external stage ref
    if (stageRef) {
      stageRef.current = canvas.stage
    }

    // Create layer and viewport managers
    const layerManager = layerService.createLayerManager(canvas.id, canvas.stage)
    const viewportManager = viewportService.createViewportManager(canvas.id, canvas.stage)

    // Set initial canvas state
    setCanvasState(canvas.state)
    setViewportState(viewportManager.getState())

    // Setup event handlers
    canvas.stage.on('mousemove', handleMouseMove)
    canvas.stage.on('wheel', handleWheel)
    canvas.stage.on('click', handleStageClick)

    return () => {
      // Cleanup
      canvas.stage.off('mousemove', handleMouseMove)
      canvas.stage.off('wheel', handleWheel)
      canvas.stage.off('click', handleStageClick)

      if (canvasIdRef.current) {
        viewportService.destroyViewportManager(canvasIdRef.current)
        layerService.destroyLayerManager(canvasIdRef.current)
        canvasService.destroyCanvas(canvasIdRef.current)
      }
    }
  }, [width, height, backgroundColor])

  // Handle mouse movement
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage || !canvasIdRef.current) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    let worldPosition = pointer

    // Convert to world coordinates if needed
    if (coordinateSpace === 'world') {
      const converted = canvasService.screenToWorld(canvasIdRef.current, pointer)
      if (converted) worldPosition = converted
    }

    setMousePosition(worldPosition)
    onMouseMove?.(worldPosition)
  }, [coordinateSpace, onMouseMove])

  // Handle zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    if (!canvasIdRef.current) return

    e.evt.preventDefault()

    const viewportManager = viewportService.getViewportManager(canvasIdRef.current)
    if (!viewportManager) return

    const pointer = e.target.getStage()?.getPointerPosition()
    if (!pointer) return

    const zoomDelta = e.evt.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(10, viewportState?.zoom + zoomDelta || 1))

    viewportManager.setZoom(newZoom, pointer, false)

    const updatedState = viewportManager.getState()
    setViewportState(updatedState)
    onZoomChange?.(updatedState.zoom)
  }, [viewportState, onZoomChange])

  // Handle stage click
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const target = e.target

    if (target === e.target.getStage()) {
      // Clicked on empty canvas
      const pointer = target.getPointerPosition()
      if (pointer && onCanvasClick) {
        onCanvasClick(pointer)
      }
    } else {
      // Clicked on an object
      const objectId = target.id()
      if (objectId && onObjectClick) {
        onObjectClick(objectId)
      }
    }
  }, [onObjectClick, onCanvasClick])

  // Viewport control handlers
  const handleZoomIn = useCallback(() => {
    if (!canvasIdRef.current || !viewportState) return

    const viewportManager = viewportService.getViewportManager(canvasIdRef.current)
    if (!viewportManager) return

    const newZoom = Math.min(10, viewportState.zoom + 0.2)
    viewportManager.setZoom(newZoom, undefined, true)
    setViewportState(viewportManager.getState())
  }, [viewportState])

  const handleZoomOut = useCallback(() => {
    if (!canvasIdRef.current || !viewportState) return

    const viewportManager = viewportService.getViewportManager(canvasIdRef.current)
    if (!viewportManager) return

    const newZoom = Math.max(0.1, viewportState.zoom - 0.2)
    viewportManager.setZoom(newZoom, undefined, true)
    setViewportState(viewportManager.getState())
  }, [viewportState])

  const handleZoomReset = useCallback(() => {
    if (!canvasIdRef.current) return

    const viewportManager = viewportService.getViewportManager(canvasIdRef.current)
    if (!viewportManager) return

    viewportManager.setZoom(1, undefined, true)
    setViewportState(viewportManager.getState())
  }, [])

  const handleFitToBounds = useCallback(() => {
    if (!canvasIdRef.current || objects.length === 0) return

    // Calculate content bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    objects.forEach(obj => {
      minX = Math.min(minX, obj.position.x)
      minY = Math.min(minY, obj.position.y)
      maxX = Math.max(maxX, obj.position.x)
      maxY = Math.max(maxY, obj.position.y)
    })

    const bounds = { x: minX, y: minY, width: maxX - minX, height: maxY - minY }

    const viewportManager = viewportService.getViewportManager(canvasIdRef.current)
    if (viewportManager) {
      viewportManager.fitToBounds(bounds, { padding: 50, animate: true })
      setViewportState(viewportManager.getState())
    }
  }, [objects])

  const handleResetView = useCallback(() => {
    if (!canvasIdRef.current) return

    const viewportManager = viewportService.getViewportManager(canvasIdRef.current)
    if (!viewportManager) return

    viewportManager.reset(true)
    setViewportState(viewportManager.getState())
  }, [])

  // Tool handlers
  const handleToolSelect = useCallback((tool: ToolType) => {
    setCurrentTool(tool)
    onToolChange?.(tool)
  }, [onToolChange])

  // Render viewport bounds for debugging
  const viewportBounds = viewportState ? {
    x: -viewportState.position.x / viewportState.zoom,
    y: -viewportState.position.y / viewportState.zoom,
    width: width / viewportState.zoom,
    height: height / viewportState.zoom
  } : null

  if (!canvasState || !viewportState) {
    return <CanvasContainer ref={containerRef} />
  }

  return (
    <CanvasContainer ref={containerRef}>
      <CanvasStage
        ref={internalStageRef}
        width={width}
        height={height}
        draggable={currentTool === 'pan'}
      >
        {/* Grid layer */}
        <Layer listening={false}>
          {showGrid && viewportBounds && (
            <GridSystem
              config={gridConfig}
              viewport={viewportBounds}
              onGridClick={onCanvasClick}
            />
          )}
        </Layer>

        {/* Objects layer */}
        <Layer>
          {/* Objects would be rendered here */}
        </Layer>

        {/* UI layer */}
        <Layer listening={false}>
          <ViewportCursor
            type={currentTool === 'draw' ? 'draw' : 'default'}
            position={mousePosition}
            size={16}
            color="#ffffff"
            opacity={0.8}
            isVisible={true}
            snapToGrid={gridConfig.snap.enabled}
            gridSize={gridConfig.size}
          />
        </Layer>
      </CanvasStage>

      {/* UI Overlays */}
      <UIOverlay>
        {showToolbar && (
          <ToolbarPanel>
            <CanvasToolbar
              activeTool={currentTool}
              availableTools={defaultTools}
              onToolSelect={handleToolSelect}
              orientation="horizontal"
              showLabels={false}
              compact={true}
            />
          </ToolbarPanel>
        )}

        <ControlsPanel>
          {showViewportControls && (
            <ViewportControls
              viewportState={viewportState}
              mousePosition={mousePosition}
              coordinateSpace={coordinateSpace}
              gridSize={gridConfig.size}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              onFitToBounds={handleFitToBounds}
              onResetView={handleResetView}
              onCoordinateSpaceChange={setCoordinateSpace}
              minZoom={0.1}
              maxZoom={10}
              showCoordinates={true}
              showFitControls={true}
            />
          )}
        </ControlsPanel>

        {showPerformance && (
          <PerformancePanel>
            <PerformanceMonitor
              performance={canvasState.performance}
              showAll={false}
              compact={true}
            />
          </PerformancePanel>
        )}
      </UIOverlay>
    </CanvasContainer>
  )
})

MapCanvas.displayName = 'MapCanvas'
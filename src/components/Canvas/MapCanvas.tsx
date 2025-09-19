import React, { useEffect, useRef, memo } from 'react'
import { Stage, Layer } from 'react-konva'
import Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import useEventCreationStore from '@store/eventCreationStore'
import { useCanvasControls } from '@hooks/useCanvasControls'
import { useTokenAnimation } from '@hooks/useTokenAnimation'
import { useToolHandlers } from '@hooks/useToolHandlers'
import { useCursorManager } from '@hooks/useCursorManager'
import GridLayer from './GridLayer'
import ObjectsLayer from './ObjectsLayer'
import DrawingLayer from '../Tools/DrawingLayer'
import MeasureTool from '../Tools/MeasureTool'
import PathPreview from './PathPreview'
import { GridControls } from './GridControls'
import { CanvasControls } from './CanvasControls'
import { Box, Text } from '@/components/ui'
import { styled } from '@/styles/theme.config'

// Styled components
const CanvasContainer = styled(Box, {
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: '$gray900',
})

const InstructionsPanel = styled(Box, {
  position: 'absolute',
  bottom: '96px',
  left: '$4',
  zIndex: 10,
  backgroundColor: '$dndBlack/80',
  borderRadius: '$lg',
  padding: '$2',
  backdropFilter: 'blur(4px)',
})

type MapCanvasProps = {
  width: number
  height: number
  stageRef?: React.MutableRefObject<Konva.Stage | null>
  onMouseMove?: (position: { x: number; y: number }) => void
  onZoomChange?: (zoom: number) => void
}

const MapCanvasComponent: React.FC<MapCanvasProps> = ({
  width,
  height,
  stageRef: externalStageRef,
  onMouseMove,
  onZoomChange
}) => {
  const internalStageRef = useRef<Konva.Stage>(null)
  const stageRef = externalStageRef || internalStageRef

  // Store selectors
  const currentMap = useMapStore(state => state.currentMap)
  const addObject = useMapStore(state => state.addObject)
  const selectObject = useMapStore(state => state.selectObject)
  const updateObjectPosition = useMapStore(state => state.updateObjectPosition)

  const currentTool = useToolStore(state => state.currentTool)
  const drawingState = useToolStore(state => state.drawingState)
  const setDrawingState = useToolStore(state => state.setDrawingState)
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)
  const opacity = useToolStore(state => state.opacity)
  const tokenTemplate = useToolStore(state => state.tokenTemplate)
  const staticObjectTemplate = useToolStore(state => state.staticObjectTemplate)
  const spellEffectTemplate = useToolStore(state => state.spellEffectTemplate)

  const isPicking = useEventCreationStore(state => state.isPicking)
  const setPosition = useEventCreationStore(state => state.setPosition)
  const completePositionPicking = useEventCreationStore(state => state.completePositionPicking)

  // Initialize animation hook
  useTokenAnimation(stageRef as React.MutableRefObject<Konva.Stage>)

  // Canvas controls hook
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

  // Tool handlers hook
  const {
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp
  } = useToolHandlers({
    stageRef: stageRef as React.RefObject<Konva.Stage>,
    currentTool,
    currentMap,
    fillColor,
    strokeColor,
    strokeWidth,
    opacity,
    tokenTemplate,
    staticObjectTemplate,
    spellEffectTemplate,
    isPicking,
    drawingState,
    setDrawingState,
    addObject,
    setPosition,
    completePositionPicking,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    onMouseMove
  })

  // Cursor manager hook
  useCursorManager({
    stageRef: stageRef as React.RefObject<Konva.Stage>,
    currentTool,
    isPicking
  })

  // Report zoom changes
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(stageScale)
    }
  }, [stageScale, onZoomChange])

  // Keyboard shortcut for reset
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
  }, [stageRef])

  if (!currentMap) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" css={{ height: '100%' }}>
        <Text color="gray500">No map loaded. Create a new map to get started.</Text>
      </Box>
    )
  }

  return (
    <CanvasContainer>
      {/* Grid Controls */}
      <GridControls />

      {/* Canvas Controls */}
      <CanvasControls
        stageScale={stageScale}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        resetView={resetView}
        centerView={centerView}
      />

      {/* Instructions */}
      <InstructionsPanel>
        <Box css={{ fontSize: '$xs', color: '$gray400' }}>
          <Text size="xs" color="gray400">🖱️ Middle-click + drag to pan | Shift + drag to pan</Text>
          <Text size="xs" color="gray400">📏 Scroll to zoom | Ctrl+0 to reset view</Text>
        </Box>
      </InstructionsPanel>

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
    </CanvasContainer>
  )
}

export const MapCanvas = memo(MapCanvasComponent)
MapCanvas.displayName = 'MapCanvas'

export default MapCanvas
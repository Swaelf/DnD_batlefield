import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { shallow } from 'zustand/shallow'
import useMapStore from '@/store/mapStore'
import useToolStore from '@/store/toolStore'
import { useHistoryStore } from '@/store/historyStore'
import {
  MousePointer2,
  Grid3x3,
  Layers,
  ZoomIn,
  Undo2,
  Redo2,
  Package
} from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { Box, Text, Button } from '@/components/primitives'

type StatusBarProps = {
  mousePosition?: { x: number; y: number }
  zoom?: number
}

const StatusBarContainer = styled(Box, {
  height: '24px',
  backgroundColor: '$gray900',
  borderTop: '1px solid $gray800',
  display: 'flex',
  alignItems: 'center',
  paddingX: '$2',
  fontSize: '$xs',
})

const StatusSection = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$4',

  variants: {
    align: {
      left: { flex: 1, justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      right: { flex: 1, justifyContent: 'flex-end' },
    },
  },
})

const StatusItem = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  color: '$gray400',
})

const StatusText = styled(Text, {
  fontFamily: '$mono',
  fontSize: '$xs',
  color: 'inherit',

  variants: {
    highlight: {
      true: {
        color: '$white',
        fontWeight: '$medium',
      },
    },
    warning: {
      true: {
        color: '$error',
      },
    },
    success: {
      true: {
        color: '$success',
      },
    },
    accent: {
      true: {
        color: '$secondary',
      },
    },
  },
})

const StatusButton = styled(Button, {
  height: '20px',
  minWidth: 'auto',
  padding: '$1',
  fontSize: '$xs',
  borderRadius: '$sm',
  gap: '$1',

  variants: {
    variant: {
      status: {
        backgroundColor: 'transparent',
        color: '$gray400',
        border: 'none',
        '&:hover': {
          backgroundColor: '$gray800',
          color: '$white',
        },
        '&:disabled': {
          color: '$gray600',
          '&:hover': {
            backgroundColor: 'transparent',
            color: '$gray600',
          },
        },
      },
    },
  },

  defaultVariants: {
    variant: 'status',
    size: 'xs',
  },
})

const StatusBar: React.FC<StatusBarProps> = ({ mousePosition, zoom = 1 }) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const loadMap = useMapStore(state => state.loadMap)
  const selectedObjects = useMapStore(state => state.selectedObjects, shallow)
  const currentTool = useToolStore(state => state.currentTool)
  const canUndo = useHistoryStore(state => state.canUndo)
  const canRedo = useHistoryStore(state => state.canRedo)
  const getHistoryInfo = useHistoryStore(state => state.getHistoryInfo)
  const undoWithCurrentState = useHistoryStore(state => state.undoWithCurrentState)
  const redoWithCurrentState = useHistoryStore(state => state.redoWithCurrentState)
  const [fps, setFps] = useState(60)

  // FPS counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    measureFPS()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Memoize formatting functions to prevent recreating them
  const formatCoords = useCallback((pos?: { x: number; y: number }) => {
    if (!pos) return 'X: -- Y: --'
    return `X: ${Math.round(pos.x)} Y: ${Math.round(pos.y)}`
  }, [])

  const formatZoom = useCallback((z: number) => `${Math.round(z * 100)}%`, [])

  // Undo/Redo click handlers
  const handleUndo = useCallback(() => {
    if (currentMap && canUndo) {
      const previousState = undoWithCurrentState(currentMap)
      if (previousState) {
        loadMap(previousState)
      }
    }
  }, [currentMap, canUndo, undoWithCurrentState, loadMap])

  const handleRedo = useCallback(() => {
    if (currentMap && canRedo) {
      const nextState = redoWithCurrentState(currentMap)
      if (nextState) {
        loadMap(nextState)
      }
    }
  }, [currentMap, canRedo, redoWithCurrentState, loadMap])

  const getToolName = useCallback((tool: string) => {
    const names: Record<string, string> = {
      select: 'Select',
      rectangle: 'Rectangle',
      circle: 'Circle',
      token: 'Token',
      pan: 'Pan',
      measure: 'Measure',
      text: 'Text',
      eraser: 'Eraser'
    }
    return names[tool] || tool
  }, [])

  // Memoize computed values
  const historyInfo = useMemo(() => getHistoryInfo(), [getHistoryInfo])

  const gridCell = useMemo(() => {
    if (!currentMap?.grid.snap || !mousePosition) return null
    return {
      x: Math.floor(mousePosition.x / currentMap.grid.size),
      y: Math.floor(mousePosition.y / currentMap.grid.size)
    }
  }, [currentMap?.grid.snap, currentMap?.grid.size, mousePosition])

  return (
    <StatusBarContainer>
      {/* Left side - Cursor and tool info */}
      <StatusSection align="left">
        {/* Cursor position */}
        <StatusItem>
          <MousePointer2 size={12} />
          <StatusText css={{ minWidth: '120px' }}>{formatCoords(mousePosition)}</StatusText>
        </StatusItem>

        {/* Grid cell (if snapping) */}
        {gridCell && (
          <StatusItem>
            <Grid3x3 size={12} />
            <StatusText>
              Cell [{gridCell.x}, {gridCell.y}]
            </StatusText>
          </StatusItem>
        )}

        {/* Current tool */}
        <StatusItem>
          <StatusText>Tool:</StatusText>
          <StatusText highlight>{getToolName(currentTool)}</StatusText>
        </StatusItem>
      </StatusSection>

      {/* Center - Object info */}
      <StatusSection align="center">
        {/* Selected objects count */}
        {selectedObjects.length > 0 && (
          <StatusItem css={{ color: '$secondary' }}>
            <Package size={12} />
            <StatusText accent>{selectedObjects.length} selected</StatusText>
          </StatusItem>
        )}

        {/* Total objects */}
        <StatusItem>
          <Layers size={12} />
          <StatusText>{currentMap?.objects.length || 0} objects</StatusText>
        </StatusItem>
      </StatusSection>

      {/* Right side - System info */}
      <StatusSection align="right">
        {/* History status */}
        <StatusItem css={{ gap: '$2' }}>
          <StatusButton
            disabled={!canUndo}
            onClick={handleUndo}
            title={`Undo (${historyInfo.undoCount} available)`}
          >
            <Undo2 size={12} />
            <StatusText>{historyInfo.undoCount}</StatusText>
          </StatusButton>
          <StatusButton
            disabled={!canRedo}
            onClick={handleRedo}
            title={`Redo (${historyInfo.redoCount} available)`}
          >
            <Redo2 size={12} />
            <StatusText>{historyInfo.redoCount}</StatusText>
          </StatusButton>
        </StatusItem>

        {/* Zoom level */}
        <StatusItem>
          <ZoomIn size={12} />
          <StatusText css={{ minWidth: '50px' }}>{formatZoom(zoom)}</StatusText>
        </StatusItem>

        {/* Grid size */}
        {currentMap && (
          <StatusItem>
            <Grid3x3 size={12} />
            <StatusText>{currentMap.grid.size}px</StatusText>
          </StatusItem>
        )}

        {/* FPS counter */}
        <StatusItem>
          <StatusText warning={fps < 30}>{fps} FPS</StatusText>
        </StatusItem>
      </StatusSection>
    </StatusBarContainer>
  )
}

// Custom comparison function for optimized re-rendering
const arePropsEqual = (prevProps: StatusBarProps, nextProps: StatusBarProps): boolean => {
  // Only re-render if mouse position or zoom actually changed
  const mouseChanged = prevProps.mousePosition?.x !== nextProps.mousePosition?.x ||
                       prevProps.mousePosition?.y !== nextProps.mousePosition?.y
  const zoomChanged = prevProps.zoom !== nextProps.zoom

  return !mouseChanged && !zoomChanged
}

export default React.memo(StatusBar, arePropsEqual)
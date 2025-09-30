import React, { useState, useEffect, useMemo, useCallback } from 'react'
import useMapStore from '@/store/mapStore'
import useToolStore from '@/store/toolStore'
import { useHistoryStore } from '@/store/historyStore'
import {
  Pointer as MousePointer2,
  Grid3X3 as Grid3x3,
  Layers,
  Undo as Undo2,
  Redo as Redo2,
  Square as Package
} from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

type StatusBarProps = {
  mousePosition?: { x: number; y: number }
  zoom?: number
}


const StatusBar: React.FC<StatusBarProps> = ({ mousePosition }) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const loadMap = useMapStore(state => state.loadMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const currentTool = useToolStore(state => state.currentTool)
  const canUndo = useHistoryStore(state => state.canUndo)
  const canRedo = useHistoryStore(state => state.canRedo)
  const getHistoryInfo = useHistoryStore(state => state.getHistoryInfo)
  const undoWithCurrentState = useHistoryStore(state => state.undoWithCurrentState)
  const redoWithCurrentState = useHistoryStore(state => state.redoWithCurrentState)
  const [fps, setFps] = useState(60)

  // FPS counter - optimized to reduce performance impact
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number
    let isVisible = true

    // Detect if page is hidden to pause FPS monitoring
    const handleVisibilityChange = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const measureFPS = () => {
      // Only measure FPS when page is visible
      if (isVisible) {
        frameCount++
        const currentTime = performance.now()

        if (currentTime >= lastTime + 1000) {
          setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
          frameCount = 0
          lastTime = currentTime
        }
      }

      animationId = requestAnimationFrame(measureFPS)
    }

    measureFPS()
    return () => {
      cancelAnimationFrame(animationId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Memoize formatting functions to prevent recreating them
  const formatCoords = useCallback((pos?: { x: number; y: number }) => {
    if (!pos) return 'X: -- Y: --'
    return `X: ${Math.round(pos.x)} Y: ${Math.round(pos.y)}`
  }, [])

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
    <Box
      style={{
        height: '24px',
        backgroundColor: 'var(--colors-gray900)',
        borderTop: '1px solid var(--colors-gray700)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '8px',
        paddingRight: '8px',
        fontSize: '12px'
      }}
    >
      {/* Left side - Cursor and tool info */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flex: 1,
          justifyContent: 'flex-start'
        }}
      >
        {/* Cursor position */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--colors-gray400)'
          }}
        >
          <MousePointer2 size={12} />
          <Text
            variant="code"
            size="xs"
            style={{
              color: 'inherit',
              minWidth: '120px'
            }}
          >
            {formatCoords(mousePosition)}
          </Text>
        </Box>

        {/* Grid cell (if snapping) */}
        {gridCell && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--colors-gray400)'
            }}
          >
            <Grid3x3 size={12} />
            <Text
              variant="code"
              size="xs"
              style={{
                color: 'inherit'
              }}
            >
              Cell [{gridCell.x}, {gridCell.y}]
            </Text>
          </Box>
        )}

        {/* Current tool */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--colors-gray400)'
          }}
        >
          <Text
            variant="code"
            size="xs"
            style={{
              color: 'inherit'
            }}
          >
            Tool:
          </Text>
          <Text
            variant="code"
            size="xs"
            style={{
              color: 'var(--colors-gray100)',
              fontWeight: '500'
            }}
          >
            {getToolName(currentTool)}
          </Text>
        </Box>
      </Box>

      {/* Center - Object info */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          justifyContent: 'center'
        }}
      >
        {/* Selected objects count */}
        {selectedObjects.length > 0 && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--colors-secondary)'
            }}
          >
            <Package size={12} />
            <Text
              variant="code"
              size="xs"
              style={{
                color: 'inherit'
              }}
            >
              {selectedObjects.length} selected
            </Text>
          </Box>
        )}

        {/* Total objects */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--colors-gray400)'
          }}
        >
          <Layers size={12} />
          <Text
            variant="code"
            size="xs"
            style={{
              color: 'inherit'
            }}
          >
            {currentMap?.objects.length || 0} objects
          </Text>
        </Box>
      </Box>

      {/* Right side - System info */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flex: 1,
          justifyContent: 'flex-end'
        }}
      >
        {/* History status */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--colors-gray400)'
          }}
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            onClick={handleUndo}
            title={`Undo (${historyInfo.undoCount} available)`}
            style={{
              height: '20px',
              minWidth: 'auto',
              padding: '4px',
              fontSize: '12px',
              borderRadius: '4px',
              gap: '4px',
              backgroundColor: 'transparent',
              color: canUndo ? 'var(--colors-gray400)' : 'var(--colors-gray600)',
              border: 'none'
            }}
          >
            <Undo2 size={12} />
            <Text
              variant="code"
              size="xs"
              style={{
                color: 'inherit'
              }}
            >
              {historyInfo.undoCount}
            </Text>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!canRedo}
            onClick={handleRedo}
            title={`Redo (${historyInfo.redoCount} available)`}
            style={{
              height: '20px',
              minWidth: 'auto',
              padding: '4px',
              fontSize: '12px',
              borderRadius: '4px',
              gap: '4px',
              backgroundColor: 'transparent',
              color: canRedo ? 'var(--colors-gray400)' : 'var(--colors-gray600)',
              border: 'none'
            }}
          >
            <Redo2 size={12} />
            <Text
              variant="code"
              size="xs"
              style={{
                color: 'inherit'
              }}
            >
              {historyInfo.redoCount}
            </Text>
          </Button>
        </Box>

        {/* Grid size */}
        {currentMap && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--colors-gray400)'
            }}
          >
            <Grid3x3 size={12} />
            <Text
              variant="code"
              size="xs"
              style={{
                color: 'inherit'
              }}
            >
              {currentMap.grid.size}px
            </Text>
          </Box>
        )}

        {/* FPS counter */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--colors-gray400)'
          }}
        >
          <Text
            variant="code"
            size="xs"
            style={{
              color: fps < 30 ? 'var(--colors-red500)' : 'inherit'
            }}
          >
            {fps} FPS
          </Text>
        </Box>
      </Box>
    </Box>
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
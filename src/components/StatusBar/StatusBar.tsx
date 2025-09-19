import React, { useState, useEffect } from 'react'
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

interface StatusBarProps {
  mousePosition?: { x: number; y: number }
  zoom?: number
}

export const StatusBar: React.FC<StatusBarProps> = ({ mousePosition, zoom = 1 }) => {
  const { currentMap, selectedObjects } = useMapStore()
  const { currentTool } = useToolStore()
  const { canUndo, canRedo, getHistoryInfo } = useHistoryStore()
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

  const formatCoords = (pos?: { x: number; y: number }) => {
    if (!pos) return 'X: -- Y: --'
    return `X: ${Math.round(pos.x)} Y: ${Math.round(pos.y)}`
  }

  const formatZoom = (z: number) => `${Math.round(z * 100)}%`

  const getToolName = (tool: string) => {
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
  }

  const historyInfo = getHistoryInfo()

  return (
    <div className="h-6 bg-gray-900 border-t border-gray-800 flex items-center px-2 text-xs">
      {/* Left side - Cursor and tool info */}
      <div className="flex items-center gap-4 flex-1">
        {/* Cursor position */}
        <div className="flex items-center gap-1 text-gray-400">
          <MousePointer2 className="h-3 w-3" />
          <span className="font-mono min-w-[120px]">{formatCoords(mousePosition)}</span>
        </div>

        {/* Grid cell (if snapping) */}
        {currentMap?.grid.snap && mousePosition && (
          <div className="flex items-center gap-1 text-gray-400">
            <Grid3x3 className="h-3 w-3" />
            <span className="font-mono">
              Cell [{Math.floor(mousePosition.x / currentMap.grid.size)},
              {Math.floor(mousePosition.y / currentMap.grid.size)}]
            </span>
          </div>
        )}

        {/* Current tool */}
        <div className="flex items-center gap-1 text-gray-400">
          <span>Tool:</span>
          <span className="text-white font-medium">{getToolName(currentTool)}</span>
        </div>
      </div>

      {/* Center - Object info */}
      <div className="flex items-center gap-4">
        {/* Selected objects count */}
        {selectedObjects.length > 0 && (
          <div className="flex items-center gap-1 text-yellow-500">
            <Package className="h-3 w-3" />
            <span>{selectedObjects.length} selected</span>
          </div>
        )}

        {/* Total objects */}
        <div className="flex items-center gap-1 text-gray-400">
          <Layers className="h-3 w-3" />
          <span>{currentMap?.objects.length || 0} objects</span>
        </div>
      </div>

      {/* Right side - System info */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* History status */}
        <div className="flex items-center gap-2">
          <button
            disabled={!canUndo}
            className={`flex items-center gap-1 ${
              canUndo ? 'text-gray-400 hover:text-white' : 'text-gray-600'
            }`}
            title={`Undo (${historyInfo.undoCount} available)`}
          >
            <Undo2 className="h-3 w-3" />
            <span>{historyInfo.undoCount}</span>
          </button>
          <button
            disabled={!canRedo}
            className={`flex items-center gap-1 ${
              canRedo ? 'text-gray-400 hover:text-white' : 'text-gray-600'
            }`}
            title={`Redo (${historyInfo.redoCount} available)`}
          >
            <Redo2 className="h-3 w-3" />
            <span>{historyInfo.redoCount}</span>
          </button>
        </div>

        {/* Zoom level */}
        <div className="flex items-center gap-1 text-gray-400">
          <ZoomIn className="h-3 w-3" />
          <span className="font-mono min-w-[50px]">{formatZoom(zoom)}</span>
        </div>

        {/* Grid size */}
        {currentMap && (
          <div className="flex items-center gap-1 text-gray-400">
            <Grid3x3 className="h-3 w-3" />
            <span>{currentMap.grid.size}px</span>
          </div>
        )}

        {/* FPS counter */}
        <div className={`flex items-center gap-1 ${fps < 30 ? 'text-red-500' : 'text-gray-500'}`}>
          <span className="font-mono">{fps} FPS</span>
        </div>
      </div>
    </div>
  )
}
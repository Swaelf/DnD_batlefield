import React from 'react'
import { Grid3x3, Magnet, Eye, EyeOff } from 'lucide-react'
import useMapStore from '@/store/mapStore'
import clsx from 'clsx'

export const GridControls: React.FC = () => {
  const { currentMap, toggleGridSnap, toggleGridVisibility } = useMapStore()

  if (!currentMap) return null

  const { grid } = currentMap

  return (
    <div className="absolute top-4 left-4 z-10 bg-dnd-black/80 rounded-lg p-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* Grid Label */}
        <div className="flex items-center gap-1 text-xs text-gray-400 mr-2">
          <Grid3x3 className="h-4 w-4" />
          <span>Grid</span>
        </div>

        {/* Toggle Grid Visibility */}
        <button
          onClick={toggleGridVisibility}
          className={clsx(
            'p-2 rounded-lg transition-all',
            'hover:bg-dnd-gray-700',
            grid.visible
              ? 'bg-dnd-gray-700 text-dnd-gold'
              : 'bg-dnd-gray-800 text-gray-500'
          )}
          title={grid.visible ? 'Hide Grid (G)' : 'Show Grid (G)'}
        >
          {grid.visible ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </button>

        {/* Toggle Grid Snap */}
        <button
          onClick={toggleGridSnap}
          className={clsx(
            'p-2 rounded-lg transition-all',
            'hover:bg-dnd-gray-700',
            grid.snap
              ? 'bg-dnd-gray-700 text-dnd-gold'
              : 'bg-dnd-gray-800 text-gray-500'
          )}
          title={grid.snap ? 'Disable Snap (Shift+G)' : 'Enable Snap (Shift+G)'}
        >
          <Magnet className="h-4 w-4" />
        </button>

        {/* Snap Indicator */}
        <div className="ml-2 px-2 py-1 rounded bg-dnd-gray-800 text-xs">
          {grid.snap ? (
            <span className="text-dnd-gold">Snap: ON</span>
          ) : (
            <span className="text-gray-500">Snap: OFF</span>
          )}
        </div>
      </div>
    </div>
  )
}
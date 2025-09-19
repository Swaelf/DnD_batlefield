import React from 'react'
import {
  Plus,
  Square,
  Circle,
  Type,
  Users,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react'
import useMapStore from '@/store/mapStore'
import useToolStore from '@/store/toolStore'
import { nanoid } from 'nanoid'

interface MapContextMenuProps {
  position: { x: number; y: number }
  canvasPosition: { x: number; y: number }
  onClose: () => void
}

export const MapContextMenu: React.FC<MapContextMenuProps> = ({
  position,
  canvasPosition,
  onClose
}) => {
  const { currentMap, addObject, toggleGridVisibility, toggleGridSnap } = useMapStore()
  const { setTool, fillColor, strokeColor, strokeWidth } = useToolStore()

  const handleAddRectangle = () => {
    const rect = {
      id: nanoid(),
      type: 'shape' as const,
      shapeType: 'rectangle' as const,
      position: canvasPosition,
      width: 100,
      height: 100,
      rotation: 0,
      layer: 1,
      fill: fillColor,
      fillColor,
      stroke: strokeColor,
      strokeColor,
      strokeWidth,
      opacity: 1
    }
    addObject(rect)
    onClose()
  }

  const handleAddCircle = () => {
    const circle = {
      id: nanoid(),
      type: 'shape' as const,
      shapeType: 'circle' as const,
      position: canvasPosition,
      radius: 50,
      rotation: 0,
      layer: 1,
      fill: fillColor,
      fillColor,
      stroke: strokeColor,
      strokeColor,
      strokeWidth,
      opacity: 1
    }
    addObject(circle)
    onClose()
  }

  const handleAddToken = () => {
    const token = {
      id: nanoid(),
      type: 'token' as const,
      position: canvasPosition,
      rotation: 0,
      layer: 2,
      size: 'medium' as const,
      name: 'New Token',
      color: fillColor,
      shape: 'circle' as const,
      showLabel: true,
      labelPosition: 'bottom' as const,
      opacity: 1,
      borderColor: '#000000',
      borderWidth: 2
    }
    addObject(token)
    onClose()
  }

  const handleAddText = () => {
    const text = {
      id: nanoid(),
      type: 'text' as const,
      position: canvasPosition,
      rotation: 0,
      layer: 3,
      text: 'New Text',
      fontSize: 16,
      fontFamily: 'Scala Sans',
      color: fillColor
    }
    addObject(text)
    onClose()
  }

  const handleToggleGrid = () => {
    toggleGridVisibility()
    onClose()
  }

  const handleToggleSnap = () => {
    toggleGridSnap()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          onClose()
        }}
      />

      {/* Menu */}
      <div
        className="fixed z-50 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1"
        style={{ left: position.x, top: position.y }}
      >
        {/* Add objects */}
        <div className="px-2 py-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1">Add</div>

          <button
            onClick={handleAddRectangle}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Square className="h-3 w-3 text-gray-400" />
            Rectangle
          </button>

          <button
            onClick={handleAddCircle}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Circle className="h-3 w-3 text-gray-400" />
            Circle
          </button>

          <button
            onClick={handleAddToken}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Users className="h-3 w-3 text-gray-400" />
            Token
          </button>

          <button
            onClick={handleAddText}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Type className="h-3 w-3 text-gray-400" />
            Text
          </button>
        </div>

        <div className="h-px bg-gray-800 my-1" />

        {/* Tools */}
        <div className="px-2 py-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1">Tools</div>

          <button
            onClick={() => { setTool('select'); onClose() }}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Plus className="h-3 w-3 text-gray-400" />
            Select Tool
            <span className="ml-auto text-xs text-gray-500">V</span>
          </button>

          <button
            onClick={() => { setTool('rectangle'); onClose() }}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Square className="h-3 w-3 text-gray-400" />
            Rectangle Tool
            <span className="ml-auto text-xs text-gray-500">R</span>
          </button>

          <button
            onClick={() => { setTool('circle'); onClose() }}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Circle className="h-3 w-3 text-gray-400" />
            Circle Tool
            <span className="ml-auto text-xs text-gray-500">C</span>
          </button>
        </div>

        <div className="h-px bg-gray-800 my-1" />

        {/* Grid options */}
        <div className="px-2 py-1">
          <button
            onClick={handleToggleGrid}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            {currentMap?.grid.visible ? (
              <EyeOff className="h-3 w-3 text-gray-400" />
            ) : (
              <Eye className="h-3 w-3 text-gray-400" />
            )}
            {currentMap?.grid.visible ? 'Hide Grid' : 'Show Grid'}
            <span className="ml-auto text-xs text-gray-500">G</span>
          </button>

          <button
            onClick={handleToggleSnap}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            {currentMap?.grid.snap ? (
              <Unlock className="h-3 w-3 text-gray-400" />
            ) : (
              <Lock className="h-3 w-3 text-gray-400" />
            )}
            {currentMap?.grid.snap ? 'Disable Snap' : 'Enable Snap'}
            <span className="ml-auto text-xs text-gray-500">Shift+G</span>
          </button>
        </div>
      </div>
    </>
  )
}
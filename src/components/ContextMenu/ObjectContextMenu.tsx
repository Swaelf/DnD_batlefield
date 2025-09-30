import React from 'react'
import {
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from '@/utils/optimizedIcons'
import useMapStore from '@/store/mapStore'
import type { Token } from '@/types/token'
import { nanoid } from 'nanoid'

type ObjectContextMenuProps = {
  position: { x: number; y: number }
  objectId: string
  onClose: () => void
}

export const ObjectContextMenu: React.FC<ObjectContextMenuProps> = ({
  position,
  objectId,
  onClose
}) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const updateObject = useMapStore(state => state.updateObject)
  const deleteSelected = useMapStore(state => state.deleteSelected)
  const selectObject = useMapStore(state => state.selectObject)
  const addObject = useMapStore(state => state.addObject)

  const object = currentMap?.objects.find(obj => obj.id === objectId)
  if (!object) return null

  const handleDuplicate = () => {
    const newObject = {
      ...object,
      id: nanoid(),
      position: {
        x: object.position.x + 20,
        y: object.position.y + 20
      }
    }
    addObject(newObject)
    selectObject(newObject.id)
    onClose()
  }

  const handleDelete = () => {
    selectObject(objectId)
    deleteSelected()
    onClose()
  }

  const handleLockToggle = () => {
    updateObject(objectId, { locked: !object.locked })
    onClose()
  }

  const handleVisibilityToggle = () => {
    updateObject(objectId, { visible: !object.visible })
    onClose()
  }

  const moveLayer = (direction: 'up' | 'down' | 'top' | 'bottom') => {
    const objects = currentMap?.objects || []
    const maxLayer = Math.max(...objects.map(obj => obj.layer))
    const minLayer = Math.min(...objects.map(obj => obj.layer))
    let newLayer = object.layer

    switch (direction) {
      case 'up':
        newLayer = Math.min(maxLayer + 1, object.layer + 1)
        break
      case 'down':
        newLayer = Math.max(minLayer, object.layer - 1)
        break
      case 'top':
        newLayer = maxLayer + 1
        break
      case 'bottom':
        objects.forEach(obj => {
          if (obj.id !== objectId && obj.layer <= object.layer) {
            updateObject(obj.id, { layer: obj.layer + 1 })
          }
        })
        newLayer = 0
        break
    }

    updateObject(objectId, { layer: newLayer })
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
        className="fixed z-50 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl py-1"
        style={{ left: position.x, top: position.y }}
      >
        {/* Object info */}
        <div className="px-3 py-2 border-b border-gray-800">
          <div className="text-xs text-gray-500">Selected Object</div>
          <div className="text-sm text-white font-medium">
            {object.type === 'token' ? (object as Token).name : object.type}
          </div>
        </div>

        {/* Actions */}
        <div className="px-2 py-1">
          <button
            onClick={handleDuplicate}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <Copy className="h-3 w-3 text-gray-400" />
            Duplicate
            <span className="ml-auto text-xs text-gray-500">Ctrl+D</span>
          </button>

          <button
            onClick={handleDelete}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-3 w-3" />
            Delete
            <span className="ml-auto text-xs text-gray-500">Delete</span>
          </button>
        </div>

        <div className="h-px bg-gray-800 my-1" />

        {/* Layer controls */}
        <div className="px-2 py-1">
          <div className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1">Layer</div>

          <button
            onClick={() => moveLayer('top')}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <ArrowUpToLine className="h-3 w-3 text-gray-400" />
            Bring to Front
          </button>

          <button
            onClick={() => moveLayer('up')}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <ArrowUp className="h-3 w-3 text-gray-400" />
            Bring Forward
          </button>

          <button
            onClick={() => moveLayer('down')}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <ArrowDown className="h-3 w-3 text-gray-400" />
            Send Backward
          </button>

          <button
            onClick={() => moveLayer('bottom')}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            <ArrowDownToLine className="h-3 w-3 text-gray-400" />
            Send to Back
          </button>
        </div>

        <div className="h-px bg-gray-800 my-1" />

        {/* Properties */}
        <div className="px-2 py-1">
          <button
            onClick={handleLockToggle}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            {object.locked ? (
              <>
                <Unlock className="h-3 w-3 text-gray-400" />
                Unlock
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-gray-400" />
                Lock
              </>
            )}
          </button>

          <button
            onClick={handleVisibilityToggle}
            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-800 rounded flex items-center gap-2 transition-colors"
          >
            {object.visible === false ? (
              <>
                <Eye className="h-3 w-3 text-gray-400" />
                Show
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3 text-gray-400" />
                Hide
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
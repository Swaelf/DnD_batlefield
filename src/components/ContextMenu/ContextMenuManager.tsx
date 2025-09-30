import React, { useMemo } from 'react'
import useMapStore from '@store/mapStore'
import { useContextMenu } from '@hooks/useContextMenu'
import { ContextMenu, createObjectContextMenu, createCanvasContextMenu } from './ContextMenu'

interface ContextMenuManagerProps {
  children: React.ReactNode
}

export const ContextMenuManager: React.FC<ContextMenuManagerProps> = ({ children }) => {
  const { contextMenu, closeContextMenu } = useContextMenu()

  // Map store state
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const currentMap = useMapStore(state => state.currentMap)
  const updateObject = useMapStore(state => state.updateObject)
  const deleteSelected = useMapStore(state => state.deleteSelected)
  const deleteObject = useMapStore(state => state.deleteObject)
  const duplicateSelected = useMapStore(state => state.duplicateSelected)
  const selectObject = useMapStore(state => state.selectObject)
  const clearSelection = useMapStore(state => state.clearSelection)
  const toggleGridVisibility = useMapStore(state => state.toggleGridVisibility)

  // Get context menu items based on target
  const contextMenuItems = useMemo(() => {
    if (!contextMenu.isOpen || !contextMenu.target) return []

    switch (contextMenu.target) {
      case 'object':
        const objectId = contextMenu.metadata?.objectId
        const object = currentMap?.objects.find(obj => obj.id === objectId)

        if (!object) return []

        return createObjectContextMenu(
          objectId,
          object.type,
          object.visible !== false,
          object.locked || false,
          selectedObjects.includes(objectId),
          {
            onCopy: () => {
              // TODO: Implement copy to clipboard
            },
            onDelete: () => {
              if (selectedObjects.includes(objectId)) {
                deleteSelected()
              } else {
                deleteObject(objectId)
              }
            },
            onDuplicate: () => {
              if (selectedObjects.includes(objectId)) {
                duplicateSelected()
              } else {
                selectObject(objectId)
                duplicateSelected()
              }
            },
            onToggleVisibility: () => {
              updateObject(objectId, { visible: !(object.visible !== false) })
            },
            onToggleLock: () => {
              updateObject(objectId, { locked: !(object.locked || false) })
            },
            onMoveToLayer: () => {
              // TODO: Open layer selection dialog
            },
            onBringForward: () => {
              const currentLayer = object.layer || 0
              updateObject(objectId, { layer: currentLayer + 1 })
            },
            onSendBackward: () => {
              const currentLayer = object.layer || 0
              updateObject(objectId, { layer: Math.max(0, currentLayer - 1) })
            },
            onEdit: () => {
              selectObject(objectId)
              // Focus will automatically show properties panel
            }
          }
        )

      case 'canvas':
        return createCanvasContextMenu({
          onPaste: () => {
            // TODO: Implement paste from clipboard
          },
          onSelectAll: () => {
            if (currentMap) {
              const allIds = currentMap.objects.map(obj => obj.id)
              useMapStore.getState().selectMultiple(allIds)
            }
          },
          onClearSelection: () => {
            clearSelection()
          },
          onResetZoom: () => {
            // TODO: Reset zoom to 100%
          },
          onToggleGrid: () => {
            toggleGridVisibility()
          }
        })

      default:
        return []
    }
  }, [
    contextMenu.isOpen,
    contextMenu.target,
    contextMenu.metadata,
    currentMap,
    selectedObjects,
    updateObject,
    deleteSelected,
    deleteObject,
    duplicateSelected,
    selectObject,
    clearSelection,
    toggleGridVisibility
  ])

  return (
    <>
      {children}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenuItems}
        onClose={closeContextMenu}
      />
    </>
  )
}

export default ContextMenuManager
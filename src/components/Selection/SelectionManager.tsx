import React, { useState, useCallback, useMemo } from 'react'
import { Group } from 'react-konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { AdvancedSelectionTool } from './AdvancedSelectionTool'
import { TransformControls } from './TransformControls'
import { MapObject } from '@/types/map'

type SelectionMode = 'rectangle' | 'lasso' | 'magic-wand' | 'by-type' | 'by-layer'
type SelectionFilter = 'all' | 'tokens' | 'shapes' | 'text' | 'spells' | 'effects'

interface SelectionManagerProps {
  isActive: boolean
  gridSize: number
  onSelectionChange?: (selectedIds: string[]) => void
}

export const AdvancedSelectionManager: React.FC<SelectionManagerProps> = ({
  isActive,
  gridSize,
  onSelectionChange
}) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('rectangle')
  const [selectionFilter, setSelectionFilter] = useState<SelectionFilter>('all')
  const [selectionHistory, setSelectionHistory] = useState<string[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const currentMap = useMapStore(state => state.currentMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const selectMultipleObjects = useMapStore(state => state.selectMultipleObjects)
  const selectObject = useMapStore(state => state.selectObject)
  const currentTool = useToolStore(state => state.currentTool)
  const gridSettings = currentMap?.grid
  const gridSnap = gridSettings?.snap || false

  // Add selection to history
  const addToHistory = useCallback((selection: string[]) => {
    setSelectionHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push([...selection])
      return newHistory.slice(-20) // Keep last 20 selections
    })
    setHistoryIndex(prev => Math.min(prev + 1, 19))
  }, [historyIndex])

  // Undo selection
  const undoSelection = useCallback(() => {
    if (historyIndex > 0) {
      const previousSelection = selectionHistory[historyIndex - 1]
      selectMultipleObjects(previousSelection)
      setHistoryIndex(prev => prev - 1)
      onSelectionChange?.(previousSelection)
    }
  }, [historyIndex, selectionHistory, selectMultipleObjects, onSelectionChange])

  // Redo selection
  const redoSelection = useCallback(() => {
    if (historyIndex < selectionHistory.length - 1) {
      const nextSelection = selectionHistory[historyIndex + 1]
      selectMultipleObjects(nextSelection)
      setHistoryIndex(prev => prev + 1)
      onSelectionChange?.(nextSelection)
    }
  }, [historyIndex, selectionHistory, selectMultipleObjects, onSelectionChange])

  // Get filtered objects based on current filter
  const getFilteredObjects = useCallback((objects: MapObject[]): MapObject[] => {
    switch (selectionFilter) {
      case 'tokens':
        return objects.filter(obj => obj.type === 'token')
      case 'shapes':
        return objects.filter(obj => obj.type === 'shape')
      case 'text':
        return objects.filter(obj => obj.type === 'text')
      case 'spells':
        return objects.filter(obj => obj.type === 'spell')
      case 'effects':
        return objects.filter(obj => obj.type === 'persistent-area')
      case 'all':
      default:
        return objects
    }
  }, [selectionFilter])

  // Select by type
  const selectByType = useCallback((objectType: string) => {
    if (!currentMap) return

    const objectsOfType = currentMap.objects
      .filter(obj => obj.type === objectType)
      .map(obj => obj.id)

    selectMultipleObjects(objectsOfType)
    addToHistory(objectsOfType)
    onSelectionChange?.(objectsOfType)
  }, [currentMap, selectMultipleObjects, addToHistory, onSelectionChange])

  // Select by layer
  const selectByLayer = useCallback((layerId: string) => {
    if (!currentMap) return

    const objectsOnLayer = currentMap.objects
      .filter(obj => obj.layerId === layerId || obj.layer === parseInt(layerId))
      .map(obj => obj.id)

    selectMultipleObjects(objectsOnLayer)
    addToHistory(objectsOnLayer)
    onSelectionChange?.(objectsOnLayer)
  }, [currentMap, selectMultipleObjects, addToHistory, onSelectionChange])

  // Select similar objects (based on properties)
  const selectSimilar = useCallback((criteria: 'size' | 'color' | 'layer' | 'type') => {
    if (!currentMap || selectedObjects.length === 0) return

    const referenceObject = currentMap.objects.find(obj => obj.id === selectedObjects[0])
    if (!referenceObject) return

    let similarObjects: string[] = []

    switch (criteria) {
      case 'type':
        similarObjects = currentMap.objects
          .filter(obj => obj.type === referenceObject.type)
          .map(obj => obj.id)
        break

      case 'layer':
        similarObjects = currentMap.objects
          .filter(obj =>
            obj.layerId === referenceObject.layerId ||
            obj.layer === referenceObject.layer
          )
          .map(obj => obj.id)
        break

      case 'color':
        const referenceColor = (referenceObject as any).fill || (referenceObject as any).color
        if (referenceColor) {
          similarObjects = currentMap.objects
            .filter(obj =>
              (obj as any).fill === referenceColor ||
              (obj as any).color === referenceColor
            )
            .map(obj => obj.id)
        }
        break

      case 'size':
        if (referenceObject.type === 'token') {
          const referenceSize = (referenceObject as any).size
          similarObjects = currentMap.objects
            .filter(obj => obj.type === 'token' && (obj as any).size === referenceSize)
            .map(obj => obj.id)
        } else if (referenceObject.type === 'shape') {
          const refWidth = (referenceObject as any).width || 0
          const refHeight = (referenceObject as any).height || 0
          const tolerance = 10

          similarObjects = currentMap.objects
            .filter(obj => {
              if (obj.type !== 'shape') return false
              const objWidth = (obj as any).width || 0
              const objHeight = (obj as any).height || 0
              return Math.abs(objWidth - refWidth) <= tolerance &&
                     Math.abs(objHeight - refHeight) <= tolerance
            })
            .map(obj => obj.id)
        }
        break
    }

    selectMultipleObjects(similarObjects)
    addToHistory(similarObjects)
    onSelectionChange?.(similarObjects)
  }, [currentMap, selectedObjects, selectMultipleObjects, addToHistory, onSelectionChange])

  // Grow selection (select adjacent/nearby objects)
  const growSelection = useCallback(() => {
    if (!currentMap || selectedObjects.length === 0) return

    const selectedObjPositions = currentMap.objects
      .filter(obj => selectedObjects.includes(obj.id))
      .map(obj => ({ id: obj.id, pos: obj.position }))

    const growDistance = gridSize * 2 // Grow within 2 grid cells

    const nearbyObjects = currentMap.objects
      .filter(obj => !selectedObjects.includes(obj.id))
      .filter(obj => {
        return selectedObjPositions.some(selected => {
          const distance = Math.sqrt(
            Math.pow(obj.position.x - selected.pos.x, 2) +
            Math.pow(obj.position.y - selected.pos.y, 2)
          )
          return distance <= growDistance
        })
      })
      .map(obj => obj.id)

    const newSelection = [...selectedObjects, ...nearbyObjects]
    selectMultipleObjects(newSelection)
    addToHistory(newSelection)
    onSelectionChange?.(newSelection)
  }, [currentMap, selectedObjects, gridSize, selectMultipleObjects, addToHistory, onSelectionChange])

  // Shrink selection (deselect outermost objects)
  const shrinkSelection = useCallback(() => {
    if (!currentMap || selectedObjects.length <= 1) return

    const objects = currentMap.objects.filter(obj => selectedObjects.includes(obj.id))

    // Find center of selection
    const centerX = objects.reduce((sum, obj) => sum + obj.position.x, 0) / objects.length
    const centerY = objects.reduce((sum, obj) => sum + obj.position.y, 0) / objects.length

    // Sort by distance from center
    const sortedByDistance = objects
      .map(obj => ({
        id: obj.id,
        distance: Math.sqrt(
          Math.pow(obj.position.x - centerX, 2) +
          Math.pow(obj.position.y - centerY, 2)
        )
      }))
      .sort((a, b) => a.distance - b.distance)

    // Keep inner 80% of objects
    const keepCount = Math.max(1, Math.floor(sortedByDistance.length * 0.8))
    const newSelection = sortedByDistance.slice(0, keepCount).map(item => item.id)

    selectMultipleObjects(newSelection)
    addToHistory(newSelection)
    onSelectionChange?.(newSelection)
  }, [currentMap, selectedObjects, selectMultipleObjects, addToHistory, onSelectionChange])

  // Handle selection change from tools
  const handleSelectionChange = useCallback((newSelection: string[]) => {
    addToHistory(newSelection)
    onSelectionChange?.(newSelection)
  }, [addToHistory, onSelectionChange])

  // Get selection statistics
  const selectionStats = useMemo(() => {
    if (!currentMap || selectedObjects.length === 0) {
      return null
    }

    const objects = currentMap.objects.filter(obj => selectedObjects.includes(obj.id))
    const typeCount = objects.reduce((acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: selectedObjects.length,
      types: typeCount,
      objects
    }
  }, [currentMap, selectedObjects])

  // Selection management functions exposed for external use
  const selectionAPI = useMemo(() => ({
    selectByType,
    selectByLayer,
    selectSimilar,
    growSelection,
    shrinkSelection,
    undoSelection,
    redoSelection,
    setSelectionMode,
    setSelectionFilter,
    selectionStats
  }), [
    selectByType,
    selectByLayer,
    selectSimilar,
    growSelection,
    shrinkSelection,
    undoSelection,
    redoSelection,
    selectionStats
  ])

  if (!isActive || currentTool !== 'select') {
    return null
  }

  return (
    <Group>
      {/* Advanced Selection Tool */}
      <AdvancedSelectionTool
        isActive={isActive}
        gridSize={gridSize}
        gridSnap={gridSnap}
        selectionMode={selectionMode}
        onSelectionChange={handleSelectionChange}
      />

      {/* Transform Controls */}
      <TransformControls
        isActive={isActive}
        selectedIds={selectedObjects}
        gridSize={gridSize}
        gridSnap={gridSnap}
      />
    </Group>
  )
}

// Export selection API for use by other components
export type { SelectionMode, SelectionFilter }
export default AdvancedSelectionManager
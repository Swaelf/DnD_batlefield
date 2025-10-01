import { useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import useToolStore from '@store/toolStore'
import useMapStore from '@store/mapStore'
import { useHistoryStore } from '@store/historyStore'
import useEventCreationStore from '@store/eventCreationStore'

export const useKeyboardShortcuts = () => {
  const { setTool, currentTool, clearMeasurementPoints } = useToolStore()
  const { deleteSelected, duplicateSelected, clearSelection, selectedObjects, currentMap, loadMap, toggleGridSnap, toggleGridVisibility, selectMultiple } = useMapStore()
  const historyStore = useHistoryStore()
  const { isPicking, exitPickingMode } = useEventCreationStore()

  // Tool shortcuts
  useHotkeys('v', () => setTool('select'), [setTool])
  useHotkeys('r', () => setTool('rectangle'), [setTool])
  useHotkeys('c', () => setTool('circle'), [setTool])
  useHotkeys('l', () => setTool('line'), [setTool])
  useHotkeys('p', () => setTool('polygon'), [setTool])
  useHotkeys('t', () => setTool('token'), [setTool])
  useHotkeys('o', () => setTool('staticObject'), [setTool])
  useHotkeys('s', () => setTool('staticEffect'), [setTool])
  useHotkeys('h', () => setTool('pan'), [setTool])
  useHotkeys('m', () => setTool('measure'), [setTool])
  useHotkeys('x', () => setTool('text'), [setTool])
  useHotkeys('e', () => setTool('eraser'), [setTool])

  // Delete selected objects
  useHotkeys('delete, backspace', () => {
    if (selectedObjects.length > 0) {
      deleteSelected()
    }
  }, [selectedObjects, deleteSelected])

  // Clear selection, measurement points, or exit event picking mode
  useHotkeys('escape', () => {
    // If we're in event creation picking mode, exit it but keep modal open
    if (isPicking) {
      exitPickingMode()
      return
    }

    // Otherwise handle normal escape behavior
    if (currentTool === 'measure') {
      clearMeasurementPoints()
    } else {
      clearSelection()
    }
  }, [clearSelection, clearMeasurementPoints, currentTool, isPicking, exitPickingMode])

  // Select all objects
  useHotkeys('ctrl+a, cmd+a', () => {
    if (currentMap && currentMap.objects.length > 0) {
      const allObjectIds = currentMap.objects.map(obj => obj.id)
      selectMultiple(allObjectIds)
    }
  }, [currentMap, selectMultiple])

  // Duplicate selected objects
  useHotkeys('ctrl+d, cmd+d', () => {
    if (selectedObjects.length > 0) {
      duplicateSelected()
    }
  }, [selectedObjects, duplicateSelected])

  // Undo
  useHotkeys('ctrl+z, cmd+z', () => {
    if (currentMap && historyStore.canUndo) {
      const previousState = historyStore.undoWithCurrentState(currentMap)
      if (previousState) {
        loadMap(previousState)
      }
    }
  }, [currentMap, loadMap, historyStore])

  // Redo
  useHotkeys('ctrl+shift+z, cmd+shift+z', () => {
    if (currentMap && historyStore.canRedo) {
      const nextState = historyStore.redoWithCurrentState(currentMap)
      if (nextState) {
        loadMap(nextState)
      }
    }
  }, [currentMap, loadMap, historyStore])

  // Save shortcut
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault()
    // Trigger manual save (will be connected to export function)
  }, [])

  // Grid shortcuts
  useHotkeys('g', () => {
    toggleGridVisibility()
  }, [toggleGridVisibility])

  useHotkeys('shift+g', () => {
    toggleGridSnap()
  }, [toggleGridSnap])

  // Space for temporary pan tool
  useEffect(() => {
    let previousTool = currentTool

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        // Don't intercept space if user is typing in an input field
        const target = e.target as HTMLElement
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
          return
        }

        e.preventDefault()
        previousTool = currentTool
        setTool('pan')
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Don't intercept space if user is typing in an input field
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        return
      }

      if (e.code === 'Space') {
        e.preventDefault()
        if (currentTool === 'pan') {
          setTool(previousTool)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [currentTool, setTool])
}
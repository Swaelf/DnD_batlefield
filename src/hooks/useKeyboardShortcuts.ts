import { useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import useToolStore from '@store/toolStore'
import useMapStore from '@store/mapStore'
import { useHistoryStore } from '@store/historyStore'

export const useKeyboardShortcuts = () => {
  const { setTool, currentTool } = useToolStore()
  const { deleteSelected, clearSelection, selectedObjects, currentMap, loadMap, toggleGridSnap, toggleGridVisibility } = useMapStore()
  const historyStore = useHistoryStore()

  // Tool shortcuts
  useHotkeys('v', () => setTool('select'), [setTool])
  useHotkeys('r', () => setTool('rectangle'), [setTool])
  useHotkeys('c', () => setTool('circle'), [setTool])
  useHotkeys('t', () => setTool('token'), [setTool])
  useHotkeys('o', () => setTool('staticObject'), [setTool])
  useHotkeys('s', () => setTool('spellEffect'), [setTool])
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

  // Clear selection
  useHotkeys('escape', () => {
    clearSelection()
  }, [clearSelection])

  // Undo
  useHotkeys('ctrl+z, cmd+z', () => {
    if (currentMap) {
      // Save current state to future
      historyStore.pushState(currentMap)
      const previousState = historyStore.undo()
      if (previousState) {
        loadMap(previousState)
      }
    }
  }, [currentMap, loadMap])

  // Redo
  useHotkeys('ctrl+shift+z, cmd+shift+z', () => {
    const nextState = historyStore.redo()
    if (nextState) {
      if (currentMap) {
        historyStore.pushState(currentMap)
      }
      loadMap(nextState)
    }
  }, [currentMap, loadMap])

  // Save shortcut
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault()
    // Trigger manual save (will be connected to export function)
    console.log('Manual save triggered')
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
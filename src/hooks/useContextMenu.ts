import { useState, useCallback, useRef, type MouseEvent as ReactMouseEvent } from 'react'

interface ContextMenuState {
  isOpen: boolean
  position: { x: number; y: number }
  target: string | null
  metadata?: Record<string, any>
}

export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    target: null,
    metadata: undefined
  })

  const contextMenuRef = useRef<ContextMenuState>(contextMenu)
  contextMenuRef.current = contextMenu

  const openContextMenu = useCallback((
    event: ReactMouseEvent | MouseEvent,
    target: string,
    metadata?: Record<string, any>
  ) => {
    event.preventDefault()
    event.stopPropagation()

    setContextMenu({
      isOpen: true,
      position: { x: event.clientX, y: event.clientY },
      target,
      metadata
    })
  }, [])

  const closeContextMenu = useCallback(() => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      target: null,
      metadata: undefined
    })
  }, [])

  const handleContextMenu = useCallback((
    event: ReactMouseEvent,
    target: string,
    metadata?: Record<string, any>
  ) => {
    openContextMenu(event, target, metadata)
  }, [openContextMenu])

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
    handleContextMenu
  }
}
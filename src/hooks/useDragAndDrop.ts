import { useState, useCallback, useRef } from 'react'

interface DragItem {
  id: string
  type: string
  data?: any
}

interface DragState {
  isDragging: boolean
  draggedItem: DragItem | null
  draggedOver: string | null
}

interface UseDragAndDropOptions {
  onDragStart?: (item: DragItem) => void
  onDragEnd?: (item: DragItem) => void
  onDrop?: (draggedItem: DragItem, targetId: string) => void
  onDragOver?: (targetId: string) => void
  onDragLeave?: () => void
}

export interface DragHandlers {
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  draggable: true
}

export interface DropHandlers {
  onDragOver: (e: React.DragEvent) => void
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export function useDragAndDrop(options: UseDragAndDropOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    draggedOver: null
  })

  const draggedItemRef = useRef<DragItem | null>(null)
  const dragCounterRef = useRef(0)

  // Create drag handlers for draggable items
  const createDragHandlers = useCallback((item: DragItem): DragHandlers => {
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        draggedItemRef.current = item
        setDragState(prev => ({
          ...prev,
          isDragging: true,
          draggedItem: item
        }))

        // Set drag data
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('application/json', JSON.stringify(item))
        e.dataTransfer.setData('text/plain', item.id)

        options.onDragStart?.(item)
      },

      onDragEnd: (_e: React.DragEvent) => {
        const item = draggedItemRef.current
        if (item) {
          options.onDragEnd?.(item)
        }

        setDragState({
          isDragging: false,
          draggedItem: null,
          draggedOver: null
        })

        draggedItemRef.current = null
        dragCounterRef.current = 0
      },

      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      },

      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault()
      },

      onDragLeave: (e: React.DragEvent) => {
        // Ignore drag leave events from child elements
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
          return
        }
      },

      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
      }
    }
  }, [options])

  // Create drop handlers for drop targets
  const createDropHandlers = useCallback((targetId: string): DropHandlers => {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'

        if (dragState.draggedOver !== targetId) {
          setDragState(prev => ({
            ...prev,
            draggedOver: targetId
          }))
          options.onDragOver?.(targetId)
        }
      },

      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current += 1
      },

      onDragLeave: (_e: React.DragEvent) => {
        dragCounterRef.current -= 1

        if (dragCounterRef.current === 0) {
          setDragState(prev => ({
            ...prev,
            draggedOver: null
          }))
          options.onDragLeave?.()
        }
      },

      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current = 0

        try {
          // Try to get JSON data first
          const jsonData = e.dataTransfer.getData('application/json')
          let draggedItem: DragItem | null = null

          if (jsonData) {
            draggedItem = JSON.parse(jsonData)
          } else {
            // Fallback to plain text
            const id = e.dataTransfer.getData('text/plain')
            if (id && draggedItemRef.current?.id === id) {
              draggedItem = draggedItemRef.current
            }
          }

          if (draggedItem && draggedItem.id !== targetId) {
            options.onDrop?.(draggedItem, targetId)
          }
        } catch (error) {
          console.warn('Failed to parse drag data:', error)
        }

        setDragState(prev => ({
          ...prev,
          draggedOver: null
        }))
      }
    }
  }, [dragState.draggedOver, options])

  // Utility function to check if an item is being dragged
  const isDraggingItem = useCallback((itemId: string): boolean => {
    return dragState.isDragging && dragState.draggedItem?.id === itemId
  }, [dragState])

  // Utility function to check if an item is a valid drop target
  const isValidDropTarget = useCallback((targetId: string): boolean => {
    return dragState.isDragging &&
           dragState.draggedItem?.id !== targetId &&
           dragState.draggedOver === targetId
  }, [dragState])

  return {
    dragState,
    createDragHandlers,
    createDropHandlers,
    isDraggingItem,
    isValidDropTarget
  }
}

export default useDragAndDrop
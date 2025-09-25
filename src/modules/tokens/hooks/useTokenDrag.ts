/**
 * useTokenDrag Hook - Drag and drop functionality for tokens
 *
 * Provides drag state management, grid snapping, and interaction handling.
 * Integrates with Konva drag events and TokenStore.
 */

import { useCallback, useRef, useState } from 'react'
import Konva from 'konva'
import { useTokenStore } from '../store'
import type { TokenId } from '../types'
import type { Point } from '@/types/geometry'

export interface UseTokenDragOptions {
  readonly tokenId: TokenId
  readonly gridSize?: number
  readonly snapToGrid?: boolean
  readonly onDragStart?: () => void
  readonly onDragMove?: (position: Point) => void
  readonly onDragEnd?: (position: Point) => void
}

export interface UseTokenDragResult {
  readonly isDragging: boolean
  readonly dragOffset: Point | null
  readonly dragStartPosition: Point | null
  readonly currentPosition: Point | null

  // Event handlers
  readonly handleDragStart: (e: Konva.KonvaEventObject<DragEvent>) => void
  readonly handleDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void
  readonly handleDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void

  // Manual drag control
  readonly startDrag: (position: Point) => void
  readonly updateDrag: (position: Point) => void
  readonly endDrag: (position: Point) => void
  readonly cancelDrag: () => void

  // Utilities
  readonly snapToGrid: (position: Point) => Point
  readonly isValidDropPosition: (position: Point) => boolean
}

export function useTokenDrag(options: UseTokenDragOptions): UseTokenDragResult {
  const {
    tokenId,
    gridSize = 50,
    snapToGrid = true,
    onDragStart,
    onDragMove,
    onDragEnd
  } = options

  // Local drag state
  const [dragStartPosition, setDragStartPosition] = useState<Point | null>(null)
  const [currentPosition, setCurrentPosition] = useState<Point | null>(null)
  const dragDataRef = useRef<{
    startTime: number
    startPosition: Point
    hasMoved: boolean
  } | null>(null)

  // Store state and actions
  const isDragging = useTokenStore(state => state.draggedTokenId === tokenId)
  const dragOffset = useTokenStore(state => state.dragOffset)
  const setDraggedToken = useTokenStore(state => state.setDraggedToken)
  const setDragOffset = useTokenStore(state => state.setDragOffset)
  const moveToken = useTokenStore(state => state.moveToken)
  const setDragging = useTokenStore(state => state.setDragging)

  // Grid snapping utility
  const snapToGridFn = useCallback((position: Point): Point => {
    if (!snapToGrid || gridSize <= 0) return position

    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    }
  }, [snapToGrid, gridSize])

  // Validation utility
  const isValidDropPosition = useCallback((position: Point): boolean => {
    // In a real implementation, this would check:
    // - Map boundaries
    // - Collision with other tokens
    // - Terrain restrictions
    // - etc.
    return true
  }, [])

  // Drag event handlers
  const handleDragStart = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const position = { x: e.target.x(), y: e.target.y() }
    const pointer = stage.getPointerPosition()

    if (pointer) {
      const offset = {
        x: pointer.x - position.x,
        y: pointer.y - position.y
      }
      setDragOffset(offset)
    }

    setDragStartPosition(position)
    setCurrentPosition(position)
    setDraggedToken(tokenId)
    setDragging(true)

    dragDataRef.current = {
      startTime: performance.now(),
      startPosition: position,
      hasMoved: false
    }

    onDragStart?.()
  }, [tokenId, setDraggedToken, setDragOffset, setDragging, onDragStart])

  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target.getStage()
    if (!stage || !dragDataRef.current) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Calculate new position with offset
    const offset = dragOffset || { x: 0, y: 0 }
    let newPosition = {
      x: pointer.x - offset.x,
      y: pointer.y - offset.y
    }

    // Apply grid snapping
    if (snapToGrid) {
      newPosition = snapToGridFn(newPosition)
    }

    // Update target position for visual feedback
    e.target.x(newPosition.x)
    e.target.y(newPosition.y)

    // Track movement
    dragDataRef.current.hasMoved = true
    setCurrentPosition(newPosition)

    onDragMove?.(newPosition)
  }, [dragOffset, snapToGrid, snapToGridFn, onDragMove])

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const finalPosition = {
      x: e.target.x(),
      y: e.target.y()
    }

    // Apply final grid snap
    const snappedPosition = snapToGrid ? snapToGridFn(finalPosition) : finalPosition

    // Update target to snapped position
    e.target.x(snappedPosition.x)
    e.target.y(snappedPosition.y)

    // Validate drop position
    if (isValidDropPosition(snappedPosition)) {
      // Update token position in store
      moveToken(tokenId, snappedPosition)
      onDragEnd?.(snappedPosition)
    } else {
      // Revert to start position if invalid
      if (dragStartPosition) {
        e.target.x(dragStartPosition.x)
        e.target.y(dragStartPosition.y)
      }
    }

    // Clear drag state
    setDraggedToken(null)
    setDragOffset(null)
    setDragging(false)
    setDragStartPosition(null)
    setCurrentPosition(null)
    dragDataRef.current = null
  }, [
    tokenId,
    snapToGrid,
    snapToGridFn,
    isValidDropPosition,
    moveToken,
    setDraggedToken,
    setDragOffset,
    setDragging,
    dragStartPosition,
    onDragEnd
  ])

  // Manual drag control
  const startDrag = useCallback((position: Point) => {
    setDragStartPosition(position)
    setCurrentPosition(position)
    setDraggedToken(tokenId)
    setDragging(true)
    onDragStart?.()
  }, [tokenId, setDraggedToken, setDragging, onDragStart])

  const updateDrag = useCallback((position: Point) => {
    const snappedPosition = snapToGrid ? snapToGridFn(position) : position
    setCurrentPosition(snappedPosition)
    onDragMove?.(snappedPosition)
  }, [snapToGrid, snapToGridFn, onDragMove])

  const endDrag = useCallback((position: Point) => {
    const snappedPosition = snapToGrid ? snapToGridFn(position) : position

    if (isValidDropPosition(snappedPosition)) {
      moveToken(tokenId, snappedPosition)
      onDragEnd?.(snappedPosition)
    }

    setDraggedToken(null)
    setDragOffset(null)
    setDragging(false)
    setDragStartPosition(null)
    setCurrentPosition(null)
  }, [
    tokenId,
    snapToGrid,
    snapToGridFn,
    isValidDropPosition,
    moveToken,
    setDraggedToken,
    setDragOffset,
    setDragging,
    onDragEnd
  ])

  const cancelDrag = useCallback(() => {
    setDraggedToken(null)
    setDragOffset(null)
    setDragging(false)
    setDragStartPosition(null)
    setCurrentPosition(null)
    dragDataRef.current = null
  }, [setDraggedToken, setDragOffset, setDragging])

  return {
    isDragging,
    dragOffset,
    dragStartPosition,
    currentPosition,

    // Event handlers
    handleDragStart,
    handleDragMove,
    handleDragEnd,

    // Manual drag control
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,

    // Utilities
    snapToGrid: snapToGridFn,
    isValidDropPosition
  }
}

// Hook for multi-token drag operations
export interface UseMultiTokenDragResult {
  readonly isDraggingMultiple: boolean
  readonly selectedTokenCount: number
  readonly dragOffset: Point | null

  readonly startMultiDrag: (leadTokenId: TokenId, position: Point) => void
  readonly updateMultiDrag: (offset: Point) => void
  readonly endMultiDrag: () => void
  readonly cancelMultiDrag: () => void
}

export function useMultiTokenDrag(): UseMultiTokenDragResult {
  const [isDraggingMultiple, setIsDraggingMultiple] = useState(false)
  const [dragLeader, setDragLeader] = useState<TokenId | null>(null)
  const [initialPositions, setInitialPositions] = useState<Map<TokenId, Point>>(new Map())

  // Store state and actions
  const selectedTokenIds = useTokenStore(state => state.selectedTokenIds)
  const dragOffset = useTokenStore(state => state.dragOffset)
  const moveSelectedTokens = useTokenStore(state => state.moveSelectedTokens)
  const setDragOffset = useTokenStore(state => state.setDragOffset)
  const setDragging = useTokenStore(state => state.setDragging)
  const tokens = useTokenStore(state => state.tokens)

  const startMultiDrag = useCallback((leadTokenId: TokenId, position: Point) => {
    if (selectedTokenIds.size <= 1) return

    // Store initial positions of all selected tokens
    const positions = new Map<TokenId, Point>()
    selectedTokenIds.forEach(id => {
      const token = tokens.get(id)
      if (token) {
        positions.set(id, token.position)
      }
    })

    setIsDraggingMultiple(true)
    setDragLeader(leadTokenId)
    setInitialPositions(positions)
    setDragging(true)
  }, [selectedTokenIds, tokens, setDragging])

  const updateMultiDrag = useCallback((offset: Point) => {
    if (!isDraggingMultiple) return

    setDragOffset(offset)
  }, [isDraggingMultiple, setDragOffset])

  const endMultiDrag = useCallback(() => {
    if (!isDraggingMultiple || !dragOffset) return

    // Move all selected tokens by the drag offset
    moveSelectedTokens(dragOffset)

    // Clear multi-drag state
    setIsDraggingMultiple(false)
    setDragLeader(null)
    setInitialPositions(new Map())
    setDragOffset(null)
    setDragging(false)
  }, [isDraggingMultiple, dragOffset, moveSelectedTokens, setDragOffset, setDragging])

  const cancelMultiDrag = useCallback(() => {
    setIsDraggingMultiple(false)
    setDragLeader(null)
    setInitialPositions(new Map())
    setDragOffset(null)
    setDragging(false)
  }, [setDragOffset, setDragging])

  return {
    isDraggingMultiple,
    selectedTokenCount: selectedTokenIds.size,
    dragOffset,

    startMultiDrag,
    updateMultiDrag,
    endMultiDrag,
    cancelMultiDrag
  }
}
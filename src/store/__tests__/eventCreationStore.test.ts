import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useEventCreationStore from '../eventCreationStore'
import type { Position } from '@/types'

describe('eventCreationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useEventCreationStore.setState({
      isCreatingEvent: false,
      isPicking: null,
      selectedTokenId: null,
      fromPosition: null,
      toPosition: null,
      pathPreview: []
    })
  })

  describe('Event Creation State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useEventCreationStore())

      expect(result.current.isCreatingEvent).toBe(false)
      expect(result.current.isPicking).toBeNull()
      expect(result.current.selectedTokenId).toBeNull()
      expect(result.current.fromPosition).toBeNull()
      expect(result.current.toPosition).toBeNull()
      expect(result.current.pathPreview).toEqual([])
    })

    it('should start event creation for a token', () => {
      const { result } = renderHook(() => useEventCreationStore())

      act(() => {
        result.current.startEventCreation('token-123')
      })

      expect(result.current.isCreatingEvent).toBe(true)
      expect(result.current.selectedTokenId).toBe('token-123')
      expect(result.current.isPicking).toBeNull()
      expect(result.current.fromPosition).toBeNull()
      expect(result.current.toPosition).toBeNull()
      expect(result.current.pathPreview).toEqual([])
    })

    it('should cancel event creation and reset state', () => {
      const { result } = renderHook(() => useEventCreationStore())

      // Set some state first
      act(() => {
        result.current.startEventCreation('token-123')
        result.current.setPosition('from', { x: 100, y: 200 })
        result.current.setPathPreview([{ x: 100, y: 200 }, { x: 150, y: 250 }])
      })

      expect(result.current.isCreatingEvent).toBe(true)

      // Cancel event creation
      act(() => {
        result.current.cancelEventCreation()
      })

      expect(result.current.isCreatingEvent).toBe(false)
      expect(result.current.isPicking).toBeNull()
      expect(result.current.selectedTokenId).toBeNull()
      expect(result.current.fromPosition).toBeNull()
      expect(result.current.toPosition).toBeNull()
      expect(result.current.pathPreview).toEqual([])
    })
  })

  describe('Position Picking', () => {
    it('should start picking from position', () => {
      const { result } = renderHook(() => useEventCreationStore())

      act(() => {
        result.current.startPickingPosition('from')
      })

      expect(result.current.isPicking).toBe('from')
    })

    it('should start picking to position', () => {
      const { result } = renderHook(() => useEventCreationStore())

      act(() => {
        result.current.startPickingPosition('to')
      })

      expect(result.current.isPicking).toBe('to')
    })

    it('should start picking token', () => {
      const { result } = renderHook(() => useEventCreationStore())

      act(() => {
        result.current.startPickingToken()
      })

      expect(result.current.isPicking).toBe('token')
    })

    it('should set selected token but not change picking state', () => {
      const { result } = renderHook(() => useEventCreationStore())

      // Start picking token first
      act(() => {
        result.current.startPickingToken()
      })

      expect(result.current.isPicking).toBe('token')

      // Set selected token - should not clear isPicking (UI components manage this)
      act(() => {
        result.current.setSelectedToken('new-token-456')
      })

      expect(result.current.selectedTokenId).toBe('new-token-456')
      expect(result.current.isPicking).toBe('token') // Should still be 'token'
    })

    it('should set from position', () => {
      const { result } = renderHook(() => useEventCreationStore())

      const fromPos: Position = { x: 100, y: 150 }

      act(() => {
        result.current.setPosition('from', fromPos)
      })

      expect(result.current.fromPosition).toEqual(fromPos)
      expect(result.current.toPosition).toBeNull()
    })

    it('should set to position', () => {
      const { result } = renderHook(() => useEventCreationStore())

      const toPos: Position = { x: 300, y: 400 }

      act(() => {
        result.current.setPosition('to', toPos)
      })

      expect(result.current.toPosition).toEqual(toPos)
      expect(result.current.fromPosition).toBeNull()
    })

    it('should set both from and to positions', () => {
      const { result } = renderHook(() => useEventCreationStore())

      const fromPos: Position = { x: 100, y: 150 }
      const toPos: Position = { x: 300, y: 400 }

      act(() => {
        result.current.setPosition('from', fromPos)
        result.current.setPosition('to', toPos)
      })

      expect(result.current.fromPosition).toEqual(fromPos)
      expect(result.current.toPosition).toEqual(toPos)
    })

    it('should complete position picking', () => {
      const { result } = renderHook(() => useEventCreationStore())

      // Set picking state
      act(() => {
        result.current.startPickingPosition('from')
      })

      expect(result.current.isPicking).toBe('from')

      // Complete picking
      act(() => {
        result.current.completePositionPicking()
      })

      expect(result.current.isPicking).toBeNull()
    })
  })

  describe('Path Preview', () => {
    it('should set path preview', () => {
      const { result } = renderHook(() => useEventCreationStore())

      const path: Position[] = [
        { x: 100, y: 100 },
        { x: 150, y: 150 },
        { x: 200, y: 200 }
      ]

      act(() => {
        result.current.setPathPreview(path)
      })

      expect(result.current.pathPreview).toEqual(path)
    })

    it('should clear path preview with empty array', () => {
      const { result } = renderHook(() => useEventCreationStore())

      // Set some path first
      act(() => {
        result.current.setPathPreview([{ x: 100, y: 100 }, { x: 200, y: 200 }])
      })

      expect(result.current.pathPreview).toHaveLength(2)

      // Clear path
      act(() => {
        result.current.setPathPreview([])
      })

      expect(result.current.pathPreview).toEqual([])
    })

    it('should update path preview multiple times', () => {
      const { result } = renderHook(() => useEventCreationStore())

      const path1: Position[] = [{ x: 100, y: 100 }]
      const path2: Position[] = [{ x: 100, y: 100 }, { x: 150, y: 150 }]
      const path3: Position[] = [{ x: 100, y: 100 }, { x: 150, y: 150 }, { x: 200, y: 200 }]

      act(() => {
        result.current.setPathPreview(path1)
      })
      expect(result.current.pathPreview).toEqual(path1)

      act(() => {
        result.current.setPathPreview(path2)
      })
      expect(result.current.pathPreview).toEqual(path2)

      act(() => {
        result.current.setPathPreview(path3)
      })
      expect(result.current.pathPreview).toEqual(path3)
    })
  })

  describe('Workflow Integration', () => {
    it('should handle complete event creation workflow', () => {
      const { result } = renderHook(() => useEventCreationStore())

      // 1. Start event creation
      act(() => {
        result.current.startEventCreation('player-token')
      })

      expect(result.current.isCreatingEvent).toBe(true)
      expect(result.current.selectedTokenId).toBe('player-token')

      // 2. Pick from position
      act(() => {
        result.current.startPickingPosition('from')
      })

      expect(result.current.isPicking).toBe('from')

      act(() => {
        result.current.setPosition('from', { x: 100, y: 100 })
        result.current.completePositionPicking()
      })

      expect(result.current.fromPosition).toEqual({ x: 100, y: 100 })
      expect(result.current.isPicking).toBeNull()

      // 3. Pick to position
      act(() => {
        result.current.startPickingPosition('to')
      })

      expect(result.current.isPicking).toBe('to')

      act(() => {
        result.current.setPosition('to', { x: 300, y: 300 })
        result.current.completePositionPicking()
      })

      expect(result.current.toPosition).toEqual({ x: 300, y: 300 })
      expect(result.current.isPicking).toBeNull()

      // 4. Set path preview
      act(() => {
        result.current.setPathPreview([
          { x: 100, y: 100 },
          { x: 200, y: 200 },
          { x: 300, y: 300 }
        ])
      })

      expect(result.current.pathPreview).toHaveLength(3)

      // Final state check
      expect(result.current.isCreatingEvent).toBe(true)
      expect(result.current.selectedTokenId).toBe('player-token')
      expect(result.current.fromPosition).toEqual({ x: 100, y: 100 })
      expect(result.current.toPosition).toEqual({ x: 300, y: 300 })
      expect(result.current.isPicking).toBeNull()
    })

    it('should reset when starting new event during existing creation', () => {
      const { result } = renderHook(() => useEventCreationStore())

      // Start first event creation
      act(() => {
        result.current.startEventCreation('token-1')
        result.current.setPosition('from', { x: 100, y: 100 })
        result.current.setPathPreview([{ x: 100, y: 100 }, { x: 200, y: 200 }])
      })

      // Start new event creation - should reset
      act(() => {
        result.current.startEventCreation('token-2')
      })

      expect(result.current.selectedTokenId).toBe('token-2')
      expect(result.current.fromPosition).toBeNull()
      expect(result.current.toPosition).toBeNull()
      expect(result.current.pathPreview).toEqual([])
      expect(result.current.isPicking).toBeNull()
    })
  })

  describe('State Transitions', () => {
    it('should handle picking state transitions correctly', () => {
      const { result } = renderHook(() => useEventCreationStore())

      // Start picking token
      act(() => {
        result.current.startPickingToken()
      })
      expect(result.current.isPicking).toBe('token')

      // Switch to picking position
      act(() => {
        result.current.startPickingPosition('from')
      })
      expect(result.current.isPicking).toBe('from')

      // Switch to picking another position
      act(() => {
        result.current.startPickingPosition('to')
      })
      expect(result.current.isPicking).toBe('to')

      // Complete picking
      act(() => {
        result.current.completePositionPicking()
      })
      expect(result.current.isPicking).toBeNull()
    })

    it('should maintain isCreatingEvent state through position changes', () => {
      const { result } = renderHook(() => useEventCreationStore())

      act(() => {
        result.current.startEventCreation('token-1')
      })

      expect(result.current.isCreatingEvent).toBe(true)

      // Setting positions should not affect isCreatingEvent
      act(() => {
        result.current.setPosition('from', { x: 100, y: 100 })
        result.current.setPosition('to', { x: 200, y: 200 })
        result.current.setPathPreview([{ x: 100, y: 100 }])
      })

      expect(result.current.isCreatingEvent).toBe(true)
    })
  })

  describe('State Immutability', () => {
    it('should maintain immutability when updating positions', () => {
      const { result } = renderHook(() => useEventCreationStore())

      const initialState = result.current

      act(() => {
        result.current.setPosition('from', { x: 100, y: 100 })
      })

      const newState = result.current

      // Reference should be different (immutable update)
      expect(newState).not.toBe(initialState)
      expect(newState.fromPosition).toEqual({ x: 100, y: 100 })
    })

    it('should maintain immutability when updating path preview', () => {
      const { result } = renderHook(() => useEventCreationStore())

      const originalPath = result.current.pathPreview

      act(() => {
        result.current.setPathPreview([{ x: 100, y: 100 }, { x: 200, y: 200 }])
      })

      const newPath = result.current.pathPreview

      // References should be different (immutable update)
      expect(newPath).not.toBe(originalPath)
      expect(newPath).toHaveLength(2)
    })
  })
})
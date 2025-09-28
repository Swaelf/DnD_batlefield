import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useAnimationStore from '../animationStore'
import type { Position } from '@/types'

describe('animationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAnimationStore.setState({
      activePaths: []
    })
  })

  describe('Animation Path Management', () => {
    it('should initialize with empty active paths', () => {
      const { result } = renderHook(() => useAnimationStore())

      expect(result.current.activePaths).toEqual([])
    })

    it('should start animation for a token', () => {
      const { result } = renderHook(() => useAnimationStore())

      const from: Position = { x: 100, y: 100 }
      const to: Position = { x: 300, y: 300 }

      act(() => {
        result.current.startAnimation('token-1', from, to)
      })

      expect(result.current.activePaths).toHaveLength(1)
      expect(result.current.activePaths[0]).toEqual({
        tokenId: 'token-1',
        from,
        to,
        progress: 0,
        isAnimating: true
      })
    })

    it('should start multiple animations for different tokens', () => {
      const { result } = renderHook(() => useAnimationStore())

      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
        result.current.startAnimation('token-2', { x: 300, y: 300 }, { x: 400, y: 400 })
      })

      expect(result.current.activePaths).toHaveLength(2)
      expect(result.current.activePaths[0].tokenId).toBe('token-1')
      expect(result.current.activePaths[1].tokenId).toBe('token-2')
    })

    it('should replace existing animation for same token', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Start first animation
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
      })

      expect(result.current.activePaths).toHaveLength(1)
      expect(result.current.activePaths[0].to).toEqual({ x: 200, y: 200 })

      // Start new animation for same token - should replace
      act(() => {
        result.current.startAnimation('token-1', { x: 200, y: 200 }, { x: 400, y: 400 })
      })

      expect(result.current.activePaths).toHaveLength(1)
      expect(result.current.activePaths[0].to).toEqual({ x: 400, y: 400 })
      expect(result.current.activePaths[0].from).toEqual({ x: 200, y: 200 })
    })

    it('should end animation for specific token', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Start animations for multiple tokens
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
        result.current.startAnimation('token-2', { x: 300, y: 300 }, { x: 400, y: 400 })
      })

      expect(result.current.activePaths).toHaveLength(2)

      // End animation for token-1
      act(() => {
        result.current.endAnimation('token-1')
      })

      expect(result.current.activePaths).toHaveLength(1)
      expect(result.current.activePaths[0].tokenId).toBe('token-2')
    })

    it('should handle ending non-existent animation gracefully', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Try to end animation that doesn't exist
      expect(() => {
        act(() => {
          result.current.endAnimation('non-existent-token')
        })
      }).not.toThrow()

      expect(result.current.activePaths).toEqual([])
    })

    it('should clear all animations', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Start multiple animations
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
        result.current.startAnimation('token-2', { x: 300, y: 300 }, { x: 400, y: 400 })
        result.current.startAnimation('token-3', { x: 500, y: 500 }, { x: 600, y: 600 })
      })

      expect(result.current.activePaths).toHaveLength(3)

      // Clear all
      act(() => {
        result.current.clearAllPaths()
      })

      expect(result.current.activePaths).toEqual([])
    })
  })

  describe('Progress Updates', () => {
    it('should update progress for specific token', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Start animation
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 300, y: 300 })
      })

      expect(result.current.activePaths[0].progress).toBe(0)

      // Update progress
      act(() => {
        result.current.updateProgress('token-1', 0.5)
      })

      expect(result.current.activePaths[0].progress).toBe(0.5)

      // Update progress again
      act(() => {
        result.current.updateProgress('token-1', 0.8)
      })

      expect(result.current.activePaths[0].progress).toBe(0.8)
    })

    it('should update progress for specific token in multiple animations', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Start multiple animations
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
        result.current.startAnimation('token-2', { x: 300, y: 300 }, { x: 400, y: 400 })
      })

      // Update progress for token-2 only
      act(() => {
        result.current.updateProgress('token-2', 0.7)
      })

      expect(result.current.activePaths[0].progress).toBe(0) // token-1 unchanged
      expect(result.current.activePaths[1].progress).toBe(0.7) // token-2 updated
    })

    it('should handle progress update for non-existent token gracefully', () => {
      const { result } = renderHook(() => useAnimationStore())

      expect(() => {
        act(() => {
          result.current.updateProgress('non-existent-token', 0.5)
        })
      }).not.toThrow()
    })

    it('should handle progress values at boundaries', () => {
      const { result } = renderHook(() => useAnimationStore())

      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 300, y: 300 })
      })

      // Test 0 progress
      act(() => {
        result.current.updateProgress('token-1', 0)
      })
      expect(result.current.activePaths[0].progress).toBe(0)

      // Test 1 progress (complete)
      act(() => {
        result.current.updateProgress('token-1', 1)
      })
      expect(result.current.activePaths[0].progress).toBe(1)
    })
  })

  describe('Animation Lifecycle', () => {
    it('should handle complete animation lifecycle', () => {
      const { result } = renderHook(() => useAnimationStore())

      // 1. Start animation
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 300, y: 300 })
      })

      expect(result.current.activePaths).toHaveLength(1)
      expect(result.current.activePaths[0].progress).toBe(0)
      expect(result.current.activePaths[0].isAnimating).toBe(true)

      // 2. Update progress multiple times
      act(() => {
        result.current.updateProgress('token-1', 0.25)
      })
      expect(result.current.activePaths[0].progress).toBe(0.25)

      act(() => {
        result.current.updateProgress('token-1', 0.5)
      })
      expect(result.current.activePaths[0].progress).toBe(0.5)

      act(() => {
        result.current.updateProgress('token-1', 0.75)
      })
      expect(result.current.activePaths[0].progress).toBe(0.75)

      act(() => {
        result.current.updateProgress('token-1', 1)
      })
      expect(result.current.activePaths[0].progress).toBe(1)

      // 3. End animation
      act(() => {
        result.current.endAnimation('token-1')
      })

      expect(result.current.activePaths).toHaveLength(0)
    })

    it('should handle overlapping animations correctly', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Start first animation
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
        result.current.updateProgress('token-1', 0.5)
      })

      expect(result.current.activePaths[0].progress).toBe(0.5)

      // Start new animation for same token (should replace)
      act(() => {
        result.current.startAnimation('token-1', { x: 200, y: 200 }, { x: 400, y: 400 })
      })

      expect(result.current.activePaths).toHaveLength(1)
      expect(result.current.activePaths[0].progress).toBe(0) // Reset to 0 for new animation
      expect(result.current.activePaths[0].from).toEqual({ x: 200, y: 200 })
      expect(result.current.activePaths[0].to).toEqual({ x: 400, y: 400 })
    })
  })

  describe('State Queries', () => {
    it('should allow finding active path by token ID', () => {
      const { result } = renderHook(() => useAnimationStore())

      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
        result.current.startAnimation('token-2', { x: 300, y: 300 }, { x: 400, y: 400 })
        result.current.updateProgress('token-1', 0.3)
        result.current.updateProgress('token-2', 0.7)
      })

      const path1 = result.current.activePaths.find(p => p.tokenId === 'token-1')
      const path2 = result.current.activePaths.find(p => p.tokenId === 'token-2')

      expect(path1?.progress).toBe(0.3)
      expect(path2?.progress).toBe(0.7)
    })

    it('should show correct animation states', () => {
      const { result } = renderHook(() => useAnimationStore())

      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
      })

      const path = result.current.activePaths[0]
      expect(path.isAnimating).toBe(true)
      expect(path.tokenId).toBe('token-1')
      expect(path.from).toEqual({ x: 100, y: 100 })
      expect(path.to).toEqual({ x: 200, y: 200 })
    })
  })

  describe('Error Conditions', () => {
    it('should handle rapid animation starts and stops', () => {
      const { result } = renderHook(() => useAnimationStore())

      // Rapidly start and stop animations
      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
        result.current.endAnimation('token-1')
        result.current.startAnimation('token-1', { x: 200, y: 200 }, { x: 300, y: 300 })
        result.current.endAnimation('token-1')
      })

      expect(result.current.activePaths).toHaveLength(0)
    })

    it('should handle clearing empty paths list', () => {
      const { result } = renderHook(() => useAnimationStore())

      expect(() => {
        act(() => {
          result.current.clearAllPaths()
        })
      }).not.toThrow()

      expect(result.current.activePaths).toEqual([])
    })
  })

  describe('State Immutability', () => {
    it('should maintain immutability when updating progress', () => {
      const { result } = renderHook(() => useAnimationStore())

      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
      })

      const originalPaths = result.current.activePaths

      act(() => {
        result.current.updateProgress('token-1', 0.5)
      })

      const newPaths = result.current.activePaths

      // References should be different (immutable update)
      expect(newPaths).not.toBe(originalPaths)
      expect(newPaths[0].progress).toBe(0.5)
    })

    it('should maintain immutability when starting animations', () => {
      const { result } = renderHook(() => useAnimationStore())

      const originalPaths = result.current.activePaths

      act(() => {
        result.current.startAnimation('token-1', { x: 100, y: 100 }, { x: 200, y: 200 })
      })

      const newPaths = result.current.activePaths

      // References should be different (immutable update)
      expect(newPaths).not.toBe(originalPaths)
      expect(newPaths).toHaveLength(1)
    })
  })
})
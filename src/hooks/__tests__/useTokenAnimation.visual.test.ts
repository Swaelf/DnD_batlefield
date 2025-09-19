import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTokenAnimation } from '../useTokenAnimation'
import useRoundStore from '@/store/roundStore'
import useMapStore from '@/store/mapStore'
import Konva from 'konva'

/**
 * Visual Animation Test Suite
 *
 * These tests verify that token animations actually update visual positions
 * and that the fix for the 0,0 position issue is working correctly.
 */

// Mock the stores with proper Zustand store structure
const mockRoundStore = {
  timeline: {
    id: 'test-timeline',
    mapId: 'test-map',
    rounds: [
      {
        id: 'round-1',
        number: 1,
        timestamp: Date.now(),
        events: [] as any[],
        executed: false
      }
    ],
    currentRound: 1,
    isActive: true,
    history: []
  },
  currentRound: 1,
  isInCombat: false,
  animationSpeed: 1,
  getState: () => mockRoundStore,
  setState: vi.fn(),
  subscribe: vi.fn(),
  destroy: vi.fn()
}

const mockMapStore = {
  currentMap: {
    id: 'test-map',
    name: 'Test Map',
    width: 1920,
    height: 1080,
    grid: { size: 50, type: 'square', visible: true, snap: true, color: '#cccccc' },
    objects: [] as any[]
  },
  addSpellEffect: vi.fn(),
  deleteObject: vi.fn(),
  getState: () => mockMapStore,
  setState: vi.fn(),
  subscribe: vi.fn(),
  destroy: vi.fn()
}

vi.mock('@/store/roundStore', () => ({
  useRoundStore: mockRoundStore
}))

vi.mock('@/store/mapStore', () => ({
  useMapStore: mockMapStore
}))

describe('Token Animation Visual Updates', () => {
  let mockStage: any
  let mockTokenGroup: any
  let mockObjectLayer: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Create a realistic token group structure that matches the fixed ObjectsLayer
    mockTokenGroup = {
      id: vi.fn(() => 'token-1'),
      className: 'Group',

      // The fix ensures these return actual positions
      x: vi.fn(() => 250),
      y: vi.fn(() => 350),

      // Setters for animation
      position: vi.fn((pos?: { x: number; y: number }) => {
        if (pos) {
          mockTokenGroup.x = vi.fn(() => pos.x)
          mockTokenGroup.y = vi.fn(() => pos.y)
          mockTokenGroup._position = pos
        }
        return mockTokenGroup._position || { x: 250, y: 350 }
      }),

      opacity: vi.fn((val?: number) => {
        if (val !== undefined) {
          mockTokenGroup._opacity = val
        }
        return mockTokenGroup._opacity || 1
      }),

      _position: { x: 250, y: 350 },
      _opacity: 1
    }

    // Create mock layer structure
    const mockGroupWrapper = {
      className: 'Group',
      getChildren: vi.fn(() => [mockTokenGroup]),
      findOne: vi.fn((selector: string) => {
        const id = selector.replace('#', '')
        return id === 'token-1' ? mockTokenGroup : null
      })
    }

    mockObjectLayer = {
      getChildren: vi.fn(() => [mockGroupWrapper])
    }

    // Create mock stage
    mockStage = {
      getLayers: vi.fn(() => [mockObjectLayer, mockObjectLayer]),
      findOne: vi.fn((selector: string) => {
        const id = selector.replace('#', '')
        return id === 'token-1' ? mockTokenGroup : null
      }),
      find: vi.fn(() => [mockTokenGroup])
    }

    // Setup store mocks
    const mockMapStore = {
      currentMap: {
        id: 'map-1',
        objects: [
          {
            id: 'token-1',
            type: 'token',
            position: { x: 250, y: 350 },
            opacity: 1,
            name: 'Test Token'
          }
        ]
      },
      updateObjectPosition: vi.fn()
    }

    const mockRoundStore = {
      currentRound: 1,
      isInCombat: true,
      animationSpeed: 1,
      timeline: {
        mapId: 'map-1',
        rounds: [
          {
            number: 1,
            events: [] as any[],
            executed: false
          },
          {
            number: 2,
            events: [
              {
                id: 'event-1',
                roundNumber: 2,
                tokenId: 'token-1',
                type: 'move',
                data: {
                  type: 'move',
                  fromPosition: { x: 250, y: 350 },
                  toPosition: { x: 450, y: 150 },
                  duration: 1000,
                  easing: 'ease-in-out'
                },
                executed: false,
                order: 1
              }
            ],
            executed: false
          }
        ],
        isActive: true
      },
      updateEvent: vi.fn()
    }

    vi.mocked(useMapStore).mockReturnValue(mockMapStore as any)
    vi.mocked(useRoundStore).mockImplementation(() => mockRoundStore as any)
    vi.mocked(useRoundStore).getState = vi.fn(() => mockRoundStore as any)
    vi.mocked(useRoundStore).subscribe = vi.fn()

    // Mock Konva.Tween to simulate animation
    vi.mocked(Konva.Tween).mockImplementation((config: any) => {
      return {
        play: vi.fn(() => {
          // Simulate the animation updating the token position
          if (config.x !== undefined && config.y !== undefined) {
            mockTokenGroup.position({ x: config.x, y: config.y })
          }
          if (config.opacity !== undefined) {
            mockTokenGroup.opacity(config.opacity)
          }
          // Call onFinish to complete the animation
          if (config.onFinish) {
            setTimeout(config.onFinish, 0)
          }
        }),
        destroy: vi.fn(),
        _config: config
      } as any
    })
  })

  describe('Position Reading Fix', () => {
    it('should correctly read token position from Group with ID', async () => {
      const stageRef = { current: mockStage }
      const { result } = renderHook(() => useTokenAnimation(stageRef as any))

      await act(async () => {
        await result.current.executeRoundAnimations(2)
      })

      // Token should be found
      expect(mockTokenGroup.x).toHaveBeenCalled()
      expect(mockTokenGroup.y).toHaveBeenCalled()

      // Position should be read correctly (not 0,0)
      expect(mockTokenGroup.x()).toBe(250)
      expect(mockTokenGroup.y()).toBe(350)

      // Tween should be created with correct starting position
      expect(Konva.Tween).toHaveBeenCalledWith(
        expect.objectContaining({
          node: mockTokenGroup,
          x: 450,
          y: 150
        })
      )
    })

    it('should update visual position after animation', async () => {
      const stageRef = { current: mockStage }
      const { result } = renderHook(() => useTokenAnimation(stageRef as any))

      await act(async () => {
        await result.current.executeRoundAnimations(2)
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      // Visual position should be updated
      expect(mockTokenGroup.position()).toEqual({ x: 450, y: 150 })

      // Store should be updated with new position
      expect(useMapStore().updateObjectPosition).toHaveBeenCalledWith(
        'token-1',
        { x: 450, y: 150 }
      )
    })
  })

  describe('Animation Execution Verification', () => {
    it('should start from actual token position, not 0,0', async () => {
      const stageRef = { current: mockStage }

      // Track the positions during animation
      const positions: Array<{ x: number, y: number }> = []

      vi.mocked(Konva.Tween).mockImplementation((config: any) => {
        // Capture initial position
        positions.push({
          x: config.node.x(),
          y: config.node.y()
        })

        return {
          play: vi.fn(() => {
            // Update to target position
            mockTokenGroup.position({ x: config.x, y: config.y })
            positions.push({ x: config.x, y: config.y })

            if (config.onFinish) {
              setTimeout(config.onFinish, 0)
            }
          }),
          destroy: vi.fn()
        } as any
      })

      const { result } = renderHook(() => useTokenAnimation(stageRef as any))

      await act(async () => {
        await result.current.executeRoundAnimations(2)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      // Verify animation started from correct position (not 0,0)
      expect(positions[0]).toEqual({ x: 250, y: 350 })

      // Verify animation ended at target position
      expect(positions[1]).toEqual({ x: 450, y: 150 })
    })

    it('should handle appear animation with correct initial position', async () => {
      // Update event to appear type
      mockRoundStore.timeline!.rounds[1].events = [
        {
          id: 'event-appear',
          roundNumber: 2,
          tokenId: 'token-1',
          type: 'appear',
          data: {
            type: 'appear',
            position: { x: 300, y: 400 },
            fadeIn: true,
            duration: 500
          },
          executed: false,
          order: 1
        }
      ]

      const stageRef = { current: mockStage }
      const { result } = renderHook(() => useTokenAnimation(stageRef as any))

      await act(async () => {
        await result.current.executeRoundAnimations(2)
      })

      // Token should be positioned at appear location
      expect(mockTokenGroup.position).toHaveBeenCalledWith({ x: 300, y: 400 })

      // Token should start invisible for fade-in
      expect(mockTokenGroup.opacity).toHaveBeenCalledWith(0)

      // Tween should fade in to full opacity
      expect(Konva.Tween).toHaveBeenCalledWith(
        expect.objectContaining({
          opacity: 1,
          duration: 0.5
        })
      )
    })

    it('should handle disappear animation from current position', async () => {
      // Update event to disappear type
      mockRoundStore.timeline!.rounds[1].events = [
        {
          id: 'event-disappear',
          roundNumber: 2,
          tokenId: 'token-1',
          type: 'disappear',
          data: {
            type: 'disappear',
            fadeOut: true,
            duration: 500
          },
          executed: false,
          order: 1
        }
      ]

      const stageRef = { current: mockStage }
      const { result } = renderHook(() => useTokenAnimation(stageRef as any))

      await act(async () => {
        await result.current.executeRoundAnimations(2)
      })

      // Token position should not change
      expect(mockTokenGroup.position()).toEqual({ x: 250, y: 350 })

      // Tween should fade out to 0 opacity
      expect(Konva.Tween).toHaveBeenCalledWith(
        expect.objectContaining({
          opacity: 0,
          duration: 0.5
        })
      )
    })
  })

  describe('Multiple Token Animation', () => {
    it('should handle multiple tokens with correct positions', async () => {
      // Add second token
      const mockToken2 = {
        id: vi.fn(() => 'token-2'),
        className: 'Group',
        x: vi.fn(() => 500),
        y: vi.fn(() => 600),
        position: vi.fn((pos?: { x: number; y: number }) => {
          if (pos) {
            mockToken2.x = vi.fn(() => pos.x)
            mockToken2.y = vi.fn(() => pos.y)
            mockToken2._position = pos
          }
          return mockToken2._position || { x: 500, y: 600 }
        }),
        opacity: vi.fn(() => 1),
        _position: { x: 500, y: 600 }
      }

      // Update mock to return both tokens
      const mockGroupWrapper = {
        className: 'Group',
        getChildren: vi.fn(() => [mockTokenGroup, mockToken2]),
        findOne: vi.fn((selector: string) => {
          const id = selector.replace('#', '')
          if (id === 'token-1') return mockTokenGroup
          if (id === 'token-2') return mockToken2
          return null
        })
      }

      mockObjectLayer.getChildren.mockReturnValue([mockGroupWrapper])

      // Add events for both tokens
      const mockRoundStore = vi.mocked(useRoundStore).getState()
      mockRoundStore.timeline!.rounds[1].events = [
        {
          id: 'event-1',
          roundNumber: 2,
          tokenId: 'token-1',
          type: 'move',
          data: {
            type: 'move',
            fromPosition: { x: 250, y: 350 },
            toPosition: { x: 450, y: 150 },
            duration: 1000
          },
          executed: false,
          order: 1
        },
        {
          id: 'event-2',
          roundNumber: 2,
          tokenId: 'token-2',
          type: 'move',
          data: {
            type: 'move',
            fromPosition: { x: 500, y: 600 },
            toPosition: { x: 100, y: 100 },
            duration: 1000
          },
          executed: false,
          order: 2
        }
      ]

      mockMapStore.currentMap!.objects.push({
        id: 'token-2',
        type: 'token',
        position: { x: 500, y: 600 },
        opacity: 1,
        name: 'Token 2'
      })

      const stageRef = { current: mockStage }
      const { result } = renderHook(() => useTokenAnimation(stageRef as any))

      await act(async () => {
        await result.current.executeRoundAnimations(2)
      })

      // Both animations should be created with correct positions
      expect(Konva.Tween).toHaveBeenCalledTimes(2)

      // First token animation
      expect(Konva.Tween).toHaveBeenNthCalledWith(1,
        expect.objectContaining({
          node: mockTokenGroup,
          x: 450,
          y: 150
        })
      )

      // Second token animation
      expect(Konva.Tween).toHaveBeenNthCalledWith(2,
        expect.objectContaining({
          node: mockToken2,
          x: 100,
          y: 100
        })
      )

      // Both should start from correct positions (not 0,0)
      expect(mockTokenGroup.x()).toBe(250)
      expect(mockTokenGroup.y()).toBe(350)
      expect(mockToken2.x()).toBe(500)
      expect(mockToken2.y()).toBe(600)
    })
  })
})
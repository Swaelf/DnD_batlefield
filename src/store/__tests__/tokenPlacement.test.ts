import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useMapStore from '../mapStore'
import type { Token } from '@/types'

// Mock the layer store since it's used in object assignment
vi.mock('../layerStore', () => ({
  useLayerStore: {
    getState: () => ({
      activeLayerId: null,
      getDefaultLayerForObjectType: () => 'default-layer',
      getLayerById: () => ({ zIndex: 1 })
    })
  }
}))

// Mock the history store
vi.mock('../historyStore', () => ({
  useHistoryStore: {
    getState: () => ({
      pushState: vi.fn()
    })
  }
}))

describe('Token Placement Tests', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })
  })

  describe('Basic Token Placement', () => {
    it('should place token at specified position', () => {
      const { result } = renderHook(() => useMapStore())

      // Create a map first
      act(() => {
        result.current.createNewMap('Test Map')
      })

      const token: Token = {
        id: 'token-1',
        type: 'token',
        name: 'Test Token',
        position: { x: 200, y: 300 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(token)
      })

      const map = result.current.currentMap
      const placedToken = map?.objects.find(obj => obj.id === 'token-1') as Token

      expect(placedToken).toBeDefined()
      expect(placedToken.position).toEqual({ x: 200, y: 300 })
      expect(placedToken.type).toBe('token')
      expect(placedToken.size).toBe('medium')
    })

    it('should place multiple tokens at different positions', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const tokens: Token[] = [
        {
          id: 'token-1',
          type: 'token',
          name: 'Token 1',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          size: 'small',
          color: '#ff0000',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        },
        {
          id: 'token-2',
          type: 'token',
          name: 'Token 2',
          position: { x: 300, y: 400 },
          rotation: 45,
          layer: 2,
          size: 'large',
          color: '#00ff00',
          shape: 'square',
          opacity: 0.8,
          visible: true,
          locked: false
        }
      ]

      tokens.forEach(token => {
        act(() => {
          result.current.addObject(token)
        })
      })

      const map = result.current.currentMap
      const placedTokens = map?.objects.filter(obj => obj.type === 'token' && obj.id !== 'void-token') as Token[]

      expect(placedTokens).toHaveLength(2)
      expect(placedTokens[0].position).toEqual({ x: 100, y: 100 })
      expect(placedTokens[1].position).toEqual({ x: 300, y: 400 })
      expect(placedTokens[0].size).toBe('small')
      expect(placedTokens[1].size).toBe('large')
    })

    it('should handle token placement with different D&D sizes', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const sizes = ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'] as const

      sizes.forEach((size, index) => {
        const token: Token = {
          id: `token-${size}`,
          type: 'token',
          name: `${size} Token`,
          position: { x: index * 100, y: 100 },
          rotation: 0,
          layer: 1,
          size,
          color: '#0000ff',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        }

        act(() => {
          result.current.addObject(token)
        })
      })

      const map = result.current.currentMap
      const placedTokens = map?.objects.filter(obj => obj.type === 'token' && obj.id !== 'void-token') as Token[]

      expect(placedTokens).toHaveLength(6)

      sizes.forEach((size, index) => {
        const token = placedTokens[index]
        expect(token.size).toBe(size)
        expect(token.position.x).toBe(index * 100)
      })
    })
  })

  describe('Token Position Updates', () => {
    it('should update token position correctly', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'token-1',
          type: 'token',
          name: 'Test Token',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          size: 'medium',
          color: '#ff0000',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        } as Token)
      })

      const newPosition = { x: 250, y: 350 }

      act(() => {
        result.current.updateObjectPosition('token-1', newPosition)
      })

      const map = result.current.currentMap
      const updatedToken = map?.objects.find(obj => obj.id === 'token-1') as Token

      expect(updatedToken.position).toEqual(newPosition)
    })

    it('should batch update multiple token positions', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'token-1',
          type: 'token',
          name: 'Token 1',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          size: 'medium',
          color: '#ff0000',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        } as Token)
        result.current.addObject({
          id: 'token-2',
          type: 'token',
          name: 'Token 2',
          position: { x: 200, y: 200 },
          rotation: 0,
          layer: 1,
          size: 'medium',
          color: '#00ff00',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        } as Token)
      })

      const deltaPosition = { x: 50, y: -25 }

      act(() => {
        result.current.batchUpdatePosition(['token-1', 'token-2'], deltaPosition)
      })

      const map = result.current.currentMap
      const token1 = map?.objects.find(obj => obj.id === 'token-1') as Token
      const token2 = map?.objects.find(obj => obj.id === 'token-2') as Token

      expect(token1.position).toEqual({ x: 150, y: 75 })
      expect(token2.position).toEqual({ x: 250, y: 175 })
    })

    it('should handle position updates for non-existent tokens gracefully', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      expect(() => {
        act(() => {
          result.current.updateObjectPosition('non-existent-token', { x: 100, y: 100 })
        })
      }).not.toThrow()

      // Map should still be valid
      expect(result.current.currentMap).toBeDefined()
    })
  })

  describe('Token Duplication with Position Offset', () => {
    it('should duplicate token with default position offset', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'original-token',
          type: 'token',
          name: 'Original Token',
          position: { x: 100, y: 100 },
          rotation: 0,
          layer: 1,
          size: 'medium',
          color: '#ff0000',
          shape: 'circle',
          opacity: 1,
          visible: true,
          locked: false
        } as Token)
        result.current.selectObject('original-token')
      })

      act(() => {
        result.current.duplicateSelected()
      })

      const map = result.current.currentMap
      const tokens = map?.objects.filter(obj => obj.type === 'token' && obj.id !== 'void-token') as Token[]

      expect(tokens).toHaveLength(2)

      const originalToken = tokens.find(t => t.id === 'original-token')
      const duplicatedToken = tokens.find(t => t.id !== 'original-token')

      expect(originalToken?.position).toEqual({ x: 100, y: 100 })
      expect(duplicatedToken?.position).toEqual({ x: 150, y: 150 }) // Default offset is +50, +50
      expect(duplicatedToken?.name).toBe('Original Token')
      expect(duplicatedToken?.size).toBe('medium')
    })

    it('should duplicate token with custom position offset', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
        result.current.addObject({
          id: 'original-token',
          type: 'token',
          name: 'Original Token',
          position: { x: 200, y: 300 },
          rotation: 0,
          layer: 1,
          size: 'large',
          color: '#00ff00',
          shape: 'square',
          opacity: 1,
          visible: true,
          locked: false
        } as Token)
        result.current.selectObject('original-token')
      })

      const customOffset = { x: 25, y: -10 }

      act(() => {
        result.current.duplicateSelected(customOffset)
      })

      const map = result.current.currentMap
      const tokens = map?.objects.filter(obj => obj.type === 'token' && obj.id !== 'void-token') as Token[]

      expect(tokens).toHaveLength(2)

      const duplicatedToken = tokens.find(t => t.id !== 'original-token')
      expect(duplicatedToken?.position).toEqual({ x: 225, y: 290 })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle tokens with zero/negative positions', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const token: Token = {
        id: 'edge-token',
        type: 'token',
        name: 'Edge Token',
        position: { x: 0, y: -50 },
        rotation: 0,
        layer: 1,
        size: 'small',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(token)
      })

      const map = result.current.currentMap
      const placedToken = map?.objects.find(obj => obj.id === 'edge-token') as Token

      expect(placedToken.position).toEqual({ x: 0, y: -50 })
    })

    it('should handle tokens with very large positions', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const token: Token = {
        id: 'large-pos-token',
        type: 'token',
        name: 'Large Position Token',
        position: { x: 10000, y: 8000 },
        rotation: 0,
        layer: 1,
        size: 'huge',
        color: '#0000ff',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false
      }

      act(() => {
        result.current.addObject(token)
      })

      const map = result.current.currentMap
      const placedToken = map?.objects.find(obj => obj.id === 'large-pos-token') as Token

      expect(placedToken.position).toEqual({ x: 10000, y: 8000 })
    })

    it('should handle token placement on null map gracefully', () => {
      const { result } = renderHook(() => useMapStore())

      const token: Token = {
        id: 'token-on-null-map',
        type: 'token',
        name: 'Token',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false
      }

      expect(() => {
        act(() => {
          result.current.addObject(token)
        })
      }).not.toThrow()

      expect(result.current.currentMap).toBeNull()
    })
  })

  describe('Token Properties Validation', () => {
    it('should maintain token properties after placement', () => {
      const { result } = renderHook(() => useMapStore())

      act(() => {
        result.current.createNewMap('Test Map')
      })

      const token: Token = {
        id: 'property-token',
        type: 'token',
        name: 'Property Test Token',
        position: { x: 100, y: 200 },
        rotation: 90,
        layer: 3,
        size: 'large',
        color: '#ff00ff',
        shape: 'square',
        opacity: 0.7,
        visible: true,
        locked: true,
        image: 'test-image.png',
        currentHP: 50,
        maxHP: 100,
        hpBarColor: '#00ff00',
        labelPosition: 'bottom',
        showLabel: true
      }

      act(() => {
        result.current.addObject(token)
      })

      const map = result.current.currentMap
      const placedToken = map?.objects.find(obj => obj.id === 'property-token') as Token

      expect(placedToken.name).toBe('Property Test Token')
      expect(placedToken.rotation).toBe(90)
      expect(placedToken.size).toBe('large')
      expect(placedToken.color).toBe('#ff00ff')
      expect(placedToken.shape).toBe('square')
      expect(placedToken.opacity).toBe(0.7)
      expect(placedToken.locked).toBe(true)
      expect(placedToken.image).toBe('test-image.png')
      expect(placedToken.currentHP).toBe(50)
      expect(placedToken.maxHP).toBe(100)
      expect(placedToken.hpBarColor).toBe('#00ff00')
      expect(placedToken.labelPosition).toBe('bottom')
      expect(placedToken.showLabel).toBe(true)
    })
  })
})
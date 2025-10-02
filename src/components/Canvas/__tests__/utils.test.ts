import { describe, it, expect } from 'vitest'
import {
  getTokenPixelSize,
  getObjectBounds,
  objectIntersectsRect,
  findTokenAtPosition,
  isDrawingTool
} from '../utils'
import type { Token, Shape } from '@/types'

describe('Canvas Utils', () => {
  describe('getTokenPixelSize', () => {
    const gridSize = 50

    it('should return correct size for tiny tokens', () => {
      expect(getTokenPixelSize('tiny', gridSize)).toBe(25)
    })

    it('should return correct size for small tokens', () => {
      expect(getTokenPixelSize('small', gridSize)).toBe(50)
    })

    it('should return correct size for medium tokens', () => {
      expect(getTokenPixelSize('medium', gridSize)).toBe(50)
    })

    it('should return correct size for large tokens', () => {
      expect(getTokenPixelSize('large', gridSize)).toBe(100)
    })

    it('should return correct size for huge tokens', () => {
      expect(getTokenPixelSize('huge', gridSize)).toBe(150)
    })

    it('should return correct size for gargantuan tokens', () => {
      expect(getTokenPixelSize('gargantuan', gridSize)).toBe(200)
    })

    it('should scale with different grid sizes', () => {
      expect(getTokenPixelSize('large', 100)).toBe(200)
      expect(getTokenPixelSize('medium', 25)).toBe(25)
    })
  })

  describe('getObjectBounds', () => {
    const gridSize = 50

    it('should calculate bounds for medium token', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Test Token'
      }

      const bounds = getObjectBounds(token, gridSize)
      expect(bounds).toEqual({
        x: 75,  // 100 - 25
        y: 75,  // 100 - 25
        width: 50,
        height: 50
      })
    })

    it('should calculate bounds for large token', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 200, y: 200 },
        rotation: 0,
        layer: 1,
        size: 'large',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Large Token'
      }

      const bounds = getObjectBounds(token, gridSize)
      expect(bounds).toEqual({
        x: 150,  // 200 - 50
        y: 150,  // 200 - 50
        width: 100,
        height: 100
      })
    })

    it('should calculate bounds for rectangle shape', () => {
      const shape: Shape = {
        id: 'shape-1',
        type: 'shape',
        shapeType: 'rectangle',
        position: { x: 50, y: 50 },
        rotation: 0,
        layer: 1,
        width: 100,
        height: 75,
        fill: '#ff0000',
        fillColor: '#ff0000',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        visible: true,
        locked: false
      }

      const bounds = getObjectBounds(shape, gridSize)
      expect(bounds).toEqual({
        x: 50,
        y: 50,
        width: 100,
        height: 75
      })
    })

    it('should calculate bounds for circle shape', () => {
      const shape: Shape = {
        id: 'shape-1',
        type: 'shape',
        shapeType: 'circle',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        radius: 30,
        fill: '#ff0000',
        fillColor: '#ff0000',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        visible: true,
        locked: false
      }

      const bounds = getObjectBounds(shape, gridSize)
      expect(bounds).toEqual({
        x: 70,   // 100 - 30
        y: 70,   // 100 - 30
        width: 60,
        height: 60
      })
    })

    it('should calculate bounds for line shape', () => {
      const shape: Shape = {
        id: 'shape-1',
        type: 'shape',
        shapeType: 'line',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1,
        points: [10, 10, 50, 30, 20, 60],
        fill: 'transparent',
        fillColor: 'transparent',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        visible: true,
        locked: false
      }

      const bounds = getObjectBounds(shape, gridSize)
      expect(bounds).toEqual({
        x: 10,   // min x
        y: 10,   // min y
        width: 40,  // 50 - 10
        height: 50  // 60 - 10
      })
    })

    it('should return null for line with insufficient points', () => {
      const shape: Shape = {
        id: 'shape-1',
        type: 'shape',
        shapeType: 'line',
        position: { x: 0, y: 0 },
        rotation: 0,
        layer: 1,
        points: [10],
        fill: 'transparent',
        fillColor: 'transparent',
        stroke: '#000000',
        strokeColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        visible: true,
        locked: false
      }

      const bounds = getObjectBounds(shape, gridSize)
      expect(bounds).toBeNull()
    })
  })

  describe('objectIntersectsRect', () => {
    const gridSize = 50

    it('should detect intersection when token is inside rectangle', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Test Token'
      }

      const rect = { x: 50, y: 50, width: 100, height: 100 }
      expect(objectIntersectsRect(token, rect, gridSize)).toBe(true)
    })

    it('should detect no intersection when token is outside rectangle', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 200, y: 200 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Test Token'
      }

      const rect = { x: 0, y: 0, width: 100, height: 100 }
      expect(objectIntersectsRect(token, rect, gridSize)).toBe(false)
    })

    it('should detect partial intersection', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 90, y: 90 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Test Token'
      }

      const rect = { x: 0, y: 0, width: 100, height: 100 }
      expect(objectIntersectsRect(token, rect, gridSize)).toBe(true)
    })
  })

  describe('findTokenAtPosition', () => {
    const gridSize = 50

    it('should find token at exact center', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Test Token'
      }

      const found = findTokenAtPosition({ x: 100, y: 100 }, [token], gridSize)
      expect(found).toEqual(token)
    })

    it('should find token within bounds', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Test Token'
      }

      const found = findTokenAtPosition({ x: 90, y: 110 }, [token], gridSize)
      expect(found).toEqual(token)
    })

    it('should return null when no token at position', () => {
      const token: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        size: 'medium',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Test Token'
      }

      const found = findTokenAtPosition({ x: 200, y: 200 }, [token], gridSize)
      expect(found).toBeNull()
    })

    it('should find first matching token with overlaps', () => {
      const token1: Token = {
        id: 'token-1',
        type: 'token',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 1,
        size: 'large',
        color: '#ff0000',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Large Token'
      }

      const token2: Token = {
        id: 'token-2',
        type: 'token',
        position: { x: 110, y: 110 },
        rotation: 0,
        layer: 2,
        size: 'medium',
        color: '#00ff00',
        shape: 'circle',
        opacity: 1,
        visible: true,
        locked: false,
        name: 'Medium Token'
      }

      // Position is in both tokens, should return first one
      const found = findTokenAtPosition({ x: 105, y: 105 }, [token1, token2], gridSize)
      expect(found).toEqual(token1)
    })
  })

  describe('isDrawingTool', () => {
    it('should return true for rectangle tool', () => {
      expect(isDrawingTool('rectangle')).toBe(true)
    })

    it('should return true for circle tool', () => {
      expect(isDrawingTool('circle')).toBe(true)
    })

    it('should return true for polygon tool', () => {
      expect(isDrawingTool('polygon')).toBe(true)
    })

    it('should return true for line tool', () => {
      expect(isDrawingTool('line')).toBe(true)
    })

    it('should return false for select tool', () => {
      expect(isDrawingTool('select')).toBe(false)
    })

    it('should return false for token tool', () => {
      expect(isDrawingTool('token')).toBe(false)
    })

    it('should return false for pan tool', () => {
      expect(isDrawingTool('pan')).toBe(false)
    })
  })
})

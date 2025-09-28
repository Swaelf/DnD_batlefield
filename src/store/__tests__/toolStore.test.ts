import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import useToolStore from '../toolStore'

describe('toolStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToolStore.setState({
      currentTool: 'select',
      previousTool: 'select',
      drawingState: {
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
        points: []
      },
      fillColor: '#3B82F6',
      strokeColor: '#1F2937',
      strokeWidth: 2,
      opacity: 1,
      tokenTemplate: null,
      staticObjectTemplate: null,
      spellEffectTemplate: null
    })
  })

  describe('Tool Management', () => {
    it('should initialize with select tool', () => {
      const { result } = renderHook(() => useToolStore())

      expect(result.current.currentTool).toBe('select')
      expect(result.current.previousTool).toBe('select')
    })

    it('should change current tool and update previous tool', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setTool('token')
      })

      expect(result.current.currentTool).toBe('token')
      expect(result.current.previousTool).toBe('select')
    })

    it('should reset drawing state when changing tools', () => {
      const { result } = renderHook(() => useToolStore())

      // Set some drawing state
      act(() => {
        result.current.setDrawingState({
          isDrawing: true,
          startPoint: { x: 10, y: 20 },
          currentPoint: { x: 30, y: 40 },
          points: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
        })
      })

      // Change tool - should reset drawing state
      act(() => {
        result.current.setTool('rectangle')
      })

      expect(result.current.drawingState).toEqual({
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
        points: []
      })
    })

    it('should not change previous tool if setting same tool', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setTool('token')
      })

      const previousAfterFirstChange = result.current.previousTool

      act(() => {
        result.current.setTool('token') // Same tool
      })

      expect(result.current.currentTool).toBe('token')
      expect(result.current.previousTool).toBe(previousAfterFirstChange)
    })

    it('should swap current and previous tools', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setTool('rectangle')
      })

      expect(result.current.currentTool).toBe('rectangle')
      expect(result.current.previousTool).toBe('select')

      act(() => {
        result.current.setPreviousTool()
      })

      expect(result.current.currentTool).toBe('select')
      expect(result.current.previousTool).toBe('rectangle')
    })
  })

  describe('Drawing State Management', () => {
    it('should update drawing state', () => {
      const { result } = renderHook(() => useToolStore())

      const newDrawingState = {
        isDrawing: true,
        startPoint: { x: 100, y: 200 },
        currentPoint: { x: 150, y: 250 }
      }

      act(() => {
        result.current.setDrawingState(newDrawingState)
      })

      expect(result.current.drawingState).toEqual({
        isDrawing: true,
        startPoint: { x: 100, y: 200 },
        currentPoint: { x: 150, y: 250 },
        points: [] // Should preserve existing properties
      })
    })

    it('should partially update drawing state', () => {
      const { result } = renderHook(() => useToolStore())

      // Set initial state
      act(() => {
        result.current.setDrawingState({
          isDrawing: true,
          startPoint: { x: 10, y: 20 },
          points: [{ x: 10, y: 20 }]
        })
      })

      // Partial update
      act(() => {
        result.current.setDrawingState({
          currentPoint: { x: 30, y: 40 }
        })
      })

      expect(result.current.drawingState).toEqual({
        isDrawing: true,
        startPoint: { x: 10, y: 20 },
        currentPoint: { x: 30, y: 40 },
        points: [{ x: 10, y: 20 }]
      })
    })

    it('should reset drawing state', () => {
      const { result } = renderHook(() => useToolStore())

      // Set some drawing state
      act(() => {
        result.current.setDrawingState({
          isDrawing: true,
          startPoint: { x: 10, y: 20 },
          currentPoint: { x: 30, y: 40 },
          points: [{ x: 10, y: 20 }, { x: 30, y: 40 }]
        })
      })

      act(() => {
        result.current.resetDrawingState()
      })

      expect(result.current.drawingState).toEqual({
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
        points: []
      })
    })
  })

  describe('Style Properties', () => {
    it('should update fill color', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setFillColor('#FF0000')
      })

      expect(result.current.fillColor).toBe('#FF0000')
    })

    it('should update stroke color', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setStrokeColor('#00FF00')
      })

      expect(result.current.strokeColor).toBe('#00FF00')
    })

    it('should update stroke width', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setStrokeWidth(5)
      })

      expect(result.current.strokeWidth).toBe(5)
    })

    it('should update opacity', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setOpacity(0.5)
      })

      expect(result.current.opacity).toBe(0.5)
    })
  })

  describe('Template Management', () => {
    it('should set token template', () => {
      const { result } = renderHook(() => useToolStore())

      const tokenTemplate = {
        name: 'Goblin',
        size: 'small' as const,
        color: '#ff0000',
        shape: 'circle' as const
      }

      act(() => {
        result.current.setTokenTemplate(tokenTemplate)
      })

      expect(result.current.tokenTemplate).toEqual(tokenTemplate)
    })

    it('should set static object template', () => {
      const { result } = renderHook(() => useToolStore())

      const staticTemplate = {
        id: 'wall-1',
        name: 'Wall',
        category: 'structures' as const,
        icon: React.createElement('div'),
        width: 100,
        height: 20,
        fillColor: '#666666',
        strokeColor: '#333333',
        strokeWidth: 2,
        shape: 'rectangle' as const
      }

      act(() => {
        result.current.setStaticObjectTemplate(staticTemplate)
      })

      expect(result.current.staticObjectTemplate).toEqual(staticTemplate)
    })

    it('should set spell effect template', () => {
      const { result } = renderHook(() => useToolStore())

      const spellTemplate = {
        id: 'fireball-1',
        name: 'Fireball',
        category: 'area' as const,
        shape: 'sphere' as const,
        icon: React.createElement('div'),
        color: '#FF4500',
        opacity: 0.7,
        size: {
          radius: 20
        },
        description: 'A burst of fire'
      }

      act(() => {
        result.current.setSpellEffectTemplate(spellTemplate)
      })

      expect(result.current.spellEffectTemplate).toEqual(spellTemplate)
    })

    it('should clear templates by setting to null', () => {
      const { result } = renderHook(() => useToolStore())

      // Set templates
      act(() => {
        result.current.setTokenTemplate({ name: 'Test', size: 'medium', color: '#fff', shape: 'circle' })
        result.current.setStaticObjectTemplate({
          id: 'test-wall',
          name: 'Test Wall',
          category: 'structures',
          icon: React.createElement('div'),
          width: 100,
          height: 20,
          fillColor: '#666',
          strokeColor: '#333',
          strokeWidth: 2,
          shape: 'rectangle'
        })
        result.current.setSpellEffectTemplate({
          id: 'test-spell',
          name: 'Test',
          category: 'area',
          shape: 'sphere',
          icon: React.createElement('div'),
          color: '#fff',
          opacity: 0.5,
          size: { radius: 10 },
          description: 'Test spell effect'
        })
      })

      // Clear templates
      act(() => {
        result.current.setTokenTemplate(null)
        result.current.setStaticObjectTemplate(null)
        result.current.setSpellEffectTemplate(null)
      })

      expect(result.current.tokenTemplate).toBeNull()
      expect(result.current.staticObjectTemplate).toBeNull()
      expect(result.current.spellEffectTemplate).toBeNull()
    })
  })

  describe('Tool Workflows', () => {
    it('should handle typical rectangle drawing workflow', () => {
      const { result } = renderHook(() => useToolStore())

      // Switch to rectangle tool
      act(() => {
        result.current.setTool('rectangle')
      })

      expect(result.current.currentTool).toBe('rectangle')
      expect(result.current.drawingState.isDrawing).toBe(false)

      // Start drawing
      act(() => {
        result.current.setDrawingState({
          isDrawing: true,
          startPoint: { x: 100, y: 100 }
        })
      })

      // Update current point during drag
      act(() => {
        result.current.setDrawingState({
          currentPoint: { x: 200, y: 150 }
        })
      })

      expect(result.current.drawingState).toEqual({
        isDrawing: true,
        startPoint: { x: 100, y: 100 },
        currentPoint: { x: 200, y: 150 },
        points: []
      })

      // Finish drawing
      act(() => {
        result.current.resetDrawingState()
      })

      expect(result.current.drawingState.isDrawing).toBe(false)
    })

    it('should handle polygon drawing workflow', () => {
      const { result } = renderHook(() => useToolStore())

      act(() => {
        result.current.setTool('polygon')
      })

      // Start polygon
      act(() => {
        result.current.setDrawingState({
          isDrawing: true,
          points: [{ x: 100, y: 100 }]
        })
      })

      // Add more points
      act(() => {
        result.current.setDrawingState({
          points: [
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 150, y: 200 }
          ]
        })
      })

      expect(result.current.drawingState.points).toHaveLength(3)
      expect(result.current.drawingState.isDrawing).toBe(true)
    })

    it('should handle tool switching during drawing', () => {
      const { result } = renderHook(() => useToolStore())

      // Start drawing with one tool
      act(() => {
        result.current.setTool('circle')
        result.current.setDrawingState({
          isDrawing: true,
          startPoint: { x: 50, y: 50 },
          currentPoint: { x: 100, y: 100 }
        })
      })

      // Switch tools mid-drawing
      act(() => {
        result.current.setTool('select')
      })

      // Drawing state should be reset
      expect(result.current.drawingState).toEqual({
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
        points: []
      })
      expect(result.current.currentTool).toBe('select')
      expect(result.current.previousTool).toBe('circle')
    })
  })

  describe('State Immutability', () => {
    it('should maintain immutability when updating drawing state', () => {
      const { result } = renderHook(() => useToolStore())

      const originalDrawingState = result.current.drawingState

      act(() => {
        result.current.setDrawingState({
          isDrawing: true,
          startPoint: { x: 10, y: 20 }
        })
      })

      const newDrawingState = result.current.drawingState

      // References should be different (immutable update)
      expect(newDrawingState).not.toBe(originalDrawingState)
      expect(newDrawingState.isDrawing).toBe(true)
      expect(newDrawingState.startPoint).toEqual({ x: 10, y: 20 })
    })
  })
})
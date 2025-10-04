import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { ToolStore } from '../types'

const useToolStore = create<ToolStore>()(
  immer((set) => ({
    currentTool: 'select',
    previousTool: 'select',
    drawingState: {
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      points: [],
    },
    fillColor: '#3B82F6', // Blue-500
    strokeColor: '#1F2937', // Gray-800
    strokeWidth: 2,
    opacity: 1,
    tokenTemplate: null,
    staticObjectTemplate: null,
    staticEffectTemplate: null,
    measurementPoints: [],

    // Category state
    activeCategory: null,
    expandedCategories: new Set(['drawing', 'objects']), // Start with drawing and objects expanded

    // Terrain tool state
    terrainBrushSize: 10, // 10px default brush
    terrainColor: '#6B7280', // Stone gray default
    terrainOpacity: 0.8,

    // Background editing mode
    isBackgroundEditMode: false,

    setTool: (tool) => set((state) => {
      if (tool !== state.currentTool) {
        state.previousTool = state.currentTool
        state.currentTool = tool
        // Reset drawing state when changing tools
        state.drawingState = {
          isDrawing: false,
          startPoint: null,
          currentPoint: null,
          points: [],
        }
        // Clear measurement points when switching away from measure tool
        if (state.currentTool !== 'measure') {
          state.measurementPoints = []
        }
      }
    }),

    setPreviousTool: () => set((state) => {
      const temp = state.currentTool
      state.currentTool = state.previousTool
      state.previousTool = temp
    }),

    setDrawingState: (newState) => set((state) => {
      Object.assign(state.drawingState, newState)
    }),

    setFillColor: (color) => set((state) => {
      state.fillColor = color
    }),

    setStrokeColor: (color) => set((state) => {
      state.strokeColor = color
    }),

    setStrokeWidth: (width) => set((state) => {
      state.strokeWidth = width
    }),

    setOpacity: (opacity) => set((state) => {
      state.opacity = opacity
    }),

    resetDrawingState: () => set((state) => {
      state.drawingState = {
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
        points: [],
      }
    }),

    setTokenTemplate: (template) => set((state) => {
      state.tokenTemplate = template
    }),

    setStaticObjectTemplate: (template) => set((state) => {
      state.staticObjectTemplate = template
    }),

    setStaticEffectTemplate: (template) => set((state) => {
      state.staticEffectTemplate = template
    }),

    addMeasurementPoint: (point) => set((state) => {
      state.measurementPoints.push(point)
    }),

    clearMeasurementPoints: () => set((state) => {
      state.measurementPoints = []
    }),

    // Category actions
    setActiveCategory: (category) => set((state) => {
      state.activeCategory = category
    }),

    toggleCategoryExpanded: (category) => set((state) => {
      if (state.expandedCategories.has(category)) {
        state.expandedCategories.delete(category)
      } else {
        state.expandedCategories.add(category)
      }
    }),

    // Terrain tool actions
    setTerrainBrushSize: (size) => set((state) => {
      state.terrainBrushSize = Math.max(1, Math.min(100, size)) // Clamp to 1-100px
    }),

    setTerrainColor: (color) => set((state) => {
      state.terrainColor = color
    }),

    setTerrainOpacity: (opacity) => set((state) => {
      state.terrainOpacity = Math.max(0, Math.min(1, opacity)) // Clamp to 0-1
    }),

    // Background editing mode actions
    toggleBackgroundEditMode: () => set((state) => {
      state.isBackgroundEditMode = !state.isBackgroundEditMode
      // When entering background mode, switch to terrainBrush by default
      if (state.isBackgroundEditMode) {
        state.previousTool = state.currentTool
        state.currentTool = 'terrainBrush'
      } else {
        // When exiting, restore previous tool
        state.currentTool = state.previousTool
      }
    }),

    setBackgroundEditMode: (enabled) => set((state) => {
      state.isBackgroundEditMode = enabled
      if (enabled) {
        state.previousTool = state.currentTool
        state.currentTool = 'terrainBrush'
      } else {
        state.currentTool = state.previousTool
      }
    }),
  }))
)

export default useToolStore
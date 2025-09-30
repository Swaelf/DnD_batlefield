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
  }))
)

export default useToolStore
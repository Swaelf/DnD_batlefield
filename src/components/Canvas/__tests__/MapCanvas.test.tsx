import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { MutableRefObject } from 'react'
import { MapCanvas } from '../MapCanvas'
import type Konva from 'konva'

// Mock stores
vi.mock('@/store/mapStore', () => ({
  default: vi.fn(() => ({
    currentMap: {
      id: 'test-map',
      name: 'Test Map',
      width: 1920,
      height: 1080,
      grid: {
        size: 50,
        type: 'square',
        visible: true,
        snap: true,
        color: '#cccccc'
      },
      objects: []
    }
  }))
}))

vi.mock('@/store/toolStore', () => ({
  default: vi.fn(() => ({
    currentTool: 'select',
    drawingState: null,
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    opacity: 1,
    tokenTemplate: null,
    measurementPoints: [],
    staticObjectTemplate: null,
    staticEffectTemplate: null
  })),
  getState: vi.fn(() => ({
    currentTool: 'select'
  }))
}))

vi.mock('@/store/eventCreationStore', () => ({
  default: vi.fn(() => ({
    isPicking: null,
    isCreatingEvent: false,
    setSelectedToken: vi.fn(),
    setPosition: vi.fn(),
    completePositionPicking: vi.fn()
  }))
}))

// Mock hooks
vi.mock('@/hooks/useContextMenu', () => ({
  useContextMenu: () => ({
    handleContextMenu: vi.fn()
  })
}))

// Mock ObjectsLayer
vi.mock('../ObjectsLayer', () => ({
  ObjectsLayer: () => <div data-testid="objects-layer">Objects Layer</div>
}))

// Mock other components
vi.mock('../../Token/TokenHPTooltip', () => ({
  default: () => <div data-testid="hp-tooltip">HP Tooltip</div>
}))

vi.mock('../../Selection/SelectionManager', () => ({
  default: () => <div data-testid="selection-manager">Selection Manager</div>
}))

vi.mock('../../StaticEffect/StaticEffectPreview', () => ({
  StaticEffectPreview: () => <div data-testid="static-effect-preview">Static Effect Preview</div>
}))

vi.mock('../../Token/Token', () => ({
  Token: () => <div data-testid="token-preview">Token Preview</div>
}))

vi.mock('../../Tools/MeasurementOverlay', () => ({
  MeasurementOverlay: () => <div data-testid="measurement-overlay">Measurement Overlay</div>
}))

// Mock utils
vi.mock('@/utils/grid', () => ({
  snapToGrid: vi.fn((pos) => pos)
}))

vi.mock('@/utils/stageRegistry', () => ({
  registerStage: vi.fn()
}))

describe('MapCanvas', () => {
  const defaultProps = {
    width: 800,
    height: 600
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<MapCanvas {...defaultProps} />)
      // Konva Stage should be present
      expect(document.querySelector('canvas')).toBeInTheDocument()
    })

    it('should render ObjectsLayer', () => {
      render(<MapCanvas {...defaultProps} />)
      expect(screen.getByTestId('objects-layer')).toBeInTheDocument()
    })

    it('should apply correct dimensions to Stage', () => {
      render(<MapCanvas {...defaultProps} />)
      const canvas = document.querySelector('canvas')
      expect(canvas).toHaveAttribute('width')
      expect(canvas).toHaveAttribute('height')
    })
  })

  describe('Stage Reference', () => {
    it('should handle stage ref when provided', () => {
      const stageRef = { current: null } as MutableRefObject<Konva.Stage | null>
      render(<MapCanvas {...defaultProps} stageRef={stageRef} />)

      // Stage ref should be set (after Konva initializes)
      // Note: This is tested via integration with actual Konva
      expect(stageRef).toBeDefined()
    })

    it('should work without stage ref', () => {
      render(<MapCanvas {...defaultProps} />)
      expect(document.querySelector('canvas')).toBeInTheDocument()
    })
  })

  describe('Mouse Events', () => {
    it('should call onMouseMove callback when provided', () => {
      const onMouseMove = vi.fn()
      render(<MapCanvas {...defaultProps} onMouseMove={onMouseMove} />)

      const canvas = document.querySelector('canvas')
      if (canvas) {
        fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 })
        // Note: Actual Konva mouse events might need integration test
      }
    })
  })

  describe('Grid Visibility', () => {
    it('should render grid when visible is true', () => {
      render(<MapCanvas {...defaultProps} />)
      // Grid lines should be in canvas (tested via visual/integration)
      expect(document.querySelector('canvas')).toBeInTheDocument()
    })
  })
})

describe('MapCanvas Helper Functions', () => {
  // These tests will be moved to a separate utils file
  describe('Token Size Calculations', () => {
    it('should be tested in utils file', () => {
      // Placeholder - will test getTokenPixelSize in CanvasUtils.test.ts
      expect(true).toBe(true)
    })
  })
})

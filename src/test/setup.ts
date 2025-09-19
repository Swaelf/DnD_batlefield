import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Konva for testing
vi.mock('konva', () => ({
  default: {
    Stage: vi.fn().mockImplementation(() => ({
      getLayers: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      container: vi.fn(() => document.createElement('div')),
      getAbsoluteTransform: vi.fn(() => ({
        copy: vi.fn(() => ({
          invert: vi.fn(() => ({
            point: vi.fn((p) => p)
          }))
        }))
      })),
      getPointerPosition: vi.fn()
    })),
    Layer: vi.fn().mockImplementation(() => ({
      getChildren: vi.fn(),
      findOne: vi.fn(),
      add: vi.fn(),
      draw: vi.fn()
    })),
    Group: vi.fn().mockImplementation(() => ({
      id: vi.fn(),
      x: vi.fn(),
      y: vi.fn(),
      position: vi.fn(),
      opacity: vi.fn(),
      getChildren: vi.fn(),
      className: 'Group'
    })),
    Node: vi.fn().mockImplementation(() => ({
      id: vi.fn(),
      x: vi.fn(),
      y: vi.fn(),
      position: vi.fn(),
      opacity: vi.fn()
    })),
    Tween: vi.fn().mockImplementation((config) => ({
      play: vi.fn(),
      destroy: vi.fn(),
      _config: config
    })),
    Easings: {
      Linear: 'Linear',
      EaseIn: 'EaseIn',
      EaseOut: 'EaseOut',
      EaseInOut: 'EaseInOut'
    }
  }
}))

// Mock react-konva
vi.mock('react-konva', () => ({
  Stage: ({ children }: any) => children,
  Layer: ({ children }: any) => children,
  Group: ({ children }: any) => children,
  Rect: () => null,
  Circle: () => null,
  Line: () => null,
  Text: () => null
}))
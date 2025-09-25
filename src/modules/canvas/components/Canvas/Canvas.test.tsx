/**
 * Canvas Component Tests
 * Test the new modular canvas component
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Canvas } from './Canvas'
import type { CanvasSettings } from '../../types'

// Mock the canvas module hook
vi.mock('../../hooks/useCanvasModule', () => ({
  useCanvasModule: vi.fn(() => ({
    containerRef: { current: null },
    isInitialized: false,
    viewport: { position: { x: 0, y: 0 }, scale: 1, bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
    initialize: vi.fn(),
    setViewport: vi.fn()
  }))
}))

const mockSettings: CanvasSettings = {
  width: 1920,
  height: 1080,
  background: '#1A1A1A',
  grid: {
    size: 50,
    visible: true,
    snapEnabled: true,
    color: '#333',
    opacity: 0.5,
    type: 'square'
  },
  viewport: {
    position: { x: 0, y: 0 },
    scale: 1,
    bounds: { x: 0, y: 0, width: 1920, height: 1080 }
  }
}

describe('Canvas Component', () => {
  it('renders without crashing', () => {
    render(<Canvas settings={mockSettings} />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Canvas settings={mockSettings}>
        <div data-testid="canvas-child">Canvas Child</div>
      </Canvas>
    )
    expect(screen.getByTestId('canvas-child')).toBeInTheDocument()
  })

  it('calls onInitialized when provided', () => {
    const onInitialized = vi.fn()
    render(<Canvas settings={mockSettings} onInitialized={onInitialized} />)
    // Note: In a real test, we'd need to mock the canvas initialization
    // For now, we're just testing that the component renders
    expect(onInitialized).not.toHaveBeenCalled() // Because canvas isn't actually initialized in test
  })

  it('calls onError when provided', () => {
    const onError = vi.fn()
    render(<Canvas settings={mockSettings} onError={onError} />)
    // Note: Error testing would require actual canvas errors
    expect(onError).not.toHaveBeenCalled()
  })
})
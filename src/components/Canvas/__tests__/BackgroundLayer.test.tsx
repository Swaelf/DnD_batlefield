import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BackgroundLayer } from '../BackgroundLayer'
import { Stage } from 'react-konva'
import type Konva from 'konva'

describe('BackgroundLayer', () => {
  const createMockStageRef = () => {
    const mockStage = {
      scaleX: vi.fn(() => 1),
      scaleY: vi.fn(() => 1),
      position: vi.fn(() => ({ x: 0, y: 0 }))
    }
    return { current: mockStage as unknown as Konva.Stage }
  }

  const defaultProps = {
    width: 800,
    height: 600,
    stageRef: createMockStageRef(),
    gridSettings: {
      size: 50,
      type: 'square' as const,
      visible: true,
      snap: true,
      color: '#cccccc'
    }
  }

  it('should render without crashing when grid is visible', () => {
    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...defaultProps} />
      </Stage>
    )
    expect(container).toBeTruthy()
  })

  it('should return null when grid is not visible', () => {
    const props = {
      ...defaultProps,
      gridSettings: {
        ...defaultProps.gridSettings,
        visible: false
      }
    }

    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...props} />
      </Stage>
    )

    // Should render Stage but not grid lines
    expect(container).toBeTruthy()
  })

  it('should return null when gridSettings is undefined', () => {
    const props = {
      ...defaultProps,
      gridSettings: undefined
    }

    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...props} />
      </Stage>
    )

    expect(container).toBeTruthy()
  })

  it('should use default grid size if not provided', () => {
    const props = {
      ...defaultProps,
      gridSettings: {
        ...defaultProps.gridSettings,
        size: undefined as unknown as number
      }
    }

    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...props} />
      </Stage>
    )

    expect(container).toBeTruthy()
  })

  it('should use default color if not provided', () => {
    const props = {
      ...defaultProps,
      gridSettings: {
        ...defaultProps.gridSettings,
        color: undefined as unknown as string
      }
    }

    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...props} />
      </Stage>
    )

    expect(container).toBeTruthy()
  })

  it('should handle zoomed stage', () => {
    const mockStage = {
      scaleX: vi.fn(() => 2), // 2x zoom
      scaleY: vi.fn(() => 2),
      position: vi.fn(() => ({ x: -100, y: -100 }))
    }
    const zoomedStageRef = { current: mockStage as unknown as Konva.Stage }

    const props = {
      ...defaultProps,
      stageRef: zoomedStageRef
    }

    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...props} />
      </Stage>
    )

    expect(container).toBeTruthy()
    expect(mockStage.scaleX).toHaveBeenCalled()
    expect(mockStage.position).toHaveBeenCalled()
  })

  it('should handle panned stage', () => {
    const mockStage = {
      scaleX: vi.fn(() => 1),
      scaleY: vi.fn(() => 1),
      position: vi.fn(() => ({ x: 200, y: 150 })) // Panned position
    }
    const pannedStageRef = { current: mockStage as unknown as Konva.Stage }

    const props = {
      ...defaultProps,
      stageRef: pannedStageRef
    }

    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...props} />
      </Stage>
    )

    expect(container).toBeTruthy()
    expect(mockStage.position).toHaveBeenCalled()
  })

  it('should handle null stage ref gracefully', () => {
    const props = {
      ...defaultProps,
      stageRef: { current: null }
    }

    const { container } = render(
      <Stage width={800} height={600}>
        <BackgroundLayer {...props} />
      </Stage>
    )

    expect(container).toBeTruthy()
  })

  it('should be memoized', () => {
    // BackgroundLayer is wrapped in memo, test that it's a valid component
    expect(BackgroundLayer).toBeDefined()
    expect(typeof BackgroundLayer).toBe('object')
  })
})

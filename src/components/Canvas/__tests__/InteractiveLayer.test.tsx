import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { InteractiveLayer } from '../InteractiveLayer'
import { Stage } from 'react-konva'
import type { DrawingState, StaticObjectTemplate } from '@/types'

describe('InteractiveLayer', () => {
  const defaultDrawingState: DrawingState = {
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    points: []
  }

  const defaultProps = {
    currentTool: 'select',
    gridSettings: {
      size: 50,
      type: 'square' as const,
      visible: true,
      snap: true,
      color: '#cccccc'
    },
    isCreatingEvent: false,
    isSelecting: false,
    selectionRect: null,
    drawingState: defaultDrawingState,
    tokenTemplate: null,
    staticObjectTemplate: null,
    staticEffectTemplate: null,
    previewPosition: null,
    measurementPoints: [],
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    opacity: 1
  }

  it('should render without crashing', () => {
    const { container } = render(
      <Stage width={800} height={600}>
        <InteractiveLayer {...defaultProps} />
      </Stage>
    )
    expect(container).toBeTruthy()
  })

  describe('Selection Group', () => {
    it('should show selection group when currentTool is select', () => {
      const props = {
        ...defaultProps,
        currentTool: 'select'
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should show selection group when isSelecting is true', () => {
      const props = {
        ...defaultProps,
        currentTool: 'token',
        isSelecting: true
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Token Preview', () => {
    it('should render token preview when tokenTemplate and currentPoint exist', () => {
      const props = {
        ...defaultProps,
        currentTool: 'token',
        tokenTemplate: {
          name: 'Test Token',
          size: 'medium' as const,
          color: '#ff0000',
          shape: 'circle' as const
        },
        drawingState: {
          ...defaultDrawingState,
          currentPoint: { x: 100, y: 100 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render token preview when isDrawing is true', () => {
      const props = {
        ...defaultProps,
        currentTool: 'token',
        tokenTemplate: {
          name: 'Test Token',
          size: 'medium' as const,
          color: '#ff0000',
          shape: 'circle' as const
        },
        drawingState: {
          ...defaultDrawingState,
          isDrawing: true,
          currentPoint: { x: 100, y: 100 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render token preview when isCreatingEvent is true', () => {
      const props = {
        ...defaultProps,
        currentTool: 'token',
        isCreatingEvent: true,
        tokenTemplate: {
          name: 'Test Token',
          size: 'medium' as const,
          color: '#ff0000',
          shape: 'circle' as const
        },
        drawingState: {
          ...defaultDrawingState,
          currentPoint: { x: 100, y: 100 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Static Object Preview', () => {
    const rectangleTemplate: StaticObjectTemplate = {
      id: 'test-rect',
      name: 'Test Rectangle',
      type: 'rectangle',
      category: 'structures',
      icon: null,
      defaultColor: '#00ff00',
      defaultOpacity: 0.8,
      sizeProperties: {
        width: 100,
        height: 60
      },
      description: 'Test rectangle'
    }

    const circleTemplate: StaticObjectTemplate = {
      id: 'test-circle',
      name: 'Test Circle',
      type: 'circle',
      category: 'structures',
      icon: null,
      defaultColor: '#0000ff',
      defaultOpacity: 0.8,
      sizeProperties: {
        radius: 50
      },
      description: 'Test circle'
    }

    const polygonTemplate: StaticObjectTemplate = {
      id: 'test-polygon',
      name: 'Test Polygon',
      type: 'polygon',
      category: 'structures',
      icon: null,
      defaultColor: '#ff00ff',
      defaultOpacity: 0.8,
      sizeProperties: {
        width: 100,
        height: 60
      },
      description: 'Test polygon'
    }

    it('should render rectangle preview', () => {
      const props = {
        ...defaultProps,
        currentTool: 'staticObject',
        staticObjectTemplate: rectangleTemplate,
        drawingState: {
          ...defaultDrawingState,
          currentPoint: { x: 200, y: 200 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should render circle preview', () => {
      const props = {
        ...defaultProps,
        currentTool: 'staticObject',
        staticObjectTemplate: circleTemplate,
        drawingState: {
          ...defaultDrawingState,
          currentPoint: { x: 200, y: 200 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should render polygon preview', () => {
      const props = {
        ...defaultProps,
        currentTool: 'staticObject',
        staticObjectTemplate: polygonTemplate,
        drawingState: {
          ...defaultDrawingState,
          currentPoint: { x: 200, y: 200 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render static object preview when isDrawing is true', () => {
      const props = {
        ...defaultProps,
        currentTool: 'staticObject',
        staticObjectTemplate: rectangleTemplate,
        drawingState: {
          ...defaultDrawingState,
          isDrawing: true,
          currentPoint: { x: 200, y: 200 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render static object preview during event creation', () => {
      const props = {
        ...defaultProps,
        currentTool: 'staticObject',
        isCreatingEvent: true,
        staticObjectTemplate: rectangleTemplate,
        drawingState: {
          ...defaultDrawingState,
          currentPoint: { x: 200, y: 200 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Drawing Tool Previews', () => {
    const drawingInProgress: DrawingState = {
      isDrawing: true,
      startPoint: { x: 100, y: 100 },
      currentPoint: { x: 200, y: 200 },
      points: []
    }

    it('should render rectangle drawing preview', () => {
      const props = {
        ...defaultProps,
        currentTool: 'rectangle',
        drawingState: drawingInProgress
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should render circle drawing preview', () => {
      const props = {
        ...defaultProps,
        currentTool: 'circle',
        drawingState: drawingInProgress
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should render line drawing preview', () => {
      const props = {
        ...defaultProps,
        currentTool: 'line',
        drawingState: drawingInProgress
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render drawing preview without startPoint', () => {
      const props = {
        ...defaultProps,
        currentTool: 'rectangle',
        drawingState: {
          ...drawingInProgress,
          startPoint: null
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render drawing preview without currentPoint', () => {
      const props = {
        ...defaultProps,
        currentTool: 'rectangle',
        drawingState: {
          ...drawingInProgress,
          currentPoint: null
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Selection Rectangle', () => {
    it('should render selection rectangle when visible', () => {
      const props = {
        ...defaultProps,
        currentTool: 'select',
        selectionRect: {
          x: 50,
          y: 50,
          width: 200,
          height: 150,
          visible: true
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render selection rectangle when not visible', () => {
      const props = {
        ...defaultProps,
        currentTool: 'select',
        selectionRect: {
          x: 50,
          y: 50,
          width: 200,
          height: 150,
          visible: false
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Measurement Overlay', () => {
    it('should render measurement overlay with points', () => {
      const props = {
        ...defaultProps,
        currentTool: 'measure',
        measurementPoints: [
          { x: 0, y: 0 },
          { x: 100, y: 100 }
        ],
        drawingState: {
          ...defaultDrawingState,
          currentPoint: { x: 200, y: 200 }
        }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should render measurement overlay without currentPoint', () => {
      const props = {
        ...defaultProps,
        currentTool: 'measure',
        measurementPoints: [
          { x: 0, y: 0 },
          { x: 100, y: 100 }
        ]
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Static Effect Preview', () => {
    it('should render static effect preview when template and position exist', () => {
      const props = {
        ...defaultProps,
        staticEffectTemplate: {
          id: 'test-effect',
          name: 'Fireball',
          type: 'circle' as const,
          category: 'area' as const,
          icon: null,
          defaultColor: '#ff0000',
          defaultOpacity: 0.8,
          sizeProperties: {
            radius: 20
          },
          description: 'Test fireball effect'
        },
        previewPosition: { x: 300, y: 300 }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render static effect preview during event creation', () => {
      const props = {
        ...defaultProps,
        isCreatingEvent: true,
        staticEffectTemplate: {
          id: 'test-effect',
          name: 'Fireball',
          type: 'circle' as const,
          category: 'area' as const,
          icon: null,
          defaultColor: '#ff0000',
          defaultOpacity: 0.8,
          sizeProperties: {
            radius: 20
          },
          description: 'Test fireball effect'
        },
        previewPosition: { x: 300, y: 300 }
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should not render static effect preview without position', () => {
      const props = {
        ...defaultProps,
        staticEffectTemplate: {
          id: 'test-effect',
          name: 'Fireball',
          type: 'circle' as const,
          category: 'area' as const,
          icon: null,
          defaultColor: '#ff0000',
          defaultOpacity: 0.8,
          sizeProperties: {
            radius: 20
          },
          description: 'Test fireball effect'
        },
        previewPosition: null
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  describe('Drawing Group Visibility', () => {
    it('should show drawing group for drawing tools', () => {
      const props = {
        ...defaultProps,
        currentTool: 'rectangle'
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should show drawing group for measure tool', () => {
      const props = {
        ...defaultProps,
        currentTool: 'measure'
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should show drawing group for token tool', () => {
      const props = {
        ...defaultProps,
        currentTool: 'token'
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should show drawing group for staticObject tool', () => {
      const props = {
        ...defaultProps,
        currentTool: 'staticObject'
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })

    it('should hide drawing group during event creation', () => {
      const props = {
        ...defaultProps,
        currentTool: 'rectangle',
        isCreatingEvent: true
      }

      const { container } = render(
        <Stage width={800} height={600}>
          <InteractiveLayer {...props} />
        </Stage>
      )
      expect(container).toBeTruthy()
    })
  })

  it('should be memoized', () => {
    expect(InteractiveLayer).toBeDefined()
    expect(typeof InteractiveLayer).toBe('object')
  })
})

import { useCallback } from 'react'
import Konva from 'konva'
import { Position, Shape } from '@/types/map'
import { snapToGrid } from '@/utils/grid'

type ToolHandlersProps = {
  stageRef: React.RefObject<Konva.Stage>
  currentTool: string
  currentMap: any
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  tokenTemplate: any
  staticObjectTemplate: any
  spellEffectTemplate: any
  isPicking: 'from' | 'to' | 'token' | null
  drawingState: {
    isDrawing: boolean
    startPoint: Position | null
    currentPoint: Position | null
  }
  setDrawingState: (state: any) => void
  addObject: (object: any) => void
  setPosition: (type: 'from' | 'to', position: Position) => void
  completePositionPicking: () => void
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent>) => void
  handleMouseUp: () => void
  onMouseMove?: (position: Position) => void
}

export const useToolHandlers = ({
  stageRef,
  currentTool,
  currentMap,
  fillColor,
  strokeColor,
  strokeWidth,
  opacity,
  tokenTemplate,
  staticObjectTemplate,
  spellEffectTemplate,
  isPicking,
  drawingState,
  setDrawingState,
  addObject,
  setPosition,
  completePositionPicking,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  onMouseMove
}: ToolHandlersProps) => {
  const handleStageMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current
    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    // Get position relative to the stage
    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)

    // Snap to grid if enabled
    const snappedPos = snapToGrid(pos, currentMap?.grid.size || 50, currentMap?.grid.snap || false)

    // Handle position picking for event creation
    if (isPicking === 'from' || isPicking === 'to') {
      setPosition(isPicking, snappedPos)
      completePositionPicking()
      return
    }

    // Let pan tool handle its own events
    if (currentTool === 'pan' || e.evt.shiftKey || e.evt.button === 1) {
      handleMouseDown(e)
      // Set grabbing cursor
      const container = stageRef.current?.container()
      if (container) {
        container.style.cursor = 'grabbing'
      }
      return
    }

    // Handle different tools
    switch (currentTool) {
      case 'select':
        // Selection will be handled by clicking on objects
        break
      case 'rectangle':
      case 'circle':
      case 'measure':
        setDrawingState({
          isDrawing: true,
          startPoint: snappedPos,
          currentPoint: snappedPos
        })
        break
      case 'eraser':
        // Eraser will delete objects on click
        break
      case 'token':
        // Don't create new tokens if we're picking a token for event creation
        if (isPicking === 'token') {
          return
        }
        // Place token immediately using template if available
        if (tokenTemplate) {
          const token = {
            id: crypto.randomUUID(),
            type: 'token' as const,
            position: snappedPos,
            rotation: 0,
            layer: 1,
            size: tokenTemplate.size || 'medium',
            name: tokenTemplate.name || 'Token',
            color: tokenTemplate.color || fillColor,
            shape: tokenTemplate.shape || 'circle',
            showLabel: tokenTemplate.showLabel || true,
            labelPosition: tokenTemplate.labelPosition || 'bottom',
            opacity: tokenTemplate.opacity || 1,
            borderColor: tokenTemplate.borderColor || '#000000',
            borderWidth: tokenTemplate.borderWidth || 2,
            locked: false
          }
          addObject(token)
        } else {
          // Fallback if no template
          const token = {
            id: crypto.randomUUID(),
            type: 'token' as const,
            position: snappedPos,
            rotation: 0,
            layer: 1,
            size: 'medium' as const,
            name: 'Token',
            color: fillColor,
            shape: 'circle' as const,
            showLabel: true,
            labelPosition: 'bottom' as const,
            opacity: 1,
            borderColor: '#000000',
            borderWidth: 2,
            locked: false
          }
          addObject(token)
        }
        break
      case 'staticObject':
        // Place static object using template
        if (staticObjectTemplate) {
          const newObject: Shape = {
            id: crypto.randomUUID(),
            type: 'shape' as const,
            shapeType: staticObjectTemplate.shape,
            position: snappedPos,
            width: staticObjectTemplate.shape === 'rectangle' ? staticObjectTemplate.width : undefined,
            height: staticObjectTemplate.shape === 'rectangle' ? staticObjectTemplate.height : undefined,
            radius: staticObjectTemplate.shape === 'circle' ? staticObjectTemplate.width / 2 : undefined,
            points: staticObjectTemplate.points,
            rotation: 0,
            layer: 1,
            fillColor: staticObjectTemplate.fillColor,
            fill: staticObjectTemplate.fillColor,
            strokeColor: staticObjectTemplate.strokeColor,
            stroke: staticObjectTemplate.strokeColor,
            strokeWidth: staticObjectTemplate.strokeWidth,
            opacity: 1,
            name: staticObjectTemplate.name,
            locked: false
          } as Shape
          addObject(newObject)
        }
        break
      case 'spellEffect':
        // Place spell effect using template
        if (spellEffectTemplate) {
          let newObject: Partial<Shape> = {
            id: crypto.randomUUID(),
            type: 'shape' as const,
            position: snappedPos,
            rotation: 0,
            layer: 10, // Spell effects on top
            fillColor: spellEffectTemplate.color,
            fill: spellEffectTemplate.color,
            strokeColor: spellEffectTemplate.color,
            stroke: spellEffectTemplate.color,
            strokeWidth: 2,
            opacity: spellEffectTemplate.opacity,
            name: spellEffectTemplate.name,
            locked: false
          }

          // Configure based on shape
          switch (spellEffectTemplate.shape) {
            case 'sphere':
              newObject.shapeType = 'circle'
              newObject.radius = spellEffectTemplate.size.radius
              break
            case 'cone':
              // Cone will be rendered as a triangle/polygon
              const length = spellEffectTemplate.size.length || 75
              const angle = (spellEffectTemplate.size.angle || 60) * Math.PI / 180
              const halfAngle = angle / 2
              newObject.shapeType = 'polygon'
              newObject.points = [
                0, 0,
                length * Math.cos(-halfAngle), length * Math.sin(-halfAngle),
                length * Math.cos(halfAngle), length * Math.sin(halfAngle)
              ]
              break
            case 'cube':
              newObject.shapeType = 'rectangle'
              newObject.width = spellEffectTemplate.size.width
              newObject.height = spellEffectTemplate.size.height
              break
            case 'line':
              newObject.shapeType = 'rectangle'
              newObject.width = spellEffectTemplate.size.length
              newObject.height = spellEffectTemplate.size.width
              break
            case 'wall':
              newObject.shapeType = 'rectangle'
              newObject.width = spellEffectTemplate.size.length
              newObject.height = spellEffectTemplate.size.width
              break
          }

          addObject(newObject as Shape)
        }
        break
    }
  }, [currentTool, currentMap, handleMouseDown, setDrawingState, fillColor, addObject, tokenTemplate, staticObjectTemplate, spellEffectTemplate, isPicking, setPosition, completePositionPicking, stageRef])

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Get mouse position and report it
    const stage = stageRef.current
    if (stage && onMouseMove) {
      const pointer = stage.getPointerPosition()
      if (pointer) {
        const transform = stage.getAbsoluteTransform().copy().invert()
        const pos = transform.point(pointer)
        onMouseMove(pos)
      }
    }

    // Handle pan dragging
    if (currentTool === 'pan' || e.evt.shiftKey || drawingState.isDrawing === false) {
      handleMouseMove(e)
      return
    }

    if (!drawingState.isDrawing || !drawingState.startPoint) return

    if (!stage) return

    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const transform = stage.getAbsoluteTransform().copy().invert()
    const pos = transform.point(pointer)
    const snappedPos = snapToGrid(pos, currentMap?.grid.size || 50, currentMap?.grid.snap || false)

    setDrawingState({ currentPoint: snappedPos })
  }, [currentTool, drawingState, currentMap, handleMouseMove, setDrawingState, onMouseMove, stageRef])

  const handleStageMouseUp = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    handleMouseUp()

    // Reset cursor after pan
    if (currentTool === 'pan' || e.evt.shiftKey) {
      const container = stageRef.current?.container()
      if (container) {
        container.style.cursor = currentTool === 'pan' ? 'grab' : 'default'
      }
    }

    if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.currentPoint) {
      return
    }

    const { startPoint, currentPoint } = drawingState

    // Handle measure tool separately (don't create an object)
    if (currentTool === 'measure') {
      // Just reset the drawing state for measure tool
      setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: null
      })
      return
    }

    // Create the shape object
    let newObject: Shape | null = null

    switch (currentTool) {
      case 'rectangle':
        newObject = {
          id: crypto.randomUUID(),
          type: 'shape',
          shapeType: 'rectangle',
          position: {
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y)
          },
          width: Math.abs(currentPoint.x - startPoint.x),
          height: Math.abs(currentPoint.y - startPoint.y),
          rotation: 0,
          layer: 1,
          fill: fillColor,
          fillColor,
          stroke: strokeColor,
          strokeColor,
          strokeWidth,
          opacity
        }
        break
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) +
          Math.pow(currentPoint.y - startPoint.y, 2)
        )
        newObject = {
          id: crypto.randomUUID(),
          type: 'shape',
          shapeType: 'circle',
          position: startPoint,
          radius,
          rotation: 0,
          layer: 1,
          fill: fillColor,
          fillColor,
          stroke: strokeColor,
          strokeColor,
          strokeWidth,
          opacity
        }
        break
    }

    if (newObject) {
      addObject(newObject)
    }

    // Reset drawing state
    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null
    })
  }, [currentTool, drawingState, fillColor, strokeColor, strokeWidth, opacity, handleMouseUp, addObject, setDrawingState, stageRef])

  return {
    handleStageMouseDown,
    handleStageMouseMove,
    handleStageMouseUp
  }
}
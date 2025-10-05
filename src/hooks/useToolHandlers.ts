import { useCallback, type RefObject } from 'react'
import type Konva from 'konva'
import type { Position, Shape } from '@/types/map'
import { snapToGrid } from '@/utils/grid'

// Helper function to constrain position within range
const constrainPositionToRange = (
  targetPosition: Position,
  originPosition: Position,
  maxRangePixels: number
): Position => {
  const dx = targetPosition.x - originPosition.x
  const dy = targetPosition.y - originPosition.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance <= maxRangePixels) {
    return targetPosition // Within range, no constraint needed
  }

  // Constrain to the edge of the range circle
  const ratio = maxRangePixels / distance
  return {
    x: originPosition.x + dx * ratio,
    y: originPosition.y + dy * ratio
  }
}

// Helper function to check if an object intersects with a rectangle
const objectIntersectsRect = (obj: any, rect: { x: number; y: number; width: number; height: number }): boolean => {
  // Get object bounds
  let objBounds: { x: number; y: number; width: number; height: number }

  switch (obj.type) {
    case 'token':
      const tokenSize = getTokenPixelSize(obj.size || 'medium', 50) // Assume 50px grid
      objBounds = {
        x: obj.position.x - tokenSize / 2,
        y: obj.position.y - tokenSize / 2,
        width: tokenSize,
        height: tokenSize
      }
      break
    case 'shape':
      switch (obj.shapeType) {
        case 'rectangle':
          objBounds = {
            x: obj.position.x,
            y: obj.position.y,
            width: obj.width || 0,
            height: obj.height || 0
          }
          break
        case 'circle':
          const radius = obj.radius || 0
          objBounds = {
            x: obj.position.x - radius,
            y: obj.position.y - radius,
            width: radius * 2,
            height: radius * 2
          }
          break
        case 'line':
        case 'polygon':
          // For lines and polygons, use a simple point-in-rect check
          if (obj.points && obj.points.length >= 2) {
            const xs = obj.points.filter((_: any, i: number) => i % 2 === 0)
            const ys = obj.points.filter((_: any, i: number) => i % 2 === 1)
            const minX = Math.min(...xs)
            const maxX = Math.max(...xs)
            const minY = Math.min(...ys)
            const maxY = Math.max(...ys)
            objBounds = {
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY
            }
          } else {
            return false
          }
          break
        default:
          return false
      }
      break
    default:
      return false
  }

  // Check rectangle intersection
  return !(
    objBounds.x > rect.x + rect.width ||
    objBounds.x + objBounds.width < rect.x ||
    objBounds.y > rect.y + rect.height ||
    objBounds.y + objBounds.height < rect.y
  )
}

// Helper function to get token pixel size based on D&D size
const getTokenPixelSize = (size: string, gridSize: number): number => {
  switch (size) {
    case 'tiny': return gridSize * 0.5
    case 'small':
    case 'medium': return gridSize
    case 'large': return gridSize * 2
    case 'huge': return gridSize * 3
    case 'gargantuan': return gridSize * 4
    default: return gridSize
  }
}

type ToolHandlersProps = {
  stageRef: RefObject<Konva.Stage>
  currentTool: string
  currentMap: any
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  tokenTemplate: any
  staticObjectTemplate: any
  staticEffectTemplate: any
  isPicking: 'from' | 'to' | 'token' | null
  selectedSpell?: any  // Spell template data for range limits
  selectedTokenId?: string | null  // Token ID for movement range
  getTokenExpectedPosition?: (tokenId?: string | null) => Position | null  // Function to get expected position
  drawingState: {
    isDrawing: boolean
    startPoint: Position | null
    currentPoint: Position | null
    points: Position[] // For polygon drawing
  }
  setDrawingState: (state: any) => void
  addObject: (object: any) => void
  addMeasurementPoint?: (point: Position) => void
  clearMeasurementPoints?: () => void
  setPosition: (type: 'from' | 'to', position: Position) => void
  completePositionPicking: () => void
  selectMultiple: (objectIds: string[]) => void
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
  staticEffectTemplate,
  isPicking,
  selectedSpell,
  selectedTokenId,
  getTokenExpectedPosition,
  drawingState,
  setDrawingState,
  addObject,
  addMeasurementPoint,
  // clearMeasurementPoints, // Unused
  setPosition,
  completePositionPicking,
  selectMultiple,
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
      let finalPosition = snappedPos

      // Apply range constraints when picking destination position
      if (isPicking === 'to') {
        // For spell casting - constrain to spell range
        if (selectedSpell && selectedSpell.range) {
          const gridSize = currentMap?.grid.size || 50
          const spellRangeInPixels = (selectedSpell.range / 5) * gridSize

          // Need caster position - use expected position (after pending events) or current position
          const expectedPosition = getTokenExpectedPosition ? getTokenExpectedPosition(selectedTokenId) : null
          const selectedToken = selectedTokenId ? currentMap?.objects.find((obj: any) => obj.id === selectedTokenId) : null
          const casterPosition = expectedPosition || selectedToken?.position

          if (casterPosition) {
            finalPosition = constrainPositionToRange(snappedPos, casterPosition, spellRangeInPixels)
          }
        }
        // For movement - constrain to movement range
        else if (selectedTokenId && !(selectedSpell && selectedSpell.range)) {
          const gridSize = currentMap?.grid.size || 50
          const movementRangeInPixels = (30 / 5) * gridSize // 30 feet standard movement

          // Use expected position (after pending events) or current position
          const expectedPosition = getTokenExpectedPosition ? getTokenExpectedPosition(selectedTokenId) : null
          const selectedToken = currentMap?.objects.find((obj: any) => obj.id === selectedTokenId)
          const tokenPosition = expectedPosition || selectedToken?.position

          if (tokenPosition) {
            finalPosition = constrainPositionToRange(snappedPos, tokenPosition, movementRangeInPixels)
          }
        }
      }

      setPosition(isPicking, finalPosition)
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
        // Only start selection rectangle if clicking on empty canvas
        // If clicking on object, that will be handled by object click handlers
        const stage = stageRef.current
        if (stage) {
          const pointedObject = stage.getIntersection(pointer)
          if (!pointedObject || pointedObject.getClassName() === 'Layer') {
            // Clicking empty canvas - start selection rectangle
            setDrawingState({
              isDrawing: true,
              startPoint: snappedPos,
              currentPoint: snappedPos
            })
          }
        }
        break
      case 'rectangle':
      case 'circle':
        setDrawingState({
          isDrawing: true,
          startPoint: snappedPos,
          currentPoint: snappedPos
        })
        break
      case 'measure':
        // Add measurement point and set current point for preview
        if (addMeasurementPoint) {
          addMeasurementPoint(snappedPos)
        }
        setDrawingState({
          isDrawing: false,
          startPoint: null,
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
          // Calculate position - for rectangles, offset to center at cursor
          // For circles, Konva already uses center position
          let objectPosition = snappedPos
          if (staticObjectTemplate.shape === 'rectangle') {
            // Offset position so rectangle is centered at cursor (since Konva uses top-left for rectangles)
            objectPosition = {
              x: snappedPos.x - (staticObjectTemplate.width / 2),
              y: snappedPos.y - (staticObjectTemplate.height / 2)
            }
          } else if (staticObjectTemplate.shape === 'polygon' && staticObjectTemplate.points) {
            // For polygons, we need to offset based on the bounding box
            // The points are relative to the position, so offset the position
            objectPosition = {
              x: snappedPos.x - (staticObjectTemplate.width / 2),
              y: snappedPos.y - (staticObjectTemplate.height / 2)
            }
          }
          // Circles already use center position in Konva, so no offset needed

          const newObject: Shape = {
            id: crypto.randomUUID(),
            type: 'shape' as const,
            shapeType: staticObjectTemplate.shape,
            position: objectPosition,
            width: staticObjectTemplate.shape === 'rectangle' ? staticObjectTemplate.width : undefined,
            height: staticObjectTemplate.shape === 'rectangle' || staticObjectTemplate.shape === 'polygon' ? staticObjectTemplate.height : undefined,
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
            locked: false,
            metadata: staticObjectTemplate.metadata || { isStatic: true }
          } as Shape
          addObject(newObject)
        }
        break
      case 'staticEffect':
        // Place static effect using template
        if (staticEffectTemplate) {
          const newObject: Partial<Shape> = {
            id: crypto.randomUUID(),
            type: 'shape' as const,
            position: snappedPos,
            rotation: 0,
            layer: 10, // Static effects on top
            fillColor: staticEffectTemplate.defaultColor,
            fill: staticEffectTemplate.defaultColor,
            strokeColor: staticEffectTemplate.defaultColor,
            stroke: staticEffectTemplate.defaultColor,
            strokeWidth: 2,
            opacity: staticEffectTemplate.defaultOpacity,
            name: staticEffectTemplate.name,
            locked: false,
            metadata: {
              isStaticEffect: true  // Mark as static effect for layer optimization
            },
            staticEffectData: {
              template: staticEffectTemplate,
              color: staticEffectTemplate.defaultColor
            }
          }

          // Configure based on type
          switch (staticEffectTemplate.type) {
            case 'circle':
              newObject.shapeType = 'circle'
              newObject.radius = staticEffectTemplate.sizeProperties.radius
              break
            case 'rectangle':
              newObject.shapeType = 'rectangle'
              newObject.width = staticEffectTemplate.sizeProperties.width
              newObject.height = staticEffectTemplate.sizeProperties.height
              break
            case 'cone':
              // Cone will be rendered as a triangle/polygon
              const length = staticEffectTemplate.sizeProperties.length || 80
              const angle = (staticEffectTemplate.sizeProperties.angle || 60) * Math.PI / 180
              const halfAngle = angle / 2
              newObject.shapeType = 'polygon'
              newObject.points = [
                0, 0,
                length * Math.cos(-halfAngle), length * Math.sin(-halfAngle),
                length * Math.cos(halfAngle), length * Math.sin(halfAngle)
              ]
              break
            case 'line':
              newObject.shapeType = 'rectangle'
              newObject.width = staticEffectTemplate.sizeProperties.length
              newObject.height = staticEffectTemplate.sizeProperties.width
              break
          }

          addObject(newObject as Shape)
        }
        break
    }
  }, [currentTool, currentMap, handleMouseDown, setDrawingState, fillColor, addObject, addMeasurementPoint, tokenTemplate, staticObjectTemplate, staticEffectTemplate, isPicking, selectedSpell, selectedTokenId, getTokenExpectedPosition, setPosition, completePositionPicking, stageRef])

  const handleStageMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Get mouse position and report it
    const stage = stageRef.current
    if (stage) {
      const pointer = stage.getPointerPosition()
      if (pointer) {
        const transform = stage.getAbsoluteTransform().copy().invert()
        const pos = transform.point(pointer)
        const snappedPos = snapToGrid(pos, currentMap?.grid.size || 50, currentMap?.grid.snap || false)

        // Report position for status bar
        if (onMouseMove) {
          onMouseMove(pos)
        }

        // Update position preview when picking for spell targeting
        if (isPicking === 'to') {
          let finalPosition = snappedPos

          // Apply range constraints for preview position
          // For spell casting - constrain to spell range
          if (selectedSpell && selectedSpell.range) {
            const gridSize = currentMap?.grid.size || 50
            const spellRangeInPixels = (selectedSpell.range / 5) * gridSize

            const expectedPosition = getTokenExpectedPosition ? getTokenExpectedPosition(selectedTokenId) : null
            const selectedToken = selectedTokenId ? currentMap?.objects.find((obj: any) => obj.id === selectedTokenId) : null
            const casterPosition = expectedPosition || selectedToken?.position

            if (casterPosition) {
              finalPosition = constrainPositionToRange(snappedPos, casterPosition, spellRangeInPixels)
            }
          }
          // For movement - constrain to movement range
          else if (selectedTokenId && !(selectedSpell && selectedSpell.range)) {
            const gridSize = currentMap?.grid.size || 50
            const movementRangeInPixels = (30 / 5) * gridSize // 30 feet standard movement

            const expectedPosition = getTokenExpectedPosition ? getTokenExpectedPosition(selectedTokenId) : null
            const selectedToken = currentMap?.objects.find((obj: any) => obj.id === selectedTokenId)
            const tokenPosition = expectedPosition || selectedToken?.position

            if (tokenPosition) {
              finalPosition = constrainPositionToRange(snappedPos, tokenPosition, movementRangeInPixels)
            }
          }

          setPosition('to', finalPosition)
        }
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

    // For measurement tool, always update current point for preview
    if (currentTool === 'measure') {
      setDrawingState({ currentPoint: snappedPos })
    } else {
      setDrawingState({ currentPoint: snappedPos })
    }
  }, [currentTool, drawingState, currentMap, handleMouseMove, setDrawingState, onMouseMove, stageRef, isPicking, selectedSpell, selectedTokenId, getTokenExpectedPosition, setPosition])

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
      case 'select':
        // Handle drag-to-select rectangle
        const selectionRect = {
          x: Math.min(startPoint.x, currentPoint.x),
          y: Math.min(startPoint.y, currentPoint.y),
          width: Math.abs(currentPoint.x - startPoint.x),
          height: Math.abs(currentPoint.y - startPoint.y)
        }

        // Find objects that intersect with selection rectangle
        const selectedObjectIds: string[] = []
        if (currentMap?.objects) {
          for (const obj of currentMap.objects) {
            // Check if object intersects with selection rectangle
            if (objectIntersectsRect(obj, selectionRect)) {
              selectedObjectIds.push(obj.id)
            }
          }
        }

        // Select the found objects
        if (selectedObjectIds.length > 0) {
          selectMultiple(selectedObjectIds)
        }

        // Reset drawing state and return early - don't create an object
        setDrawingState({
          isDrawing: false,
          startPoint: null,
          currentPoint: null
        })
        return

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
          fillColor: fillColor,
          stroke: strokeColor,
          strokeColor: strokeColor,
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
          fillColor: fillColor,
          stroke: strokeColor,
          strokeColor: strokeColor,
          strokeWidth,
          opacity
        }
        break
      case 'line':
        newObject = {
          id: crypto.randomUUID(),
          type: 'shape',
          shapeType: 'line',
          position: { x: 0, y: 0 }, // Line uses points array instead
          points: [startPoint.x, startPoint.y, currentPoint.x, currentPoint.y],
          rotation: 0,
          layer: 1,
          fill: 'transparent', // Lines don't use fill
          fillColor: 'transparent',
          stroke: strokeColor,
          strokeColor: strokeColor,
          strokeWidth,
          opacity
        }
        break
      case 'polygon':
        // Polygon tool handles multiple points - create with minimum 3 points
        if (drawingState.points && drawingState.points.length >= 2) {
          // Close the polygon with the current point
          const allPoints = [...drawingState.points, currentPoint]
          // Convert to flat array for Konva
          const flatPoints: number[] = []
          allPoints.forEach(point => {
            flatPoints.push(point.x, point.y)
          })
          newObject = {
            id: crypto.randomUUID(),
            type: 'shape',
            shapeType: 'polygon',
            position: { x: 0, y: 0 }, // Polygon uses points array
            points: flatPoints,
            rotation: 0,
            layer: 1,
            fill: fillColor,
            fillColor: fillColor,
            stroke: strokeColor,
            strokeColor: strokeColor,
            strokeWidth,
            opacity
          }
        } else {
          // First point of polygon - don't create object yet, just add to points
          const newPoints = [...(drawingState.points || []), startPoint]
          setDrawingState({
            ...drawingState,
            points: newPoints,
            startPoint: currentPoint, // Next line starts from current point
            currentPoint: null,
            isDrawing: false // Allow next click to start new line
          })
          return // Don't create object yet
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
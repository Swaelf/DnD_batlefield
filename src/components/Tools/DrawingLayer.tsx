import React from 'react'
import { Layer, Rect, Circle } from 'react-konva'
import Konva from 'konva'
import useToolStore from '@store/toolStore'
import { Token } from '../Token/Token'

interface DrawingLayerProps {
  stageRef: React.RefObject<Konva.Stage>
  gridSize?: number
}

const DrawingLayer: React.FC<DrawingLayerProps> = ({ gridSize = 50 }) => {
  const { currentTool, drawingState, fillColor, strokeColor, strokeWidth, opacity, tokenTemplate } = useToolStore()

  // Show token preview when token tool is active but not drawing
  if (currentTool === 'token' && tokenTemplate && !drawingState.isDrawing) {
    return <Layer />
  }

  if (!drawingState.isDrawing || !drawingState.startPoint || !drawingState.currentPoint) {
    return <Layer />
  }

  const renderPreview = () => {
    const { startPoint, currentPoint } = drawingState

    if (!startPoint || !currentPoint) return null

    const commonProps = {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      opacity: opacity * 0.7, // Slightly transparent during drawing
      listening: false,
    }

    switch (currentTool) {
      case 'rectangle':
        return (
          <Rect
            x={Math.min(startPoint.x, currentPoint.x)}
            y={Math.min(startPoint.y, currentPoint.y)}
            width={Math.abs(currentPoint.x - startPoint.x)}
            height={Math.abs(currentPoint.y - startPoint.y)}
            {...commonProps}
          />
        )
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(currentPoint.x - startPoint.x, 2) +
          Math.pow(currentPoint.y - startPoint.y, 2)
        )
        return (
          <Circle
            x={startPoint.x}
            y={startPoint.y}
            radius={radius}
            {...commonProps}
          />
        )
      case 'token':
        // Show token preview at cursor position
        if (tokenTemplate) {
          const previewToken = {
            id: 'preview',
            type: 'token' as const,
            position: currentPoint,
            rotation: 0,
            layer: 999,
            locked: false,
            ...tokenTemplate,
            opacity: 0.7
          }
          return (
            <Token
              token={previewToken}
              gridSize={gridSize}
              isSelected={false}
              isDraggable={false}
            />
          )
        }
        return null
      default:
        return null
    }
  }

  return (
    <Layer>
      {renderPreview()}
    </Layer>
  )
}

export default React.memo(DrawingLayer)
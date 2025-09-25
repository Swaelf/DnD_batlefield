import React from 'react'
import { Layer, Rect, Circle, Line, Group } from 'react-konva'
import Konva from 'konva'
import useToolStore from '@store/toolStore'
import { Token } from '../Token/Token'
import { MeasurementOverlay } from './MeasurementOverlay'

type DrawingLayerProps = {
  stageRef: React.RefObject<Konva.Stage>
  gridSize?: number
}

const DrawingLayer: React.FC<DrawingLayerProps> = ({ gridSize = 50 }) => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentTool = useToolStore(state => state.currentTool)
  const drawingState = useToolStore(state => state.drawingState)
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)
  const opacity = useToolStore(state => state.opacity)
  const tokenTemplate = useToolStore(state => state.tokenTemplate)
  const measurementPoints = useToolStore(state => state.measurementPoints)
  const staticObjectTemplate = useToolStore(state => state.staticObjectTemplate)

  // Show token preview when token tool is active and hovering
  if (currentTool === 'token' && tokenTemplate && drawingState.currentPoint && !drawingState.isDrawing) {
    return (
      <Layer listening={false}>
        <Token
          token={{
            id: 'preview-token',
            type: 'token',
            position: drawingState.currentPoint,
            rotation: 0,
            layer: 999,
            locked: false,
            ...tokenTemplate,
            opacity: 0.6
          }}
          gridSize={gridSize}
          isSelected={false}
          isDraggable={false}
        />
      </Layer>
    )
  }

  // Show static object preview when staticObject tool is active and hovering
  if (currentTool === 'staticObject' && staticObjectTemplate && drawingState.currentPoint && !drawingState.isDrawing) {
    const isTree = staticObjectTemplate.metadata?.effectType === 'tree'
    const isWall = staticObjectTemplate.fillColor?.includes('#5c5c5c') || staticObjectTemplate.fillColor?.includes('#8B4513')
    const isFurniture = staticObjectTemplate.fillColor?.includes('#654321') || staticObjectTemplate.fillColor?.includes('#A0522D')
    const isFlowering = staticObjectTemplate.fillColor?.includes('#FFB6C1') || staticObjectTemplate.fillColor?.includes('#FF69B4')
    const isAutumn = staticObjectTemplate.fillColor?.includes('#CD853F') || staticObjectTemplate.fillColor?.includes('#DC143C')
    const isDead = staticObjectTemplate.fillColor?.includes('#8B7D6B')

    return (
      <Layer listening={false}>
        <Group opacity={0.6} listening={false}>
          {staticObjectTemplate.shape === 'rectangle' && (
            <Rect
              x={drawingState.currentPoint.x - staticObjectTemplate.width / 2}
              y={drawingState.currentPoint.y - staticObjectTemplate.height / 2}
              width={staticObjectTemplate.width}
              height={staticObjectTemplate.height}
              fill={staticObjectTemplate.fillColor}
              stroke={staticObjectTemplate.strokeColor}
              strokeWidth={staticObjectTemplate.strokeWidth}
              cornerRadius={isWall ? 0 : (isFurniture ? 2 : 4)}
              dash={isWall ? [10, 5] : undefined}
              dashEnabled={isWall}
              shadowColor="black"
              shadowBlur={6}
              shadowOpacity={0.4}
              shadowOffset={{ x: 3, y: 4 }}
              listening={false}
            />
          )}
          {staticObjectTemplate.shape === 'circle' && (
            <>
              {isTree && (
                /* Outer shadow/canopy for trees */
                <Circle
                  x={drawingState.currentPoint.x}
                  y={drawingState.currentPoint.y}
                  radius={(staticObjectTemplate.width / 2) * 1.2}
                  fill={staticObjectTemplate.fillColor}
                  opacity={0.1}
                  listening={false}
                />
              )}
              <Circle
                x={drawingState.currentPoint.x}
                y={drawingState.currentPoint.y}
                radius={staticObjectTemplate.width / 2}
                fill={staticObjectTemplate.fillColor}
                stroke={staticObjectTemplate.strokeColor}
                strokeWidth={staticObjectTemplate.strokeWidth * (isTree ? 1.5 : 1)}
                dash={isTree ? (isDead ? [5, 5] : [3, 2]) : undefined}
                dashEnabled={isTree}
                shadowColor="black"
                shadowBlur={isTree ? 4 : 6}
                shadowOpacity={isTree ? 0.5 : 0.4}
                shadowOffset={{ x: 3, y: 4 }}
                listening={false}
              />
              {isTree && (
                /* Inner texture for trees */
                <Circle
                  x={drawingState.currentPoint.x}
                  y={drawingState.currentPoint.y}
                  radius={(staticObjectTemplate.width / 2) * 0.7}
                  fill={staticObjectTemplate.fillColor}
                  opacity={isDead ? 0.15 : 0.25}
                  listening={false}
                />
              )}
              {(isFlowering || isAutumn) && (
                /* Special effects for flowering/autumn trees */
                <Circle
                  x={drawingState.currentPoint.x + (staticObjectTemplate.width / 2) * 0.2}
                  y={drawingState.currentPoint.y - (staticObjectTemplate.width / 2) * 0.2}
                  radius={(staticObjectTemplate.width / 2) * 0.4}
                  fill={isFlowering ? '#FFC0CB' : '#FF8C00'}
                  opacity={0.3}
                  listening={false}
                />
              )}
            </>
          )}
          {staticObjectTemplate.shape === 'polygon' && staticObjectTemplate.points && (
            <Line
              x={drawingState.currentPoint.x - staticObjectTemplate.width / 2}
              y={drawingState.currentPoint.y - staticObjectTemplate.height / 2}
              points={staticObjectTemplate.points}
              closed={true}
              fill={staticObjectTemplate.fillColor}
              stroke={staticObjectTemplate.strokeColor}
              strokeWidth={staticObjectTemplate.strokeWidth}
              lineCap="square"
              lineJoin="miter"
              shadowColor="black"
              shadowBlur={6}
              shadowOpacity={0.4}
              shadowOffset={{ x: 3, y: 4 }}
              listening={false}
            />
          )}
        </Group>
      </Layer>
    )
  }

  // Show measurement overlay when measure tool is active
  if (currentTool === 'measure') {
    return (
      <Layer>
        <MeasurementOverlay
          points={measurementPoints}
          currentPoint={drawingState.currentPoint || undefined}
          gridSize={gridSize}
          showSegmentDistances={true}
          showTotalDistance={true}
        />
      </Layer>
    )
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
      case 'line':
        return (
          <Line
            points={[startPoint.x, startPoint.y, currentPoint.x, currentPoint.y]}
            {...commonProps}
          />
        )
      case 'polygon':
        // For polygon, show all points plus current line to cursor
        if (drawingState.points && drawingState.points.length > 0) {
          // Convert Point objects to flat array of numbers
          const flatPoints: number[] = []
          drawingState.points.forEach(point => {
            if (typeof point === 'object' && point.x !== undefined && point.y !== undefined) {
              flatPoints.push(point.x, point.y)
            } else if (typeof point === 'number') {
              flatPoints.push(point)
            }
          })
          // Add current point
          const allPoints = [...flatPoints, currentPoint.x, currentPoint.y]
          return (
            <Line
              points={allPoints}
              closed={false}
              {...commonProps}
            />
          )
        } else {
          // First line of polygon
          return (
            <Line
              points={[startPoint.x, startPoint.y, currentPoint.x, currentPoint.y]}
              {...commonProps}
            />
          )
        }
      case 'select':
        // Show selection rectangle
        return (
          <Rect
            x={Math.min(startPoint.x, currentPoint.x)}
            y={Math.min(startPoint.y, currentPoint.y)}
            width={Math.abs(currentPoint.x - startPoint.x)}
            height={Math.abs(currentPoint.y - startPoint.y)}
            stroke="#3B82F6" // Blue selection color
            strokeWidth={1}
            dash={[5, 5]} // Dashed line
            fill="rgba(59, 130, 246, 0.1)" // Semi-transparent blue fill
            listening={false}
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
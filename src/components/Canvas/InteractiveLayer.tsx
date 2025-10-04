/**
 * InteractiveLayer - Selection, Drawing, and Preview overlays
 * Extracted from MapCanvas.tsx for better organization
 */

import { memo } from 'react'
import { Layer, Group, Rect, Circle, Line } from 'react-konva'
import { Token } from '../Token/Token'
import { MeasurementOverlay } from '../Tools/MeasurementOverlay'
import { StaticEffectPreview } from '../StaticEffect/StaticEffectPreview'
import AdvancedSelectionManager from '../Selection/SelectionManager'
import { snapToGrid } from '@/utils/grid'
import { isDrawingTool } from './utils'
import type { GridSettings, DrawingState, StaticObjectTemplate } from '@/types'
import type { Point } from '@/types/geometry'
import type { TokenTemplate } from '@/types/token'
import type { SelectionRectangle } from './types'
import type { StaticEffectTemplate } from '../StaticEffect/types'

export interface InteractiveLayerProps {
  readonly currentTool: string
  readonly gridSettings: GridSettings | undefined
  readonly isCreatingEvent: boolean
  readonly isSelecting: boolean
  readonly selectionRect: SelectionRectangle | null
  readonly drawingState: DrawingState
  readonly tokenTemplate: TokenTemplate | null
  readonly staticObjectTemplate: StaticObjectTemplate | null
  readonly staticEffectTemplate: StaticEffectTemplate | null
  readonly previewPosition: Point | null
  readonly measurementPoints: Point[]
  readonly fillColor: string
  readonly strokeColor: string
  readonly strokeWidth: number
  readonly opacity: number
  readonly terrainColor: string
  readonly terrainOpacity: number
}

export const InteractiveLayer = memo(function InteractiveLayer({
  currentTool,
  gridSettings,
  isCreatingEvent,
  isSelecting,
  selectionRect,
  drawingState,
  tokenTemplate,
  staticObjectTemplate,
  staticEffectTemplate,
  previewPosition,
  measurementPoints,
  fillColor,
  strokeColor,
  strokeWidth,
  opacity,
  terrainColor,
  terrainOpacity
}: InteractiveLayerProps) {
  const gridSize = gridSettings?.size || 50
  const gridSnap = gridSettings?.snap || false

  return (
    <Layer name="interactive">
      {/* Selection Group */}
      <Group name="selection" visible={currentTool === 'select' || isSelecting}>
        <AdvancedSelectionManager
          isActive={true}
          gridSize={gridSize}
        />
      </Group>

      {/* Drawing Group */}
      <Group
        name="drawing"
        visible={!isCreatingEvent && (isDrawingTool(currentTool) || currentTool === 'measure' || currentTool === 'token' || currentTool === 'staticObject')}
      >
        {/* Token preview */}
        {currentTool === 'token' && tokenTemplate && drawingState.currentPoint && !drawingState.isDrawing && !isCreatingEvent && (() => {
          const snappedPreviewPos = snapToGrid(drawingState.currentPoint, gridSize, gridSnap)
          return (
            <Group listening={false}>
              <Token
                token={{
                  id: 'preview-token',
                  type: 'token',
                  position: snappedPreviewPos,
                  rotation: 0,
                  layer: 999,
                  locked: false,
                  visible: true,
                  ...tokenTemplate,
                  opacity: 0.6
                }}
                gridSize={gridSize}
                isSelected={false}
                isDraggable={false}
              />
            </Group>
          )
        })()}

        {/* Static object preview */}
        {currentTool === 'staticObject' && staticObjectTemplate && drawingState.currentPoint && !drawingState.isDrawing && !isCreatingEvent && (() => {
          const snappedPreviewPos = snapToGrid(drawingState.currentPoint, gridSize, gridSnap)
          const sizeProps = staticObjectTemplate.sizeProperties || {}
          const width = sizeProps.width || 100
          const height = sizeProps.height || 60
          const radius = sizeProps.radius || 50

          return (
            <Group
              x={snappedPreviewPos.x}
              y={snappedPreviewPos.y}
              rotation={staticObjectTemplate.rotation || 0}
              opacity={staticObjectTemplate.defaultOpacity * 0.6}
              listening={false}
            >
              {staticObjectTemplate.type === 'rectangle' && (
                <Rect
                  x={-width / 2}
                  y={-height / 2}
                  width={width}
                  height={height}
                  fill={staticObjectTemplate.defaultColor}
                  stroke={staticObjectTemplate.defaultColor}
                  strokeWidth={2}
                  shadowColor="black"
                  shadowBlur={6}
                  shadowOpacity={0.4}
                  shadowOffset={{ x: 3, y: 4 }}
                  listening={false}
                />
              )}
              {staticObjectTemplate.type === 'circle' && (
                <Circle
                  x={0}
                  y={0}
                  radius={radius}
                  fill={staticObjectTemplate.defaultColor}
                  stroke={staticObjectTemplate.defaultColor}
                  strokeWidth={2}
                  shadowColor="black"
                  shadowBlur={6}
                  shadowOpacity={0.4}
                  shadowOffset={{ x: 3, y: 4 }}
                  listening={false}
                />
              )}
              {staticObjectTemplate.type === 'polygon' && (
                <Rect
                  x={-width / 2}
                  y={-height / 2}
                  width={width}
                  height={height}
                  fill={staticObjectTemplate.defaultColor}
                  stroke={staticObjectTemplate.defaultColor}
                  strokeWidth={2}
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
          )
        })()}

        {/* Selection rectangle preview */}
        {currentTool === 'select' && selectionRect && selectionRect.visible && (
          <Rect
            x={selectionRect.x}
            y={selectionRect.y}
            width={selectionRect.width}
            height={selectionRect.height}
            stroke="#3B82F6"
            strokeWidth={1}
            dash={[5, 5]}
            fill="rgba(59, 130, 246, 0.1)"
            listening={false}
          />
        )}

        {/* Measurement overlay */}
        {currentTool === 'measure' && (
          <MeasurementOverlay
            points={measurementPoints}
            currentPoint={drawingState.currentPoint || undefined}
            gridSize={gridSize}
            showSegmentDistances={true}
            showTotalDistance={true}
          />
        )}

        {/* Background shape drawing preview */}
        {drawingState.isDrawing && drawingState.startPoint && drawingState.currentPoint && (
          <>
            {currentTool === 'rectangle' && (
              <Rect
                x={Math.min(drawingState.startPoint.x, drawingState.currentPoint.x)}
                y={Math.min(drawingState.startPoint.y, drawingState.currentPoint.y)}
                width={Math.abs(drawingState.currentPoint.x - drawingState.startPoint.x)}
                height={Math.abs(drawingState.currentPoint.y - drawingState.startPoint.y)}
                fill={terrainColor}
                opacity={terrainOpacity * 0.7}
                listening={false}
              />
            )}
            {currentTool === 'circle' && (
              <Circle
                x={(drawingState.startPoint.x + drawingState.currentPoint.x) / 2}
                y={(drawingState.startPoint.y + drawingState.currentPoint.y) / 2}
                radius={Math.sqrt(
                  Math.pow(drawingState.currentPoint.x - drawingState.startPoint.x, 2) +
                  Math.pow(drawingState.currentPoint.y - drawingState.startPoint.y, 2)
                ) / 2}
                fill={terrainColor}
                opacity={terrainOpacity * 0.7}
                listening={false}
              />
            )}
            {(currentTool === 'line' || currentTool === 'polygon') && (
              <Line
                points={[
                  drawingState.startPoint.x,
                  drawingState.startPoint.y,
                  drawingState.currentPoint.x,
                  drawingState.currentPoint.y
                ]}
                stroke={terrainColor}
                strokeWidth={3}
                opacity={terrainOpacity * 0.7}
                listening={false}
              />
            )}
          </>
        )}
      </Group>

      {/* Preview Group */}
      <Group name="preview" visible={!!previewPosition && !!staticEffectTemplate && !isCreatingEvent}>
        {previewPosition && staticEffectTemplate && !isCreatingEvent && (
          <StaticEffectPreview
            template={staticEffectTemplate}
            position={previewPosition}
            visible={true}
          />
        )}
      </Group>
    </Layer>
  )
})

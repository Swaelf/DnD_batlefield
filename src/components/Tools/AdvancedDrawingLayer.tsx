import React, { useCallback } from 'react'
import { Layer } from 'react-konva'
import Konva from 'konva'
import useToolStore from '@store/toolStore'
import useMapStore from '@store/mapStore'
import { Point } from '@/types/geometry'
import { Shape } from '@/types/map'
import { nanoid } from 'nanoid'
import { AdvancedPolygonTool } from './AdvancedPolygonTool'
import { MeasurementOverlay } from './MeasurementOverlay'

type AdvancedDrawingLayerProps = {
  stageRef: React.RefObject<Konva.Stage>
  gridSize?: number
}

export const AdvancedDrawingLayer: React.FC<AdvancedDrawingLayerProps> = ({
  stageRef,
  gridSize = 50
}) => {
  const currentTool = useToolStore(state => state.currentTool)
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)
  const opacity = useToolStore(state => state.opacity)
  const measurementPoints = useToolStore(state => state.measurementPoints)
  const setTool = useToolStore(state => state.setTool)

  const currentMap = useMapStore(state => state.currentMap)
  const addObject = useMapStore(state => state.addObject)

  const gridSnap = currentMap?.grid.snap ?? true

  // Handle polygon completion
  const handlePolygonComplete = useCallback((points: Point[]) => {
    if (points.length < 3) return

    // Convert points to flat array for shape data
    const flatPoints = points.reduce<number[]>((acc, point) => {
      acc.push(point.x, point.y)
      return acc
    }, [])

    // Calculate polygon center for positioning
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length

    // Create shape object
    const shapeObject: Shape = {
      id: nanoid(),
      type: 'shape',
      shapeType: 'polygon',
      position: { x: centerX, y: centerY },
      rotation: 0,
      layer: 5, // Default drawing layer
      points: flatPoints,
      width: 0, // Not used for polygons
      height: 0, // Not used for polygons
      radius: 0, // Not used for polygons
      fill: fillColor,
      fillColor: fillColor,
      stroke: strokeColor,
      strokeColor: strokeColor,
      strokeWidth: strokeWidth,
      opacity: opacity,
      visible: true,
      locked: false
    }

    addObject(shapeObject)

    // Reset tool to select after creation
    setTool('select')
  }, [addObject, fillColor, strokeColor, strokeWidth, opacity, setTool])

  // Handle polygon tool cancellation
  const handlePolygonCancel = useCallback(() => {
    setTool('select')
  }, [setTool])

  // Render measurement overlay for measure tool
  if (currentTool === 'measure') {
    return (
      <Layer>
        <MeasurementOverlay
          points={measurementPoints}
          gridSize={gridSize}
          showSegmentDistances={true}
          showTotalDistance={true}
        />
      </Layer>
    )
  }

  // Render advanced polygon tool
  if (currentTool === 'polygon') {
    return (
      <Layer>
        <AdvancedPolygonTool
          isActive={true}
          gridSize={gridSize}
          gridSnap={gridSnap}
          onPolygonComplete={handlePolygonComplete}
          onCancel={handlePolygonCancel}
        />
      </Layer>
    )
  }

  // For other tools, return empty layer (handled by legacy DrawingLayer)
  return <Layer />
}

export default AdvancedDrawingLayer
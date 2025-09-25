import React, { useCallback } from 'react'
import { Group } from 'react-konva'
import useToolStore from '@store/toolStore'
import useMapStore from '@store/mapStore'
import { AdvancedRectangleTool } from './AdvancedRectangleTool'
import { AdvancedCircleTool } from './AdvancedCircleTool'
import { AdvancedLineTool } from './AdvancedLineTool'
import { AdvancedTextTool } from './AdvancedTextTool'
import { AdvancedPolygonTool } from './AdvancedPolygonTool'
import { snapToGrid } from '@/utils/grid'
import type { Point } from '@/types/geometry'

interface EnhancedDrawingToolsManagerProps {
  stageRef?: React.RefObject<any>
  gridSize: number
}

export const EnhancedDrawingToolsManager: React.FC<EnhancedDrawingToolsManagerProps> = ({
  stageRef,
  gridSize
}) => {
  const currentTool = useToolStore(state => state.currentTool)
  const currentMap = useMapStore(state => state.currentMap)
  const addObject = useMapStore(state => state.addObject)
  const setTool = useToolStore(state => state.setTool)

  const gridSettings = currentMap?.grid
  const gridSnap = gridSettings?.snap || false

  // Handle rectangle completion
  const handleRectangleComplete = useCallback((rectangle: {
    x: number
    y: number
    width: number
    height: number
    cornerRadius: number
  }) => {
    const rectObject = {
      id: crypto.randomUUID(),
      type: 'shape' as const,
      shapeType: 'rectangle' as const,
      position: { x: rectangle.x, y: rectangle.y },
      rotation: 0,
      layer: 4,
      width: rectangle.width,
      height: rectangle.height,
      cornerRadius: rectangle.cornerRadius,
      fill: '#3D3D2E',
      stroke: '#C9AD6A',
      strokeWidth: 2,
      opacity: 0.8,
      visible: true,
      locked: false
    }

    addObject(rectObject)
    console.log('Enhanced rectangle created:', rectObject)
  }, [addObject])

  // Handle circle completion
  const handleCircleComplete = useCallback((circle: {
    x: number
    y: number
    radiusX: number
    radiusY: number
    isEllipse: boolean
  }) => {
    if (circle.isEllipse) {
      // Create ellipse shape
      const ellipseObject = {
        id: crypto.randomUUID(),
        type: 'shape' as const,
        shapeType: 'ellipse' as const,
        position: { x: circle.x, y: circle.y },
        rotation: 0,
        layer: 4,
        radiusX: circle.radiusX,
        radiusY: circle.radiusY,
        fill: '#3D3D2E',
        stroke: '#C9AD6A',
        strokeWidth: 2,
        opacity: 0.8,
        visible: true,
        locked: false
      }

      addObject(ellipseObject)
      console.log('Enhanced ellipse created:', ellipseObject)
    } else {
      // Create circle shape
      const circleObject = {
        id: crypto.randomUUID(),
        type: 'shape' as const,
        shapeType: 'circle' as const,
        position: { x: circle.x, y: circle.y },
        rotation: 0,
        layer: 4,
        radius: circle.radiusX, // Use radiusX for perfect circles
        fill: '#3D3D2E',
        stroke: '#C9AD6A',
        strokeWidth: 2,
        opacity: 0.8,
        visible: true,
        locked: false
      }

      addObject(circleObject)
      console.log('Enhanced circle created:', circleObject)
    }
  }, [addObject])

  // Handle line completion
  const handleLineComplete = useCallback((line: {
    points: number[]
    hasArrowHead: boolean
    isMultiSegment: boolean
  }) => {
    const lineObject = {
      id: crypto.randomUUID(),
      type: 'shape' as const,
      shapeType: line.isMultiSegment ? 'polyline' : 'line' as const,
      position: { x: 0, y: 0 }, // Points are absolute
      rotation: 0,
      layer: 4,
      points: line.points,
      hasArrowHead: line.hasArrowHead,
      fill: 'transparent',
      stroke: '#C9AD6A',
      strokeWidth: 2,
      opacity: 0.8,
      visible: true,
      locked: false
    }

    addObject(lineObject)
    console.log('Enhanced line created:', lineObject)
  }, [addObject])

  // Handle text completion
  const handleTextComplete = useCallback((textData: {
    x: number
    y: number
    text: string
    fontSize: number
    fontFamily: string
    fill: string
    align: string
    fontStyle: string
  }) => {
    const textObject = {
      id: crypto.randomUUID(),
      type: 'text' as const,
      position: { x: textData.x, y: textData.y },
      rotation: 0,
      layer: 6,
      text: textData.text,
      fontSize: textData.fontSize,
      fontFamily: textData.fontFamily,
      fill: textData.fill,
      color: textData.fill, // Backward compatibility
      align: textData.align as 'left' | 'center' | 'right',
      fontStyle: textData.fontStyle,
      opacity: 1,
      visible: true,
      locked: false
    }

    addObject(textObject)
    console.log('Enhanced text created:', textObject)
  }, [addObject])

  // Handle polygon completion (from existing AdvancedPolygonTool)
  const handlePolygonComplete = useCallback((polygon: {
    points: number[]
  }) => {
    const polygonObject = {
      id: crypto.randomUUID(),
      type: 'shape' as const,
      shapeType: 'polygon' as const,
      position: { x: 0, y: 0 }, // Points are absolute
      rotation: 0,
      layer: 4,
      points: polygon.points,
      fill: '#3D3D2E',
      stroke: '#C9AD6A',
      strokeWidth: 2,
      opacity: 0.8,
      visible: true,
      locked: false
    }

    addObject(polygonObject)
    console.log('Enhanced polygon created:', polygonObject)
  }, [addObject])

  // Handle tool cancellation
  const handleCancel = useCallback(() => {
    setTool('select')
  }, [setTool])

  return (
    <Group>
      {/* Advanced Rectangle Tool */}
      <AdvancedRectangleTool
        isActive={currentTool === 'rectangle'}
        gridSize={gridSize}
        gridSnap={gridSnap}
        onRectangleComplete={handleRectangleComplete}
        onCancel={handleCancel}
      />

      {/* Advanced Circle Tool */}
      <AdvancedCircleTool
        isActive={currentTool === 'circle'}
        gridSize={gridSize}
        gridSnap={gridSnap}
        onCircleComplete={handleCircleComplete}
        onCancel={handleCancel}
      />

      {/* Advanced Line Tool */}
      <AdvancedLineTool
        isActive={currentTool === 'line'}
        gridSize={gridSize}
        gridSnap={gridSnap}
        onLineComplete={handleLineComplete}
        onCancel={handleCancel}
      />

      {/* Advanced Text Tool */}
      <AdvancedTextTool
        isActive={currentTool === 'text'}
        gridSize={gridSize}
        gridSnap={gridSnap}
        onTextComplete={handleTextComplete}
        onCancel={handleCancel}
      />

      {/* Advanced Polygon Tool */}
      <AdvancedPolygonTool
        isActive={currentTool === 'polygon'}
        gridSize={gridSize}
        gridSnap={gridSnap}
        onPolygonComplete={handlePolygonComplete}
        onCancel={handleCancel}
      />
    </Group>
  )
}

export default EnhancedDrawingToolsManager
import React, { useCallback, useRef, useState } from 'react'
import { Group, Layer } from 'react-konva'
import type Konva from 'konva'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { MultiSelectTool } from '@/components/Selection/MultiSelectTool'
import { TransformControls } from '@/components/Selection/TransformControls'
import { ObjectAlignmentSystem } from '@/components/Selection/ObjectAlignmentSystem'
import type { SelectionMode } from '@/components/Selection/AdvancedSelectionManager'

interface AdvancedCanvasInteractionLayerProps {
  width: number
  height: number
  stageRef: React.RefObject<Konva.Stage>
}

export const AdvancedCanvasInteractionLayer: React.FC<AdvancedCanvasInteractionLayerProps> = ({
  width: _width,
  height: _height,
  stageRef: _stageRef
}) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('pointer')
  const [isTransforming, setIsTransforming] = useState(false)
  const [showAlignment, _setShowAlignment] = useState(true)

  const layerRef = useRef<Konva.Layer>(null)

  const { currentTool } = useToolStore()
  const { selectedObjects, currentMap } = useMapStore()

  const isSelectToolActive = currentTool === 'select'

// Handle multi-selection complete
  const handleSelectionComplete = useCallback((selectedIds: string[]) => {
    console.log('Multi-selection completed:', selectedIds)
  }, [])

  // Handle transform events
  const handleTransformStart = useCallback(() => {
    setIsTransforming(true)
  }, [])

  const handleTransformEnd = useCallback(() => {
    setIsTransforming(false)
  }, [])

  // Handle keyboard shortcuts for selection modes
  React.useEffect(() => {
    if (!isSelectToolActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key) {
        case '1':
          setSelectionMode('pointer')
          break
        case '2':
          setSelectionMode('rectangle')
          break
        case '3':
          setSelectionMode('lasso')
          break
        case '4':
          setSelectionMode('magic')
          break
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            // Select all objects
            if (currentMap) {
              useMapStore.getState().selectMultiple(currentMap.objects.map(obj => obj.id))
            }
          }
          break
        case 'g':
          if (e.ctrlKey || e.metaKey && selectedObjects.length > 1) {
            e.preventDefault()
            // Group selected objects
            console.log('Group shortcut triggered')
          }
          break
        case 'u':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            // Ungroup selected objects
            console.log('Ungroup shortcut triggered')
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSelectToolActive, currentMap, selectedObjects])

  // Don't render if not using select tool
  if (!isSelectToolActive) {
    return null
  }

  return (
    <Layer ref={layerRef}>
      {/* Multi-Selection Tool */}
      <MultiSelectTool
        isActive={selectionMode !== 'pointer'}
        selectionMode={selectionMode}
        onSelectionComplete={handleSelectionComplete}
      />

      {/* Transform Controls */}
      <TransformControls
        isActive={selectedObjects.length > 0}
        selectedIds={selectedObjects}
        gridSize={50}
        gridSnap={true}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
      />

      {/* Object Alignment System */}
      <ObjectAlignmentSystem
        isActive={isTransforming && selectedObjects.length > 0}
        selectedObjects={selectedObjects}
        snapTolerance={8}
        showGuides={showAlignment}
      />

      {/* Visual feedback overlay */}
      <Group>
        {/* Selection mode indicator */}
        {selectionMode !== 'pointer' && (
          <Group x={20} y={20}>
            {/* Mode indicator background */}
            <rect
              width={120}
              height={30}
              fill="rgba(0, 0, 0, 0.8)"
              rx={4}
            />
          </Group>
        )}
      </Group>
    </Layer>
  )
}

export default AdvancedCanvasInteractionLayer
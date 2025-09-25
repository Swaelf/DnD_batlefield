import React, { useState, useEffect, useMemo, memo } from 'react'
import useMapStore from '@/store/mapStore'
import { Shape, Token, MapObject } from '@/types'
import { nanoid } from 'nanoid'
import { Trash2 } from 'lucide-react'
import { BaseProperties } from './BaseProperties'
import { TokenProperties } from './TokenProperties'
import { ShapeProperties } from './ShapeProperties'
import { ActionButtons } from './ActionButtons'
import { LayerControls } from './LayerControls'
import { LayerManagementPanel } from './LayerManagementPanel'
import { ShapeStylePanel } from './ShapeStylePanel'
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection,
  Button,
  Text
} from '@/components/ui'

const PropertiesPanelComponent: React.FC = () => {
  // Use specific selectors to prevent unnecessary re-renders
  const selectedObjects = useMapStore(state => state.selectedObjects) as string[]
  const currentMap = useMapStore(state => state.currentMap)
  const updateObject = useMapStore(state => state.updateObject)
  const deleteSelected = useMapStore(state => state.deleteSelected)
  const addObject = useMapStore(state => state.addObject)

  // Get selected object with memoization
  const selectedObject = useMemo(() => {
    if (selectedObjects.length !== 1) return null
    return currentMap?.objects.find(obj => obj.id === selectedObjects[0]) || null
  }, [selectedObjects, currentMap?.objects])

  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 })
  const [localRotation, setLocalRotation] = useState(0)
  const [localOpacity, setLocalOpacity] = useState(1)
  const [isVisible, setIsVisible] = useState(true)

  // Update local state when selection changes
  useEffect(() => {
    if (selectedObject) {
      setLocalPosition(selectedObject.position)
      setLocalRotation(selectedObject.rotation || 0)
      setLocalOpacity(selectedObject.opacity || 1)
      setIsVisible(selectedObject.visible !== false)
    }
  }, [selectedObject])

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!selectedObject) return
    const newPosition = { ...localPosition, [axis]: value }
    setLocalPosition(newPosition)
    updateObject(selectedObject.id, { position: newPosition })
  }

  const handleRotationChange = (value: number) => {
    if (!selectedObject) return
    setLocalRotation(value)
    updateObject(selectedObject.id, { rotation: value })
  }

  const handleOpacityChange = (value: number) => {
    if (!selectedObject) return
    setLocalOpacity(value)
    updateObject(selectedObject.id, { opacity: value })
  }

  const handleVisibilityToggle = () => {
    if (!selectedObject) return
    const newVisible = !isVisible
    setIsVisible(newVisible)
    updateObject(selectedObject.id, { visible: newVisible })
  }

  const handleDuplicate = () => {
    if (!selectedObject) return
    const newObject = {
      ...selectedObject,
      id: nanoid(),
      position: {
        x: selectedObject.position.x + 20,
        y: selectedObject.position.y + 20,
      }
    }
    addObject(newObject)
  }

  const handleUpdateObject = (updates: Partial<MapObject>) => {
    if (!selectedObject) return
    updateObject(selectedObject.id, updates)
  }

  // Handle empty selection
  if (selectedObjects.length === 0) {
    return (
      <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
        <PanelHeader>
          <PanelTitle>Properties</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <Text size="sm" color="gray400" css={{ marginBottom: '$4' }}>
            Select an object to edit its properties
          </Text>

          {/* Shape Style Panel for Drawing Tools */}
          <ShapeStylePanel />

          {/* Layer Management - Always Available */}
          <PanelSection divider>
            <LayerManagementPanel />
          </PanelSection>
        </PanelBody>
      </Panel>
    )
  }

  // Handle multi-selection
  if (selectedObjects.length > 1) {
    return (
      <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
        <PanelHeader>
          <PanelTitle>Multiple Selection</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <Text size="sm" color="gray300" css={{ marginBottom: '$4' }}>
            {selectedObjects.length} objects selected
          </Text>

          {/* Shape Style Panel for Drawing Tools */}
          <ShapeStylePanel />

          <Button
            onClick={deleteSelected}
            variant="destructive"
            fullWidth
            size="sm"
          >
            <Trash2 size={16} />
            Delete Selected
          </Button>
        </PanelBody>
      </Panel>
    )
  }

  if (!selectedObject) return null

  // Main properties panel
  return (
    <Panel size="sidebar" css={{ borderLeft: '1px solid $gray800' }}>
      <PanelHeader>
        <PanelTitle>Properties</PanelTitle>
      </PanelHeader>

      <PanelBody>
        {/* Base properties common to all objects */}
        <BaseProperties
          selectedObject={selectedObject}
          localPosition={localPosition}
          localRotation={localRotation}
          localOpacity={localOpacity}
          onPositionChange={handlePositionChange}
          onRotationChange={handleRotationChange}
          onOpacityChange={handleOpacityChange}
        />

        {/* Type-specific properties */}
        {selectedObject.type === 'shape' && (
          <ShapeProperties
            shape={selectedObject as Shape}
            onUpdate={handleUpdateObject}
          />
        )}
        {selectedObject.type === 'token' && (
          <TokenProperties
            token={selectedObject as Token}
            onUpdate={handleUpdateObject}
          />
        )}

        {/* Layer Management System */}
        <PanelSection divider>
          <LayerManagementPanel />
        </PanelSection>

        {/* Legacy Layer Controls */}
        <PanelSection divider>
          <LayerControls selectedObject={selectedObject} />
        </PanelSection>

        {/* Action Buttons */}
        <ActionButtons
          isVisible={isVisible}
          onVisibilityToggle={handleVisibilityToggle}
          onDuplicate={handleDuplicate}
          onDelete={deleteSelected}
        />
      </PanelBody>
    </Panel>
  )
}

export const PropertiesPanel = memo(PropertiesPanelComponent)
PropertiesPanel.displayName = 'PropertiesPanel'

export default PropertiesPanel
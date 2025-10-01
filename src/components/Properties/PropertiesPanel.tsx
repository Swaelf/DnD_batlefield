import { useState, useEffect, useMemo, memo, type CSSProperties } from 'react'
import useMapStore from '@/store/mapStore'
import type { Shape, Token, MapObject } from '@/types'
import { nanoid } from 'nanoid'
import { Trash2 } from '@/utils/optimizedIcons'
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
  PanelSection
} from '@/components/ui/Panel'
import { Button } from '@/components/primitives/ButtonVE'
import { Text } from '@/components/primitives/TextVE'

export type PropertiesPanelProps = {
  className?: string
  style?: CSSProperties
}

const PropertiesPanelComponent = ({ className, style }: PropertiesPanelProps) => {
  // Use specific selectors to prevent unnecessary re-renders
  const selectedObjects = useMapStore((state: any) => state.selectedObjects) as string[]
  const currentMap = useMapStore((state: any) => state.currentMap)
  const updateObject = useMapStore((state: any) => state.updateObject)
  const deleteSelected = useMapStore((state: any) => state.deleteSelected)
  const addObject = useMapStore((state: any) => state.addObject)

  // Get selected object with memoization
  const selectedObject = useMemo(() => {
    if (selectedObjects.length !== 1) return null
    return currentMap?.objects.find((obj: MapObject) => obj.id === selectedObjects[0]) || null
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

  const panelStyles: CSSProperties = {
    borderLeft: '1px solid var(--gray800)',
    ...style,
  }

  // Handle empty selection
  if (selectedObjects.length === 0) {
    return (
      <Panel size="sidebar" style={panelStyles} className={className}>
        <PanelHeader>
          <PanelTitle>Properties</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <Text style={{ fontSize: '14px', color: 'var(--gray400)', marginBottom: '16px' }}>
            Select an object to edit its properties
          </Text>

          {/* Shape Style Panel for Drawing Tools */}
          <ShapeStylePanel />

          {/* Layer Management - Always Available */}
          <PanelSection>
            <LayerManagementPanel />
          </PanelSection>
        </PanelBody>
      </Panel>
    )
  }

  // Handle multi-selection
  if (selectedObjects.length > 1) {
    return (
      <Panel size="sidebar" style={panelStyles} className={className}>
        <PanelHeader>
          <PanelTitle>Multiple Selection</PanelTitle>
        </PanelHeader>
        <PanelBody>
          <Text style={{ fontSize: '14px', color: 'var(--gray300)', marginBottom: '16px' }}>
            {selectedObjects.length} objects selected
          </Text>

          {/* Shape Style Panel for Drawing Tools */}
          <ShapeStylePanel />

          <Button
            onClick={deleteSelected}
            variant="destructive"
            size="sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}
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
    <Panel size="sidebar" style={panelStyles} className={className}>
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
        <PanelSection>
          <LayerManagementPanel />
        </PanelSection>

        {/* Legacy Layer Controls */}
        <PanelSection>
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
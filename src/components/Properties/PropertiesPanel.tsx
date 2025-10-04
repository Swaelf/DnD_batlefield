import { useState, useEffect, useMemo, memo, type CSSProperties } from 'react'
import useMapStore from '@/store/mapStore'
import type { Shape, Token, MapObject } from '@/types'
import { nanoid } from 'nanoid'
import { BaseProperties } from './BaseProperties'
import { TokenProperties } from './TokenProperties'
import { ShapeProperties } from './ShapeProperties'
import { StaticObjectPropertiesEditor } from './StaticObjectPropertiesEditor'
import { ActionButtons } from './ActionButtons'
import { LayerControls } from './LayerControls'
import { LayerManagementPanel } from './LayerManagementPanel'
import { ShapeStylePanel } from './ShapeStylePanel'
import { MapSettingsPanel } from './MapSettingsPanel'
import { BackgroundEditingPanel } from './BackgroundEditingPanel'
import useToolStore from '@/store/toolStore'
import { MultiSelectProperties } from './MultiSelectProperties'
import { ComponentErrorBoundary } from '../ErrorBoundary/ErrorBoundary'
import {
  Panel,
  PanelHeader,
  PanelTitle,
  PanelBody,
  PanelSection
} from '@/components/ui/Panel'
import { Text } from '@/components/primitives/TextVE'
import { Box } from '@/components/primitives/BoxVE'

export type PropertiesPanelProps = {
  className?: string
  style?: CSSProperties
}

const PropertiesPanelComponent = ({ className, style }: PropertiesPanelProps) => {
  // Use specific selectors to prevent unnecessary re-renders - hooks must be outside try-catch
  const selectedObjects = useMapStore((state: any) => state.selectedObjects) as string[]
  const currentMap = useMapStore((state: any) => state.currentMap)
  const updateObject = useMapStore((state: any) => state.updateObject)
  const deleteSelected = useMapStore((state: any) => state.deleteSelected)
  const addObject = useMapStore((state: any) => state.addObject)
  const isBackgroundEditMode = useToolStore((state: any) => state.isBackgroundEditMode)

  // Ensure selectedObjects is always an array
  const safeSelectedObjects = Array.isArray(selectedObjects) ? selectedObjects : []

  // Get selected object with memoization
  const selectedObject = useMemo(() => {
    if (safeSelectedObjects.length !== 1) return null
    return currentMap?.objects.find((obj: MapObject) => obj.id === safeSelectedObjects[0]) || null
  }, [safeSelectedObjects, currentMap?.objects])

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

  try {
    // Handle empty selection
    if (safeSelectedObjects.length === 0) {
      return (
        <Panel size="sidebar" style={panelStyles} className={className} data-testid="properties-panel-empty">
          <PanelHeader>
            <PanelTitle>Properties</PanelTitle>
          </PanelHeader>
          <PanelBody scrollable={true} style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }} className="custom-scrollbar">
            {/* Background Editing Panel - Show when in background edit mode */}
            {isBackgroundEditMode ? (
              <ComponentErrorBoundary
                name="BackgroundEditingPanel"
                fallback={<Text style={{ fontSize: '12px', color: 'var(--gray400)' }}>Background editing unavailable</Text>}
              >
                <BackgroundEditingPanel />
              </ComponentErrorBoundary>
            ) : (
              <>
                <Text style={{ fontSize: '14px', color: 'var(--gray400)', marginBottom: '16px' }}>
                  Select an object to edit its properties
                </Text>

                {/* Map Settings - Always Available */}
                <ComponentErrorBoundary
                  name="MapSettingsPanel"
                  fallback={<Text style={{ fontSize: '12px', color: 'var(--gray400)' }}>Map settings unavailable</Text>}
                >
                  <MapSettingsPanel />
                </ComponentErrorBoundary>

                {/* Shape Style Panel for Drawing Tools */}
                <ComponentErrorBoundary
                  name="ShapeStylePanel"
                  fallback={<Text style={{ fontSize: '12px', color: 'var(--gray400)' }}>Shape styles unavailable</Text>}
                >
                  <ShapeStylePanel />
                </ComponentErrorBoundary>

                {/* Layer Management - Always Available */}
                <PanelSection>
                  <ComponentErrorBoundary
                    name="LayerManagementPanel"
                    fallback={
                      <Box style={{ padding: '12px' }}>
                        <Text style={{ fontSize: '14px', color: 'var(--gray400)' }}>Layer management unavailable</Text>
                        <Text style={{ fontSize: '12px', color: 'var(--gray500)', marginTop: '8px' }}>
                          Try refreshing the page
                        </Text>
                      </Box>
                    }
                  >
                    <LayerManagementPanel />
                  </ComponentErrorBoundary>
                </PanelSection>
              </>
            )}
        </PanelBody>
      </Panel>
    )
  }

  // Handle multi-selection
  if (safeSelectedObjects.length > 1) {
    return (
      <Panel size="sidebar" style={panelStyles} className={className} data-testid="properties-panel-multi">
        <PanelHeader>
          <PanelTitle>Multiple Selection</PanelTitle>
        </PanelHeader>
        <PanelBody scrollable={true} style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }} className="custom-scrollbar">
          {/* Multi-select properties with rotation control */}
          <MultiSelectProperties
            selectedCount={safeSelectedObjects.length}
            onDelete={deleteSelected}
          />

          {/* Shape Style Panel for Drawing Tools */}
          <ShapeStylePanel />
        </PanelBody>
      </Panel>
    )
  }

  if (!selectedObject) return null

  // Main properties panel
  return (
    <Panel size="sidebar" style={panelStyles} className={className} data-testid="properties-panel">
      <PanelHeader>
        <PanelTitle>Properties</PanelTitle>
      </PanelHeader>

      <PanelBody scrollable={true} style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }} className="custom-scrollbar">
        {/* Check if it's a static object or static effect */}
        {selectedObject.type === 'shape' &&
         ((selectedObject as Shape).metadata?.isStatic || (selectedObject as Shape).metadata?.isStaticEffect) ? (
          <PanelSection>
            <StaticObjectPropertiesEditor
              staticObject={selectedObject as Shape}
              onUpdate={(updates) => {
                handleUpdateObject(updates)
                // Update local state for any properties that changed
                if (updates.rotation !== undefined) setLocalRotation(updates.rotation)
                if (updates.opacity !== undefined) setLocalOpacity(updates.opacity)
              }}
            />
          </PanelSection>
        ) : (
          <>
            {/* Base properties - only for non-token objects */}
            {selectedObject.type !== 'token' && (
              <BaseProperties
                selectedObject={selectedObject}
                localPosition={localPosition}
                localRotation={localRotation}
                localOpacity={localOpacity}
                onPositionChange={handlePositionChange}
                onRotationChange={handleRotationChange}
                onOpacityChange={handleOpacityChange}
              />
            )}

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
          </>
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
  } catch (error) {
    console.error('PropertiesPanel error:', error)
    // Return a fallback UI if there's an error
    return (
      <Panel size="sidebar" style={{ borderLeft: '1px solid var(--gray800)', ...style }} className={className} data-testid="properties-panel-error">
        <PanelHeader>
          <PanelTitle>Properties</PanelTitle>
        </PanelHeader>
        <PanelBody scrollable={true} style={{ maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }} className="custom-scrollbar">
          <Text style={{ fontSize: '14px', color: 'var(--gray400)' }}>
            Error loading properties panel. Please refresh.
          </Text>
        </PanelBody>
      </Panel>
    )
  }
}

export const PropertiesPanel = memo(PropertiesPanelComponent)
PropertiesPanel.displayName = 'PropertiesPanel'

export default PropertiesPanel
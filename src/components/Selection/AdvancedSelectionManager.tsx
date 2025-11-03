import { type FC, useCallback, useMemo, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { StaticObjectPropertiesEditor } from '@/components/Properties/StaticObjectPropertiesEditor'
import { BaseProperties } from '@/components/Properties/BaseProperties'
import {
  MousePointer,
  Square,
  Lasso,
  Wand2,
  Group,
  Ungroup,
  Copy,
  Clipboard,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Move3D,
  RotateCw
} from '@/utils/optimizedIcons'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import type { MapObject } from '@/types'
import { isStaticObject, isStaticEffectObject } from '@/types/typeGuards'

// Extended type for grouped objects
type GroupedMapObject = MapObject & {
  groupedObjects?: string[]
  groupId?: string
}


export type SelectionMode = 'pointer' | 'rectangle' | 'lasso' | 'magic'

interface AdvancedSelectionManagerProps {
  onSelectionModeChange?: (mode: SelectionMode) => void
}

export const AdvancedSelectionManager: FC<AdvancedSelectionManagerProps> = ({
  onSelectionModeChange
}) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('pointer')
  const [copiedObjects, setCopiedObjects] = useState<MapObject[]>([])
  const [rotationValue, setRotationValue] = useState(0)
  const [localPosition, setLocalPosition] = useState({ x: 0, y: 0 })
  const [localOpacity, setLocalOpacity] = useState(1)

  const {
    selectedObjects,
    currentMap,
    selectObject,
    selectMultiple,
    duplicateSelected,
    deleteSelected,
    updateObject,
    addObject
  } = useMapStore()

  const { setTool } = useToolStore()

  // Get selected object data
  const selectedObjectData = useMemo(() => {
    if (!currentMap || selectedObjects.length === 0) return []
    return currentMap.objects.filter(obj => selectedObjects.includes(obj.id))
  }, [currentMap, selectedObjects])

  // Get first selected object for BaseProperties
  const firstSelectedObject = selectedObjectData[0] || null

  // Update local state when selection changes (for single selection)
  useEffect(() => {
    if (firstSelectedObject) {
      setLocalPosition(firstSelectedObject.position || { x: 0, y: 0 })
      setRotationValue(firstSelectedObject.rotation || 0)
      setLocalOpacity(firstSelectedObject.opacity || 1)
    }
  }, [firstSelectedObject?.id])

  // Selection mode handlers
  const handleSelectionModeChange = useCallback((mode: SelectionMode) => {
    setSelectionMode(mode)
    onSelectionModeChange?.(mode)

    // Switch to select tool when changing selection mode
    setTool('select')
  }, [onSelectionModeChange, setTool])

  // Group operations
  const handleGroupObjects = useCallback(() => {
    if (selectedObjectData.length < 2) return

    // Calculate group bounds
    const bounds = selectedObjectData.reduce((acc, obj) => {
      const objBounds = {
        left: obj.position.x,
        top: obj.position.y,
        right: obj.position.x + (obj.width || 50),
        bottom: obj.position.y + (obj.height || 50)
      }

      return {
        left: Math.min(acc.left, objBounds.left),
        top: Math.min(acc.top, objBounds.top),
        right: Math.max(acc.right, objBounds.right),
        bottom: Math.max(acc.bottom, objBounds.bottom)
      }
    }, {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity
    })

    // Create group object
    const groupObject: GroupedMapObject = {
      id: uuidv4(),
      type: 'shape',
      position: { x: bounds.left, y: bounds.top },
      layer: Math.max(...selectedObjectData.map(obj => obj.layer || 0)),
      rotation: 0,
      visible: true,
      locked: false,
      groupedObjects: selectedObjects
    }

    // Update grouped objects to convert positions to relative within group
    selectedObjectData.forEach(obj => {
      updateObject(obj.id, {
        // Convert positions to relative within group
        position: {
          x: obj.position.x - bounds.left,
          y: obj.position.y - bounds.top
        }
      })
    })

    // Add group object and select it
    addObject(groupObject)
    selectObject(groupObject.id)
  }, [selectedObjectData, selectedObjects, updateObject, addObject, selectObject])

  const handleUngroupObjects = useCallback(() => {
    const groupObjects = selectedObjectData.filter(obj => 'groupedObjects' in obj && obj.groupedObjects !== undefined) as GroupedMapObject[]

    groupObjects.forEach(group => {
      if (!group.groupedObjects) return

      // Restore grouped objects to absolute positions
      const groupedIds = group.groupedObjects
      groupedIds.forEach(objId => {
        const obj = currentMap?.objects.find(o => o.id === objId)
        if (obj && obj.position) {
          updateObject(objId, {
            position: {
              x: obj.position.x + group.position.x,
              y: obj.position.y + group.position.y
            }
          })
        }
      })

      // Remove the group object
      deleteSelected()

      // Select the ungrouped objects
      selectMultiple(groupedIds)
    })
  }, [selectedObjectData, currentMap, updateObject, deleteSelected, selectMultiple])

  // Copy/Paste operations
  const handleCopyObjects = useCallback(() => {
    setCopiedObjects([...selectedObjectData])
  }, [selectedObjectData])

  const handlePasteObjects = useCallback(() => {
    if (copiedObjects.length === 0) return

    const newObjects = copiedObjects.map(obj => ({
      ...obj,
      id: uuidv4(),
      position: {
        x: obj.position.x + 20, // Offset pasted objects
        y: obj.position.y + 20
      }
    }))

    // Add pasted objects
    newObjects.forEach(obj => addObject(obj))

    // Select pasted objects
    selectMultiple(newObjects.map(obj => obj.id))
  }, [copiedObjects, addObject, selectMultiple])

  // Alignment operations
  const handleAlignObjects = useCallback((alignment: string) => {
    if (selectedObjectData.length < 2) return

    // Calculate bounds of all selected objects
    const bounds = selectedObjectData.reduce((acc, obj) => {
      const objBounds = {
        left: obj.position.x,
        top: obj.position.y,
        right: obj.position.x + (obj.width || 50),
        bottom: obj.position.y + (obj.height || 50),
        centerX: obj.position.x + (obj.width || 50) / 2,
        centerY: obj.position.y + (obj.height || 50) / 2
      }

      return {
        left: Math.min(acc.left, objBounds.left),
        top: Math.min(acc.top, objBounds.top),
        right: Math.max(acc.right, objBounds.right),
        bottom: Math.max(acc.bottom, objBounds.bottom),
        centerX: acc.centerX === null ? objBounds.centerX : (acc.centerX + objBounds.centerX) / 2,
        centerY: acc.centerY === null ? objBounds.centerY : (acc.centerY + objBounds.centerY) / 2
      }
    }, {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
      centerX: null as number | null,
      centerY: null as number | null
    })

    // Apply alignment
    selectedObjectData.forEach(obj => {
      const newPosition = { ...obj.position }

      switch (alignment) {
        case 'left':
          newPosition.x = bounds.left
          break
        case 'center':
          newPosition.x = (bounds.left + bounds.right) / 2 - (obj.width || 50) / 2
          break
        case 'right':
          newPosition.x = bounds.right - (obj.width || 50)
          break
        case 'top':
          newPosition.y = bounds.top
          break
        case 'middle':
          newPosition.y = (bounds.top + bounds.bottom) / 2 - (obj.height || 50) / 2
          break
        case 'bottom':
          newPosition.y = bounds.bottom - (obj.height || 50)
          break
      }

      updateObject(obj.id, { position: newPosition })
    })
  }, [selectedObjectData, updateObject])


  const selectionModes = [
    { id: 'pointer' as const, name: 'Pointer', icon: <MousePointer size={16} />, tooltip: 'Click to select individual objects' },
    { id: 'rectangle' as const, name: 'Rectangle', icon: <Square size={16} />, tooltip: 'Drag to select objects in rectangle' },
    { id: 'lasso' as const, name: 'Lasso', icon: <Lasso size={16} />, tooltip: 'Draw freehand selection area' },
    { id: 'magic' as const, name: 'Magic', icon: <Wand2 size={16} />, tooltip: 'Select similar objects automatically' }
  ]

  const hasSelection = selectedObjects.length > 0
  const hasMultipleSelection = selectedObjects.length > 1
  const hasGroupableObjects = selectedObjects.length > 1
  const hasGroups = selectedObjectData.some(obj => 'groupedObjects' in obj && obj.groupedObjects !== undefined)
  const hasCopiedObjects = copiedObjects.length > 0

  // Check if single static object is selected
  const singleStaticObject = selectedObjects.length === 1 &&
    selectedObjectData[0] &&
    (isStaticObject(selectedObjectData[0]) || isStaticEffectObject(selectedObjectData[0]))
      ? selectedObjectData[0] : null

  return (
    <Box
      style={{
        width: '280px',
        height: '100%',
        backgroundColor: 'var(--colors-dndBlack)',
        borderLeft: '1px solid var(--colors-gray700)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Selection Header */}
      <Box
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--colors-gray700)',
          backgroundColor: 'var(--colors-gray900)'
        }}
      >
        <Text
          variant="label"
          size="sm"
          style={{
            marginBottom: '12px',
            fontWeight: '600',
            color: 'var(--colors-secondary)'
          }}
        >
          Advanced Selection
        </Text>

        {/* Selection Mode Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          {selectionModes.map(mode => (
            <Button
              key={mode.id}
              variant={selectionMode === mode.id ? 'primary' : 'outline'}
              onClick={() => handleSelectionModeChange(mode.id)}
              title={mode.tooltip}
              style={{
                height: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                backgroundColor: selectionMode === mode.id ? 'var(--colors-secondary)' : 'var(--colors-gray800)',
                borderColor: selectionMode === mode.id ? 'var(--colors-secondary)' : 'var(--colors-gray600)',
                color: selectionMode === mode.id ? 'var(--colors-dndBlack)' : 'var(--colors-gray300)'
              }}
            >
              {mode.icon}
              <Text
                variant="label"
                size="xs"
                style={{
                  color: 'inherit'
                }}
              >
                {mode.name}
              </Text>
            </Button>
          ))}
        </Box>

        {/* Quick Actions */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <Button
            variant="outline"
            disabled={!hasGroupableObjects}
            onClick={handleGroupObjects}
            title="Group Selected Objects"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: hasGroupableObjects ? 'var(--colors-gray800)' : 'var(--colors-gray700)',
              borderColor: 'var(--colors-gray600)',
              color: hasGroupableObjects ? 'var(--colors-gray300)' : 'var(--colors-gray500)',
              opacity: hasGroupableObjects ? 1 : 0.5,
              cursor: hasGroupableObjects ? 'pointer' : 'not-allowed'
            }}
          >
            <Group size={16} />
          </Button>
          <Button
            variant="outline"
            disabled={!hasGroups}
            onClick={handleUngroupObjects}
            title="Ungroup Selected Objects"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: hasGroups ? 'var(--colors-gray800)' : 'var(--colors-gray700)',
              borderColor: 'var(--colors-gray600)',
              color: hasGroups ? 'var(--colors-gray300)' : 'var(--colors-gray500)',
              opacity: hasGroups ? 1 : 0.5,
              cursor: hasGroups ? 'pointer' : 'not-allowed'
            }}
          >
            <Ungroup size={16} />
          </Button>
          <Button
            variant="outline"
            disabled={!hasSelection}
            onClick={handleCopyObjects}
            title="Copy Selected Objects"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: hasSelection ? 'var(--colors-gray800)' : 'var(--colors-gray700)',
              borderColor: 'var(--colors-gray600)',
              color: hasSelection ? 'var(--colors-gray300)' : 'var(--colors-gray500)',
              opacity: hasSelection ? 1 : 0.5,
              cursor: hasSelection ? 'pointer' : 'not-allowed'
            }}
          >
            <Copy size={16} />
          </Button>
          <Button
            variant="outline"
            disabled={!hasCopiedObjects}
            onClick={handlePasteObjects}
            title="Paste Objects"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: hasCopiedObjects ? 'var(--colors-gray800)' : 'var(--colors-gray700)',
              borderColor: 'var(--colors-gray600)',
              color: hasCopiedObjects ? 'var(--colors-gray300)' : 'var(--colors-gray500)',
              opacity: hasCopiedObjects ? 1 : 0.5,
              cursor: hasCopiedObjects ? 'pointer' : 'not-allowed'
            }}
          >
            <Clipboard size={16} />
          </Button>
          <Button
            variant="outline"
            disabled={!hasSelection}
            onClick={() => duplicateSelected()}
            title="Duplicate Selected Objects"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: hasSelection ? 'var(--colors-gray800)' : 'var(--colors-gray700)',
              borderColor: 'var(--colors-gray600)',
              color: hasSelection ? 'var(--colors-gray300)' : 'var(--colors-gray500)',
              opacity: hasSelection ? 1 : 0.5,
              cursor: hasSelection ? 'pointer' : 'not-allowed'
            }}
          >
            <Move3D size={16} />
          </Button>
          <Button
            variant="outline"
            disabled={!hasSelection}
            onClick={deleteSelected}
            title="Delete Selected Objects"
            style={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: hasSelection ? 'var(--colors-gray800)' : 'var(--colors-gray700)',
              borderColor: 'var(--colors-gray600)',
              color: hasSelection ? 'var(--colors-gray300)' : 'var(--colors-gray500)',
              opacity: hasSelection ? 1 : 0.5,
              cursor: hasSelection ? 'pointer' : 'not-allowed'
            }}
          >
            <RotateCw size={16} />
          </Button>
        </Box>
      </Box>

      {/* Content Area */}
      <Box
        style={{
          padding: '16px',
          flex: 1,
          overflow: 'auto'
        }}
      >
        {/* Selection Info */}
        {hasSelection && (
          <Box
            style={{
              padding: '12px',
              backgroundColor: 'var(--colors-gray800)',
              borderRadius: '4px',
              marginBottom: '12px'
            }}
          >
            <Text
              variant="label"
              size="xs"
              style={{
                marginBottom: '8px',
                fontWeight: '600',
                color: 'var(--colors-secondary)'
              }}
            >
              Selection Info
            </Text>
            <Text
              variant="body"
              size="xs"
              style={{
                color: 'var(--colors-gray100)',
                marginBottom: '4px'
              }}
            >
              {selectedObjects.length} object{selectedObjects.length > 1 ? 's' : ''} selected
            </Text>
            <Text
              variant="body"
              size="xs"
              style={{
                color: 'var(--colors-gray400)'
              }}
            >
              Types: {[...new Set(selectedObjectData.map(obj => obj.type))].join(', ')}
            </Text>
          </Box>
        )}

        {/* Alignment Tools */}
        {hasMultipleSelection && (
          <Box
            style={{
              padding: '12px',
              backgroundColor: 'var(--colors-gray800)',
              borderRadius: '4px',
              marginBottom: '12px'
            }}
          >
            <Text
              variant="label"
              size="xs"
              style={{
                marginBottom: '8px',
                fontWeight: '600',
                color: 'var(--colors-secondary)'
              }}
            >
              Alignment
            </Text>

            <Text
              variant="body"
              size="xs"
              style={{
                marginBottom: '8px',
                color: 'var(--colors-gray400)'
              }}
            >
              Horizontal:
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              <Button variant="outline" onClick={() => handleAlignObjects('left')} title="Align Left" style={{ height: '32px', padding: '4px', backgroundColor: 'var(--colors-gray700)', borderColor: 'var(--colors-gray600)', color: 'var(--colors-gray300)' }}>
                <AlignHorizontalJustifyStart size={14} />
              </Button>
              <Button variant="outline" onClick={() => handleAlignObjects('center')} title="Align Center" style={{ height: '32px', padding: '4px', backgroundColor: 'var(--colors-gray700)', borderColor: 'var(--colors-gray600)', color: 'var(--colors-gray300)' }}>
                <AlignHorizontalJustifyCenter size={14} />
              </Button>
              <Button variant="outline" onClick={() => handleAlignObjects('right')} title="Align Right" style={{ height: '32px', padding: '4px', backgroundColor: 'var(--colors-gray700)', borderColor: 'var(--colors-gray600)', color: 'var(--colors-gray300)' }}>
                <AlignHorizontalJustifyEnd size={14} />
              </Button>
            </Box>

            <Text
              variant="body"
              size="xs"
              style={{
                marginBottom: '8px',
                color: 'var(--colors-gray400)'
              }}
            >
              Vertical:
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px'
              }}
            >
              <Button variant="outline" onClick={() => handleAlignObjects('top')} title="Align Top" style={{ height: '32px', padding: '4px', backgroundColor: 'var(--colors-gray700)', borderColor: 'var(--colors-gray600)', color: 'var(--colors-gray300)' }}>
                <AlignVerticalJustifyStart size={14} />
              </Button>
              <Button variant="outline" onClick={() => handleAlignObjects('middle')} title="Align Middle" style={{ height: '32px', padding: '4px', backgroundColor: 'var(--colors-gray700)', borderColor: 'var(--colors-gray600)', color: 'var(--colors-gray300)' }}>
                <AlignVerticalJustifyCenter size={14} />
              </Button>
              <Button variant="outline" onClick={() => handleAlignObjects('bottom')} title="Align Bottom" style={{ height: '32px', padding: '4px', backgroundColor: 'var(--colors-gray700)', borderColor: 'var(--colors-gray600)', color: 'var(--colors-gray300)' }}>
                <AlignVerticalJustifyEnd size={14} />
              </Button>
            </Box>
          </Box>
        )}

        {/* Static Object Properties Editor - for single static object */}
        {singleStaticObject && (
          <Box
            style={{
              padding: '12px',
              backgroundColor: 'var(--colors-gray800)',
              borderRadius: '4px',
              marginBottom: '12px'
            }}
          >
            <Text
              variant="label"
              size="xs"
              style={{
                marginBottom: '8px',
                fontWeight: '600',
                color: 'var(--colors-secondary)'
              }}
            >
              Static Object Properties
            </Text>
            <StaticObjectPropertiesEditor
              staticObject={singleStaticObject}
              onUpdate={(updates) => updateObject(singleStaticObject.id, updates)}
            />
          </Box>
        )}

        {/* Base Properties - for single non-static, non-token object */}
        {hasSelection && selectedObjects.length === 1 && !singleStaticObject && firstSelectedObject && firstSelectedObject.type !== 'token' && (
          <Box
            style={{
              padding: '12px',
              backgroundColor: 'var(--colors-gray800)',
              borderRadius: '4px',
              marginBottom: '12px'
            }}
          >
            <BaseProperties
              selectedObject={firstSelectedObject}
              localPosition={localPosition}
              localRotation={rotationValue}
              localOpacity={localOpacity}
              onPositionChange={(axis, value) => {
                const newPos = { ...localPosition, [axis]: value }
                setLocalPosition(newPos)
                updateObject(firstSelectedObject.id, { position: newPos })
              }}
              onRotationChange={(value) => {
                setRotationValue(value)
                updateObject(firstSelectedObject.id, { rotation: value })
              }}
              onOpacityChange={(value) => {
                setLocalOpacity(value)
                updateObject(firstSelectedObject.id, { opacity: value })
              }}
            />
          </Box>
        )}


        {/* Selection Mode Help */}
        <Box
          style={{
            padding: '12px',
            backgroundColor: 'var(--colors-gray800)',
            borderRadius: '4px'
          }}
        >
          <Text
            variant="label"
            size="xs"
            style={{
              marginBottom: '8px',
              fontWeight: '600',
              color: 'var(--colors-secondary)'
            }}
          >
            {selectionModes.find(m => m.id === selectionMode)?.name} Mode
          </Text>
          <Text
            variant="body"
            size="xs"
            style={{
              color: 'var(--colors-gray400)',
              marginBottom: '8px'
            }}
          >
            {selectionModes.find(m => m.id === selectionMode)?.tooltip}
          </Text>

          {selectionMode === 'pointer' && (
            <Box
              style={{
                marginTop: '8px'
              }}
            >
              <Text
                variant="body"
                size="xs"
                style={{
                  color: 'var(--colors-gray400)',
                  whiteSpace: 'pre-line'
                }}
              >
                • Click: Select object{"\n"}
                • Shift+Click: Add to selection{"\n"}
                • Ctrl+Click: Toggle selection{"\n"}
                • Click empty: Clear selection
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default AdvancedSelectionManager
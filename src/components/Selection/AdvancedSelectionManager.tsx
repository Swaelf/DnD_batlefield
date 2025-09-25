import React, { useCallback, useMemo, useRef, useState } from 'react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
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
} from 'lucide-react'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import { Point, MapObject } from '@/types'

const SelectionContainer = styled(Box, {
  width: 280,
  height: '100%',
  backgroundColor: '$dndBlack',
  borderLeft: '1px solid $gray800',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

const SelectionHeader = styled(Box, {
  padding: '$4',
  borderBottom: '1px solid $gray800',
  backgroundColor: '$gray900'
})

const SelectionModeGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$2',
  marginBottom: '$4'
})

const ModeButton = styled(Button, {
  height: 60,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '$1',
  padding: '$2',

  variants: {
    active: {
      true: {
        backgroundColor: '$secondary',
        color: '$dndBlack',
        '&:hover': {
          backgroundColor: '$secondary'
        }
      }
    }
  }
})

const ActionGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$2',
  marginBottom: '$4'
})

const ActionButton = styled(Button, {
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$2',
  fontSize: '$sm',

  variants: {
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed',
        '&:hover': {
          backgroundColor: '$gray700'
        }
      }
    }
  }
})

const AlignmentSection = styled(Box, {
  padding: '$3',
  backgroundColor: '$gray800',
  borderRadius: '$sm',
  marginBottom: '$3'
})

const AlignmentGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '$2'
})

const SelectionInfo = styled(Box, {
  padding: '$3',
  backgroundColor: '$gray800',
  borderRadius: '$sm',
  marginBottom: '$3'
})

export type SelectionMode = 'pointer' | 'rectangle' | 'lasso' | 'magic'

interface AdvancedSelectionManagerProps {
  onSelectionModeChange?: (mode: SelectionMode) => void
}

export const AdvancedSelectionManager: React.FC<AdvancedSelectionManagerProps> = ({
  onSelectionModeChange
}) => {
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('pointer')
  const [copiedObjects, setCopiedObjects] = useState<MapObject[]>([])

  const {
    selectedObjects,
    currentMap,
    selectObject,
    selectMultiple,
    clearSelection,
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
    const groupObject: MapObject = {
      id: crypto.randomUUID(),
      type: 'group',
      position: { x: bounds.left, y: bounds.top },
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
      layer: Math.max(...selectedObjectData.map(obj => obj.layer || 0)),
      rotation: 0,
      visible: true,
      locked: false,
      groupedObjects: selectedObjects
    }

    // Update grouped objects to reference the group
    selectedObjectData.forEach(obj => {
      updateObject(obj.id, {
        groupId: groupObject.id,
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
    const groupObjects = selectedObjectData.filter(obj => obj.type === 'group')

    groupObjects.forEach(group => {
      if (!group.groupedObjects) return

      // Restore grouped objects to absolute positions
      const groupedIds = group.groupedObjects
      groupedIds.forEach(objId => {
        const obj = currentMap?.objects.find(o => o.id === objId)
        if (obj && obj.position) {
          updateObject(objId, {
            groupId: undefined,
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
      id: crypto.randomUUID(),
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
      let newPosition = { ...obj.position }

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
  const hasGroups = selectedObjectData.some(obj => obj.type === 'group')
  const hasCopiedObjects = copiedObjects.length > 0

  return (
    <SelectionContainer>
      <SelectionHeader>
        <Text size="sm" weight="semibold" color="secondary" css={{ marginBottom: '$3' }}>
          Advanced Selection
        </Text>

        {/* Selection Mode Grid */}
        <SelectionModeGrid>
          {selectionModes.map(mode => (
            <ModeButton
              key={mode.id}
              active={selectionMode === mode.id}
              onClick={() => handleSelectionModeChange(mode.id)}
              title={mode.tooltip}
            >
              {mode.icon}
              <Text size="xs">{mode.name}</Text>
            </ModeButton>
          ))}
        </SelectionModeGrid>

        {/* Quick Actions */}
        <ActionGrid>
          <ActionButton
            disabled={!hasGroupableObjects}
            onClick={handleGroupObjects}
            title="Group Selected Objects"
          >
            <Group size={16} />
          </ActionButton>
          <ActionButton
            disabled={!hasGroups}
            onClick={handleUngroupObjects}
            title="Ungroup Selected Objects"
          >
            <Ungroup size={16} />
          </ActionButton>
          <ActionButton
            disabled={!hasSelection}
            onClick={handleCopyObjects}
            title="Copy Selected Objects"
          >
            <Copy size={16} />
          </ActionButton>
          <ActionButton
            disabled={!hasCopiedObjects}
            onClick={handlePasteObjects}
            title="Paste Objects"
          >
            <Clipboard size={16} />
          </ActionButton>
          <ActionButton
            disabled={!hasSelection}
            onClick={duplicateSelected}
            title="Duplicate Selected Objects"
          >
            <Move3D size={16} />
          </ActionButton>
          <ActionButton
            disabled={!hasSelection}
            onClick={deleteSelected}
            title="Delete Selected Objects"
          >
            <RotateCw size={16} />
          </ActionButton>
        </ActionGrid>
      </SelectionHeader>

      <Box padding="4" flex="1" overflow="auto">
        {/* Selection Info */}
        {hasSelection && (
          <SelectionInfo>
            <Text size="xs" weight="semibold" color="secondary" css={{ marginBottom: '8px' }}>
              Selection Info
            </Text>
            <Text size="xs">
              {selectedObjects.length} object{selectedObjects.length > 1 ? 's' : ''} selected
            </Text>
            <Text size="xs" color="gray400">
              Types: {[...new Set(selectedObjectData.map(obj => obj.type))].join(', ')}
            </Text>
          </SelectionInfo>
        )}

        {/* Alignment Tools */}
        {hasMultipleSelection && (
          <AlignmentSection>
            <Text size="xs" weight="semibold" color="secondary" css={{ marginBottom: '8px' }}>
              Alignment
            </Text>

            <Text size="xs" color="gray400" css={{ marginBottom: '$2' }}>
              Horizontal:
            </Text>
            <AlignmentGrid css={{ marginBottom: '$3' }}>
              <ActionButton onClick={() => handleAlignObjects('left')} title="Align Left">
                <AlignHorizontalJustifyStart size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleAlignObjects('center')} title="Align Center">
                <AlignHorizontalJustifyCenter size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleAlignObjects('right')} title="Align Right">
                <AlignHorizontalJustifyEnd size={14} />
              </ActionButton>
            </AlignmentGrid>

            <Text size="xs" color="gray400" css={{ marginBottom: '$2' }}>
              Vertical:
            </Text>
            <AlignmentGrid>
              <ActionButton onClick={() => handleAlignObjects('top')} title="Align Top">
                <AlignVerticalJustifyStart size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleAlignObjects('middle')} title="Align Middle">
                <AlignVerticalJustifyCenter size={14} />
              </ActionButton>
              <ActionButton onClick={() => handleAlignObjects('bottom')} title="Align Bottom">
                <AlignVerticalJustifyEnd size={14} />
              </ActionButton>
            </AlignmentGrid>
          </AlignmentSection>
        )}

        {/* Selection Mode Help */}
        <Box padding="3" backgroundColor="gray800" borderRadius="sm">
          <Text size="xs" weight="semibold" color="secondary" css={{ marginBottom: '8px' }}>
            {selectionModes.find(m => m.id === selectionMode)?.name} Mode
          </Text>
          <Text size="xs" color="gray400">
            {selectionModes.find(m => m.id === selectionMode)?.tooltip}
          </Text>

          {selectionMode === 'pointer' && (
            <Box marginTop="2">
              <Text size="xs" color="gray400">
                • Click: Select object<br/>
                • Shift+Click: Add to selection<br/>
                • Ctrl+Click: Toggle selection<br/>
                • Click empty: Clear selection
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </SelectionContainer>
  )
}

export default AdvancedSelectionManager
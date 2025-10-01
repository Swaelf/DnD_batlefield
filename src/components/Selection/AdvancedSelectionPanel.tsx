/**
 * Advanced Selection Panel Component
 * Professional selection tools and statistics interface
 */

import { useState, useCallback, useMemo, type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import {
  MousePointer,
  Square,
  Lasso,
  Wand2,
  Layers,
  Type,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  Maximize,
  Shuffle,
  Target,
  Plus,
  Minus,
  Palette
} from '@/utils/optimizedIcons'
import useMapStore from '@/store/mapStore'
import type { SelectionMode, SelectionFilter } from './SelectionManager'

export interface AdvancedSelectionPanelProps {
  selectionMode: SelectionMode
  selectionFilter: SelectionFilter
  onSelectionModeChange: (mode: SelectionMode) => void
  onSelectionFilterChange: (filter: SelectionFilter) => void
  onSelectByType?: (type: string) => void
  onSelectByLayer?: (layer: string) => void
  onSelectSimilar?: (criteria: 'size' | 'color' | 'layer' | 'type') => void
  onGrowSelection?: () => void
  onShrinkSelection?: () => void
  onUndoSelection?: () => void
  onRedoSelection?: () => void
}

export const AdvancedSelectionPanel: FC<AdvancedSelectionPanelProps> = ({
  selectionMode,
  selectionFilter,
  onSelectionModeChange,
  onSelectionFilterChange,
  onSelectByType: _onSelectByType,
  onSelectByLayer: _onSelectByLayer,
  onSelectSimilar,
  onGrowSelection,
  onShrinkSelection,
  onUndoSelection,
  onRedoSelection
}) => {
  const [showAdvancedTools, setShowAdvancedTools] = useState(false)
  // Alignment mode could be used for future UI features
  // const [alignmentMode, setAlignmentMode] = useState<'objects' | 'selection'>('objects')

  const currentMap = useMapStore(state => state.currentMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const selectMultipleObjects = useMapStore(state => state.selectMultiple)
  const deleteSelectedObjects = useMapStore(state => state.deleteSelected)
  const duplicateObjects = useMapStore(state => state.duplicateSelected)

  // Calculate selection statistics
  const selectionStats = useMemo(() => {
    if (!currentMap || selectedObjects.length === 0) {
      return null
    }

    const objects = currentMap.objects.filter(obj => selectedObjects.includes(obj.id))
    const typeCount = objects.reduce((acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: selectedObjects.length,
      types: typeCount,
      objects
    }
  }, [currentMap, selectedObjects])

  const selectionModes = [
    { id: 'rectangle' as SelectionMode, icon: <Square size={16} />, name: 'Rectangle' },
    { id: 'lasso' as SelectionMode, icon: <Lasso size={16} />, name: 'Lasso' },
    { id: 'magic-wand' as SelectionMode, icon: <Wand2 size={16} />, name: 'Magic Wand' },
    { id: 'by-type' as SelectionMode, icon: <Type size={16} />, name: 'By Type' }
  ]

  const selectionFilters = [
    { id: 'all' as SelectionFilter, name: 'All Objects' },
    { id: 'tokens' as SelectionFilter, name: 'Tokens' },
    { id: 'shapes' as SelectionFilter, name: 'Shapes' },
    { id: 'text' as SelectionFilter, name: 'Text' },
    { id: 'spells' as SelectionFilter, name: 'Spells' },
    { id: 'effects' as SelectionFilter, name: 'Effects' }
  ]

  const handleSelectAll = useCallback(() => {
    if (!currentMap) return
    const allIds = currentMap.objects.map(obj => obj.id)
    selectMultipleObjects(allIds)
  }, [currentMap, selectMultipleObjects])

  const handleDeselectAll = useCallback(() => {
    selectMultipleObjects([])
  }, [selectMultipleObjects])

  const handleInvertSelection = useCallback(() => {
    if (!currentMap) return
    const allIds = currentMap.objects.map(obj => obj.id)
    const unselectedIds = allIds.filter(id => !selectedObjects.includes(id))
    selectMultipleObjects(unselectedIds)
  }, [currentMap, selectedObjects, selectMultipleObjects])

  return (
    <Box
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: 'var(--colors-dndBlack)',
        borderLeft: '1px solid var(--colors-gray700)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Panel Header */}
      <Box
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--colors-gray700)',
          backgroundColor: 'var(--colors-gray800)'
        }}
      >
        <Text
          variant="heading"
          size="lg"
          style={{
            margin: '0 0 4px 0',
            fontWeight: '600',
            color: 'var(--colors-dndGold)'
          }}
        >
          Advanced Selection
        </Text>
        <Text
          variant="body"
          size="xs"
          style={{
            margin: 0,
            color: 'var(--colors-gray400)'
          }}
        >
          Professional selection tools
        </Text>
      </Box>

      {/* Panel Content */}
      <Box
        style={{
          flex: 1,
          padding: '16px',
          overflow: 'auto'
        }}
      >
        {/* Selection Mode */}
        <Box style={{ marginBottom: '24px' }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              margin: '0 0 12px 0',
              fontWeight: '500',
              color: 'var(--colors-dndGold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '12px'
            }}
          >
            Selection Mode
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '12px'
            }}
          >
            {selectionModes.map(mode => (
              <Button
                key={mode.id}
                variant={selectionMode === mode.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onSelectionModeChange(mode.id)}
                title={mode.name}
                style={{
                  height: '40px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selectionMode === mode.id ? 'var(--colors-dndGold)' : 'var(--colors-gray800)',
                  borderColor: selectionMode === mode.id ? 'var(--colors-dndGold)' : 'var(--colors-gray600)',
                  color: selectionMode === mode.id ? 'var(--colors-dndBlack)' : 'var(--colors-gray300)'
                }}
              >
                {mode.icon}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Selection Filter */}
        <Box style={{ marginBottom: '24px' }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              margin: '0 0 12px 0',
              fontWeight: '500',
              color: 'var(--colors-dndGold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '12px'
            }}
          >
            Object Filter
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {selectionFilters.map(filter => (
              <Button
                key={filter.id}
                variant={selectionFilter === filter.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onSelectionFilterChange(filter.id)}
                style={{
                  height: '32px',
                  justifyContent: 'flex-start',
                  paddingLeft: '12px',
                  backgroundColor: selectionFilter === filter.id ? 'var(--colors-purple700)' : 'transparent',
                  borderColor: selectionFilter === filter.id ? 'var(--colors-purple600)' : 'transparent',
                  color: selectionFilter === filter.id ? 'var(--colors-purple100)' : 'var(--colors-gray300)'
                }}
              >
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    margin: 0,
                    color: 'inherit'
                  }}
                >
                  {filter.name}
                </Text>
              </Button>
            ))}
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box style={{ marginBottom: '24px' }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              margin: '0 0 12px 0',
              fontWeight: '500',
              color: 'var(--colors-dndGold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '12px'
            }}
          >
            Quick Actions
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              title="Select All (Ctrl+A)"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '48px',
                backgroundColor: 'var(--colors-gray800)',
                borderColor: 'var(--colors-gray600)',
                color: 'var(--colors-gray300)'
              }}
            >
              <Target size={14} />
              <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>All</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              title="Deselect All"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '48px',
                backgroundColor: 'var(--colors-gray800)',
                borderColor: 'var(--colors-gray600)',
                color: 'var(--colors-gray300)'
              }}
            >
              <MousePointer size={14} />
              <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>None</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleInvertSelection}
              title="Invert Selection (Ctrl+I)"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '48px',
                backgroundColor: 'var(--colors-gray800)',
                borderColor: 'var(--colors-gray600)',
                color: 'var(--colors-gray300)'
              }}
            >
              <Shuffle size={14} />
              <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Invert</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedTools(!showAdvancedTools)}
              title="Advanced Tools"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '48px',
                backgroundColor: showAdvancedTools ? 'var(--colors-blue700)' : 'var(--colors-gray800)',
                borderColor: showAdvancedTools ? 'var(--colors-blue600)' : 'var(--colors-gray600)',
                color: showAdvancedTools ? 'var(--colors-blue100)' : 'var(--colors-gray300)'
              }}
            >
              <Plus size={14} />
              <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>More</Text>
            </Button>
          </Box>
        </Box>

        {/* Advanced Tools */}
        {showAdvancedTools && (
          <Box style={{ marginBottom: '24px' }}>
            <Text
              variant="heading"
              size="sm"
              style={{
                margin: '0 0 12px 0',
                fontWeight: '500',
                color: 'var(--colors-dndGold)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '12px'
              }}
            >
              Advanced Tools
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectSimilar?.('type')}
                title="Select Similar Type"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                <Type size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Type</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectSimilar?.('color')}
                title="Select Similar Color"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                <Palette size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Color</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectSimilar?.('size')}
                title="Select Similar Size"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                <Maximize size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Size</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectSimilar?.('layer')}
                title="Select Same Layer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                <Layers size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Layer</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onGrowSelection}
                title="Grow Selection"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                <Plus size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Grow</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShrinkSelection}
                title="Shrink Selection"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                <Minus size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Shrink</Text>
              </Button>
            </Box>
          </Box>
        )}

        {/* Selection History */}
        <Box style={{ marginBottom: '24px' }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              margin: '0 0 12px 0',
              fontWeight: '500',
              color: 'var(--colors-dndGold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '12px'
            }}
          >
            Selection History
          </Text>
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={onUndoSelection}
              title="Undo Selection"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '48px',
                backgroundColor: 'var(--colors-gray800)',
                borderColor: 'var(--colors-gray600)',
                color: 'var(--colors-gray300)'
              }}
            >
              <RotateCcw size={14} />
              <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Undo</Text>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedoSelection}
              title="Redo Selection"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '48px',
                backgroundColor: 'var(--colors-gray800)',
                borderColor: 'var(--colors-gray600)',
                color: 'var(--colors-gray300)'
              }}
            >
              <RotateCw size={14} />
              <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Redo</Text>
            </Button>
          </Box>
        </Box>

        {/* Selection Statistics */}
        {selectionStats && (
          <Box style={{ marginBottom: '24px' }}>
            <Text
              variant="heading"
              size="sm"
              style={{
                margin: '0 0 12px 0',
                fontWeight: '500',
                color: 'var(--colors-dndGold)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '12px'
              }}
            >
              Selection ({selectionStats.total} objects)
            </Text>
            <Box
              style={{
                padding: '12px',
                backgroundColor: 'var(--colors-gray800)',
                borderRadius: '6px',
                borderLeft: '3px solid var(--colors-dndGold)',
                marginBottom: '8px'
              }}
            >
              <Text
                variant="body"
                size="sm"
                style={{
                  margin: '0 0 8px 0',
                  fontWeight: '600',
                  color: 'var(--colors-dndGold)'
                }}
              >
                Selected Objects
              </Text>
              <Box>
                {Object.entries(selectionStats.types).map(([type, count]) => (
                  <Box
                    key={type}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '2px'
                    }}
                  >
                    <Text
                      variant="body"
                      size="xs"
                      style={{
                        margin: 0,
                        textTransform: 'capitalize',
                        color: 'var(--colors-gray300)'
                      }}
                    >
                      {type}:
                    </Text>
                    <Text
                      variant="body"
                      size="xs"
                      style={{
                        margin: 0,
                        color: 'var(--colors-dndGold)'
                      }}
                    >
                      {count}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        {/* Object Actions */}
        {selectedObjects.length > 0 && (
          <Box style={{ marginBottom: '24px' }}>
            <Text
              variant="heading"
              size="sm"
              style={{
                margin: '0 0 12px 0',
                fontWeight: '500',
                color: 'var(--colors-dndGold)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '12px'
              }}
            >
              Object Actions
            </Text>
            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => duplicateObjects?.()}
                title="Duplicate (Ctrl+D)"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-gray600)',
                  color: 'var(--colors-gray300)'
                }}
              >
                <Copy size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Duplicate</Text>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteSelectedObjects?.()}
                title="Delete (Del)"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '48px',
                  backgroundColor: 'var(--colors-gray800)',
                  borderColor: 'var(--colors-red600)',
                  color: 'var(--colors-red400)'
                }}
              >
                <Trash2 size={14} />
                <Text variant="body" size="xs" style={{ margin: 0, color: 'inherit' }}>Delete</Text>
              </Button>
            </Box>
          </Box>
        )}

        {/* Keyboard Shortcuts */}
        <Box style={{ marginBottom: '24px' }}>
          <Text
            variant="heading"
            size="sm"
            style={{
              margin: '0 0 12px 0',
              fontWeight: '500',
              color: 'var(--colors-dndGold)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '12px'
            }}
          >
            Keyboard Shortcuts
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { action: 'Select All', shortcut: 'Ctrl+A' },
              { action: 'Invert Selection', shortcut: 'Ctrl+I' },
              { action: 'Duplicate', shortcut: 'Ctrl+D' },
              { action: 'Delete', shortcut: 'Del' },
              { action: 'Deselect', shortcut: 'Esc' }
            ].map(({ action, shortcut }) => (
              <Box
                key={action}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--colors-gray300)'
                  }}
                >
                  {action}:
                </Text>
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--colors-gray400)',
                    fontFamily: 'monospace',
                    backgroundColor: 'var(--colors-gray800)',
                    padding: '2px 4px',
                    borderRadius: '3px'
                  }}
                >
                  {shortcut}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default AdvancedSelectionPanel
import React, { useState, useCallback } from 'react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
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
  AlignCenter,
  AlignLeft,
  AlignRight,
  DistributeHorizontally,
  DistributeVertically,
  Move,
  RotateCw as Rotate,
  Maximize,
  Shuffle,
  Target,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Palette
} from 'lucide-react'
import useMapStore from '@store/mapStore'
import useToolStore from '@store/toolStore'
import type { SelectionMode, SelectionFilter } from './SelectionManager'

const PanelContainer = styled(Box, {
  width: 320,
  height: '100%',
  backgroundColor: '$dndBlack',
  borderLeft: '1px solid $gray800',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
})

const PanelHeader = styled(Box, {
  padding: '$4',
  borderBottom: '1px solid $gray800',
  backgroundColor: '$gray900'
})

const PanelContent = styled(Box, {
  flex: 1,
  padding: '$4',
  overflow: 'auto'
})

const Section = styled(Box, {
  marginBottom: '$6'
})

const SectionTitle = styled(Text, {
  fontSize: '$sm',
  fontWeight: '$semibold',
  color: '$secondary',
  marginBottom: '$3',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
})

const ButtonGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '$2',
  marginBottom: '$3'
})

const ToolButton = styled(Button, {
  height: 40,
  padding: '$2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

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

const StatCard = styled(Box, {
  padding: '$3',
  backgroundColor: '$gray800',
  borderRadius: '$sm',
  borderLeft: '3px solid $secondary',
  marginBottom: '$2'
})

const ActionGrid = styled(Box, {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '$2'
})

interface AdvancedSelectionPanelProps {
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

export const AdvancedSelectionPanel: React.FC<AdvancedSelectionPanelProps> = ({
  selectionMode,
  selectionFilter,
  onSelectionModeChange,
  onSelectionFilterChange,
  onSelectByType,
  onSelectByLayer,
  onSelectSimilar,
  onGrowSelection,
  onShrinkSelection,
  onUndoSelection,
  onRedoSelection
}) => {
  const [showAdvancedTools, setShowAdvancedTools] = useState(false)
  const [alignmentMode, setAlignmentMode] = useState<'objects' | 'selection'>('objects')

  const currentMap = useMapStore(state => state.currentMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)
  const selectMultipleObjects = useMapStore(state => state.selectMultipleObjects)
  const deleteSelectedObjects = useMapStore(state => state.deleteSelectedObjects)
  const duplicateObjects = useMapStore(state => state.duplicateObjects)

  // Calculate selection statistics
  const selectionStats = React.useMemo(() => {
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
    <PanelContainer>
      <PanelHeader>
        <Text size="lg" weight="semibold" color="secondary">
          Advanced Selection
        </Text>
        <Text size="xs" color="gray400">
          Phase 18: Professional selection tools
        </Text>
      </PanelHeader>

      <PanelContent>
        {/* Selection Mode */}
        <Section>
          <SectionTitle>Selection Mode</SectionTitle>
          <ButtonGrid>
            {selectionModes.map(mode => (
              <ToolButton
                key={mode.id}
                active={selectionMode === mode.id}
                onClick={() => onSelectionModeChange(mode.id)}
                title={mode.name}
              >
                {mode.icon}
              </ToolButton>
            ))}
          </ButtonGrid>
        </Section>

        {/* Selection Filter */}
        <Section>
          <SectionTitle>Object Filter</SectionTitle>
          <Box display="flex" flexDirection="column" gap="$2">
            {selectionFilters.map(filter => (
              <ToolButton
                key={filter.id}
                active={selectionFilter === filter.id}
                onClick={() => onSelectionFilterChange(filter.id)}
                css={{ height: 32, justifyContent: 'flex-start', paddingLeft: '$3' }}
              >
                <Text size="xs">{filter.name}</Text>
              </ToolButton>
            ))}
          </Box>
        </Section>

        {/* Quick Actions */}
        <Section>
          <SectionTitle>Quick Actions</SectionTitle>
          <ActionGrid>
            <Button onClick={handleSelectAll} title="Select All (Ctrl+A)">
              <Target size={14} />
              <Text size="xs">All</Text>
            </Button>
            <Button onClick={handleDeselectAll} title="Deselect All">
              <MousePointer size={14} />
              <Text size="xs">None</Text>
            </Button>
            <Button onClick={handleInvertSelection} title="Invert Selection (Ctrl+I)">
              <Shuffle size={14} />
              <Text size="xs">Invert</Text>
            </Button>
            <Button
              onClick={() => setShowAdvancedTools(!showAdvancedTools)}
              title="Advanced Tools"
            >
              <Plus size={14} />
              <Text size="xs">More</Text>
            </Button>
          </ActionGrid>
        </Section>

        {/* Advanced Tools */}
        {showAdvancedTools && (
          <Section>
            <SectionTitle>Advanced Tools</SectionTitle>
            <ActionGrid>
              <Button onClick={() => onSelectSimilar?.('type')} title="Select Similar Type">
                <Type size={14} />
                <Text size="xs">Type</Text>
              </Button>
              <Button onClick={() => onSelectSimilar?.('color')} title="Select Similar Color">
                <Palette size={14} />
                <Text size="xs">Color</Text>
              </Button>
              <Button onClick={() => onSelectSimilar?.('size')} title="Select Similar Size">
                <Maximize size={14} />
                <Text size="xs">Size</Text>
              </Button>
              <Button onClick={() => onSelectSimilar?.('layer')} title="Select Same Layer">
                <Layers size={14} />
                <Text size="xs">Layer</Text>
              </Button>
              <Button onClick={onGrowSelection} title="Grow Selection">
                <Plus size={14} />
                <Text size="xs">Grow</Text>
              </Button>
              <Button onClick={onShrinkSelection} title="Shrink Selection">
                <Minus size={14} />
                <Text size="xs">Shrink</Text>
              </Button>
            </ActionGrid>
          </Section>
        )}

        {/* Selection History */}
        <Section>
          <SectionTitle>Selection History</SectionTitle>
          <ActionGrid>
            <Button onClick={onUndoSelection} title="Undo Selection">
              <RotateCcw size={14} />
              <Text size="xs">Undo</Text>
            </Button>
            <Button onClick={onRedoSelection} title="Redo Selection">
              <RotateCw size={14} />
              <Text size="xs">Redo</Text>
            </Button>
          </ActionGrid>
        </Section>

        {/* Selection Statistics */}
        {selectionStats && (
          <Section>
            <SectionTitle>Selection ({selectionStats.total} objects)</SectionTitle>
            <StatCard>
              <Text size="sm" weight="semibold" color="secondary">
                Selected Objects
              </Text>
              <Box marginTop="$2">
                {Object.entries(selectionStats.types).map(([type, count]) => (
                  <Box key={type} display="flex" justifyContent="space-between">
                    <Text size="xs" css={{ textTransform: 'capitalize' }}>{type}:</Text>
                    <Text size="xs" color="secondary">{count}</Text>
                  </Box>
                ))}
              </Box>
            </StatCard>
          </Section>
        )}

        {/* Object Actions */}
        {selectedObjects.length > 0 && (
          <Section>
            <SectionTitle>Object Actions</SectionTitle>
            <ActionGrid>
              <Button onClick={() => duplicateObjects?.()} title="Duplicate (Ctrl+D)">
                <Copy size={14} />
                <Text size="xs">Duplicate</Text>
              </Button>
              <Button onClick={() => deleteSelectedObjects?.()} title="Delete (Del)">
                <Trash2 size={14} />
                <Text size="xs">Delete</Text>
              </Button>
            </ActionGrid>
          </Section>
        )}

        {/* Transform Controls */}
        {selectedObjects.length > 0 && (
          <Section>
            <SectionTitle>Transform</SectionTitle>
            <ActionGrid>
              <Button title="Move Mode (M)">
                <Move size={14} />
                <Text size="xs">Move</Text>
              </Button>
              <Button title="Rotate Mode (R)">
                <Rotate size={14} />
                <Text size="xs">Rotate</Text>
              </Button>
              <Button title="Scale Mode (S)">
                <Maximize size={14} />
                <Text size="xs">Scale</Text>
              </Button>
            </ActionGrid>
          </Section>
        )}

        {/* Alignment Tools */}
        {selectedObjects.length > 1 && (
          <Section>
            <SectionTitle>Alignment</SectionTitle>
            <Box marginBottom="$2">
              <Text size="xs" color="gray400">Align:</Text>
              <ActionGrid css={{ marginTop: '$1' }}>
                <Button title="Align Left">
                  <AlignLeft size={14} />
                </Button>
                <Button title="Align Center">
                  <AlignCenter size={14} />
                </Button>
                <Button title="Align Right">
                  <AlignRight size={14} />
                </Button>
              </ActionGrid>
            </Box>

            <Box>
              <Text size="xs" color="gray400">Distribute:</Text>
              <ActionGrid css={{ marginTop: '$1' }}>
                <Button title="Distribute Horizontally">
                  <DistributeHorizontally size={14} />
                </Button>
                <Button title="Distribute Vertically">
                  <DistributeVertically size={14} />
                </Button>
              </ActionGrid>
            </Box>
          </Section>
        )}

        {/* Keyboard Shortcuts */}
        <Section>
          <SectionTitle>Keyboard Shortcuts</SectionTitle>
          <Box display="flex" flexDirection="column" gap="$1">
            <Box display="flex" justifyContent="space-between">
              <Text size="xs">Select All:</Text>
              <Text size="xs" color="gray400" fontFamily="$mono">Ctrl+A</Text>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Text size="xs">Invert Selection:</Text>
              <Text size="xs" color="gray400" fontFamily="$mono">Ctrl+I</Text>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Text size="xs">Duplicate:</Text>
              <Text size="xs" color="gray400" fontFamily="$mono">Ctrl+D</Text>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Text size="xs">Delete:</Text>
              <Text size="xs" color="gray400" fontFamily="$mono">Del</Text>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Text size="xs">Deselect:</Text>
              <Text size="xs" color="gray400" fontFamily="$mono">Esc</Text>
            </Box>
          </Box>
        </Section>
      </PanelContent>
    </PanelContainer>
  )
}

export default AdvancedSelectionPanel
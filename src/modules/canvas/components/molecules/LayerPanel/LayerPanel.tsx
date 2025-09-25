/**
 * LayerPanel Molecule - Layer management UI with controls
 *
 * Provides a complete layer management interface using LayerIndicator atoms
 * with reordering, visibility controls, and layer creation.
 */

import React from 'react'
import { Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { LayerIndicator } from '../../atoms'
import type { LayerInstance } from '../../../types'

export interface LayerPanelProps {
  readonly layers: readonly LayerInstance[]
  readonly activeLayerId: string | null
  readonly onLayerSelect: (layerId: string) => void
  readonly onToggleVisibility: (layerId: string) => void
  readonly onToggleLock: (layerId: string) => void
  readonly onMoveLayer: (layerId: string, direction: 'up' | 'down') => void
  readonly onDeleteLayer: (layerId: string) => void
  readonly onCreateLayer: () => void
  readonly canCreateLayer?: boolean
  readonly canDeleteLayer?: (layerId: string) => boolean
}

const PanelContainer = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  padding: '$3',
  backgroundColor: '$dndBlack',
  borderRadius: '$md',
  border: '1px solid $gray800',
  minWidth: '200px',
  maxHeight: '400px',
  overflowY: 'auto'
})

const PanelHeader = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '$2',
  borderBottom: '1px solid $gray800'
})

const LayerList = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1'
})

const LayerItem = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2',
  borderRadius: '$sm',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '$gray800/50'
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$dndRed/20',
        borderLeft: '3px solid $dndRed'
      }
    },
    locked: {
      true: {
        opacity: 0.7
      }
    }
  }
})

const LayerName = styled(Text, {
  flex: 1,
  fontSize: '$sm',
  fontWeight: '$medium',
  color: '$gray100',
  textTransform: 'capitalize'
})

const LayerControls = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const ControlButton = styled(Button, {
  variants: {
    size: {
      xs: {
        padding: '$1',
        minHeight: 'auto'
      }
    }
  }
})

export const LayerPanel: React.FC<LayerPanelProps> = React.memo(({
  layers,
  activeLayerId,
  onLayerSelect,
  onToggleVisibility,
  onToggleLock,
  onMoveLayer,
  onDeleteLayer,
  onCreateLayer,
  canCreateLayer = true,
  canDeleteLayer = () => true
}) => {
  // Sort layers by z-index (bottom to top for UI display)
  const sortedLayers = [...layers].sort((a, b) => a.config.zIndex - b.config.zIndex)

  const handleMoveUp = (layerId: string, index: number) => {
    if (index < sortedLayers.length - 1) {
      onMoveLayer(layerId, 'up')
    }
  }

  const handleMoveDown = (layerId: string, index: number) => {
    if (index > 0) {
      onMoveLayer(layerId, 'down')
    }
  }

  return (
    <PanelContainer>
      <PanelHeader>
        <Text size="sm" weight="semibold" color="gray100">
          Layers ({layers.length})
        </Text>
        {canCreateLayer && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCreateLayer}
            title="Create new layer"
          >
            <Plus size={16} />
          </Button>
        )}
      </PanelHeader>

      <LayerList>
        {sortedLayers.map((layer, index) => {
          const isActive = layer.config.id === activeLayerId
          const isLocked = false // Would come from store
          const canDelete = canDeleteLayer(layer.config.id)
          const canMoveUp = index < sortedLayers.length - 1
          const canMoveDown = index > 0

          return (
            <LayerItem
              key={layer.config.id}
              active={isActive}
              locked={isLocked}
              onClick={() => onLayerSelect(layer.config.id)}
            >
              <LayerIndicator
                isVisible={layer.config.visible}
                isLocked={isLocked}
                isActive={isActive}
                onToggleVisible={() => onToggleVisibility(layer.config.id)}
                onToggleLock={() => onToggleLock(layer.config.id)}
              />

              <LayerName>{layer.config.name}</LayerName>

              <LayerControls>
                <ControlButton
                  variant="ghost"
                  size="xs"
                  disabled={!canMoveUp}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMoveUp(layer.config.id, index)
                  }}
                  title="Move layer up"
                >
                  <ChevronUp size={12} />
                </ControlButton>

                <ControlButton
                  variant="ghost"
                  size="xs"
                  disabled={!canMoveDown}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMoveDown(layer.config.id, index)
                  }}
                  title="Move layer down"
                >
                  <ChevronDown size={12} />
                </ControlButton>

                {canDelete && (
                  <ControlButton
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteLayer(layer.config.id)
                    }}
                    title="Delete layer"
                  >
                    <Trash2 size={12} />
                  </ControlButton>
                )}
              </LayerControls>
            </LayerItem>
          )
        })}
      </LayerList>

      {layers.length === 0 && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding="$4"
        >
          <Text size="sm" color="gray500">
            No layers created yet
          </Text>
        </Box>
      )}
    </PanelContainer>
  )
})

LayerPanel.displayName = 'LayerPanel'
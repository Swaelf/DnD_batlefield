/**
 * LayerPanel Molecule - Layer management UI with controls
 *
 * Provides a complete layer management interface using LayerIndicator atoms
 * with reordering, visibility controls, and layer creation.
 */

import React from 'react'
import { Plus, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import { Box, Text, Button } from '@/components/primitives'
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

// Helper functions for styling
const getPanelContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
  padding: '12px',
  backgroundColor: 'var(--dnd-black)',
  borderRadius: '6px',
  border: '1px solid var(--gray-800)',
  minWidth: '200px',
  maxHeight: '400px',
  overflowY: 'auto' as const
})

const getPanelHeaderStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--gray-800)'
})

const getLayerListStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '4px'
})

const getLayerItemStyles = (isActive = false, isLocked = false): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: isActive ? 'rgba(146, 38, 16, 0.2)' : 'transparent',
  borderLeft: isActive ? '3px solid var(--dnd-red)' : 'none',
  opacity: isLocked ? 0.7 : 1
})

const getLayerNameStyles = (): React.CSSProperties => ({
  flex: 1,
  fontSize: '14px',
  fontWeight: '500',
  color: 'var(--gray-100)',
  textTransform: 'capitalize' as const
})

const getLayerControlsStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
})

const getControlButtonStyles = (): React.CSSProperties => ({
  padding: '4px',
  minHeight: 'auto',
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '2px',
  color: 'var(--gray-400)',
  cursor: 'pointer',
  transition: 'color 0.2s ease'
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
    <Box style={getPanelContainerStyles()}>
      <Box style={getPanelHeaderStyles()}>
        <Text style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-100)' }}>
          Layers ({layers.length})
        </Text>
        {canCreateLayer && (
          <Button
            onClick={onCreateLayer}
            title="Create new layer"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--gray-400)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'var(--gray-800)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <Plus size={16} />
          </Button>
        )}
      </Box>

      <Box style={getLayerListStyles()}>
        {sortedLayers.map((layer, index) => {
          const isActive = layer.config.id === activeLayerId
          const isLocked = false // Would come from store
          const canDelete = canDeleteLayer(layer.config.id)
          const canMoveUp = index < sortedLayers.length - 1
          const canMoveDown = index > 0

          return (
            <Box
              key={layer.config.id}
              onClick={() => onLayerSelect(layer.config.id)}
              style={{
                ...getLayerItemStyles(isActive, isLocked)
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.5)'
                }
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <LayerIndicator
                isVisible={layer.config.visible}
                isLocked={isLocked}
                isActive={isActive}
                onToggleVisible={() => onToggleVisibility(layer.config.id)}
                onToggleLock={() => onToggleLock(layer.config.id)}
              />

              <Text style={getLayerNameStyles()}>{layer.config.name}</Text>

              <Box style={getLayerControlsStyles()}>
                <Button
                  disabled={!canMoveUp}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    handleMoveUp(layer.config.id, index)
                  }}
                  title="Move layer up"
                  style={{
                    ...getControlButtonStyles(),
                    opacity: !canMoveUp ? 0.5 : 1,
                    cursor: !canMoveUp ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (canMoveUp) {
                      e.currentTarget.style.color = 'var(--gray-200)'
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (canMoveUp) {
                      e.currentTarget.style.color = 'var(--gray-400)'
                    }
                  }}
                >
                  <ChevronUp size={12} />
                </Button>

                <Button
                  disabled={!canMoveDown}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    handleMoveDown(layer.config.id, index)
                  }}
                  title="Move layer down"
                  style={{
                    ...getControlButtonStyles(),
                    opacity: !canMoveDown ? 0.5 : 1,
                    cursor: !canMoveDown ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (canMoveDown) {
                      e.currentTarget.style.color = 'var(--gray-200)'
                    }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                    if (canMoveDown) {
                      e.currentTarget.style.color = 'var(--gray-400)'
                    }
                  }}
                >
                  <ChevronDown size={12} />
                </Button>

                {canDelete && (
                  <Button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation()
                      onDeleteLayer(layer.config.id)
                    }}
                    title="Delete layer"
                    style={{
                      ...getControlButtonStyles(),
                      color: 'var(--error)'
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.color = 'var(--red-400)'
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.color = 'var(--error)'
                    }}
                  >
                    <Trash2 size={12} />
                  </Button>
                )}
              </Box>
            </Box>
          )
        })}
      </Box>

      {layers.length === 0 && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <Text style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
            No layers created yet
          </Text>
        </Box>
      )}
    </Box>
  )
})

LayerPanel.displayName = 'LayerPanel'
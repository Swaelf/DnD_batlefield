import React, { useState, useCallback, useRef } from 'react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Move,
  Layers,
  Palette,
  Settings,
  MoreVertical,
  GripVertical
} from 'lucide-react'
import { useLayerStore, LayerDefinition } from '@store/layerStore'
import useMapStore from '@store/mapStore'
import { useDragAndDrop } from '@hooks/useDragAndDrop'

const PanelContainer = styled(Box, {
  width: 280,
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
  backgroundColor: '$gray900',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
})

const LayersContainer = styled(Box, {
  flex: 1,
  overflow: 'auto',
  padding: '$2'
})

const LayerItem = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  padding: '$2',
  marginBottom: '$1',
  borderRadius: '$sm',
  backgroundColor: '$gray800',
  border: '1px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '$gray700',
    borderColor: '$gray600'
  },

  variants: {
    selected: {
      true: {
        backgroundColor: '$secondary',
        color: '$dndBlack',
        borderColor: '$secondary',

        '&:hover': {
          backgroundColor: '$secondary'
        }
      }
    },
    isDragging: {
      true: {
        opacity: 0.5,
        transform: 'rotate(5deg)',
        zIndex: 1000
      }
    },
    isDropTarget: {
      true: {
        borderColor: '$primary',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(201, 173, 106, 0.1)'
      }
    }
  }
})

const LayerPreview = styled(Box, {
  width: 24,
  height: 24,
  borderRadius: '$xs',
  border: '1px solid $gray600',
  marginRight: '$2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xs',
  flexShrink: 0
})

const LayerName = styled(Text, {
  flex: 1,
  fontSize: '$sm',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

const LayerControls = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  opacity: 0,
  transition: 'opacity 0.2s ease',

  '$LayerItem:hover &': {
    opacity: 1
  }
})

const IconButton = styled(Button, {
  width: 24,
  height: 24,
  padding: 0,
  minWidth: 'unset',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  variants: {
    active: {
      true: {
        backgroundColor: '$primary',
        color: '$white'
      }
    }
  }
})

const OpacitySlider = styled('input', {
  width: '100%',
  height: 4,
  borderRadius: 2,
  background: '$gray700',
  outline: 'none',
  appearance: 'none',

  '&::-webkit-slider-thumb': {
    appearance: 'none',
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '$secondary',
    cursor: 'pointer'
  },

  '&::-moz-range-thumb': {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '$secondary',
    cursor: 'pointer',
    border: 'none'
  }
})

const LayerStats = styled(Box, {
  padding: '$3',
  backgroundColor: '$gray800',
  borderRadius: '$sm',
  marginBottom: '$3'
})

interface AdvancedLayerPanelProps {
  onLayerChange?: (layerId: string) => void
}

export const AdvancedLayerPanel: React.FC<AdvancedLayerPanelProps> = ({
  onLayerChange
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [showLayerSettings, setShowLayerSettings] = useState<string | null>(null)

  const {
    layers,
    createLayer,
    deleteLayer,
    updateLayer,
    reorderLayers,
    duplicateLayer,
    mergeLayer
  } = useLayerStore()

  const currentMap = useMapStore(state => state.currentMap)
  const selectedObjects = useMapStore(state => state.selectedObjects)

  // Calculate layer statistics
  const getLayerStats = useCallback((layer: LayerDefinition) => {
    if (!currentMap) return { objectCount: 0, types: {} }

    const layerObjects = currentMap.objects.filter(obj =>
      obj.layerId === layer.id || obj.layer === layer.zIndex
    )

    const typeCount = layerObjects.reduce((acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      objectCount: layerObjects.length,
      types: typeCount
    }
  }, [currentMap])

  // Handle layer drag and drop
  const handleDragStart = useCallback((layerId: string, e: React.DragEvent) => {
    setDraggedLayer(layerId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', layerId)
  }, [])

  const handleDragOver = useCallback((layerId: string, e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(layerId)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropTarget(null)
  }, [])

  const handleDrop = useCallback((targetLayerId: string, e: React.DragEvent) => {
    e.preventDefault()
    const draggedLayerId = e.dataTransfer.getData('text/plain')

    if (draggedLayerId && draggedLayerId !== targetLayerId) {
      // Reorder layers
      const draggedIndex = layers.findIndex(l => l.id === draggedLayerId)
      const targetIndex = layers.findIndex(l => l.id === targetLayerId)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        reorderLayers(draggedLayerId, targetIndex)
      }
    }

    setDraggedLayer(null)
    setDropTarget(null)
  }, [layers, reorderLayers])

  // Layer visibility toggle
  const toggleLayerVisibility = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      updateLayer(layerId, { visible: !layer.visible })
    }
  }, [layers, updateLayer])

  // Layer lock toggle
  const toggleLayerLock = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      updateLayer(layerId, { locked: !layer.locked })
    }
  }, [layers, updateLayer])

  // Layer opacity change
  const handleOpacityChange = useCallback((layerId: string, opacity: number) => {
    updateLayer(layerId, { opacity })
  }, [updateLayer])

  // Create new layer
  const handleCreateLayer = useCallback(() => {
    const newLayer = createLayer({
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      color: '#C9AD6A',
      zIndex: Math.max(...layers.map(l => l.zIndex), 0) + 1
    })
    setSelectedLayerId(newLayer.id)
    onLayerChange?.(newLayer.id)
  }, [layers, createLayer, onLayerChange])

  // Delete layer
  const handleDeleteLayer = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteLayer(layerId)
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null)
    }
  }, [deleteLayer, selectedLayerId])

  // Duplicate layer
  const handleDuplicateLayer = useCallback((layerId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    duplicateLayer(layerId)
  }, [duplicateLayer])

  // Select layer
  const handleSelectLayer = useCallback((layerId: string) => {
    setSelectedLayerId(layerId)
    onLayerChange?.(layerId)
  }, [onLayerChange])

  // Toggle layer expansion
  const toggleLayerExpansion = useCallback((layerId: string) => {
    const newExpanded = new Set(expandedLayers)
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId)
    } else {
      newExpanded.add(layerId)
    }
    setExpandedLayers(newExpanded)
  }, [expandedLayers])

  return (
    <PanelContainer>
      <PanelHeader>
        <Box display="flex" alignItems="center" gap="$2">
          <Layers size={16} />
          <Text size="sm" weight="semibold" color="secondary">
            Layers
          </Text>
        </Box>

        <Box display="flex" alignItems="center" gap="$1">
          <IconButton onClick={handleCreateLayer} title="Create New Layer">
            <Plus size={14} />
          </IconButton>
          <IconButton title="Layer Settings">
            <Settings size={14} />
          </IconButton>
        </Box>
      </PanelHeader>

      <LayersContainer>
        {/* Layer Statistics */}
        {selectedLayerId && (
          <LayerStats>
            {(() => {
              const layer = layers.find(l => l.id === selectedLayerId)
              const stats = layer ? getLayerStats(layer) : null
              return stats ? (
                <>
                  <Text size="xs" weight="semibold" color="secondary">
                    {layer?.name} ({stats.objectCount} objects)
                  </Text>
                  <Box marginTop="$1">
                    {Object.entries(stats.types).map(([type, count]) => (
                      <Box key={type} display="flex" justifyContent="space-between">
                        <Text size="xs" css={{ textTransform: 'capitalize' }}>{type}:</Text>
                        <Text size="xs" color="gray400">{count}</Text>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : null
            })()}
          </LayerStats>
        )}

        {/* Layer List */}
        {layers
          .sort((a, b) => b.zIndex - a.zIndex) // Sort by z-index descending (top to bottom)
          .map((layer) => {
            const isExpanded = expandedLayers.has(layer.id)
            const stats = getLayerStats(layer)

            return (
              <Box key={layer.id}>
                <LayerItem
                  selected={selectedLayerId === layer.id}
                  isDragging={draggedLayer === layer.id}
                  isDropTarget={dropTarget === layer.id}
                  onClick={() => handleSelectLayer(layer.id)}
                  onDragStart={(e) => handleDragStart(layer.id, e)}
                  onDragOver={(e) => handleDragOver(layer.id, e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(layer.id, e)}
                  draggable={true}
                >
                  {/* Drag Handle */}
                  <GripVertical size={12} color="gray" style={{ marginRight: 4, cursor: 'grab' }} />

                  {/* Expand/Collapse */}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLayerExpansion(layer.id)
                    }}
                  >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </IconButton>

                  {/* Layer Preview */}
                  <LayerPreview style={{ backgroundColor: layer.color || '#C9AD6A' }}>
                    <Text size="xs" color="white" weight="bold">
                      {stats.objectCount}
                    </Text>
                  </LayerPreview>

                  {/* Layer Name */}
                  <LayerName>{layer.name}</LayerName>

                  {/* Layer Controls */}
                  <LayerControls>
                    <IconButton
                      active={layer.visible}
                      onClick={(e) => toggleLayerVisibility(layer.id, e)}
                      title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                    >
                      {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </IconButton>

                    <IconButton
                      active={layer.locked}
                      onClick={(e) => toggleLayerLock(layer.id, e)}
                      title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                    >
                      {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </IconButton>

                    <IconButton
                      onClick={(e) => handleDuplicateLayer(layer.id, e)}
                      title="Duplicate Layer"
                    >
                      <Copy size={12} />
                    </IconButton>

                    <IconButton
                      onClick={(e) => handleDeleteLayer(layer.id, e)}
                      title="Delete Layer"
                    >
                      <Trash2 size={12} />
                    </IconButton>
                  </LayerControls>
                </LayerItem>

                {/* Expanded Layer Details */}
                {isExpanded && (
                  <Box paddingLeft="$6" paddingRight="$2" marginBottom="$2">
                    {/* Opacity Slider */}
                    <Box marginBottom="$2">
                      <Text size="xs" color="gray400" marginBottom="$1">
                        Opacity: {Math.round((layer.opacity || 1) * 100)}%
                      </Text>
                      <OpacitySlider
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={layer.opacity || 1}
                        onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                      />
                    </Box>

                    {/* Layer Color */}
                    <Box display="flex" alignItems="center" gap="$2" marginBottom="$2">
                      <Text size="xs" color="gray400">Color:</Text>
                      <input
                        type="color"
                        value={layer.color || '#C9AD6A'}
                        onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
                        style={{
                          width: 20,
                          height: 20,
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      />
                    </Box>

                    {/* Object Types in Layer */}
                    {Object.entries(stats.types).length > 0 && (
                      <Box>
                        <Text size="xs" color="gray400" marginBottom="$1">Objects:</Text>
                        {Object.entries(stats.types).map(([type, count]) => (
                          <Box key={type} display="flex" justifyContent="space-between" marginBottom="$1">
                            <Text size="xs" css={{ textTransform: 'capitalize' }}>{type}</Text>
                            <Text size="xs" color="secondary">{count}</Text>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )
          })}

        {layers.length === 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="200px"
            color="gray500"
          >
            <Layers size={32} />
            <Text size="sm" marginTop="$2">No layers created</Text>
            <Button onClick={handleCreateLayer} css={{ marginTop: '$2' }}>
              Create First Layer
            </Button>
          </Box>
        )}
      </LayersContainer>
    </PanelContainer>
  )
}

export default AdvancedLayerPanel
/**
 * Advanced Layer Panel Component
 * Professional layer management system with drag-and-drop reordering
 */

import React, { useState, useCallback, useMemo } from 'react'
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
  Layers,
  GripVertical
} from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'
import type { LayerDefinition } from '@/store/layerStore'
import { useLayerStore } from '@/store/layerStore'
import useMapStore from '@/store/mapStore'

export type AdvancedLayerPanelProps = {
  onLayerChange?: (layerId: string) => void
}

export const AdvancedLayerPanel: React.FC<AdvancedLayerPanelProps> = ({ onLayerChange }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const {
    layers,
    createLayer,
    deleteLayer,
    updateLayer,
    reorderLayers,
    duplicateLayer,
  } = useLayerStore()

  const currentMap = useMapStore(state => state.currentMap)

  // Calculate layer statistics
  const getLayerStats = useCallback((layer: LayerDefinition) => {
    if (!currentMap) return { objectCount: 0, types: {} }

    const layerObjects = currentMap.objects.filter(obj => obj.layer === layer.zIndex)
    const objectCount = layerObjects.length
    const types = layerObjects.reduce((acc: Record<string, number>, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1
      return acc
    }, {})

    return { objectCount, types }
  }, [currentMap])

  // Event handlers
  const handleLayerClick = useCallback((layerId: string) => {
    setSelectedLayerId(layerId)
    onLayerChange?.(layerId)
  }, [onLayerChange])

  const handleToggleExpanded = useCallback((layerId: string) => {
    setExpandedLayers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(layerId)) {
        newSet.delete(layerId)
      } else {
        newSet.add(layerId)
      }
      return newSet
    })
  }, [])

  const handleToggleVisibility = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      updateLayer(layerId, { visible: !layer.visible })
    }
  }, [layers, updateLayer])

  const handleToggleLock = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId)
    if (layer) {
      updateLayer(layerId, { locked: !layer.locked })
    }
  }, [layers, updateLayer])

  const handleCreateLayer = useCallback(() => {
    const newLayerName = `Layer ${layers.length + 1}`
    createLayer({
      name: newLayerName,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: 'normal',
    })
  }, [layers.length, createLayer])

  const handleDeleteLayer = useCallback((layerId: string) => {
    if (layers.length > 1) { // Prevent deleting the last layer
      deleteLayer(layerId)
      if (selectedLayerId === layerId) {
        setSelectedLayerId(null)
      }
    }
  }, [layers.length, deleteLayer, selectedLayerId])

  const handleDuplicateLayer = useCallback((layerId: string) => {
    duplicateLayer(layerId)
  }, [duplicateLayer])

  const handleStartEditName = useCallback((layer: LayerDefinition) => {
    setEditingLayerId(layer.id)
    setEditingName(layer.name)
  }, [])

  const handleSaveLayerName = useCallback(() => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, { name: editingName.trim() })
    }
    setEditingLayerId(null)
    setEditingName('')
  }, [editingLayerId, editingName, updateLayer])

  const handleCancelEditName = useCallback(() => {
    setEditingLayerId(null)
    setEditingName('')
  }, [])

  // Drag and drop handlers
  const handleDragStart = useCallback((layerId: string) => {
    setDraggedLayer(layerId)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (draggedLayer && dropTarget && draggedLayer !== dropTarget) {
      const draggedIndex = layers.findIndex(l => l.id === draggedLayer)
      const targetIndex = layers.findIndex(l => l.id === dropTarget)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        reorderLayers(draggedLayer, targetIndex)
      }
    }
    setDraggedLayer(null)
    setDropTarget(null)
  }, [draggedLayer, dropTarget, layers, reorderLayers])

  const handleDragOver = useCallback((e: React.DragEvent, layerId: string) => {
    e.preventDefault()
    setDropTarget(layerId)
  }, [])

  // Sorted layers by order
  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => b.zIndex - a.zIndex) // Higher zIndex = on top
  }, [layers])

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
      {/* Panel Header */}
      <Box
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--colors-gray700)',
          backgroundColor: 'var(--colors-gray800)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--colors-purple400)" />
          <Text
            variant="heading"
            size="sm"
            style={{
              margin: 0,
              fontWeight: '500',
              color: 'var(--colors-gray100)'
            }}
          >
            Layers
          </Text>
        </Box>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateLayer}
          title="Add new layer"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'var(--colors-gray400)'
          }}
        >
          <Plus size={14} />
        </Button>
      </Box>

      {/* Layers Container */}
      <Box
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px'
        }}
      >
        {sortedLayers.map((layer) => {
          const stats = getLayerStats(layer)
          const isSelected = selectedLayerId === layer.id
          const isExpanded = expandedLayers.has(layer.id)
          const isEditing = editingLayerId === layer.id
          const isDragging = draggedLayer === layer.id
          const isDropTarget = dropTarget === layer.id

          return (
            <Box
              key={layer.id}
              draggable
              onDragStart={() => handleDragStart(layer.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onClick={() => handleLayerClick(layer.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '8px',
                marginBottom: '4px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'var(--colors-gray700)' : 'var(--colors-gray800)',
                border: `1px solid ${
                  isDropTarget ? 'var(--colors-dndGold)' : 'transparent'
                }`,
                cursor: 'pointer',
                opacity: isDragging ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
                }
              }}
            >
              {/* Layer Header Row */}
              <Box style={{ display: 'flex', alignItems: 'center' }}>
                {/* Drag Handle */}
                <Box style={{ marginRight: '8px', color: 'var(--colors-gray400)' }}>
                  <GripVertical size={12} />
                </Box>

                {/* Expand/Collapse */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleExpanded(layer.id)
                  }}
                  style={{
                    minWidth: '20px',
                    padding: '2px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--colors-gray400)'
                  }}
                >
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </Button>

                {/* Layer Name */}
                <Box style={{ flex: 1, marginLeft: '4px' }}>
                  {isEditing ? (
                    <Input
                      value={editingName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                      onBlur={handleSaveLayerName}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') {
                          handleSaveLayerName()
                        } else if (e.key === 'Escape') {
                          handleCancelEditName()
                        }
                      }}
                      style={{ fontSize: '12px' }}
                      autoFocus
                    />
                  ) : (
                    <Box
                      onDoubleClick={() => handleStartEditName(layer)}
                      style={{
                        cursor: 'text'
                      }}
                    >
                      <Text
                        variant="body"
                        size="xs"
                        style={{
                          margin: 0,
                          fontWeight: '500',
                          color: layer.visible ? 'var(--colors-gray100)' : 'var(--colors-gray500)',
                          opacity: layer.locked ? 0.7 : 1
                        }}
                      >
                        {layer.name}
                      </Text>
                    </Box>
                  )}
                </Box>

                {/* Controls */}
                <Box style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                  {/* Visibility Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(layer.id)
                    }}
                    title={layer.visible ? 'Hide layer' : 'Show layer'}
                    style={{
                      minWidth: '20px',
                      padding: '2px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: layer.visible ? 'var(--colors-blue400)' : 'var(--colors-gray500)'
                    }}
                  >
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>

                  {/* Lock Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleLock(layer.id)
                    }}
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                    style={{
                      minWidth: '20px',
                      padding: '2px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: layer.locked ? 'var(--colors-orange400)' : 'var(--colors-gray500)'
                    }}
                  >
                    {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </Button>

                  {/* Duplicate */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicateLayer(layer.id)
                    }}
                    title="Duplicate layer"
                    style={{
                      minWidth: '20px',
                      padding: '2px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--colors-gray400)'
                    }}
                  >
                    <Copy size={12} />
                  </Button>

                  {/* Delete */}
                  {layers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteLayer(layer.id)
                      }}
                      title="Delete layer"
                      style={{
                        minWidth: '20px',
                        padding: '2px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--colors-red400)'
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Expanded Details */}
              {isExpanded && (
                <Box style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  <Text
                    variant="body"
                    size="xs"
                    style={{
                      margin: '0 0 4px 0',
                      color: 'var(--colors-gray400)'
                    }}
                  >
                    {stats.objectCount} object{stats.objectCount !== 1 ? 's' : ''}
                  </Text>
                  {Object.entries(stats.types).map(([type, count]) => (
                    <Text
                      key={type}
                      variant="body"
                      size="xs"
                      style={{
                        margin: '0 0 2px 0',
                        color: 'var(--colors-gray500)'
                      }}
                    >
                      {count} {type}{count !== 1 ? 's' : ''}
                    </Text>
                  ))}
                </Box>
              )}
            </Box>
          )
        })}

        {layers.length === 0 && (
          <Box
            style={{
              padding: '16px',
              textAlign: 'center',
              color: 'var(--colors-gray500)',
              border: '2px dashed var(--colors-gray600)',
              borderRadius: '6px',
              backgroundColor: 'var(--colors-gray900)'
            }}
          >
            <Text
              variant="body"
              size="sm"
              style={{
                margin: 0,
                color: 'inherit'
              }}
            >
              No layers yet. Click + to add a layer.
            </Text>
          </Box>
        )}
      </Box>

      {/* Panel Footer */}
      <Box
        style={{
          padding: '12px',
          borderTop: '1px solid var(--colors-gray700)',
          backgroundColor: 'var(--colors-gray800)'
        }}
      >
        <Text
          variant="body"
          size="xs"
          style={{
            margin: 0,
            color: 'var(--colors-gray400)'
          }}
        >
          {layers.length} layer{layers.length !== 1 ? 's' : ''}
        </Text>
      </Box>
    </Box>
  )
}

export default AdvancedLayerPanel
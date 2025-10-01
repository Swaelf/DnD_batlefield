import { useState, type FC, type MouseEvent, type ChangeEvent } from 'react'
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronUp, ChevronDown, Layers } from '@/utils/optimizedIcons'
import { useLayerStore } from '@/store/layerStore'
import useMapStore from '@/store/mapStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Input } from '@/components/ui/Input'

export const LayerManagementPanel: FC = () => {
  try {
    const {
      layers,
      activeLayerId,
      setActiveLayer,
      toggleLayerVisibility,
      toggleLayerLock,
      createLayer,
      deleteLayer,
      moveLayer
    } = useLayerStore()

    const selectedObjects = useMapStore(state => state.selectedObjects)
    const updateObject = useMapStore(state => state.updateObject)

    const [showCreateLayer, setShowCreateLayer] = useState(false)
    const [newLayerName, setNewLayerName] = useState('')

    // Get object count per layer
    const currentMap = useMapStore(state => state.currentMap)
    const getLayerObjectCount = (layerId: string) => {
      if (!currentMap) return 0
      return currentMap.objects.filter(obj => obj.layerId === layerId).length
    }

    // Ensure layers is an array before sorting
    if (!Array.isArray(layers)) {
      console.error('LayerManagementPanel: layers is not an array', layers)
      return (
        <Box padding={3}>
          <Text size="sm" color="gray400">Layer system unavailable</Text>
        </Box>
      )
    }

    // Sort layers by zIndex for display
    const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  const handleCreateLayer = () => {
    if (newLayerName.trim()) {
      createLayer({ name: newLayerName.trim(), type: 'objects' })
      setNewLayerName('')
      setShowCreateLayer(false)
    }
  }

  const handleMoveSelectedToLayer = (layerId: string) => {
    if (selectedObjects.length > 0) {
      selectedObjects.forEach(objectId => {
        updateObject(objectId, { layerId })
      })
    }
  }

  return (
    <Box
      style={{
        backgroundColor: 'var(--colors-dndBlack)',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray800)',
        padding: '12px',
        marginBottom: '16px'
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '8px',
          marginBottom: '8px',
          borderBottom: '1px solid var(--colors-gray800)'
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} />
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              fontWeight: '500',
              color: 'var(--colors-gray200)'
            }}
          >
            Layers
          </Text>
        </Box>

        <Button
          variant="ghost"
          onClick={() => setShowCreateLayer(!showCreateLayer)}
          title="Add Layer"
          style={{
            padding: '4px',
            minWidth: 'auto',
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
          onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
          }}
          onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Plus size={12} />
        </Button>
      </Box>

      {/* Create Layer Form */}
      {showCreateLayer && (
        <Box
          style={{
            marginBottom: '12px',
            padding: '8px',
            backgroundColor: 'var(--colors-gray800)',
            borderRadius: '4px'
          }}
        >
          <Input
            type="text"
            placeholder="Layer name..."
            value={newLayerName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewLayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateLayer()
              if (e.key === 'Escape') setShowCreateLayer(false)
            }}
            style={{
              width: '100%',
              marginBottom: '8px',
              fontSize: '12px'
            }}
            autoFocus
          />
          <Box style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="primary"
              onClick={handleCreateLayer}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                height: 'auto'
              }}
            >
              Create
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCreateLayer(false)}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                height: 'auto'
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {/* Layer List */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}
      >
        {sortedLayers.map((layer) => (
          <Box
            key={layer.id}
            data-active={layer.id === activeLayerId}
            onClick={() => setActiveLayer(layer.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: layer.id === activeLayerId ? 'var(--colors-gray800)' : 'var(--colors-gray900)',
              border: `1px solid ${layer.id === activeLayerId ? 'var(--colors-secondary)' : 'transparent'}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
              if (layer.id !== activeLayerId) {
                e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
              }
            }}
            onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
              if (layer.id !== activeLayerId) {
                e.currentTarget.style.backgroundColor = 'var(--colors-gray900)'
              }
            }}
          >
            {/* Layer Color Indicator */}
            <Box
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                flexShrink: 0,
                backgroundColor: layer.color || '#6B7280'
              }}
            />

            {/* Layer Name */}
            <Box style={{ flex: 1 }}>
              <Text
                variant="body"
                size="xs"
                style={{
                  margin: 0,
                  fontWeight: '500',
                  color: 'var(--colors-gray200)'
                }}
              >
                {layer.name}
                {getLayerObjectCount(layer.id) > 0 && (
                  <Text
                    as="span"
                    variant="body"
                    size="xs"
                    style={{
                      margin: 0,
                      color: 'var(--colors-gray400)'
                    }}
                  >
                    {' '}({getLayerObjectCount(layer.id)})
                  </Text>
                )}
              </Text>
            </Box>

            {/* Layer Actions */}
            <Box
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Layer Visibility */}
              <Button
                variant="ghost"
                onClick={() => toggleLayerVisibility(layer.id)}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                style={{
                  padding: '4px',
                  minWidth: 'auto',
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </Button>

              {/* Layer Lock */}
              <Button
                variant="ghost"
                onClick={() => toggleLayerLock(layer.id)}
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                style={{
                  padding: '4px',
                  minWidth: 'auto',
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </Button>

              {/* Move Layer Up */}
              <Button
                variant="ghost"
                onClick={() => moveLayer(layer.id, 'up')}
                title="Move Layer Up"
                style={{
                  padding: '4px',
                  minWidth: 'auto',
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <ChevronUp size={12} />
              </Button>

              {/* Move Layer Down */}
              <Button
                variant="ghost"
                onClick={() => moveLayer(layer.id, 'down')}
                title="Move Layer Down"
                style={{
                  padding: '4px',
                  minWidth: 'auto',
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'transparent',
                  border: 'none'
                }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
                }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <ChevronDown size={12} />
              </Button>

              {/* Delete Layer */}
              {layer.isDeletable && (
                <Button
                  variant="ghost"
                  onClick={() => deleteLayer(layer.id)}
                  title="Delete Layer"
                  style={{
                    padding: '4px',
                    minWidth: 'auto',
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--colors-error)'
                  }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = 'var(--colors-error)'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--colors-error)'
                  }}
                >
                  <Trash2 size={12} />
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Move Selected Objects to Layer */}
      {selectedObjects.length > 0 && (
        <Box
          style={{
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--colors-gray800)'
          }}
        >
          <Text
            variant="body"
            size="xs"
            style={{
              margin: 0,
              marginBottom: '8px',
              color: 'var(--colors-gray400)'
            }}
          >
            Move {selectedObjects.length} selected object(s) to:
          </Text>
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {layers.slice(0, 4).map(layer => (
              <Button
                key={layer.id}
                variant="ghost"
                onClick={() => handleMoveSelectedToLayer(layer.id)}
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  height: 'auto'
                }}
              >
                {layer.name}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
  } catch (error) {
    console.error('LayerManagementPanel error:', error)
    return (
      <Box padding={3}>
        <Text size="sm" color="gray400">Layer panel error</Text>
      </Box>
    )
  }
}
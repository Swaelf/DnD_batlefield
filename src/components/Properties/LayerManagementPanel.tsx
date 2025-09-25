import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronUp, ChevronDown, Layers } from 'lucide-react'
import { useLayerStore } from '@/store/layerStore'
import useMapStore from '@/store/mapStore'
import { styled } from '@/styles/theme.config'
import { Box, Text, Button } from '@/components/ui'

const LayerContainer = styled(Box, {
  backgroundColor: '$dndBlack',
  borderRadius: '$md',
  border: '1px solid $gray800',
  padding: '$3',
  marginBottom: '$4'
})

const LayerHeader = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '$2',
  marginBottom: '$2',
  borderBottom: '1px solid $gray800'
})

const LayerList = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  maxHeight: '200px',
  overflowY: 'auto'
})

const LayerItem = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2',
  borderRadius: '$sm',
  backgroundColor: '$gray900',
  border: '1px solid transparent',

  '&[data-active="true"]': {
    backgroundColor: '$gray800',
    borderColor: '$secondary'
  }
})

const LayerColorIndicator = styled(Box, {
  width: '12px',
  height: '12px',
  borderRadius: '$round',
  flexShrink: 0
})

const LayerName = styled(Text, {
  flex: 1,
  fontSize: '$xs',
  fontWeight: '$medium'
})

const LayerActions = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const IconButton = styled(Button, {
  padding: '$1',
  minWidth: 'auto',
  width: '24px',
  height: '24px',

  '& svg': {
    width: '12px',
    height: '12px'
  }
})

export const LayerManagementPanel: React.FC = () => {
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

  // Sort layers by zIndex for display
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  const handleCreateLayer = () => {
    if (newLayerName.trim()) {
      createLayer(newLayerName.trim(), 'objects')
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
    <LayerContainer>
      <LayerHeader>
        <Box display="flex" alignItems="center" gap="2">
          <Layers size={16} />
          <Text size="sm" weight="medium">Layers</Text>
        </Box>

        <IconButton
          variant="ghost"
          onClick={() => setShowCreateLayer(!showCreateLayer)}
          title="Add Layer"
        >
          <Plus size={12} />
        </IconButton>
      </LayerHeader>

      {/* Create Layer Form */}
      {showCreateLayer && (
        <Box marginBottom="3" padding="2" backgroundColor="$gray800" borderRadius="$sm">
          <input
            type="text"
            placeholder="Layer name..."
            value={newLayerName}
            onChange={(e) => setNewLayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateLayer()
              if (e.key === 'Escape') setShowCreateLayer(false)
            }}
            style={{
              width: '100%',
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '4px',
              color: 'white',
              marginBottom: '8px'
            }}
            autoFocus
          />
          <Box display="flex" gap="2">
            <Button size="xs" onClick={handleCreateLayer}>Create</Button>
            <Button size="xs" variant="ghost" onClick={() => setShowCreateLayer(false)}>Cancel</Button>
          </Box>
        </Box>
      )}

      {/* Layer List */}
      <LayerList>
        {sortedLayers.map((layer) => (
          <LayerItem
            key={layer.id}
            data-active={layer.id === activeLayerId}
            onClick={() => setActiveLayer(layer.id)}
          >
            <LayerColorIndicator
              style={{ backgroundColor: layer.color || '#6B7280' }}
            />

            <LayerName>
              {layer.name}
              {getLayerObjectCount(layer.id) > 0 && (
                <Text as="span" color="gray400" size="xs">
                  {' '}({getLayerObjectCount(layer.id)})
                </Text>
              )}
            </LayerName>

            <LayerActions onClick={(e) => e.stopPropagation()}>
              {/* Layer Visibility */}
              <IconButton
                variant="ghost"
                onClick={() => toggleLayerVisibility(layer.id)}
                title={layer.visible ? 'Hide Layer' : 'Show Layer'}
              >
                {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
              </IconButton>

              {/* Layer Lock */}
              <IconButton
                variant="ghost"
                onClick={() => toggleLayerLock(layer.id)}
                title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
              >
                {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
              </IconButton>

              {/* Move Layer Up/Down */}
              <IconButton
                variant="ghost"
                onClick={() => moveLayer(layer.id, 'up')}
                title="Move Layer Up"
              >
                <ChevronUp size={12} />
              </IconButton>

              <IconButton
                variant="ghost"
                onClick={() => moveLayer(layer.id, 'down')}
                title="Move Layer Down"
              >
                <ChevronDown size={12} />
              </IconButton>

              {/* Delete Layer */}
              {layer.isDeletable && (
                <IconButton
                  variant="destructive"
                  onClick={() => deleteLayer(layer.id)}
                  title="Delete Layer"
                >
                  <Trash2 size={12} />
                </IconButton>
              )}
            </LayerActions>
          </LayerItem>
        ))}
      </LayerList>

      {/* Move Selected Objects to Layer */}
      {selectedObjects.length > 0 && (
        <Box marginTop="3" paddingTop="2" borderTop="1px solid $gray800">
          <Text size="xs" color="gray400" marginBottom="2">
            Move {selectedObjects.length} selected object(s) to:
          </Text>
          <Box display="flex" flexWrap="wrap" gap="1">
            {layers.slice(0, 4).map(layer => (
              <Button
                key={layer.id}
                size="xs"
                variant="ghost"
                onClick={() => handleMoveSelectedToLayer(layer.id)}
              >
                {layer.name}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </LayerContainer>
  )
}
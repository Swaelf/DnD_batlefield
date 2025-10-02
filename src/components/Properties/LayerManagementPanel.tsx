import { useState, type FC } from 'react'
import { useLayerStore } from '@/store/layerStore'
import useMapStore from '@/store/mapStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { LayerManagementHeader } from './LayerManagementHeader'
import { LayerCreateForm } from './LayerCreateForm'
import { LayerList } from './LayerList'
import { MoveToLayerControl } from './MoveToLayerControl'

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
    const currentMap = useMapStore(state => state.currentMap)

    const [showCreateLayer, setShowCreateLayer] = useState(false)

    // Ensure layers is an array before proceeding
    if (!Array.isArray(layers)) {
      console.error('LayerManagementPanel: layers is not an array', layers)
      return (
        <Box padding={3}>
          <Text size="sm" color="gray400">Layer system unavailable</Text>
        </Box>
      )
    }

    const handleCreateLayer = (name: string) => {
      createLayer({ name, type: 'objects' })
      setShowCreateLayer(false)
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
        <LayerManagementHeader onCreateClick={() => setShowCreateLayer(!showCreateLayer)} />

        <LayerCreateForm
          isVisible={showCreateLayer}
          onClose={() => setShowCreateLayer(false)}
          onCreate={handleCreateLayer}
        />

        <LayerList
          layers={layers}
          activeLayerId={activeLayerId}
          currentMap={currentMap}
          onSelectLayer={setActiveLayer}
          onToggleVisibility={toggleLayerVisibility}
          onToggleLock={toggleLayerLock}
          onDeleteLayer={deleteLayer}
          onMoveLayer={moveLayer}
        />

        <MoveToLayerControl
          layers={layers}
          selectedObjectsCount={selectedObjects.length}
          onMoveToLayer={handleMoveSelectedToLayer}
        />
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

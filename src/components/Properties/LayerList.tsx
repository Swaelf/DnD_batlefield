import { memo, type FC } from 'react'
import type { LayerDefinition, BattleMap } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { LayerListItem } from './LayerListItem'

type LayerListProps = {
  layers: LayerDefinition[]
  activeLayerId: string | null
  currentMap: BattleMap | null
  onSelectLayer: (layerId: string) => void
  onToggleVisibility: (layerId: string) => void
  onToggleLock: (layerId: string) => void
  onDeleteLayer: (layerId: string) => void
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void
}

const LayerListComponent: FC<LayerListProps> = ({
  layers,
  activeLayerId,
  currentMap,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onMoveLayer
}) => {
  // Get object count per layer
  const getLayerObjectCount = (layerId: string) => {
    if (!currentMap) return 0
    return currentMap.objects.filter(obj => obj.layerId === layerId).length
  }

  // Sort layers by zIndex for display (highest first)
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex)

  return (
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
        <LayerListItem
          key={layer.id}
          layer={layer}
          isActive={layer.id === activeLayerId}
          objectCount={getLayerObjectCount(layer.id)}
          onSelect={onSelectLayer}
          onToggleVisibility={onToggleVisibility}
          onToggleLock={onToggleLock}
          onDelete={onDeleteLayer}
          onMoveUp={() => onMoveLayer(layer.id, 'up')}
          onMoveDown={() => onMoveLayer(layer.id, 'down')}
        />
      ))}
    </Box>
  )
}

export const LayerList = memo(LayerListComponent)
LayerList.displayName = 'LayerList'

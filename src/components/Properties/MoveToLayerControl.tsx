import { memo, type FC } from 'react'
import type { Layer } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

type MoveToLayerControlProps = {
  layers: Layer[]
  selectedObjectsCount: number
  onMoveToLayer: (layerId: string) => void
}

const MoveToLayerControlComponent: FC<MoveToLayerControlProps> = ({
  layers,
  selectedObjectsCount,
  onMoveToLayer
}) => {
  // Don't render if no objects are selected
  if (selectedObjectsCount === 0) {
    return null
  }

  return (
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
        Move {selectedObjectsCount} selected object(s) to:
      </Text>
      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
        {layers.slice(0, 4).map(layer => (
          <Button
            key={layer.id}
            variant="ghost"
            onClick={() => onMoveToLayer(layer.id)}
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
  )
}

export const MoveToLayerControl = memo(MoveToLayerControlComponent)
MoveToLayerControl.displayName = 'MoveToLayerControl'

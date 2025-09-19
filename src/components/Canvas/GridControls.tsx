import React, { memo } from 'react'
import { Grid3x3, Magnet, Eye, EyeOff } from 'lucide-react'
import useMapStore from '@/store/mapStore'
import { Box, Button, Text } from '@/components/ui'
import { styled } from '@/styles/theme.config'

const GridControlsContainer = styled(Box, {
  position: 'absolute',
  top: '$4',
  left: '$4',
  zIndex: 10,
  backgroundColor: '$dndBlack/80',
  borderRadius: '$lg',
  padding: '$2',
  backdropFilter: 'blur(4px)',
})

const GridButton = styled(Button, {
  padding: '$2',
  borderRadius: '$lg',
  transition: '$fast',
  '&:hover': {
    backgroundColor: '$gray700',
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$gray700',
        color: '$secondary',
      },
      false: {
        backgroundColor: '$gray800',
        color: '$gray500',
      },
    },
  },
})

const SnapIndicator = styled(Box, {
  marginLeft: '$2',
  paddingX: '$2',
  paddingY: '$1',
  borderRadius: '$md',
  backgroundColor: '$gray800',
  fontSize: '$xs',
})

const GridControlsComponent: React.FC = () => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const toggleGridSnap = useMapStore(state => state.toggleGridSnap)
  const toggleGridVisibility = useMapStore(state => state.toggleGridVisibility)

  if (!currentMap) return null

  const { grid } = currentMap

  return (
    <GridControlsContainer>
      <Box display="flex" alignItems="center" gap="2">
        {/* Grid Label */}
        <Box display="flex" alignItems="center" gap="1" css={{ marginRight: '$2' }}>
          <Grid3x3 size={16} color="#9CA3AF" />
          <Text size="xs" color="gray400">Grid</Text>
        </Box>

        {/* Toggle Grid Visibility */}
        <GridButton
          onClick={toggleGridVisibility}
          active={grid.visible}
          title={grid.visible ? 'Hide Grid (G)' : 'Show Grid (G)'}
          variant="ghost"
          size="icon"
        >
          {grid.visible ? (
            <Eye size={16} />
          ) : (
            <EyeOff size={16} />
          )}
        </GridButton>

        {/* Toggle Grid Snap */}
        <GridButton
          onClick={toggleGridSnap}
          active={grid.snap}
          title={grid.snap ? 'Disable Snap (Shift+G)' : 'Enable Snap (Shift+G)'}
          variant="ghost"
          size="icon"
        >
          <Magnet size={16} />
        </GridButton>

        {/* Snap Indicator */}
        <SnapIndicator>
          {grid.snap ? (
            <Text size="xs" color="secondary">Snap: ON</Text>
          ) : (
            <Text size="xs" color="gray500">Snap: OFF</Text>
          )}
        </SnapIndicator>
      </Box>
    </GridControlsContainer>
  )
}

export const GridControls = memo(GridControlsComponent)
GridControls.displayName = 'GridControls'
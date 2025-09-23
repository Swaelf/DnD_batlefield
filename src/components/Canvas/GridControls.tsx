import React, { memo } from 'react'
import { Grid3x3, Magnet, Eye, EyeOff, Sparkles } from 'lucide-react'
import useMapStore from '@/store/mapStore'
import { Box, Button, Text } from '@/components/ui'
import { styled } from '@/styles/theme.config'

const GridControlsContainer = styled(Box, {
  position: 'absolute',
  top: '$4',
  left: '$4',
  zIndex: 50,
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

const GridLabelContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  marginRight: '$2'
})

const GridLabelText = styled(Text, {
  fontSize: '$xs',
  color: '$gray400'
})

const SnapText = styled(Text, {
  fontSize: '$xs'
})

const SnapOnText = styled(SnapText, {
  color: '$secondary'
})

const SnapOffText = styled(SnapText, {
  color: '$gray500'
})

const Divider = styled(Box, {
  width: 1,
  height: 24,
  backgroundColor: '$gray600',
  marginX: '$2'
})

const GridControlsRow = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const GridControlsComponent: React.FC = () => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentMap = useMapStore(state => state.currentMap)
  const spellPreviewEnabled = useMapStore(state => state.spellPreviewEnabled)
  const toggleGridSnap = useMapStore(state => state.toggleGridSnap)
  const toggleGridVisibility = useMapStore(state => state.toggleGridVisibility)
  const toggleSpellPreview = useMapStore(state => state.toggleSpellPreview)

  if (!currentMap) return null

  const { grid } = currentMap

  return (
    <GridControlsContainer>
      <GridControlsRow>
        {/* Grid Label */}
        <GridLabelContainer>
          <Grid3x3 size={16} color="#9CA3AF" />
          <GridLabelText>Grid</GridLabelText>
        </GridLabelContainer>

        {/* Toggle Grid Visibility */}
        <GridButton
          onClick={toggleGridVisibility}
          active={grid.visible}
          title={grid.visible ? 'Hide Grid (G)' : 'Show Grid (G)'}
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
        >
          <Magnet size={16} />
        </GridButton>

        {/* Snap Indicator */}
        <SnapIndicator>
          {grid.snap ? (
            <SnapOnText>Snap: ON</SnapOnText>
          ) : (
            <SnapOffText>Snap: OFF</SnapOffText>
          )}
        </SnapIndicator>

        {/* Divider */}
        <Divider />

        {/* Action Preview Toggle */}
        <GridButton
          onClick={toggleSpellPreview}
          active={spellPreviewEnabled}
          title={spellPreviewEnabled ? 'Disable Action Preview' : 'Enable Action Preview'}
        >
          <Sparkles size={16} />
        </GridButton>

        {/* Action Preview Indicator */}
        <SnapIndicator>
          {spellPreviewEnabled ? (
            <SnapOnText>Preview: ON</SnapOnText>
          ) : (
            <SnapOffText>Preview: OFF</SnapOffText>
          )}
        </SnapIndicator>
      </GridControlsRow>
    </GridControlsContainer>
  )
}

export const GridControls = memo(GridControlsComponent)
GridControls.displayName = 'GridControls'
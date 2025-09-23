import React, { memo } from 'react'
import { Box, Button, Text } from '@/components/ui'
import { styled } from '@/styles/theme.config'

const ControlsPanel = styled(Box, {
  position: 'absolute',
  top: '$4',
  right: '$4',
  zIndex: 50,
  backgroundColor: '$dndBlack/80',
  borderRadius: '$lg',
  padding: '$2',
  backdropFilter: 'blur(4px)',
})

const ControlButton = styled(Button, {
  paddingX: '$2',
  paddingY: '$1',
  backgroundColor: '$gray800',
  '&:hover': {
    backgroundColor: '$gray700',
  },
  borderRadius: '$md',
  transition: '$fast',
})

type CanvasControlsProps = {
  stageScale: number
  zoomIn: () => void
  zoomOut: () => void
  resetView: () => void
  centerView: () => void
}

const CanvasControlsComponent: React.FC<CanvasControlsProps> = ({
  stageScale,
  zoomIn,
  zoomOut,
  resetView,
  centerView
}) => {
  return (
    <ControlsPanel>
      <Box display="flex" alignItems="center" gap="2">
        <Text size="sm" color="gray300">Zoom: {Math.round(stageScale * 100)}%</Text>
        <ControlButton
          onClick={zoomOut}
          title="Zoom Out"
          variant="ghost"
          size="sm"
        >
          −
        </ControlButton>
        <ControlButton
          onClick={zoomIn}
          title="Zoom In"
          variant="ghost"
          size="sm"
        >
          +
        </ControlButton>
        <ControlButton
          onClick={resetView}
          title="Reset View (Ctrl+0)"
          variant="ghost"
          size="sm"
        >
          Reset
        </ControlButton>
        <ControlButton
          onClick={centerView}
          title="Fit to Screen"
          variant="ghost"
          size="sm"
        >
          Fit
        </ControlButton>
      </Box>
    </ControlsPanel>
  )
}

export const CanvasControls = memo(CanvasControlsComponent)
CanvasControls.displayName = 'CanvasControls'
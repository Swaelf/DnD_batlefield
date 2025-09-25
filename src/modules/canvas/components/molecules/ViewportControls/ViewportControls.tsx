/**
 * ViewportControls Molecule - Zoom, pan, rotation controls
 *
 * Complete viewport control interface using ZoomControl and CoordinateDisplay atoms
 * with fit-to-bounds, reset, and coordinate space switching.
 */

import React from 'react'
import { RotateCcw, Square, MousePointer } from 'lucide-react'
import { Box, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import { ZoomControl, CoordinateDisplay } from '../../atoms'
import type { Point, Rectangle } from '@/types/geometry'
import type { ViewportState, CoordinateSpace } from '../../../types'

export interface ViewportControlsProps {
  readonly viewportState: ViewportState
  readonly mousePosition: Point
  readonly coordinateSpace: CoordinateSpace
  readonly gridSize?: number
  readonly onZoomIn: () => void
  readonly onZoomOut: () => void
  readonly onZoomReset: () => void
  readonly onFitToBounds: () => void
  readonly onResetView: () => void
  readonly onCoordinateSpaceChange: (space: CoordinateSpace) => void
  readonly minZoom?: number
  readonly maxZoom?: number
  readonly showCoordinates?: boolean
  readonly showFitControls?: boolean
}

const ControlsContainer = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  padding: '$3',
  backgroundColor: '$dndBlack/90',
  borderRadius: '$md',
  border: '1px solid $gray800',
  backdropFilter: 'blur(8px)'
})

const ControlRow = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const ViewportButton = styled(Button, {
  fontSize: '$xs',
  padding: '$2',
  minWidth: 'auto'
})

const CoordinateSection = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2'
})

const SpaceToggle = styled(Box, {
  display: 'flex',
  gap: '$1'
})

const SpaceButton = styled(Button, {
  fontSize: '$xs',
  padding: '$1 $2',
  minWidth: 'auto',

  variants: {
    active: {
      true: {
        backgroundColor: '$dndRed',
        color: '$white'
      }
    }
  }
})

export const ViewportControls: React.FC<ViewportControlsProps> = React.memo(({
  viewportState,
  mousePosition,
  coordinateSpace,
  gridSize,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToBounds,
  onResetView,
  onCoordinateSpaceChange,
  minZoom = 0.1,
  maxZoom = 10,
  showCoordinates = true,
  showFitControls = true
}) => {
  const coordinateSpaces: CoordinateSpace[] = ['screen', 'stage', 'world']

  return (
    <ControlsContainer>
      {/* Zoom controls */}
      <ControlRow>
        <ZoomControl
          zoom={viewportState.zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onReset={onZoomReset}
          showPercentage={true}
          showButtons={true}
        />
      </ControlRow>

      {/* Viewport controls */}
      {showFitControls && (
        <ControlRow>
          <ViewportButton
            variant="ghost"
            size="sm"
            onClick={onFitToBounds}
            title="Fit to content bounds"
          >
            <Square size={14} />
            Fit
          </ViewportButton>

          <ViewportButton
            variant="ghost"
            size="sm"
            onClick={onResetView}
            title="Reset viewport to default"
          >
            <RotateCcw size={14} />
            Reset
          </ViewportButton>
        </ControlRow>
      )}

      {/* Coordinate display */}
      {showCoordinates && (
        <CoordinateSection>
          <SpaceToggle>
            {coordinateSpaces.map(space => (
              <SpaceButton
                key={space}
                variant="ghost"
                size="xs"
                active={coordinateSpace === space}
                onClick={() => onCoordinateSpaceChange(space)}
              >
                {space.toUpperCase()}
              </SpaceButton>
            ))}
          </SpaceToggle>

          <CoordinateDisplay
            position={mousePosition}
            space={coordinateSpace}
            gridSize={gridSize}
            showGrid={!!gridSize}
            precision={coordinateSpace === 'world' ? 1 : 0}
          />
        </CoordinateSection>
      )}

      {/* Viewport info */}
      <ControlRow>
        <CoordinateDisplay
          position={viewportState.pan}
          space="stage"
          label="PAN"
          precision={0}
        />
      </ControlRow>
    </ControlsContainer>
  )
})

ViewportControls.displayName = 'ViewportControls'
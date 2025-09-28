/**
 * ViewportControls Molecule - Zoom, pan, rotation controls
 *
 * Complete viewport control interface using ZoomControl and CoordinateDisplay atoms
 * with fit-to-bounds, reset, and coordinate space switching.
 */

import React from 'react'
import { RotateCcw, Square } from 'lucide-react'
import { Box, Button } from '@/components/primitives'
import { ZoomControl, CoordinateDisplay } from '../../atoms'
import type { Point } from '@/types/geometry'
import type { ViewportState } from '../../../types/viewport'
import type { CoordinateSpace } from '../../../types/canvas'

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

// Helper functions for styling
const getControlsContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
  padding: '12px',
  backgroundColor: 'rgba(26, 26, 26, 0.9)',
  borderRadius: '6px',
  border: '1px solid var(--gray-800)',
  backdropFilter: 'blur(8px)'
})

const getControlRowStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
})

const getViewportButtonStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  padding: '8px',
  minWidth: 'auto',
  backgroundColor: 'transparent',
  border: '1px solid var(--gray-600)',
  color: 'var(--gray-300)',
  borderRadius: '4px',
  cursor: 'pointer'
})

const getCoordinateSectionStyles = (): React.CSSProperties => ({
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px'
})

const getSpaceToggleStyles = (): React.CSSProperties => ({
  display: 'flex',
  gap: '4px'
})

const getSpaceButtonStyles = (isActive = false): React.CSSProperties => ({
  fontSize: '12px',
  padding: '4px 8px',
  minWidth: 'auto',
  backgroundColor: isActive ? 'var(--secondary)' : 'transparent',
  color: isActive ? 'var(--gray-900)' : 'var(--gray-400)',
  border: '1px solid var(--gray-600)',
  borderRadius: '4px',
  cursor: 'pointer'
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
    <Box style={getControlsContainerStyles()}>
      {/* Zoom controls */}
      <Box style={getControlRowStyles()}>
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
      </Box>

      {/* Viewport controls */}
      {showFitControls && (
        <Box style={getControlRowStyles()}>
          <Button
            onClick={onFitToBounds}
            title="Fit to content bounds"
            style={getViewportButtonStyles()}
          >
            <Square size={14} />
            Fit
          </Button>

          <Button
            onClick={onResetView}
            title="Reset viewport to default"
            style={getViewportButtonStyles()}
          >
            <RotateCcw size={14} />
            Reset
          </Button>
        </Box>
      )}

      {/* Coordinate display */}
      {showCoordinates && (
        <Box style={getCoordinateSectionStyles()}>
          <Box style={getSpaceToggleStyles()}>
            {coordinateSpaces.map(space => (
              <Button
                key={space}
                onClick={() => onCoordinateSpaceChange(space)}
                style={getSpaceButtonStyles(coordinateSpace === space)}
              >
                {space.toUpperCase()}
              </Button>
            ))}
          </Box>

          <CoordinateDisplay
            position={mousePosition}
            space={coordinateSpace}
            gridSize={gridSize}
            showGrid={!!gridSize}
            precision={coordinateSpace === 'world' ? 1 : 0}
          />
        </Box>
      )}

      {/* Viewport info */}
      <Box style={getControlRowStyles()}>
        <CoordinateDisplay
          position={viewportState.position || { x: 0, y: 0 }}
          space="stage"
          label="PAN"
          precision={0}
        />
      </Box>
    </Box>
  )
})

ViewportControls.displayName = 'ViewportControls'
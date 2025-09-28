/**
 * CoordinateDisplay Atom - Mouse position and coordinate display
 *
 * Shows current mouse coordinates in different coordinate spaces
 * with proper formatting and grid alignment indicators.
 */

import React from 'react'
import { Box, Text } from '@/components/primitives'
import type { Point } from '@/types/geometry'
import type { CoordinateSpace } from '../../../types/canvas'

export interface CoordinateDisplayProps {
  readonly position: Point
  readonly space: CoordinateSpace
  readonly gridSize?: number
  readonly showGrid?: boolean
  readonly precision?: number
  readonly label?: string
}

// Helper functions for styling
const getCoordinateContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 8px',
  backgroundColor: 'rgba(17, 24, 39, 0.8)',
  borderRadius: '4px',
  border: '1px solid var(--gray-700)'
})

const getCoordinateLabelStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  color: 'var(--gray-400)',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px'
})

const getCoordinateValueStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontFamily: 'monospace',
  color: 'var(--gray-100)',
  fontWeight: '500'
})

const getGridIndicatorStyles = (aligned: boolean): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: aligned ? 'var(--success)' : 'var(--gray-600)'
})

export const CoordinateDisplay: React.FC<CoordinateDisplayProps> = React.memo(({
  position,
  space,
  gridSize,
  showGrid = false,
  precision = 0,
  label
}) => {
  const formatCoordinate = (value: number): string => {
    return precision > 0 ? value.toFixed(precision) : Math.round(value).toString()
  }

  const getSpaceLabel = (space: CoordinateSpace): string => {
    switch (space) {
      case 'screen': return 'SCR'
      case 'stage': return 'STG'
      case 'world': return 'WLD'
      case 'local': return 'LOC'
      default: return 'POS'
    }
  }

  const isGridAligned = gridSize && gridSize > 0
    ? position.x % gridSize === 0 && position.y % gridSize === 0
    : false

  const displayLabel = label || getSpaceLabel(space)

  return (
    <Box style={getCoordinateContainerStyles()}>
      <Text style={getCoordinateLabelStyles()}>{displayLabel}</Text>

      <Text style={getCoordinateValueStyles()}>
        {formatCoordinate(position.x)}, {formatCoordinate(position.y)}
      </Text>

      {showGrid && gridSize && (
        <Box
          style={getGridIndicatorStyles(isGridAligned)}
          title={isGridAligned ? 'Aligned to grid' : 'Not aligned to grid'}
        />
      )}
    </Box>
  )
})

CoordinateDisplay.displayName = 'CoordinateDisplay'
/**
 * CoordinateDisplay Atom - Mouse position and coordinate display
 *
 * Shows current mouse coordinates in different coordinate spaces
 * with proper formatting and grid alignment indicators.
 */

import React from 'react'
import { Box, Text } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import type { Point } from '@/types/geometry'
import type { CoordinateSpace } from '../../types'

export interface CoordinateDisplayProps {
  readonly position: Point
  readonly space: CoordinateSpace
  readonly gridSize?: number
  readonly showGrid?: boolean
  readonly precision?: number
  readonly label?: string
}

const CoordinateContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$1 $2',
  backgroundColor: '$gray900/80',
  borderRadius: '$sm',
  border: '1px solid $gray700'
})

const CoordinateLabel = styled(Text, {
  fontSize: '$xs',
  color: '$gray400',
  fontWeight: '$medium',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
})

const CoordinateValue = styled(Text, {
  fontSize: '$xs',
  fontFamily: '$mono',
  color: '$gray100',
  fontWeight: '$medium'
})

const GridIndicator = styled(Box, {
  width: '$2',
  height: '$2',
  borderRadius: '50%',
  variants: {
    aligned: {
      true: { backgroundColor: '$success' },
      false: { backgroundColor: '$gray600' }
    }
  }
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
    <CoordinateContainer>
      <CoordinateLabel>{displayLabel}</CoordinateLabel>

      <CoordinateValue>
        {formatCoordinate(position.x)}, {formatCoordinate(position.y)}
      </CoordinateValue>

      {showGrid && gridSize && (
        <GridIndicator
          aligned={isGridAligned}
          title={isGridAligned ? 'Aligned to grid' : 'Not aligned to grid'}
        />
      )}
    </CoordinateContainer>
  )
})

CoordinateDisplay.displayName = 'CoordinateDisplay'
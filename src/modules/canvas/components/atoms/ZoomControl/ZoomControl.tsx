/**
 * ZoomControl Atom - Zoom level display and basic controls
 *
 * Displays current zoom level with formatting and provides
 * basic zoom controls with D&D theming.
 */

import React from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'

export interface ZoomControlProps {
  readonly zoom: number
  readonly minZoom: number
  readonly maxZoom: number
  readonly onZoomIn?: () => void
  readonly onZoomOut?: () => void
  readonly onReset?: () => void
  readonly showPercentage?: boolean
  readonly showButtons?: boolean
}

const ZoomContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$2',
  backgroundColor: '$dndBlack/80',
  borderRadius: '$md',
  backdropFilter: 'blur(4px)',
  border: '1px solid $gray800'
})

const ZoomDisplay = styled(Text, {
  fontSize: '$sm',
  fontWeight: '$medium',
  color: '$gray100',
  minWidth: '60px',
  textAlign: 'center',
  fontFamily: '$mono'
})

const ZoomButton = styled(Button, {
  size: '$6',
  variants: {
    disabled: {
      true: {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    }
  }
})

export const ZoomControl: React.FC<ZoomControlProps> = React.memo(({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onReset,
  showPercentage = true,
  showButtons = true
}) => {
  const zoomPercentage = Math.round(zoom * 100)
  const canZoomIn = zoom < maxZoom
  const canZoomOut = zoom > minZoom

  const formatZoom = (value: number): string => {
    if (showPercentage) {
      return `${Math.round(value * 100)}%`
    }
    return `${value.toFixed(1)}x`
  }

  return (
    <ZoomContainer>
      {showButtons && (
        <ZoomButton
          variant="ghost"
          size="sm"
          disabled={!canZoomOut}
          onClick={onZoomOut}
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </ZoomButton>
      )}

      <ZoomDisplay title={`Zoom: ${formatZoom(zoom)}`}>
        {formatZoom(zoom)}
      </ZoomDisplay>

      {showButtons && (
        <>
          <ZoomButton
            variant="ghost"
            size="sm"
            disabled={!canZoomIn}
            onClick={onZoomIn}
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </ZoomButton>

          <ZoomButton
            variant="ghost"
            size="sm"
            onClick={onReset}
            title="Reset zoom to 100%"
          >
            <RotateCcw size={14} />
          </ZoomButton>
        </>
      )}
    </ZoomContainer>
  )
})

ZoomControl.displayName = 'ZoomControl'
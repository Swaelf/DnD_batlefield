/**
 * ZoomControl Atom - Zoom level display and basic controls
 *
 * Displays current zoom level with formatting and provides
 * basic zoom controls with D&D theming.
 */

import React from 'react'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Box, Text, Button } from '@/components/primitives'

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

// Helper functions for styling
const getZoomContainerStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px',
  backgroundColor: 'rgba(26, 26, 26, 0.8)',
  borderRadius: '6px',
  backdropFilter: 'blur(4px)',
  border: '1px solid var(--gray-800)'
})

const getZoomDisplayStyles = (): React.CSSProperties => ({
  fontSize: '14px',
  fontWeight: '500',
  color: 'var(--gray-100)',
  minWidth: '60px',
  textAlign: 'center' as const,
  fontFamily: 'monospace'
})

const getZoomButtonStyles = (disabled = false): React.CSSProperties => ({
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  border: '1px solid var(--gray-600)',
  borderRadius: '4px',
  color: 'var(--gray-300)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  transition: 'all 0.2s ease'
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
  const canZoomIn = zoom < maxZoom
  const canZoomOut = zoom > minZoom

  const formatZoom = (value: number): string => {
    if (showPercentage) {
      return `${Math.round(value * 100)}%`
    }
    return `${value.toFixed(1)}x`
  }

  return (
    <Box style={getZoomContainerStyles()}>
      {showButtons && (
        <Button
          disabled={!canZoomOut}
          onClick={onZoomOut}
          title="Zoom out"
          style={getZoomButtonStyles(!canZoomOut)}
        >
          <ZoomOut size={14} />
        </Button>
      )}

      <Text
        variant="body"
        size="xs"
        title={`Zoom: ${formatZoom(zoom)}`}
        style={getZoomDisplayStyles()}
      >
        {formatZoom(zoom)}
      </Text>

      {showButtons && (
        <>
          <Button
            disabled={!canZoomIn}
            onClick={onZoomIn}
            title="Zoom in"
            style={getZoomButtonStyles(!canZoomIn)}
          >
            <ZoomIn size={14} />
          </Button>

          <Button
            onClick={onReset}
            title="Reset zoom to 100%"
            style={getZoomButtonStyles(false)}
          >
            <RotateCcw size={14} />
          </Button>
        </>
      )}
    </Box>
  )
})

ZoomControl.displayName = 'ZoomControl'
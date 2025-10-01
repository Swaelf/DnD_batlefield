/**
 * Navigation Panel Component
 * Top-screen navigation controls for zoom, grid snap, and map movement
 */

import { type FC } from 'react'
import { ZoomIn, ZoomOut, Grid3x3, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Maximize2 } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Button } from '@/components/primitives/ButtonVE'
import { Text } from '@/components/primitives/TextVE'
import useMapStore from '@/store/mapStore'

export type NavigationPanelProps = {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onPanUp: () => void
  onPanDown: () => void
  onPanLeft: () => void
  onPanRight: () => void
}

export const NavigationPanel: FC<NavigationPanelProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onPanUp,
  onPanDown,
  onPanLeft,
  onPanRight
}) => {
  const currentMap = useMapStore(state => state.currentMap)
  const toggleGridSnap = useMapStore(state => state.toggleGridSnap)
  const gridSnap = currentMap?.grid?.snap ?? true

  return (
    <Box
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        border: '1px solid #2A2A2A',
        borderRadius: '8px',
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* Pan Controls */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          padding: '4px',
          borderRight: '1px solid var(--colors-gray700)'
        }}
      >
        {/* Up Arrow */}
        <Box style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPanUp}
            title="Pan up (W)"
            style={{
              padding: '4px',
              minWidth: 'auto',
              height: '28px',
              width: '28px'
            }}
          >
            <ArrowUp size={16} />
          </Button>
        </Box>

        {/* Left, Center, Right */}
        <Box style={{ display: 'flex', gap: '2px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPanLeft}
            title="Pan left (A)"
            style={{
              padding: '4px',
              minWidth: 'auto',
              height: '28px',
              width: '28px'
            }}
          >
            <ArrowLeft size={16} />
          </Button>

          <Box
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={onPanRight}
            title="Pan right (D)"
            style={{
              padding: '4px',
              minWidth: 'auto',
              height: '28px',
              width: '28px'
            }}
          >
            <ArrowRight size={16} />
          </Button>
        </Box>

        {/* Down Arrow */}
        <Box style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onPanDown}
            title="Pan down (S)"
            style={{
              padding: '4px',
              minWidth: 'auto',
              height: '28px',
              width: '28px'
            }}
          >
            <ArrowDown size={16} />
          </Button>
        </Box>
      </Box>

      {/* Zoom Controls */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '0 8px',
          borderRight: '1px solid var(--colors-gray700)'
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          title="Zoom out (-)"
          disabled={zoom <= 0.1}
          style={{
            padding: '4px',
            minWidth: 'auto',
            height: '32px',
            width: '32px'
          }}
        >
          <ZoomOut size={18} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomReset}
          title="Reset zoom (0)"
          style={{
            padding: '4px 8px',
            minWidth: '64px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Maximize2 size={14} />
          <Text
            variant="body"
            size="sm"
            style={{
              color: 'var(--colors-gray300)',
              fontWeight: '500',
              fontFamily: 'monospace'
            }}
          >
            {Math.round(zoom * 100)}%
          </Text>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          title="Zoom in (+)"
          disabled={zoom >= 3}
          style={{
            padding: '4px',
            minWidth: 'auto',
            height: '32px',
            width: '32px'
          }}
        >
          <ZoomIn size={18} />
        </Button>
      </Box>

      {/* Grid Snap Toggle */}
      <Box style={{ padding: '0 4px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleGridSnap}
          title={`Grid snap: ${gridSnap ? 'ON' : 'OFF'} (G)`}
          style={{
            padding: '4px 12px',
            minWidth: 'auto',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: gridSnap ? '#3B82F6' : 'transparent',
            color: gridSnap ? 'white' : '#9CA3AF',
            border: gridSnap ? '1px solid #60A5FA' : '1px solid transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <Grid3x3 size={16} />
          <Text
            variant="body"
            size="sm"
            style={{
              fontWeight: '500',
              color: 'inherit'
            }}
          >
            Snap
          </Text>
        </Button>
      </Box>
    </Box>
  )
}
/**
 * Navigation Pad Component
 * Circular navigation control in bottom-left corner for map panning
 */

import { type FC } from 'react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Button } from '@/components/primitives/ButtonVE'

export type NavigationPadProps = {
  onPanUp: () => void
  onPanDown: () => void
  onPanLeft: () => void
  onPanRight: () => void
}

export const NavigationPad: FC<NavigationPadProps> = ({
  onPanUp,
  onPanDown,
  onPanLeft,
  onPanRight
}) => {
  return (
    <Box
      style={{
        position: 'fixed',
        bottom: '80px', // Above status bar
        left: '80px', // After toolbar
        zIndex: 100,
        width: '110px',
        height: '110px',
        backgroundColor: '#1A1A1A',
        border: '1px solid #2A2A2A',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Up button */}
      <Box
        style={{
          position: 'absolute',
          top: '8px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onPanUp}
          title="Pan up (W)"
          style={{
            padding: '6px',
            minWidth: 'auto',
            height: '32px',
            width: '32px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <ArrowUp size={18} />
        </Button>
      </Box>

      {/* Left button */}
      <Box
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onPanLeft}
          title="Pan left (A)"
          style={{
            padding: '6px',
            minWidth: 'auto',
            height: '32px',
            width: '32px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <ArrowLeft size={18} />
        </Button>
      </Box>

      {/* Center indicator */}
      <Box
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#3B82F6',
          opacity: 0.4
        }}
      />

      {/* Right button */}
      <Box
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onPanRight}
          title="Pan right (D)"
          style={{
            padding: '6px',
            minWidth: 'auto',
            height: '32px',
            width: '32px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <ArrowRight size={18} />
        </Button>
      </Box>

      {/* Down button */}
      <Box
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onPanDown}
          title="Pan down (S)"
          style={{
            padding: '6px',
            minWidth: 'auto',
            height: '32px',
            width: '32px',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <ArrowDown size={18} />
        </Button>
      </Box>
    </Box>
  )
}
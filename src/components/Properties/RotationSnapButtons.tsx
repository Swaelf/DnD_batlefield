import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'

type RotationSnapButtonsProps = {
  value: number
  snapAngles: number[]
  onSnapClick: (angle: number) => void
}

export const RotationSnapButtons: FC<RotationSnapButtonsProps> = ({
  value,
  snapAngles,
  onSnapClick
}) => {
  return (
    <Box style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {snapAngles.map((angle) => (
        <button
          key={angle}
          onClick={() => onSnapClick(angle)}
          style={{
            padding: '2px 6px',
            fontSize: '11px',
            backgroundColor: value === angle ? 'var(--colors-secondary)' : 'var(--colors-gray700)',
            color: value === angle ? 'var(--colors-dndBlack)' : 'var(--colors-gray300)',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {angle}°
        </button>
      ))}
    </Box>
  )
}

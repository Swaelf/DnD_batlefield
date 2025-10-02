import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { RotationDial } from './RotationDial'
import { RotationInputControls } from './RotationInputControls'
import { RotationSnapButtons } from './RotationSnapButtons'

type RotationControlProps = {
  value: number
  onChange: (value: number) => void
}

const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]
const SNAP_THRESHOLD = 5

export const RotationControl: FC<RotationControlProps> = ({ value, onChange }) => {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Label */}
      <Text
        variant="label"
        size="sm"
        style={{
          display: 'block',
          color: 'var(--colors-gray300)',
          fontWeight: '500'
        }}
      >
        Rotation
      </Text>

      {/* Visual Rotation Dial */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <RotationDial
          value={value}
          snapAngles={SNAP_ANGLES}
          snapThreshold={SNAP_THRESHOLD}
          onChange={onChange}
        />

        {/* Input and Slider */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <RotationInputControls value={value} onChange={onChange} />
          <RotationSnapButtons
            value={value}
            snapAngles={SNAP_ANGLES}
            onSnapClick={onChange}
          />
        </Box>
      </Box>
    </Box>
  )
}
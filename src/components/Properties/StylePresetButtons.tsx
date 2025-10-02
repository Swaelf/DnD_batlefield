import { type FC } from 'react'
import { Square, Circle, Triangle } from '@/utils/optimizedIcons'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

type StylePreset = 'stone' | 'water' | 'fire'

type StylePresetButtonsProps = {
  onPresetSelect: (preset: StylePreset) => void
}

export const StylePresetButtons: FC<StylePresetButtonsProps> = ({ onPresetSelect }) => {
  return (
    <Box style={{ marginTop: '12px' }}>
      <Text
        variant="label"
        size="xs"
        style={{
          marginBottom: '8px',
          fontWeight: '500',
          color: 'var(--colors-gray300)'
        }}
      >
        Quick Presets
      </Text>
      <Box style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPresetSelect('stone')}
          title="Stone/Wall preset"
          style={{
            padding: '8px',
            minWidth: 'auto',
            width: '48px',
            height: '48px'
          }}
        >
          <Square size={20} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPresetSelect('water')}
          title="Water/Ice preset"
          style={{
            padding: '8px',
            minWidth: 'auto',
            width: '48px',
            height: '48px'
          }}
        >
          <Circle size={20} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPresetSelect('fire')}
          title="Fire/Lava preset"
          style={{
            padding: '8px',
            minWidth: 'auto',
            width: '48px',
            height: '48px'
          }}
        >
          <Triangle size={20} />
        </Button>
      </Box>
    </Box>
  )
}

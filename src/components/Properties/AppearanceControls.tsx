import { type FC, type ChangeEvent } from 'react'
import type { Shape } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Input } from '@/components/ui/Input'
import { ColorPicker } from './ColorPicker'

type AppearanceControlsProps = {
  staticObject: Shape
  onUpdate: (updates: Partial<Shape>) => void
}

export const AppearanceControls: FC<AppearanceControlsProps> = ({
  staticObject,
  onUpdate
}) => {
  return (
    <Box
      style={{
        padding: '16px',
        backgroundColor: 'var(--colors-gray900)',
        borderRadius: '6px',
        border: '1px solid var(--colors-gray700)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <Text
        variant="label"
        size="sm"
        style={{
          display: 'block',
          color: 'var(--colors-gray200)',
          fontWeight: '600'
        }}
      >
        Appearance
      </Text>

      {/* Fill Color */}
      <Box>
        <Text
          variant="label"
          size="sm"
          style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--colors-gray300)',
            fontWeight: '500'
          }}
        >
          Fill Color
        </Text>
        <ColorPicker
          color={staticObject.fill || staticObject.fillColor || '#666666'}
          onChange={(color) => onUpdate({ fill: color, fillColor: color })}
        />
      </Box>

      {/* Stroke Color */}
      <Box>
        <Text
          variant="label"
          size="sm"
          style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--colors-gray300)',
            fontWeight: '500'
          }}
        >
          Stroke Color
        </Text>
        <ColorPicker
          color={staticObject.stroke || staticObject.strokeColor || '#333333'}
          onChange={(color) => onUpdate({ stroke: color, strokeColor: color })}
        />
      </Box>

      {/* Stroke Width */}
      <Box>
        <Text
          variant="label"
          size="sm"
          style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--colors-gray300)',
            fontWeight: '500'
          }}
        >
          Stroke Width
        </Text>
        <Input
          type="number"
          value={staticObject.strokeWidth || 2}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ strokeWidth: Number(e.target.value) })}
          min={0}
          max={20}
          style={{ width: '100%' }}
        />
      </Box>

      {/* Opacity */}
      <Box>
        <Text
          variant="label"
          size="sm"
          style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--colors-gray300)',
            fontWeight: '500'
          }}
        >
          Opacity
        </Text>
        <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            value={staticObject.opacity || 1}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ opacity: Number(e.target.value) })}
            min="0"
            max="1"
            step="0.1"
            style={{
              flex: 1,
              height: '6px',
              backgroundColor: 'var(--colors-gray700)',
              borderRadius: '3px',
              outline: 'none',
              appearance: 'none'
            }}
          />
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              minWidth: '40px',
              textAlign: 'right',
              color: 'var(--colors-gray200)',
              fontFamily: 'monospace'
            }}
          >
            {Math.round((staticObject.opacity || 1) * 100)}%
          </Text>
        </Box>
      </Box>
    </Box>
  )
}

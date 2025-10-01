import { memo, type FC, type ChangeEvent } from 'react'
import type { MapObject } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Input } from '@/components/ui/Input'

type BasePropertiesProps = {
  selectedObject: MapObject
  localPosition: { x: number; y: number }
  localRotation: number
  localOpacity: number
  onPositionChange: (axis: 'x' | 'y', value: number) => void
  onRotationChange: (value: number) => void
  onOpacityChange: (value: number) => void
}

const BasePropertiesComponent: FC<BasePropertiesProps> = ({
  selectedObject,
  localPosition,
  localRotation,
  localOpacity,
  onPositionChange,
  onRotationChange,
  onOpacityChange
}) => {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Object Type */}
      <Box
        style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text
            variant="body"
            size="xs"
            style={{
              margin: 0,
              color: 'var(--colors-gray400)'
            }}
          >
            Type:
          </Text>
          <Text
            variant="body"
            size="sm"
            style={{
              margin: 0,
              fontWeight: '500',
              textTransform: 'capitalize',
              color: 'var(--colors-gray200)'
            }}
          >
            {selectedObject.type}
          </Text>
        </Box>
      </Box>

      {/* Position & Transform */}
      <Box
        style={{
          padding: '16px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray700)',
          borderTop: '2px solid var(--colors-secondary)'
        }}
      >
        {/* Position Grid */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}
        >
          <Box>
            <Text
              variant="label"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '4px',
                color: 'var(--colors-gray300)',
                fontWeight: '500'
              }}
            >
              X Position
            </Text>
            <Input
              type="number"
              value={Math.round(localPosition.x)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onPositionChange('x', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </Box>
          <Box>
            <Text
              variant="label"
              size="sm"
              style={{
                display: 'block',
                marginBottom: '4px',
                color: 'var(--colors-gray300)',
                fontWeight: '500'
              }}
            >
              Y Position
            </Text>
            <Input
              type="number"
              value={Math.round(localPosition.y)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onPositionChange('y', Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </Box>
        </Box>

        {/* Rotation */}
        <Box style={{ marginBottom: '16px' }}>
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
            Rotation
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="range"
              value={localRotation}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onRotationChange(Number(e.target.value))}
              min="0"
              max="360"
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
              {localRotation}°
            </Text>
          </Box>
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
              value={localOpacity}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onOpacityChange(Number(e.target.value))}
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
              {Math.round(localOpacity * 100)}%
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export const BaseProperties = memo(BasePropertiesComponent)
BaseProperties.displayName = 'BaseProperties'
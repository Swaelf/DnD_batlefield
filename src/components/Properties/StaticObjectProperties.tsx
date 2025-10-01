import { memo, type FC, type ChangeEvent } from 'react'
import type { Shape } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Input } from '@/components/ui/Input'
import { ColorPicker } from './ColorPicker'

type StaticObjectPropertiesProps = {
  staticObject: Shape
  onUpdate: (updates: Partial<Shape>) => void
}

const StaticObjectPropertiesComponent: FC<StaticObjectPropertiesProps> = ({
  staticObject,
  onUpdate
}) => {
  // Safety check for undefined staticObject
  if (!staticObject) {
    return (
      <Box
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text variant="body" size="sm" style={{ color: 'var(--colors-gray400)' }}>
          No object selected
        </Text>
      </Box>
    )
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Size Controls */}
      <Box
        style={{
          padding: '16px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '6px',
          border: '1px solid var(--colors-gray700)',
          borderTop: '2px solid var(--colors-secondary)'
        }}
      >
        <Text
          variant="label"
          size="sm"
          style={{
            display: 'block',
            marginBottom: '12px',
            color: 'var(--colors-gray200)',
            fontWeight: '600'
          }}
        >
          Dimensions
        </Text>

        {/* Rectangle/Rect Dimensions */}
        {(staticObject.shapeType === 'rect' || staticObject.shapeType === 'rectangle') && (
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
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
                Width
              </Text>
              <Input
                type="number"
                value={staticObject.width || 100}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ width: Number(e.target.value) })}
                min={10}
                max={500}
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
                Height
              </Text>
              <Input
                type="number"
                value={staticObject.height || 100}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ height: Number(e.target.value) })}
                min={10}
                max={500}
                style={{ width: '100%' }}
              />
            </Box>
          </Box>
        )}

        {/* Circle Radius */}
        {staticObject.shapeType === 'circle' && (
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
              Radius
            </Text>
            <Input
              type="number"
              value={staticObject.radius || 50}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ radius: Number(e.target.value) })}
              min={10}
              max={250}
              style={{ width: '100%' }}
            />
          </Box>
        )}
      </Box>


      {/* Style Controls */}
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
    </Box>
  )
}

export const StaticObjectProperties = memo(StaticObjectPropertiesComponent)
StaticObjectProperties.displayName = 'StaticObjectProperties'
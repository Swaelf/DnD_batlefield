import { memo, type FC, type ChangeEvent } from 'react'
import type { Shape } from '@/types'
import { ColorPicker } from './ColorPicker'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Input } from '@/components/ui/Input'

type ShapePropertiesProps = {
  shape: Shape
  onUpdate: (updates: Partial<Shape>) => void
}

const ShapePropertiesComponent: FC<ShapePropertiesProps> = ({
  shape,
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
          color={shape.fill}
          onChange={(color) => onUpdate({ fill: color })}
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
          color={shape.stroke}
          onChange={(color) => onUpdate({ stroke: color })}
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
          value={shape.strokeWidth}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ strokeWidth: Number(e.target.value) })}
          min={0}
          max={20}
          style={{ width: '100%' }}
        />
      </Box>

      {/* Rectangle Dimensions */}
      {(shape.shapeType === 'rect' || shape.shapeType === 'rectangle') && (
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
                marginBottom: '8px',
                color: 'var(--colors-gray300)',
                fontWeight: '500'
              }}
            >
              Width
            </Text>
            <Input
              type="number"
              value={shape.width}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ width: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </Box>
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
              Height
            </Text>
            <Input
              type="number"
              value={shape.height}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ height: Number(e.target.value) })}
              style={{ width: '100%' }}
            />
          </Box>
        </Box>
      )}

      {/* Circle Radius */}
      {shape.shapeType === 'circle' && (
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
            Radius
          </Text>
          <Input
            type="number"
            value={shape.radius}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdate({ radius: Number(e.target.value) })}
            style={{ width: '100%' }}
          />
        </Box>
      )}
    </Box>
  )
}

export const ShapeProperties = memo(ShapePropertiesComponent)
ShapeProperties.displayName = 'ShapeProperties'
import { type FC, type ChangeEvent } from 'react'
import type { Shape } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Input } from '@/components/ui/Input'

type DimensionControlsProps = {
  staticObject: Shape
  onUpdate: (updates: Partial<Shape>) => void
}

export const DimensionControls: FC<DimensionControlsProps> = ({
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
  )
}

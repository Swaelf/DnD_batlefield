import React, { memo } from 'react'
import { Shape } from '@/types'
import { ColorPicker } from './ColorPicker'
import {
  PanelSection,
  Field,
  FieldLabel,
  NumberInput,
  Box
} from '@/components/ui'

type ShapePropertiesProps = {
  shape: Shape
  onUpdate: (updates: Partial<Shape>) => void
}

const ShapePropertiesComponent: React.FC<ShapePropertiesProps> = ({
  shape,
  onUpdate
}) => {
  return (
    <PanelSection>
      <Field>
        <FieldLabel>Fill Color</FieldLabel>
        <ColorPicker
          color={shape.fill}
          onChange={(color) => onUpdate({ fill: color })}
        />
      </Field>

      <Field>
        <FieldLabel>Stroke Color</FieldLabel>
        <ColorPicker
          color={shape.stroke}
          onChange={(color) => onUpdate({ stroke: color })}
        />
      </Field>

      <Field>
        <FieldLabel>Stroke Width</FieldLabel>
        <NumberInput
          value={shape.strokeWidth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ strokeWidth: Number(e.target.value) })}
          min={0}
          max={20}
          fullWidth
          size="sm"
        />
      </Field>

      {(shape.shapeType === 'rect' || shape.shapeType === 'rectangle') && (
        <>
          <Box display="grid" css={{ gridTemplateColumns: '1fr 1fr', gap: '$3' }}>
            <Field>
              <FieldLabel>Width</FieldLabel>
              <NumberInput
                value={shape.width}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ width: Number(e.target.value) })}
                fullWidth
                size="sm"
              />
            </Field>
            <Field>
              <FieldLabel>Height</FieldLabel>
              <NumberInput
                value={shape.height}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ height: Number(e.target.value) })}
                fullWidth
                size="sm"
              />
            </Field>
          </Box>
        </>
      )}

      {shape.shapeType === 'circle' && (
        <Field>
          <FieldLabel>Radius</FieldLabel>
          <NumberInput
            value={shape.radius}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ radius: Number(e.target.value) })}
            fullWidth
            size="sm"
          />
        </Field>
      )}
    </PanelSection>
  )
}

export const ShapeProperties = memo(ShapePropertiesComponent)
ShapeProperties.displayName = 'ShapeProperties'
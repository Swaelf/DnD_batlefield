import React, { memo } from 'react'
import { MapObject } from '@/types'
import {
  PanelSection,
  Field,
  FieldLabel,
  NumberInput,
  Box,
  Text
} from '@/components/ui'

type BasePropertiesProps = {
  selectedObject: MapObject
  localPosition: { x: number; y: number }
  localRotation: number
  localOpacity: number
  onPositionChange: (axis: 'x' | 'y', value: number) => void
  onRotationChange: (value: number) => void
  onOpacityChange: (value: number) => void
}

const BasePropertiesComponent: React.FC<BasePropertiesProps> = ({
  selectedObject,
  localPosition,
  localRotation,
  localOpacity,
  onPositionChange,
  onRotationChange,
  onOpacityChange
}) => {
  return (
    <>
      {/* Object Type */}
      <PanelSection css={{ marginBottom: '$4' }}>
        <Box display="flex" alignItems="center" gap="2">
          <Text size="xs" color="gray400">Type:</Text>
          <Text size="sm" weight="medium" transform="capitalize">{selectedObject.type}</Text>
        </Box>
      </PanelSection>

      {/* Position & Transform */}
      <PanelSection divider>
        <Box display="grid" css={{ gridTemplateColumns: '1fr 1fr', gap: '$2' }}>
          <Field>
            <FieldLabel>X Position</FieldLabel>
            <NumberInput
              value={Math.round(localPosition.x)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPositionChange('x', Number(e.target.value))}
              fullWidth
              size="sm"
            />
          </Field>
          <Field>
            <FieldLabel>Y Position</FieldLabel>
            <NumberInput
              value={Math.round(localPosition.y)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPositionChange('y', Number(e.target.value))}
              fullWidth
              size="sm"
            />
          </Field>
        </Box>

        <Field>
          <FieldLabel>Rotation</FieldLabel>
          <Box display="flex" alignItems="center" gap="2">
            <input
              type="range"
              value={localRotation}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRotationChange(Number(e.target.value))}
              min="0"
              max="360"
              style={{ flex: 1 }}
            />
            <Text size="sm" css={{ minWidth: '40px', textAlign: 'right' }}>
              {localRotation}°
            </Text>
          </Box>
        </Field>

        <Field>
          <FieldLabel>Opacity</FieldLabel>
          <Box display="flex" alignItems="center" gap="2">
            <input
              type="range"
              value={localOpacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              style={{ flex: 1 }}
            />
            <Text size="sm" css={{ minWidth: '40px', textAlign: 'right' }}>
              {Math.round(localOpacity * 100)}%
            </Text>
          </Box>
        </Field>
      </PanelSection>
    </>
  )
}

export const BaseProperties = memo(BasePropertiesComponent)
BaseProperties.displayName = 'BaseProperties'
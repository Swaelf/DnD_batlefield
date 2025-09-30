import React from 'react'
import { Box, Text } from '@/components/primitives'
import { Input } from '@/components/ui'
import { RotationIndicator } from './RotationIndicator'
import { AngleIndicator } from './AngleIndicator'

export type EffectDimensions = {
  radius?: number
  width?: number
  height?: number
  length?: number
  angle?: number
}

export type EffectProperties = {
  color: string
  opacity: number
  rotation: number
  dimensions: EffectDimensions
}

type EffectPropertiesPanelProps = {
  effectType: 'circle' | 'rectangle' | 'cone' | 'line' | 'polygon'
  properties: EffectProperties
  onChange: (properties: EffectProperties) => void
}

export const EffectPropertiesPanel: React.FC<EffectPropertiesPanelProps> = ({
  effectType,
  properties,
  onChange
}) => {
  const updateProperty = <K extends keyof EffectProperties>(
    key: K,
    value: EffectProperties[K]
  ) => {
    onChange({ ...properties, [key]: value })
  }

  const updateDimension = <K extends keyof EffectDimensions>(
    key: K,
    value: number
  ) => {
    onChange({
      ...properties,
      dimensions: { ...properties.dimensions, [key]: value }
    })
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Color and Opacity Row */}
      <Box display="flex" gap={2}>
        <Box flexGrow={1}>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Color</Text>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="color"
              value={properties.color}
              onChange={(e) => updateProperty('color', e.target.value)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: '1px solid #3a3a3a'
              }}
            />
            <Input
              value={properties.color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateProperty('color', e.target.value)
              }
              size="sm"
              fullWidth
            />
          </Box>
        </Box>

        <Box style={{ width: '80px' }}>
          <Box marginBottom={1}>
            <Text size="xs" color="gray400">Opacity</Text>
          </Box>
          <Input
            type="number"
            min="10"
            max="100"
            value={Math.round(properties.opacity * 100)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = Number(e.target.value)
              if (val >= 10 && val <= 100) {
                updateProperty('opacity', val / 100)
              }
            }}
            size="sm"
          />
        </Box>
      </Box>

      {/* Rotation and Dimensions Row */}
      <Box display="flex" gap={3} alignItems="flex-start">
        {/* Rotation Indicator */}
        <RotationIndicator
          value={properties.rotation}
          onChange={(value) => updateProperty('rotation', value)}
          label="Rotation"
          size={70}
        />

        {/* Dimensions */}
        <Box flexGrow={1} display="flex" flexDirection="column" gap={2}>
          <Text size="xs" weight="semibold" color="gray300">Dimensions</Text>

          {effectType === 'circle' && (
            <Box>
              <Box marginBottom={1}>
                <Text size="xs" color="gray400">Radius (px)</Text>
              </Box>
              <Input
                type="number"
                min="10"
                max="500"
                value={properties.dimensions.radius || 50}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = Number(e.target.value)
                  if (val >= 10 && val <= 500) updateDimension('radius', val)
                }}
                size="sm"
                fullWidth
              />
            </Box>
          )}

          {effectType === 'rectangle' && (
            <Box display="flex" gap={2}>
              <Box flexGrow={1}>
                <Box marginBottom={1}>
                  <Text size="xs" color="gray400">Width</Text>
                </Box>
                <Input
                  type="number"
                  min="10"
                  max="1000"
                  value={properties.dimensions.width || 100}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = Number(e.target.value)
                    if (val >= 10 && val <= 1000) updateDimension('width', val)
                  }}
                  size="sm"
                />
              </Box>
              <Box flexGrow={1}>
                <Box marginBottom={1}>
                  <Text size="xs" color="gray400">Height</Text>
                </Box>
                <Input
                  type="number"
                  min="10"
                  max="1000"
                  value={properties.dimensions.height || 60}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = Number(e.target.value)
                    if (val >= 10 && val <= 1000) updateDimension('height', val)
                  }}
                  size="sm"
                />
              </Box>
            </Box>
          )}

          {effectType === 'cone' && (
            <>
              <Box>
                <Box marginBottom={1}>
                  <Text size="xs" color="gray400">Length (px)</Text>
                </Box>
                <Input
                  type="number"
                  min="30"
                  max="500"
                  value={properties.dimensions.length || 80}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = Number(e.target.value)
                    if (val >= 30 && val <= 500) updateDimension('length', val)
                  }}
                  size="sm"
                  fullWidth
                />
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <AngleIndicator
                  value={properties.dimensions.angle || 60}
                  onChange={(value) => updateDimension('angle', value)}
                  label="Cone Angle"
                  min={15}
                  max={180}
                  size={70}
                />
              </Box>
            </>
          )}

          {effectType === 'line' && (
            <Box>
              <Box marginBottom={1}>
                <Text size="xs" color="gray400">Length (px)</Text>
              </Box>
              <Input
                type="number"
                min="30"
                max="1000"
                value={properties.dimensions.length || 100}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const val = Number(e.target.value)
                  if (val >= 30 && val <= 1000) updateDimension('length', val)
                }}
                size="sm"
                fullWidth
              />
            </Box>
          )}

          {effectType === 'polygon' && (
            <Box display="flex" gap={2}>
              <Box flexGrow={1}>
                <Box marginBottom={1}>
                  <Text size="xs" color="gray400">Width</Text>
                </Box>
                <Input
                  type="number"
                  min="10"
                  max="1000"
                  value={properties.dimensions.width || 100}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = Number(e.target.value)
                    if (val >= 10 && val <= 1000) updateDimension('width', val)
                  }}
                  size="sm"
                />
              </Box>
              <Box flexGrow={1}>
                <Box marginBottom={1}>
                  <Text size="xs" color="gray400">Height</Text>
                </Box>
                <Input
                  type="number"
                  min="10"
                  max="1000"
                  value={properties.dimensions.height || 60}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const val = Number(e.target.value)
                    if (val >= 10 && val <= 1000) updateDimension('height', val)
                  }}
                  size="sm"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
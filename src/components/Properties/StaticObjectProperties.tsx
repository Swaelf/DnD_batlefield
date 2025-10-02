import { memo, type FC } from 'react'
import type { Shape } from '@/types'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { DimensionControls } from './DimensionControls'
import { AppearanceControls } from './AppearanceControls'

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
      <DimensionControls staticObject={staticObject} onUpdate={onUpdate} />

      {/* Style Controls */}
      <AppearanceControls staticObject={staticObject} onUpdate={onUpdate} />
    </Box>
  )
}

export const StaticObjectProperties = memo(StaticObjectPropertiesComponent)
StaticObjectProperties.displayName = 'StaticObjectProperties'
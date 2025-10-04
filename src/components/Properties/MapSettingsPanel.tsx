import { type FC } from 'react'
import { Palette } from '@/utils/optimizedIcons'
import useMapStore from '@store/mapStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { ColorPaletteSelector } from './ColorPaletteSelector'

// Predefined background color palette for D&D maps
const BACKGROUND_COLORS = [
  { name: 'Default Black', color: '#1A1A1A' },
  { name: 'Stone Gray', color: '#2D2D2D' },
  { name: 'Forest Green', color: '#0F3A1F' },
  { name: 'Ocean Blue', color: '#0A1929' },
  { name: 'Desert Sand', color: '#2B2416' },
  { name: 'Cave Dark', color: '#0D0D0D' },
  { name: 'Snow White', color: '#F0F0F0' },
  { name: 'Lava Red', color: '#3A0A0A' },
]

export const MapSettingsPanel: FC = () => {
  const currentMap = useMapStore(state => state.currentMap)
  const setFieldColor = useMapStore(state => state.setFieldColor)

  const fieldColor = currentMap?.terrain?.fieldColor || '#1A1A1A'

  return (
    <Box
      style={{
        backgroundColor: 'var(--colors-dndBlack)',
        borderRadius: '8px',
        border: '1px solid var(--colors-gray800)',
        padding: '12px',
        marginBottom: '16px'
      }}
    >
      {/* Header */}
      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Palette size={16} style={{ color: 'var(--colors-secondary)' }} />
        <Text
          variant="heading"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--colors-gray100)'
          }}
        >
          Map Settings
        </Text>
      </Box>

      {/* Field Color Selector */}
      <ColorPaletteSelector
        label="Background Color"
        colors={BACKGROUND_COLORS}
        selectedColor={fieldColor}
        onColorSelect={setFieldColor}
      />

      {/* Current Color Display */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '4px',
          border: '1px solid var(--colors-gray800)'
        }}
      >
        <Box
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            backgroundColor: fieldColor,
            border: '1px solid var(--colors-gray700)'
          }}
        />
        <Text
          variant="code"
          style={{
            fontSize: '11px',
            color: 'var(--colors-gray400)',
            fontFamily: 'monospace'
          }}
        >
          {fieldColor}
        </Text>
      </Box>
    </Box>
  )
}

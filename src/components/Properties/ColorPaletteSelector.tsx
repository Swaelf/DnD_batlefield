import { type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'

type ColorPaletteSelectorProps = {
  label: string
  colors: Array<{ name: string; color: string }>
  selectedColor: string
  onColorSelect: (color: string) => void
}

export const ColorPaletteSelector: FC<ColorPaletteSelectorProps> = ({
  label,
  colors,
  selectedColor,
  onColorSelect
}) => {
  return (
    <Box style={{ marginBottom: '12px' }}>
      <Text
        variant="label"
        size="xs"
        style={{
          marginBottom: '8px',
          fontWeight: '500',
          color: 'var(--colors-gray300)'
        }}
      >
        {label}
      </Text>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}
      >
        {colors.map((colorItem) => (
          <button
            key={colorItem.name}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `2px solid ${selectedColor === colorItem.color ? 'var(--colors-secondary)' : 'var(--colors-gray700)'}`,
              backgroundColor: colorItem.color,
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
            onClick={() => onColorSelect(colorItem.color)}
            title={colorItem.name}
          />
        ))}
      </Box>
    </Box>
  )
}

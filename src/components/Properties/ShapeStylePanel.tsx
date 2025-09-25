import React from 'react'
import { Palette, Eye, EyeOff, Square, Circle, Triangle } from 'lucide-react'
import useToolStore from '@store/toolStore'
import { styled } from '@/styles/theme.config'
import { Box, Text, Button } from '@/components/ui'

const StyleContainer = styled(Box, {
  backgroundColor: '$dndBlack',
  borderRadius: '$md',
  border: '1px solid $gray800',
  padding: '$3',
  marginBottom: '$4'
})

const StyleHeader = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '$2',
  marginBottom: '$2',
  borderBottom: '1px solid $gray800'
})

const ColorRow = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$2'
})

const ColorSwatch = styled('button', {
  width: '32px',
  height: '32px',
  borderRadius: '$md',
  border: '2px solid $gray700',
  cursor: 'pointer',
  transition: 'border-color 0.2s ease',

  '&:hover': {
    borderColor: '$gray400'
  },

  '&[data-active="true"]': {
    borderColor: '$secondary'
  }
})

const SliderContainer = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$2'
})

const SliderInput = styled('input', {
  flex: 1,
  appearance: 'none',
  height: '4px',
  borderRadius: '$full',
  background: '$gray800',
  outline: 'none',

  '&::-webkit-slider-thumb': {
    appearance: 'none',
    width: '16px',
    height: '16px',
    borderRadius: '$full',
    background: '$secondary',
    cursor: 'pointer'
  },

  '&::-moz-range-thumb': {
    width: '16px',
    height: '16px',
    borderRadius: '$full',
    background: '$secondary',
    cursor: 'pointer',
    border: 'none'
  }
})

const PresetButton = styled(Button, {
  padding: '$2',
  minWidth: 'auto',
  width: '48px',
  height: '48px',

  '& svg': {
    width: '20px',
    height: '20px'
  }
})

// Predefined color palette for D&D maps
const COLOR_PALETTE = [
  // Fill colors
  { name: 'Stone Gray', color: '#6B7280' },
  { name: 'Forest Green', color: '#16A34A' },
  { name: 'Ocean Blue', color: '#0EA5E9' },
  { name: 'Lava Red', color: '#DC2626' },
  { name: 'Sand Yellow', color: '#FBBF24' },
  { name: 'Purple Magic', color: '#7C3AED' },
  { name: 'Brown Earth', color: '#92400E' },
  { name: 'Ice White', color: '#F8FAFC' },
]

const STROKE_COLORS = [
  { name: 'Black', color: '#000000' },
  { name: 'Dark Gray', color: '#374151' },
  { name: 'Light Gray', color: '#9CA3AF' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Gold', color: '#F59E0B' },
  { name: 'Silver', color: '#6B7280' },
]

export const ShapeStylePanel: React.FC = () => {
  const currentTool = useToolStore(state => state.currentTool)
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)
  const opacity = useToolStore(state => state.opacity)
  const setFillColor = useToolStore(state => state.setFillColor)
  const setStrokeColor = useToolStore(state => state.setStrokeColor)
  const setStrokeWidth = useToolStore(state => state.setStrokeWidth)
  const setOpacity = useToolStore(state => state.setOpacity)

  // Only show panel for drawing tools
  const isDrawingTool = ['rectangle', 'circle', 'line', 'polygon'].includes(currentTool)

  if (!isDrawingTool) {
    return null
  }

  const handleFillPreset = (preset: string) => {
    switch (preset) {
      case 'stone':
        setFillColor('#6B7280')
        setStrokeColor('#374151')
        setStrokeWidth(2)
        setOpacity(0.8)
        break
      case 'water':
        setFillColor('#0EA5E9')
        setStrokeColor('#0369A1')
        setStrokeWidth(1)
        setOpacity(0.6)
        break
      case 'fire':
        setFillColor('#DC2626')
        setStrokeColor('#991B1B')
        setStrokeWidth(2)
        setOpacity(0.9)
        break
    }
  }

  return (
    <StyleContainer>
      <StyleHeader>
        <Box display="flex" alignItems="center" gap="2">
          <Palette size={16} />
          <Text size="sm" weight="medium">Shape Style</Text>
        </Box>
        <Text size="xs" color="gray400">{currentTool}</Text>
      </StyleHeader>

      {/* Fill Color */}
      <Box marginBottom="3">
        <Text size="xs" weight="medium" color="gray300" marginBottom="2">Fill Color</Text>
        <ColorRow>
          {COLOR_PALETTE.map((colorItem) => (
            <ColorSwatch
              key={colorItem.name}
              style={{ backgroundColor: colorItem.color }}
              onClick={() => setFillColor(colorItem.color)}
              data-active={fillColor === colorItem.color}
              title={colorItem.name}
            />
          ))}
        </ColorRow>
      </Box>

      {/* Stroke Color */}
      <Box marginBottom="3">
        <Text size="xs" weight="medium" color="gray300" marginBottom="2">Stroke Color</Text>
        <ColorRow>
          {STROKE_COLORS.map((colorItem) => (
            <ColorSwatch
              key={colorItem.name}
              style={{ backgroundColor: colorItem.color }}
              onClick={() => setStrokeColor(colorItem.color)}
              data-active={strokeColor === colorItem.color}
              title={colorItem.name}
            />
          ))}
        </ColorRow>
      </Box>

      {/* Stroke Width */}
      <SliderContainer>
        <Text size="xs" weight="medium" color="gray300" css={{ minWidth: '60px' }}>
          Width: {strokeWidth}px
        </Text>
        <SliderInput
          type="range"
          min="1"
          max="10"
          step="1"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
        />
      </SliderContainer>

      {/* Opacity */}
      <SliderContainer>
        <Text size="xs" weight="medium" color="gray300" css={{ minWidth: '60px' }}>
          Opacity: {Math.round(opacity * 100)}%
        </Text>
        <SliderInput
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(Number(e.target.value))}
        />
      </SliderContainer>

      {/* Quick Presets */}
      <Box marginTop="3">
        <Text size="xs" weight="medium" color="gray300" marginBottom="2">Quick Presets</Text>
        <Box display="flex" gap="2">
          <PresetButton
            variant="ghost"
            onClick={() => handleFillPreset('stone')}
            title="Stone/Wall preset"
          >
            <Square />
          </PresetButton>
          <PresetButton
            variant="ghost"
            onClick={() => handleFillPreset('water')}
            title="Water/Ice preset"
          >
            <Circle />
          </PresetButton>
          <PresetButton
            variant="ghost"
            onClick={() => handleFillPreset('fire')}
            title="Fire/Lava preset"
          >
            <Triangle />
          </PresetButton>
        </Box>
      </Box>

      {/* Current Tool Hint */}
      <Box marginTop="3" padding="2" backgroundColor="$gray900" borderRadius="$sm">
        <Text size="xs" color="gray400">
          {currentTool === 'polygon' && '🖱️ Click to add points, double-click to finish'}
          {currentTool === 'rectangle' && '🖱️ Click and drag to draw rectangle'}
          {currentTool === 'circle' && '🖱️ Click and drag to draw circle'}
          {currentTool === 'line' && '🖱️ Click and drag to draw line'}
        </Text>
      </Box>
    </StyleContainer>
  )
}
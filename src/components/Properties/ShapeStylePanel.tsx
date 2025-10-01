import { type FC } from 'react'
import { Palette } from '@/utils/optimizedIcons'
import useToolStore from '@store/toolStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { ColorPaletteSelector } from './ColorPaletteSelector'
import { StyleSliderControl } from './StyleSliderControl'
import { StylePresetButtons } from './StylePresetButtons'

// Predefined color palette for D&D maps
const COLOR_PALETTE = [
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

export const ShapeStylePanel: FC = () => {
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

  const handleFillPreset = (preset: 'stone' | 'water' | 'fire') => {
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
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '8px',
          marginBottom: '8px',
          borderBottom: '1px solid var(--colors-gray800)'
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Palette size={16} />
          <Text variant="body" size="sm" style={{ fontWeight: '500' }}>Shape Style</Text>
        </Box>
        <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>{currentTool}</Text>
      </Box>

      {/* Fill Color */}
      <ColorPaletteSelector
        label="Fill Color"
        colors={COLOR_PALETTE}
        selectedColor={fillColor}
        onColorSelect={setFillColor}
      />

      {/* Stroke Color */}
      <ColorPaletteSelector
        label="Stroke Color"
        colors={STROKE_COLORS}
        selectedColor={strokeColor}
        onColorSelect={setStrokeColor}
      />

      {/* Stroke Width */}
      <StyleSliderControl
        label="Width"
        value={strokeWidth}
        min={1}
        max={10}
        step={1}
        onChange={setStrokeWidth}
        formatValue={(v) => `${v}px`}
      />

      {/* Opacity */}
      <StyleSliderControl
        label="Opacity"
        value={opacity}
        min={0.1}
        max={1}
        step={0.1}
        onChange={setOpacity}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />

      {/* Quick Presets */}
      <StylePresetButtons onPresetSelect={handleFillPreset} />

      {/* Current Tool Hint */}
      <Box
        style={{
          marginTop: '12px',
          padding: '8px',
          backgroundColor: 'var(--colors-gray900)',
          borderRadius: '4px'
        }}
      >
        <Text variant="body" size="xs" style={{ color: 'var(--colors-gray400)' }}>
          {currentTool === 'polygon' && '🖱️ Click to add points, double-click to finish'}
          {currentTool === 'rectangle' && '🖱️ Click and drag to draw rectangle'}
          {currentTool === 'circle' && '🖱️ Click and drag to draw circle'}
          {currentTool === 'line' && '🖱️ Click and drag to draw line'}
        </Text>
      </Box>
    </Box>
  )
}
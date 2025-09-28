import React from 'react'
import { Palette, Square, Circle, Triangle } from 'lucide-react'
import useToolStore from '@store/toolStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'


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
          Fill Color
        </Text>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}
        >
          {COLOR_PALETTE.map((colorItem) => (
            <button
              key={colorItem.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: `2px solid ${fillColor === colorItem.color ? 'var(--colors-secondary)' : 'var(--colors-gray700)'}`,
                backgroundColor: colorItem.color,
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onClick={() => setFillColor(colorItem.color)}
              title={colorItem.name}
            />
          ))}
        </Box>
      </Box>

      {/* Stroke Color */}
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
          Stroke Color
        </Text>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}
        >
          {STROKE_COLORS.map((colorItem) => (
            <button
              key={colorItem.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: `2px solid ${strokeColor === colorItem.color ? 'var(--colors-secondary)' : 'var(--colors-gray700)'}`,
                backgroundColor: colorItem.color,
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onClick={() => setStrokeColor(colorItem.color)}
              title={colorItem.name}
            />
          ))}
        </Box>
      </Box>

      {/* Stroke Width */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}
      >
        <Text
          variant="label"
          size="xs"
          style={{
            minWidth: '60px',
            fontWeight: '500',
            color: 'var(--colors-gray300)'
          }}
        >
          Width: {strokeWidth}px
        </Text>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={strokeWidth}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStrokeWidth(Number(e.target.value))}
          style={{
            flex: 1,
            appearance: 'none',
            height: '4px',
            borderRadius: '4px',
            background: 'var(--colors-gray800)',
            outline: 'none'
          }}
        />
      </Box>

      {/* Opacity */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}
      >
        <Text
          variant="label"
          size="xs"
          style={{
            minWidth: '60px',
            fontWeight: '500',
            color: 'var(--colors-gray300)'
          }}
        >
          Opacity: {Math.round(opacity * 100)}%
        </Text>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOpacity(Number(e.target.value))}
          style={{
            flex: 1,
            appearance: 'none',
            height: '4px',
            borderRadius: '4px',
            background: 'var(--colors-gray800)',
            outline: 'none'
          }}
        />
      </Box>

      {/* Quick Presets */}
      <Box style={{ marginTop: '12px' }}>
        <Text
          variant="label"
          size="xs"
          style={{
            marginBottom: '8px',
            fontWeight: '500',
            color: 'var(--colors-gray300)'
          }}
        >
          Quick Presets
        </Text>
        <Box style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFillPreset('stone')}
            title="Stone/Wall preset"
            style={{
              padding: '8px',
              minWidth: 'auto',
              width: '48px',
              height: '48px'
            }}
          >
            <Square size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFillPreset('water')}
            title="Water/Ice preset"
            style={{
              padding: '8px',
              minWidth: 'auto',
              width: '48px',
              height: '48px'
            }}
          >
            <Circle size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFillPreset('fire')}
            title="Fire/Lava preset"
            style={{
              padding: '8px',
              minWidth: 'auto',
              width: '48px',
              height: '48px'
            }}
          >
            <Triangle size={20} />
          </Button>
        </Box>
      </Box>

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
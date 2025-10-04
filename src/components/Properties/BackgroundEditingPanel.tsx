import { type FC } from 'react'
import { Pencil, Palette, Eraser, Square, Circle } from '@/utils/optimizedIcons'
import useToolStore from '@store/toolStore'
import useMapStore from '@store/mapStore'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { ColorPaletteSelector } from './ColorPaletteSelector'
import { StyleSliderControl } from './StyleSliderControl'

// Terrain color palette
const TERRAIN_COLORS = [
  { name: 'Stone Gray', color: '#6B7280' },
  { name: 'Dirt Brown', color: '#92400E' },
  { name: 'Grass Green', color: '#16A34A' },
  { name: 'Water Blue', color: '#0EA5E9' },
  { name: 'Sand Yellow', color: '#FBBF24' },
  { name: 'Ice White', color: '#F8FAFC' },
  { name: 'Lava Red', color: '#DC2626' },
  { name: 'Shadow Black', color: '#1F2937' },
]

// Background color palette
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

export const BackgroundEditingPanel: FC = () => {
  const currentTool = useToolStore(state => state.currentTool)
  const setTool = useToolStore(state => state.setTool)
  const terrainBrushSize = useToolStore(state => state.terrainBrushSize)
  const terrainColor = useToolStore(state => state.terrainColor)
  const terrainOpacity = useToolStore(state => state.terrainOpacity)
  const setTerrainBrushSize = useToolStore(state => state.setTerrainBrushSize)
  const setTerrainColor = useToolStore(state => state.setTerrainColor)
  const setTerrainOpacity = useToolStore(state => state.setTerrainOpacity)

  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const strokeWidth = useToolStore(state => state.strokeWidth)
  const setFillColor = useToolStore(state => state.setFillColor)
  const setStrokeColor = useToolStore(state => state.setStrokeColor)
  const setStrokeWidth = useToolStore(state => state.setStrokeWidth)

  const currentMap = useMapStore(state => state.currentMap)
  const setFieldColor = useMapStore(state => state.setFieldColor)
  const clearTerrainDrawings = useMapStore(state => state.clearTerrainDrawings)
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
      <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Palette size={16} style={{ color: 'var(--colors-secondary)' }} />
        <Text
          variant="heading"
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--colors-gray100)'
          }}
        >
          Background Editing
        </Text>
      </Box>

      {/* Background Field Color */}
      <Box style={{ marginBottom: '16px' }}>
        <ColorPaletteSelector
          label="Field Color"
          colors={BACKGROUND_COLORS}
          selectedColor={fieldColor}
          onColorSelect={setFieldColor}
        />
      </Box>

      {/* Tool Selection */}
      <Box style={{ marginBottom: '16px' }}>
        <Text
          variant="body"
          size="xs"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--colors-gray400)',
            marginBottom: '8px'
          }}
        >
          Tools
        </Text>
        <Box style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {/* Terrain Brush */}
          <ToolButton
            icon={<Pencil size={16} />}
            label="Brush"
            isActive={currentTool === 'terrainBrush'}
            onClick={() => setTool('terrainBrush')}
          />

          {/* Terrain Fill */}
          <ToolButton
            icon={<Palette size={16} />}
            label="Fill"
            isActive={currentTool === 'terrainFill'}
            onClick={() => setTool('terrainFill')}
            disabled
          />

          {/* Terrain Eraser */}
          <ToolButton
            icon={<Eraser size={16} />}
            label="Eraser"
            isActive={currentTool === 'terrainEraser'}
            onClick={() => setTool('terrainEraser')}
            disabled
          />

          {/* Drawing Tools */}
          <ToolButton
            icon={<Square size={16} />}
            label="Rectangle"
            isActive={currentTool === 'rectangle'}
            onClick={() => setTool('rectangle')}
          />

          <ToolButton
            icon={<Circle size={16} />}
            label="Circle"
            isActive={currentTool === 'circle'}
            onClick={() => setTool('circle')}
          />
        </Box>
      </Box>

      {/* Terrain Tool Controls */}
      {(currentTool === 'terrainBrush' || currentTool === 'terrainFill' || currentTool === 'terrainEraser') && (
        <Box style={{ marginBottom: '16px' }}>
          {currentTool === 'terrainBrush' && (
            <StyleSliderControl
              label="Brush Size"
              value={terrainBrushSize}
              onChange={setTerrainBrushSize}
              min={1}
              max={100}
              step={1}
            />
          )}

          {(currentTool === 'terrainBrush' || currentTool === 'terrainFill') && (
            <>
              <ColorPaletteSelector
                label="Terrain Color"
                colors={TERRAIN_COLORS}
                selectedColor={terrainColor}
                onColorSelect={setTerrainColor}
              />
              <StyleSliderControl
                label="Opacity"
                value={terrainOpacity}
                onChange={setTerrainOpacity}
                min={0}
                max={1}
                step={0.1}
              />
            </>
          )}
        </Box>
      )}

      {/* Drawing Tool Controls */}
      {(currentTool === 'rectangle' || currentTool === 'circle') && (
        <Box style={{ marginBottom: '16px' }}>
          <Box style={{ marginBottom: '12px' }}>
            <Text
              variant="body"
              size="xs"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--colors-gray400)',
                marginBottom: '8px'
              }}
            >
              Fill Color
            </Text>
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                border: '1px solid var(--colors-gray700)',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
            />
          </Box>

          <Box style={{ marginBottom: '12px' }}>
            <Text
              variant="body"
              size="xs"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--colors-gray400)',
                marginBottom: '8px'
              }}
            >
              Stroke Color
            </Text>
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                border: '1px solid var(--colors-gray700)',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
            />
          </Box>

          <StyleSliderControl
            label="Stroke Width"
            value={strokeWidth}
            onChange={setStrokeWidth}
            min={0}
            max={20}
            step={1}
          />
        </Box>
      )}

      {/* Clear Terrain Button */}
      <Box style={{ marginTop: '12px' }}>
        <button
          onClick={clearTerrainDrawings}
          style={{
            width: '100%',
            padding: '8px 12px',
            backgroundColor: 'var(--colors-gray800)',
            color: 'var(--colors-gray100)',
            border: '1px solid var(--colors-gray700)',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
          }}
        >
          Clear All Terrain
        </button>
      </Box>
    </Box>
  )
}

// Tool Button Component
const ToolButton: FC<{
  icon: React.ReactNode
  label: string
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}> = ({ icon, label, isActive, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: '1 1 calc(50% - 2px)',
        minWidth: '0',
        padding: '8px',
        backgroundColor: isActive ? 'var(--colors-secondary)' : 'var(--colors-gray800)',
        color: isActive ? 'var(--colors-dndBlack)' : 'var(--colors-gray300)',
        border: `1px solid ${isActive ? 'var(--colors-secondary)' : 'var(--colors-gray700)'}`,
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = 'var(--colors-gray700)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
        }
      }}
    >
      {icon}
      <span style={{ fontSize: '10px' }}>{label}</span>
    </button>
  )
}

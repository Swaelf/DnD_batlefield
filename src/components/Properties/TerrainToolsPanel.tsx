import { type FC } from 'react'
import { Palette } from '@/utils/optimizedIcons'
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

export const TerrainToolsPanel: FC = () => {
  const currentTool = useToolStore(state => state.currentTool)
  const terrainBrushSize = useToolStore(state => state.terrainBrushSize)
  const terrainColor = useToolStore(state => state.terrainColor)
  const terrainOpacity = useToolStore(state => state.terrainOpacity)
  const setTerrainBrushSize = useToolStore(state => state.setTerrainBrushSize)
  const setTerrainColor = useToolStore(state => state.setTerrainColor)
  const setTerrainOpacity = useToolStore(state => state.setTerrainOpacity)
  const clearTerrainDrawings = useMapStore(state => state.clearTerrainDrawings)

  // Only show panel for terrain tools
  const isTerrainTool = ['terrainBrush', 'terrainFill', 'terrainEraser'].includes(currentTool)

  if (!isTerrainTool) {
    return null
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
          Terrain Tools
        </Text>
      </Box>

      {/* Brush Size (only for terrainBrush) */}
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

      {/* Color Selector (for brush and fill) */}
      {(currentTool === 'terrainBrush' || currentTool === 'terrainFill') && (
        <ColorPaletteSelector
          label="Terrain Color"
          colors={TERRAIN_COLORS}
          selectedColor={terrainColor}
          onColorSelect={setTerrainColor}
        />
      )}

      {/* Opacity Slider (for brush and fill) */}
      {(currentTool === 'terrainBrush' || currentTool === 'terrainFill') && (
        <StyleSliderControl
          label="Opacity"
          value={terrainOpacity}
          onChange={setTerrainOpacity}
          min={0}
          max={1}
          step={0.1}
        />
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

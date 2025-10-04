/**
 * Toolbar Component
 * Main tool selection interface with drawing tools and grid controls
 */

import { useCallback, useMemo, memo, type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import useToolStore from '@store/toolStore'
import type { ToolType } from '@/types/tools'
import { TOOLS } from '@/types/tools'
import ToolButton from './ToolButton'


const Toolbar: FC = () => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentTool = useToolStore(state => state.currentTool)
  const setTool = useToolStore(state => state.setTool)

  // Memoize the tools list since it never changes
  const visibleTools = useMemo<ToolType[]>(() => [
    'select',
    'rectangle',
    'circle',
    'token',
    'staticObject',
    'staticEffect',
    'terrainBrush',
    'terrainFill',
    'terrainEraser',
    'pan',
    'measure',
    'text',
    'eraser'
  ], [])

  // Memoize callbacks to prevent child re-renders
  const handleToolClick = useCallback((toolId: ToolType) => {
    setTool(toolId)
  }, [setTool])

  return (
    <Box
      style={{
        width: '64px', // leftToolbarWidth equivalent
        backgroundColor: 'var(--colors-dndBlack)',
        borderRight: '1px solid var(--colors-gray800)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '8px',
        paddingBottom: '8px'
      }}
    >
      {/* Toolbar Title */}
      <Text
        variant="body"
        size="xs"
        style={{
          color: 'var(--colors-gray500)',
          marginBottom: '12px',
          textAlign: 'center'
        }}
      >
        Tools
      </Text>

      {/* Tools Grid */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          width: '100%',
          paddingLeft: '8px',
          paddingRight: '8px'
        }}
      >
        {visibleTools.map((toolId) => {
          const tool = TOOLS[toolId]
          return (
            <ToolButton
              key={tool.id}
              tool={tool}
              isActive={currentTool === tool.id}
              onClick={() => handleToolClick(tool.id)}
            />
          )
        })}
      </Box>


      {/* Divider */}
      <Box
        style={{
          width: '100%',
          paddingLeft: '8px',
          paddingRight: '8px',
          marginTop: '12px',
          marginBottom: '12px'
        }}
      >
        <Box
          style={{
            borderTop: '1px solid var(--colors-gray800)',
            width: '100%'
          }}
        />
      </Box>

      {/* Color indicators */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingLeft: '8px',
          paddingRight: '8px'
        }}
      >
        <ColorIndicatorComponent type="fill" />
        <ColorIndicatorComponent type="stroke" />
      </Box>
    </Box>
  )
}

// Memoize the color indicator to prevent unnecessary re-renders
const ColorIndicatorComponent: FC<{ type: 'fill' | 'stroke' }> = memo(({ type }) => {
  // Use specific selectors for better performance
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const color = type === 'fill' ? fillColor : strokeColor

  return (
    <Box style={{ position: 'relative' }}>
      <Box
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '6px',
          border: '2px solid var(--colors-gray700)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box',
          backgroundColor: type === 'fill' ? color : 'transparent'
        }}
        title={type === 'fill' ? 'Fill Color' : 'Stroke Color'}
      >
        {type === 'stroke' && (
          <Box
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '6px',
              boxSizing: 'border-box',
              border: `3px solid ${color}`
            }}
          />
        )}
      </Box>
      <Box
        style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: 'var(--colors-gray800)',
          borderRadius: '50%',
          fontSize: '10px',
          color: 'var(--colors-gray400)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--colors-gray700)'
        }}
      >
        {type === 'fill' ? 'F' : 'S'}
      </Box>
    </Box>
  )
})

// Add display name for debugging
ColorIndicatorComponent.displayName = 'ColorIndicatorComponent'

export default memo(Toolbar)
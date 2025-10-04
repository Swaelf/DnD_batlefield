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
    'token',
    'staticObject',
    'staticEffect',
    'terrainBrush',
    'pan',
    'measure',
    'text',
    'eraser',
    'battleLogs'
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


    </Box>
  )
}

export default memo(Toolbar)
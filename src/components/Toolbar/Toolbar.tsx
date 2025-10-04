/**
 * Toolbar Component
 * Main tool selection interface with drawing tools and grid controls
 */

import { useCallback, useMemo, memo, type FC } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { ToolButton as StyledToolButton } from '@/components/primitives'
import { Palette } from '@/utils/optimizedIcons'
import useToolStore from '@store/toolStore'
import type { ToolType } from '@/types/tools'
import { TOOLS } from '@/types/tools'
import ToolButton from './ToolButton'


const Toolbar: FC = () => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentTool = useToolStore(state => state.currentTool)
  const setTool = useToolStore(state => state.setTool)
  const isBackgroundEditMode = useToolStore(state => state.isBackgroundEditMode)
  const toggleBackgroundEditMode = useToolStore(state => state.toggleBackgroundEditMode)

  // Memoize the tools list since it never changes (removed drawing and terrain tools)
  const visibleTools = useMemo<ToolType[]>(() => [
    'select',
    'token',
    'staticObject',
    'staticEffect',
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

      {/* Edit Background Toggle Button */}
      <Box
        style={{
          width: '100%',
          paddingLeft: '8px',
          paddingRight: '8px',
          marginBottom: '12px'
        }}
      >
        <StyledToolButton
          onClick={toggleBackgroundEditMode}
          active={isBackgroundEditMode}
          tooltip="Edit Background (B)"
          style={{ width: '100%' }}
        >
          <Palette size={20} />
        </StyledToolButton>
      </Box>
    </Box>
  )
}

export default memo(Toolbar)
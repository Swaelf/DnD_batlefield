import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import useToolStore from '@store/toolStore'
import useRoundStore from '@store/roundStore'
import { TOOLS, ToolType } from '@/types/tools'
import ToolButton from './ToolButton'
import { Calendar } from 'lucide-react'
// Lazy load EventEditor for better initial load performance
const EventEditor = lazy(() => import('../Timeline/EventEditor').then(m => ({ default: m.EventEditor })))
import { styled } from '@/styles/theme.config'
import { Box, Text, Button } from '@/components/primitives'

const ToolbarContainer = styled(Box, {
  width: '$leftToolbarWidth',
  backgroundColor: '$dndBlack',
  borderRight: '1px solid $gray800',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingY: '$2',
})

const ToolbarTitle = styled(Text, {
  fontSize: '$xs',
  color: '$gray500',
  marginBottom: '$3',
  textAlign: 'center',
})

const ToolsGrid = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  width: '100%',
  paddingX: '$2',
})

const ToolbarDivider = styled(Box, {
  width: '100%',
  paddingX: '$2',
  marginY: '$3',

  '&::before': {
    content: '""',
    display: 'flex',
    borderTop: '1px solid $gray800',
    width: '100%',
  },
})

const EventButton = styled(Button, {
  width: '$toolButtonSize',
  height: '$toolButtonSize',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$md',
  backgroundColor: 'transparent',
  color: '$secondary',
  border: '1px solid $gray700',
  transition: '$fast',
  padding: 0,

  '&:hover': {
    backgroundColor: '$gray800',
    borderColor: '$gray600',
  },
})

const EventButtonText = styled(Text, {
  fontSize: '$xs',
  marginTop: '2px',
  lineHeight: '$tight',
})

const ColorIndicatorsContainer = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  paddingX: '$2',
})

const ColorIndicator = styled(Box, {
  position: 'relative',

  variants: {
    type: {
      fill: {},
      stroke: {},
    },
  },
})

const ColorSwatch = styled(Box, {
  width: '40px',
  height: '40px',
  borderRadius: '$md',
  border: '2px solid $gray700',
  cursor: 'pointer',
  transition: '$fast',
  boxSizing: 'border-box',

  '&:hover': {
    borderColor: '$gray600',
  },

  variants: {
    type: {
      fill: {},
      stroke: {
        backgroundColor: 'transparent',
      },
    },
  },
})

const ColorLabel = styled(Box, {
  position: 'absolute',
  top: '-4px',
  right: '-4px',
  width: '12px',
  height: '12px',
  backgroundColor: '$gray800',
  borderRadius: '$round',
  fontSize: '$xs',
  color: '$gray400',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid $gray700',
})

const Toolbar: React.FC = () => {
  // Use specific selectors to prevent unnecessary re-renders
  const currentTool = useToolStore(state => state.currentTool)
  const setTool = useToolStore(state => state.setTool)
  const isInCombat = useRoundStore(state => state.isInCombat)
  const [showEventEditor, setShowEventEditor] = useState(false)

  // Memoize the tools list since it never changes
  const visibleTools = useMemo<ToolType[]>(() => [
    'select',
    'rectangle',
    'circle',
    'token',
    'staticObject',
    'spellEffect',
    'pan',
    'measure',
    'text',
    'eraser'
  ], [])

  // Memoize callbacks to prevent child re-renders
  const handleToolClick = useCallback((toolId: ToolType) => {
    setTool(toolId)
  }, [setTool])

  const handleOpenEventEditor = useCallback(() => {
    setShowEventEditor(true)
  }, [])

  const handleCloseEventEditor = useCallback(() => {
    setShowEventEditor(false)
  }, [])

  return (
    <ToolbarContainer>
      <ToolbarTitle>Tools</ToolbarTitle>

      <ToolsGrid>
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
      </ToolsGrid>

      <ToolbarDivider />

      {/* Event Management Button (only in combat) */}
      {isInCombat && (
        <>
          <EventButton
            onClick={handleOpenEventEditor}
            title="Manage Events"
          >
            <Calendar size={20} />
            <EventButtonText>Events</EventButtonText>
          </EventButton>

          <ToolbarDivider />
        </>
      )}

      {/* Color indicators */}
      <ColorIndicatorsContainer>
        <ColorIndicatorComponent type="fill" />
        <ColorIndicatorComponent type="stroke" />
      </ColorIndicatorsContainer>

      {/* Event Editor Dialog */}
      <Suspense fallback={null}>
        <EventEditor
          isOpen={showEventEditor}
          onClose={handleCloseEventEditor}
        />
      </Suspense>
    </ToolbarContainer>
  )
}

// Memoize the color indicator to prevent unnecessary re-renders
const ColorIndicatorComponent: React.FC<{ type: 'fill' | 'stroke' }> = React.memo(({ type }) => {
  // Use specific selectors for better performance
  const fillColor = useToolStore(state => state.fillColor)
  const strokeColor = useToolStore(state => state.strokeColor)
  const color = type === 'fill' ? fillColor : strokeColor

  return (
    <ColorIndicator type={type}>
      <ColorSwatch
        type={type}
        css={{
          backgroundColor: type === 'fill' ? color : 'transparent',
        }}
        title={type === 'fill' ? 'Fill Color' : 'Stroke Color'}
      >
        {type === 'stroke' && (
          <Box
            css={{
              width: '100%',
              height: '100%',
              borderRadius: '$md',
              border: `3px solid ${color}`,
              boxSizing: 'border-box',
            }}
          />
        )}
      </ColorSwatch>
      <ColorLabel>
        {type === 'fill' ? 'F' : 'S'}
      </ColorLabel>
    </ColorIndicator>
  )
})

// Add display name for debugging
ColorIndicatorComponent.displayName = 'ColorIndicatorComponent'

export default React.memo(Toolbar)
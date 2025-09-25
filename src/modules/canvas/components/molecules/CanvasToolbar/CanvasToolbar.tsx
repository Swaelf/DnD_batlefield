/**
 * CanvasToolbar Molecule - Canvas-specific tool selection
 *
 * Provides canvas-specific tool selection and configuration
 * with visual tool state and cursor preview integration.
 */

import React from 'react'
import {
  MousePointer,
  Pencil,
  Eraser,
  Type,
  Square,
  Ruler,
  Hand,
  ZoomIn
} from 'lucide-react'
import { Box, Text, Button } from '@/components/ui'
import { styled } from '@/styles/theme.config'
import type { ToolType, ToolConfig } from '../../../types'

export interface CanvasToolbarProps {
  readonly activeTool: ToolType
  readonly availableTools: readonly ToolConfig[]
  readonly onToolSelect: (toolType: ToolType) => void
  readonly onToolSettings?: (toolType: ToolType) => void
  readonly orientation?: 'horizontal' | 'vertical'
  readonly showLabels?: boolean
  readonly compact?: boolean
}

const ToolbarContainer = styled(Box, {
  display: 'flex',
  gap: '$1',
  padding: '$2',
  backgroundColor: '$dndBlack/95',
  borderRadius: '$md',
  border: '1px solid $gray800',
  backdropFilter: 'blur(8px)',

  variants: {
    orientation: {
      horizontal: { flexDirection: 'row' },
      vertical: { flexDirection: 'column' }
    },
    compact: {
      true: { padding: '$1' }
    }
  }
})

const ToolButton = styled(Button, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
  padding: '$2',
  borderRadius: '$sm',
  border: '1px solid transparent',
  transition: 'all 0.2s ease',
  minWidth: 'auto',

  '&:hover': {
    backgroundColor: '$gray800/60',
    borderColor: '$gray700'
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$dndRed/20',
        borderColor: '$dndRed',
        color: '$dndRed'
      }
    },
    compact: {
      true: {
        padding: '$1',
        minWidth: '32px',
        minHeight: '32px'
      }
    }
  }
})

const ToolLabel = styled(Text, {
  fontSize: '$xs',
  fontWeight: '$medium',
  whiteSpace: 'nowrap'
})

const ToolIcon = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const ShortcutBadge = styled(Text, {
  fontSize: '$xs',
  color: '$gray500',
  backgroundColor: '$gray800',
  padding: '$1',
  borderRadius: '$xs',
  fontFamily: '$mono',
  lineHeight: 1
})

export const CanvasToolbar: React.FC<CanvasToolbarProps> = React.memo(({
  activeTool,
  availableTools,
  onToolSelect,
  onToolSettings,
  orientation = 'horizontal',
  showLabels = false,
  compact = false
}) => {
  const getToolIcon = (type: ToolType) => {
    const size = compact ? 16 : 18

    switch (type) {
      case 'select': return <MousePointer size={size} />
      case 'draw': return <Pencil size={size} />
      case 'erase': return <Eraser size={size} />
      case 'text': return <Type size={size} />
      case 'shape': return <Square size={size} />
      case 'measure': return <Ruler size={size} />
      case 'pan': return <Hand size={size} />
      case 'zoom': return <ZoomIn size={size} />
      default: return <MousePointer size={size} />
    }
  }

  const getToolLabel = (config: ToolConfig): string => {
    return config.name || config.type.charAt(0).toUpperCase() + config.type.slice(1)
  }

  const getShortcut = (config: ToolConfig): string | undefined => {
    return config.keyboardShortcuts?.[0]
  }

  return (
    <ToolbarContainer
      orientation={orientation}
      compact={compact}
    >
      {availableTools.map(tool => {
        const isActive = tool.type === activeTool
        const shortcut = getShortcut(tool)

        return (
          <ToolButton
            key={tool.id}
            active={isActive}
            compact={compact}
            onClick={() => onToolSelect(tool.type)}
            onDoubleClick={() => onToolSettings?.(tool.type)}
            title={`${getToolLabel(tool)}${shortcut ? ` (${shortcut})` : ''}`}
          >
            <ToolIcon>
              {getToolIcon(tool.type)}
            </ToolIcon>

            {showLabels && !compact && (
              <ToolLabel>{getToolLabel(tool)}</ToolLabel>
            )}

            {shortcut && !compact && (
              <ShortcutBadge>{shortcut}</ShortcutBadge>
            )}
          </ToolButton>
        )
      })}
    </ToolbarContainer>
  )
})

CanvasToolbar.displayName = 'CanvasToolbar'
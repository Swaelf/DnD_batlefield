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
import { Box, Text, Button } from '@/components/primitives'
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

// Component uses primitive components with style prop for styling

// Helper functions for styling
const getToolbarContainerStyles = (orientation: 'horizontal' | 'vertical' = 'horizontal', compact = false): React.CSSProperties => ({
  display: 'flex',
  gap: '4px',
  padding: compact ? '4px' : '8px',
  backgroundColor: 'rgba(26, 26, 26, 0.95)',
  borderRadius: '6px',
  border: '1px solid var(--gray-800)',
  backdropFilter: 'blur(8px)',
  flexDirection: orientation === 'vertical' ? 'column' as const : 'row' as const
})

const getToolButtonStyles = (isActive = false, compact = false): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: compact ? '4px' : '8px',
  borderRadius: '4px',
  border: '1px solid transparent',
  backgroundColor: isActive ? 'rgba(146, 38, 16, 0.2)' : 'transparent',
  borderColor: isActive ? 'var(--dnd-red)' : 'transparent',
  color: isActive ? 'var(--dnd-red)' : 'var(--gray-300)',
  transition: 'all 0.2s ease',
  minWidth: compact ? '32px' : 'auto',
  minHeight: compact ? '32px' : 'auto',
  cursor: 'pointer'
})

// Additional helper styles
const getToolLabelStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  fontWeight: '500',
  whiteSpace: 'nowrap' as const,
  color: 'var(--gray-300)'
})

const getToolIconStyles = (): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const getShortcutBadgeStyles = (): React.CSSProperties => ({
  fontSize: '12px',
  color: 'var(--gray-500)',
  backgroundColor: 'var(--gray-800)',
  padding: '4px',
  borderRadius: '2px',
  fontFamily: 'monospace',
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
    <Box style={getToolbarContainerStyles(orientation, compact)}>
      {availableTools.map(tool => {
        const isActive = tool.type === activeTool
        const shortcut = getShortcut(tool)

        return (
          <Button
            key={tool.id}
            onClick={() => onToolSelect(tool.type)}
            onDoubleClick={() => onToolSettings?.(tool.type)}
            title={`${getToolLabel(tool)}${shortcut ? ` (${shortcut})` : ''}`}
            style={{
              ...getToolButtonStyles(isActive, compact),
              border: 'none',
              background: 'none'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.6)'
                e.currentTarget.style.borderColor = 'var(--gray-700)'
              }
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }
            }}
          >
            <Box style={getToolIconStyles()}>
              {getToolIcon(tool.type)}
            </Box>

            {showLabels && !compact && (
              <Text style={getToolLabelStyles()}>{getToolLabel(tool)}</Text>
            )}

            {shortcut && !compact && (
              <Text style={getShortcutBadgeStyles()}>{shortcut}</Text>
            )}
          </Button>
        )
      })}
    </Box>
  )
})

CanvasToolbar.displayName = 'CanvasToolbar'
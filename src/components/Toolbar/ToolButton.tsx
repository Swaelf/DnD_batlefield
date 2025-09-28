import React from 'react'
import * as Icons from 'lucide-react'
import type { Tool } from '@/types/tools'
import { ToolButton as StyledToolButton } from '@/components/primitives'
import { styled } from '@/styles/theme.config'

type ToolButtonProps = {
  tool: Tool
  isActive: boolean
  onClick: () => void
}

const ShortcutLabel = styled('span', {
  position: 'absolute',
  bottom: '2px',
  right: '2px',
  fontSize: '9px',
  color: '$gray500',
  fontFamily: '$mono',
  pointerEvents: 'none',
  userSelect: 'none',
})

const RelativeToolButton = styled(StyledToolButton, {
  position: 'relative'
})

const ToolButton: React.FC<ToolButtonProps> = ({ tool, isActive, onClick }) => {
  // Dynamically get the icon component
  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.FC<{ size?: number; className?: string }>

  if (!IconComponent) {
    console.warn(`Icon ${tool.icon} not found`)
    return null
  }

  return (
    <RelativeToolButton
      onClick={onClick}
      title={tool.tooltip}
      active={isActive}
    >
      <IconComponent size={20} />
      {tool.shortcut && (
        <ShortcutLabel>
          {tool.shortcut}
        </ShortcutLabel>
      )}
    </RelativeToolButton>
  )
}

// Memoize to prevent re-renders when tool state doesn't change
export default React.memo(ToolButton, (prevProps, nextProps) => {
  return (
    prevProps.tool.id === nextProps.tool.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.onClick === nextProps.onClick
  )
})
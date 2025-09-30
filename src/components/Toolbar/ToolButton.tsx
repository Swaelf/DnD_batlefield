import React from 'react'
import * as LucideIcons from '@/utils/optimizedIcons'
import type { Tool } from '@/types/tools'
import { ToolButton as StyledToolButton } from '@/components/primitives'
import { shortcutLabel, relativeToolButton } from './ToolButton.css'

type ToolButtonProps = {
  tool: Tool
  isActive: boolean
  onClick: () => void
  disabled?: boolean
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, isActive, onClick, disabled = false }) => {
  // Dynamically get the icon component from lucide-react
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[tool.icon]

  if (!IconComponent) {
    console.warn(`Icon ${tool.icon} not found`)
    return null
  }

  return (
    <StyledToolButton
      onClick={onClick}
      title={tool.tooltip}
      active={isActive}
      disabled={disabled}
      className={relativeToolButton}
    >
      <IconComponent size={20} />
      {tool.shortcut && (
        <span className={shortcutLabel}>
          {tool.shortcut}
        </span>
      )}
    </StyledToolButton>
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
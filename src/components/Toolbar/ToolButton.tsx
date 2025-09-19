import React from 'react'
import * as Icons from 'lucide-react'
import { Tool } from '@/types/tools'
import clsx from 'clsx'

interface ToolButtonProps {
  tool: Tool
  isActive: boolean
  onClick: () => void
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, isActive, onClick }) => {
  // Dynamically get the icon component
  const IconComponent = Icons[tool.icon as keyof typeof Icons] as React.FC<{ size?: number; className?: string }>

  if (!IconComponent) {
    console.warn(`Icon ${tool.icon} not found`)
    return null
  }

  return (
    <button
      onClick={onClick}
      title={tool.tooltip}
      className={clsx(
        'relative w-12 h-12 rounded-lg flex items-center justify-center transition-all',
        'hover:bg-dnd-gray-800',
        isActive ? 'bg-dnd-gray-700 text-dnd-gold' : 'text-gray-400 hover:text-gray-300'
      )}
    >
      <IconComponent size={20} />
      {tool.shortcut && (
        <span className="absolute bottom-0 right-0 text-[9px] text-gray-500 font-mono">
          {tool.shortcut}
        </span>
      )}
    </button>
  )
}

export default ToolButton
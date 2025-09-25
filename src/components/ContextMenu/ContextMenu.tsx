import React, { useEffect, useRef, useCallback } from 'react'
import {
  Copy,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Move,
  Palette,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { Box, Text } from '@/components/ui'

interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  divider?: boolean
}

interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  items: ContextMenuItem[]
  onClose: () => void
}

const MenuContainer = styled(Box, {
  position: 'fixed',
  backgroundColor: '$dndBlack',
  border: '1px solid $gray700',
  borderRadius: '$md',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  minWidth: '200px',
  zIndex: 1000,
  overflow: 'hidden',

  // Animation
  opacity: 0,
  transform: 'scale(0.95) translateY(-4px)',
  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',

  '&[data-open="true"]': {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  }
})

const MenuItem = styled('button', {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '$3',
  padding: '$2 $3',
  backgroundColor: 'transparent',
  border: 'none',
  color: '$gray200',
  fontSize: '$sm',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background-color 0.1s ease',

  '&:hover:not(:disabled)': {
    backgroundColor: '$gray800',
    color: '$gray100'
  },

  '&:disabled': {
    color: '$gray600',
    cursor: 'not-allowed'
  },

  '&:focus': {
    outline: 'none',
    backgroundColor: '$gray800'
  }
})

const MenuIcon = styled(Box, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
  flexShrink: 0,

  '& svg': {
    width: '14px',
    height: '14px'
  }
})

const MenuLabel = styled(Text, {
  flex: 1,
  fontSize: '$sm',
  fontWeight: '$normal'
})

const MenuShortcut = styled(Text, {
  fontSize: '$xs',
  color: '$gray500',
  fontFamily: '$mono'
})

const MenuDivider = styled(Box, {
  height: '1px',
  backgroundColor: '$gray700',
  marginY: '$1'
})

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        // Focus next menu item
        const activeElement = document.activeElement as HTMLElement
        const nextElement = activeElement?.nextElementSibling as HTMLElement
        if (nextElement?.focus) {
          nextElement.focus()
        } else {
          // Focus first item
          const firstItem = menuRef.current?.querySelector('button:not(:disabled)') as HTMLElement
          firstItem?.focus()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        // Focus previous menu item
        const activeEl = document.activeElement as HTMLElement
        const prevElement = activeEl?.previousElementSibling as HTMLElement
        if (prevElement?.focus) {
          prevElement.focus()
        } else {
          // Focus last item
          const items = menuRef.current?.querySelectorAll('button:not(:disabled)')
          const lastItem = items?.[items.length - 1] as HTMLElement
          lastItem?.focus()
        }
        break
    }
  }, [isOpen, onClose])

  // Handle clicks outside menu
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose()
    }
  }, [onClose])

  // Auto-positioning to stay within viewport
  const getMenuStyle = useCallback(() => {
    if (!menuRef.current) return { left: position.x, top: position.y }

    const menu = menuRef.current
    const rect = menu.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }

    let left = position.x
    let top = position.y

    // Adjust horizontal position if menu would overflow
    if (left + rect.width > viewport.width - 20) {
      left = viewport.width - rect.width - 20
    }
    if (left < 20) {
      left = 20
    }

    // Adjust vertical position if menu would overflow
    if (top + rect.height > viewport.height - 20) {
      top = position.y - rect.height
    }
    if (top < 20) {
      top = 20
    }

    return { left, top }
  }, [position])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)

      // Focus first item
      setTimeout(() => {
        const firstItem = menuRef.current?.querySelector('button:not(:disabled)') as HTMLElement
        firstItem?.focus()
      }, 50)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, handleKeyDown, handleClickOutside])

  if (!isOpen) return null

  const menuStyle = getMenuStyle()

  return (
    <>
      {/* Backdrop */}
      <Box
        css={{
          position: 'fixed',
          inset: 0,
          zIndex: 999
        }}
      />

      <MenuContainer
        ref={menuRef}
        data-open={isOpen}
        style={menuStyle}
      >
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.divider && <MenuDivider />}
            <MenuItem
              disabled={item.disabled}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                item.onClick()
                onClose()
              }}
            >
              <MenuIcon>
                {item.icon}
              </MenuIcon>
              <MenuLabel>{item.label}</MenuLabel>
              {item.shortcut && (
                <MenuShortcut>{item.shortcut}</MenuShortcut>
              )}
            </MenuItem>
          </React.Fragment>
        ))}
      </MenuContainer>
    </>
  )
}

// Predefined context menu configurations
export const createObjectContextMenu = (
  objectId: string,
  objectType: string,
  isVisible: boolean,
  isLocked: boolean,
  isSelected: boolean,
  callbacks: {
    onCopy: () => void
    onDelete: () => void
    onDuplicate: () => void
    onToggleVisibility: () => void
    onToggleLock: () => void
    onMoveToLayer: () => void
    onBringForward: () => void
    onSendBackward: () => void
    onEdit?: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'copy',
    label: 'Copy',
    icon: <Copy />,
    shortcut: 'Ctrl+C',
    onClick: callbacks.onCopy
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: <Copy />,
    shortcut: 'Ctrl+D',
    onClick: callbacks.onDuplicate
  },
  {
    id: 'edit',
    label: 'Edit Properties',
    icon: <Edit />,
    onClick: callbacks.onEdit || (() => {}),
    disabled: !callbacks.onEdit,
    divider: true
  },
  {
    id: 'visibility',
    label: isVisible ? 'Hide' : 'Show',
    icon: isVisible ? <EyeOff /> : <Eye />,
    onClick: callbacks.onToggleVisibility
  },
  {
    id: 'lock',
    label: isLocked ? 'Unlock' : 'Lock',
    icon: isLocked ? <Unlock /> : <Lock />,
    onClick: callbacks.onToggleLock
  },
  {
    id: 'layer',
    label: 'Move to Layer...',
    icon: <Layers />,
    onClick: callbacks.onMoveToLayer,
    divider: true
  },
  {
    id: 'bring-forward',
    label: 'Bring Forward',
    icon: <ArrowUp />,
    shortcut: 'Ctrl+]',
    onClick: callbacks.onBringForward
  },
  {
    id: 'send-backward',
    label: 'Send Backward',
    icon: <ArrowDown />,
    shortcut: 'Ctrl+[',
    onClick: callbacks.onSendBackward,
    divider: true
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 />,
    shortcut: 'Del',
    onClick: callbacks.onDelete
  }
]

export const createCanvasContextMenu = (
  callbacks: {
    onPaste: () => void
    onSelectAll: () => void
    onClearSelection: () => void
    onResetZoom: () => void
    onToggleGrid: () => void
  }
): ContextMenuItem[] => [
  {
    id: 'paste',
    label: 'Paste',
    icon: <Move />,
    shortcut: 'Ctrl+V',
    onClick: callbacks.onPaste
  },
  {
    id: 'select-all',
    label: 'Select All',
    icon: <MousePointer2 />,
    shortcut: 'Ctrl+A',
    onClick: callbacks.onSelectAll,
    divider: true
  },
  {
    id: 'clear-selection',
    label: 'Clear Selection',
    icon: <MousePointer2 />,
    shortcut: 'Esc',
    onClick: callbacks.onClearSelection
  },
  {
    id: 'reset-zoom',
    label: 'Reset Zoom',
    icon: <ZoomIn />,
    shortcut: 'Ctrl+0',
    onClick: callbacks.onResetZoom,
    divider: true
  },
  {
    id: 'toggle-grid',
    label: 'Toggle Grid',
    icon: <Grid3x3 />,
    shortcut: 'G',
    onClick: callbacks.onToggleGrid
  }
]

export default ContextMenu
import { useEffect, useRef, useCallback, Fragment, type FC, type MouseEvent as ReactMouseEvent } from 'react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'

import type { ContextMenuItem } from './ContextMenuItem'

export interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  items: ContextMenuItem[]
  onClose: () => void
}

export const ContextMenu: FC<ContextMenuProps> = ({
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
      case 'ArrowDown': {
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
      }
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
    if (!isOpen) return

    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose()
    }
  }, [onClose, isOpen])

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
  }, [isOpen, handleKeyDown, handleClickOutside])

  if (!isOpen) return null

  const menuStyle = getMenuStyle()

  return (
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: 'fixed',
          inset: '0',
          zIndex: 999
        }}
      />

      <Box
        ref={menuRef}
        style={{
          position: 'fixed',
          backgroundColor: 'var(--colors-dndBlack)',
          border: '1px solid var(--colors-gray700)',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          minWidth: '200px',
          zIndex: 1000,
          overflow: 'hidden',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-4px)',
          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          ...menuStyle
        }}
      >
        {items.map((item) => (
          <Fragment key={item.id}>
            {item.divider && (
              <Box
                style={{
                  height: '1px',
                  backgroundColor: 'var(--colors-gray700)',
                  margin: '4px 0'
                }}
              />
            )}
            <Button
              variant="ghost"
              disabled={item.disabled}
              onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                e.stopPropagation()
                item.onClick()
                onClose()
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: item.disabled ? 'var(--colors-gray600)' : 'var(--colors-gray200)',
                fontSize: '14px',
                textAlign: 'left',
                cursor: item.disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.1s ease',
                justifyContent: 'flex-start'
              }}
              onMouseEnter={(e: ReactMouseEvent<HTMLButtonElement>) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--colors-gray800)'
                  e.currentTarget.style.color = 'var(--colors-gray100)'
                }
              }}
              onMouseLeave={(e: ReactMouseEvent<HTMLButtonElement>) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--colors-gray200)'
                }
              }}
            >
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  flexShrink: 0
                }}
              >
                {item.icon}
              </Box>
              <Text
                variant="body"
                size="sm"
                style={{
                  flex: 1,
                  margin: 0,
                  fontWeight: 'normal'
                }}
              >
                {item.label}
              </Text>
              {item.shortcut && (
                <Text
                  variant="body"
                  size="xs"
                  style={{
                    margin: 0,
                    color: 'var(--colors-gray500)',
                    fontFamily: 'monospace'
                  }}
                >
                  {item.shortcut}
                </Text>
              )}
            </Button>
          </Fragment>
        ))}
      </Box>
    </>
  )
}

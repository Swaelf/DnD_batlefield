import type { ReactNode, CSSProperties } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { vars } from '@/styles/theme.css'

export type DropdownProps = {
  trigger: ReactNode
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
  style?: CSSProperties
}

export const Dropdown = ({
  trigger,
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  className,
  style,
}: DropdownProps) => {
  const dropdownStyles: CSSProperties = {
    minWidth: '160px',
    padding: '4px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    backgroundColor: vars.colors.surface,
    border: `1px solid ${vars.colors.gray700}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    outline: 'none',
    ...style,
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {trigger}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          style={dropdownStyles}
          className={className}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

Dropdown.displayName = 'Dropdown'

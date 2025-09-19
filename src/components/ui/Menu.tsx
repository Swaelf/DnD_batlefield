import React from 'react'
import { styled } from '@/styles/theme.config'
import { Dropdown, MenuItem, MenuSeparator } from './Popover'
import { Button } from '@/components/primitives'

// Menu Button (trigger)
export const MenuButton = styled(Button, {
  variants: {
    variant: {
      menu: {
        backgroundColor: '$gray800',
        color: '$gray200',
        border: '1px solid $gray700',
        '&:hover': {
          backgroundColor: '$gray700',
          borderColor: '$gray600',
        },
        '&[data-state="open"]': {
          backgroundColor: '$gray700',
          borderColor: '$primary',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'menu',
    size: 'sm',
  },
})

// Menu Content Container
export const MenuContent = styled('div', {
  minWidth: '200px',
  backgroundColor: '$gray900',
  border: '1px solid $gray700',
  borderRadius: '$lg',
  boxShadow: '$xl',
  padding: '$1',
  display: 'flex',
  flexDirection: 'column',
})

// Menu Header (for status info, etc.)
export const MenuHeader = styled('div', {
  padding: '$3 $4',
  borderBottom: '1px solid $gray800',
  marginBottom: '$1',

  variants: {
    size: {
      sm: {
        padding: '$2 $3',
        fontSize: '$xs',
      },
      md: {
        padding: '$3 $4',
        fontSize: '$sm',
      },
    },
  },

  defaultVariants: {
    size: 'md',
  },
})

// Status indicator for auto-save, etc.
export const MenuStatus = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: '$xs',
  color: '$gray400',

  '& .status-indicator': {
    display: 'flex',
    alignItems: 'center',
    gap: '$1',
  },

  '& .status-saving': {
    color: '$warning',
  },

  '& .status-saved': {
    color: '$success',
  },
})

// Menu Group (for organizing related items)
export const MenuGroup = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  '& + &': {
    marginTop: '$1',
    paddingTop: '$1',
    borderTop: '1px solid $gray800',
  },
})

// Re-export menu items from Popover
export { MenuItem, MenuSeparator }

// Main Menu component wrapper
type MenuProps = {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const Menu: React.FC<MenuProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
}) => {
  return (
    <Dropdown
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      align="start"
    >
      <MenuContent>
        {children}
      </MenuContent>
    </Dropdown>
  )
}

export type MenuProps_Export = MenuProps
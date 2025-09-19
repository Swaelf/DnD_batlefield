import React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { styled, keyframes } from '@/styles/theme.config'
import { X } from 'lucide-react'
import { Button } from '@/components/primitives'

// Animations
const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const PopoverContent = styled(PopoverPrimitive.Content, {
  borderRadius: '$lg',
  backgroundColor: '$surface',
  border: '1px solid $gray700',
  boxShadow: '$lg',
  animationDuration: '200ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  zIndex: '$popover',

  '&[data-state="open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },

  '&:focus': {
    outline: 'none',
  },

  variants: {
    size: {
      sm: {
        width: '200px',
        padding: '$3',
      },
      md: {
        width: '300px',
        padding: '$4',
      },
      lg: {
        width: '400px',
        padding: '$5',
      },
      auto: {
        width: 'auto',
        minWidth: '200px',
        padding: '$4',
      },
    },

    elevation: {
      sm: { boxShadow: '$sm' },
      md: { boxShadow: '$lg' },
      lg: { boxShadow: '$xl' },
    },
  },

  defaultVariants: {
    size: 'md',
    elevation: 'md',
  },
})

const PopoverArrow = styled(PopoverPrimitive.Arrow, {
  fill: '$surface',
  stroke: '$gray700',
  strokeWidth: 1,
})

const PopoverHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '$4',
  paddingBottom: '$3',
  borderBottom: '1px solid $gray700',
})

const PopoverTitle = styled('h3', {
  margin: 0,
  fontSize: '$lg',
  fontWeight: '$semibold',
  color: '$gray100',
  fontFamily: '$dnd',
})

const PopoverCloseButton = styled(Button, {
  variants: {
    size: { close: { width: '24px', height: '24px', padding: 0 } },
    variant: {
      close: {
        backgroundColor: 'transparent',
        color: '$gray400',
        border: 'none',
        '&:hover': {
          backgroundColor: '$gray800',
          color: '$gray200',
        },
      },
    },
  },
  defaultVariants: {
    size: 'close',
    variant: 'close',
  },
})

const PopoverBody = styled('div', {
  color: '$gray200',
  fontSize: '$base',
  lineHeight: '$normal',

  variants: {
    scrollable: {
      true: {
        maxHeight: '300px',
        overflowY: 'auto',
      },
    },
  },
})

const PopoverFooter = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '$3',
  marginTop: '$4',
  paddingTop: '$3',
  borderTop: '1px solid $gray700',
})

// Main Popover component
type PopoverProps = {
  children: React.ReactNode
  content: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  size?: 'sm' | 'md' | 'lg' | 'auto'
  elevation?: 'sm' | 'md' | 'lg'
  hideArrow?: boolean
  modal?: boolean
  title?: string
  showCloseButton?: boolean
  onClose?: () => void
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  size = 'md',
  elevation = 'md',
  hideArrow = false,
  modal = false,
  title,
  showCloseButton = false,
  onClose,
}) => {
  const handleClose = () => {
    if (onClose) {
      onClose()
    }
    if (onOpenChange) {
      onOpenChange(false)
    }
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      modal={modal}
    >
      <PopoverPrimitive.Trigger asChild>
        {children}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          size={size}
          elevation={elevation}
        >
          {(title || showCloseButton) && (
            <PopoverHeader>
              {title && <PopoverTitle>{title}</PopoverTitle>}
              {showCloseButton && (
                <PopoverPrimitive.Close asChild>
                  <PopoverCloseButton onClick={handleClose}>
                    <X size={14} />
                  </PopoverCloseButton>
                </PopoverPrimitive.Close>
              )}
            </PopoverHeader>
          )}

          <PopoverBody>
            {content}
          </PopoverBody>

          {!hideArrow && <PopoverArrow />}
        </PopoverContent>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

// Dropdown variant (menu-style popover)
type DropdownProps = {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: PopoverProps['side']
  align?: PopoverProps['align']
  sideOffset?: number
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
}) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {trigger}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          size="auto"
          css={{
            minWidth: '160px',
            padding: '$1',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </PopoverContent>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

// Dropdown menu item
const DropdownMenuItem = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '$2',
  padding: '$2 $3',
  fontSize: '$sm',
  color: '$gray200',
  borderRadius: '$sm',
  cursor: 'pointer',
  transition: '$fast',
  userSelect: 'none',
  width: '100%',

  '&:hover': {
    backgroundColor: '$gray700',
    color: '$gray100',
  },

  '&[data-disabled="true"]': {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },

  variants: {
    variant: {
      default: {},
      destructive: {
        color: '$error',
        '&:hover': {
          backgroundColor: '$error',
          color: '$white',
        },
      },
    },
  },

  defaultVariants: {
    variant: 'default',
  },
})

const DropdownMenuSeparator = styled('div', {
  height: '1px',
  backgroundColor: '$gray700',
  margin: '$1 0',
})

type DropdownMenuItemProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive'
}

export const MenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'default',
}) => {
  return (
    <DropdownMenuItem
      variant={variant}
      data-disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </DropdownMenuItem>
  )
}

// Hook for programmatic popover control
export const usePopover = (initialOpen = false) => {
  const [open, setOpen] = React.useState(initialOpen)

  const show = React.useCallback(() => setOpen(true), [])
  const hide = React.useCallback(() => setOpen(false), [])
  const toggle = React.useCallback(() => setOpen(prev => !prev), [])

  return {
    open,
    setOpen,
    show,
    hide,
    toggle,
  }
}

// Export individual components for composition
export {
  PopoverHeader,
  PopoverTitle,
  PopoverBody,
  PopoverFooter,
  DropdownMenuSeparator as MenuSeparator,
}

export type PopoverProps_Export = PopoverProps
export type DropdownProps_Export = DropdownProps
export type DropdownMenuItemProps_Export = DropdownMenuItemProps
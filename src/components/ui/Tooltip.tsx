import React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { styled, keyframes } from '@/styles/theme.config'

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

const TooltipContent = styled(TooltipPrimitive.Content, {
  borderRadius: '$md',
  paddingX: '$3',
  paddingY: '$2',
  fontSize: '$sm',
  lineHeight: '$tight',
  color: '$gray100',
  backgroundColor: '$gray900',
  border: '1px solid $gray700',
  boxShadow: '$tooltip',
  userSelect: 'none',
  animationDuration: '200ms',
  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
  willChange: 'transform, opacity',
  zIndex: '$tooltip',
  maxWidth: '300px',

  '&[data-state="delayed-open"]': {
    '&[data-side="top"]': { animationName: slideDownAndFade },
    '&[data-side="right"]': { animationName: slideLeftAndFade },
    '&[data-side="bottom"]': { animationName: slideUpAndFade },
    '&[data-side="left"]': { animationName: slideRightAndFade },
  },

  variants: {
    variant: {
      default: {
        backgroundColor: '$gray900',
        borderColor: '$gray700',
        color: '$gray100',
      },
      dark: {
        backgroundColor: '$black',
        borderColor: '$gray800',
        color: '$white',
      },
      error: {
        backgroundColor: '$error',
        borderColor: '$error',
        color: '$white',
      },
      success: {
        backgroundColor: '$success',
        borderColor: '$success',
        color: '$white',
      },
      warning: {
        backgroundColor: '$warning',
        borderColor: '$warning',
        color: '$black',
      },
      info: {
        backgroundColor: '$info',
        borderColor: '$info',
        color: '$white',
      },
    },

    size: {
      sm: {
        paddingX: '$2',
        paddingY: '$1',
        fontSize: '$xs',
        maxWidth: '200px',
      },
      md: {
        paddingX: '$3',
        paddingY: '$2',
        fontSize: '$sm',
        maxWidth: '300px',
      },
      lg: {
        paddingX: '$4',
        paddingY: '$3',
        fontSize: '$base',
        maxWidth: '400px',
      },
    },
  },

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

const TooltipArrow = styled(TooltipPrimitive.Arrow, {
  fill: '$gray900',

  variants: {
    variant: {
      default: { fill: '$gray900' },
      dark: { fill: '$black' },
      error: { fill: '$error' },
      success: { fill: '$success' },
      warning: { fill: '$warning' },
      info: { fill: '$info' },
    },
  },

  defaultVariants: {
    variant: 'default',
  },
})

// Main Tooltip component
type TooltipProps = {
  children: React.ReactNode
  content: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delayDuration?: number
  skipDelayDuration?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  align?: 'start' | 'center' | 'end'
  alignOffset?: number
  variant?: 'default' | 'dark' | 'error' | 'success' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  hideArrow?: boolean
  disabled?: boolean
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration = 400,
  skipDelayDuration = 300,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  variant = 'default',
  size = 'md',
  hideArrow = false,
  disabled = false,
}) => {
  if (disabled) {
    return <>{children}</>
  }

  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>

      <TooltipPrimitive.Portal>
        <TooltipContent
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          variant={variant}
          size={size}
        >
          {content}
          {!hideArrow && <TooltipArrow variant={variant} />}
        </TooltipContent>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

// TooltipProvider wrapper for the app
export const TooltipProvider = TooltipPrimitive.Provider

// Simple tooltip for common use cases
type SimpleTooltipProps = {
  text: string
  children: React.ReactNode
  variant?: TooltipProps['variant']
  side?: TooltipProps['side']
  disabled?: boolean
}

export const SimpleTooltip: React.FC<SimpleTooltipProps> = ({
  text,
  children,
  variant = 'default',
  side = 'top',
  disabled = false,
}) => {
  if (!text || disabled) {
    return <>{children}</>
  }

  return (
    <Tooltip content={text} variant={variant} side={side}>
      {children}
    </Tooltip>
  )
}

// Hook for programmatic tooltip control
export const useTooltip = (initialOpen = false) => {
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

export type TooltipProps_Export = TooltipProps
export type SimpleTooltipProps_Export = SimpleTooltipProps
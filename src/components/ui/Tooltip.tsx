import { useState, forwardRef, type FC, type ReactNode, type ReactElement, type CSSProperties } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

// TODO: Convert to Vanilla Extract CSS
// Temporarily using inline styles to fix build errors

// Tooltip Component Types
export interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  sideOffset?: number
  alignOffset?: number
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  asChild?: boolean
}

export interface SimpleTooltipProps {
  children: ReactElement
  content: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

// Temporary styled components using inline styles
interface TooltipContentProps extends TooltipPrimitive.TooltipContentProps {
  style?: CSSProperties
  children?: ReactNode
}

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>((props, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    style={{
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '13px',
      lineHeight: '1',
      color: 'var(--colors-text)',
      backgroundColor: 'var(--colors-surfaceHover)',
      boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
      userSelect: 'none',
      animationDuration: '400ms',
      animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'transform, opacity',
      zIndex: 100,
      ...props.style
    }}
    sideOffset={5}
    {...props}
  />
))
TooltipContent.displayName = 'TooltipContent'

interface TooltipArrowProps extends TooltipPrimitive.TooltipArrowProps {
  style?: CSSProperties
}

const TooltipArrow = forwardRef<SVGSVGElement, TooltipArrowProps>((props, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    width={11}
    height={5}
    style={{
      fill: 'var(--colors-surfaceHover)',
      ...props.style
    }}
    {...props}
  />
))
TooltipArrow.displayName = 'TooltipArrow'

// Main Tooltip component with full control
export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 700,
  sideOffset = 5,
  alignOffset = 0,
  open,
  defaultOpen,
  onOpenChange,
  asChild = false,
}) => {
  return (
    <TooltipPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
    >
      <TooltipPrimitive.Trigger asChild={asChild}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
        >
          {content}
          <TooltipArrow />
        </TooltipContent>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

// Provider for Tooltip context (required by Radix)
export const TooltipProvider = TooltipPrimitive.Provider

// Simple tooltip for basic use cases
export const SimpleTooltip: FC<SimpleTooltipProps> = ({
  children,
  content,
  side = 'top',
  align = 'center',
}) => {
  return (
    <Tooltip content={content} side={side} align={align} asChild>
      {children}
    </Tooltip>
  )
}

// Hook for controlled tooltips
export const useTooltip = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const openTooltip = () => setIsOpen(true)
  const closeTooltip = () => setIsOpen(false)
  const toggleTooltip = () => setIsOpen(!isOpen)

  return {
    isOpen,
    openTooltip,
    closeTooltip,
    toggleTooltip,
    tooltipProps: {
      open: isOpen,
      onOpenChange: setIsOpen,
    },
  }
}

// Export types
export type TooltipProps_Export = TooltipProps
export type SimpleTooltipProps_Export = SimpleTooltipProps
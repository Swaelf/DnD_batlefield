import { forwardRef, type FC, type ReactNode, type CSSProperties } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

// TODO: Convert to Vanilla Extract CSS
// Temporarily using inline styles to fix build errors

// Tooltip Component Types
export type TooltipProps = {
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

// Temporary styled components using inline styles
type TooltipContentProps = TooltipPrimitive.TooltipContentProps & {
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

type TooltipArrowProps = TooltipPrimitive.TooltipArrowProps & {
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

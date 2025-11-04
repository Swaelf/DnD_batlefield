import type { ReactNode, CSSProperties } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { vars } from '@/styles/theme.css'
import { PopoverHeader } from './PopoverHeader'
import { PopoverTitle } from './PopoverTitle'
import { PopoverBody } from './PopoverBody'
import { PopoverCloseButton } from './PopoverCloseButton'

// Popover event handlers
type PopoverEventHandlers = {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

// Popover component props with exact typing
export type PopoverProps = {
  children: ReactNode
  content: ReactNode
  open?: boolean
  defaultOpen?: boolean
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
  className?: string
  style?: CSSProperties

  // HTML attributes
  id?: string
  role?: string

  // ARIA attributes
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string

  // Data attributes
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
} & PopoverEventHandlers

export const Popover = ({
  children,
  content,
  open,
  defaultOpen = false,
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
  className,
  style,
  id,
  role,
  onClose,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'aria-describedby': ariaDescribedby,
  'data-testid': dataTestId,
  'data-test-id': dataTestId2,
  'data-state': dataState,
}: PopoverProps) => {
  const handleClose = () => {
    onClose?.()
    onOpenChange?.(false)
  }

  // Size styles
  const sizeStyles = {
    sm: {
      width: '200px',
      padding: '12px',
    },
    md: {
      width: '300px',
      padding: '16px',
    },
    lg: {
      width: '400px',
      padding: '20px',
    },
    auto: {
      width: 'auto',
      minWidth: '200px',
      padding: '16px',
    },
  }

  // Elevation styles
  const elevationStyles = {
    sm: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' },
    md: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
    lg: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' },
  }

  // Content styles
  const contentStyles: CSSProperties = {
    borderRadius: '12px',
    backgroundColor: vars.colors.surface,
    border: `1px solid ${vars.colors.gray700}`,
    animationDuration: '200ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
    zIndex: 1000,
    outline: 'none',
    ...sizeStyles[size],
    ...elevationStyles[elevation],
    ...style,
  }

  // Arrow styles
  const arrowStyles: CSSProperties = {
    fill: vars.colors.surface,
    stroke: vars.colors.gray700,
    strokeWidth: 1,
  }

  return (
    <>
      {/* Add CSS animations */}
      <style>{`
        @keyframes slideUpAndFade {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRightAndFade {
          from { opacity: 0; transform: translateX(-2px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDownAndFade {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeftAndFade {
          from { opacity: 0; transform: translateX(2px); }
          to { opacity: 1; transform: translateX(0); }
        }
        [data-radix-popper-content-wrapper][data-state="open"][data-side="top"] {
          animation: slideDownAndFade 200ms ease-out;
        }
        [data-radix-popper-content-wrapper][data-state="open"][data-side="right"] {
          animation: slideLeftAndFade 200ms ease-out;
        }
        [data-radix-popper-content-wrapper][data-state="open"][data-side="bottom"] {
          animation: slideUpAndFade 200ms ease-out;
        }
        [data-radix-popper-content-wrapper][data-state="open"][data-side="left"] {
          animation: slideRightAndFade 200ms ease-out;
        }
      `}</style>

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
          <PopoverPrimitive.Content
            side={side}
            sideOffset={sideOffset}
            align={align}
            alignOffset={alignOffset}
            style={contentStyles}
            className={className}
            id={id}
            role={role}
            aria-label={ariaLabel || title}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            data-testid={dataTestId}
            data-test-id={dataTestId2}
            data-state={dataState || (open ? 'open' : 'closed')}
            data-size={size}
            data-elevation={elevation}
          >
            {(title || showCloseButton) && (
              <PopoverHeader>
                {title && <PopoverTitle>{title}</PopoverTitle>}
                {showCloseButton && (
                  <PopoverPrimitive.Close asChild>
                    <PopoverCloseButton onClick={handleClose} aria-label="Close popover" />
                  </PopoverPrimitive.Close>
                )}
              </PopoverHeader>
            )}

            <PopoverBody>
              {content}
            </PopoverBody>

            {!hideArrow && (
              <PopoverPrimitive.Arrow style={arrowStyles} />
            )}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </>
  )
}

Popover.displayName = 'Popover'

import React, { useState, useCallback, forwardRef } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { X } from 'lucide-react'

// Popover event handlers
type PopoverEventHandlers = {
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
}

// Popover component props with exact typing
export type PopoverProps = {
  children: React.ReactNode
  content: React.ReactNode
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
  style?: React.CSSProperties

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
  const contentStyles: React.CSSProperties = {
    borderRadius: '12px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--gray700)',
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
  const arrowStyles: React.CSSProperties = {
    fill: 'var(--surface)',
    stroke: 'var(--gray700)',
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

// Popover Header component
export type PopoverHeaderProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const PopoverHeader = forwardRef<HTMLDivElement, PopoverHeaderProps>(
  ({ children, className, style }, ref) => {
    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid var(--gray700)',
      ...style,
    }

    return (
      <div ref={ref} style={headerStyles} className={className}>
        {children}
      </div>
    )
  }
)

PopoverHeader.displayName = 'PopoverHeader'

// Popover Title component
export type PopoverTitleProps = {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  style?: React.CSSProperties
  id?: string
}

export const PopoverTitle = forwardRef<HTMLHeadingElement, PopoverTitleProps>(
  ({ children, as: Component = 'h3', className, style, id }, ref) => {
    const titleStyles: React.CSSProperties = {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--gray100)',
      fontFamily: 'system-ui, sans-serif',
      lineHeight: 1.2,
      ...style,
    }

    return React.createElement(
      Component,
      {
        ref,
        style: titleStyles,
        className,
        id,
      },
      children
    )
  }
)

PopoverTitle.displayName = 'PopoverTitle'

// Popover Body component
export type PopoverBodyProps = {
  children: React.ReactNode
  scrollable?: boolean
  className?: string
  style?: React.CSSProperties
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void
}

export const PopoverBody = forwardRef<HTMLDivElement, PopoverBodyProps>(
  ({ children, scrollable = false, className, style, onScroll }, ref) => {
    const bodyStyles: React.CSSProperties = {
      color: 'var(--gray200)',
      fontSize: '14px',
      lineHeight: 1.5,
      ...(scrollable && {
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }),
      ...style,
    }

    return (
      <div
        ref={ref}
        style={bodyStyles}
        className={className}
        onScroll={onScroll}
        data-scrollable={scrollable}
      >
        {children}
      </div>
    )
  }
)

PopoverBody.displayName = 'PopoverBody'

// Popover Footer component
export type PopoverFooterProps = {
  children: React.ReactNode
  justify?: 'start' | 'center' | 'end' | 'between'
  className?: string
  style?: React.CSSProperties
}

export const PopoverFooter = forwardRef<HTMLDivElement, PopoverFooterProps>(
  ({ children, justify = 'end', className, style }, ref) => {
    const justifyContentValues = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    }

    const footerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: justifyContentValues[justify],
      gap: '12px',
      marginTop: '16px',
      paddingTop: '12px',
      borderTop: '1px solid var(--gray700)',
      ...style,
    }

    return (
      <div ref={ref} style={footerStyles} className={className} data-justify={justify}>
        {children}
      </div>
    )
  }
)

PopoverFooter.displayName = 'PopoverFooter'

// Popover Close Button component
export type PopoverCloseButtonProps = {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

export const PopoverCloseButton = forwardRef<HTMLButtonElement, PopoverCloseButtonProps>(
  ({ onClick, className, style, 'aria-label': ariaLabel = 'Close' }, ref) => {
    const buttonStyles: React.CSSProperties = {
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      color: 'var(--gray400)',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      ...style,
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        style={buttonStyles}
        className={className}
        aria-label={ariaLabel}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray800)'
          e.currentTarget.style.color = 'var(--gray200)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--gray400)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray700)'
          e.currentTarget.style.color = 'var(--gray100)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
          e.currentTarget.style.color = 'var(--gray400)'
        }}
      >
        <X size={14} />
      </button>
    )
  }
)

PopoverCloseButton.displayName = 'PopoverCloseButton'

// Dropdown variant (menu-style popover)
export type DropdownProps = {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  className?: string
  style?: React.CSSProperties
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
  const dropdownStyles: React.CSSProperties = {
    minWidth: '160px',
    padding: '4px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '12px',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--gray700)',
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

// Menu Item component
export type MenuItemProps = {
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  disabled?: boolean
  variant?: 'default' | 'destructive'
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    {
      children,
      onClick,
      disabled = false,
      variant = 'default',
      className,
      style,
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const variantStyles = {
      default: {
        color: 'var(--gray200)',
        hoverBackgroundColor: 'var(--gray700)',
        hoverColor: 'var(--gray100)',
      },
      destructive: {
        color: 'var(--error)',
        hoverBackgroundColor: 'var(--error)',
        hoverColor: 'white',
      },
    }

    const itemStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      fontSize: '14px',
      borderRadius: '6px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      width: '100%',
      opacity: disabled ? 0.5 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      color: variantStyles[variant].color,
      ...style,
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        onClick?.(event)
      }
    }

    return (
      <div
        ref={ref}
        style={itemStyles}
        className={className}
        onClick={handleClick}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        data-disabled={disabled}
        data-variant={variant}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = variantStyles[variant].hoverBackgroundColor
            e.currentTarget.style.color = variantStyles[variant].hoverColor
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = variantStyles[variant].color
          }
        }}
      >
        {children}
      </div>
    )
  }
)

MenuItem.displayName = 'MenuItem'

// Menu Separator component
export type MenuSeparatorProps = {
  className?: string
  style?: React.CSSProperties
}

export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(
  ({ className, style }, ref) => {
    const separatorStyles: React.CSSProperties = {
      height: '1px',
      backgroundColor: 'var(--gray700)',
      margin: '4px 0',
      ...style,
    }

    return (
      <div
        ref={ref}
        style={separatorStyles}
        className={className}
        role="separator"
        aria-orientation="horizontal"
      />
    )
  }
)

MenuSeparator.displayName = 'MenuSeparator'

// Hook for programmatic popover control
export const usePopover = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen)

  const show = useCallback(() => setOpen(true), [])
  const hide = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen(prev => !prev), [])

  return {
    open,
    setOpen,
    show,
    hide,
    toggle,
  }
}
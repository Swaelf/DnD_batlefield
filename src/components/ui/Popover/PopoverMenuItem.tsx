import { forwardRef, type ReactNode, type MouseEvent, type CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type PopoverMenuItemProps = {
  children: ReactNode
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
  disabled?: boolean
  variant?: 'default' | 'destructive'
  className?: string
  style?: CSSProperties
  'aria-label'?: string
}

export const PopoverMenuItem = forwardRef<HTMLDivElement, PopoverMenuItemProps>(
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
        color: vars.colors.gray200,
        hoverBackgroundColor: vars.colors.gray700,
        hoverColor: vars.colors.gray100,
      },
      destructive: {
        color: vars.colors.error,
        hoverBackgroundColor: vars.colors.error,
        hoverColor: 'white',
      },
    }

    const itemStyles: CSSProperties = {
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

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
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

PopoverMenuItem.displayName = 'PopoverMenuItem'

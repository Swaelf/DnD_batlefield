import { forwardRef, type ReactNode, type CSSProperties, type MouseEvent } from 'react'

// Badge component props with exact typing
export type BadgeProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties

  // Event handlers
  onClick?: (event: MouseEvent<HTMLSpanElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLSpanElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLSpanElement>) => void

  // HTML attributes
  id?: string
  title?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'ghost',
      size = 'md',
      className,
      style,
      onClick,
      onMouseEnter,
      onMouseLeave,
      id,
      title,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedby,
      'data-testid': dataTestId,
      'data-test-id': dataTestId2,
      'data-state': dataState,
    },
    ref
  ) => {
    // Base styles
    const baseStyles: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      fontSize: '10px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      whiteSpace: 'nowrap',
      border: 'none',
      cursor: onClick ? 'pointer' : 'default',
    }

    // Size styles
    const sizeStyles = {
      sm: {
        height: '18px',
        paddingLeft: '8px',
        paddingRight: '8px',
        fontSize: '10px',
      },
      md: {
        height: '22px',
        paddingLeft: '12px',
        paddingRight: '12px',
        fontSize: '10px',
      },
      lg: {
        height: '26px',
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '12px',
      },
    }

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: 'var(--primary)',
        color: 'white',
      },
      secondary: {
        backgroundColor: 'var(--secondary)',
        color: 'var(--dndBlack)',
      },
      success: {
        backgroundColor: 'var(--success)',
        color: 'white',
      },
      warning: {
        backgroundColor: 'var(--warning)',
        color: 'var(--dndBlack)',
      },
      error: {
        backgroundColor: 'var(--error)',
        color: 'white',
      },
      info: {
        backgroundColor: 'var(--info)',
        color: 'white',
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--gray300)',
        border: '1px solid var(--gray600)',
      },
      ghost: {
        backgroundColor: 'var(--gray800)',
        color: 'var(--gray300)',
      },
    }

    const combinedStyles: CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    }

    return (
      <span
        ref={ref}
        style={combinedStyles}
        className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        id={id}
        title={title}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-state={dataState || variant}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

import { forwardRef, type ReactNode, type CSSProperties, type MouseEvent, type FocusEvent, type KeyboardEvent, type UIEvent } from 'react'

// Panel event handlers
type PanelEventHandlers = {
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
  onMouseEnter?: (event: MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (event: MouseEvent<HTMLDivElement>) => void
  onFocus?: (event: FocusEvent<HTMLDivElement>) => void
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
  onScroll?: (event: UIEvent<HTMLDivElement>) => void
}

// Panel component props with exact typing
export type PanelProps = {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'full' | 'sidebar'
  className?: string
  style?: CSSProperties

  // HTML attributes
  id?: string
  role?: string
  tabIndex?: number

  // ARIA attributes
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean

  // Data attributes
  'data-testid'?: string
  'data-test-id'?: string
  'data-state'?: string
} & PanelEventHandlers

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      children,
      padding = 'md',
      elevation = 'md',
      variant = 'default',
      size,
      className,
      style,
      id,
      role,
      tabIndex,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      onScroll,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledby,
      'aria-describedby': ariaDescribedby,
      'aria-expanded': ariaExpanded,
      'aria-hidden': ariaHidden,
      'data-testid': dataTestId,
      'data-test-id': dataTestId2,
      'data-state': dataState,
    },
    ref
  ) => {
    // Padding styles
    const paddingStyles = {
      none: { padding: '0' },
      sm: { padding: '12px' },
      md: { padding: '16px' },
      lg: { padding: '24px' },
    }

    // Elevation styles
    const elevationStyles = {
      none: { boxShadow: 'none' },
      sm: { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' },
      md: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' },
      lg: { boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' },
      xl: { boxShadow: '0 16px 48px rgba(0, 0, 0, 0.25)' },
    }

    // Variant styles
    const variantStyles = {
      default: {
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--gray700)',
        border: '1px solid var(--gray700)',
      },
      elevated: {
        backgroundColor: 'var(--gray800)',
        borderColor: 'var(--gray600)',
        border: '1px solid var(--gray600)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
      outlined: {
        backgroundColor: 'transparent',
        borderColor: 'var(--gray600)',
        border: '1px solid var(--gray600)',
        boxShadow: 'none',
      },
      ghost: {
        backgroundColor: 'transparent',
        border: 'none',
        boxShadow: 'none',
      },
    }

    // Size styles
    const sizeStyles = {
      sm: {
        minWidth: '200px',
        minHeight: '150px',
      },
      md: {
        minWidth: '320px',
        minHeight: '200px',
      },
      lg: {
        minWidth: '400px',
        minHeight: '300px',
      },
      full: {
        width: '100%',
        height: '100%',
      },
      sidebar: {
        width: '320px',
        height: '100%',
      },
    }

    // Base styles
    const baseStyles: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      outline: 'none',
    }

    const combinedStyles: CSSProperties = {
      ...baseStyles,
      ...paddingStyles[padding],
      ...elevationStyles[elevation],
      ...variantStyles[variant],
      ...(size && sizeStyles[size]),
      ...style,
    }

    return (
      <div
        ref={ref}
        style={combinedStyles}
        className={className}
        id={id}
        role={role}
        tabIndex={tabIndex}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        onScroll={onScroll}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-expanded={ariaExpanded}
        aria-hidden={ariaHidden}
        data-testid={dataTestId}
        data-test-id={dataTestId2}
        data-state={dataState}
        data-variant={variant}
        data-size={size}
        data-padding={padding}
        data-elevation={elevation}
      >
        {children}
      </div>
    )
  }
)

Panel.displayName = 'Panel'

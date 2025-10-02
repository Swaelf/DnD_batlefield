import { forwardRef, createElement, useState, type ReactNode, type CSSProperties, type MouseEvent, type FocusEvent, type KeyboardEvent, type UIEvent } from 'react'

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

// Panel Header component
export type PanelHeaderProps = {
  children: ReactNode
  sticky?: boolean
  className?: string
  style?: CSSProperties
  'data-testid'?: string
}

export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ children, sticky = false, className, style, 'data-testid': dataTestId }, ref) => {
    const headerStyles: CSSProperties = {
      display: 'block',
      borderBottom: '1px solid var(--gray700)',
      marginBottom: '16px',
      paddingBottom: '12px',
      marginLeft: '-16px',
      marginRight: '-16px',
      paddingLeft: '16px',
      paddingRight: '16px',
      ...(sticky && {
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--surface)',
        zIndex: 10,
      }),
      ...style,
    }

    return (
      <div
        ref={ref}
        style={headerStyles}
        className={className}
        data-testid={dataTestId}
        data-sticky={sticky}
      >
        {children}
      </div>
    )
  }
)

PanelHeader.displayName = 'PanelHeader'

// Panel Title component
export type PanelTitleProps = {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
  style?: CSSProperties
  id?: string
}

export const PanelTitle = forwardRef<HTMLHeadingElement, PanelTitleProps>(
  ({ children, as: Component = 'h2', className, style, id }, ref) => {
    const titleStyles: CSSProperties = {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--gray100)',
      fontFamily: 'system-ui, sans-serif',
      lineHeight: 1.2,
      ...style,
    }

    return createElement(
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

PanelTitle.displayName = 'PanelTitle'

// Panel Body component
export type PanelBodyProps = {
  children: ReactNode
  scrollable?: boolean
  padding?: 'none' | 'sm' | 'md'
  className?: string
  style?: CSSProperties
  onScroll?: (event: UIEvent<HTMLDivElement>) => void
}

export const PanelBody = forwardRef<HTMLDivElement, PanelBodyProps>(
  (
    {
      children,
      scrollable = true,
      padding = 'none',
      className,
      style,
      onScroll,
    },
    ref
  ) => {
    const paddingStyles = {
      none: { padding: 0 },
      sm: { padding: '8px' },
      md: { padding: '16px' },
    }

    const bodyStyles: CSSProperties = {
      display: 'block',
      flex: 1,
      ...(scrollable && {
        overflowY: 'auto',
        overflowX: 'hidden',
      }),
      ...paddingStyles[padding],
      ...style,
    }

    return (
      <div
        ref={ref}
        style={bodyStyles}
        className={className}
        onScroll={onScroll}
        data-scrollable={scrollable}
        data-padding={padding}
      >
        {children}
      </div>
    )
  }
)

PanelBody.displayName = 'PanelBody'

// Panel Footer component
export type PanelFooterProps = {
  children: ReactNode
  justify?: 'start' | 'center' | 'end' | 'between'
  className?: string
  style?: CSSProperties
}

export const PanelFooter = forwardRef<HTMLDivElement, PanelFooterProps>(
  ({ children, justify = 'end', className, style }, ref) => {
    const justifyContentValues = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    }

    const footerStyles: CSSProperties = {
      borderTop: '1px solid var(--gray700)',
      marginTop: '16px',
      paddingTop: '12px',
      marginLeft: '-16px',
      marginRight: '-16px',
      paddingLeft: '16px',
      paddingRight: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      justifyContent: justifyContentValues[justify],
      ...style,
    }

    return (
      <div
        ref={ref}
        style={footerStyles}
        className={className}
        data-justify={justify}
      >
        {children}
      </div>
    )
  }
)

PanelFooter.displayName = 'PanelFooter'

// Panel Section component
export type PanelSectionProps = {
  children: ReactNode
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  divider?: boolean
  className?: string
  style?: CSSProperties
}

export const PanelSection = forwardRef<HTMLDivElement, PanelSectionProps>(
  ({ children, spacing = 'md', divider = false, className, style }, ref) => {
    const spacingStyles = {
      none: { marginBottom: 0 },
      sm: { marginBottom: '12px' },
      md: { marginBottom: '24px' },
      lg: { marginBottom: '32px' },
    }

    const sectionStyles: CSSProperties = {
      display: 'block',
      ...spacingStyles[spacing],
      ...(divider && {
        paddingBottom: '16px',
        borderBottom: '1px solid var(--gray800)',
        marginBottom: '16px',
      }),
      ...style,
    }

    return (
      <div
        ref={ref}
        style={sectionStyles}
        className={className}
        data-spacing={spacing}
        data-divider={divider}
      >
        {children}
      </div>
    )
  }
)

PanelSection.displayName = 'PanelSection'

// Panel Group component
export type PanelGroupProps = {
  children: ReactNode
  direction?: 'row' | 'column'
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties
}

export const PanelGroup = forwardRef<HTMLDivElement, PanelGroupProps>(
  ({ children, direction = 'column', spacing = 'md', className, style }, ref) => {
    const spacingValues = {
      sm: '8px',
      md: '16px',
      lg: '24px',
    }

    const groupStyles: CSSProperties = {
      display: 'flex',
      flexDirection: direction,
      gap: spacingValues[spacing],
      ...style,
    }

    return (
      <div
        ref={ref}
        style={groupStyles}
        className={className}
        data-direction={direction}
        data-spacing={spacing}
      >
        {children}
      </div>
    )
  }
)

PanelGroup.displayName = 'PanelGroup'

// Card component (simplified Panel variant)
export type CardProps = Omit<PanelProps, 'padding' | 'elevation'> & {
  interactive?: boolean
  selected?: boolean
  padding?: 'sm' | 'md' | 'lg'
  elevation?: 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      interactive = false,
      selected = false,
      padding = 'sm',
      elevation = 'sm',
      variant = 'default',
      style,
      onMouseEnter,
      onMouseLeave,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      if (interactive) setIsHovered(true)
      onMouseEnter?.(event)
    }

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      if (interactive) setIsHovered(false)
      onMouseLeave?.(event)
    }

    const interactiveStyles: CSSProperties = interactive
      ? {
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          ...(isHovered && {
            backgroundColor: 'var(--gray750)',
            borderColor: 'var(--gray600)',
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          }),
          ...(selected && {
            borderColor: 'var(--primary)',
            backgroundColor: 'rgba(139, 69, 19, 0.05)',
            boxShadow: '0 0 0 1px var(--primary)',
          }),
        }
      : {}

    const cardStyles: CSSProperties = {
      ...interactiveStyles,
      ...style,
    }

    return (
      <Panel
        ref={ref}
        padding={padding}
        elevation={elevation}
        variant={variant}
        style={cardStyles}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        data-interactive={interactive}
        data-selected={selected}
        {...props}
      >
        {children}
      </Panel>
    )
  }
)

Card.displayName = 'Card'
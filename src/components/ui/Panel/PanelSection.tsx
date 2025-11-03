import { forwardRef, type ReactNode, type CSSProperties } from 'react'

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

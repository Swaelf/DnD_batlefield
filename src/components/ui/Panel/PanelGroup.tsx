import { forwardRef, type ReactNode, type CSSProperties } from 'react'

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

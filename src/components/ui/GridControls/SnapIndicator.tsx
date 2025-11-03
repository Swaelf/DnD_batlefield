import { forwardRef, type ReactNode, type CSSProperties } from 'react'

export type SnapIndicatorProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const SnapIndicator = forwardRef<HTMLDivElement, SnapIndicatorProps>(
  ({ children, className, style }, ref) => {
    const indicatorStyles: CSSProperties = {
      marginLeft: '8px',
      paddingLeft: '8px',
      paddingRight: '8px',
      paddingTop: '4px',
      paddingBottom: '4px',
      borderRadius: '6px',
      backgroundColor: 'var(--gray800)',
      border: '1px solid var(--gray700)',
      ...style,
    }

    return (
      <div ref={ref} style={indicatorStyles} className={className}>
        {children}
      </div>
    )
  }
)

SnapIndicator.displayName = 'SnapIndicator'

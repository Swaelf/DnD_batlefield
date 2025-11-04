import { forwardRef, type ReactNode, type CSSProperties, type UIEvent } from 'react'

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

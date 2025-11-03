import { forwardRef, type ReactNode, type CSSProperties } from 'react'

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

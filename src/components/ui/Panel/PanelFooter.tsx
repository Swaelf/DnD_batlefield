import { forwardRef, type ReactNode, type CSSProperties } from 'react'

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

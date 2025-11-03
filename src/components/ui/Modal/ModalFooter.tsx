import { forwardRef, type ReactNode, type CSSProperties } from 'react'

export type ModalFooterProps = {
  children: ReactNode
  justify?: 'start' | 'center' | 'end' | 'between'
  className?: string
  style?: CSSProperties
}

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, justify = 'end', className, style }, ref) => {
    const justifyContentValues = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    }

    const footerStyles: CSSProperties = {
      borderTop: '1px solid var(--gray700)',
      marginTop: '24px',
      paddingTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: justifyContentValues[justify],
      gap: '12px',
      ...style,
    }

    return (
      <div ref={ref} style={footerStyles} className={className} data-justify={justify}>
        {children}
      </div>
    )
  }
)

ModalFooter.displayName = 'ModalFooter'

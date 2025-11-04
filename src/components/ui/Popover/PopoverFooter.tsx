import { forwardRef, type ReactNode, type CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type PopoverFooterProps = {
  children: ReactNode
  justify?: 'start' | 'center' | 'end' | 'between'
  className?: string
  style?: CSSProperties
}

export const PopoverFooter = forwardRef<HTMLDivElement, PopoverFooterProps>(
  ({ children, justify = 'end', className, style }, ref) => {
    const justifyContentValues = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
    }

    const footerStyles: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: justifyContentValues[justify],
      gap: '12px',
      marginTop: '16px',
      paddingTop: '12px',
      borderTop: `1px solid ${vars.colors.gray700}`,
      ...style,
    }

    return (
      <div ref={ref} style={footerStyles} className={className} data-justify={justify}>
        {children}
      </div>
    )
  }
)

PopoverFooter.displayName = 'PopoverFooter'

import { forwardRef, type ReactNode, type CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type PopoverHeaderProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const PopoverHeader = forwardRef<HTMLDivElement, PopoverHeaderProps>(
  ({ children, className, style }, ref) => {
    const headerStyles: CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: `1px solid ${vars.colors.gray700}`,
      ...style,
    }

    return (
      <div ref={ref} style={headerStyles} className={className}>
        {children}
      </div>
    )
  }
)

PopoverHeader.displayName = 'PopoverHeader'

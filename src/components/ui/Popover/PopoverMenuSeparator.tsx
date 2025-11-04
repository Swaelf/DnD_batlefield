import { forwardRef, type CSSProperties } from 'react'
import { vars } from '@/styles/theme.css'

export type PopoverMenuSeparatorProps = {
  className?: string
  style?: CSSProperties
}

export const PopoverMenuSeparator = forwardRef<HTMLDivElement, PopoverMenuSeparatorProps>(
  ({ className, style }, ref) => {
    const separatorStyles: CSSProperties = {
      height: '1px',
      backgroundColor: vars.colors.gray700,
      margin: '4px 0',
      ...style,
    }

    return (
      <div
        ref={ref}
        style={separatorStyles}
        className={className}
        role="separator"
        aria-orientation="horizontal"
      />
    )
  }
)

PopoverMenuSeparator.displayName = 'PopoverMenuSeparator'

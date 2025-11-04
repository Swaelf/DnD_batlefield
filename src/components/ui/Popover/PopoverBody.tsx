import { forwardRef, type ReactNode, type CSSProperties, type UIEvent } from 'react'
import { vars } from '@/styles/theme.css'

export type PopoverBodyProps = {
  children: ReactNode
  scrollable?: boolean
  className?: string
  style?: CSSProperties
  onScroll?: (event: UIEvent<HTMLDivElement>) => void
}

export const PopoverBody = forwardRef<HTMLDivElement, PopoverBodyProps>(
  ({ children, scrollable = false, className, style, onScroll }, ref) => {
    const bodyStyles: CSSProperties = {
      color: vars.colors.gray200,
      fontSize: '14px',
      lineHeight: 1.5,
      ...(scrollable && {
        maxHeight: '300px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }),
      ...style,
    }

    return (
      <div
        ref={ref}
        style={bodyStyles}
        className={className}
        onScroll={onScroll}
        data-scrollable={scrollable}
      >
        {children}
      </div>
    )
  }
)

PopoverBody.displayName = 'PopoverBody'

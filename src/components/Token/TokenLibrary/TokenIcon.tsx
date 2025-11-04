import { forwardRef, type CSSProperties } from 'react'

export type TokenIconProps = {
  shape: 'circle' | 'square'
  color: string
  size?: number
  className?: string
  style?: CSSProperties
}

export const TokenIcon = forwardRef<HTMLDivElement, TokenIconProps>(
  ({ shape, color, size = 40, className, style }, ref) => {
    const iconStyles: CSSProperties = {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      border: '2px solid var(--dndBlack)',
      borderRadius: shape === 'circle' ? '50%' : '8px',
      transition: 'all 0.2s ease',
      ...style,
    }

    return (
      <div ref={ref} style={iconStyles} className={className} />
    )
  }
)

TokenIcon.displayName = 'TokenIcon'

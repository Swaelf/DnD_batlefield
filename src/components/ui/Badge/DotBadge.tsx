import { forwardRef, type CSSProperties } from 'react'
import { Badge, type BadgeProps } from './Badge'

// Dot Badge for simple indicators
export type DotBadgeProps = Omit<BadgeProps, 'children' | 'size'> & {
  size?: number
}

export const DotBadge = forwardRef<HTMLSpanElement, DotBadgeProps>(
  ({ size: dotSize = 8, style, ...props }, ref) => {
    const dotStyles: CSSProperties = {
      width: `${dotSize}px`,
      height: `${dotSize}px`,
      minWidth: `${dotSize}px`,
      minHeight: `${dotSize}px`,
      borderRadius: '50%',
      padding: 0,
      ...style,
    }

    return (
      <Badge
        ref={ref}
        style={dotStyles}
        {...props}
      >
        {/* Dot badge has no visible children */}
        <span style={{ display: 'none' }}>.</span>
      </Badge>
    )
  }
)

DotBadge.displayName = 'DotBadge'

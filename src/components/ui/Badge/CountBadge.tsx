import { forwardRef } from 'react'
import { Badge, type BadgeProps } from './Badge'

// Count Badge for numeric indicators
export type CountBadgeProps = Omit<BadgeProps, 'children'> & {
  count: number
  max?: number
  showZero?: boolean
}

export const CountBadge = forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, max = 99, showZero = false, ...props }, ref) => {
    if (count === 0 && !showZero) {
      return null
    }

    const displayCount = count > max ? `${max}+` : count.toString()

    return (
      <Badge
        ref={ref}
        size="sm"
        variant="primary"
        data-count={count}
        {...props}
      >
        {displayCount}
      </Badge>
    )
  }
)

CountBadge.displayName = 'CountBadge'

import { forwardRef } from 'react'
import { Badge, type BadgeProps } from './Badge'

// Status Badge variant for specific status indicators
export type StatusBadgeProps = Omit<BadgeProps, 'variant'> & {
  status: 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected'
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusVariantMap = {
      online: 'success' as const,
      active: 'success' as const,
      approved: 'success' as const,
      offline: 'ghost' as const,
      inactive: 'ghost' as const,
      away: 'warning' as const,
      pending: 'warning' as const,
      busy: 'error' as const,
      rejected: 'error' as const,
    }

    return (
      <Badge
        ref={ref}
        variant={statusVariantMap[status]}
        data-status={status}
        {...props}
      />
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

/**
 * IconButton - Button component specifically for icon-only interactions
 * Combines Button and Icon atoms with proper accessibility
 */

import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '../../atoms/Button'
import { Icon } from '../../atoms/Icon'

export type IconButtonProps = {
  icon: LucideIcon
  'aria-label': string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
} & Omit<ComponentProps<typeof Button>, 'children' | 'size'>

export const IconButton = ({
  icon,
  'aria-label': ariaLabel,
  size = 'md',
  disabled,
  loading,
  onClick,
  ...props
}: IconButtonProps) => {
  // Map button sizes to icon sizes
  const iconSizeMap = {
    xs: 'xs' as const,
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  }

  return (
    <Button
      {...props}
      size={size}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      aria-label={ariaLabel}
      css={{
        // Make button square for icons
        width: size === 'xs' ? '24px' :
               size === 'sm' ? '32px' :
               size === 'md' ? '40px' : '48px',
        padding: 0
      }}
    >
      {loading ? (
        <Icon icon={icon} size={iconSizeMap[size]} />
      ) : (
        <Icon icon={icon} size={iconSizeMap[size]} />
      )}
    </Button>
  )
}
/**
 * IconButton - Button component specifically for icon-only interactions
 * Combines Button and Icon atoms with proper accessibility
 */

import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '../../atoms/Button'
import { Icon } from '../../atoms/Icon'
import { styled } from '@/styles/theme.config'

const SquareIconButton = styled(Button, {
  padding: 0,

  variants: {
    size: {
      xs: { width: '24px' },
      sm: { width: '32px' },
      md: { width: '40px' },
      lg: { width: '48px' }
    }
  }
})

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
    <SquareIconButton
      {...props}
      size={size}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {loading ? (
        <Icon icon={icon} size={iconSizeMap[size]} />
      ) : (
        <Icon icon={icon} size={iconSizeMap[size]} />
      )}
    </SquareIconButton>
  )
}
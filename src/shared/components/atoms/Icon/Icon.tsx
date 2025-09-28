/**
 * Icon - Wrapper component for Lucide React icons
 * Provides consistent sizing and styling for icons
 */

import type { LucideIcon } from 'lucide-react'
import { Box } from '@/components/primitives'

export type IconProps = {
  icon: LucideIcon
  'aria-label'?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'current' | 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error'
  className?: string
}

// Helper functions for size and color
const getSizeStyles = (size: IconProps['size'] = 'md') => {
  const sizes = {
    xs: { width: '12px', height: '12px' },
    sm: { width: '16px', height: '16px' },
    md: { width: '20px', height: '20px' },
    lg: { width: '24px', height: '24px' },
    xl: { width: '32px', height: '32px' }
  }
  return sizes[size]
}

const getColorStyles = (color: IconProps['color'] = 'current') => {
  const colors = {
    current: 'currentColor',
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
    accent: 'var(--accent)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
  }
  return colors[color]
}

export const Icon = ({
  icon: IconComponent,
  'aria-label': ariaLabel,
  size = 'md',
  color = 'current',
  className
}: IconProps) => {
  const sizeStyles = getSizeStyles(size)
  const colorValue = getColorStyles(color)

  return (
    <Box
      as="span"
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: colorValue,
        ...sizeStyles
      }}
    >
      <IconComponent style={{ width: '100%', height: '100%' }} />
    </Box>
  )
}
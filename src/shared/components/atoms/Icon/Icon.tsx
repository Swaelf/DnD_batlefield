/**
 * Icon - Wrapper component for Lucide React icons
 * Provides consistent sizing and styling for icons
 */

import type { LucideIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { styled } from '@/foundation/theme'

export type IconProps = {
  icon: LucideIcon
  'aria-label'?: string
} & ComponentProps<typeof StyledIconWrapper>

const StyledIconWrapper = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,

  '& > svg': {
    width: '100%',
    height: '100%'
  },

  variants: {
    size: {
      xs: {
        width: '12px',
        height: '12px'
      },
      sm: {
        width: '16px',
        height: '16px'
      },
      md: {
        width: '20px',
        height: '20px'
      },
      lg: {
        width: '24px',
        height: '24px'
      },
      xl: {
        width: '32px',
        height: '32px'
      }
    },

    color: {
      current: {
        color: 'currentColor'
      },
      primary: {
        color: '$textPrimary'
      },
      secondary: {
        color: '$textSecondary'
      },
      tertiary: {
        color: '$textTertiary'
      },
      accent: {
        color: '$accent'
      },
      success: {
        color: '$success'
      },
      warning: {
        color: '$warning'
      },
      error: {
        color: '$error'
      }
    }
  },

  defaultVariants: {
    size: 'md',
    color: 'current'
  }
})

export const Icon = ({ icon: IconComponent, 'aria-label': ariaLabel, ...props }: IconProps) => {
  return (
    <StyledIconWrapper {...props} role="img" aria-label={ariaLabel}>
      <IconComponent />
    </StyledIconWrapper>
  )
}
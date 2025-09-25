import React from 'react'
import { styled } from '@/styles/theme.config'
import { Text } from '@/components/primitives'

const BadgeRoot = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$md',
  fontSize: '$xs',
  fontWeight: '$medium',
  textTransform: 'uppercase',
  letterSpacing: '0.025em',
  whiteSpace: 'nowrap',

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primary',
        color: 'white'
      },
      secondary: {
        backgroundColor: '$secondary',
        color: '$dndBlack'
      },
      success: {
        backgroundColor: '$success',
        color: 'white'
      },
      warning: {
        backgroundColor: '$warning',
        color: '$dndBlack'
      },
      error: {
        backgroundColor: '$error',
        color: 'white'
      },
      info: {
        backgroundColor: '$info',
        color: 'white'
      },
      outline: {
        backgroundColor: 'transparent',
        color: '$gray300',
        border: '1px solid $gray600'
      },
      ghost: {
        backgroundColor: '$gray800',
        color: '$gray300'
      }
    },
    size: {
      sm: {
        height: 18,
        paddingX: '$2',
        fontSize: '10px'
      },
      md: {
        height: 22,
        paddingX: '$3',
        fontSize: '$xs'
      },
      lg: {
        height: 26,
        paddingX: '$4',
        fontSize: '$sm'
      }
    }
  },

  defaultVariants: {
    variant: 'ghost',
    size: 'md'
  }
})

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'ghost',
  size = 'md',
  className
}) => {
  return (
    <BadgeRoot variant={variant} size={size} className={className}>
      {children}
    </BadgeRoot>
  )
}

export default Badge
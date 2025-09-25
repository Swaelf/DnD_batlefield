/**
 * Button - Interactive button component with D&D theming
 * Supports multiple variants, sizes, and states
 */

import type { ComponentProps, ReactNode } from 'react'
import { styled } from '@/foundation/theme'
import { buttonVariants } from '@/foundation/theme/variants'

export type ButtonProps = {
  children: ReactNode
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
} & ComponentProps<typeof StyledButton>

const StyledButton = styled('button', {
  // Base styles
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$sm',
  border: 'none',
  borderRadius: '$md',
  fontFamily: '$sans',
  fontWeight: '$medium',
  textAlign: 'center',
  textDecoration: 'none',
  cursor: 'pointer',
  userSelect: 'none',
  transition: 'all 150ms ease',

  '&:focus': {
    outline: '2px solid $accent',
    outlineOffset: '2px'
  },

  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none'
  },

  // Apply button variants
  variants: buttonVariants,

  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
})

export const Button = ({ children, disabled, loading, onClick, ...props }: ButtonProps) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }

  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </StyledButton>
  )
}
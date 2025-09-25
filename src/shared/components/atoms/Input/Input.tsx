/**
 * Input - Form input component with consistent styling
 * Supports various input types and validation states
 */

import type { ComponentProps, ChangeEvent } from 'react'
import { styled } from '@/foundation/theme'
import { inputVariants } from '@/foundation/theme/variants'

export type InputProps = {
  value?: string | number
  placeholder?: string
  disabled?: boolean
  error?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
} & Omit<ComponentProps<typeof StyledInput>, 'onChange' | 'onBlur' | 'onFocus'>

const StyledInput = styled('input', {
  // Base styles
  width: '100%',
  borderRadius: '$md',
  fontFamily: '$sans',
  transition: 'all 150ms ease',

  '&::placeholder': {
    color: '$textTertiary'
  },

  '&:focus': {
    outline: 'none'
  },

  // Apply input variants
  variants: inputVariants,

  defaultVariants: {
    variant: 'default',
    size: 'md'
  }
})

export const Input = ({
  value,
  placeholder,
  disabled,
  error,
  onChange,
  onBlur,
  onFocus,
  ...props
}: InputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value)
    }
  }

  return (
    <StyledInput
      {...props}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      variant={error ? 'error' : 'default'}
      onChange={handleChange}
      onBlur={onBlur}
      onFocus={onFocus}
      aria-invalid={!!error}
      aria-describedby={error ? `${props.id}-error` : undefined}
    />
  )
}
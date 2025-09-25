/**
 * FieldInput Atom Component
 *
 * Styled input component for property fields with D&D theming.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { styled } from '@/styles/theme.config'

interface FieldInputProps {
  type?: 'text' | 'number' | 'email' | 'password'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

const Input = styled('input', {
  width: '100%',
  padding: '$2',
  borderRadius: '$2',
  border: '1px solid $gray400',
  fontSize: '$sm',
  background: '$gray100',
  color: '$gray900',
  transition: 'all 0.2s ease',

  '&:focus': {
    outline: 'none',
    borderColor: '$dndRed',
    background: 'white',
    boxShadow: '0 0 0 1px $colors$dndRed'
  },

  '&:disabled': {
    background: '$gray200',
    color: '$gray600',
    cursor: 'not-allowed'
  },

  '&::placeholder': {
    color: '$gray500'
  },

  variants: {
    hasError: {
      true: {
        borderColor: '$red500',
        '&:focus': {
          borderColor: '$red500',
          boxShadow: '0 0 0 1px $colors$red500'
        }
      }
    }
  }
})

export const FieldInput: React.FC<FieldInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  disabled = false,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <Input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={className}
    />
  )
}
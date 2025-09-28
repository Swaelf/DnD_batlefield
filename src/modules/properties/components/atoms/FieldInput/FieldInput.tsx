/**
 * FieldInput Atom Component
 *
 * Styled input component for property fields with D&D theming.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'

interface FieldInputProps {
  type?: 'text' | 'number' | 'email' | 'password'
  value: string | number
  onChange: (value: string) => void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  hasError?: boolean
  className?: string
}

// Helper functions for styling
const getInputStyles = (disabled = false, hasError = false) => ({
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: `1px solid ${hasError ? 'var(--red-500)' : 'var(--gray-400)'}`,
  fontSize: '14px',
  background: disabled ? 'var(--gray-200)' : 'var(--gray-100)',
  color: disabled ? 'var(--gray-600)' : 'var(--gray-900)',
  transition: 'all 0.2s ease',
  cursor: disabled ? 'not-allowed' : 'text',
  outline: 'none'
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
  hasError = false,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      e.target.style.borderColor = hasError ? 'var(--red-500)' : 'var(--dnd-red)'
      e.target.style.background = 'white'
      e.target.style.boxShadow = hasError
        ? '0 0 0 1px var(--red-500)'
        : '0 0 0 1px var(--dnd-red)'
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = hasError ? 'var(--red-500)' : 'var(--gray-400)'
    e.target.style.background = disabled ? 'var(--gray-200)' : 'var(--gray-100)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={className}
      style={getInputStyles(disabled, hasError)}
    />
  )
}
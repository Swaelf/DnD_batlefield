/**
 * FieldSelect Atom Component
 *
 * Styled select component for property fields with D&D options.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { Box } from '@/components/primitives'
import type { PropertyFieldOption } from '../../../types'

interface FieldSelectProps {
  value: string | number
  options: PropertyFieldOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

// Helper functions for styling
const getSelectContainerStyles = (): React.CSSProperties => ({
  position: 'relative' as const,
  width: '100%'
})

const getSelectStyles = (disabled = false): React.CSSProperties => ({
  width: '100%',
  padding: '8px',
  paddingRight: '32px',
  borderRadius: '4px',
  border: '1px solid var(--gray-400)',
  fontSize: '14px',
  background: disabled ? 'var(--gray-200)' : 'var(--gray-100)',
  color: disabled ? 'var(--gray-600)' : 'var(--gray-900)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  appearance: 'none' as const,
  transition: 'all 0.2s ease',
  outline: 'none'
})

const getChevronIconStyles = (): React.CSSProperties => ({
  position: 'absolute' as const,
  right: '8px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--gray-600)',
  pointerEvents: 'none' as const
})

export const FieldSelect: React.FC<FieldSelectProps> = ({
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  className
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <Box className={className} style={getSelectContainerStyles()}>
      <select
        value={value}
        onChange={handleChange}
        disabled={disabled}
        style={{
          ...getSelectStyles(disabled)
        }}
        onFocus={(e: React.FocusEvent<HTMLSelectElement>) => {
          e.target.style.borderColor = 'var(--dnd-red)'
          e.target.style.background = 'white'
          e.target.style.boxShadow = '0 0 0 1px var(--dnd-red)'
        }}
        onBlur={(e: React.FocusEvent<HTMLSelectElement>) => {
          e.target.style.borderColor = 'var(--gray-400)'
          e.target.style.background = disabled ? 'var(--gray-200)' : 'var(--gray-100)'
          e.target.style.boxShadow = 'none'
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} style={getChevronIconStyles()} />
    </Box>
  )
}
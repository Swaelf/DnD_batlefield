/**
 * FieldSelect Atom Component
 *
 * Styled select component for property fields with D&D options.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import type { PropertyFieldOption } from '../../../types'

interface FieldSelectProps {
  value: string | number
  options: PropertyFieldOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const SelectContainer = styled('div', {
  position: 'relative',
  width: '100%'
})

const Select = styled('select', {
  width: '100%',
  padding: '$2',
  paddingRight: '$8',
  borderRadius: '$2',
  border: '1px solid $gray400',
  fontSize: '$sm',
  background: '$gray100',
  color: '$gray900',
  cursor: 'pointer',
  appearance: 'none',
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
  }
})

const ChevronIcon = styled(ChevronDown, {
  position: 'absolute',
  right: '$2',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '$gray600',
  pointerEvents: 'none',
  size: 16
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
    <SelectContainer className={className}>
      <Select
        value={value}
        onChange={handleChange}
        disabled={disabled}
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
      </Select>
      <ChevronIcon />
    </SelectContainer>
  )
}
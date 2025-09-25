/**
 * PropertyField Atom Component
 *
 * Base property field with label, validation, and help text.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { AlertCircle, HelpCircle } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import type { PropertyField as PropertyFieldType } from '../../../types'

interface PropertyFieldProps {
  field: PropertyFieldType
  value: unknown
  isValid?: boolean
  errors?: string[]
  warnings?: string[]
  children: React.ReactNode
  className?: string
}

const FieldContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
  marginBottom: '$3'
})

const FieldHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$1'
})

const FieldLabel = styled('label', {
  fontSize: '$sm',
  fontWeight: 500,
  color: '$gray900',

  variants: {
    required: {
      true: {
        '&::after': {
          content: ' *',
          color: '$dndRed'
        }
      }
    }
  }
})

const HelpButton = styled('button', {
  background: 'none',
  border: 'none',
  padding: 0,
  color: '$gray500',
  cursor: 'help',

  '&:hover': {
    color: '$gray700'
  }
})

const ValidationMessage = styled('div', {
  fontSize: '$xs',
  display: 'flex',
  alignItems: 'center',
  gap: '$1',

  variants: {
    type: {
      error: { color: '$red600' },
      warning: { color: '$yellow600' }
    }
  }
})

const HelpText = styled('div', {
  fontSize: '$xs',
  color: '$gray600',
  lineHeight: 1.4
})

export const PropertyField: React.FC<PropertyFieldProps> = ({
  field,
  value,
  isValid = true,
  errors = [],
  warnings = [],
  children,
  className
}) => {
  return (
    <FieldContainer className={className}>
      <FieldHeader>
        <FieldLabel required={field.required}>
          {field.label}
        </FieldLabel>
        {field.helpText && (
          <HelpButton title={field.helpText}>
            <HelpCircle size={14} />
          </HelpButton>
        )}
      </FieldHeader>

      {children}

      {errors.map((error, index) => (
        <ValidationMessage key={`error-${index}`} type="error">
          <AlertCircle size={12} />
          {error}
        </ValidationMessage>
      ))}

      {warnings.map((warning, index) => (
        <ValidationMessage key={`warning-${index}`} type="warning">
          <AlertCircle size={12} />
          {warning}
        </ValidationMessage>
      ))}

      {field.helpText && !errors.length && !warnings.length && (
        <HelpText>{field.helpText}</HelpText>
      )}
    </FieldContainer>
  )
}
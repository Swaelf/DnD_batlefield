/**
 * PropertyField Atom Component
 *
 * Base property field with label, validation, and help text.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { AlertCircle, HelpCircle } from 'lucide-react'
import { Box, Text, Button } from '@/components/primitives'
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

// Component uses primitive components with style prop for styling

export const PropertyField: React.FC<PropertyFieldProps> = ({
  field,
  errors = [],
  warnings = [],
  children,
  className
}) => {
  return (
    <Box
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '12px'
      }}
    >
      {/* Field Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <Text
          as="label"
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: 'var(--gray-900)'
          }}
        >
          {field.label}
          {field.required && (
            <span style={{ color: 'var(--dnd-red)' }}> *</span>
          )}
        </Text>
        {field.helpText && (
          <Button
            title={field.helpText}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--gray-500)',
              cursor: 'help',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = 'var(--gray-700)'
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = 'var(--gray-500)'
            }}
          >
            <HelpCircle size={14} />
          </Button>
        )}
      </Box>

      {/* Field Input */}
      {children}

      {/* Error Messages */}
      {errors.map((error, index) => (
        <Box
          key={`error-${index}`}
          style={{
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--red-600)'
          }}
        >
          <AlertCircle size={12} />
          <Text style={{ color: 'var(--red-600)', fontSize: '12px' }}>
            {error}
          </Text>
        </Box>
      ))}

      {/* Warning Messages */}
      {warnings.map((warning, index) => (
        <Box
          key={`warning-${index}`}
          style={{
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--yellow-600)'
          }}
        >
          <AlertCircle size={12} />
          <Text style={{ color: 'var(--yellow-600)', fontSize: '12px' }}>
            {warning}
          </Text>
        </Box>
      ))}

      {/* Help Text */}
      {field.helpText && !errors.length && !warnings.length && (
        <Text
          style={{
            fontSize: '12px',
            color: 'var(--gray-600)',
            lineHeight: 1.4
          }}
        >
          {field.helpText}
        </Text>
      )}
    </Box>
  )
}
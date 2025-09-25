/**
 * DNDField Atom Component
 *
 * D&D 5e specific property field with official validation and styling.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { Shield, Star } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { PropertyField } from '../PropertyField'
import type { PropertyField as PropertyFieldType } from '../../../types'

interface DNDFieldProps {
  field: PropertyFieldType
  value: unknown
  isValid?: boolean
  errors?: string[]
  warnings?: string[]
  isDNDCompliant?: boolean
  children: React.ReactNode
  className?: string
}

const DNDContainer = styled('div', {
  position: 'relative'
})

const DNDBadge = styled('div', {
  position: 'absolute',
  top: -8,
  right: -8,
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  padding: '$1',
  borderRadius: '$2',
  fontSize: '$xs',
  fontWeight: 500,
  zIndex: 1,

  variants: {
    compliant: {
      true: {
        background: '$dndRed',
        color: 'white'
      },
      false: {
        background: '$yellow200',
        color: '$yellow800'
      }
    }
  }
})

const DNDInput = styled('div', {
  position: 'relative',

  '& input, & select, & textarea': {
    paddingRight: '$8'
  },

  variants: {
    dndCompliant: {
      true: {
        '& input, & select, & textarea': {
          borderColor: '$dndRed'
        }
      },
      false: {
        '& input, & select, & textarea': {
          borderColor: '$yellow400'
        }
      }
    }
  }
})

export const DNDField: React.FC<DNDFieldProps> = ({
  field,
  value,
  isValid = true,
  errors = [],
  warnings = [],
  isDNDCompliant = true,
  children,
  className
}) => {
  const showDNDBadge = field.dndRule || field.type.startsWith('dnd-')

  return (
    <DNDContainer className={className}>
      <PropertyField
        field={field}
        value={value}
        isValid={isValid}
        errors={errors}
        warnings={warnings}
      >
        <DNDInput dndCompliant={isDNDCompliant}>
          {children}
        </DNDInput>
      </PropertyField>

      {showDNDBadge && (
        <DNDBadge compliant={isDNDCompliant} title={
          isDNDCompliant
            ? 'D&D 5e Official'
            : 'Custom Value - Not D&D 5e Official'
        }>
          {isDNDCompliant ? <Shield size={10} /> : <Star size={10} />}
          D&D
        </DNDBadge>
      )}
    </DNDContainer>
  )
}
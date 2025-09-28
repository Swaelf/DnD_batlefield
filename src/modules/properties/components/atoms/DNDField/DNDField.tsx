/**
 * DNDField Atom Component
 *
 * D&D 5e specific property field with official validation and styling.
 * Follows atomic design patterns with 25-40 line constraint.
 */

import React from 'react'
import { Shield, Star } from 'lucide-react'
import { Box } from '@/components/primitives'
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

// Helper functions for styling
const getDNDContainerStyles = (): React.CSSProperties => ({
  position: 'relative' as const
})

const getDNDBadgeStyles = (isDNDCompliant = true): React.CSSProperties => ({
  position: 'absolute' as const,
  top: '-8px',
  right: '-8px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '500',
  zIndex: 1,
  background: isDNDCompliant ? 'var(--dnd-red)' : 'var(--yellow-200)',
  color: isDNDCompliant ? 'white' : 'var(--yellow-800)'
})

const getDNDInputStyles = (): React.CSSProperties => ({
  position: 'relative' as const
  // Note: Nested selectors not supported in React.CSSProperties
  // These styles should be applied differently
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
    <Box className={className} style={getDNDContainerStyles()}>
      <PropertyField
        field={field}
        value={value}
        isValid={isValid}
        errors={errors}
        warnings={warnings}
      >
        <Box style={getDNDInputStyles()}>
          {children}
        </Box>
      </PropertyField>

      {showDNDBadge && (
        <Box
          style={getDNDBadgeStyles(isDNDCompliant)}
          title={
            isDNDCompliant
              ? 'D&D 5e Official'
              : 'Custom Value - Not D&D 5e Official'
          }
        >
          {isDNDCompliant ? <Shield size={10} /> : <Star size={10} />}
          D&D
        </Box>
      )}
    </Box>
  )
}
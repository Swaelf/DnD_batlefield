/**
 * PropertyGroup Molecule Component
 * Collapsible property group with fields and D&D validation
 */

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Box } from '@/components/primitives/BoxVE'
import { Text } from '@/components/primitives/TextVE'
import { Button } from '@/components/primitives/ButtonVE'
import { PropertyField, DNDField, FieldInput, FieldSelect } from '../../atoms'
import { usePropertyField } from '../../../hooks'
import type {
  PropertyGroup as PropertyGroupType,
  PropertyField as PropertyFieldType
} from '../../../types'

interface PropertyGroupProps {
  group: PropertyGroupType
  fields: PropertyFieldType[]
  objectId: string
  isExpanded?: boolean
  onToggleExpanded?: () => void
  className?: string
}


const FieldComponent: React.FC<{ field: PropertyFieldType; objectId: string }> = ({ field, objectId }) => {
  const { value, errors, warnings, isValid, updateValue } = usePropertyField(objectId, field.key)

  const isDNDField = field.dndRule || field.type.startsWith('dnd-')
  const isDNDCompliant = field.dndRule ? errors.length === 0 : true

  const renderInput = () => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'dnd-speed':
      case 'dnd-stat':
      case 'dnd-ac':
      case 'dnd-hp':
        return (
          <FieldInput
            type={field.type === 'number' || field.type.startsWith('dnd-') ? 'number' : 'text'}
            value={String(value || '')}
            onChange={updateValue}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        )

      case 'select':
      case 'dnd-size':
      case 'condition':
        return (
          <FieldSelect
            value={String(value || '')}
            options={field.options || []}
            onChange={updateValue}
            placeholder={field.placeholder}
          />
        )

      default:
        return (
          <FieldInput
            value={String(value || '')}
            onChange={updateValue}
            placeholder={field.placeholder}
          />
        )
    }
  }

  if (isDNDField) {
    return (
      <DNDField
        field={field}
        value={value}
        isValid={isValid}
        errors={errors}
        warnings={warnings}
        isDNDCompliant={isDNDCompliant}
      >
        {renderInput()}
      </DNDField>
    )
  }

  return (
    <PropertyField
      field={field}
      value={value}
      isValid={isValid}
      errors={errors}
      warnings={warnings}
    >
      {renderInput()}
    </PropertyField>
  )
}

export const PropertyGroup: React.FC<PropertyGroupProps> = ({
  group,
  fields,
  objectId,
  isExpanded = group.defaultExpanded,
  onToggleExpanded,
  className
}) => {
  const groupFields = fields.filter(field => field.groupId === group.id)

  if (groupFields.length === 0) return null

  return (
    <Box
      className={className}
      style={{
        marginBottom: '12px'
      }}
    >
      {/* Group Header */}
      <Button
        variant="outline"
        onClick={onToggleExpanded}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 12px',
          backgroundColor: 'var(--colors-gray800)',
          border: '1px solid var(--colors-gray600)',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--colors-gray100)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* Icon placeholder - would be rendered based on group.icon */}
          </Box>
          <Text
            variant="label"
            size="sm"
            style={{
              fontWeight: '600',
              color: 'var(--colors-gray100)'
            }}
          >
            {group.name}
          </Text>
          {group.description && (
            <Text
              variant="body"
              size="xs"
              style={{
                color: 'var(--colors-gray400)'
              }}
            >
              ({groupFields.length} {groupFields.length === 1 ? 'field' : 'fields'})
            </Text>
          )}
        </Box>
        {group.collapsible && (
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'var(--colors-gray400)'
            }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Box>
        )}
      </Button>

      {/* Group Content */}
      {isExpanded && (
        <Box
          style={{
            padding: '12px',
            border: '1px solid var(--colors-gray600)',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            backgroundColor: 'var(--colors-gray900)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {groupFields.map(field => (
            <FieldComponent
              key={field.id}
              field={field}
              objectId={objectId}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
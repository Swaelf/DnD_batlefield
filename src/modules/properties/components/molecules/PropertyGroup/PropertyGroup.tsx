/**
 * PropertyGroup Molecule Component
 *
 * Collapsible property group with fields and D&D validation.
 * Follows molecular design patterns with 60-90 line constraint.
 */

import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { styled } from '@/styles/theme.config'
import { PropertyField, DNDField, FieldInput, FieldSelect } from '../../atoms'
import { usePropertyField } from '../../../hooks'
import type {
  PropertyGroup as PropertyGroupType,
  PropertyField as PropertyFieldType,
  PropertyFieldType as FieldType
} from '../../../types'

interface PropertyGroupProps {
  group: PropertyGroupType
  fields: PropertyFieldType[]
  objectId: string
  isExpanded?: boolean
  onToggleExpanded?: () => void
  className?: string
}

const GroupContainer = styled('div', {
  marginBottom: '$3'
})

const GroupHeader = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '$2',
  background: '$gray100',
  border: '1px solid $gray300',
  borderRadius: '$2',
  fontSize: '$sm',
  fontWeight: 600,
  color: '$gray900',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    background: '$gray200'
  },

  '&:focus': {
    outline: 'none',
    borderColor: '$dndRed',
    boxShadow: '0 0 0 1px $colors$dndRed'
  }
})

const GroupTitle = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '$2'
})

const GroupIcon = styled('div', {
  display: 'flex',
  alignItems: 'center'
})

const GroupContent = styled('div', {
  padding: '$3',
  border: '1px solid $gray300',
  borderTop: 'none',
  borderRadius: '0 0 $2 $2',
  background: 'white',

  variants: {
    expanded: {
      true: {
        display: 'block'
      },
      false: {
        display: 'none'
      }
    }
  }
})

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
    <GroupContainer className={className}>
      <GroupHeader onClick={onToggleExpanded}>
        <GroupTitle>
          <GroupIcon>
            {/* Icon would be rendered here based on group.icon */}
          </GroupIcon>
          {group.name}
          {group.description && (
            <span style={{ fontSize: '12px', color: '#666' }}>
              ({groupFields.length} {groupFields.length === 1 ? 'field' : 'fields'})
            </span>
          )}
        </GroupTitle>
        {group.collapsible && (
          isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        )}
      </GroupHeader>

      <GroupContent expanded={isExpanded}>
        {groupFields.map(field => (
          <FieldComponent
            key={field.id}
            field={field}
            objectId={objectId}
          />
        ))}
      </GroupContent>
    </GroupContainer>
  )
}
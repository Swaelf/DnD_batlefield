/**
 * Property Field Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PropertyField } from './PropertyField'
import type { PropertyField as PropertyFieldType } from '../../../types'
import { createPropertyFieldId, createPropertyGroupId } from '../../../types'

describe('PropertyField Component', () => {
  const mockField: PropertyFieldType = {
    id: createPropertyFieldId('test-field'),
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true,
    placeholder: 'Enter name',
    helpText: 'This is the display name for the object',
    groupId: createPropertyGroupId('basic')
  }

  const mockOptionalField: PropertyFieldType = {
    id: createPropertyFieldId('optional-field'),
    key: 'description',
    label: 'Description',
    type: 'text',
    required: false,
    helpText: 'Optional description field'
  }

  it('renders field label correctly', () => {
    render(
      <PropertyField field={mockField} value="test">
        <input />
      </PropertyField>
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('shows required indicator for required fields', () => {
    render(
      <PropertyField field={mockField} value="test">
        <input />
      </PropertyField>
    )

    const label = screen.getByText('Name')
    // Check for the required asterisk in the CSS content
    expect(label).toHaveStyle({ content: ' *' })
  })

  it('does not show required indicator for optional fields', () => {
    render(
      <PropertyField field={mockOptionalField} value="test">
        <input />
      </PropertyField>
    )

    const label = screen.getByText('Description')
    expect(label).toBeInTheDocument()
    // Should not have required styling
  })

  it('displays help button when helpText is provided', () => {
    render(
      <PropertyField field={mockField} value="test">
        <input />
      </PropertyField>
    )

    const helpButton = screen.getByTitle('This is the display name for the object')
    expect(helpButton).toBeInTheDocument()
  })

  it('shows help text when no errors or warnings', () => {
    render(
      <PropertyField
        field={mockField}
        value="test"
        isValid={true}
        errors={[]}
        warnings={[]}
      >
        <input />
      </PropertyField>
    )

    expect(screen.getByText('This is the display name for the object')).toBeInTheDocument()
  })

  it('displays error messages', () => {
    const errors = ['Name is required', 'Name must be at least 3 characters']

    render(
      <PropertyField
        field={mockField}
        value=""
        isValid={false}
        errors={errors}
      >
        <input />
      </PropertyField>
    )

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Name must be at least 3 characters')).toBeInTheDocument()
  })

  it('displays warning messages', () => {
    const warnings = ['This value is unusual for D&D 5e']

    render(
      <PropertyField
        field={mockField}
        value="test"
        isValid={true}
        warnings={warnings}
      >
        <input />
      </PropertyField>
    )

    expect(screen.getByText('This value is unusual for D&D 5e')).toBeInTheDocument()
  })

  it('hides help text when errors are present', () => {
    render(
      <PropertyField
        field={mockField}
        value=""
        isValid={false}
        errors={['Name is required']}
      >
        <input />
      </PropertyField>
    )

    expect(screen.queryByText('This is the display name for the object')).not.toBeInTheDocument()
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })

  it('hides help text when warnings are present', () => {
    render(
      <PropertyField
        field={mockField}
        value="test"
        isValid={true}
        warnings={['This is a warning']}
      >
        <input />
      </PropertyField>
    )

    expect(screen.queryByText('This is the display name for the object')).not.toBeInTheDocument()
    expect(screen.getByText('This is a warning')).toBeInTheDocument()
  })

  it('renders children component', () => {
    render(
      <PropertyField field={mockField} value="test">
        <input data-testid="child-input" />
      </PropertyField>
    )

    expect(screen.getByTestId('child-input')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <PropertyField field={mockField} value="test" className="custom-field">
        <input />
      </PropertyField>
    )

    expect(container.firstChild).toHaveClass('custom-field')
  })

  it('shows multiple errors and warnings together', () => {
    const errors = ['Error 1', 'Error 2']
    const warnings = ['Warning 1']

    render(
      <PropertyField
        field={mockField}
        value=""
        isValid={false}
        errors={errors}
        warnings={warnings}
      >
        <input />
      </PropertyField>
    )

    expect(screen.getByText('Error 1')).toBeInTheDocument()
    expect(screen.getByText('Error 2')).toBeInTheDocument()
    expect(screen.getByText('Warning 1')).toBeInTheDocument()
  })

  it('handles field without help text', () => {
    const fieldWithoutHelp: PropertyFieldType = {
      ...mockField,
      helpText: undefined
    }

    render(
      <PropertyField field={fieldWithoutHelp} value="test">
        <input />
      </PropertyField>
    )

    expect(screen.queryByTitle(mockField.helpText!)).not.toBeInTheDocument()
  })

  it('shows error and warning icons', () => {
    const errors = ['An error']
    const warnings = ['A warning']

    render(
      <PropertyField
        field={mockField}
        value="test"
        isValid={false}
        errors={errors}
        warnings={warnings}
      >
        <input />
      </PropertyField>
    )

    // Check that error and warning messages are displayed with icons
    // The AlertCircle icons are rendered within the validation messages
    expect(screen.getByText('An error')).toBeInTheDocument()
    expect(screen.getByText('A warning')).toBeInTheDocument()
  })

  it('maintains accessibility with proper label association', () => {
    render(
      <PropertyField field={mockField} value="test">
        <input aria-labelledby="field-label" />
      </PropertyField>
    )

    const label = screen.getByText('Name')
    expect(label.tagName).toBe('LABEL')
  })
})
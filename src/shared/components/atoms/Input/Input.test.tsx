/**
 * Input component tests
 * Test input behavior, validation states, and events
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from './Input'

describe('Input Component', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('displays value', () => {
    render(<Input value="Test value" onChange={() => {}} />)
    expect(screen.getByDisplayValue('Test value')).toBeInTheDocument()
  })

  it('calls onChange when text is entered', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new text' } })

    expect(handleChange).toHaveBeenCalledWith('new text')
  })

  it('calls onFocus and onBlur', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')

    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('applies error state', () => {
    render(<Input error="This field is required" id="test-input" />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />)

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('accepts different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    const passwordInput = screen.getByDisplayValue('') // Password inputs don't have textbox role
    expect(passwordInput).toHaveAttribute('type', 'password')

    rerender(<Input type="number" />)
    expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number')
  })
})
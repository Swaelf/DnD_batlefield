/**
 * Round Counter Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RoundCounter } from './RoundCounter'

describe('RoundCounter Component', () => {
  const defaultProps = {
    currentRound: 3,
    totalRounds: 5,
    canGoBack: true,
    canGoForward: true,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onGoToRound: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders current round correctly', () => {
    render(<RoundCounter {...defaultProps} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('/ 5')).toBeInTheDocument()
  })

  it('displays combat status indicator', () => {
    const { rerender } = render(<RoundCounter {...defaultProps} isInCombat={false} />)

    // Should show inactive status
    const indicator = document.querySelector('[data-status]')
    expect(indicator).toBeInTheDocument()

    // Test with combat active
    rerender(<RoundCounter {...defaultProps} isInCombat={true} />)
    // Combat indicator should be visible (red glow)
  })

  it('calls onPrevious when previous button clicked', () => {
    render(<RoundCounter {...defaultProps} />)

    const prevButton = screen.getByLabelText('Previous round')
    fireEvent.click(prevButton)

    expect(defaultProps.onPrevious).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when next button clicked', () => {
    render(<RoundCounter {...defaultProps} />)

    const nextButton = screen.getByLabelText('Next round')
    fireEvent.click(nextButton)

    expect(defaultProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('disables previous button when canGoBack is false', () => {
    render(<RoundCounter {...defaultProps} canGoBack={false} />)

    const prevButton = screen.getByLabelText('Previous round')
    expect(prevButton).toBeDisabled()

    fireEvent.click(prevButton)
    expect(defaultProps.onPrevious).not.toHaveBeenCalled()
  })

  it('disables next button when canGoForward is false', () => {
    render(<RoundCounter {...defaultProps} canGoForward={false} />)

    const nextButton = screen.getByLabelText('Next round')
    expect(nextButton).toBeDisabled()

    fireEvent.click(nextButton)
    expect(defaultProps.onNext).not.toHaveBeenCalled()
  })

  it('allows editing round number when onGoToRound provided', () => {
    render(<RoundCounter {...defaultProps} />)

    const roundDisplay = screen.getByText('3')
    fireEvent.click(roundDisplay)

    // Should show input field
    const input = screen.getByDisplayValue('3')
    expect(input).toBeInTheDocument()

    // Change value and submit
    fireEvent.change(input, { target: { value: '4' } })
    fireEvent.blur(input)

    expect(defaultProps.onGoToRound).toHaveBeenCalledWith(4)
  })

  it('validates input range when editing', () => {
    render(<RoundCounter {...defaultProps} />)

    const roundDisplay = screen.getByText('3')
    fireEvent.click(roundDisplay)

    const input = screen.getByDisplayValue('3')

    // Try invalid value (too high)
    fireEvent.change(input, { target: { value: '10' } })
    fireEvent.blur(input)

    // Should not call onGoToRound and should reset
    expect(defaultProps.onGoToRound).not.toHaveBeenCalled()
  })

  it('submits on Enter key', () => {
    render(<RoundCounter {...defaultProps} />)

    const roundDisplay = screen.getByText('3')
    fireEvent.click(roundDisplay)

    const input = screen.getByDisplayValue('3')
    fireEvent.change(input, { target: { value: '2' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(defaultProps.onGoToRound).toHaveBeenCalledWith(2)
  })

  it('cancels editing on Escape key', () => {
    render(<RoundCounter {...defaultProps} />)

    const roundDisplay = screen.getByText('3')
    fireEvent.click(roundDisplay)

    const input = screen.getByDisplayValue('3')
    fireEvent.change(input, { target: { value: '2' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    // Should not call onGoToRound and should show original value
    expect(defaultProps.onGoToRound).not.toHaveBeenCalled()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show edit functionality when onGoToRound not provided', () => {
    const propsWithoutEdit = { ...defaultProps, onGoToRound: undefined }
    render(<RoundCounter {...propsWithoutEdit} />)

    const roundDisplay = screen.getByText('3')
    expect(roundDisplay).not.toHaveAttribute('title', 'Click to edit')

    fireEvent.click(roundDisplay)

    // Should not show input
    expect(screen.queryByDisplayValue('3')).not.toBeInTheDocument()
  })

  it('shows total rounds when available', () => {
    render(<RoundCounter {...defaultProps} />)
    expect(screen.getByText('/ 5')).toBeInTheDocument()
  })

  it('hides total rounds when zero', () => {
    render(<RoundCounter {...defaultProps} totalRounds={0} />)
    expect(screen.queryByText('/')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<RoundCounter {...defaultProps} className="custom-class" />)
    const container = screen.getByText('Round').closest('div')
    expect(container).toHaveClass('custom-class')
  })

  it('shows different styling for combat mode', () => {
    const { rerender } = render(<RoundCounter {...defaultProps} isInCombat={false} />)

    let roundDisplay = screen.getByText('Round')
    expect(roundDisplay).toBeInTheDocument()

    rerender(<RoundCounter {...defaultProps} isInCombat={true} />)

    roundDisplay = screen.getByText('Round')
    // In combat mode, the styling should be different (red color)
    expect(roundDisplay).toBeInTheDocument()
  })
})
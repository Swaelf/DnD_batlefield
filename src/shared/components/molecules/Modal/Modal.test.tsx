/**
 * Modal component tests
 * Test modal behavior, accessibility, and interactions
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Modal } from './Modal'

describe('Modal Component', () => {
  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'modal-title')
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose}>
        <div>Modal Content</div>
      </Modal>
    )

    const closeButton = screen.getByRole('button', { name: /close modal/i })
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose} closeOnBackdrop={true}>
        <div>Modal Content</div>
      </Modal>
    )

    // Click on the backdrop (the modal wrapper that's not the content)
    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('does not close when backdrop is clicked and closeOnBackdrop is false', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose} closeOnBackdrop={false}>
        <div>Modal Content</div>
      </Modal>
    )

    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(handleClose).not.toHaveBeenCalled()
    }
  })

  it('calls onClose when escape key is pressed', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose} closeOnEscape={true}>
        <div>Modal Content</div>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on escape when closeOnEscape is false', () => {
    const handleClose = vi.fn()
    render(
      <Modal open={true} onClose={handleClose} closeOnEscape={false}>
        <div>Modal Content</div>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal open={true} onClose={() => {}} showCloseButton={false}>
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <Modal open={true} onClose={() => {}} title="Accessible Modal">
        <div>Modal Content</div>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')
  })
})
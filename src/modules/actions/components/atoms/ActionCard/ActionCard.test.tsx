/**
 * Action Card Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ActionCard } from './ActionCard'
import type { UnifiedAction } from '../../../types'

describe('ActionCard Component', () => {
  const mockSpellAction: UnifiedAction = {
    id: 'action-1' as any,
    templateId: 'fireball' as any,
    name: 'Fireball',
    description: 'A bright flash and a burst of flame at a target location',
    type: 'spell',
    category: 'combat',
    data: {
      type: 'spell',
      level: 3
    } as any,
    customizable: true,
    isCustom: false,
    tags: ['fire', 'evocation', 'area', 'damage'],
    createdAt: new Date()
  }

  const mockAttackAction: UnifiedAction = {
    id: 'action-2' as any,
    templateId: 'sword_attack' as any,
    name: 'Sword Attack',
    description: 'A standard melee sword attack with sharp blade',
    type: 'attack',
    category: 'combat',
    data: {
      type: 'attack'
    } as any,
    customizable: true,
    isCustom: false,
    tags: ['melee', 'weapon', 'sword'],
    createdAt: new Date()
  }

  const mockCustomAction: UnifiedAction = {
    ...mockSpellAction,
    id: 'custom-1' as any,
    name: 'Custom Fireball',
    isCustom: true,
    category: 'custom',
    tags: ['fire', 'custom']
  }

  it('renders action information correctly', () => {
    render(<ActionCard action={mockSpellAction} />)

    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('SPELL')).toBeInTheDocument()
    expect(screen.getByText(/A bright flash and a burst/)).toBeInTheDocument()
  })

  it('displays spell level badge for spells', () => {
    render(<ActionCard action={mockSpellAction} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByTitle('Spell Level')).toBeInTheDocument()
  })

  it('does not display level badge for non-spells', () => {
    render(<ActionCard action={mockAttackAction} />)
    expect(screen.queryByTitle('Spell Level')).not.toBeInTheDocument()
  })

  it('shows custom badge for custom actions', () => {
    render(<ActionCard action={mockCustomAction} />)
    // Custom badge should be visible (purple dot)
    const customBadge = document.querySelector('[style*="purple"]')
    expect(customBadge).toBeInTheDocument()
  })

  it('calls onSelect when card is clicked', () => {
    const onSelect = vi.fn()
    render(<ActionCard action={mockSpellAction} onSelect={onSelect} />)

    fireEvent.click(screen.getByText('Fireball'))
    expect(onSelect).toHaveBeenCalledWith(mockSpellAction)
  })

  it('shows edit button when showEditButton is true and action is customizable', () => {
    render(
      <ActionCard
        action={mockSpellAction}
        showEditButton={true}
      />
    )

    // Edit button appears on hover, check it exists in DOM
    const editButton = screen.getByTitle('Edit action')
    expect(editButton).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <ActionCard
        action={mockSpellAction}
        showEditButton={true}
        onEdit={onEdit}
      />
    )

    fireEvent.click(screen.getByTitle('Edit action'))
    expect(onEdit).toHaveBeenCalledWith(mockSpellAction)
  })

  it('does not show edit button when action is not customizable', () => {
    const nonCustomizableAction = { ...mockSpellAction, customizable: false }
    render(
      <ActionCard
        action={nonCustomizableAction}
        showEditButton={true}
      />
    )

    expect(screen.queryByTitle('Edit action')).not.toBeInTheDocument()
  })

  it('applies selected styling when isSelected is true', () => {
    render(<ActionCard action={mockSpellAction} isSelected={true} />)

    const card = screen.getByText('Fireball').closest('div')
    expect(card).toHaveStyle({ borderColor: expect.stringContaining('dndRed') })
  })

  it('displays action type with correct styling', () => {
    render(<ActionCard action={mockSpellAction} />)
    const typeElement = screen.getByText('SPELL')

    expect(typeElement).toBeInTheDocument()
    expect(typeElement).toHaveStyle({
      textTransform: 'uppercase',
      background: expect.any(String)
    })
  })

  it('displays first 3 tags and shows count for additional tags', () => {
    render(<ActionCard action={mockSpellAction} />)

    // First 3 tags should be visible
    expect(screen.getByText('fire')).toBeInTheDocument()
    expect(screen.getByText('evocation')).toBeInTheDocument()
    expect(screen.getByText('area')).toBeInTheDocument()

    // Additional tags count should be shown
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.getByTitle('damage')).toBeInTheDocument()
  })

  it('truncates long descriptions', () => {
    const longDescriptionAction = {
      ...mockSpellAction,
      description: 'This is a very long description that should be truncated because it exceeds the maximum allowed length for display in the action card component. It should end with three dots to indicate truncation.'
    }

    render(<ActionCard action={longDescriptionAction} />)

    const description = screen.getByText(/This is a very long description/)
    expect(description.textContent).toMatch(/\.\.\.$/)
    expect(description.textContent!.length).toBeLessThan(longDescriptionAction.description.length)
  })

  it('shows full description for short descriptions', () => {
    const shortDescriptionAction = {
      ...mockSpellAction,
      description: 'Short description'
    }

    render(<ActionCard action={shortDescriptionAction} />)
    expect(screen.getByText('Short description')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ActionCard action={mockSpellAction} className="custom-card" />)

    const card = screen.getByText('Fireball').closest('div')
    expect(card).toHaveClass('custom-card')
  })

  it('prevents event bubbling on edit button click', () => {
    const onSelect = vi.fn()
    const onEdit = vi.fn()

    render(
      <ActionCard
        action={mockSpellAction}
        showEditButton={true}
        onSelect={onSelect}
        onEdit={onEdit}
      />
    )

    fireEvent.click(screen.getByTitle('Edit action'))

    expect(onEdit).toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled() // Should not bubble to card click
  })
})
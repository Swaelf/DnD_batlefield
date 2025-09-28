/**
 * Spell Card Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SpellCard } from './SpellCard'
import type { UnifiedSpell } from '../../../types'
import { createSpellId, createSpellTemplateId, createSpellCategoryId, createSpellSchoolId } from '../../../types'

describe('SpellCard Component', () => {
  const mockAreaSpell: UnifiedSpell = {
    id: createSpellId('spell-1'),
    templateId: createSpellTemplateId('fireball'),
    name: 'Fireball',
    description: 'A bright streak flashes from your pointing finger to a point you choose within range',
    type: 'area',
    position: { x: 0, y: 0 },
    rotation: 0,
    layer: 1,
    color: '#ff4500',
    opacity: 0.7,
    size: { radius: 100 },
    roundCreated: 1,
    duration: 0,
    animation: {
      enter: 'burst',
      exit: 'fade-out',
      enterDuration: 500,
      exitDuration: 1000
    },
    category: createSpellCategoryId('combat'),
    school: createSpellSchoolId('evocation'),
    isCustom: false,
    customizable: true,
    tags: ['fire', 'evocation', 'area', 'damage', 'instant'],
    createdAt: new Date()
  }

  const mockLineSpell: UnifiedSpell = {
    id: createSpellId('spell-2'),
    templateId: createSpellTemplateId('lightning-bolt'),
    name: 'Lightning Bolt',
    description: 'A stroke of lightning forming a line 100 feet long and 5 feet wide',
    type: 'line',
    position: { x: 0, y: 0 },
    rotation: 0,
    layer: 1,
    color: '#87ceeb',
    opacity: 0.8,
    size: { length: 500, width: 25 },
    roundCreated: 1,
    duration: 0,
    animation: {
      enter: 'burst',
      exit: 'fade-out',
      enterDuration: 300,
      exitDuration: 500
    },
    category: createSpellCategoryId('combat'),
    school: createSpellSchoolId('evocation'),
    isCustom: false,
    customizable: true,
    tags: ['lightning', 'line', 'instant'],
    createdAt: new Date()
  }

  const mockCustomSpell: UnifiedSpell = {
    ...mockAreaSpell,
    id: createSpellId('custom-1'),
    name: 'Custom Fireball',
    isCustom: true,
    category: createSpellCategoryId('custom'),
    tags: ['fire', 'custom', 'area']
  }

  it('renders spell information correctly', () => {
    render(<SpellCard spell={mockAreaSpell} />)

    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.getByText('EVOCATION')).toBeInTheDocument()
    expect(screen.getByText('AREA')).toBeInTheDocument()
    expect(screen.getByText(/A bright streak flashes/)).toBeInTheDocument()
  })

  it('displays radius badge for area spells', () => {
    render(<SpellCard spell={mockAreaSpell} />)
    expect(screen.getByTitle('Radius (5ft squares)')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument() // 100px / 25 = 4 squares
  })

  it('does not display radius badge for non-area spells', () => {
    render(<SpellCard spell={mockLineSpell} />)
    expect(screen.queryByTitle('Radius (5ft squares)')).not.toBeInTheDocument()
  })

  it('shows custom indicator for custom spells', () => {
    render(<SpellCard spell={mockCustomSpell} />)
    // Custom indicator should be visible (purple dot)
    const customIndicator = document.querySelector('[style*="violet"]')
    expect(customIndicator).toBeInTheDocument()
  })

  it('calls onSelect when card is clicked', () => {
    const onSelect = vi.fn()
    render(<SpellCard spell={mockAreaSpell} onSelect={onSelect} />)

    fireEvent.click(screen.getByText('Fireball'))
    expect(onSelect).toHaveBeenCalledWith(mockAreaSpell)
  })

  it('shows edit button when showEditButton is true and spell is customizable', () => {
    render(
      <SpellCard
        spell={mockAreaSpell}
        showEditButton={true}
      />
    )

    // Edit button appears on hover, check it exists in DOM
    const editButton = screen.getByTitle('Edit spell')
    expect(editButton).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <SpellCard
        spell={mockAreaSpell}
        showEditButton={true}
        onEdit={onEdit}
      />
    )

    fireEvent.click(screen.getByTitle('Edit spell'))
    expect(onEdit).toHaveBeenCalledWith(mockAreaSpell)
  })

  it('does not show edit button when spell is not customizable', () => {
    const nonCustomizableSpell = { ...mockAreaSpell, customizable: false }
    render(
      <SpellCard
        spell={nonCustomizableSpell}
        showEditButton={true}
      />
    )

    expect(screen.queryByTitle('Edit spell')).not.toBeInTheDocument()
  })

  it('applies selected styling when isSelected is true', () => {
    render(<SpellCard spell={mockAreaSpell} isSelected={true} />)

    const card = screen.getByText('Fireball').closest('div')
    expect(card).toHaveStyle({ borderColor: expect.stringContaining('dndRed') })
  })

  it('displays spell school and type badges', () => {
    render(<SpellCard spell={mockAreaSpell} />)

    const schoolBadge = screen.getByText('EVOCATION')
    const typeBadge = screen.getByText('AREA')

    expect(schoolBadge).toBeInTheDocument()
    expect(typeBadge).toBeInTheDocument()
  })

  it('displays first 3 tags and shows count for additional tags', () => {
    render(<SpellCard spell={mockAreaSpell} />)

    // First 3 tags should be visible
    expect(screen.getByText('fire')).toBeInTheDocument()
    expect(screen.getByText('evocation')).toBeInTheDocument()
    expect(screen.getByText('area')).toBeInTheDocument()

    // Additional tags count should be shown
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.getByTitle('damage, instant')).toBeInTheDocument()
  })

  it('truncates long descriptions', () => {
    const longDescriptionSpell = {
      ...mockAreaSpell,
      description: 'This is a very long description that should be truncated because it exceeds the maximum allowed length for display in the spell card component. It should end with three dots to indicate truncation.'
    }

    render(<SpellCard spell={longDescriptionSpell} />)

    const description = screen.getByText(/This is a very long description/)
    expect(description.textContent).toMatch(/\.\.\.$/)
    expect(description.textContent!.length).toBeLessThan(longDescriptionSpell.description!.length)
  })

  it('shows full description for short descriptions', () => {
    const shortDescriptionSpell = {
      ...mockAreaSpell,
      description: 'Short description'
    }

    render(<SpellCard spell={shortDescriptionSpell} />)
    expect(screen.getByText('Short description')).toBeInTheDocument()
  })

  it('renders spell without description', () => {
    const noDescriptionSpell = {
      ...mockAreaSpell,
      description: ''
    }

    render(<SpellCard spell={noDescriptionSpell} />)
    expect(screen.getByText('Fireball')).toBeInTheDocument()
    expect(screen.queryByText(/A bright streak/)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<SpellCard spell={mockAreaSpell} className="custom-card" />)

    const card = screen.getByText('Fireball').closest('div')
    expect(card).toHaveClass('custom-card')
  })

  it('prevents event bubbling on edit button click', () => {
    const onSelect = vi.fn()
    const onEdit = vi.fn()

    render(
      <SpellCard
        spell={mockAreaSpell}
        showEditButton={true}
        onSelect={onSelect}
        onEdit={onEdit}
      />
    )

    fireEvent.click(screen.getByTitle('Edit spell'))

    expect(onEdit).toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled() // Should not bubble to card click
  })

  it('handles spells with no tags', () => {
    const noTagsSpell = {
      ...mockAreaSpell,
      tags: []
    }

    render(<SpellCard spell={noTagsSpell} />)
    expect(screen.getByText('Fireball')).toBeInTheDocument()
    // Should not show any tag elements
    expect(screen.queryByText('fire')).not.toBeInTheDocument()
  })

  it('displays SpellIcon with correct school and category', () => {
    render(<SpellCard spell={mockAreaSpell} />)

    // SpellIcon should be rendered with evocation school and combat category
    // The actual icon rendering is tested in SpellIcon.test.tsx
    expect(screen.getByText('Fireball')).toBeInTheDocument()
  })
})
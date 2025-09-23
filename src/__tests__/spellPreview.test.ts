import { describe, it, expect, beforeEach } from 'vitest'
import useEventCreationStore from '@/store/eventCreationStore'

describe('Spell Preview Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    useEventCreationStore.setState({
      isCreatingEvent: false,
      isPicking: null,
      selectedTokenId: null,
      fromPosition: null,
      toPosition: null,
      pathPreview: [],
      selectedSpell: undefined
    })
  })

  it('should update selected spell for preview', () => {
    const store = useEventCreationStore.getState()

    // Simulate selecting Fireball spell
    const fireballSpell = {
      type: 'spell' as const,
      spellName: 'Fireball',
      category: 'projectile-burst' as const,
      color: '#ff4500',
      size: 20,
      range: 150,
      duration: 2000,
      burstRadius: 20, // 20 ft radius burst
      persistDuration: 1
    }

    store.setSelectedSpell(fireballSpell)

    const updatedStore = useEventCreationStore.getState()
    expect(updatedStore.selectedSpell).toEqual(fireballSpell)
    expect(updatedStore.selectedSpell?.burstRadius).toBe(20)
  })

  it('should update positions for spell preview', () => {
    const store = useEventCreationStore.getState()

    // Set from position (caster position)
    store.setPosition('from', { x: 100, y: 100 })

    // Set to position (target position)
    store.setPosition('to', { x: 300, y: 300 })

    const updatedStore = useEventCreationStore.getState()
    expect(updatedStore.fromPosition).toEqual({ x: 100, y: 100 })
    expect(updatedStore.toPosition).toEqual({ x: 300, y: 300 })

    // Path preview should be updated
    expect(updatedStore.pathPreview).toHaveLength(2)
    expect(updatedStore.pathPreview[0]).toEqual({ x: 100, y: 100 })
    expect(updatedStore.pathPreview[1]).toEqual({ x: 300, y: 300 })
  })

  it('should enable position picking for spell targeting', () => {
    const store = useEventCreationStore.getState()

    // Start picking target position
    store.startPickingPosition('to')

    const updatedStore = useEventCreationStore.getState()
    expect(updatedStore.isPicking).toBe('to')

    // Complete position picking
    store.completePositionPicking()

    const finalStore = useEventCreationStore.getState()
    expect(finalStore.isPicking).toBe(null)
  })

  it('should clear spell selection when canceling event creation', () => {
    const store = useEventCreationStore.getState()

    // Set up a spell selection
    store.setSelectedSpell({
      type: 'spell' as const,
      spellName: 'Magic Missile',
      range: 120
    })
    store.setPosition('from', { x: 50, y: 50 })
    store.setPosition('to', { x: 150, y: 150 })

    // Cancel event creation
    store.cancelEventCreation()

    const clearedStore = useEventCreationStore.getState()
    expect(clearedStore.selectedSpell).toBeUndefined()
    expect(clearedStore.fromPosition).toBe(null)
    expect(clearedStore.toPosition).toBe(null)
    expect(clearedStore.pathPreview).toHaveLength(0)
  })
})
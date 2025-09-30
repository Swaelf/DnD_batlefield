import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { SpellEventData } from '@/types/timeline'

describe('Spell System', () => {
  beforeEach(() => {
    // Reset stores
    useMapStore.setState({
      currentMap: null,
      selectedObjects: [],
      mapVersion: 0
    })
    useTimelineStore.setState({
      timeline: null,
      currentEvent: 1,
      isInCombat: false,
      animationSpeed: 1
    })
  })

  it('should create a spell event when adding spell to timeline', () => {
    const { result: mapResult } = renderHook(() => useMapStore())
    const { result: roundResult } = renderHook(() => useTimelineStore())

    // Create a map
    act(() => {
      mapResult.current.createNewMap('Test Map')
    })

    // Start combat
    act(() => {
      const mapId = mapResult.current.currentMap?.id
      if (mapId) {
        roundResult.current.startCombat(mapId)
      }
    })

    // Add a spell event
    const spellData: SpellEventData = {
      type: 'spell',
      spellName: 'Fireball',
      category: 'projectile-burst',
      fromPosition: { x: 100, y: 100 },
      toPosition: { x: 300, y: 300 },
      color: '#ff4500',
      size: 20,
      duration: 1000
    }

    act(() => {
      roundResult.current.addAction(
        'void-token', // Using environment token
        'spell',
        spellData,
        2 // Schedule for event 2
      )
    })

    // Check event was added
    const timeline = roundResult.current.timeline
    expect(timeline).toBeDefined()
    expect(timeline?.events.length).toBeGreaterThan(0)

    const event2 = timeline?.events.find(e => e.number === 2)
    expect(event2).toBeDefined()
    expect(event2?.actions.length).toBe(1)
    expect(event2?.actions[0].type).toBe('spell')
  })

  it('should add spell object to map when spell event is processed', () => {
    const { result: mapResult } = renderHook(() => useMapStore())

    // Create a map
    act(() => {
      mapResult.current.createNewMap('Test Map')
    })

    // Add a spell effect
    const spellData: SpellEventData = {
      type: 'spell',
      spellName: 'Magic Missile',
      category: 'projectile',
      fromPosition: { x: 200, y: 200 },
      toPosition: { x: 400, y: 400 },
      color: '#9370db',
      size: 10,
      duration: 500
    }

    act(() => {
      mapResult.current.addSpellEffect({
        id: 'test-spell-1',
        type: 'spell',
        position: spellData.fromPosition,
        rotation: 0,
        layer: 100,
        isSpellEffect: true,
        roundCreated: 2,
        spellDuration: 0
      } as any)
    })

    // Check spell was added to map
    const map = mapResult.current.currentMap
    expect(map).toBeDefined()
    expect(map?.objects.length).toBeGreaterThan(1) // Should have void token + spell

    const spellObject = map?.objects.find(obj => obj.type === 'spell')
    expect(spellObject).toBeDefined()
    expect(spellObject?.id).toBe('test-spell-1')
  })

  it('should handle environment caster for spells', () => {
    const { result: mapResult } = renderHook(() => useMapStore())

    // Create a map
    act(() => {
      mapResult.current.createNewMap('Test Map')
    })

    // Check void token was created
    const map = mapResult.current.currentMap
    expect(map).toBeDefined()

    const voidToken = map?.objects.find(obj => obj.id === 'void-token')
    expect(voidToken).toBeDefined()
    expect((voidToken as any)?.isVoid).toBe(true)
    expect(voidToken?.visible).toBe(false)
    expect((voidToken as any)?.allowedEvents).toContain('spell')
  })

  it('should clean up expired spells', () => {
    const { result: mapResult } = renderHook(() => useMapStore())

    // Create a map
    act(() => {
      mapResult.current.createNewMap('Test Map')
    })

    // Add a spell with no duration (instant spells are kept, handled by animation)
    act(() => {
      mapResult.current.addSpellEffect({
        id: 'temp-spell-1',
        type: 'spell',
        position: { x: 100, y: 100 },
        rotation: 0,
        layer: 100,
        isSpellEffect: true,
        roundCreated: 1,
        spellDuration: 0 // Instant spell
      } as any)
    })

    // Check spell was added
    let spellObject = mapResult.current.currentMap?.objects.find(
      obj => obj.id === 'temp-spell-1'
    )
    expect(spellObject).toBeDefined()

    // Clean up expired spells for round 2
    act(() => {
      mapResult.current.cleanupExpiredSpells(2)
    })

    // Instant spells (duration 0) are kept - handled by animation timeout
    spellObject = mapResult.current.currentMap?.objects.find(
      obj => obj.id === 'temp-spell-1'
    )
    expect(spellObject).toBeDefined() // Should still be there
  })

  it('should preserve persistent area spells across rounds', () => {
    const { result: mapResult } = renderHook(() => useMapStore())

    // Create a map
    act(() => {
      mapResult.current.createNewMap('Test Map')
    })

    // Add a persistent spell
    act(() => {
      mapResult.current.addSpellEffect({
        id: 'persistent-spell-1',
        type: 'spell',
        position: { x: 200, y: 200 },
        rotation: 0,
        layer: 100,
        isSpellEffect: true,
        roundCreated: 1,
        spellDuration: 3
      } as any)
    })

    // Check spell exists
    let spellObject = mapResult.current.currentMap?.objects.find(
      obj => obj.id === 'persistent-spell-1'
    )
    expect(spellObject).toBeDefined()

    // Clean up at round 2 - spell should still exist
    act(() => {
      mapResult.current.cleanupExpiredSpells(2)
    })

    spellObject = mapResult.current.currentMap?.objects.find(
      obj => obj.id === 'persistent-spell-1'
    )
    expect(spellObject).toBeDefined()

    // Clean up at round 4 - spell should be removed
    act(() => {
      mapResult.current.cleanupExpiredSpells(4)
    })

    spellObject = mapResult.current.currentMap?.objects.find(
      obj => obj.id === 'persistent-spell-1'
    )
    expect(spellObject).toBeUndefined()
  })
})
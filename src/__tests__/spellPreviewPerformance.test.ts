import { describe, it, expect, beforeEach } from 'vitest'
import useEventCreationStore from '@/store/eventCreationStore'

// Performance test utilities
const measurePerformance = (fn: () => void, iterations = 100) => {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = performance.now()
  return end - start
}

describe('Spell Preview Performance', () => {
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

  it('should handle rapid position updates efficiently', () => {
    const store = useEventCreationStore.getState()

    // Set up initial spell state
    store.setSelectedSpell({
      type: 'spell' as const,
      spellName: 'Fireball',
      category: 'projectile-burst' as const,
      color: '#ff4500',
      size: 20,
      range: 150,
      duration: 2000,
      burstRadius: 100,
      persistDuration: 1
    })
    store.setPosition('from', { x: 100, y: 100 })
    store.startPickingPosition('to')

    // Measure rapid position updates (simulating mouse movement)
    const rapidUpdates = () => {
      for (let i = 0; i < 10; i++) {
        store.setPosition('to', { x: 100 + i * 10, y: 100 + i * 10 })
      }
    }

    const executionTime = measurePerformance(rapidUpdates, 10)

    // Should complete rapid updates in reasonable time (< 50ms for 100 iterations)
    expect(executionTime).toBeLessThan(50)
  })

  it('should calculate spell range efficiently', () => {
    const calculateDistance = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2))
    }

    const from = { x: 0, y: 0 }
    const to = { x: 100, y: 100 }

    const executionTime = measurePerformance(() => {
      calculateDistance(from, to)
    }, 1000)

    // Distance calculation should be very fast (< 5ms for 1000 iterations)
    expect(executionTime).toBeLessThan(5)
  })

  it('should handle complex spell calculations efficiently', () => {
    const complexSpellCalculation = () => {
      const fromPosition = { x: 100, y: 100 }
      const toPosition = { x: 300, y: 300 }
      const gridSize = 50
      const spellRange = 150

      // Distance calculation
      const distance = Math.sqrt(
        Math.pow(toPosition.x - fromPosition.x, 2) +
        Math.pow(toPosition.y - fromPosition.y, 2)
      )

      // Range conversion
      const distanceInFeet = Math.round(distance / gridSize * 5)
      const spellRangeInPixels = (spellRange / 5) * gridSize

      // Range check
      const isInRange = distance <= spellRangeInPixels

      // Angle calculation
      const angle = Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x) * 180 / Math.PI

      return { distance, distanceInFeet, spellRangeInPixels, isInRange, angle }
    }

    const executionTime = measurePerformance(complexSpellCalculation, 1000)

    // Complex calculations should complete quickly (< 20ms for 1000 iterations)
    expect(executionTime).toBeLessThan(20)
  })

  it('should minimize store subscription updates', () => {
    const store = useEventCreationStore.getState()
    let subscriptionCallCount = 0

    // Subscribe to store changes
    const unsubscribe = useEventCreationStore.subscribe(() => {
      subscriptionCallCount++
    })

    // Set up spell preview state
    store.setSelectedSpell({
      type: 'spell' as const,
      spellName: 'Magic Missile',
      range: 120
    })

    store.setPosition('from', { x: 50, y: 50 })
    store.startPickingPosition('to')

    // Simulate mouse movement (multiple position updates)
    for (let i = 0; i < 10; i++) {
      store.setPosition('to', { x: 50 + i * 5, y: 50 + i * 5 })
    }

    // Clean up
    unsubscribe()

    // Should have reasonable number of subscription calls
    // Initial spell setup (2) + position picking (1) + position updates (10) = 13
    expect(subscriptionCallCount).toBeLessThanOrEqual(15)
    expect(subscriptionCallCount).toBeGreaterThan(10) // Ensure updates are happening
  })

  it('should handle spell data memoization correctly', () => {
    const store = useEventCreationStore.getState()

    const spellData = {
      type: 'spell' as const,
      spellName: 'Lightning Bolt',
      category: 'line' as const,
      color: '#87CEEB',
      range: 100,
      lineWidth: 5,
      duration: 1000
    }

    // Set spell data multiple times with same values
    const memoizationTest = () => {
      store.setSelectedSpell(spellData)
      store.setSelectedSpell(spellData) // Same data - should be memoized
      store.setSelectedSpell(spellData) // Same data - should be memoized
    }

    const executionTime = measurePerformance(memoizationTest, 100)

    // Memoized updates should be very fast (< 10ms for 100 iterations)
    expect(executionTime).toBeLessThan(10)

    // Verify the spell is set correctly
    const finalState = useEventCreationStore.getState()
    expect(finalState.selectedSpell?.spellName).toBe('Lightning Bolt')
  })
})

// Benchmark test (optional - for development profiling)
describe('Spell Preview Benchmarks', () => {
  it('should benchmark different spell types', () => {
    const spellTypes = [
      { name: 'Fireball', category: 'projectile-burst', burstRadius: 100 },
      { name: 'Lightning Bolt', category: 'line', lineWidth: 5 },
      { name: 'Cone of Cold', category: 'cone', range: 60 },
      { name: 'Magic Missile', category: 'projectile', range: 120 }
    ]

    const results: { [key: string]: number } = {}

    spellTypes.forEach(spell => {
      const store = useEventCreationStore.getState()
      store.setSelectedSpell({
        type: 'spell' as const,
        spellName: spell.name,
        ...spell,
        category: spell.category as any
      })

      const executionTime = measurePerformance(() => {
        store.setPosition('from', { x: 100, y: 100 })
        store.setPosition('to', { x: 200, y: 200 })
      }, 100)

      results[spell.name] = executionTime
    })

    // All spell types should perform reasonably (< 100ms for 100 iterations in test environment)
    // Note: Test environment has overhead, real-world performance is significantly better
    Object.values(results).forEach(time => {
      expect(time).toBeLessThan(100)
    })

    console.log('Spell Performance Results:', results)
  })
})
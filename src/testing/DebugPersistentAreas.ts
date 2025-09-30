import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'

/**
 * Debug utility for persistent area cleanup issues
 */
export function debugPersistentAreas() {
  const mapStore = useMapStore.getState()
  const roundStore = useTimelineStore.getState()

  console.log('=== PERSISTENT AREAS DEBUG ===')
  console.log('Current Round:', roundStore.currentEvent)

  const allObjects = mapStore.currentMap?.objects || []
  const persistentAreas = allObjects.filter(obj => obj.type === 'persistent-area')
  const spellEffects = allObjects.filter(obj => obj.isSpellEffect)

  console.log('Total Map Objects:', allObjects.length)
  console.log('Persistent Areas:', persistentAreas.length)
  console.log('Spell Effects (with isSpellEffect flag):', spellEffects.length)

  persistentAreas.forEach(area => {
    console.log('\n--- Persistent Area ---')
    console.log('ID:', area.id)
    console.log('Has isSpellEffect flag:', area.isSpellEffect === true)
    console.log('Round Created:', area.roundCreated)
    console.log('Spell Duration:', area.spellDuration)
    console.log('Current Round:', roundStore.currentEvent)

    if (area.roundCreated !== undefined && area.spellDuration !== undefined) {
      const expiresAt = area.roundCreated + area.spellDuration
      const shouldBeRemoved = roundStore.currentEvent >= expiresAt
      console.log('Expires at round:', expiresAt)
      console.log('Should be removed:', shouldBeRemoved)
    } else {
      console.log('Missing roundCreated or spellDuration!')
    }

    console.log('Full object:', area)
  })

  console.log('\n=== TESTING CLEANUP FUNCTION ===')
  console.log('Before cleanup - persistent areas:', persistentAreas.length)

  // Test the cleanup function
  mapStore.cleanupExpiredSpells(roundStore.currentEvent)

  const areasAfterCleanup = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
  console.log('After cleanup - persistent areas:', areasAfterCleanup.length)

  if (areasAfterCleanup.length === persistentAreas.length) {
    console.log('⚠️ No areas were removed!')
    console.log('Checking why...')

    persistentAreas.forEach(area => {
      const hasSpellEffect = area.isSpellEffect === true
      const hasDuration = area.spellDuration !== undefined
      const hasRoundCreated = area.roundCreated !== undefined

      console.log(`Area ${area.id}:`)
      console.log('  - Has isSpellEffect:', hasSpellEffect)
      console.log('  - Has spellDuration:', hasDuration)
      console.log('  - Has roundCreated:', hasRoundCreated)

      if (!hasSpellEffect) {
        console.log('  ❌ Missing isSpellEffect flag!')
      }
      if (!hasDuration) {
        console.log('  ❌ Missing spellDuration!')
      }
      if (!hasRoundCreated) {
        console.log('  ❌ Missing roundCreated!')
      }
    })
  }
}

// Make it available in window for console access
if (typeof window !== 'undefined') {
  (window as any).debugPersistentAreas = debugPersistentAreas
}

export function testFireballCleanup() {
  const mapStore = useMapStore.getState()
  const roundStore = useTimelineStore.getState()

  console.log('=== TESTING FIREBALL CLEANUP ===')

  // Start combat if not already started
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
    console.log('Started combat at round', roundStore.currentEvent)
  }

  // Create a test persistent area for Fireball
  const testArea = {
    id: `test-fireball-${Date.now()}`,
    type: 'persistent-area' as const,
    position: { x: 500, y: 300 },
    rotation: 0,
    layer: 0,
    isSpellEffect: true, // Important!
    persistentAreaData: {
      position: { x: 500, y: 300 },
      radius: 40,
      color: '#ff4500',
      opacity: 0.3,
      spellName: 'Fireball Test',
      roundCreated: roundStore.currentEvent
    },
    roundCreated: roundStore.currentEvent,
    spellDuration: 1 // Should last 1 round
  }

  mapStore.addSpellEffect(testArea)
  console.log('Added Fireball area at round', roundStore.currentEvent)
  console.log('Should expire at round', roundStore.currentEvent + 1)

  // Check it exists
  const exists = mapStore.currentMap?.objects.some(obj => obj.id === testArea.id)
  console.log('Area exists after creation:', exists)

  // Advance round
  console.log('Advancing to next round...')
  roundStore.nextEvent()

  setTimeout(() => {
    console.log('Current round after advance:', roundStore.currentEvent)

    // Check if it's removed
    const stillExists = mapStore.currentMap?.objects.some(obj => obj.id === testArea.id)
    console.log('Area still exists after round advance:', stillExists)

    if (stillExists) {
      console.log('❌ FAILED: Area was not removed!')
      debugPersistentAreas()
    } else {
      console.log('✅ SUCCESS: Area was properly removed!')
    }
  }, 100)
}

// Make test function available in console
if (typeof window !== 'undefined') {
  (window as any).testFireballCleanup = testFireballCleanup
}
import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'

/**
 * Quick test to verify persistent area cleanup is working
 */
export async function quickTestPersistence() {
  console.log('=== QUICK PERSISTENCE TEST ===')

  const mapStore = useMapStore.getState()
  const roundStore = useTimelineStore.getState()

  // Ensure we have a map
  if (!mapStore.currentMap) {
    mapStore.createNewMap('Test Map')
  }

  // Start combat
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }

  const startRound = roundStore.currentEvent
  console.log('Starting at round', startRound)

  // Create test persistent areas
  const fireballArea = {
    id: 'test-fireball',
    type: 'persistent-area' as const,
    position: { x: 300, y: 300 },
    rotation: 0,
    layer: 0,
    isSpellEffect: true,
    persistentAreaData: {
      position: { x: 300, y: 300 },
      radius: 40,
      color: '#ff4500',
      opacity: 0.3,
      spellName: 'Fireball',
      roundCreated: startRound
    },
    roundCreated: startRound,
    spellDuration: 1 // Lasts 1 round
  }

  const darknessArea = {
    id: 'test-darkness',
    type: 'persistent-area' as const,
    position: { x: 500, y: 300 },
    rotation: 0,
    layer: 0,
    isSpellEffect: true,
    persistentAreaData: {
      position: { x: 500, y: 300 },
      radius: 60,
      color: '#000000',
      opacity: 0.8,
      spellName: 'Darkness',
      roundCreated: startRound
    },
    roundCreated: startRound,
    spellDuration: 3 // Lasts 3 rounds
  }

  // Add both areas
  mapStore.addSpellEffect(fireballArea)
  mapStore.addSpellEffect(darknessArea)

  console.log('Added Fireball (1 round) and Darkness (3 rounds)')

  // Verify they exist
  let fireballExists = mapStore.currentMap!.objects.some(obj => obj.id === 'test-fireball')
  let darknessExists = mapStore.currentMap!.objects.some(obj => obj.id === 'test-darkness')
  console.log(`Round ${startRound}: Fireball=${fireballExists}, Darkness=${darknessExists}`)

  // Advance to next round
  await roundStore.nextEvent()
  await new Promise(resolve => setTimeout(resolve, 100))

  // Check after round 2
  fireballExists = mapStore.currentMap!.objects.some(obj => obj.id === 'test-fireball')
  darknessExists = mapStore.currentMap!.objects.some(obj => obj.id === 'test-darkness')
  console.log(`Round ${roundStore.currentEvent}: Fireball=${fireballExists}, Darkness=${darknessExists}`)

  if (fireballExists) {
    console.error('❌ ERROR: Fireball should be removed after 1 round!')
  } else {
    console.log('✅ Fireball correctly removed')
  }

  if (!darknessExists) {
    console.error('❌ ERROR: Darkness should still exist!')
  } else {
    console.log('✅ Darkness correctly persists')
  }

  // Advance 2 more rounds to test Darkness removal
  await roundStore.nextEvent()
  await roundStore.nextEvent()
  await new Promise(resolve => setTimeout(resolve, 100))

  // Check after round 4
  darknessExists = mapStore.currentMap!.objects.some(obj => obj.id === 'test-darkness')
  console.log(`Round ${roundStore.currentEvent}: Darkness=${darknessExists}`)

  if (darknessExists) {
    console.error('❌ ERROR: Darkness should be removed after 3 rounds!')
  } else {
    console.log('✅ Darkness correctly removed after 3 rounds')
  }

  console.log('=== TEST COMPLETE ===')

  // Clean up test objects
  mapStore.deleteObject('test-fireball')
  mapStore.deleteObject('test-darkness')
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).quickTestPersistence = quickTestPersistence
}

// Export for use in other tests
export default quickTestPersistence
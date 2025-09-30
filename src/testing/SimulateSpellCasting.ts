import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'
import type { SpellEventData } from '@/types/timeline'

/**
 * Simulate the exact flow of spell casting to find the issue
 */
export async function simulateSpellCasting() {
  console.log('\n🎮 SIMULATING ACTUAL SPELL CASTING FLOW\n')

  const mapStore = useMapStore.getState()
  const roundStore = useTimelineStore.getState()

  // Setup
  if (!mapStore.currentMap) {
    mapStore.createNewMap('Test Map')
  }

  // Clear existing
  const existing = mapStore.currentMap!.objects.filter(obj =>
    obj.type === 'persistent-area' || obj.type === 'spell'
  )
  existing.forEach(obj => mapStore.deleteObject(obj.id))

  // Start combat
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }
  roundStore.goToEvent(1)

  console.log('📍 Starting at round', roundStore.currentEvent)

  console.log('\n🎯 STEP 1: Simulating Fireball Spell Cast')
  console.log('─'.repeat(40))

  // This simulates what happens when a spell is cast through the UI
  const fireballSpellData: SpellEventData = {
    type: 'spell',
    spellName: 'Fireball',
    category: 'projectile-burst',
    fromPosition: { x: 200, y: 300 },
    toPosition: { x: 500, y: 300 },
    color: '#ff4500',
    size: 20,
    duration: 500, // Animation duration in ms
    persistDuration: 1, // Persist for 1 round
    burstRadius: 40,
    roundCreated: roundStore.currentEvent
  }

  // Create initial spell object (what useTokenAnimation does)
  const spellId = `spell-fireball-${Date.now()}`
  const spellObject = {
    id: spellId,
    type: 'spell' as const,
    position: fireballSpellData.fromPosition,
    rotation: 0,
    layer: 100,
    isSpellEffect: true,
    spellData: fireballSpellData,
    roundCreated: roundStore.currentEvent,
    spellDuration: 0 // Initial spell doesn't persist
  }

  console.log('Creating spell object:')
  console.log('  type:', spellObject.type)
  console.log('  isSpellEffect:', spellObject.isSpellEffect)
  console.log('  roundCreated:', spellObject.roundCreated)
  console.log('  spellDuration:', spellObject.spellDuration)

  mapStore.addSpellEffect(spellObject)

  console.log('\n🔥 STEP 2: Simulating Persistent Area Creation')
  console.log('─'.repeat(40))
  console.log('(This happens after projectile-burst animation completes)')

  // Simulate what happens after the spell animation completes
  // This is what useTokenAnimation does for projectile-burst with persistDuration > 0
  await new Promise(resolve => setTimeout(resolve, 100))

  const persistentAreaId = `${spellId}-persistent`
  const persistentAreaObject = {
    id: persistentAreaId,
    type: 'persistent-area' as const,
    position: fireballSpellData.toPosition,
    rotation: 0,
    layer: 0, // Below tokens
    isSpellEffect: true, // CRITICAL!
    persistentAreaData: {
      position: fireballSpellData.toPosition,
      radius: fireballSpellData.burstRadius || 40,
      color: fireballSpellData.color,
      opacity: 0.3,
      spellName: 'Fireball',
      roundCreated: roundStore.currentEvent
    },
    roundCreated: roundStore.currentEvent,
    spellDuration: fireballSpellData.persistDuration || 1
  }

  console.log('Creating persistent area:')
  console.log('  type:', persistentAreaObject.type)
  console.log('  isSpellEffect:', persistentAreaObject.isSpellEffect)
  console.log('  roundCreated:', persistentAreaObject.roundCreated)
  console.log('  spellDuration:', persistentAreaObject.spellDuration)

  mapStore.addSpellEffect(persistentAreaObject)

  // Remove the initial spell object (animation complete)
  mapStore.deleteObject(spellId)

  console.log('\n✅ Spell cast complete')
  console.log('Persistent area should exist for 1 round')

  console.log('\n🔍 STEP 3: Verifying Persistent Area')
  console.log('─'.repeat(40))

  const areas = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
  console.log('Persistent areas in map:', areas.length)

  if (areas.length > 0) {
    const area = areas[0]
    console.log('\nPersistent area properties:')
    console.log('  id:', area.id)
    console.log('  isSpellEffect:', area.isSpellEffect)
    console.log('  roundCreated:', area.roundCreated)
    console.log('  spellDuration:', area.spellDuration)

    const willExpireAt = (area.roundCreated || 0) + (area.spellDuration || 0)
    console.log('  Will expire at round:', willExpireAt)
  }

  console.log('\n⏭️ STEP 4: Advancing to Round 2')
  console.log('─'.repeat(40))

  console.log('Current round before advance:', roundStore.currentEvent)

  // Check if nextRound is properly connected
  console.log('\nChecking nextRound implementation...')
  const nextRoundFn = roundStore.nextRound.toString()
  const hasCleanupCall = nextRoundFn.includes('cleanupExpiredSpells')
  console.log('nextRound calls cleanupExpiredSpells:', hasCleanupCall ? '✅ YES' : '❌ NO')

  await roundStore.nextEvent()
  await new Promise(resolve => setTimeout(resolve, 200))

  console.log('Current round after advance:', roundStore.currentEvent)

  console.log('\n🎯 STEP 5: Checking if Persistent Area was Removed')
  console.log('─'.repeat(40))

  const areasAfterAdvance = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
  console.log('Persistent areas after round advance:', areasAfterAdvance.length)

  if (areasAfterAdvance.length > 0) {
    console.log('\n❌ PERSISTENT AREA STILL EXISTS!')

    const area = areasAfterAdvance[0]
    console.log('\nArea that should have been removed:')
    console.log('  id:', area.id)
    console.log('  spellName:', area.persistentAreaData?.spellName)
    console.log('  roundCreated:', area.roundCreated)
    console.log('  spellDuration:', area.spellDuration)
    console.log('  currentEvent:', roundStore.currentEvent)

    const shouldBeRemoved = roundStore.currentEvent >= (area.roundCreated || 0) + (area.spellDuration || 0)
    console.log('  Should be removed:', shouldBeRemoved)

    // Try manual cleanup
    console.log('\n🔧 Trying manual cleanup...')
    mapStore.cleanupExpiredSpells(roundStore.currentEvent)

    const areasAfterManual = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
    console.log('Areas after manual cleanup:', areasAfterManual.length)

    if (areasAfterManual.length === 0) {
      console.log('✅ Manual cleanup worked!')
      console.log('➡️ Issue: Automatic cleanup not being called on round advance')
    } else {
      console.log('❌ Even manual cleanup failed!')
      console.log('➡️ Issue: Cleanup logic itself is broken')
    }
  } else {
    console.log('✅ PERSISTENT AREA CORRECTLY REMOVED!')
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 SIMULATION COMPLETE')
  console.log('='.repeat(60))

  // Cleanup
  const allTestObjects = mapStore.currentMap?.objects.filter(obj =>
    obj.id.includes('fireball') || obj.type === 'persistent-area'
  ) || []
  allTestObjects.forEach(obj => mapStore.deleteObject(obj.id))
}

/**
 * Test the cleanup function in isolation
 */
export function testCleanupFunction() {
  console.log('\n🧪 TESTING CLEANUP FUNCTION IN ISOLATION\n')

  const mapStore = useMapStore.getState()
  const roundStore = useTimelineStore.getState()

  // Ensure map exists
  if (!mapStore.currentMap) {
    mapStore.createNewMap('Test Map')
  }

  // Set to round 5 for testing
  roundStore.goToEvent(5)

  // Create test areas with different expiration rounds
  const testAreas = [
    { id: 'expire-r3', roundCreated: 1, spellDuration: 2 }, // Expires at round 3
    { id: 'expire-r5', roundCreated: 2, spellDuration: 3 }, // Expires at round 5
    { id: 'expire-r7', roundCreated: 3, spellDuration: 4 }, // Expires at round 7
  ]

  console.log('Current round:', roundStore.currentEvent)
  console.log('\nCreating test areas:')

  testAreas.forEach(test => {
    const area = {
      id: test.id,
      type: 'persistent-area' as const,
      position: { x: 100, y: 100 },
      rotation: 0,
      layer: 0,
      isSpellEffect: true,
      roundCreated: test.roundCreated,
      spellDuration: test.spellDuration,
      persistentAreaData: {
        position: { x: 100, y: 100 },
        radius: 30,
        color: '#000',
        opacity: 0.3,
        spellName: test.id,
        roundCreated: test.roundCreated
      }
    }

    mapStore.addSpellEffect(area)

    const expiresAt = test.roundCreated + test.spellDuration
    const shouldBeRemoved = roundStore.currentEvent >= expiresAt
    console.log(`  ${test.id}: expires at round ${expiresAt} - should remove: ${shouldBeRemoved}`)
  })

  console.log('\n🔧 Calling cleanupExpiredSpells...')
  mapStore.cleanupExpiredSpells(roundStore.currentEvent)

  console.log('\n📊 Results:')
  testAreas.forEach(test => {
    const stillExists = mapStore.currentMap?.objects.some(obj => obj.id === test.id)
    const expiresAt = test.roundCreated + test.spellDuration
    const shouldExist = roundStore.currentEvent < expiresAt
    const correct = stillExists === shouldExist

    console.log(`  ${test.id}: ${stillExists ? 'exists' : 'removed'} - ${correct ? '✅ CORRECT' : '❌ WRONG'}`)
  })

  // Cleanup
  testAreas.forEach(test => mapStore.deleteObject(test.id))
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).simulateSpellCasting = simulateSpellCasting
  (window as any).testCleanupFunction = testCleanupFunction
  (window as any).simulate = simulateSpellCasting
}
import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'

/**
 * Test specifically for Fireball's persistent burn area issue
 */
export async function testFireballBurnArea() {
  console.log('\n🔥 TESTING FIREBALL BURN AREA PERSISTENCE\n')
  console.log('Expected: Burn area should last exactly 1 round')
  console.log('=' .repeat(50))

  const mapStore = useMapStore.getState()
  const roundStore = useTimelineStore.getState()

  // Setup
  if (!mapStore.currentMap) {
    mapStore.createNewMap('Test Map')
  }

  // Clear any existing persistent areas
  const existing = mapStore.currentMap!.objects.filter(obj =>
    obj.type === 'persistent-area' || obj.type === 'spell'
  )
  existing.forEach(obj => mapStore.deleteObject(obj.id))

  // Start combat
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }

  // Start at round 1
  roundStore.goToEvent(1)
  const startRound = roundStore.currentEvent
  console.log('📍 Starting at round:', startRound)

  // Simulate what happens when Fireball creates its burn area after burst
  console.log('\n1️⃣ Creating Fireball burn area (like after projectile burst)')

  const burnAreaId = `fireball-burn-${Date.now()}`
  const burnArea = {
    id: burnAreaId,
    type: 'persistent-area' as const,
    position: { x: 500, y: 300 },
    rotation: 0,
    layer: 0,
    isSpellEffect: true,
    persistentAreaData: {
      position: { x: 500, y: 300 },
      radius: 40,
      color: '#ff4500',
      opacity: 0.3,
      spellName: 'Fireball',
      roundCreated: startRound
    },
    roundCreated: startRound,
    spellDuration: 1  // Should last 1 round
  }

  console.log('\n📋 Burn area properties:')
  console.log('  id:', burnArea.id)
  console.log('  type:', burnArea.type)
  console.log('  isSpellEffect:', burnArea.isSpellEffect)
  console.log('  roundCreated:', burnArea.roundCreated)
  console.log('  spellDuration:', burnArea.spellDuration)
  console.log('  Should expire at round:', startRound + 1)

  // Add using addSpellEffect (same as the actual code)
  mapStore.addSpellEffect(burnArea)

  // Verify it was added correctly
  const addedArea = mapStore.currentMap?.objects.find(obj => obj.id === burnAreaId)

  if (!addedArea) {
    console.log('\n❌ ERROR: Burn area was not added to map!')
    return
  }

  console.log('\n✅ Burn area added to map')
  console.log('Stored object properties:')
  console.log('  isSpellEffect:', addedArea.isSpellEffect)
  console.log('  roundCreated:', addedArea.roundCreated)
  console.log('  spellDuration:', addedArea.spellDuration)

  // Check if properties were preserved
  if (!addedArea.isSpellEffect || addedArea.roundCreated === undefined || addedArea.spellDuration === undefined) {
    console.log('\n⚠️ WARNING: Critical properties missing!')
    if (!addedArea.isSpellEffect) console.log('  - Missing isSpellEffect')
    if (addedArea.roundCreated === undefined) console.log('  - Missing roundCreated')
    if (addedArea.spellDuration === undefined) console.log('  - Missing spellDuration')
  }

  console.log('\n2️⃣ Testing at round', startRound)
  let exists = mapStore.currentMap?.objects.some(obj => obj.id === burnAreaId)
  console.log(`  Burn area exists: ${exists ? '✅ YES (correct)' : '❌ NO (wrong)'}`)

  console.log('\n3️⃣ Advancing to round', startRound + 1)

  // Log what nextRound should do
  console.log('  Calling roundStore.nextEvent()...')

  await roundStore.nextEvent()
  await new Promise(resolve => setTimeout(resolve, 200))

  const currentEvent = roundStore.currentEvent
  console.log('  Now at round:', currentEvent)

  // Check if burn area still exists
  exists = mapStore.currentMap?.objects.some(obj => obj.id === burnAreaId)
  console.log(`  Burn area exists: ${exists ? '❌ YES (WRONG!)' : '✅ NO (correct)'}`)

  if (exists) {
    console.log('\n🔍 INVESTIGATING WHY BURN AREA WASN\'T REMOVED')

    const stillThere = mapStore.currentMap?.objects.find(obj => obj.id === burnAreaId)
    if (stillThere) {
      console.log('\nBurn area still in store:')
      console.log('  roundCreated:', stillThere.roundCreated)
      console.log('  spellDuration:', stillThere.spellDuration)
      console.log('  currentEvent:', currentEvent)
      console.log('  Should remove:', currentEvent >= (stillThere.roundCreated || 0) + (stillThere.spellDuration || 0))
    }

    // Try manual cleanup
    console.log('\n🔧 Trying manual cleanup...')
    console.log('  Calling cleanupExpiredSpells(' + currentEvent + ')')

    // Log objects before cleanup
    const beforeCleanup = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area').length || 0
    console.log('  Persistent areas before cleanup:', beforeCleanup)

    mapStore.cleanupExpiredSpells(currentEvent)

    const afterCleanup = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area').length || 0
    console.log('  Persistent areas after cleanup:', afterCleanup)

    exists = mapStore.currentMap?.objects.some(obj => obj.id === burnAreaId)
    console.log(`  Burn area after manual cleanup: ${exists ? '❌ STILL EXISTS' : '✅ REMOVED'}`)

    if (!exists) {
      console.log('\n💡 DIAGNOSIS: Manual cleanup works, but automatic cleanup on nextRound is not working')
    } else {
      console.log('\n💡 DIAGNOSIS: Cleanup function itself is not working properly')
    }
  } else {
    console.log('\n✅ SUCCESS: Burn area was correctly removed after 1 round!')
  }

  console.log('\n4️⃣ Testing multiple rounds to ensure it doesn\'t come back')

  await roundStore.nextEvent()
  await new Promise(resolve => setTimeout(resolve, 100))

  exists = mapStore.currentMap?.objects.some(obj => obj.id === burnAreaId)
  console.log(`  Round ${roundStore.currentEvent}: Burn area exists: ${exists ? '❌ YES' : '✅ NO'}`)

  console.log('\n' + '='.repeat(50))
  console.log('TEST COMPLETE')
  console.log('='.repeat(50))

  // Cleanup
  mapStore.deleteObject(burnAreaId)
}

/**
 * Test the exact cleanup condition
 */
export function testCleanupCondition() {
  console.log('\n🔬 TESTING CLEANUP CONDITION LOGIC\n')

  const testCases = [
    { round: 1, created: 1, duration: 1, shouldRemove: false, desc: 'Same round as created' },
    { round: 2, created: 1, duration: 1, shouldRemove: true, desc: 'One round after (expires)' },
    { round: 3, created: 1, duration: 1, shouldRemove: true, desc: 'Two rounds after' },
    { round: 2, created: 1, duration: 2, shouldRemove: false, desc: 'Not expired yet' },
    { round: 3, created: 1, duration: 2, shouldRemove: true, desc: 'Expires at round 3' },
  ]

  console.log('Cleanup condition: currentEvent >= roundCreated + spellDuration')
  console.log('')

  testCases.forEach(test => {
    const expiresAt = test.created + test.duration
    const shouldRemove = test.round >= expiresAt
    const correct = shouldRemove === test.shouldRemove

    console.log(`Round ${test.round}, Created ${test.created}, Duration ${test.duration}:`)
    console.log(`  Expires at round ${expiresAt}`)
    console.log(`  Should remove: ${shouldRemove} (expected: ${test.shouldRemove}) ${correct ? '✅' : '❌'}`)
    console.log(`  ${test.desc}`)
    console.log('')
  })
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).testFireballBurnArea = testFireballBurnArea
  (window as any).testCleanupCondition = testCleanupCondition
  (window as any).testFireball = testFireballBurnArea
}
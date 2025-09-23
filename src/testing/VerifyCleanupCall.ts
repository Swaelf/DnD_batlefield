import useMapStore from '@/store/mapStore'
import useRoundStore from '@/store/roundStore'

/**
 * Verify that cleanup is actually being called when rounds advance
 */
export async function verifyCleanupCall() {
  console.log('\n🔍 VERIFYING CLEANUP FUNCTION CALLS\n')

  const mapStore = useMapStore.getState()
  const roundStore = useRoundStore.getState()

  // Setup
  if (!mapStore.currentMap) {
    mapStore.createNewMap('Test Map')
  }

  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }

  roundStore.goToRound(1)

  // Monkey-patch the cleanup function to log calls
  const originalCleanup = mapStore.cleanupExpiredSpells
  let cleanupCallCount = 0
  let lastCleanupRound = -1

  // Create a wrapped version that logs
  const wrappedCleanup = function(this: any, round: number) {
    cleanupCallCount++
    lastCleanupRound = round
    console.log(`  🧹 cleanupExpiredSpells called! Count: ${cleanupCallCount}, Round: ${round}`)

    // Log what's being cleaned
    const before = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area').length || 0

    // Call original
    const result = originalCleanup.call(this, round)

    const after = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area').length || 0
    console.log(`     Persistent areas: ${before} -> ${after} (removed: ${before - after})`)

    return result
  }

  // Replace with wrapped version
  mapStore.cleanupExpiredSpells = wrappedCleanup

  console.log('📋 Initial state:')
  console.log('  Current round:', roundStore.currentRound)
  console.log('  Cleanup calls so far:', cleanupCallCount)

  // Create a test persistent area
  const testArea = {
    id: 'cleanup-test-area',
    type: 'persistent-area' as const,
    position: { x: 100, y: 100 },
    rotation: 0,
    layer: 0,
    isSpellEffect: true,
    roundCreated: 1,
    spellDuration: 1, // Expires after 1 round
    persistentAreaData: {
      position: { x: 100, y: 100 },
      radius: 40,
      color: '#ff0000',
      opacity: 0.5,
      spellName: 'Test Spell',
      roundCreated: 1
    }
  }

  mapStore.addSpellEffect(testArea)
  console.log('\n✅ Created test area that expires after 1 round')

  console.log('\n1️⃣ Calling nextRound()...')
  await roundStore.nextRound()
  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('\n📊 After nextRound:')
  console.log('  Current round:', roundStore.currentRound)
  console.log('  Cleanup calls:', cleanupCallCount)
  console.log('  Last cleanup round:', lastCleanupRound)

  const stillExists = mapStore.currentMap?.objects.some(obj => obj.id === 'cleanup-test-area')
  console.log('  Test area still exists:', stillExists ? '❌ YES' : '✅ NO')

  if (cleanupCallCount === 0) {
    console.log('\n❌ PROBLEM: cleanupExpiredSpells was NOT called!')
    console.log('The cleanup function is not being triggered on nextRound')
  } else if (stillExists) {
    console.log('\n❌ PROBLEM: Cleanup was called but didn\'t remove the area!')
    console.log('The cleanup logic itself has an issue')
  } else {
    console.log('\n✅ SUCCESS: Cleanup was called and worked correctly!')
  }

  console.log('\n2️⃣ Testing goToRound()...')
  cleanupCallCount = 0
  roundStore.goToRound(5)
  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('  Cleanup calls after goToRound:', cleanupCallCount)
  console.log('  Last cleanup round:', lastCleanupRound)

  console.log('\n3️⃣ Testing previousRound()...')
  cleanupCallCount = 0
  roundStore.previousRound()
  await new Promise(resolve => setTimeout(resolve, 100))

  console.log('  Cleanup calls after previousRound:', cleanupCallCount)
  console.log('  Last cleanup round:', lastCleanupRound)

  // Restore original
  mapStore.cleanupExpiredSpells = originalCleanup

  console.log('\n' + '='.repeat(50))
  console.log('VERIFICATION COMPLETE')

  // Cleanup
  mapStore.deleteObject('cleanup-test-area')
}

/**
 * Check if the store import is working
 */
export function checkStoreImport() {
  console.log('\n🔍 CHECKING STORE IMPORT\n')

  // Check if we can access mapStore from roundStore context
  const roundStore = useRoundStore.getState()

  console.log('Testing store access from roundStore.nextRound:')

  // Create a test that checks if mapStore is accessible
  try {
    // This simulates what happens in nextRound
    const mapStore = useMapStore.getState()
    console.log('  ✅ Can access useMapStore.getState()')

    if (typeof mapStore.cleanupExpiredSpells === 'function') {
      console.log('  ✅ cleanupExpiredSpells is a function')
    } else {
      console.log('  ❌ cleanupExpiredSpells is not a function!')
      console.log('     Type:', typeof mapStore.cleanupExpiredSpells)
    }

    // Check if we can call it
    try {
      mapStore.cleanupExpiredSpells(1)
      console.log('  ✅ Can call cleanupExpiredSpells')
    } catch (e) {
      console.log('  ❌ Error calling cleanupExpiredSpells:', e)
    }
  } catch (e) {
    console.log('  ❌ Cannot access useMapStore:', e)
  }
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).verifyCleanupCall = verifyCleanupCall
  (window as any).checkStoreImport = checkStoreImport
  (window as any).verifyCleanup = verifyCleanupCall
}
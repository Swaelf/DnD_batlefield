import useMapStore from '@/store/mapStore'
import useTimelineStore from '@/store/timelineStore'

/**
 * Run tests and diagnose the persistence issue
 */
export async function runAndDiagnose() {
  console.log('\n🔬 RUNNING DIAGNOSTIC TESTS\n')

  const mapStore = useMapStore.getState()
  const roundStore = useTimelineStore.getState()

  // Ensure clean state
  if (!mapStore.currentMap) {
    mapStore.createNewMap('Test Map')
  }

  // Clear existing areas
  const existing = mapStore.currentMap!.objects.filter(obj => obj.type === 'persistent-area')
  existing.forEach(obj => mapStore.deleteObject(obj.id))

  // Start combat
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }
  roundStore.goToEvent(1)

  console.log('📊 TEST 1: Direct Property Check')
  console.log('─'.repeat(40))

  // Test 1: Check if properties are preserved
  const testObj1 = {
    id: 'test-1',
    type: 'persistent-area' as const,
    position: { x: 100, y: 100 },
    rotation: 0,
    layer: 0,
    isSpellEffect: true,
    roundCreated: 1,
    spellDuration: 1,
    persistentAreaData: {
      position: { x: 100, y: 100 },
      radius: 40,
      color: '#ff0000',
      opacity: 0.5,
      spellName: 'Test Spell 1',
      roundCreated: 1
    }
  }

  console.log('Before addSpellEffect:')
  console.log('  isSpellEffect:', testObj1.isSpellEffect)
  console.log('  roundCreated:', testObj1.roundCreated)
  console.log('  spellDuration:', testObj1.spellDuration)

  mapStore.addSpellEffect(testObj1)

  // Get the object back from the store
  const storedObj1 = mapStore.currentMap?.objects.find(obj => obj.id === 'test-1')

  console.log('\nAfter addSpellEffect (from store):')
  console.log('  isSpellEffect:', storedObj1?.isSpellEffect)
  console.log('  roundCreated:', storedObj1?.roundCreated)
  console.log('  spellDuration:', storedObj1?.spellDuration)

  const propertiesPreserved =
    storedObj1?.isSpellEffect === true &&
    storedObj1?.roundCreated === 1 &&
    storedObj1?.spellDuration === 1

  console.log('\n✓ Properties preserved:', propertiesPreserved ? '✅ YES' : '❌ NO')

  console.log('\n📊 TEST 2: Cleanup Function Logic')
  console.log('─'.repeat(40))

  // Test 2: Check if cleanup logic works
  const currentEvent = roundStore.currentEvent
  console.log('Current round:', currentEvent)

  const shouldBeRemoved = (obj: any) => {
    if (!obj.isSpellEffect) {
      console.log(`  ${obj.id}: Not spell effect (isSpellEffect=${obj.isSpellEffect})`)
      return false
    }
    if (obj.spellDuration === undefined || obj.roundCreated === undefined) {
      console.log(`  ${obj.id}: Missing properties (duration=${obj.spellDuration}, created=${obj.roundCreated})`)
      return false
    }
    if (obj.spellDuration === 0) {
      console.log(`  ${obj.id}: Instant spell (duration=0)`)
      return false
    }

    const expiresAt = obj.roundCreated + obj.spellDuration
    const shouldRemove = currentEvent >= expiresAt
    console.log(`  ${obj.id}: Created=${obj.roundCreated}, Duration=${obj.spellDuration}, Expires=${expiresAt}, Current=${currentEvent}, Remove=${shouldRemove}`)
    return shouldRemove
  }

  console.log('\nChecking if test-1 should be removed at round', currentEvent)
  const shouldRemove1 = shouldBeRemoved(storedObj1)
  console.log('Should remove test-1:', shouldRemove1 ? 'YES' : 'NO')

  console.log('\n📊 TEST 3: Round Advancement')
  console.log('─'.repeat(40))

  // Test 3: Advance round and check cleanup
  console.log('Advancing to round 2...')
  await roundStore.nextEvent()
  await new Promise(resolve => setTimeout(resolve, 100))

  const round2 = roundStore.currentEvent
  console.log('Now at round:', round2)

  const stillExists = mapStore.currentMap?.objects.some(obj => obj.id === 'test-1')
  console.log('test-1 still exists:', stillExists ? '❌ YES (WRONG)' : '✅ NO (CORRECT)')

  if (stillExists) {
    console.log('\n⚠️ Object was not removed! Investigating...')

    const obj = mapStore.currentMap?.objects.find(obj => obj.id === 'test-1')
    console.log('Object still in store:', obj)

    // Try manual cleanup
    console.log('\nTrying manual cleanup...')
    mapStore.cleanupExpiredSpells(round2)

    const existsAfterManual = mapStore.currentMap?.objects.some(obj => obj.id === 'test-1')
    console.log('After manual cleanup:', existsAfterManual ? 'STILL EXISTS' : 'REMOVED')
  }

  console.log('\n📊 TEST 4: Multiple Spells')
  console.log('─'.repeat(40))

  // Reset to round 1
  roundStore.goToEvent(1)

  // Create multiple spells
  const spells = [
    { id: 'spell-1r', duration: 1, name: '1-round spell' },
    { id: 'spell-2r', duration: 2, name: '2-round spell' },
    { id: 'spell-3r', duration: 3, name: '3-round spell' }
  ]

  spells.forEach(spell => {
    const obj = {
      id: spell.id,
      type: 'persistent-area' as const,
      position: { x: 200, y: 200 },
      rotation: 0,
      layer: 0,
      isSpellEffect: true,
      roundCreated: 1,
      spellDuration: spell.duration,
      persistentAreaData: {
        position: { x: 200, y: 200 },
        radius: 30,
        color: '#0000ff',
        opacity: 0.3,
        spellName: spell.name,
        roundCreated: 1
      }
    }
    mapStore.addSpellEffect(obj)
  })

  console.log('Created 3 spells at round 1')

  // Test each round
  for (let round = 2; round <= 4; round++) {
    await roundStore.nextEvent()
    await new Promise(resolve => setTimeout(resolve, 100))

    console.log(`\nRound ${round}:`)
    spells.forEach(spell => {
      const exists = mapStore.currentMap?.objects.some(obj => obj.id === spell.id)
      const shouldExist = round < (1 + spell.duration)
      const status = exists === shouldExist ? '✅' : '❌'
      console.log(`  ${status} ${spell.name}: ${exists ? 'exists' : 'removed'} (expected: ${shouldExist ? 'exists' : 'removed'})`)
    })
  }

  console.log('\n📊 TEST 5: Checking Cleanup Hook')
  console.log('─'.repeat(40))

  // Check if cleanup is being called
  const originalCleanup = mapStore.cleanupExpiredSpells
  let cleanupCalled = false

  // Temporarily override cleanup to detect calls
  mapStore.cleanupExpiredSpells = (round: number) => {
    cleanupCalled = true
    console.log('✓ cleanupExpiredSpells called with round:', round)
    originalCleanup.call(mapStore, round)
  }

  console.log('Testing if cleanup is called on nextRound...')
  await roundStore.nextEvent()

  if (cleanupCalled) {
    console.log('✅ Cleanup IS being called')
  } else {
    console.log('❌ Cleanup is NOT being called!')
  }

  // Restore original
  mapStore.cleanupExpiredSpells = originalCleanup

  console.log('\n' + '='.repeat(60))
  console.log('📋 DIAGNOSIS COMPLETE')
  console.log('='.repeat(60))

  // Summary
  const issues = []

  if (!propertiesPreserved) {
    issues.push('Properties not preserved by addSpellEffect')
  }

  if (stillExists) {
    issues.push('Spells not being removed after expiration')
  }

  if (!cleanupCalled) {
    issues.push('Cleanup function not being called on round advance')
  }

  if (issues.length > 0) {
    console.log('\n🔴 Issues found:')
    issues.forEach(issue => console.log(`  - ${issue}`))
  } else {
    console.log('\n✅ All tests passed - persistence should be working!')
  }

  // Cleanup
  const allTestObjects = mapStore.currentMap?.objects.filter(obj =>
    obj.id.startsWith('test-') || obj.id.startsWith('spell-')
  ) || []
  allTestObjects.forEach(obj => mapStore.deleteObject(obj.id))
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).runAndDiagnose = runAndDiagnose
  (window as any).diagnose = runAndDiagnose
}
import useMapStore from '@/store/mapStore'
import useRoundStore from '@/store/roundStore'

/**
 * Detailed debug for spell persistence cleanup issue
 */
export function detailedDebugCleanup() {
  console.log('🔍 DETAILED CLEANUP DEBUG')
  console.log('=' .repeat(60))

  const mapStore = useMapStore.getState()
  const roundStore = useRoundStore.getState()

  console.log('\n📅 Round Info:')
  console.log('  Current Round:', roundStore.currentRound)
  console.log('  Is In Combat:', roundStore.isInCombat)

  const allObjects = mapStore.currentMap?.objects || []
  const persistentAreas = allObjects.filter(obj => obj.type === 'persistent-area')
  const spellObjects = allObjects.filter(obj => obj.type === 'spell')

  console.log('\n📦 Object Counts:')
  console.log('  Total Objects:', allObjects.length)
  console.log('  Persistent Areas:', persistentAreas.length)
  console.log('  Spell Objects:', spellObjects.length)

  console.log('\n🎯 Persistent Area Details:')
  persistentAreas.forEach((area, index) => {
    console.log(`\n  [${index + 1}] ${area.persistentAreaData?.spellName || 'Unknown'}`)
    console.log('  ────────────────────────')
    console.log('  ID:', area.id)
    console.log('  Position:', area.position)
    console.log('  Layer:', area.layer)

    // Critical properties for cleanup
    console.log('\n  🔑 Cleanup Properties:')
    console.log('    isSpellEffect:', area.isSpellEffect, area.isSpellEffect === true ? '✅' : '❌ MISSING!')
    console.log('    roundCreated:', area.roundCreated, area.roundCreated !== undefined ? '✅' : '❌ MISSING!')
    console.log('    spellDuration:', area.spellDuration, area.spellDuration !== undefined ? '✅' : '❌ MISSING!')

    // Calculate expiration
    if (area.roundCreated !== undefined && area.spellDuration !== undefined) {
      const expiresAt = area.roundCreated + area.spellDuration
      const roundsRemaining = expiresAt - roundStore.currentRound
      const shouldBeRemoved = roundStore.currentRound >= expiresAt

      console.log('\n  ⏰ Timing:')
      console.log('    Created at round:', area.roundCreated)
      console.log('    Duration:', area.spellDuration, 'rounds')
      console.log('    Expires at round:', expiresAt)
      console.log('    Rounds remaining:', roundsRemaining)
      console.log('    Should be removed:', shouldBeRemoved ? '🔴 YES' : '🟢 NO')
    }

    console.log('\n  📊 Full Object:')
    console.log('    ', JSON.stringify(area, null, 2).split('\n').join('\n    '))
  })

  console.log('\n\n🧹 TESTING CLEANUP FUNCTION')
  console.log('─'.repeat(40))

  // Create a test filter that mimics the cleanup function
  const testFilter = (obj: any) => {
    // If not a spell effect, keep it
    if (!obj.isSpellEffect) {
      console.log(`  ⚪ ${obj.id}: Not a spell effect, keeping`)
      return true
    }

    // If missing duration or round created, keep it
    if (obj.spellDuration === undefined || obj.roundCreated === undefined) {
      console.log(`  ⚪ ${obj.id}: Missing duration/roundCreated, keeping`)
      return true
    }

    // Don't remove instant spells (duration 0)
    if (obj.spellDuration === 0) {
      console.log(`  ⚪ ${obj.id}: Instant spell (duration 0), keeping`)
      return true
    }

    // Calculate if it should be removed
    const expiresAt = obj.roundCreated + obj.spellDuration
    const shouldKeep = roundStore.currentRound < expiresAt

    if (shouldKeep) {
      console.log(`  🟢 ${obj.id}: Expires at round ${expiresAt}, current is ${roundStore.currentRound}, keeping`)
    } else {
      console.log(`  🔴 ${obj.id}: Expired at round ${expiresAt}, current is ${roundStore.currentRound}, REMOVING`)
    }

    return shouldKeep
  }

  console.log('\nSimulating cleanup filter on persistent areas:')
  const wouldKeep = persistentAreas.filter(testFilter)
  const wouldRemove = persistentAreas.filter(obj => !testFilter(obj))

  console.log('\n📈 Simulation Results:')
  console.log('  Would keep:', wouldKeep.length)
  console.log('  Would remove:', wouldRemove.length)

  if (wouldRemove.length > 0) {
    console.log('\n  Areas that SHOULD be removed:')
    wouldRemove.forEach(area => {
      console.log(`    - ${area.persistentAreaData?.spellName} (${area.id})`)
    })
  }

  console.log('\n\n🔧 ACTUALLY CALLING CLEANUP')
  console.log('─'.repeat(40))
  console.log('Before cleanup - persistent areas:', persistentAreas.length)

  // Call the actual cleanup
  mapStore.cleanupExpiredSpells(roundStore.currentRound)

  // Check after cleanup
  const areasAfterCleanup = mapStore.currentMap?.objects.filter(obj => obj.type === 'persistent-area') || []
  console.log('After cleanup - persistent areas:', areasAfterCleanup.length)
  console.log('Areas removed:', persistentAreas.length - areasAfterCleanup.length)

  if (areasAfterCleanup.length === persistentAreas.length) {
    console.log('\n❌ NO AREAS WERE REMOVED!')

    // Debug why
    console.log('\nChecking why areas weren\'t removed:')
    persistentAreas.forEach(area => {
      const problems = []
      if (!area.isSpellEffect) problems.push('Missing isSpellEffect')
      if (area.roundCreated === undefined) problems.push('Missing roundCreated')
      if (area.spellDuration === undefined) problems.push('Missing spellDuration')

      if (problems.length > 0) {
        console.log(`  ${area.persistentAreaData?.spellName}: ${problems.join(', ')}`)
      }
    })
  } else {
    console.log('\n✅ Cleanup worked! Removed', persistentAreas.length - areasAfterCleanup.length, 'areas')
  }

  console.log('\n' + '='.repeat(60))
}

/**
 * Test creating and cleaning up a spell area
 */
export function testCreateAndCleanup() {
  console.log('\n🧪 TEST CREATE AND CLEANUP')
  console.log('─'.repeat(40))

  const mapStore = useMapStore.getState()
  const roundStore = useRoundStore.getState()

  // Ensure combat is started
  if (!roundStore.isInCombat) {
    roundStore.startCombat(mapStore.currentMap!.id)
  }

  const testId = `test-area-${Date.now()}`
  const currentRound = roundStore.currentRound

  console.log('Creating test area at round', currentRound)

  // Create test persistent area with ALL required properties
  const testArea = {
    id: testId,
    type: 'persistent-area' as const,
    position: { x: 100, y: 100 },
    rotation: 0,
    layer: 0,

    // CRITICAL PROPERTIES FOR CLEANUP
    isSpellEffect: true,
    roundCreated: currentRound,
    spellDuration: 1, // Should expire after 1 round

    persistentAreaData: {
      position: { x: 100, y: 100 },
      radius: 50,
      color: '#ff0000',
      opacity: 0.5,
      spellName: 'Test Spell',
      roundCreated: currentRound
    }
  }

  console.log('Test area properties:')
  console.log('  isSpellEffect:', testArea.isSpellEffect)
  console.log('  roundCreated:', testArea.roundCreated)
  console.log('  spellDuration:', testArea.spellDuration)

  // Add to map
  mapStore.addSpellEffect(testArea)

  // Verify it exists
  const exists = mapStore.currentMap?.objects.some(obj => obj.id === testId)
  console.log('Area exists after creation:', exists)

  if (!exists) {
    console.log('❌ Failed to create test area!')
    return
  }

  // Advance round
  console.log('\nAdvancing to next round...')
  roundStore.nextRound()

  // Wait a bit for async operations
  setTimeout(() => {
    const newRound = roundStore.currentRound
    console.log('Now at round', newRound)

    // Check if it still exists
    const stillExists = mapStore.currentMap?.objects.some(obj => obj.id === testId)
    console.log('Area exists after round advance:', stillExists)

    if (stillExists) {
      console.log('❌ Area was not automatically cleaned up!')

      // Try manual cleanup
      console.log('Trying manual cleanup...')
      mapStore.cleanupExpiredSpells(newRound)

      const existsAfterManualCleanup = mapStore.currentMap?.objects.some(obj => obj.id === testId)
      console.log('Area exists after manual cleanup:', existsAfterManualCleanup)

      if (!existsAfterManualCleanup) {
        console.log('✅ Manual cleanup worked!')
      } else {
        console.log('❌ Even manual cleanup failed!')

        // Get the actual object and debug it
        const actualObject = mapStore.currentMap?.objects.find(obj => obj.id === testId)
        console.log('Actual object in store:', actualObject)
      }
    } else {
      console.log('✅ Area was correctly cleaned up automatically!')
    }

    // Clean up if still there
    mapStore.deleteObject(testId)
  }, 200)
}

// Make available in console
if (typeof window !== 'undefined') {
  (window as any).detailedDebugCleanup = detailedDebugCleanup
  (window as any).testCreateAndCleanup = testCreateAndCleanup
}